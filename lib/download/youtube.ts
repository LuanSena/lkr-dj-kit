import { Innertube } from "youtubei.js";
import { extractYouTubeVideoId } from "@/lib/download/youtube-id";
import { getContentPoToken, getPoContext } from "@/lib/download/youtube-po";
import { ensureYouTubeEvaluator } from "@/lib/download/youtube-platform";

ensureYouTubeEvaluator();

export { extractYouTubeVideoId };

const FAST_CLIENTS = ["ANDROID_VR", "IOS", "ANDROID", "MWEB"] as const;
const PO_CLIENTS = ["MWEB", "WEB", "IOS", "ANDROID"] as const;

type YouTubeClient = (typeof FAST_CLIENTS)[number] | (typeof PO_CLIENTS)[number];

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

function getMimeFromFormat(format?: { mime_type?: string } | null) {
  return format?.mime_type?.split(";")[0] ?? "audio/mp4";
}

function isRetriableYouTubeError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("login required") ||
    lower.includes("no audio formats") ||
    lower.includes("no matching formats") ||
    lower.includes("non 2xx") ||
    lower.includes("streaming data not available") ||
    lower.includes("unplayable") ||
    lower.includes("403") ||
    lower.includes("javascript evaluator")
  );
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

const STREAM_HEADERS = {
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://www.youtube.com",
  Referer: "https://www.youtube.com",
  "User-Agent": "Mozilla/5.0",
};

async function streamFromFormat(
  info: Awaited<ReturnType<Innertube["getBasicInfo"]>>,
  yt: Innertube
) {
  const format = info.chooseFormat({ type: "audio", quality: "best" });
  const url = await format.decipher(yt.session.player);

  if (!url) {
    throw new Error("No valid URL to decipher");
  }

  const response = await fetch(url, {
    headers: {
      ...STREAM_HEADERS,
      "User-Agent": yt.session.user_agent ?? STREAM_HEADERS["User-Agent"],
    },
  });

  if (!response.ok || !response.body) {
    throw new Error(`Stream fetch failed (${response.status})`);
  }

  return {
    stream: await verifyStream(wrapReadableStream(response.body)),
    mimeType: getMimeFromFormat(format),
  };
}

async function downloadWithClient(
  yt: Innertube,
  videoId: string,
  client: YouTubeClient,
  poToken?: string
) {
  const info = await yt.getBasicInfo(videoId, {
    client,
    po_token: poToken,
  });

  const title = info.basic_info.title || "track";
  const status = info.playability_status?.status;

  if (status === "LOGIN_REQUIRED" && !info.streaming_data) {
    throw new Error("Video is login required");
  }

  if (!info.streaming_data?.adaptive_formats?.length) {
    throw new Error("No audio formats available");
  }

  try {
    const stream = await info.download({ type: "audio", quality: "best", client });
    const result = await verifyStream(stream);
    const format = info.chooseFormat({ type: "audio", quality: "best" });
    return {
      stream: result,
      title,
      contentType: getMimeFromFormat(format),
      extension: getExtensionFromMime(getMimeFromFormat(format)),
    };
  } catch {
    const result = await streamFromFormat(info, yt);
    return {
      stream: result.stream,
      title,
      contentType: result.mimeType,
      extension: getExtensionFromMime(result.mimeType),
    };
  }
}

async function downloadWithoutPo(videoId: string) {
  const yt = await getYouTubeClient();
  const errors: string[] = [];

  for (const client of FAST_CLIENTS) {
    try {
      return await downloadWithClient(yt, videoId, client);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Download failed");
    }
  }

  throw new Error(errors[0] || "Could not download audio from YouTube");
}

async function downloadWithPo(videoId: string) {
  const { innertube } = await getPoContext();
  const contentPoToken = await getContentPoToken(videoId);
  const errors: string[] = [];

  for (const client of PO_CLIENTS) {
    try {
      return await downloadWithClient(innertube, videoId, client, contentPoToken);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Download failed");
    }
  }

  throw new Error(errors[0] || "Could not download audio from YouTube");
}

export async function getYouTubeStream(url: string) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  try {
    return await downloadWithoutPo(videoId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Download failed";
    if (!isRetriableYouTubeError(message)) {
      throw error;
    }
  }

  return downloadWithPo(videoId);
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
