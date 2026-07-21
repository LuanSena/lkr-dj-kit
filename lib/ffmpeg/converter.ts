"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

const FFMPEG_BASE_URL = "/ffmpeg";

function getAssetUrl(path: string) {
  if (typeof window === "undefined") {
    return path;
  }
  return new URL(path, window.location.origin).href;
}

export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  ffmpegLoadPromise = (async () => {
    const instance = new FFmpeg();

    if (onProgress) {
      instance.on("progress", ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    instance.on("log", ({ message }) => {
      if (message.toLowerCase().includes("error")) {
        console.error("[ffmpeg]", message);
      }
    });

    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(getAssetUrl(`${FFMPEG_BASE_URL}/ffmpeg-core.js`), "text/javascript"),
      toBlobURL(getAssetUrl(`${FFMPEG_BASE_URL}/ffmpeg-core.wasm`), "application/wasm"),
    ]);

    await instance.load({
      classWorkerURL: getAssetUrl(`${FFMPEG_BASE_URL}/worker/worker.js`),
      coreURL,
      wasmURL,
    });

    ffmpeg = instance;
    return instance;
  })();

  try {
    return await ffmpegLoadPromise;
  } catch (error) {
    ffmpegLoadPromise = null;
    ffmpeg = null;
    throw error;
  }
}

const SUPPORTED_EXTENSIONS = [".flac", ".m4a", ".mp3", ".aac", ".webm", ".wav"];

export function isSupportedFormat(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return SUPPORTED_EXTENSIONS.includes(ext);
}

function getExtension(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return ext || ".audio";
}

function toArrayBuffer(data: Uint8Array | string): ArrayBuffer {
  if (typeof data === "string") {
    return new TextEncoder().encode(data).buffer as ArrayBuffer;
  }

  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer;
}

async function transcodeAudio(
  file: File | Blob,
  inputName: string,
  outputName: string,
  args: string[],
  mimeType: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ff = await loadFFmpeg(onProgress);
  const inputBytes = await fetchFile(file);

  await ff.writeFile(inputName, inputBytes);

  const exitCode = await ff.exec(["-i", inputName, ...args, outputName]);
  if (typeof exitCode === "number" && exitCode !== 0) {
    throw new Error(`FFmpeg exited with code ${exitCode}`);
  }

  const data = await ff.readFile(outputName);
  if (!data || (data instanceof Uint8Array && data.length === 0)) {
    throw new Error("FFmpeg produced an empty output file");
  }

  const buffer = toArrayBuffer(
    data instanceof Uint8Array ? data : (data as string)
  );

  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  return new Blob([buffer], { type: mimeType });
}

export async function convertToWav(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const inputName = `input${getExtension(file.name)}`;
  return transcodeAudio(
    file,
    inputName,
    "output.wav",
    ["-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", "-f", "wav"],
    "audio/wav",
    onProgress
  );
}

export async function convertBlobToWav(
  blob: Blob,
  extension: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const inputName = `input${extension.startsWith(".") ? extension : `.${extension}`}`;
  return transcodeAudio(
    blob,
    inputName,
    "output.wav",
    ["-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", "-f", "wav"],
    "audio/wav",
    onProgress
  );
}

export async function convertBlobToMp3(
  blob: Blob,
  extension: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const normalized = extension.replace(/^\./, "").toLowerCase();
  if (normalized === "mp3") {
    return blob;
  }

  const inputName = `input.${normalized}`;

  try {
    return await transcodeAudio(
      blob,
      inputName,
      "output.m4a",
      ["-vn", "-c:a", "aac", "-b:a", "256k"],
      "audio/mp4",
      onProgress
    );
  } catch {
    return transcodeAudio(
      blob,
      inputName,
      "output.mp3",
      ["-vn", "-c:a", "libmp3lame", "-b:a", "320k"],
      "audio/mpeg",
      onProgress
    );
  }
}
