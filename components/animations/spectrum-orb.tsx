import { useId } from "react";

const BAR_COUNT = 48;
const MOBILE_BAR_COUNT = 40;

const STATIC_BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  return 0.28 + Math.sin(i * 0.55) * 0.2 + Math.cos(i * 0.25) * 0.12;
});

const STATIC_MOBILE_BARS = Array.from({ length: MOBILE_BAR_COUNT }, (_, i) => {
  return 0.28 + Math.sin(i * 0.55) * 0.18 + Math.cos(i * 0.25) * 0.1;
});

interface SpectrumOrbProps {
  className?: string;
  background?: boolean;
  compact?: boolean;
}

export function SpectrumOrb({
  className,
  background = false,
  compact = false,
}: SpectrumOrbProps) {
  const uid = useId().replace(/:/g, "");
  const barCount = compact ? MOBILE_BAR_COUNT : BAR_COUNT;
  const activeBars = compact ? STATIC_MOBILE_BARS : STATIC_BARS;
  const innerR = background ? 42 : 55;
  const barLen = background ? 55 : 35;

  return (
    <div className={`relative flex items-center justify-center ${className ?? ""}`}>
      {background && (
        <>
          <div className="animate-orb-breathe absolute inset-[5%] rounded-full border border-cyan-500/15" />
          <div
            className="animate-orb-breathe absolute inset-[12%] rounded-full border border-dashed border-violet-500/15"
            style={{ animationDelay: "1.5s" }}
          />
        </>
      )}

      <div className="absolute h-[66%] w-[66%] rounded-full border border-cyan-300/10" />

      <svg viewBox="0 0 200 200" className="relative h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`barGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="1" />
            <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff2d78" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id={`coreGrad-${uid}`}>
            <stop offset="0%" stopColor="#0a0a14" />
            <stop offset="100%" stopColor="#030308" />
          </radialGradient>
        </defs>

        {activeBars.map((height, i) => {
          const angle = (i / barCount) * 360 - 90;
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
      </svg>
    </div>
  );
}
