export function HudCorners({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l border-t border-cyan-400/60" />
      <span className="pointer-events-none absolute -right-px -top-px h-4 w-4 border-r border-t border-cyan-400/60" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-4 w-4 border-b border-l border-cyan-400/60" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b border-r border-cyan-400/60" />
      {children}
    </div>
  );
}
