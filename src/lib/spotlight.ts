import type { PointerEvent } from "react";

const queued = new WeakMap<HTMLElement, { x: number; y: number }>();

/**
 * onPointerMove handler that feeds the cursor position to the .spotlight CSS.
 * Batched to one style write per animation frame however fast the pointer events arrive.
 */
export function trackSpotlight(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const scheduled = queued.has(el);
  queued.set(el, { x: e.clientX, y: e.clientY });
  if (scheduled) return;
  requestAnimationFrame(() => {
    const p = queued.get(el);
    queued.delete(el);
    if (!p) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${p.x - rect.left}px`);
    el.style.setProperty("--my", `${p.y - rect.top}px`);
  });
}
