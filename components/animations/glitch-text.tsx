"use client";

import { useVisualTier } from "@/lib/hooks/use-visual-tier";

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "span" | "div";
}

export function GlitchText({ children, className = "", as: Tag = "div" }: GlitchTextProps) {
  const tier = useVisualTier();

  if (tier === "minimal") {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={`glitch-text ${className}`}>
      <span className="glitch-base">{children}</span>
      <span className="glitch-layer glitch-cyan" aria-hidden>
        {children}
      </span>
      <span className="glitch-layer glitch-magenta" aria-hidden>
        {children}
      </span>
    </Tag>
  );
}
