export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* soft color glows */}
      <div className="orb-a absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-500/12 blur-[130px]" />
      <div className="orb-b absolute -right-48 top-1/3 h-[560px] w-[560px] rounded-full bg-violet-600/12 blur-[140px]" />
      <div className="absolute bottom-[-12rem] left-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-600/8 blur-[130px]" />

      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)",
        }}
      />

      {/* top sheen */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.03] to-transparent" />
    </div>
  );
}
