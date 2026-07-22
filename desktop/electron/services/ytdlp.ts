import { app } from "electron";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function getBinaryName() {
  return process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
}

function getDevBinaryPath() {
  return path.join(process.cwd(), "bin", getBinaryName());
}

function getPackagedBinaryPath() {
  // extraResources are copied into the app's resources folder.
  return path.join(process.resourcesPath, "bin", getBinaryName());
}

function getUserBinaryPath() {
  return path.join(app.getPath("userData"), "bin", getBinaryName());
}

export function getYtDlpPath(): string {
  if (app.isPackaged) {
    const packagedPath = getPackagedBinaryPath();
    if (fs.existsSync(packagedPath)) {
      return packagedPath;
    }
  } else {
    const devPath = getDevBinaryPath();
    if (fs.existsSync(devPath)) {
      return devPath;
    }
  }

  const userPath = getUserBinaryPath();
  if (fs.existsSync(userPath)) {
    return userPath;
  }

  return app.isPackaged ? getPackagedBinaryPath() : getDevBinaryPath();
}

export function isYtDlpInstalled(): boolean {
  return fs.existsSync(getYtDlpPath());
}

export function getYtDlpDownloadUrl() {
  switch (process.platform) {
    case "darwin":
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
    case "win32":
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
    default:
      return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
  }
}

export async function getYtDlpVersion(): Promise<string> {
  const output = await runYtDlp(["--version"]);
  return output.trim();
}

export function runYtDlp(
  args: string[],
  onStderrLine?: (line: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const binary = getYtDlpPath();
    if (!fs.existsSync(binary)) {
      reject(new Error("yt-dlp não encontrado. Rode npm install novamente."));
      return;
    }

    const child = spawn(binary, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      if (onStderrLine) {
        for (const line of text.split("\n")) {
          if (line.trim()) onStderrLine(line);
        }
      }
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }
      reject(new Error(stderr.trim() || stdout.trim() || `yt-dlp exited with code ${code}`));
    });
  });
}

export async function getVideoInfo(url: string): Promise<{ title?: string }> {
  const output = await runYtDlp([
    "--dump-single-json",
    "--no-playlist",
    "--skip-download",
    url,
  ]);

  try {
    return JSON.parse(output) as { title?: string };
  } catch {
    return {};
  }
}
