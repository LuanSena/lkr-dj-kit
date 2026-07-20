import { HudCorners } from "@/components/landing/hud-corners";

export function ToolPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="animate-fade-up-delayed">
      <HudCorners className={`border border-white/[0.08] bg-[#030308]/80 ${className}`}>
        <div className="p-5 sm:p-8">{children}</div>
      </HudCorners>
    </div>
  );
}
