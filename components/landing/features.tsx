"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Shield, Disc3, Database, Smartphone } from "lucide-react";

const features = [
  { key: "privacy" as const, icon: Shield, code: "SEC_01", color: "text-cyan-400", line: "bg-cyan-400", border: "border-cyan-500/10" },
  { key: "lossless" as const, icon: Disc3, code: "AUD_02", color: "text-violet-400", line: "bg-violet-400", border: "border-violet-500/10" },
  { key: "noDatabase" as const, icon: Database, code: "DB_00", color: "text-pink-400", line: "bg-pink-400", border: "border-pink-500/10" },
  { key: "mobile" as const, icon: Smartphone, code: "MOB_04", color: "text-emerald-400", line: "bg-emerald-400", border: "border-emerald-500/10" },
];

export function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10"
        >
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.35em] text-violet-400/50">
            02 / specs
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white/90 sm:text-4xl">
            {t("sectionTitle")}
          </h2>
        </motion.div>

        <div className="grid gap-px bg-white/[0.04] sm:grid-cols-2">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`group relative bg-[#030308] p-6 sm:p-8 transition-colors hover:bg-white/[0.02] ${feature.border} border`}
              >
                <div className="flex items-start justify-between">
                  <Icon className={`h-5 w-5 ${feature.color} opacity-70`} />
                  <span className="font-mono-tech text-[9px] tracking-widest text-white/15">
                    {feature.code}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-lg font-bold tracking-tight sm:text-xl">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/35">
                  {t(`${feature.key}.description`)}
                </p>
                <div className={`mt-4 h-px w-8 ${feature.line} opacity-30 transition-all group-hover:w-16 group-hover:opacity-60`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
