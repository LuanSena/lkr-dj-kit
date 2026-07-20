import { StaticAmbientBg } from "@/components/landing/static-ambient-bg";
import { PageHudOverlay } from "@/components/landing/page-hud-overlay";
import { ToolPageDecor } from "@/components/tools/tool-page-decor";

export function ToolPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <StaticAmbientBg />
      <ToolPageDecor />
      <PageHudOverlay />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,3,8,0.72)_100%)]" />
      <div className="relative z-10 px-4 py-10 sm:px-6 sm:py-14">{children}</div>
    </div>
  );
}
