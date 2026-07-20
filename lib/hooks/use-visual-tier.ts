"use client";

import { useEffect, useState } from "react";
import { detectVisualTier, type VisualTier } from "@/lib/media/visual-tier";

export function useVisualTier() {
  const [tier, setTier] = useState<VisualTier>("mobile");

  useEffect(() => {
    const update = () => setTier(detectVisualTier());
    update();

    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(max-width: 768px)"),
      window.matchMedia("(pointer: coarse)"),
    ];

    queries.forEach((query) => query.addEventListener("change", update));
    return () => queries.forEach((query) => query.removeEventListener("change", update));
  }, []);

  return tier;
}
