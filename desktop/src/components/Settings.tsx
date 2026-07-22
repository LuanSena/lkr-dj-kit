import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FolderOpen, AlertCircle } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { PageHeader, PageShell } from "@/components/ui/PageShell";
import { TelegramConnect } from "@/components/TelegramConnect";
import { getDesktopApi, folderLabel } from "@/types/ipc";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";

type SettingsProps = {
  locale: Locale;
};

export function Settings({ locale }: SettingsProps) {
  const [outputFolder, setOutputFolder] = useState("");
  const [ready, setReady] = useState(true);
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    const api = getDesktopApi();
    api.getAppInfo().then((info) => {
      setOutputFolder(info.outputFolder);
      setAppVersion(info.version);
    });
    api.checkTools().then((tools) => {
      setReady(tools.ytdlp && tools.ffmpeg);
    });
  }, []);

  const handleChangeFolder = async () => {
    const folder = await getDesktopApi().selectOutputFolder();
    setOutputFolder(folder);
  };

  return (
    <PageShell>
      <PageHeader title={t(locale, "settings.title")} />

      <div className="space-y-5">
        <section className="space-y-4 rounded-2xl border border-white/8 bg-black/25 p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {t(locale, "settings.outputFolder")}
          </h3>
          <p className="text-sm text-white/60">{folderLabel(outputFolder)}</p>
          <div className="grid grid-cols-2 gap-3">
            <NeonButton variant="secondary" onClick={handleChangeFolder}>
              {t(locale, "settings.changeFolder")}
            </NeonButton>
            <NeonButton
              variant="cyan"
              icon={<FolderOpen className="h-4 w-4" />}
              onClick={() => getDesktopApi().openOutputFolder()}
            >
              {t(locale, "settings.openFolder")}
            </NeonButton>
          </div>
        </section>

        <TelegramConnect locale={locale} />

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 p-5"
        >
          {ready ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
          )}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-white/35">
              {t(locale, "settings.status")}
            </p>
            <p className="text-sm text-white/70">
              {ready ? t(locale, "settings.ready") : t(locale, "settings.needsAttention")}
            </p>
          </div>
        </motion.section>

        <p className="text-center text-xs text-white/25">
          {t(locale, "settings.version")} {appVersion || "0.1.0"}
        </p>
      </div>
    </PageShell>
  );
}
