import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Trash2,
  ExternalLink,
  GripVertical,
  Play,
  Cloud,
  Music,
  Disc3,
  FileMusic,
  Library as LibraryIcon,
} from "lucide-react";
import { PageHeader, PageShell } from "@/components/ui/PageShell";
import { getDesktopApi, fileBaseName } from "@/types/ipc";
import type { LibraryEntry, LibrarySource } from "@/types/ipc";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";

type LibraryProps = { locale: Locale };

const SOURCE_META: Record<
  LibrarySource,
  { label: string; icon: typeof Play; className: string }
> = {
  youtube: { label: "YouTube", icon: Play, className: "text-red-400 bg-red-500/10" },
  soundcloud: { label: "SoundCloud", icon: Cloud, className: "text-orange-400 bg-orange-500/10" },
  spotify: { label: "Spotify", icon: Music, className: "text-emerald-400 bg-emerald-500/10" },
  beatport: { label: "Beatport", icon: Disc3, className: "text-lime-300 bg-lime-500/10" },
  local: { label: "Local", icon: FileMusic, className: "text-white/60 bg-white/10" },
};

function relativeDate(locale: Locale, ts: number): string {
  const diff = Date.now() - ts;
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diff / day);
  if (days <= 0) return t(locale, "library.today");
  if (days === 1) return t(locale, "library.yesterday");
  return t(locale, "library.daysAgo").replace("{n}", String(days));
}

export function Library({ locale }: LibraryProps) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = () => {
    getDesktopApi()
      .libraryList()
      .then((list) => {
        setEntries(list);
        setLoaded(true);
      });
  };

  useEffect(load, []);

  const remove = async (id: string) => {
    await getDesktopApi().libraryRemove(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const startDrag = (e: React.DragEvent, filePath: string) => {
    e.preventDefault();
    getDesktopApi().startDrag(filePath);
  };

  return (
    <PageShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <PageHeader title={t(locale, "library.title")} subtitle={t(locale, "library.subtitle")} />
        {entries.length > 0 && (
          <span className="mb-1 shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono-tech text-[11px] text-white/50">
            {t(locale, "library.count").replace("{count}", String(entries.length))}
          </span>
        )}
      </div>

      {loaded && entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-black/20 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
            <LibraryIcon className="h-7 w-7 text-white/30" />
          </div>
          <p className="font-medium text-white/70">{t(locale, "library.empty")}</p>
          <p className="mt-1.5 max-w-xs text-sm text-white/40">{t(locale, "library.emptyHint")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {entries.map((entry) => {
                const meta = SOURCE_META[entry.source] ?? SOURCE_META.local;
                const SourceIcon = meta.icon;
                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    draggable
                    onDragStart={(e) => startDrag(e as unknown as React.DragEvent, entry.filePath)}
                    title={entry.filePath}
                    className="group flex cursor-grab items-center gap-3 rounded-xl border border-white/8 bg-black/30 px-3 py-3 transition-colors hover:border-cyan-400/30 hover:bg-white/[0.04] active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-white/20 group-hover:text-white/40" />

                    <span
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " + meta.className
                      }
                    >
                      <SourceIcon className="h-[18px] w-[18px]" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white/85">
                        {entry.title || fileBaseName(entry.filePath)}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
                        <span>{meta.label}</span>
                        <span className="text-white/20">•</span>
                        <span>{relativeDate(locale, entry.createdAt)}</span>
                        <span className="text-white/20">•</span>
                        <span className="uppercase">{entry.format}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {entry.originalUrl && (
                        <IconBtn
                          title={t(locale, "library.openLink")}
                          onClick={() => getDesktopApi().openExternal(entry.originalUrl)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </IconBtn>
                      )}
                      <IconBtn
                        title={t(locale, "library.openFolder")}
                        onClick={() => getDesktopApi().openFile(entry.filePath)}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        title={t(locale, "library.remove")}
                        danger
                        onClick={() => remove(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {entries.length > 0 && (
            <p className="mt-5 text-center text-xs text-white/30">{t(locale, "library.dragHint")}</p>
          )}
        </>
      )}
    </PageShell>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={
        "flex h-8 w-8 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/8 " +
        (danger ? "hover:text-red-300" : "hover:text-cyan-300")
      }
    >
      {children}
    </button>
  );
}
