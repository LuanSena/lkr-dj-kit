"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ArrowRightLeft, Zap } from "lucide-react";
import { PirateIcon } from "@/components/icons/pirate-icon";
import { GlitchText } from "@/components/animations/glitch-text";
import { NeonButton } from "@/components/ui/neon-button";
import { PerspectiveGrid } from "@/components/animations/perspective-grid";
import { PageHudOverlay } from "@/components/landing/page-hud-overlay";
import { WaveformFrame } from "@/components/landing/waveform-frame";

const HeroBackgroundOrb = dynamic(
  () =>
    import("@/components/landing/hero-background-orb").then((m) => m.HeroBackgroundOrb),
  { ssr: false }
);

const HeroWaveform = dynamic(
  () => import("@/components/animations/hero-waveform").then((m) => m.HeroWaveform),
  { ssr: false }
);

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <HeroBackgroundOrb />
      <PageHudOverlay showBottomCorners={false} />
      <PerspectiveGrid />

      <div className="relative z-10 flex flex-1 flex-col px-4 pt-14 sm:px-8 sm:pt-16 lg:px-12">
        <div className="flex flex-1 flex-col items-center justify-center text-center lg:items-start lg:text-left">
          <div className="animate-fade-up mb-5 inline-flex items-center gap-2 border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 sm:mb-6">
            <Zap className="h-3 w-3 animate-pulse text-cyan-400" />
            <span className="font-mono-tech text-[9px] uppercase tracking-[0.35em] text-cyan-300/80 sm:text-[10px]">
              {t("badge")}
            </span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>

          <div className="animate-fade-up-delayed">
            <GlitchText
              as="h1"
              className="font-display text-[clamp(3.5rem,16vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.05em]"
            >
              <span className="block text-white drop-shadow-[0_0_40px_rgba(0,240,255,0.25)]">
                LKR DJ
              </span>
              <span className="mt-1 block bg-gradient-to-r from-cyan-200 via-violet-300 to-pink-400 bg-clip-text text-transparent">
                TOOL
              </span>
            </GlitchText>
          </div>

          <div className="animate-fade-up-delayed-2 mt-8 flex w-full max-w-lg flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4 lg:max-w-xl">
            <NeonButton
              href="/tools/downloader"
              variant="primary"
              icon={<PirateIcon />}
              className="sm:flex-1"
            >
              {t("ctaDownload")}
            </NeonButton>
            <NeonButton
              href="/tools/converter"
              variant="secondary"
              icon={<ArrowRightLeft className="h-4 w-4 text-violet-400" />}
              className="sm:flex-1"
            >
              {t("ctaConvert")}
            </NeonButton>
          </div>

          <div className="animate-fade-up-delayed-3 mt-8 grid w-full max-w-lg grid-cols-3 gap-px overflow-hidden border border-white/5 bg-white/5 sm:mt-10 lg:max-w-xl">
            {[
              { label: "LATENCY", value: "<50ms", accent: "text-cyan-400" },
              { label: "FORMAT", value: "LOSSLESS", accent: "text-violet-400" },
              { label: "PRIVACY", value: "LOCAL", accent: "text-pink-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#030308]/70 px-3 py-3 sm:px-4 sm:py-4">
                <p className="font-mono-tech text-[7px] tracking-[0.2em] text-white/25 sm:text-[8px]">
                  {stat.label}
                </p>
                <p className={`mt-1 font-mono-tech text-[10px] font-bold sm:text-xs ${stat.accent}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto animate-fade-up-delayed-3">
        <WaveformFrame>
          <HeroWaveform />
        </WaveformFrame>
      </div>
    </section>
  );
}
