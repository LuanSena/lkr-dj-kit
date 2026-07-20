import { getSoundCloudStream } from "@/lib/download/soundcloud";
import { getSpotifyTrackMetadata } from "@/lib/download/spotify";
import { getYouTubeStream, searchYouTube } from "@/lib/download/youtube";

export type DownloadStreamResult = {
  stream: ReadableStream;
  title: string;
  contentType: string;
  extension: string;
};

export async function getSpotifyStream(url: string): Promise<DownloadStreamResult> {
  const { title, artist } = await getSpotifyTrackMetadata(url);
  const query = artist ? `${title} ${artist}` : title;
  const candidates = await searchYouTube(query, 5);

  if (!candidates.length) {
    throw new Error("No YouTube match found");
  }

  let lastError: Error | null = null;

  for (const youtubeUrl of candidates) {
    try {
      return await getYouTubeStream(youtubeUrl);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Download failed");
    }
  }

  throw lastError ?? new Error("No YouTube match found");
}

export { getYouTubeStream, getSoundCloudStream };
