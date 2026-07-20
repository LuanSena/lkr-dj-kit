"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const switchLocale = (newLocale: "pt" | "en") => {
    router.replace(pathname, { locale: newLocale });
  };

  const navLinks = [
    { href: "/#tools", label: t("tools") },
    { href: "/#features", label: t("features") },
    { href: "/#how-it-works", label: t("howItWorks") },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6">
        <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between border border-white/[0.06] bg-[#030308]/80 px-4 backdrop-blur-xl neon-border sm:px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono-tech text-xs font-bold tracking-widest text-cyan-400">
              LKR
            </span>
            <span className="hidden font-mono-tech text-[10px] text-white/30 sm:inline">
              DJ_TOOLS v1.0
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono-tech text-[11px] uppercase tracking-[0.15em] text-white/35 transition-colors hover:text-cyan-400"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {(["pt", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => switchLocale(lang)}
                className={cn(
                  "font-mono-tech text-[10px] uppercase tracking-widest cursor-pointer transition-colors",
                  locale === lang ? "text-cyan-400" : "text-white/25 hover:text-white/60"
                )}
              >
                {lang}
              </button>
            ))}
            <span className="text-white/10">|</span>
            <Link
              href="/tools/downloader"
              className="font-mono-tech text-[11px] font-bold uppercase tracking-widest text-cyan-400 transition-colors hover:text-cyan-300"
            >
              {t("getStarted")} →
            </Link>
          </div>

          <button
            className="font-mono-tech text-[10px] uppercase tracking-widest text-cyan-400/70 md:hidden cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-4 top-20 border border-cyan-500/20 bg-[#030308]/95 p-6 neon-border">
            <p className="mb-4 font-mono-tech text-[9px] tracking-[0.3em] text-cyan-400/50">{"// NAVIGATION"}</p>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block border-b border-white/5 py-4 font-mono-tech text-sm uppercase tracking-widest text-white/60 transition-colors hover:text-cyan-400"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex gap-4">
              {(["pt", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLocale(lang)}
                  className={cn(
                    "font-mono-tech text-xs uppercase tracking-widest cursor-pointer",
                    locale === lang ? "text-cyan-400" : "text-white/30"
                  )}
                >
                  [{lang}]
                </button>
              ))}
            </div>
            <Link
              href="/tools/downloader"
              onClick={() => setMobileOpen(false)}
              className="mt-6 block border border-cyan-500/30 bg-cyan-400/5 py-3 text-center font-mono-tech text-xs font-bold uppercase tracking-widest text-cyan-400"
            >
              {t("getStarted")} →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
