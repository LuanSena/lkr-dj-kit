"use client";

import { motion } from "framer-motion";

const telemetry = [
  { label: "SYNC", value: "LOCKED", color: "text-emerald-400" },
  { label: "BPM", value: "128.0", color: "text-cyan-400" },
  { label: "KEY", value: "Am", color: "text-violet-400" },
  { label: "GAIN", value: "+0.0dB", color: "text-pink-400" },
];

export function HeroHudOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {/* Viewport frame */}
      <div className="absolute left-3 top-3 h-8 w-8 border-l-2 border-t-2 border-cyan-400/40 sm:left-6 sm:top-6 sm:h-12 sm:w-12" />
      <div className="absolute right-3 top-3 h-8 w-8 border-r-2 border-t-2 border-cyan-400/40 sm:right-6 sm:top-6 sm:h-12 sm:w-12" />
      <div className="absolute bottom-3 left-3 h-8 w-8 border-b-2 border-l-2 border-violet-400/40 sm:bottom-6 sm:left-6 sm:h-12 sm:w-12" />
      <div className="absolute bottom-3 right-3 h-8 w-8 border-b-2 border-r-2 border-violet-400/40 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12" />

      {/* Top telemetry bar */}
      <div className="absolute left-1/2 top-4 hidden -translate-x-1/2 items-center gap-6 sm:flex sm:top-6">
        {telemetry.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-center gap-2 border border-white/5 bg-black/30 px-3 py-1 backdrop-blur-sm"
          >
            <span className="font-mono-tech text-[9px] tracking-widest text-white/25">{item.label}</span>
            <span className={`font-mono-tech text-[10px] font-bold ${item.color}`}>{item.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Side readouts */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute left-4 top-1/3 hidden flex-col gap-1 font-mono-tech text-[8px] tracking-widest text-white/20 lg:flex"
      >
        <span className="text-cyan-400/40">AUDIO_ENGINE</span>
        <span>STATUS: ACTIVE</span>
        <span>BUFFER: 512</span>
        <span>SAMPLE: 48kHz</span>
        <span className="mt-2 text-violet-400/40">MODULES</span>
        <span>DL_CORE v2.1</span>
        <span>FFMPEG_WASM</span>
        <span>STREAM_API</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9 }}
        className="absolute right-4 top-1/3 hidden flex-col items-end gap-1 font-mono-tech text-[8px] tracking-widest text-white/20 lg:flex"
      >
        <span className="text-pink-400/40">NETWORK</span>
        <span>EDGE: VERCEL</span>
        <span>LATENCY: 42ms</span>
        <span>UPTIME: 99.9%</span>
        <span className="mt-2 text-cyan-400/40">SECURITY</span>
        <span>NO_STORAGE</span>
        <span>LOCAL_CONV</span>
        <span>ENCRYPTED</span>
      </motion.div>

      {/* Mobile telemetry strip */}
      <div className="absolute inset-x-4 top-4 flex justify-between sm:hidden">
        <span className="font-mono-tech text-[8px] tracking-widest text-cyan-400/50">BPM 128</span>
        <span className="font-mono-tech text-[8px] tracking-widest text-emerald-400/50">SYNC OK</span>
        <span className="font-mono-tech text-[8px] tracking-widest text-violet-400/50">48kHz</span>
      </div>
    </div>
  );
}
