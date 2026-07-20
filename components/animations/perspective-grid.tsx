export function PerspectiveGrid() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[35vh] overflow-hidden opacity-20 sm:h-[45vh] sm:opacity-30">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          transformOrigin: "center bottom",
          transform: "perspective(600px) rotateX(65deg)",
          height: "200%",
          bottom: 0,
        }}
      />
    </div>
  );
}
