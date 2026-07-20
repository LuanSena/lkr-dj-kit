"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="relative py-12 sm:py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-mono-tech text-[9px] uppercase tracking-[0.3em] text-cyan-400/30">
            LKR_DJ_TOOLS // EOF
          </p>
          <p className="max-w-sm text-xs leading-relaxed text-white/25 sm:max-w-md">
            {t("disclaimer")}
          </p>
          <p className="font-mono-tech text-[10px] text-white/15">
            {t("madeWith")}
          </p>
        </div>
      </div>
    </footer>
  );
}
