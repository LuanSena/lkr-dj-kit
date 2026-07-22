import { chmodSync, createWriteStream, existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const binDir = path.join(root, "bin");

function getBinaryName() {
  return process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
}

function getDownloadUrl() {
  switch (process.platform) {
    case "darwin":
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
    case "win32":
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
    default:
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
  }
}

async function downloadBinary(targetPath) {
  const url = getDownloadUrl();
  console.log(`Downloading yt-dlp from ${url}`);

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download yt-dlp (${response.status})`);
  }

  mkdirSync(path.dirname(targetPath), { recursive: true });
  const file = createWriteStream(targetPath);
  await pipeline(Readable.fromWeb(response.body), file);

  if (process.platform !== "win32") {
    chmodSync(targetPath, 0o755);
  }
}

function verifyBinary(binaryPath) {
  const result = spawnSync(binaryPath, ["--version"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || "yt-dlp binary verification failed");
  }
  console.log(`yt-dlp ${result.stdout.trim()} ready at ${binaryPath}`);
}

async function main() {
  const binaryPath = path.join(binDir, getBinaryName());

  if (existsSync(binaryPath)) {
    try {
      verifyBinary(binaryPath);
      return;
    } catch {
      console.warn("Existing yt-dlp binary invalid, re-downloading...");
    }
  }

  await downloadBinary(binaryPath);
  verifyBinary(binaryPath);
}

main().catch((error) => {
  console.error("\nCould not install yt-dlp binary.");
  console.error(error instanceof Error ? error.message : error);
  console.error("\nInstall manually:");
  console.error("  brew install yt-dlp");
  console.error("  or download from https://github.com/yt-dlp/yt-dlp/releases");
  process.exit(1);
});
