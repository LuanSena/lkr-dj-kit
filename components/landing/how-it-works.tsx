"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const steps = [
  { key: "step1" as const, code: "01", color: "from-cyan-500 to-cyan-600" },
  { key: "step2" as const, code: "02", color: "from-violet-500 to-violet-600" },
  { key: "step3" as const, code: "03", color: "from-pink-500 to-pink-600" },
];

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="mb-12"
        >
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.35em] text-pink-400/50">
            03 / pipeline
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white/90 sm:text-4xl">
            {t("sectionTitle")}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Horizontal connector — desktop */}
          <div className="absolute top-6 left-0 right-0 hidden h-px bg-gradient-to-r from-cyan-500/30 via-violet-500/30 to-pink-500/30 md:block" />

          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                {/* Mobile vertical line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent md:hidden" />
                )}

                <div className="flex gap-5 md:flex-col md:items-start md:gap-4">
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center bg-gradient-to-br ${step.color} font-mono-tech text-[10px] font-bold text-black md:h-12 md:w-12 md:text-xs`}
                  >
                    {step.code}
                  </div>
                  <div className="pb-6 md:pb-0">
                    <h3 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                      {t(`${step.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/35">
                      {t(`${step.key}.description`)}
                    </p>
                    <p className="mt-3 font-mono-tech text-[9px] tracking-widest text-white/15">
                      {`STEP_${step.code} · OK`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
