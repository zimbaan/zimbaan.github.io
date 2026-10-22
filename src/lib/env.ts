export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Small screens or few CPU cores get a lighter 3D scene. */
export const isLowPower = () =>
  typeof window !== "undefined" && (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4);

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
