"use client";

import { extractYouTubeVideoId } from "@/lib/download/youtube-id";
import { ensureYouTubeEvaluator } from "@/lib/download/youtube-platform";
import { getBrowserContentPoToken, getBrowserPoContext } from "@/lib/download/youtube-browser-po";
import { fetchAudioStream } from "@/lib/download/youtube-stream";
import type { Innertube } from "youtubei.js";

const FAST_CLIENTS = ["IOS", "ANDROID_VR", "ANDROID", "TV_EMBEDDED", "WEB_EMBEDDED"] as const;
const PO_CLIENTS = ["MWEB", "WEB", "IOS", "ANDROID"] as const;

type YouTubeClient = (typeof FAST_CLIENTS)[number] | (typeof PO_CLIENTS)[number];

function getExtensionFromMime(mimeType: string): string {
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  return "m4a";
}

function getMimeFromFormat(format?: { mime_type?: string } | null) {
  return format?.mime_type?.split(";")[0] ?? "audio/mp4";
}

function isRetriableError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("login required") ||
    lower.includes("403") ||
    lower.includes("non 2xx") ||
    lower.includes("no audio formats") ||
    lower.includes("no matching formats") ||
    lower.includes("stream fetch failed") ||
    lower.includes("stream failed") ||
    lower.includes("empty audio")
  );
}

function appendPotParam(url: string, token: string) {
  if (url.includes("pot=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}pot=${encodeURIComponent(token)}`;
}

async function downloadWithInnertube(
  yt: Innertube,
  videoId: string,
  client: YouTubeClient,
  contentPoToken?: string,
  onProgress?: (value: number) => void
) {
  const info = await yt.getBasicInfo(videoId, {
    client,
    po_token: contentPoToken,
  });

  const title = info.basic_info.title || "track";
  const status = info.playability_status?.status;

  if (status === "LOGIN_REQUIRED" && !info.streaming_data) {
    throw new Error("Video is login required");
  }

  if (!info.streaming_data?.adaptive_formats?.length) {
    throw new Error("No audio formats available");
  }

  onProgress?.(40);

  const format = info.chooseFormat({ type: "audio", quality: "best" });
  const mimeType = getMimeFromFormat(format);

  try {
    const stream = await info.download({ type: "audio", quality: "best", client });
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

    const blob = new Blob(chunks as BlobPart[], { type: mimeType });
    if (blob.size > 0) {
      return { blob, title, extension: getExtensionFromMime(mimeType) };
    }
  } catch {
    // Fall through to direct stream fetch.
  }

  onProgress?.(50);

  let streamUrl = await format.decipher(yt.session.player);
  if (!streamUrl) {
    throw new Error("No valid URL to decipher");
  }

  if (contentPoToken) {
    streamUrl = appendPotParam(streamUrl, contentPoToken);
  }

  onProgress?.(60);
  const blob = await fetchAudioStream(streamUrl);
  onProgress?.(90);

  return {
    blob,
    title,
    extension: getExtensionFromMime(mimeType),
  };
}

async function downloadWithoutPo(
  videoId: string,
  onProgress?: (value: number) => void
) {
  ensureYouTubeEvaluator();
  const { Innertube } = await import("youtubei.js");
  const yt = await Innertube.create({ generate_session_locally: true });
  const errors: string[] = [];

  for (const client of FAST_CLIENTS) {
    try {
      return await downloadWithInnertube(yt, videoId, client, undefined, onProgress);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Download failed");
    }
  }

  throw new Error(errors[0] || "Could not download audio from YouTube");
}

async function downloadWithPo(videoId: string, onProgress?: (value: number) => void) {
  const { innertube } = await getBrowserPoContext();
  const contentPoToken = await getBrowserContentPoToken(videoId);
  const errors: string[] = [];

  onProgress?.(30);

  for (const client of PO_CLIENTS) {
    try {
      return await downloadWithInnertube(
        innertube,
        videoId,
        client,
        contentPoToken,
        onProgress
      );
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Download failed");
    }
  }

  throw new Error(errors[0] || "Could not download audio from YouTube");
}

export async function downloadYouTubeInBrowser(
  url: string,
  onProgress?: (value: number) => void
): Promise<{ blob: Blob; title: string; extension: string }> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  onProgress?.(10);

  try {
    return await downloadWithoutPo(videoId, onProgress);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    if (!isRetriableError(message)) {
      throw error;
    }
  }

  onProgress?.(20);
  return downloadWithPo(videoId, onProgress);
}
