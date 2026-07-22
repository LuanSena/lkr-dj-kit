import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileAudio,
  FolderOpen,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { Progress } from "@/components/ui/Progress";
import { FormatPicker } from "@/components/ui/FormatPicker";
import { PageHeader, PageShell } from "@/components/ui/PageShell";
import { cn } from "@/lib/utils";
import { getDesktopApi, fileBaseName, type OutputFormat } from "@/types/ipc";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";

const SUPPORTED = [".flac", ".m4a", ".mp3", ".aac", ".wav", ".ogg", ".webm"];

type ConverterProps = {
  locale: Locale;
};

export function Converter({ locale }: ConverterProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [format, setFormat] = useState<OutputFormat>("wav");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const api = getDesktopApi();
    return api.onJobProgress(({ progress: p, fileName, current, total }) => {
      setProgress(p);
      if (fileName) setCurrentFile(fileName);
      if (current) setCurrentIndex(current);
      if (total) setTotalCount(total);
    });
  }, []);

  const addPaths = (paths: string[]) => {
    const valid = paths.filter((f) =>
      SUPPORTED.includes(f.slice(f.lastIndexOf(".")).toLowerCase())
    );
    if (valid.length !== paths.length) {
      setError(t(locale, "converter.errors.unsupported"));
    }
    if (valid.length) {
      setFiles((prev) => [...new Set([...prev, ...valid])]);
    }
  };

  const addFiles = async () => {
    setError("");
    setDone(false);
    const selected = await getDesktopApi().selectAudioFiles();
    if (!selected.length) return;
    addPaths(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (loading) return;
    setError("");
    setDone(false);

    const api = getDesktopApi();
    const dropped = Array.from(e.dataTransfer.files);
    const paths = dropped.map((file) => api.getPathForFile(file)).filter(Boolean);

    if (!paths.length) return;
    addPaths(paths);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeFile = (path: string) => {
    setFiles((prev) => prev.filter((f) => f !== path));
  };

  const handleConvert = async () => {
    if (!files.length) {
      setError(t(locale, "converter.errors.noFile"));
      return;
    }

    setLoading(true);
    setError("");
    setDone(false);
    setProgress(0);
    setSuccessCount(0);
    setFailCount(0);

    try {
      const { results, failed } = await getDesktopApi().convertAudioBatch(files, format);
      setSuccessCount(results.length);
      setFailCount(failed.length);
      setDone(true);
      setProgress(100);
    } catch {
      setError(t(locale, "converter.errors.failed"));
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = [
    { id: "mp3" as const, label: t(locale, "converter.formatMp3") },
    { id: "wav" as const, label: t(locale, "converter.formatWav") },
    { id: "flac" as const, label: t(locale, "converter.formatFlac") },
    { id: "m4a" as const, label: t(locale, "converter.formatM4a") },
  ];

  return (
    <PageShell>
      <PageHeader title={t(locale, "converter.title")} subtitle={t(locale, "converter.subtitle")} />

      <div className="space-y-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={addFiles}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={loading}
          className={cn(
            "group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all",
            "border-white/12 bg-black/20 hover:border-violet-400/45 hover:bg-violet-500/5",
            isDragging && "border-cyan-400/70 bg-cyan-500/10 scale-[1.01]",
            loading && "pointer-events-none opacity-50"
          )}
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-violet-500/15 transition-transform",
              isDragging && "scale-110"
            )}
          >
            <Plus className="h-7 w-7 text-cyan-400/80 group-hover:text-cyan-300" />
          </motion.div>
          <p className="text-sm font-medium text-white/75">
            {files.length ? t(locale, "converter.addMore") : t(locale, "converter.dropzone")}
          </p>
          <p className="mt-1 text-xs text-white/35">{t(locale, "converter.dropzoneHint")}</p>
        </motion.button>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-white/35">
                  {t(locale, "converter.queue")} ({files.length})
                </span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="flex items-center gap-1 text-[11px] text-white/30 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                  {t(locale, "converter.clear")}
                </button>
              </div>
              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {files.map((file) => (
                  <motion.div
                    key={file}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/30 px-3 py-2.5"
                  >
                    <FileAudio className="h-4 w-4 shrink-0 text-violet-400" />
                    <span className="min-w-0 flex-1 truncate text-sm text-white/70">
                      {fileBaseName(file)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="text-white/25 hover:text-red-300"
                      aria-label={t(locale, "common.remove")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FormatPicker
          label={t(locale, "converter.format")}
          value={format}
          onChange={setFormat}
          options={formatOptions}
          columns={4}
        />

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-[11px] uppercase tracking-widest text-white/35">
                <span>
                  {t(locale, "converter.converting")}
                  {totalCount > 0 && ` ${currentIndex} ${t(locale, "converter.of")} ${totalCount}`}
                </span>
                <span>{progress}%</span>
              </div>
              {currentFile && (
                <p className="truncate text-xs text-white/40">{fileBaseName(currentFile)}</p>
              )}
              <Progress value={progress} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-red-300/90"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{t(locale, "converter.success")}</span>
              </div>
              <p className="text-sm text-white/55">
                {failCount > 0
                  ? t(locale, "converter.partialSuccess")
                      .replace("{ok}", String(successCount))
                      .replace("{fail}", String(failCount))
                  : t(locale, "converter.successCount").replace("{count}", String(successCount))}
              </p>
              <NeonButton
                variant="cyan"
                icon={<FolderOpen className="h-4 w-4" />}
                onClick={() => getDesktopApi().openOutputFolder()}
              >
                {t(locale, "converter.openFolder")}
              </NeonButton>
            </motion.div>
          )}
        </AnimatePresence>

        <NeonButton
          onClick={handleConvert}
          disabled={loading || files.length === 0}
          variant="primary"
          icon={<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />}
        >
          {loading ? t(locale, "converter.converting") : t(locale, "converter.convert")}
        </NeonButton>
      </div>
    </PageShell>
  );
}
