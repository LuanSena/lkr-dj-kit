import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getFfmpegPath } from "./tools";
import { sanitizeFilename } from "./settings";

export type ConvertFormat = "wav" | "mp3" | "flac" | "m4a";

type ProgressCallback = (payload: {
  progress: number;
  status: string;
  current?: number;
  total?: number;
  fileName?: string;
}) => void;

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(getFfmpegPath(), args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";

    ffmpeg.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr.trim() || `ffmpeg exited with code ${code}`));
      }
    });
  });
}

function ffmpegArgs(inputPath: string, outputPath: string, format: ConvertFormat): string[] {
  switch (format) {
    case "wav":
      return ["-y", "-i", inputPath, "-acodec", "pcm_s16le", outputPath];
    case "mp3":
      return ["-y", "-i", inputPath, "-codec:a", "libmp3lame", "-b:a", "320k", outputPath];
    case "flac":
      return ["-y", "-i", inputPath, "-codec:a", "flac", outputPath];
    case "m4a":
      return ["-y", "-i", inputPath, "-codec:a", "aac", "-b:a", "256k", outputPath];
  }
}

export async function convertAudio(
  inputPath: string,
  outputFormat: ConvertFormat,
  outputFolder: string,
  onProgress: ProgressCallback,
  meta?: { current: number; total: number }
) {
  if (!fs.existsSync(inputPath)) {
    throw new Error("Arquivo não encontrado.");
  }

  fs.mkdirSync(outputFolder, { recursive: true });

  const baseName = sanitizeFilename(path.basename(inputPath, path.extname(inputPath)));
  const outputPath = path.join(outputFolder, `${baseName}.${outputFormat}`);
  const fileName = path.basename(inputPath);

  onProgress({
    progress: meta ? Math.round(((meta.current - 1) / meta.total) * 100) : 5,
    status: "converting",
    current: meta?.current,
    total: meta?.total,
    fileName,
  });

  await runFfmpeg(ffmpegArgs(inputPath, outputPath, outputFormat));

  onProgress({
    progress: meta ? Math.round((meta.current / meta.total) * 100) : 100,
    status: "done",
    current: meta?.current,
    total: meta?.total,
    fileName,
  });

  return {
    filePath: outputPath,
    title: baseName,
    platform: "local" as const,
  };
}

export async function convertAudioBatch(
  inputPaths: string[],
  outputFormat: ConvertFormat,
  outputFolder: string,
  onProgress: ProgressCallback
) {
  const results = [];
  const failed: { filePath: string; error: string }[] = [];
  const total = inputPaths.length;

  for (let i = 0; i < inputPaths.length; i++) {
    const inputPath = inputPaths[i];
    try {
      const result = await convertAudio(inputPath, outputFormat, outputFolder, onProgress, {
        current: i + 1,
        total,
      });
      results.push(result);
    } catch (error) {
      failed.push({
        filePath: inputPath,
        error: error instanceof Error ? error.message : "Falha na conversão",
      });
    }
  }

  onProgress({ progress: 100, status: "done", current: total, total });

  return { results, failed };
}
