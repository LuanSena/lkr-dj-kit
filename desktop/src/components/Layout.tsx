import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, Settings, Home, Disc3, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";
import { AmbientBackground } from "@/components/effects/AmbientBackground";

export type View = "home" | "downloader" | "converter" | "library" | "settings";

type LayoutProps = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  view: View;
  setView: (view: View) => void;
  children: React.ReactNode;
};

const NAV = [
  { id: "home" as const, icon: Home, labelKey: "nav.home" },
  { id: "downloader" as const, icon: Download, labelKey: "nav.downloader" },
  { id: "converter" as const, icon: RefreshCw, labelKey: "nav.converter" },
  { id: "library" as const, icon: Library, labelKey: "nav.library" },
  { id: "settings" as const, icon: Settings, labelKey: "nav.settings" },
];

export function Layout({ locale, setLocale, view, setView, children }: LayoutProps) {
  return (
    <div className="relative flex h-full overflow-hidden">
      <AmbientBackground />

      {/* Sidebar */}
      <aside className="relative z-10 flex w-[236px] shrink-0 flex-col border-r border-white/8 bg-black/30 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-6 pb-6 pt-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_8px_24px_-8px_rgba(34,211,238,0.7)]">
            <Disc3 className="h-5 w-5 text-black/80" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-tight text-white">LKR</div>
            <div className="font-mono-tech text-[9px] uppercase tracking-[0.28em] text-cyan-300/70">
              DJ Tools
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map(({ id, icon: Icon, labelKey }) => {
            const active = view === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-white/45 hover:bg-white/5 hover:text-white/80"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-0 rounded-xl border border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 to-violet-500/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className={cn("relative z-10 h-[18px] w-[18px]", active && "text-cyan-300")} />
                <span className="relative z-10">{t(locale, labelKey)}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center justify-between px-5 pb-6 pt-4">
          <div className="inline-flex rounded-lg border border-white/8 bg-black/30 p-0.5">
            {(["pt", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                className={cn(
                  "rounded-md px-2.5 py-1 font-mono-tech text-[10px] uppercase tracking-wider transition-colors",
                  locale === l ? "bg-white/10 text-cyan-200" : "text-white/35 hover:text-white/70"
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <span className="font-mono-tech text-[9px] uppercase tracking-widest text-white/25">
            v0.1
          </span>
        </div>
      </aside>

      {/* Content */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className={cn(
              "mx-auto flex w-full flex-col px-8",
              view === "home"
                ? "max-w-5xl justify-start py-12"
                : view === "library"
                  ? "max-w-3xl justify-start py-10"
                  : "min-h-full max-w-2xl justify-center py-10"
            )}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
