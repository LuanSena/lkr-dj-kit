import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="panel relative rounded-2xl p-7 sm:p-8"
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-2xl font-bold tracking-tight text-white">{title}</h2>
      {subtitle ? <p className="mt-1.5 text-sm text-white/45">{subtitle}</p> : null}
    </div>
  );
}
