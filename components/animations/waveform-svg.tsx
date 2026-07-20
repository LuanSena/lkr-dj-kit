"use client";

import { motion } from "framer-motion";

const bars = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  base: 8 + Math.abs(Math.sin(i * 0.7)) * 40 + (i % 3) * 8,
  delay: i * 0.04,
}));

export function WaveformSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {bars.map((bar) => (
        <motion.rect
          key={bar.id}
          x={bar.id * 10 + 1}
          width={5}
          rx={2.5}
          fill="url(#waveGradient)"
          initial={{ height: 4, y: 38 }}
          animate={{
            height: [
              bar.base * 0.3,
              bar.base,
              bar.base * 0.5,
              bar.base * 0.85,
              bar.base * 0.4,
            ],
            y: [
              40 - (bar.base * 0.3) / 2,
              40 - bar.base / 2,
              40 - (bar.base * 0.5) / 2,
              40 - (bar.base * 0.85) / 2,
              40 - (bar.base * 0.4) / 2,
            ],
          }}
          transition={{
            duration: 0.9 + (bar.id % 4) * 0.15,
            repeat: Infinity,
            repeatType: "mirror",
            delay: bar.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}
