export function WaveformFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-3 mb-3 sm:mx-6 sm:mb-6">
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-8 w-8 border-b-2 border-l-2 border-violet-400/40 sm:h-12 sm:w-12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 z-10 h-8 w-8 border-b-2 border-r-2 border-violet-400/40 sm:h-12 sm:w-12"
        aria-hidden
      />

      <div className="relative h-[84px] overflow-hidden pl-7 pr-7 pt-2 sm:h-[112px] sm:pl-11 sm:pr-11 lg:h-[140px]">
        <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent sm:inset-x-11" />
        <div className="h-full w-full">{children}</div>
        <div className="absolute inset-x-7 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent sm:inset-x-11" />
      </div>
    </div>
  );
}
