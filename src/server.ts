import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import {
  writeExperience,
  importAndEmbed,
  searchExperiences,
  listExperiences,
  ensureExperiencesDir,
} from "./gbrain";
import { rerank } from "./zeroentropy";
import { synthesize, generateFromPrompt } from "./openai";
import { uploadMedia, validateMedia } from "./blob";

const PORT = parseInt(process.env.PORT || "3456");
const PUBLIC_DIR = path.join(import.meta.dir, "..", "public");
const EXPERIENCES_DIR = path.join(process.env.BRAIN_DIR || path.join(os.homedir(), "brain"), "experiences");
const LIKES_FILE = path.join(EXPERIENCES_DIR, "likes.json");
ensureExperiencesDir();

// ── Likes persistence ─────────────────────────────────────────────────────────
function readLikes(): Record<string, number> {
  try { return JSON.parse(fs.readFileSync(LIKES_FILE, "utf-8")); } catch { return {}; }
}
function writeLikes(likes: Record<string, number>) {
  fs.writeFileSync(LIKES_FILE, JSON.stringify(likes));
}

// ── CORS headers ──────────────────────────────────────────────────────────────
const cors = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ── Rate limiting (in-memory per IP, resets every 60s) ───────────────────────
const rateBuckets = new Map<string, { n: number; resetAt: number }>();
function rateLimit(ip: string, limit = 30): boolean {
  const now = Date.now();
  let b = rateBuckets.get(ip);
  if (!b || now > b.resetAt) {
    b = { n: 0, resetAt: now + 60_000 };
    rateBuckets.set(ip, b);
  }
  if (b.n >= limit) return false;
  b.n++;
  return true;
}
// Prune stale buckets every 5 min
setInterval(() => {
  const now = Date.now();
  rateBuckets.forEach((v, k) => { if (now > v.resetAt) rateBuckets.delete(k); });
}, 300_000);

