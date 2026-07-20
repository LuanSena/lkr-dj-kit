export type VisualTier = "full" | "mobile" | "minimal";

export function detectVisualTier(): VisualTier {
  if (typeof window === "undefined") {
    return "mobile";
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "minimal";
  }

  const isPhone =
    window.matchMedia("(max-width: 768px)").matches &&
    window.matchMedia("(pointer: coarse)").matches;

  if (isPhone) {
    return "mobile";
  }

  return "full";
}

/** Disables GPU-heavy effects: canvas, blur filters, particles */
export function detectLiteMode(): boolean {
  return detectVisualTier() !== "full";
}
