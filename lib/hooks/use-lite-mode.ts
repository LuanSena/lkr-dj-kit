"use client";

import { useEffect, useState } from "react";
import { detectLiteMode } from "@/lib/media/visual-tier";

function readInitialLiteMode() {
  if (typeof document !== "undefined") {
    return document.documentElement.dataset.liteMode === "true";
  }
  return false;
}

export function useLiteMode() {
  const [lite, setLite] = useState(readInitialLiteMode);

  useEffect(() => {
    const update = () => setLite(detectLiteMode());
    update();

    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(max-width: 768px)"),
      window.matchMedia("(pointer: coarse)"),
    ];

    queries.forEach((query) => query.addEventListener("change", update));
    return () => queries.forEach((query) => query.removeEventListener("change", update));
  }, []);

  return lite;
}
