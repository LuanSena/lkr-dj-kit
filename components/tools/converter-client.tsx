"use client";

import dynamic from "next/dynamic";

const ConverterTool = dynamic(
  () => import("@/components/tools/converter-tool").then((m) => m.ConverterTool),
  {
    ssr: false,
    loading: () => (
      <p className="animate-pulse py-12 text-center font-mono-tech text-xs text-cyan-400/50">
        Loading engine...
      </p>
    ),
  }
);

export function ConverterClient() {
  return <ConverterTool />;
}
