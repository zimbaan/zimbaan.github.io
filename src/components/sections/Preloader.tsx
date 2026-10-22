import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import { prefersReducedMotion } from "../../lib/env";
import { lockScroll } from "../../lib/scroll";

const KEY = "kapil:booted";
const LINES = ["> loading model weights...", "> warming up embeddings...", "> initializing kapil.ai"];

const shouldShow = () => {
  if (prefersReducedMotion()) return false;
  try {
    return !sessionStorage.getItem(KEY);
  } catch {
    return true;
  }
};

/** Terminal-style boot screen on the first visit of a session. Click or press any key to skip. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(shouldShow);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Hand over from the static boot frame in index.html.
    document.getElementById("boot")?.remove();
    if (!visible) {
      onDone();
      return;
    }
    lockScroll(true);
    const finish = () => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* storage unavailable: the loader will just show again next time */
      }
      lockScroll(false);
      setVisible(false);
    };
    const controls = animate(0, 100, {
      duration: 1,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setProgress(Math.round(v)),
      onComplete: () => window.setTimeout(finish, 120),
    });
    const skip = () => {
      controls.stop();
      finish();
    };
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      controls.stop();
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
    // onDone is stable for the lifetime of the app, so it is left out of the deps.
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-[110] flex flex-col justify-between bg-bg p-6 font-mono text-sm sm:p-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="space-y-2 text-muted">
            {LINES.map((line, i) => (
              <motion.p
                key={line}
                // The first line is already on screen in the static boot frame.
                initial={i === 0 ? false : { clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.35, delay: (i - 1) * 0.3, ease: "linear" }}
                className={i === LINES.length - 1 ? "text-fg" : undefined}
              >
                {line}
              </motion.p>
            ))}
          </div>
          <div className="flex items-end justify-between gap-6">
            <p className="text-xs text-muted">Click anywhere to skip</p>
            <p className="font-display text-[clamp(4rem,16vw,11rem)] leading-none font-semibold tracking-tighter tabular-nums">
              {progress}
              <span className="text-accent">%</span>
            </p>
          </div>
          <motion.div
            className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-accent to-accent-2"
            style={{ scaleX: progress / 100 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
