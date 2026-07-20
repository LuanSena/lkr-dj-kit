import { AmbientBg } from "@/components/landing/ambient-bg";
import { PerspectiveGrid } from "@/components/animations/perspective-grid";
import { HeroBackgroundOrb } from "@/components/landing/hero-background-orb";

export function ToolPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <AmbientBg />
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <HeroBackgroundOrb />
      </div>
      <PerspectiveGrid />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,3,8,0.7)_100%)]" />

      {/* HUD frame */}
      <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-cyan-400/30 sm:left-6 sm:top-6 sm:h-10 sm:w-10" />
      <div className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r border-t border-cyan-400/30 sm:right-6 sm:top-6 sm:h-10 sm:w-10" />

      <div className="relative z-10 px-4 py-10 sm:px-6 sm:py-14">{children}</div>
    </div>
  );
}
