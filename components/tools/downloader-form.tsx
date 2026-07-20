"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { NeonButton } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";
import {
  type Platform,
  type OutputFormat,
  validateUrl,
  getApiEndpoint,
  sanitizeFilename,
} from "@/lib/download/validators";

const PLATFORMS: Platform[] = ["youtube", "soundcloud", "spotify"];

export function DownloaderForm() {
  const t = useTranslations("downloader");
  const [platform, setPlatform] = useState<Platform>("youtube");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<OutputFormat>("mp3");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setError("");

    if (!validateUrl(url, platform)) {
      setError(t("errors.invalidUrl"));
      return;
    }

    setLoading(true);
    setConverting(false);
    setProgress(10);

    try {
      let blob: Blob;
      let baseName: string;
      let sourceExtension: string;

      if (platform === "youtube") {
        setProgress(15);
        const { downloadYouTubeInBrowser } = await import("@/lib/download/youtube-browser");
        const result = await downloadYouTubeInBrowser(url, setProgress);
        blob = result.blob;
        baseName = sanitizeFilename(result.title);
        sourceExtension = result.extension;
      } else {
        const response = await fetch(getApiEndpoint(platform), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, format }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const message = data.error || t("errors.failed");
          if (message.includes("YouTube match") || message.includes("No YouTube")) {
            setError(t("errors.noMatch"));
          } else if (message.toLowerCase().includes("login required")) {
            setError(t("errors.youtubeBlocked"));
          } else {
            setError(message);
          }
          return;
        }

        setProgress(50);

        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const rawFilename = filenameMatch?.[1] || "track.audio";
        baseName = sanitizeFilename(rawFilename.replace(/\.[^.]+$/, ""));
        sourceExtension =
          response.headers.get("X-Audio-Extension") ||
          rawFilename.slice(rawFilename.lastIndexOf(".") + 1) ||
          "m4a";

        blob = await response.blob();
      }

      let outputExtension = sourceExtension;

      const needsConversion =
        format === "wav" ||
        (format === "mp3" && sourceExtension !== "mp3");

      if (needsConversion) {
        setConverting(true);
        setProgress(65);

        const { convertBlobToMp3, convertBlobToWav } = await import("@/lib/ffmpeg/converter");

        if (format === "wav") {
          try {
            blob = await convertBlobToWav(blob, sourceExtension, (value) => {
              setProgress(65 + Math.round(value * 0.3));
            });
            outputExtension = "wav";
          } catch {
            throw new Error(t("errors.failed"));
          }
        } else {
          try {
            blob = await convertBlobToMp3(blob, sourceExtension, (value) => {
              setProgress(65 + Math.round(value * 0.3));
            });
            outputExtension = blob.type.includes("mpeg") ? "mp3" : sourceExtension;
          } catch {
            outputExtension = sourceExtension;
          }
        }
      }

      setProgress(95);

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${baseName}.${outputExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setProgress(100);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("errors.failed");
      if (message.toLowerCase().includes("login required")) {
        setError(t("errors.youtubeBlocked"));
      } else {
        setError(t("errors.failed"));
      }
    } finally {
      setLoading(false);
      setConverting(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="grid grid-cols-3 gap-px border border-white/10 bg-white/10">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPlatform(p);
              setError("");
            }}
            className={cn(
              "cursor-pointer py-3 font-mono-tech text-[10px] uppercase tracking-[0.15em] transition-all sm:text-xs",
              platform === p
                ? "bg-cyan-500/15 text-cyan-300 shadow-[inset_0_0_20px_rgba(0,240,255,0.1)]"
                : "bg-[#030308]/80 text-white/30 hover:text-white/60"
            )}
          >
            {t(`tabs.${p}`)}
          </button>
        ))}
      </div>

      {platform === "youtube" && (
        <div className="flex items-start gap-2 border border-cyan-500/20 bg-cyan-500/5 p-4 font-mono-tech text-xs text-cyan-300/70">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          {t("youtubeLocal")}
        </div>
      )}

      {platform === "spotify" && (
        <div className="flex items-start gap-2 border border-cyan-500/20 bg-cyan-500/5 p-4 font-mono-tech text-xs text-cyan-300/70">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
          {t("spotifyWarning")}
        </div>
      )}

      <DownloaderFields
        url={url}
        setUrl={setUrl}
        format={format}
        setFormat={setFormat}
        loading={loading}
        converting={converting}
        progress={progress}
        error={error}
        onDownload={handleDownload}
        placeholder={t("urlPlaceholder")}
        formatLabel={t("format")}
        formatMp3={t("formatMp3")}
        formatWav={t("formatWav")}
        downloadLabel={
          converting ? t("converting") : loading ? t("downloading") : t("download")
        }
        hideFormat={platform === "spotify"}
      />
    </div>
  );
}

function DownloaderFields({
  url,
  setUrl,
  format,
  setFormat,
  loading,
  converting,
  progress,
  error,
  onDownload,
  placeholder,
  formatLabel,
  formatMp3,
  formatWav,
  downloadLabel,
  hideFormat,
}: {
  url: string;
  setUrl: (v: string) => void;
  format: OutputFormat;
  setFormat: (v: OutputFormat) => void;
  loading: boolean;
  converting: boolean;
  progress: number;
  error: string;
  onDownload: () => void;
  placeholder: string;
  formatLabel: string;
  formatMp3: string;
  formatWav: string;
  downloadLabel: string;
  hideFormat?: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="relative">
        <label className="mb-2 block font-mono-tech text-[9px] uppercase tracking-[0.2em] text-white/25">
          URL
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="w-full border border-white/10 bg-black/40 px-4 py-3.5 font-mono-tech text-sm text-white placeholder:text-white/20 backdrop-blur-sm transition-all focus:border-cyan-500/40 focus:outline-none focus:shadow-[0_0_20px_rgba(0,240,255,0.08)] disabled:opacity-50"
        />
      </div>

      {!hideFormat && (
        <div>
          <label className="mb-2 block font-mono-tech text-[9px] uppercase tracking-[0.2em] text-white/25">
            {formatLabel}
          </label>
          <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10">
            {(["mp3", "wav"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  "cursor-pointer py-3 font-mono-tech text-xs uppercase tracking-wider transition-all",
                  format === f
                    ? f === "mp3"
                      ? "bg-violet-500/15 text-violet-300"
                      : "bg-cyan-500/15 text-cyan-300"
                    : "bg-[#030308]/80 text-white/30 hover:text-white/60"
                )}
              >
                {f === "mp3" ? formatMp3 : formatWav}
              </button>
            ))}
          </div>
        </div>
      )}

      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between font-mono-tech text-[9px] tracking-widest text-white/25">
            <span>{converting ? "CONVERTING" : "DOWNLOADING"}</span>
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

      <NeonButton
        onClick={onDownload}
        disabled={loading || !url.trim()}
        variant="primary"
        icon={<Download className="h-4 w-4" />}
      >
        {downloadLabel}
      </NeonButton>
    </div>
  );
}
