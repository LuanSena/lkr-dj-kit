"use client";

import { extractYouTubeVideoId } from "@/lib/download/youtube-id";
import { ensureYouTubeEvaluator } from "@/lib/download/youtube-platform";

const CLIENTS = ["IOS", "ANDROID_VR", "ANDROID", "MWEB", "WEB"] as const;

function getExtensionFromMime(mimeType: string): string {
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  return "m4a";
}

async function streamToBlob(
  stream: ReadableStream<Uint8Array>,
  mimeType: string,
  onProgress?: (value: number) => void
): Promise<Blob> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value?.length) continue;

    chunks.push(value);
    received += value.length;
    onProgress?.(Math.min(85, 45 + Math.floor(received / 80_000)));
  }

  return new Blob(chunks as BlobPart[], { type: mimeType });
}

export async function downloadYouTubeInBrowser(
  url: string,
  onProgress?: (value: number) => void
): Promise<{ blob: Blob; title: string; extension: string }> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  ensureYouTubeEvaluator();
  onProgress?.(10);

  const { Innertube } = await import("youtubei.js");
  const yt = await Innertube.create({ generate_session_locally: true });
  const errors: string[] = [];

  onProgress?.(20);

  for (const client of CLIENTS) {
    try {
      const info = await yt.getBasicInfo(videoId, { client });
      const title = info.basic_info.title || "track";
      const status = info.playability_status?.status;

      if (status === "LOGIN_REQUIRED" && !info.streaming_data) {
        throw new Error("Video is login required");
      }

      if (!info.streaming_data?.adaptive_formats?.length) {
        throw new Error("No audio formats available");
      }

      onProgress?.(35);

      const stream = await info.download({
        type: "audio",
        quality: "best",
        client,
      });

      const format = info.chooseFormat({ type: "audio", quality: "best" });
      const mimeType = format.mime_type?.split(";")[0] ?? "audio/mp4";
      const blob = await streamToBlob(stream, mimeType, onProgress);

      if (!blob.size) {
        throw new Error("Empty audio stream");
      }

      onProgress?.(90);

      return {
        blob,
        title,
        extension: getExtensionFromMime(mimeType),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Download failed");
    }
  }

  throw new Error(errors[0] || "Could not download audio from YouTube");
}
