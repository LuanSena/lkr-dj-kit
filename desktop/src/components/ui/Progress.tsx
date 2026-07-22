import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <div
        className="relative h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      >
        <div className="absolute inset-0 animate-pulse bg-white/25" />
      </div>
    </div>
  );
}
