"use client";

import { motion } from "framer-motion";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

type NeonButtonProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "cyan";
  type?: "button" | "submit";
  icon?: React.ReactNode;
};

export function NeonButton({
  children,
  className,
  href,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  icon,
}: NeonButtonProps) {
  const inner = (
    <>
      {variant === "primary" && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="btn-shimmer absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      )}
      <span
        className={cn(
          "relative z-10 flex items-center justify-center gap-2 font-mono-tech text-xs font-bold uppercase tracking-[0.15em] sm:text-sm",
          variant === "primary" && "text-cyan-300 group-hover:text-cyan-100",
          variant === "secondary" && "text-violet-200/80 group-hover:text-violet-100",
          variant === "cyan" && "text-cyan-300 group-hover:text-cyan-100"
        )}
      >
        {icon}
        {children}
      </span>
    </>
  );

  const classes = cn(
    "group relative block w-full overflow-hidden transition-transform",
    !disabled && "hover:scale-[1.02] active:scale-[0.98]",
    disabled && "pointer-events-none opacity-40",
    variant === "primary" && "btn-neon-border",
    variant === "secondary" &&
      "border border-violet-500/25 bg-violet-500/5 backdrop-blur-sm hover:border-violet-400/40 hover:bg-violet-500/10 hover:shadow-[0_0_30px_rgba(191,90,242,0.15)]",
    variant === "cyan" &&
      "border border-cyan-500/25 bg-cyan-500/5 backdrop-blur-sm hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]",
    className
  );

  const padding = "px-6 py-4";

  if (href && !disabled) {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
        <Link href={href} className={cn(classes, padding, "block")}>
          {variant === "primary" ? (
            <span className="relative block bg-[#030308]/80 backdrop-blur-sm">{inner}</span>
          ) : (
            inner
          )}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(classes, padding, "cursor-pointer")}
    >
      {variant === "primary" ? (
        <span className="relative block bg-[#030308]/80 backdrop-blur-sm">{inner}</span>
      ) : (
        inner
      )}
    </motion.button>
  );
}
