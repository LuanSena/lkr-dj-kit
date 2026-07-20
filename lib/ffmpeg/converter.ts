"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}

const SUPPORTED_EXTENSIONS = [".flac", ".m4a", ".mp3", ".aac", ".webm"];

export function isSupportedFormat(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));
  return SUPPORTED_EXTENSIONS.includes(ext);
}

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
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
  await ff.exec(["-i", inputName, ...args, outputName]);

  const data = await ff.readFile(outputName);
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
    ["-c:a", "pcm_s16le"],
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
    ["-c:a", "pcm_s16le"],
    "audio/wav",
    onProgress
  );
}

export async function convertBlobToMp3(
  blob: Blob,
  extension: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  if (extension === "mp3" || extension === ".mp3") {
    return blob;
  }

  const inputName = `input${extension.startsWith(".") ? extension : `.${extension}`}`;
  return transcodeAudio(
    blob,
    inputName,
    "output.mp3",
    ["-codec:a", "libmp3lame", "-b:a", "320k"],
    "audio/mpeg",
    onProgress
  );
}
