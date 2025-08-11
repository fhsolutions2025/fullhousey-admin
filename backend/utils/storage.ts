/* backend/utils/storage.ts */
import fs from "fs/promises";
import path from "path";
import type { UploadedFile } from "express-fileupload";
import { randomUUID } from "crypto";

export async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

export async function saveUploadTemp(file: UploadedFile): Promise<string> {
  const id = randomUUID();
  const dir = path.join(process.cwd(), "tmp", id);
  await ensureDir(dir);
  const dst = path.join(dir, file.name || "audio.webm");
  await fs.copyFile(file.tempFilePath, dst);
  return dst;
}
