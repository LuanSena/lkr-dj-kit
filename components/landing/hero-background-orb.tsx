"use client";

import { motion } from "framer-motion";
import { SpectrumOrb } from "@/components/animations/spectrum-orb";
import { LightRays } from "@/components/animations/light-rays";

export function HeroBackgroundOrb() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <LightRays />

      {/* Primary orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-[min(150vw,900px)] w-[min(150vw,900px)] sm:h-[min(120vw,1000px)] sm:w-[min(120vw,1000px)] lg:h-[min(95vh,1100px)] lg:w-[min(95vh,1100px)]"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1], rotate: [0, 1, 0, -1, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full"
          >
            <SpectrumOrb background className="h-full w-full" />
          </motion.div>
        </motion.div>
      </div>

      {/* Secondary ghost orbs */}
      <div className="absolute -left-[20%] top-[20%] h-[40vw] w-[40vw] rounded-full bg-violet-600/10 blur-[100px] animate-pulse" />
      <div className="absolute -right-[15%] bottom-[25%] h-[35vw] w-[35vw] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute left-[10%] bottom-[10%] h-[25vw] w-[25vw] rounded-full bg-pink-500/8 blur-[60px] animate-pulse" style={{ animationDelay: "4s" }} />

      {/* Hex ring overlay */}
      <svg
        className="absolute left-1/2 top-1/2 h-[min(160vw,950px)] w-[min(160vw,950px)] -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-[0.07]"
        viewBox="0 0 200 200"
        aria-hidden
      >
        <polygon
          points="100,10 180,55 180,145 100,190 20,145 20,55"
          fill="none"
          stroke="#00f0ff"
          strokeWidth="0.5"
        />
        <polygon
          points="100,30 160,60 160,140 100,170 40,140 40,60"
          fill="none"
          stroke="#bf5af2"
          strokeWidth="0.3"
        />
      </svg>

      {/* Lighter vignette — let the orb shine */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(3,3,8,0.5)_70%,rgba(3,3,8,0.92)_100%)]" />
    </div>
  );
}
