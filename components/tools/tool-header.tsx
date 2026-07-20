"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";

export function ToolHeader({
  title,
  subtitle,
  backLabel,
  code,
}: {
  title: string;
  subtitle: string;
  backLabel: string;
  code?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 sm:mb-10"
    >
      <Link
        href="/"
        className="group mb-6 inline-flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-cyan-400"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        {backLabel}
      </Link>

      {code && (
        <p className="mb-2 font-mono-tech text-[9px] uppercase tracking-[0.35em] text-cyan-400/50">
          {code}
        </p>
      )}

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <p className="mt-2 max-w-lg font-mono-tech text-xs text-white/35 sm:text-sm">{subtitle}</p>
      <div className="mt-4 h-px w-16 bg-gradient-to-r from-cyan-500/50 to-transparent" />
    </motion.div>
  );
}
