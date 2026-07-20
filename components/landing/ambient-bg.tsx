import { ParticleField } from "@/components/animations/particle-field";

export function AmbientBg() {
  return (
    <>
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 tech-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,240,255,0.08)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(191,90,242,0.06)_0%,transparent_50%)]" />
      </div>
    </>
  );
}
