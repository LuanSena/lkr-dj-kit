"use client";

import { useEffect, useRef } from "react";
import { useVisualTier } from "@/lib/hooks/use-visual-tier";

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lite = useVisualTier() !== "full";

  useEffect(() => {
    if (lite) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;
    let lastFrame = 0;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const init = () => {
      particles.length = 0;
      const count = Math.min(40, Math.floor((w * h) / 20000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const draw = (time: number) => {
      if (time - lastFrame < 66) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastFrame = time;

      ctx.fillStyle = "#030308";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    init();
    animId = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [lite]);

  if (lite) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fx-canvas h-full w-full opacity-60"
      aria-hidden
    />
  );
}
