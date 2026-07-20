import { Innertube } from "youtubei.js";
import { extractYouTubeVideoId } from "@/lib/download/youtube-id";

export { extractYouTubeVideoId };

const YT_CLIENTS = [
  "IOS",
  "ANDROID_VR",
  "ANDROID",
  "TV_EMBEDDED",
  "WEB_EMBEDDED",
  "WEB",
] as const;
type YouTubeClient = (typeof YT_CLIENTS)[number];

let ytInstance: Innertube | null = null;

async function getYouTubeClient() {
  if (!ytInstance) {
    ytInstance = await Innertube.create({
      generate_session_locally: true,
    });
  }
  return ytInstance;
}

function getExtensionFromMime(mimeType: string): string {
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  if (mimeType.includes("webm")) return "webm";
  return "audio";
}

function getAudioFormats(info: Awaited<ReturnType<Innertube["getInfo"]>>) {
  const formats = info.streaming_data?.adaptive_formats ?? [];
  const audioOnly = formats
    .filter((format) => format.has_audio && !format.has_video)
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

  if (audioOnly.length) {
    return audioOnly;
  }

  return formats
    .filter((format) => format.has_audio)
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));
}

function wrapReadableStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
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
}

async function verifyStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const first = await reader.read();

  if (first.done || !first.value?.length) {
    reader.releaseLock();
    throw new Error("Empty audio stream");
  }

  let primed = false;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (!primed) {
        controller.enqueue(first.value!);
        primed = true;
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
}

function getMimeFromFormat(format?: { mime_type?: string } | null) {
  return format?.mime_type?.split(";")[0] ?? "audio/mp4";
}

async function downloadWithOptions(
  info: Awaited<ReturnType<Innertube["getInfo"]>>,
  client: YouTubeClient,
  options: { itag?: number; quality?: string }
) {
  const stream = await info.download({
    type: "audio",
    client,
    ...options,
  });

  return verifyStream(stream);
}

async function downloadAudioForClient(
  info: Awaited<ReturnType<Innertube["getInfo"]>>,
  client: YouTubeClient,
  yt: Innertube
) {
  const audioFormats = getAudioFormats(info);
  const errors: string[] = [];

  const attempts: Array<{ itag?: number; quality?: string }> = [
    { quality: "best" },
    ...audioFormats.map((format) => ({ itag: format.itag })),
  ];

  for (const attempt of attempts) {
    try {
      const stream = await downloadWithOptions(info, client, attempt);
      const format =
        audioFormats.find((item) => item.itag === attempt.itag) ?? audioFormats[0];
      return {
        stream,
        mimeType: getMimeFromFormat(format),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Download failed");
    }
  }

  for (const format of audioFormats) {
    try {
      const url = await format.decipher(yt.session.player);
      if (!url) continue;

      const response = await fetch(url);
      if (!response.ok || !response.body) {
        throw new Error(`Stream fetch failed (${response.status})`);
      }

      return {
        stream: wrapReadableStream(response.body),
        mimeType: getMimeFromFormat(format),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Direct fetch failed");
    }
  }

  throw new Error(errors[0] || "No audio formats available");
}

export async function getYouTubeStream(url: string) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const yt = await getYouTubeClient();
  const errors: string[] = [];
  let title = "track";

  for (const client of YT_CLIENTS) {
    try {
      const info = await yt.getInfo(videoId, { client });
      title = info.basic_info.title || title;
      const result = await downloadAudioForClient(info, client, yt);
      return {
        stream: result.stream,
        title,
        contentType: result.mimeType,
        extension: getExtensionFromMime(result.mimeType),
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Download failed");
    }
  }

  throw new Error(errors[0] || "Could not download audio from YouTube");
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
