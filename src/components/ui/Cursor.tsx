import { useEffect, useRef, useState } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/env";

const INTERACTIVE = "a, button, [role='button'], [data-cursor], input, label, summary";

type CursorState = "default" | "link" | "label";

/**
 * Dot + ring cursor (fine pointers only, off with reduced motion).
 * - The dot is moved inside the pointer event itself, so it never waits a frame behind the mouse.
 * - The ring follows with a fast, frame-rate-independent ease and stretches along its direction of travel.
 * - Everything animates with transforms only and without blend modes, so it stays cheap over the WebGL hero.
 */
export function Cursor() {
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion());
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ringPos = useRef<HTMLDivElement>(null);
  const ringStretch = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let seen = false;
    let state: CursorState = "default";
    let raf = 0;
    let last = performance.now();

    const setState = (next: CursorState, text = "") => {
      state = next;
      root.current?.setAttribute("data-state", next);
      if (label.current) label.current.textContent = text;
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!seen) {
        seen = true;
        rx = x;
        ry = y;
        root.current?.setAttribute("data-visible", "true");
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE);
      if (!target) setState("default");
      else if (target.dataset.cursor?.trim()) setState("label", target.dataset.cursor);
      else setState("link");
    };

    const onDown = () => root.current?.setAttribute("data-down", "true");
    const onUp = () => root.current?.removeAttribute("data-down");
    const onLeave = () => root.current?.setAttribute("data-visible", "false");
    const onEnter = () => seen && root.current?.setAttribute("data-visible", "true");

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // ~45 ms time constant: responsive, still smooth.
      const k = 1 - Math.exp(-dt * 22);
      const dx = x - rx;
      const dy = y - ry;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        rx += dx * k;
        ry += dy * k;
        if (ringPos.current) ringPos.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        if (ringStretch.current) {
          const stretch = state === "default" ? Math.min(Math.hypot(dx, dy) / 160, 0.3) : 0;
          ringStretch.current.style.transform = `rotate(${Math.atan2(dy, dx)}rad) scale(${1 + stretch}, ${1 - stretch * 0.55})`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    html.addEventListener("mouseleave", onLeave);
    html.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("mouseleave", onLeave);
      html.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-state="default"
      data-visible="false"
      className="group/cursor pointer-events-none fixed inset-0 z-[100] opacity-0 transition-opacity duration-300 data-[visible=true]:opacity-100"
    >
      {/* Press feedback lives on this wrapper so it never fights the hover scale below. */}
      <div
        ref={ringPos}
        className="absolute top-0 left-0 transition-[scale] duration-200 will-change-transform group-data-[down=true]/cursor:scale-75"
      >
        <div ref={ringStretch} className="will-change-transform">
          <div className="size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 bg-white/[0.02] transition-[scale,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=label]/cursor:scale-[2.3] group-data-[state=label]/cursor:border-transparent group-data-[state=label]/cursor:bg-accent group-data-[state=link]/cursor:scale-[1.55] group-data-[state=link]/cursor:border-accent-2/70 group-data-[state=link]/cursor:bg-accent-2/[0.08]" />
        </div>
        <span
          ref={label}
          className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] font-medium tracking-wider whitespace-nowrap text-white uppercase opacity-0 transition-opacity duration-200 group-data-[state=label]/cursor:opacity-100"
        />
      </div>
      <div ref={dot} className="absolute top-0 left-0 will-change-transform">
        <div className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-2 shadow-[0_0_10px_2px_rgb(34_211_238/0.6)] transition-[scale] duration-200 group-data-[state=label]/cursor:scale-0 group-data-[state=link]/cursor:scale-0" />
      </div>
    </div>
  );
}
