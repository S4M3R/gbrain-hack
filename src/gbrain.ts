import { execFile } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execFileAsync = promisify(execFile);

const BRAIN_DIR = process.env.BRAIN_DIR || path.join(os.homedir(), "brain");
const EXPERIENCES_DIR = path.join(BRAIN_DIR, "experiences");
const GBRAIN_BIN = process.env.GBRAIN_BIN || path.join(os.homedir(), ".bun", "bin", "gbrain");

export interface MediaItem {
  type: "photo" | "video";
  filename?: string; // legacy local path
  url?: string;      // Vercel Blob URL
}

export interface Experience {
  slug: string;
  author: string;
  date: string;
  location: string;
  lat?: number;
  lng?: number;
  tags: string[];
  media: MediaItem[];
  title: string;
  body: string;
  prompt?: string;
}

export interface SearchChunk {
  slug: string;
  path: string;
  chunk: string;
  score: number;
}

export function ensureExperiencesDir() {
  fs.mkdirSync(EXPERIENCES_DIR, { recursive: true });
  fs.mkdirSync(path.join(EXPERIENCES_DIR, "media"), { recursive: true });
}

export function writeExperience(exp: Experience): string {
  ensureExperiencesDir();
  const slug = exp.slug || slugify(exp.title);
  const filename = `${exp.date}-${slug}.md`;
  const filepath = path.join(EXPERIENCES_DIR, filename);

  const mediaYaml = exp.media
    .map((m) => {
      const line = `  - type: ${m.type}`;
      if (m.url) return `${line}\n    url: ${m.url}`;
      if (m.filename) return `${line}\n    filename: ${m.filename}`;
      return line;
    })
    .join("\n");

  const content = `---
type: experience
author: ${exp.author}
date: ${exp.date}
location: ${exp.location || "Unknown"}${exp.lat ? `\nlat: ${exp.lat}` : ""}${exp.lng ? `\nlng: ${exp.lng}` : ""}
tags: [${exp.tags.join(", ")}]
${exp.prompt ? `prompt: ${exp.prompt.replace(/\n/g, " ")}` : ""}
${exp.media.length > 0 ? `media:\n${mediaYaml}` : "media: []"}
---

# ${exp.title}

${exp.body}
`;

  fs.writeFileSync(filepath, content);
  return filepath;
}

export async function importAndEmbed(filepath: string): Promise<void> {
  const env = {
    ...process.env,
    PATH: `${path.join(os.homedir(), ".bun", "bin")}:${process.env.PATH}`,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  };
  try {
    await execFileAsync(GBRAIN_BIN, ["import", BRAIN_DIR, "--no-embed"], {
      timeout: 30000,
      env,
    });
    await execFileAsync(GBRAIN_BIN, ["embed", "--stale"], {
      timeout: 30000,
      env,
    });
  } catch (e) {
    console.error("gbrain import/embed error (non-fatal):", e);
  }
}

async function runGbrainSearch(query: string, env: NodeJS.ProcessEnv): Promise<SearchChunk[]> {
  const { stdout, stderr } = await execFileAsync(
    GBRAIN_BIN,
    ["search", query, "--limit", "10"],
    { timeout: 15000, env }
  );
  const cleanText = (stdout + stderr)
    .split("\n")
    .filter((l) => !l.startsWith("[ai.gateway]") && !l.startsWith("[embed"))
    .join("\n");
  const blocks = cleanText.split(/(?=\[[\d.]+\]\s+\S+\s+--)/);
  return blocks
    .map((block) => {
      const m = block.match(/^\[([\d.]+)\]\s+([^\s]+)\s+--\s+([\s\S]*)/);
      if (!m) return null;
      return {
        slug: m[2],
        path: m[2],
        chunk: m[3].trim().slice(0, 1000),
        score: parseFloat(m[1]),
      };
    })
    .filter(Boolean) as SearchChunk[];
}

export async function searchExperiences(query: string): Promise<SearchChunk[]> {
  const env = {
    ...process.env,
    PATH: `${path.join(os.homedir(), ".bun", "bin")}:${process.env.PATH}`,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  };
  try {
    const results = await runGbrainSearch(query, env);
    if (results.length > 0) return results;

    // Fallback: try each word individually and merge, deduped by slug
    const words = query.split(/\s+/).filter((w) => w.length > 2);
    if (words.length <= 1) return results;

    const seen = new Set<string>();
    const merged: SearchChunk[] = [];
    await Promise.all(
      words.map((word) =>
        runGbrainSearch(word, env).catch(() => [] as SearchChunk[])
      )
    ).then((all) => {
      for (const batch of all) {
        for (const r of batch) {
          if (!seen.has(r.slug)) {
            seen.add(r.slug);
            merged.push(r);
          }
        }
      }
    });

    return merged.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (e) {
    console.error("gbrain search error:", e);
    return [];
  }
}

export function listExperiences(): Experience[] {
  ensureExperiencesDir();
  const files = fs
    .readdirSync(EXPERIENCES_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("README"));

  return files
    .map((f) => {
      try {
        const content = fs.readFileSync(path.join(EXPERIENCES_DIR, f), "utf-8");
        return parseExperiencePage(f, content);
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Experience[];
}

function parseExperiencePage(filename: string, content: string): Experience {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) throw new Error("Invalid frontmatter");

  const fm = fmMatch[1];
  const body = fmMatch[2].trim();

  const get = (key: string) => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : "";
  };

  const tagsMatch = fm.match(/^tags:\s*\[(.+)\]$/m);
  const tags = tagsMatch ? tagsMatch[1].split(",").map((t) => t.trim()) : [];

  // Support both url (Vercel Blob) and legacy filename
  const media: MediaItem[] = [];
  const urlBlocks = [...fm.matchAll(/- type: (\w+)\n\s+url: (.+)/g)];
  const fnBlocks  = [...fm.matchAll(/- type: (\w+)\n\s+filename: (.+)/g)];
  if (urlBlocks.length) {
    urlBlocks.forEach((m) => media.push({ type: m[1] as "photo" | "video", url: m[2].trim() }));
  } else {
    fnBlocks.forEach((m) => media.push({ type: m[1] as "photo" | "video", filename: m[2].trim() }));
  }

  const titleMatch = body.match(/^#\s+(.+)$/m);

  return {
    slug: filename.replace(".md", ""),
    author: get("author"),
    date: get("date"),
    location: get("location"),
    lat: parseFloat(get("lat")) || undefined,
    lng: parseFloat(get("lng")) || undefined,
    tags,
    media,
    title: titleMatch ? titleMatch[1] : filename,
    body: body.replace(/^#\s+.+\n/, "").trim(),
    prompt: get("prompt") || undefined,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
