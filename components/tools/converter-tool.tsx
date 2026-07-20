"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";
import { Upload, Download, AlertCircle, CheckCircle2, FileAudio } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NeonButton } from "@/components/ui/neon-button";
import { convertToWav, isSupportedFormat } from "@/lib/ffmpeg/converter";
import { cn } from "@/lib/utils";

export function ConverterTool() {
  const t = useTranslations("converter");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError("");
      setSuccess(false);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);

      const f = acceptedFiles[0];
      if (!f) return;

      if (!isSupportedFormat(f.name)) {
        setError(t("errors.unsupported"));
        return;
      }

      setFile(f);
    },
    [downloadUrl, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/flac": [".flac"],
      "audio/mp4": [".m4a"],
      "audio/mpeg": [".mp3"],
      "audio/aac": [".aac"],
    },
    maxFiles: 1,
    disabled: loading,
  });

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    setLoadingEngine(true);
    setError("");
    setSuccess(false);
    setProgress(0);

    try {
      const blob = await convertToWav(file, setProgress);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setSuccess(true);
    } catch {
      setError(t("errors.failed"));
    } finally {
      setLoading(false);
      setLoadingEngine(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = file.name.replace(/\.[^.]+$/, ".wav");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full space-y-5">
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-10 transition-all sm:p-14",
          isDragActive
            ? "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_40px_rgba(0,240,255,0.1)]"
            : "border-white/10 bg-black/20 hover:border-violet-500/30 hover:bg-violet-500/5",
          loading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="mb-4 flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5 transition-all group-hover:border-cyan-500/30 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]">
          <Upload className="h-6 w-6 text-cyan-400/60 transition-colors group-hover:text-cyan-400" />
        </div>
        <p className="font-mono-tech text-sm font-medium text-white/70">{t("dropzone")}</p>
        <p className="mt-1 font-mono-tech text-[10px] tracking-wider text-white/30">{t("dropzoneHint")}</p>
      </div>

      {file && (
        <div className="flex items-center gap-4 border border-white/10 bg-black/30 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-violet-500/20 bg-violet-500/10">
            <FileAudio className="h-5 w-5 text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono-tech text-sm text-white/80">{file.name}</p>
            <p className="font-mono-tech text-[10px] text-white/30">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      <p className="text-center font-mono-tech text-[10px] tracking-wide text-white/25">{t("mobileWarning")}</p>

      {loadingEngine && loading && progress === 0 && (
        <p className="animate-pulse text-center font-mono-tech text-xs text-cyan-400/60">
          {t("loadingEngine")}
        </p>
      )}

      {progress > 0 && loading && (
        <div className="space-y-2">
          <div className="flex justify-between font-mono-tech text-[9px] tracking-widest text-white/25">
            <span>CONVERTING</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 border border-red-500/25 bg-red-500/5 p-4 font-mono-tech text-xs text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 border border-emerald-500/25 bg-emerald-500/5 p-4 font-mono-tech text-xs text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {t("success")}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <NeonButton
          onClick={handleConvert}
          disabled={!file || loading}
          variant="primary"
          className="sm:flex-1"
        >
          {loading ? t("converting") : t("convert")}
        </NeonButton>
        {downloadUrl && (
          <NeonButton
            onClick={handleDownload}
            variant="cyan"
            icon={<Download className="h-4 w-4" />}
            className="sm:flex-1"
          >
            {t("download")}
          </NeonButton>
        )}
      </div>
    </div>
  );
}
