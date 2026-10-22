import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowDownRight, Download } from "lucide-react";
import { profile } from "../../data/resume";
import { scrollToId } from "../../lib/scroll";
import { isLowPower } from "../../lib/env";
import { ease } from "../../lib/motion";
import { MagneticButton } from "../ui/MagneticButton";
import { ScrambleText } from "../ui/ScrambleText";
import { ErrorBoundary } from "../ui/ErrorBoundary";

// Phones and low-core machines get the dependency-free 2D canvas; everything else gets WebGL.
const HeroCanvas = lazy(() => (isLowPower() ? import("../../three/HeroCanvas2D") : import("../../three/HeroCanvas")));

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const charVariants: Variants = {
  hidden: { y: "110%", rotate: 8 },
  show: (i: number) => ({ y: "0%", rotate: 0, transition: { duration: 1, ease, delay: 0.1 + i * 0.035 } }),
};

function SplitLine({ text, offset, className }: { text: string; offset: number; className?: string }) {
  return (
    <span className={`-mb-[0.06em] block overflow-hidden pb-[0.12em] ${className ?? ""}`} aria-hidden="true">
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          custom={offset + i}
          variants={charVariants}
          className="inline-block origin-bottom-left will-change-transform"
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion();
  const [show3D, setShow3D] = useState(false);

  // Load the WebGL scene only after first paint and the preloader, so it never blocks the text.
  useEffect(() => {
    if (!ready) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      w.requestIdleCallback(() => setShow3D(true), { timeout: 700 });
    } else {
      window.setTimeout(() => setShow3D(true), 250);
    }
  }, [ready]);

  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* Backdrop: static gradient first, WebGL network fades in on top. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_72%_42%,rgb(124_92_255/0.16),transparent_70%),radial-gradient(ellipse_40%_40%_at_85%_70%,rgb(34_211_238/0.08),transparent_70%)]" />
        {show3D && (
          <ErrorBoundary>
            <Suspense fallback={null}>
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
              >
                <HeroCanvas still={!!reduced} />
              </motion.div>
            </Suspense>
          </ErrorBoundary>
        )}
        {/* Keep the text side readable and blend into the next section. */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/40 to-bg lg:bg-[linear-gradient(90deg,var(--color-bg)_0%,rgb(5_5_6/0.85)_32%,transparent_62%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <motion.div
        className="container-x relative pt-32 pb-28 sm:pt-36"
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
      >
        <motion.p
          variants={item}
          className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 font-mono text-[11px] text-muted backdrop-blur-md sm:text-xs"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-ok" />
            <span className="relative size-2 rounded-full bg-ok" />
          </span>
          <span className="sm:hidden">{profile.statusShort}</span>
          <span className="hidden sm:inline">{profile.status}</span>
        </motion.p>

        <h1
          aria-label={profile.name}
          className="mt-7 font-display text-[clamp(3.25rem,11vw,9.5rem)] leading-[0.92] font-semibold tracking-[-0.04em]"
        >
          <SplitLine text={profile.firstName} offset={0} />
          <SplitLine text={profile.lastName} offset={profile.firstName.length} className="text-fg/45" />
        </h1>

        <motion.p variants={item} className="mt-6 font-mono text-base sm:text-xl">
          <span className="text-muted">~/</span>
          <span className="sr-only">{profile.headline}</span>
          <ScrambleText phrases={profile.roles} start={ready} className="text-gradient font-medium" />
          <span
            aria-hidden="true"
            className="ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.18em] animate-pulse bg-accent-2/80"
          />
        </motion.p>

        <motion.p variants={item} className="mt-6 max-w-xl text-lg text-muted text-balance sm:text-xl">
          {profile.tagline}
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
          <MagneticButton onClick={() => scrollToId("projects")} cursor="Go">
            View Projects <ArrowDownRight className="size-4" aria-hidden="true" />
          </MagneticButton>
          <MagneticButton variant="outline" href={profile.resume} download>
            Download Resume <Download className="size-4" aria-hidden="true" />
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => scrollToId("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 font-mono text-[10px] tracking-[0.25em] text-muted uppercase sm:flex"
        aria-label="Scroll to About"
      >
        Scroll
        <span className="relative h-12 w-px overflow-hidden bg-line-strong">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent to-fg"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.button>
    </section>
  );
}
