import { put } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";
if (!BLOB_TOKEN) { console.error("BLOB_READ_WRITE_TOKEN not set"); process.exit(1); }

const EXPERIENCES_DIR = path.join(os.homedir(), "brain", "experiences");
const MEDIA_DIR = path.join(EXPERIENCES_DIR, "media");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
};

async function uploadFile(filename: string): Promise<string> {
  const filepath = path.join(MEDIA_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(filepath);
  const { url } = await put(`lore/${filename}`, buffer, {
    access: "public",
    contentType,
    token: BLOB_TOKEN,
  });
  return url;
}

const mdFiles = fs.readdirSync(EXPERIENCES_DIR).filter(f => f.endsWith(".md"));

for (const mdFile of mdFiles) {
  const mdPath = path.join(EXPERIENCES_DIR, mdFile);
  let content = fs.readFileSync(mdPath, "utf-8");

  const filenameMatches = [...content.matchAll(/- type: (\w+)\n\s+filename: (.+)/g)];
  if (filenameMatches.length === 0) continue;

  console.log(`Processing ${mdFile}...`);
  let updated = content;

  for (const m of filenameMatches) {
    const mediaType = m[1];
    const filename = m[2].trim();
    const localPath = path.join(MEDIA_DIR, filename);

    if (!fs.existsSync(localPath)) {
      console.log(`  Skipping ${filename} — file not found`);
      continue;
    }

    console.log(`  Uploading ${filename}...`);
    try {
      const blobUrl = await uploadFile(filename);
      console.log(`  → ${blobUrl}`);
      updated = updated.replace(
        `- type: ${mediaType}\n    filename: ${filename}`,
        `- type: ${mediaType}\n    url: ${blobUrl}`
      );
    } catch (e) {
      console.error(`  Upload failed:`, e);
    }
  }

  if (updated !== content) {
    fs.writeFileSync(mdPath, updated);
    console.log(`  Saved ${mdFile}`);
  }
}

console.log("Migration complete.");
