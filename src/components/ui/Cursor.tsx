import { useEffect, useRef, useState } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/env";

const INTERACTIVE = "a, button, [role='button'], [data-cursor], input, label, summary";

/** Dot + lagging ring cursor. Only mounts on fine pointers without reduced motion. */
export function Cursor() {
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion());
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const ringInner = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let seen = false;
    let raf = 0;

    const setVisible = (v: boolean) => {
      if (dot.current) dot.current.style.opacity = v ? "1" : "0";
      if (ring.current) ring.current.style.opacity = v ? "1" : "0";
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        rx = x;
        ry = y;
        setVisible(true);
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE);
      const text = target?.dataset.cursor ?? "";
      const inner = ringInner.current;
      if (!inner || !label.current) return;
      // Small SVG targets (skill pills) get a hollow ring so the label stays readable.
      inner.dataset.hover = !target ? "false" : target instanceof SVGElement ? "ring" : "true";
      inner.dataset.label = text ? "true" : "false";
      label.current.textContent = text;
      if (dot.current) dot.current.style.scale = target ? "0" : "1";
    };

    const onDown = () => ringInner.current?.style.setProperty("scale", "0.85");
    const onUp = () => ringInner.current?.style.setProperty("scale", "1");
    const onLeave = () => setVisible(false);
    const onEnter = () => seen && setVisible(true);

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={ring} className="absolute top-0 left-0 opacity-0 transition-opacity duration-300 will-change-transform">
        <div
          ref={ringInner}
          data-hover="false"
          data-label="false"
          className="grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 mix-blend-difference transition-[width,height,background-color,border-color,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[hover=true]:size-14 data-[hover=true]:border-transparent data-[hover=true]:bg-white data-[hover=ring]:size-12 data-[hover=ring]:border-white/90 data-[label=true]:size-20 data-[label=true]:bg-accent data-[label=true]:mix-blend-normal"
        >
          <span ref={label} className="font-mono text-[11px] font-medium tracking-wide text-white uppercase" />
        </div>
      </div>
      <div
        ref={dot}
        className="absolute top-0 left-0 opacity-0 transition-[opacity,scale] duration-200 will-change-transform"
      >
        <div className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference" />
      </div>
    </div>
  );
}
