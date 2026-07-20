"use client";

import { SpectrumOrb } from "@/components/animations/spectrum-orb";
import { useVisualTier } from "@/lib/hooks/use-visual-tier";

export function ToolPageDecor() {
  const tier = useVisualTier();

  if (tier === "minimal") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50 sm:opacity-60">
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/3 sm:h-80 sm:w-80">
        <div className="animate-orb-breathe absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.14)_0%,transparent_70%)]" />
        <SpectrumOrb compact className="h-full w-full opacity-80" />
      </div>
    </div>
  );
}
