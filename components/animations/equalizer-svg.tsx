"use client";

import { motion } from "framer-motion";

const bars = [0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.6, 1, 0.5, 0.75, 0.35, 0.85];

export function EqualizerSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="eqGradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {bars.map((scale, i) => (
        <motion.rect
          key={i}
          x={i * 10 + 2}
          width={6}
          rx={2}
          fill="url(#eqGradient)"
          initial={{ height: 10, y: 70 }}
          animate={{
            height: [10, 60 * scale, 20, 50 * scale, 15],
            y: [70, 70 - 60 * scale, 50, 70 - 50 * scale, 55],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.08,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}
