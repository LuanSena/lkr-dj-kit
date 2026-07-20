"use client";

import dynamic from "next/dynamic";

const DownloaderForm = dynamic(
  () => import("@/components/tools/downloader-form").then((m) => m.DownloaderForm),
  {
    loading: () => (
      <p className="animate-pulse py-12 text-center font-mono-tech text-xs text-cyan-400/50">
        Loading...
      </p>
    ),
  }
);

export function DownloaderClient() {
  return <DownloaderForm />;
}