// ── Legacy local media (backward compat) ─────────────────────────────────────
const MEDIA_DIR = path.join(os.homedir(), "brain", "experiences", "media");

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  // ── Legacy local media serving ────────────────────────────────────────────
  if (url.pathname.startsWith("/media/")) {
    const filename = path.basename(url.pathname.slice("/media/".length));
    const filepath = path.resolve(MEDIA_DIR, filename);
    // Guard path traversal
    if (!filepath.startsWith(MEDIA_DIR + path.sep) && filepath !== MEDIA_DIR) {
      return new Response("Not found", { status: 404 });
    }
    if (!fs.existsSync(filepath)) return new Response("Not found", { status: 404 });
    const ext = path.extname(filename).toLowerCase();
    const mimes: Record<string, string> = {
      ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
      ".gif": "image/gif", ".webp": "image/webp", ".mp4": "video/mp4",
      ".webm": "video/webm", ".mov": "video/quicktime",
    };
    const mime = mimes[ext];
    if (!mime) return new Response("Not found", { status: 404 });
    return new Response(fs.readFileSync(filepath), {
      headers: { ...cors, "Content-Type": mime },
    });
  }

  // ── Rate limit all API routes ─────────────────────────────────────────────
  if (url.pathname.startsWith("/api/")) {
    if (!rateLimit(ip)) {
      return Response.json({ error: "Too many requests" }, { status: 429, headers: cors });
    }
  }

  // ── List experiences (sorted by likes desc, then date desc) ─────────────────
  if (url.pathname === "/api/experiences" && req.method === "GET") {
    const likes = readLikes();
    const exps = listExperiences().sort((a, b) => {
      const ld = (likes[b.slug] || 0) - (likes[a.slug] || 0);
      return ld !== 0 ? ld : b.date.localeCompare(a.date);
    });
    return Response.json(exps.map(e => ({ ...e, likes: likes[e.slug] || 0 })), { headers: cors });
  }

  // ── Get all like counts ───────────────────────────────────────────────────
  if (url.pathname === "/api/likes" && req.method === "GET") {
    return Response.json(readLikes(), { headers: cors });
  }

  // ── Toggle like ───────────────────────────────────────────────────────────
  if (url.pathname === "/api/like" && req.method === "POST") {
    const { slug, liked } = await req.json() as { slug: string; liked: boolean };
    if (!slug) return Response.json({ error: "slug required" }, { status: 400, headers: cors });
    const likes = readLikes();
    likes[slug] = Math.max(0, (likes[slug] || 0) + (liked ? 1 : -1));
    writeLikes(likes);
    return Response.json({ slug, likes: likes[slug] }, { headers: cors });
  }

  // ── Capture (save experience) ─────────────────────────────────────────────
  if (url.pathname === "/api/capture" && req.method === "POST") {
    const formData = await req.formData();
    const author = (formData.get("author") as string) || "you";
    const title = (formData.get("title") as string) || "Untitled";
    const body = (formData.get("body") as string) || "";
    const location = (formData.get("location") as string) || "";
    const lat = parseFloat(formData.get("lat") as string) || undefined;
    const lng = parseFloat(formData.get("lng") as string) || undefined;
    const tagsRaw = (formData.get("tags") as string) || "";
    const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const date = new Date().toISOString().split("T")[0];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
    const media: Array<{ type: "photo" | "video"; url?: string; filename?: string }> = [];

    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      const err = validateMedia(photoFile);
      if (err) return Response.json({ error: err }, { status: 415, headers: cors });
      const ext = (photoFile.name || "photo.jpg").split(".").pop() || "jpg";
      const filename = `${slug}-photo.${ext}`;
      try {
        const blobUrl = await uploadMedia(
          Buffer.from(await photoFile.arrayBuffer()),
          filename,
          photoFile.type || "image/jpeg"
        );
        media.push({ type: "photo", url: blobUrl });
      } catch (e) {
        console.error("Blob upload failed:", e);
        return Response.json({ error: "Media upload failed" }, { status: 500, headers: cors });
      }
    }

    const videoFile = formData.get("video") as File | null;
    if (videoFile && videoFile.size > 0) {
      const err = validateMedia(videoFile);
      if (err) return Response.json({ error: err }, { status: 415, headers: cors });
      const ext = (videoFile.name || "video.webm").split(".").pop() || "webm";
      const filename = `${slug}-video.${ext}`;
      try {
        const blobUrl = await uploadMedia(
          Buffer.from(await videoFile.arrayBuffer()),
          filename,
          videoFile.type || "video/webm"
        );
        media.push({ type: "video", url: blobUrl });
      } catch (e) {
        console.error("Blob upload failed:", e);
        return Response.json({ error: "Media upload failed" }, { status: 500, headers: cors });
      }
    }

    const filepath = writeExperience({ slug, author, date, location, lat, lng, tags, media, title, body });
    importAndEmbed(filepath).catch(console.error);
    return Response.json({ ok: true, slug }, { headers: cors });
  }

  // ── AI: generate title + body from prompt ─────────────────────────────────
  if (url.pathname === "/api/generate" && req.method === "POST") {
    const { prompt } = await req.json() as { prompt: string };
    if (!prompt?.trim()) return Response.json({ error: "prompt required" }, { status: 400, headers: cors });
    const generated = await generateFromPrompt(prompt);
    return Response.json(generated, { headers: cors });
  }

  // ── Query: search + rerank + synthesize ───────────────────────────────────
  if (url.pathname === "/api/query" && req.method === "GET") {
    const query = url.searchParams.get("q") || "";
    if (!query.trim()) return Response.json({ error: "q required" }, { status: 400, headers: cors });

    const chunks = await searchExperiences(query);
    let topChunks = chunks;

    if (chunks.length > 1) {
      const reranked = await rerank(query, chunks.map((c) => c.chunk));
      topChunks = reranked.slice(0, 6).map((r) => chunks[r.index]).filter(Boolean);
    }

    const allExps = listExperiences();
    const enriched = topChunks.map((chunk) => {
      const exp = allExps.find((e) => chunk.path?.includes(e.slug) || chunk.slug === e.slug);
      return { chunk: chunk.chunk, score: chunk.score, experience: exp || null };
    });

    const synthesisTexts = enriched.map((r) =>
      r.experience
        ? `From ${r.experience.author} — ${r.experience.title}:\n${r.experience.body.slice(0, 500)}`
        : r.chunk
    );
    const synthesis = await synthesize(query, synthesisTexts);

    return Response.json({ query, synthesis, results: enriched, powered_by: "ZeroEntropy zerank-2 + OpenAI" }, { headers: cors });
  }

  // ── Serve app ─────────────────────────────────────────────────────────────
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf-8");
    return new Response(html, { headers: { ...cors, "Content-Type": "text/html" } });
  }

  return new Response("Not found", { status: 404 });
}

Bun.serve({ port: PORT, hostname: "127.0.0.1", fetch: handleRequest });
console.log(`Lore → http://localhost:${PORT}`);
