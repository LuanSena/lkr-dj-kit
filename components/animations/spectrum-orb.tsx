"use client";

import { useEffect, useId, useState } from "react";

const BAR_COUNT = 80;

interface SpectrumOrbProps {
  className?: string;
  background?: boolean;
}

export function SpectrumOrb({ className, background = false }: SpectrumOrbProps) {
  const uid = useId().replace(/:/g, "");
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => 0.3)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((_, i) => {
          const wave = Math.sin(Date.now() / 180 + i * 0.35) * 0.35 + 0.55;
          const noise = Math.random() * 0.45;
          return Math.min(1, Math.max(0.08, wave + noise));
        })
      );
    }, 70);
    return () => clearInterval(interval);
  }, []);

  const innerR = background ? 42 : 55;
  const barLen = background ? 55 : 35;

  return (
    <div className={`relative flex items-center justify-center ${className ?? ""}`}>
      {background && (
        <>
          <div className="absolute h-[140%] w-[140%] rounded-full bg-cyan-400/20 blur-[100px]" />
          <div className="absolute h-[120%] w-[120%] rounded-full bg-violet-500/25 blur-[70px]" />
          <div className="absolute h-[100%] w-[100%] rounded-full bg-pink-500/15 blur-[50px]" />
          <div className="absolute h-[160%] w-[160%] rounded-full border border-cyan-500/5 animate-spin-slow" />
          <div className="absolute h-[175%] w-[175%] rounded-full border border-dashed border-violet-500/10 animate-spin-reverse" style={{ animationDuration: "30s" }} />
        </>
      )}

      <div className={`absolute rounded-full bg-cyan-500/10 blur-[50px] ${background ? "h-full w-full" : "h-[90%] w-[90%]"}`} />
      <div className={`absolute rounded-full bg-violet-500/12 blur-[35px] ${background ? "h-[85%] w-[85%]" : "h-[70%] w-[70%]"}`} />

      <div className="absolute h-[98%] w-[98%] animate-spin-slow rounded-full border border-dashed border-cyan-400/20" />
      <div className="absolute h-[82%] w-[82%] animate-spin-reverse rounded-full border border-violet-400/25" />
      <div className="absolute h-[66%] w-[66%] rounded-full border border-cyan-300/10" />
      {background && (
        <div className="absolute h-[115%] w-[115%] animate-pulse rounded-full border border-cyan-500/10 opacity-60" />
      )}

      <svg viewBox="0 0 200 200" className="relative h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`barGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="1" />
            <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff2d78" stopOpacity="0.8" />
          </linearGradient>
          <filter id={`glow-${uid}`}>
            <feGaussianBlur stdDeviation={background ? 3 : 2} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`coreGrad-${uid}`}>
            <stop offset="0%" stopColor="#0a0a14" />
            <stop offset="100%" stopColor="#030308" />
          </radialGradient>
        </defs>

        {bars.map((height, i) => {
          const angle = (i / BAR_COUNT) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const outerR = innerR + height * barLen;
          const x1 = 100 + innerR * Math.cos(rad);
          const y1 = 100 + innerR * Math.sin(rad);
          const x2 = 100 + outerR * Math.cos(rad);
          const y2 = 100 + outerR * Math.sin(rad);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`url(#barGrad-${uid})`}
              strokeWidth={background ? 2.2 : 2}
              strokeLinecap="round"
              filter={`url(#glow-${uid})`}
              opacity={0.85 + height * 0.15}
            />
          );
        })}

        <circle
          cx="100"
          cy="100"
          r={background ? 44 : 40}
          fill={`url(#coreGrad-${uid})`}
          stroke="rgba(0,240,255,0.35)"
          strokeWidth="1"
        />
        {!background && (
          <>
            <circle
              cx="100"
              cy="100"
              r="28"
              fill="none"
              stroke="rgba(191,90,242,0.4)"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              className="animate-spin-slow origin-center"
              style={{ transformOrigin: "100px 100px" }}
            />
            <text x="100" y="96" textAnchor="middle" fill="#00f0ff" fontSize="8" fontFamily="monospace" opacity="0.9">
              LKR
            </text>
            <text x="100" y="108" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="5" fontFamily="monospace">
              DJ SYS
            </text>
          </>
        )}
      </svg>

      <div className="absolute h-full w-full animate-spin-slow">
        <div className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff]" />
      </div>
      {background && (
        <div className="absolute h-full w-full animate-spin-reverse" style={{ animationDuration: "25s" }}>
          <div className="absolute bottom-[8%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-pink-400 shadow-[0_0_8px_#ff2d78]" />
        </div>
      )}
    </div>
  );
}
