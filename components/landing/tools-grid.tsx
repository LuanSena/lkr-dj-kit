"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Download, ArrowRightLeft, Music2, ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { HudCorners } from "@/components/landing/hud-corners";

const tools = [
  {
    key: "downloader" as const,
    icon: Download,
    href: "/tools/downloader",
    code: "DL_01",
    accent: "text-cyan-400",
    border: "hover:border-cyan-500/30",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]",
    active: true,
  },
  {
    key: "converter" as const,
    icon: ArrowRightLeft,
    href: "/tools/converter",
    code: "CV_02",
    accent: "text-violet-400",
    border: "hover:border-violet-500/30",
    glow: "group-hover:shadow-[0_0_30px_rgba(191,90,242,0.1)]",
    active: true,
  },
  {
    key: "rekordbox" as const,
    icon: Music2,
    href: "/tools/rekordbox",
    code: "RB_03",
    accent: "text-pink-400",
    border: "hover:border-pink-500/30",
    glow: "group-hover:shadow-[0_0_30px_rgba(255,45,120,0.1)]",
    active: false,
  },
];

export function ToolsGrid() {
  const t = useTranslations("tools");

  return (
    <section id="tools" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="mb-10"
        >
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.35em] text-cyan-400/50">
            01 / modules
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white/90 sm:text-4xl">
            {t("sectionTitle")}
          </h2>
          <p className="mt-2 font-mono-tech text-xs text-white/30">{t("sectionSubtitle")}</p>
        </motion.div>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-2 snap-x snap-mandatory sm:px-6 md:mx-auto md:grid md:max-w-6xl md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="w-[85vw] shrink-0 snap-center sm:w-[60vw] md:w-auto"
            >
              <Link href={tool.href} className={`group block h-full ${tool.glow}`}>
                <HudCorners className={`h-full border border-white/[0.06] bg-white/[0.02] transition-all duration-300 ${tool.border}`}>
                  <div className="flex h-full min-h-[240px] flex-col p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${tool.accent}`} />
                        <span className="font-mono-tech text-[10px] tracking-widest text-white/20">
                          {tool.code}
                        </span>
                      </div>
                      {!tool.active && (
                        <span className="font-mono-tech text-[9px] uppercase tracking-widest text-pink-400/70">
                          [{t(`${tool.key}.badge`)}]
                        </span>
                      )}
                      {tool.active && (
                        <span className="font-mono-tech text-[9px] text-emerald-400/60">ACTIVE</span>
                      )}
                    </div>

                    <div className="mt-auto pt-10">
                      <h3 className="font-display text-2xl font-bold tracking-tight">
                        {t(`${tool.key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/35">
                        {t(`${tool.key}.description`)}
                      </p>
                      <div className={`mt-5 flex items-center gap-1.5 font-mono-tech text-[11px] uppercase tracking-widest ${tool.accent} opacity-60 transition-opacity group-hover:opacity-100`}>
                        {t(`${tool.key}.cta`)}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </HudCorners>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
