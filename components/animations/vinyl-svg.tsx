"use client";

import { motion } from "framer-motion";

export function VinylSVG({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      <defs>
        <radialGradient id="vinylGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="40%" stopColor="#0f0f1a" />
          <stop offset="100%" stopColor="#0a0a0f" />
        </radialGradient>
        <linearGradient id="labelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#vinylGradient)" stroke="#333" strokeWidth="1" />
      {[30, 45, 60, 75].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} stroke="#222" strokeWidth="0.5" fill="none" />
      ))}
      <circle cx="100" cy="100" r="25" fill="url(#labelGradient)" />
      <text x="100" y="105" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
        LKR
      </text>
      <circle cx="100" cy="100" r="4" fill="#0a0a0f" />
    </motion.svg>
  );
}
