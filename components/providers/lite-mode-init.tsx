"use client";

import { detectLiteMode } from "@/lib/media/visual-tier";
import { useEffect } from "react";

export function LiteModeInit() {
  useEffect(() => {
    const update = () => {
      document.documentElement.dataset.liteMode = detectLiteMode() ? "true" : "false";
    };

    update();

    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(max-width: 768px)"),
      window.matchMedia("(pointer: coarse)"),
    ];

    queries.forEach((query) => query.addEventListener("change", update));
    return () => queries.forEach((query) => query.removeEventListener("change", update));
  }, []);

  return null;
}
