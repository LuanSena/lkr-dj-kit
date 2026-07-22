import { motion } from "framer-motion";
import { Download, RefreshCw, ArrowRight, Globe, ShieldCheck, AudioLines } from "lucide-react";
import { Equalizer } from "@/components/effects/Equalizer";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";
import type { View } from "./Layout";

type HomeProps = {
  locale: Locale;
  setView: (view: View) => void;
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function Home({ locale, setView }: HomeProps) {
  const cards = [
    {
      id: "downloader" as const,
      icon: Download,
      title: t(locale, "home.ctaDownload"),
      desc: t(locale, "home.downloadDesc"),
      accent: "from-cyan-400/20 to-cyan-500/5",
      ring: "group-hover:border-cyan-400/40",
      iconBg: "from-cyan-400 to-cyan-600",
    },
    {
      id: "converter" as const,
      icon: RefreshCw,
      title: t(locale, "home.ctaConvert"),
      desc: t(locale, "home.convertDesc"),
      accent: "from-violet-400/20 to-violet-500/5",
      ring: "group-hover:border-violet-400/40",
      iconBg: "from-violet-400 to-violet-600",
    },
  ];

  const features = [
    { icon: Globe, label: t(locale, "home.features.platforms") },
    { icon: ShieldCheck, label: t(locale, "home.features.private") },
    { icon: AudioLines, label: t(locale, "home.features.quality") },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
        <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono-tech text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
            {t(locale, "home.badge")}
          </span>

          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl">
            LKR <span className="text-gradient">DJ Tools</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/55">
            {t(locale, "home.subtitle")}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setView("downloader")}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_-10px_rgba(34,211,238,0.7)] transition-transform hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              {t(locale, "home.ctaDownload")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("converter")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition-colors hover:border-white/25 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              {t(locale, "home.ctaConvert")}
            </button>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="panel relative hidden overflow-hidden rounded-2xl lg:block"
        >
          <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="ml-auto font-mono-tech text-[9px] uppercase tracking-widest text-white/30">
              now playing
            </span>
          </div>
          <div className="h-[220px] px-6 pb-6 pt-12">
            <Equalizer bars={44} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        </motion.div>
      </section>

      {/* Action cards */}
      <section className="grid gap-4 sm:grid-cols-2">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
            onClick={() => setView(card.id)}
            className={`panel panel-hover group relative flex items-start gap-4 overflow-hidden rounded-2xl p-6 text-left`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${card.iconBg} shadow-lg`}
            >
              <card.icon className="h-6 w-6 text-black/80" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-white">{card.title}</h3>
                <ArrowRight className="h-4 w-4 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-cyan-300" />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">{card.desc}</p>
            </div>
          </motion.button>
        ))}
      </section>

      {/* Feature chips */}
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/8 pt-6"
      >
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-2.5 text-sm text-white/45">
            <f.icon className="h-4 w-4 text-cyan-400/70" />
            {f.label}
          </div>
        ))}
      </motion.section>
    </div>
  );
}
