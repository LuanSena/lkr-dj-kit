import fs from "node:fs";
import path from "node:path";
import { getFfmpegPath, getVideoInfo, runYtDlp } from "./tools";
import { sanitizeFilename } from "./settings";

type ProgressCallback = (payload: { progress: number; status: string }) => void;

const PROGRESS_RE = /\[download\]\s+(\d+(?:\.\d+)?)%/;
const EXTRACT_RE = /\[ExtractAudio\]|Destination:/i;

function parseProgress(line: string): number | null {
  const match = line.match(PROGRESS_RE);
  if (!match) return null;
  return Math.min(99, Math.round(Number(match[1])));
}

function detectPlatform(url: string): "youtube" | "soundcloud" | "spotify" | "unknown" {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("soundcloud.com")) return "soundcloud";
  if (lower.includes("spotify.com") || lower.includes("spotify:")) return "spotify";
  return "unknown";
}

export async function downloadMedia(
  url: string,
  format: "mp3" | "wav",
  outputFolder: string,
  onProgress: ProgressCallback
) {
  fs.mkdirSync(outputFolder, { recursive: true });

  const platform = detectPlatform(url);
  if (platform === "unknown") {
    throw new Error("URL não suportada. Use YouTube, SoundCloud ou Spotify.");
  }

  onProgress({ progress: 5, status: "preparing" });

  const outputTemplate = path.join(outputFolder, "%(title)s.%(ext)s");
  const ffmpegPath = getFfmpegPath();
  const ffmpegDir = path.dirname(ffmpegPath);

  const args = [
    "--no-playlist",
    "--no-warnings",
    "--ffmpeg-location",
    ffmpegDir,
    "--newline",
    "-o",
    outputTemplate,
    "-x",
    "--audio-format",
    format === "wav" ? "wav" : "mp3",
    "--progress",
  ];

  if (format === "mp3") {
    args.push("--postprocessor-args", "ffmpeg:-b:a 320k");
  } else {
    args.push("--postprocessor-args", "ffmpeg:-acodec pcm_s16le");
  }

  args.push(url);

  onProgress({ progress: 10, status: "downloading" });

  let title = "track";
  let outputPath = "";

  try {
    await runYtDlp(args, (line) => {
      const pct = parseProgress(line);
      if (pct !== null) {
        onProgress({ progress: 10 + Math.round(pct * 0.75), status: "downloading" });
      }
      if (EXTRACT_RE.test(line)) {
        onProgress({ progress: 90, status: "converting" });
      }
      const destMatch = line.match(/Destination:\s*(.+)/i);
      if (destMatch?.[1]) {
        outputPath = destMatch[1].trim();
      }
    });

    onProgress({ progress: 95, status: "finalizing" });

    const info = await getVideoInfo(url);
    if (info.title) {
      title = sanitizeFilename(info.title);
    }

    if (!outputPath || !fs.existsSync(outputPath)) {
      const ext = format === "wav" ? "wav" : "mp3";
      const candidate = path.join(outputFolder, `${title}.${ext}`);
      if (fs.existsSync(candidate)) {
        outputPath = candidate;
      } else {
        const files = fs
          .readdirSync(outputFolder)
          .filter((f) => f.endsWith(`.${ext}`))
          .map((f) => ({
            name: f,
            time: fs.statSync(path.join(outputFolder, f)).mtimeMs,
          }))
          .sort((a, b) => b.time - a.time);
        if (files[0]) {
          outputPath = path.join(outputFolder, files[0].name);
        }
      }
    }

    if (!outputPath || !fs.existsSync(outputPath)) {
      throw new Error("Arquivo de saída não encontrado após o download.");
    }

    onProgress({ progress: 100, status: "done" });

    return {
      filePath: outputPath,
      title: path.basename(outputPath, path.extname(outputPath)),
      platform,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no download";
    if (message.toLowerCase().includes("private")) {
      throw new Error("Conteúdo privado ou indisponível.");
    }
    if (message.toLowerCase().includes("unsupported url")) {
      throw new Error("URL não suportada.");
    }
    throw new Error(message);
  }
}
