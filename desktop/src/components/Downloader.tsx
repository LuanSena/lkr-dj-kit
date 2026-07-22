import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Download, FolderOpen, Music2, Send } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { Progress } from "@/components/ui/Progress";
import { FormatPicker } from "@/components/ui/FormatPicker";
import { PageHeader, PageShell } from "@/components/ui/PageShell";
import { cn, validateUrl, type Platform } from "@/lib/utils";
import { getDesktopApi, fileBaseName } from "@/types/ipc";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";
import type { View } from "./Layout";

const PLATFORMS: Platform[] = ["youtube", "soundcloud", "spotify", "beatport"];

type DownloaderProps = {
  locale: Locale;
  setView: (view: View) => void;
};

export function Downloader({ locale, setView }: DownloaderProps) {
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp3" | "wav">("mp3");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [resultTitle, setResultTitle] = useState("");
  const [resultPath, setResultPath] = useState("");
  const [tgConnected, setTgConnected] = useState<boolean | null>(null);

  const isBeatport = platform === "beatport";

  useEffect(() => {
    const api = getDesktopApi();
    return api.onJobProgress(({ progress: p, status: s }) => {
      setProgress(p);
      setStatus(s);
    });
  }, []);

  useEffect(() => {
    if (isBeatport) {
      getDesktopApi()
        .telegramStatus()
        .then((s) => setTgConnected(s.connected));
    }
  }, [isBeatport, platform]);

  const handleDownload = async () => {
    setError("");
    setResultPath("");
    setResultTitle("");

    if (!validateUrl(url, platform)) {
      setError(t(locale, "downloader.errors.invalidUrl"));
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      if (isBeatport) {
        const result = await getDesktopApi().downloadBeatport(url.trim());
        setResultPath(result.filePath);
        setResultTitle(result.title);
        setProgress(100);
        return;
      }

      const tools = await getDesktopApi().checkTools();
      if (!tools.ytdlp || !tools.ffmpeg) {
        setError(t(locale, "downloader.errors.tools"));
        return;
      }

      const result = await getDesktopApi().downloadMedia(url.trim(), format);
      setResultPath(result.filePath);
      setResultTitle(result.title);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : t(locale, "downloader.errors.failed"));
    } finally {
      setLoading(false);
    }
  };

  const showConnectGate = isBeatport && tgConnected === false;

  return (
    <PageShell>
      <PageHeader title={t(locale, "downloader.title")} subtitle={t(locale, "downloader.subtitle")} />

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-2">
          {PLATFORMS.map((p) => (
            <motion.button
              key={p}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setPlatform(p);
                setError("");
                setResultPath("");
              }}
              className={cn(
                "cursor-pointer rounded-xl border py-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all",
                platform === p
                  ? "border-cyan-400/45 bg-gradient-to-b from-cyan-500/20 to-violet-500/10 text-cyan-100"
                  : "border-white/10 bg-black/25 text-white/40 hover:border-white/20 hover:text-white/70"
              )}
            >
              {t(locale, `downloader.tabs.${p}`)}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {platform === "spotify" && (
            <motion.p
              key="spotify-hint"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center text-sm text-white/45"
            >
              {t(locale, "downloader.spotifyHint")}
            </motion.p>
          )}
          {isBeatport && (
            <motion.div
              key="beatport-hint"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-white/45"
            >
              <span>{t(locale, "downloader.beatportHint")}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {showConnectGate ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 rounded-2xl border border-sky-400/25 bg-sky-500/5 p-6 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500">
              <Send className="h-6 w-6 text-black/80" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{t(locale, "downloader.beatportConnectTitle")}</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-white/50">
                {t(locale, "downloader.beatportConnectDesc")}
              </p>
            </div>
            <NeonButton variant="cyan" icon={<Send className="h-4 w-4" />} onClick={() => setView("settings")}>
              {t(locale, "downloader.beatportConnectBtn")}
            </NeonButton>
          </motion.div>
        ) : (
          <>
            <div>
              <label className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                {t(locale, "downloader.urlLabel")}
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t(locale, "downloader.urlPlaceholder")}
                disabled={loading}
                className="field"
              />
            </div>

            {isBeatport ? (
              <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/25 px-4 py-3 text-sm text-white/55">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                {t(locale, "downloader.beatportBadge")}
              </div>
            ) : (
              <FormatPicker
                label={t(locale, "downloader.format")}
                value={format}
                onChange={setFormat}
                options={[
                  { id: "mp3", label: t(locale, "downloader.formatMp3") },
                  { id: "wav", label: t(locale, "downloader.formatWav") },
                ]}
              />
            )}

            <AnimatePresence>
              {loading && progress > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-white/35">
                    <span>
                      {status === "converting"
                        ? t(locale, "downloader.converting")
                        : t(locale, "downloader.downloading")}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-red-300/90"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {resultPath && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5"
                >
                  <div className="flex items-center justify-center gap-2 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">{t(locale, "downloader.success")}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                    <Music2 className="h-4 w-4 text-violet-400" />
                    <span className="truncate">{resultTitle || fileBaseName(resultPath)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NeonButton variant="cyan" onClick={() => getDesktopApi().openFile(resultPath)}>
                      {t(locale, "downloader.openFile")}
                    </NeonButton>
                    <NeonButton
                      variant="secondary"
                      icon={<FolderOpen className="h-4 w-4" />}
                      onClick={() => getDesktopApi().openOutputFolder()}
                    >
                      {t(locale, "downloader.openFolder")}
                    </NeonButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <NeonButton
              onClick={handleDownload}
              disabled={loading || !url.trim()}
              variant="primary"
              icon={<Download className="h-4 w-4" />}
            >
              {loading ? t(locale, "downloader.downloading") : t(locale, "downloader.download")}
            </NeonButton>
          </>
        )}
      </div>
    </PageShell>
  );
}
