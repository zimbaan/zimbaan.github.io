import type Lenis from "lenis";
import { prefersReducedMotion } from "./env";

let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};

/** Smooth-scroll to a section id (or "top") and move focus there for keyboard users. */
export function scrollToId(id: string) {
  const el = id === "top" ? null : document.getElementById(id);
  const focus = () => {
    if (!el) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };
  if (lenis) {
    lenis.scrollTo(el ?? 0, { duration: 1.4, onComplete: focus });
    return;
  }
  const behavior = prefersReducedMotion() ? "auto" : "smooth";
  if (el) el.scrollIntoView({ behavior });
  else window.scrollTo({ top: 0, behavior });
  focus();
}

let locks = 0;

/**
 * Reference-counted scroll lock: overlays can stack (e.g. ⌘K over a project modal), and the
 * page only unlocks when the last one closes.
 */
export function lockScroll(locked: boolean) {
  locks = Math.max(0, locks + (locked ? 1 : -1));
  const lock = locks > 0;
  if (lenis) {
    if (lock) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = lock ? "hidden" : "";
}

/** Lenis may be created after an overlay locked the page; keep it in sync. */
export const isScrollLocked = () => locks > 0;
