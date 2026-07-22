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

// Browsers we try to borrow cookies from when YouTube demands a login.
// Order matters: put the most common first. yt-dlp fails fast when a browser
// isn't installed, so trying several is cheap.
const COOKIE_BROWSERS = ["chrome", "edge", "brave", "firefox", "opera", "vivaldi", "chromium"];

function isLoginWall(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("sign in to confirm") ||
    m.includes("confirm you") ||
    m.includes("not a bot") ||
    m.includes("--cookies") ||
    m.includes("cookies-from-browser") ||
    m.includes("login required") ||
    m.includes("account") && m.includes("cookies")
  );
}

// Errors that just mean "that browser has no usable cookies here" — we should
// keep trying other browsers rather than give up.
function isCookieSourceProblem(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("could not find") && m.includes("cookies") ||
    m.includes("could not copy") ||
    m.includes("unable to open") ||
    m.includes("dpapi") ||
    m.includes("no such browser") ||
    m.includes("not find") && m.includes("browser")
  );
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

  onProgress({ progress: 10, status: "downloading" });

  let title = "track";
  let outputPath = "";

  const onLine = (line: string) => {
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
  };

  // Build the list of attempts. First try without cookies. If YouTube throws a
  // login wall, transparently retry borrowing cookies from installed browsers.
  const cookieAttempts: string[][] =
    platform === "youtube"
      ? [[], ...COOKIE_BROWSERS.map((b) => ["--cookies-from-browser", b])]
      : [[]];

  let cookieArgs: string[] = [];

  try {
    let lastError: Error | null = null;
    let succeeded = false;

    for (let i = 0; i < cookieAttempts.length; i++) {
      cookieArgs = cookieAttempts[i];
      try {
        await runYtDlp([...args, ...cookieArgs, url], onLine);
        succeeded = true;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        lastError = err instanceof Error ? err : new Error(msg);
        // If this browser simply has no cookies, keep trying the next one.
        if (isCookieSourceProblem(msg)) continue;
        // A login wall on the no-cookie attempt → move on to cookie attempts.
        if (isLoginWall(msg) && i < cookieAttempts.length - 1) continue;
        // Any other error: stop and surface it.
        throw lastError;
      }
    }

    if (!succeeded) {
      throw lastError ?? new Error("Falha no download");
    }

    onProgress({ progress: 95, status: "finalizing" });

    const info = await getVideoInfo(url, cookieArgs);
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
    if (platform === "youtube" && isLoginWall(message)) {
      throw new Error(
        "O YouTube pediu verificação de login para este vídeo. Abra o vídeo no seu navegador " +
          "(Chrome, Edge ou Firefox) estando logado na sua conta do YouTube e tente novamente."
      );
    }
    if (message.toLowerCase().includes("private")) {
      throw new Error("Conteúdo privado ou indisponível.");
    }
    if (message.toLowerCase().includes("unsupported url")) {
      throw new Error("URL não suportada.");
    }
    throw new Error(message);
  }
}
