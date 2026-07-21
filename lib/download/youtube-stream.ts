const GOOGLE_VIDEO_HOST = /(^|\.)googlevideo\.com$/i;

export function isGoogleVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return GOOGLE_VIDEO_HOST.test(parsed.hostname);
  } catch {
    return false;
  }
}

const STREAM_HEADERS = {
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://www.youtube.com",
  Referer: "https://www.youtube.com/",
};

export async function fetchAudioStream(url: string): Promise<Blob> {
  try {
    const direct = await fetch(url, { headers: STREAM_HEADERS });
    if (direct.ok) {
      const blob = await direct.blob();
      if (blob.size > 0) {
        return blob;
      }
    }
  } catch {
    // CORS or network — fall back to same-origin proxy.
  }

  const proxy = await fetch("/api/download/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!proxy.ok) {
    const data = await proxy.json().catch(() => ({}));
    const message =
      typeof data.error === "string" ? data.error : `Stream failed (${proxy.status})`;
    throw new Error(message);
  }

  const blob = await proxy.blob();
  if (!blob.size) {
    throw new Error("Empty audio stream");
  }

  return blob;
}
