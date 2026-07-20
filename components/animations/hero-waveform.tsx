"use client";

import { useEffect, useRef } from "react";

export function HeroWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = canvas.width = parent.clientWidth;
      h = canvas.height = parent.clientHeight;
    };

    const draw = () => {
      t += 0.04;
      ctx.clearRect(0, 0, w, h);

      const barCount = Math.floor(w / 5);
      const gap = w / barCount;

      for (let i = 0; i < barCount; i++) {
        const x = i * gap + gap / 2;
        const norm = i / barCount;
        const h1 = Math.sin(t + norm * 12) * 0.3;
        const h2 = Math.sin(t * 1.7 + norm * 8) * 0.25;
        const h3 = Math.sin(t * 0.6 + norm * 20) * 0.2;
        const barH = (h1 + h2 + h3 + 0.55) * h * 0.85;

        const grad = ctx.createLinearGradient(0, h - barH, 0, h);
        grad.addColorStop(0, "rgba(0, 240, 255, 0.9)");
        grad.addColorStop(0.5, "rgba(191, 90, 242, 0.7)");
        grad.addColorStop(1, "rgba(255, 45, 120, 0.4)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x - gap * 0.2, h - barH, gap * 0.4, barH, 1);
        ctx.fill();

        // Reflection
        ctx.fillStyle = `rgba(0, 240, 255, ${0.05 + norm * 0.05})`;
        ctx.fillRect(x - gap * 0.2, h, gap * 0.4, 2);
      }

      // Center line
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-hidden
    />
  );
}
