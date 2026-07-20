export function StaticAmbientBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[#030308]">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,240,255,0.1)_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(191,90,242,0.08)_0%,transparent_50%)]" />
    </div>
  );
}
