import { put } from "@vercel/blob";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export function validateMedia(file: File): string | null {
  if (file.size > MAX_BYTES) return "File too large (max 50 MB)";
  if (!ALLOWED_TYPES[file.type]) return `Unsupported type: ${file.type}`;
  return null;
}

export async function uploadMedia(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (!BLOB_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN not configured");
  const { url } = await put(`lore/${filename}`, buffer, {
    access: "public",
    contentType,
    token: BLOB_TOKEN,
  });
  return url;
}
