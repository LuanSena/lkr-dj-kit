import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div
      className={cn(
        "relative h-1.5 w-full overflow-hidden bg-white/5",
        className
      )}
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
