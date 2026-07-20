"use client";

import { SpectrumOrb } from "@/components/animations/spectrum-orb";
import { useVisualTier } from "@/lib/hooks/use-visual-tier";

export function HeroBackgroundOrb() {
  const tier = useVisualTier();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute left-1/2 top-[42%] h-[min(130vw,620px)] w-[min(130vw,620px)] -translate-x-1/2 -translate-y-1/2">
        <div className="animate-orb-breathe absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.18)_0%,rgba(191,90,242,0.1)_42%,transparent_72%)]" />
        {tier === "full" && (
          <div
            className="animate-orb-breathe absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(255,45,120,0.08)_0%,transparent_68%)]"
            style={{ animationDelay: "2s" }}
          />
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative ${
            tier === "full"
              ? "h-[min(120vw,820px)] w-[min(120vw,820px)] lg:h-[min(90vh,900px)] lg:w-[min(90vh,900px)]"
              : "h-[min(118vw,560px)] w-[min(118vw,560px)]"
          }`}
        >
          <SpectrumOrb background className="h-full w-full" />
        </div>
      </div>

      {tier !== "minimal" && (
        <svg
          className="fx-rays absolute left-1/2 top-1/2 h-[min(145vw,700px)] w-[min(145vw,700px)] -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-[0.06] sm:opacity-[0.08]"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <polygon
            points="100,10 180,55 180,145 100,190 20,145 20,55"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="0.5"
          />
        </svg>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(3,3,8,0.5)_68%,rgba(3,3,8,0.94)_100%)]" />
    </div>
  );
}
