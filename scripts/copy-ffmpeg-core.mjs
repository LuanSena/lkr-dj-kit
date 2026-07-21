import { copyFileSync, cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreSourceDir = join(root, "node_modules", "@ffmpeg", "core", "dist", "esm");
const workerSourceDir = join(root, "node_modules", "@ffmpeg", "ffmpeg", "dist", "esm");
const targetDir = join(root, "public", "ffmpeg");
const workerTargetDir = join(targetDir, "worker");

mkdirSync(targetDir, { recursive: true });
mkdirSync(workerTargetDir, { recursive: true });

for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  copyFileSync(join(coreSourceDir, file), join(targetDir, file));
}

cpSync(workerSourceDir, workerTargetDir, { recursive: true });

console.log("FFmpeg assets copied to public/ffmpeg");
