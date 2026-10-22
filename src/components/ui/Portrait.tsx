import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { portrait, profile } from "../../data/resume";
import { ease } from "../../lib/motion";

/** Corner brackets around the face, styled like an object-detection overlay. */
function DetectionBox({ show }: { show: boolean }) {
  const corner = "absolute size-5 border-accent-2";
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute top-[10.5%] left-[27%] h-[41.5%] w-[45%]"
      initial={{ opacity: 0, scale: 1.12 }}
      animate={show ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.9, ease, delay: 0.6 }}
    >
      <span className={`${corner} top-0 left-0 rounded-tl-md border-t-2 border-l-2`} />
      <span className={`${corner} top-0 right-0 rounded-tr-md border-t-2 border-r-2`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-md border-b-2 border-l-2`} />
      <span className={`${corner} right-0 bottom-0 rounded-br-md border-r-2 border-b-2`} />
      <span className="absolute -top-7 left-0 rounded-md border border-accent-2/30 bg-bg/70 px-2 py-0.5 font-mono text-[10px] text-accent-2">
        kapil · 0.99
      </span>
    </motion.div>
  );
}

/**
 * Colour-graded portrait: blurred 20px preview while loading (so slow connections never
 * show an empty box), a gentle scroll parallax, and a one-time "scan" when it first appears.
 */
export function Portrait() {
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();
  const inView = useInView(frame, { once: true, margin: "0px 0px -20% 0px" });
  const { scrollYProgress } = useScroll({ target: frame, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-4%", "4%"]);

  // A cached image can finish loading before React attaches onLoad.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth) setLoaded(true);
  }, []);

  const reveal = inView && loaded;

  return (
    <figure className="relative mx-auto w-full max-w-[26rem] lg:max-w-none">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(closest-side,rgb(124_92_255/0.22),transparent)]"
      />
      <div
        ref={frame}
        className="group relative isolate aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-line bg-surface"
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 scale-110 bg-cover bg-center blur-xl transition-opacity duration-700 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
          style={{ backgroundImage: `url(${portrait.placeholder})` }}
        />

        {/* Taller than the frame so the parallax never reveals an edge. */}
        <motion.div style={{ y }} className="absolute inset-x-0 -top-[5%] -bottom-[5%]">
          <picture>
            <source
              type="image/webp"
              srcSet={portrait.webp}
              sizes="(min-width: 1024px) 36vw, (min-width: 640px) 26rem, 92vw"
            />
            <img
              ref={img}
              src={portrait.jpg}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={`size-full object-cover transition-[opacity,scale] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] ${
                loaded ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"
              }`}
            />
          </picture>
          <DetectionBox show={reveal} />
        </motion.div>

        {reveal && !reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-accent-2/15 to-transparent"
            initial={{ top: "-25%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
          />
        )}

        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="font-display text-xl font-semibold tracking-tight">{profile.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-muted">AI/ML Engineer · LLM &amp; RAG</p>
        </figcaption>
      </div>
    </figure>
  );
}
