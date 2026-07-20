"use client";

export function LightRays() {
  const rays = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 800 800"
        className="h-[140%] w-[140%] max-w-none animate-ray-pulse opacity-30 sm:opacity-40"
        aria-hidden
      >
        <defs>
          <radialGradient id="rayFade">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {rays.map((i) => {
          const angle = (i / rays.length) * 360;
          return (
            <line
              key={i}
              x1="400"
              y1="400"
              x2={400 + Math.cos((angle * Math.PI) / 180) * 500}
              y2={400 + Math.sin((angle * Math.PI) / 180) * 500}
              stroke="url(#rayFade)"
              strokeWidth={i % 3 === 0 ? 1.5 : 0.5}
              opacity={i % 2 === 0 ? 0.5 : 0.25}
            />
          );
        })}
      </svg>
    </div>
  );
}
