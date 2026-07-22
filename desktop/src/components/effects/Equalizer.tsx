import { useMemo } from "react";

type EqualizerProps = {
  bars?: number;
  className?: string;
};

// Lightweight CSS equalizer — decorative, reliable, no canvas.
export function Equalizer({ bars = 40, className = "" }: EqualizerProps) {
  const config = useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => ({
        delay: (i % 7) * 0.13 + (i % 3) * 0.05,
        duration: 0.9 + ((i * 37) % 60) / 100,
        min: 0.2 + ((i * 53) % 30) / 100,
      })),
    [bars]
  );

  return (
    <div className={`flex h-full w-full items-end justify-center gap-[3px] ${className}`}>
      {config.map((c, i) => (
        <span
          key={i}
          className="w-full flex-1 rounded-full"
          style={{
            background: "linear-gradient(180deg, #22d3ee, #8b5cf6 60%, #f472b6)",
            transformOrigin: "bottom",
            animation: `eq-bounce ${c.duration}s ease-in-out ${c.delay}s infinite`,
            opacity: 0.85,
            minHeight: `${c.min * 100}%`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}
