"use client";

import { useVisualTier } from "@/lib/hooks/use-visual-tier";

export function PerspectiveGrid() {
  const tier = useVisualTier();

  if (tier === "minimal") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[28vh] overflow-hidden opacity-25 sm:h-[38vh] sm:opacity-30">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transformOrigin: "center bottom",
          transform: tier === "full" ? "perspective(600px) rotateX(65deg)" : "none",
          height: tier === "full" ? "200%" : "100%",
          bottom: 0,
        }}
      />
    </div>
  );
}
