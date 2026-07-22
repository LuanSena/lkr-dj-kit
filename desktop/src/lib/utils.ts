import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Platform = "youtube" | "soundcloud" | "spotify" | "beatport";

export function validateUrl(url: string, platform: Platform): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  switch (platform) {
    case "youtube":
      return /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i.test(trimmed);
    case "soundcloud":
      return /soundcloud\.com\//i.test(trimmed);
    case "spotify":
      return /open\.spotify\.com\/(track|album|playlist)|spotify:track:/i.test(trimmed);
    case "beatport":
      return /beatport\.com\/(track|release)/i.test(trimmed);
    default:
      return false;
  }
}
