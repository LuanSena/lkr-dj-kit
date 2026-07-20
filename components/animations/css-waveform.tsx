"use client";

const BAR_HEIGHTS = [
  0.35, 0.5, 0.65, 0.45, 0.72, 0.88, 0.55, 0.68, 0.82, 0.42, 0.76, 0.58, 0.92, 0.48,
  0.7, 0.54, 0.84, 0.4, 0.66, 0.9, 0.52, 0.74, 0.6, 0.86, 0.44, 0.78, 0.62, 0.94, 0.5,
  0.72, 0.56, 0.8, 0.46, 0.68, 0.88, 0.54, 0.76, 0.58, 0.84, 0.42, 0.7, 0.52, 0.9, 0.64,
];

export function CssWaveform() {
  return (
    <div className="flex h-full w-full items-end justify-between gap-[2px] sm:gap-1" aria-hidden>
      {BAR_HEIGHTS.map((height, index) => (
        <div
          key={index}
          className="css-wave-bar min-w-0 flex-1 max-w-[5px] rounded-sm bg-gradient-to-t from-pink-500/50 via-violet-500/70 to-cyan-400 sm:max-w-[6px]"
          style={{
            height: `${height * 100}%`,
            animationDelay: `${index * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
