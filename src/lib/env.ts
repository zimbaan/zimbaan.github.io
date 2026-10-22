export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/** Data Saver on, or a 2G/3G-class connection (Chromium browsers report this). */
export const isSlowConnection = () => {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  return !!c && (c.saveData === true || /2g|3g/.test(c.effectiveType ?? ""));
};

/** Small screens, few CPU cores or a slow connection get the lightweight 2D hero instead of WebGL. */
export const isLowPower = () =>
  typeof window !== "undefined" &&
  (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4 || isSlowConnection());

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
