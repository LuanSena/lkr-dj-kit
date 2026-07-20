"use client";

import { motion } from "framer-motion";
import { HudCorners } from "@/components/landing/hud-corners";

export function ToolPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <HudCorners className={`border border-white/[0.08] bg-[#030308]/60 backdrop-blur-xl ${className}`}>
        <div className="p-5 sm:p-8">{children}</div>
      </HudCorners>
    </motion.div>
  );
}
