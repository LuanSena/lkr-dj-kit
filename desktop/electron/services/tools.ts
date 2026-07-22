import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import ffmpegStatic from "ffmpeg-static";
import { getYtDlpPath, getYtDlpVersion, isYtDlpInstalled } from "./ytdlp";

export function getFfmpegPath(): string {
  if (app.isPackaged) {
    const base = path.join(process.resourcesPath, "ffmpeg-static");
    const winPath = path.join(base, "ffmpeg.exe");
    const unixPath = path.join(base, "ffmpeg");
    if (process.platform === "win32" && fs.existsSync(winPath)) {
      return winPath;
    }
    if (fs.existsSync(unixPath)) {
      return unixPath;
    }
    return process.platform === "win32" ? winPath : unixPath;
  }

  if (!ffmpegStatic) {
    throw new Error("ffmpeg binary not found");
  }

  return ffmpegStatic;
}

export async function checkTools() {
  const ffmpegPath = getFfmpegPath();
  const ffmpegOk = fs.existsSync(ffmpegPath);

  let ytdlpOk = isYtDlpInstalled();
  let ytdlpVersion = "";

  if (ytdlpOk) {
    try {
      ytdlpVersion = await getYtDlpVersion();
    } catch {
      ytdlpOk = false;
    }
  }

  return {
    ffmpeg: ffmpegOk,
    ffmpegPath,
    ytdlp: ytdlpOk,
    ytdlpVersion,
    ytdlpPath: getYtDlpPath(),
  };
}

export { getYtDlpPath, runYtDlp, getVideoInfo } from "./ytdlp";
