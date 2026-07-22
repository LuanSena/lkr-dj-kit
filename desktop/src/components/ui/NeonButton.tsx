import { cn } from "@/lib/utils";

type NeonButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "cyan";
  type?: "button" | "submit";
  icon?: React.ReactNode;
};

export function NeonButton({
  children,
  className,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  icon,
}: NeonButtonProps) {
  const classes = cn(
    "relative flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200",
    !disabled && "hover:-translate-y-0.5 active:translate-y-0",
    disabled && "pointer-events-none opacity-40",
    variant === "primary" &&
      "bg-gradient-to-r from-cyan-400 to-violet-500 text-black shadow-[0_10px_30px_-12px_rgba(34,211,238,0.8)] hover:shadow-[0_14px_36px_-12px_rgba(34,211,238,0.95)]",
    variant === "secondary" &&
      "border border-white/12 bg-white/5 text-white/80 hover:border-white/25 hover:text-white",
    variant === "cyan" &&
      "border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:border-cyan-400/55 hover:bg-cyan-500/15",
    className
  );

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {icon}
      {children}
    </button>
  );
}
