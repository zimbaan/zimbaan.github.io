const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Fixed grid behind everything + a film-grain overlay on top. */
export function Background() {
  return (
    <>
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none fixed inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_100%)]"
      />
      {/* Grain is skipped on small screens: a full-screen overlay costs a compositing pass every frame. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] hidden opacity-[0.035] md:block"
        style={{ backgroundImage: NOISE, backgroundSize: "200px 200px" }}
      />
    </>
  );
}

/** Soft colour glow used behind sections (static: animating huge layers costs frames). */
export function Glow({ className = "", color = "accent" }: { className?: string; color?: "accent" | "accent-2" }) {
  const c = color === "accent" ? "124 92 255" : "34 211 238";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -z-10 aspect-square rounded-full ${className}`}
      style={{ background: `radial-gradient(circle, rgb(${c} / 0.16), transparent 65%)` }}
    />
  );
}
