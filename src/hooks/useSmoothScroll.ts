import { useEffect } from "react";
import Lenis from "lenis";
import { isScrollLocked, setLenis } from "../lib/scroll";
import { prefersReducedMotion } from "../lib/env";

/** Lenis smooth scrolling. It drives the real window scroll, so ScrollTrigger and Motion read it natively. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, autoRaf: true });
    setLenis(lenis);
    if (isScrollLocked()) lenis.stop();
    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, []);
}
