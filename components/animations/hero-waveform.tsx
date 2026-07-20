"use client";

import { useEffect, useRef } from "react";
import { useVisualTier } from "@/lib/hooks/use-visual-tier";
import { usePageVisible } from "@/lib/hooks/use-page-visible";
import { CssWaveform } from "@/components/animations/css-waveform";

export function HeroWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tier = useVisualTier();
  const visible = usePageVisible();

  useEffect(() => {
    if (tier !== "full" || !visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;
    let t = 0;
    let lastFrame = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = canvas.width = parent.clientWidth;
      h = canvas.height = parent.clientHeight;
    };

    const draw = (time: number) => {
      if (time - lastFrame < 80) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;

      t += 0.03;
      ctx.fillStyle = "#030308";
      ctx.fillRect(0, 0, w, h);

      const barCount = Math.min(Math.floor(w / 8), 80);
      const gap = w / barCount;

      for (let i = 0; i < barCount; i++) {
        const x = i * gap + gap / 2;
        const norm = i / barCount;
        const h1 = Math.sin(t + norm * 12) * 0.3;
        const h2 = Math.sin(t * 1.7 + norm * 8) * 0.25;
        const barH = (h1 + h2 + 0.55) * h * 0.8;

        ctx.fillStyle = `rgba(0, 240, 255, ${0.35 + norm * 0.35})`;
        ctx.fillRect(x - gap * 0.18, h - barH, gap * 0.36, barH);
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [tier, visible]);

  if (tier !== "full") {
    return <CssWaveform />;
  }

  return <canvas ref={canvasRef} className="fx-canvas h-full w-full" aria-hidden />;
}
