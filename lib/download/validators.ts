import { extractYouTubeVideoId } from "@/lib/download/youtube";

export type Platform = "youtube" | "soundcloud" | "spotify";
export type OutputFormat = "mp3" | "wav";
const SOUNDCLOUD_REGEX = /^(https?:\/\/)?(www\.)?soundcloud\.com\/[\w-]+\/[\w-]+/i;
const SPOTIFY_REGEX =
  /^(https?:\/\/)?(open\.)?spotify\.com\/track\/[\w-]+/i;

export function validateUrl(url: string, platform: Platform): boolean {
  const trimmed = url.trim();
  switch (platform) {
    case "youtube":
      return Boolean(extractYouTubeVideoId(trimmed));
    case "soundcloud":
      return SOUNDCLOUD_REGEX.test(trimmed);
    case "spotify":
      return SPOTIFY_REGEX.test(trimmed);
    default:
      return false;
  }
}

export function getApiEndpoint(platform: Platform): string {
  return `/api/download/${platform}`;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "track";
}
