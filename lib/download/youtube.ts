import { Innertube } from "youtubei.js";

const YT_CLIENTS = ["IOS", "ANDROID_VR"] as const;
type YouTubeClient = (typeof YT_CLIENTS)[number];

let ytInstance: Innertube | null = null;

async function getYouTubeClient() {
  if (!ytInstance) {
    ytInstance = await Innertube.create();
  }
  return ytInstance;
}

export function extractYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/watch")) {
        return parsed.searchParams.get("v");
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed") {
        return parts[1] || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getExtensionFromMime(mimeType: string): string {
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  if (mimeType.includes("webm")) return "webm";
  return "audio";
}

function getBestAudioFormat(
  info: Awaited<ReturnType<Innertube["getInfo"]>>
) {
  return (
    info.streaming_data?.adaptive_formats
      ?.filter((format) => format.has_audio && !format.has_video)
      .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0] ?? null
  );
}

async function downloadAudioForClient(
  info: Awaited<ReturnType<Innertube["getInfo"]>>,
  client: YouTubeClient
) {
  const format = getBestAudioFormat(info);
  if (!format) {
    throw new Error("No audio formats available");
  }

  const stream = await info.download({
    type: "audio",
    itag: format.itag,
    client,
  });

  const reader = stream.getReader();
  const first = await reader.read();

  if (first.done || !first.value?.length) {
    reader.releaseLock();
    throw new Error("Empty audio stream");
  }

  let released = false;
  const replayableStream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (!released) {
        controller.enqueue(first.value!);
        released = true;
        return;
      }

      const { done, value } = await reader.read();
      if (done) {
        reader.releaseLock();
        controller.close();
        return;
      }

      if (value) {
        controller.enqueue(value);
      }
    },
    cancel() {
      reader.releaseLock();
    },
  });

  return {
    stream: replayableStream,
    mimeType: format.mime_type.split(";")[0],
  };
}

async function resolveYouTubeAudioStream(
  infoByClient: Array<{
    client: YouTubeClient;
    info: Awaited<ReturnType<Innertube["getInfo"]>>;
  }>
) {
  const errors: string[] = [];

  for (const { client, info } of infoByClient) {
    try {
      return await downloadAudioForClient(info, client);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Unknown download error"
      );
    }
  }

  throw new Error(errors[0] || "Could not download audio from YouTube");
}

export async function getYouTubeStream(url: string) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const yt = await getYouTubeClient();
  const infoByClient: Array<{
    client: YouTubeClient;
    info: Awaited<ReturnType<Innertube["getInfo"]>>;
  }> = [];

  for (const client of YT_CLIENTS) {
    try {
      const info = await yt.getInfo(videoId, { client });
      infoByClient.push({ client, info });
    } catch {
      continue;
    }
  }

  if (!infoByClient.length) {
    throw new Error("Could not fetch video info");
  }

  const title = infoByClient[0].info.basic_info.title || "track";
  const { stream, mimeType } = await resolveYouTubeAudioStream(infoByClient);

  return {
    stream,
    title,
    contentType: mimeType,
    extension: getExtensionFromMime(mimeType),
  };
}

export async function searchYouTube(query: string, limit = 3): Promise<string[]> {
  const yt = await getYouTubeClient();
  const results = await yt.search(query, { type: "video" });
  const urls: string[] = [];

  for (const video of results.videos ?? []) {
    const videoId =
      "video_id" in video && typeof video.video_id === "string"
        ? video.video_id
        : "id" in video && typeof video.id === "string"
          ? video.id
          : null;

    if (videoId) {
      urls.push(`https://www.youtube.com/watch?v=${videoId}`);
    }

    if (urls.length >= limit) {
      break;
    }
  }

  return urls;
}
