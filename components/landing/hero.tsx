"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRightLeft, Zap } from "lucide-react";
import { PirateIcon } from "@/components/icons/pirate-icon";
import { PerspectiveGrid } from "@/components/animations/perspective-grid";
import { HeroBackgroundOrb } from "@/components/landing/hero-background-orb";
import { HeroHudOverlay } from "@/components/landing/hero-hud-overlay";
import { HeroWaveform } from "@/components/animations/hero-waveform";
import { GlitchText } from "@/components/animations/glitch-text";
import { NeonButton } from "@/components/ui/neon-button";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <PerspectiveGrid />
      <HeroBackgroundOrb />
      <HeroHudOverlay />

      <div className="relative z-10 flex flex-1 flex-col justify-between px-4 pb-0 pt-14 sm:px-8 sm:pt-16 lg:px-12">
        <div className="flex flex-1 flex-col items-center justify-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 backdrop-blur-md sm:mb-6"
          >
            <Zap className="h-3 w-3 animate-pulse text-cyan-400" />
            <span className="font-mono-tech text-[9px] uppercase tracking-[0.35em] text-cyan-300/80 sm:text-[10px]">
              {t("badge")}
            </span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlitchText
              as="h1"
              className="font-display text-[clamp(3.5rem,16vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.05em]"
            >
              <span className="block text-white drop-shadow-[0_0_60px_rgba(0,240,255,0.35)]">
                LKR DJ
              </span>
              <span className="mt-1 block bg-gradient-to-r from-cyan-200 via-violet-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_80px_rgba(191,90,242,0.4)]">
                TOOL
              </span>
            </GlitchText>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4 lg:max-w-xl"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid w-full max-w-lg grid-cols-3 gap-px overflow-hidden border border-white/5 bg-white/5 sm:mt-10 lg:max-w-xl"
          >
            {[
              { label: "LATENCY", value: "<50ms", accent: "text-cyan-400" },
              { label: "FORMAT", value: "LOSSLESS", accent: "text-violet-400" },
              { label: "PRIVACY", value: "LOCAL", accent: "text-pink-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#030308]/70 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
                <p className="font-mono-tech text-[7px] tracking-[0.2em] text-white/25 sm:text-[8px]">{stat.label}</p>
                <p className={`mt-1 font-mono-tech text-[10px] font-bold sm:text-xs ${stat.accent}`}>{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative mt-6 h-[100px] w-full sm:mt-8 sm:h-[130px] lg:h-[160px]"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <HeroWaveform />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
