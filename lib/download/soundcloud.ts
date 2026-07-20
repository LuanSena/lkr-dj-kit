import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Util = require("soundcloud-scraper/src/util/Util.js") as {
  keygen: (force?: boolean) => Promise<string | null>;
};

let cachedClientId: string | null = null;

async function getClientId(): Promise<string> {
  if (cachedClientId) {
    return cachedClientId;
  }

  const clientId = await Util.keygen();
  if (!clientId) {
    throw new Error("Could not get SoundCloud client id");
  }

  cachedClientId = clientId;
  return clientId;
}

export async function getSoundCloudStream(url: string) {
  const clientId = await getClientId();
  const resolveUrl =
    `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}` +
    `&client_id=${clientId}`;

  const resolveResponse = await fetch(resolveUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!resolveResponse.ok) {
    throw new Error("Could not resolve SoundCloud track");
  }

  const track = (await resolveResponse.json()) as {
    title?: string;
    media?: {
      transcodings?: Array<{
        url: string;
        format?: { protocol?: string };
      }>;
    };
  };

  const progressive = track.media?.transcodings?.find(
    (transcoding) => transcoding.format?.protocol === "progressive"
  );

  if (!progressive?.url) {
    throw new Error("Could not get SoundCloud stream URL");
  }

  const streamInfoResponse = await fetch(`${progressive.url}?client_id=${clientId}`);
  if (!streamInfoResponse.ok) {
    throw new Error("Could not get SoundCloud stream info");
  }

  const streamInfo = (await streamInfoResponse.json()) as { url?: string };
  if (!streamInfo.url) {
    throw new Error("Could not get SoundCloud stream URL");
  }

  const response = await fetch(streamInfo.url);
  if (!response.ok || !response.body) {
    throw new Error("Failed to fetch SoundCloud stream");
  }

  return {
    stream: response.body,
    title: track.title || "track",
    contentType: "audio/mpeg",
    extension: "mp3",
  };
}
