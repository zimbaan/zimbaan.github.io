import { useEffect, useRef, useState } from "react";
import { portrait, profile } from "../../data/resume";

// The cutout is taller than it is wide (≈ 0.91:1), so on a square card the head rises ~10% above the
// top edge. The image box shares the card's sides and bottom, so clipping just rounds those corners.
const CLIP = "inset(0 round 0 0 1.75rem 1.75rem)";
// Fade the suit out at the bottom and where the original photo cut the arms at the sides.
const FADE =
  "linear-gradient(to bottom, #000 62%, transparent 97%), linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)";

/**
 * Background-removed portrait on a lit studio-style backdrop. A blurred silhouette shows
 * while the photo loads, so slow connections never see an empty card.
 */
export function Portrait() {
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // A cached image can finish loading before React attaches onLoad.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth) setLoaded(true);
  }, []);

  const imageStyle = {
    clipPath: CLIP,
    WebkitMaskImage: FADE,
    maskImage: FADE,
    WebkitMaskComposite: "source-in",
    maskComposite: "intersect",
  } as const;

  return (
    <figure className="group relative mx-auto w-full max-w-[26rem] pt-[11%] lg:max-w-none">
      <div className="relative aspect-square">
        {/* Backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden rounded-[1.75rem] border border-line bg-surface"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgb(124_92_255/0.5),transparent_62%),radial-gradient(circle_at_88%_92%,rgb(34_211_238/0.16),transparent_48%)]" />
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(circle_at_50%_40%,#000,transparent_70%)]" />
          {/* Orbit rings centred behind the head */}
          {[56, 82, 108].map((size) => (
            <div
              key={size}
              className="absolute top-[30%] left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]"
              style={{ width: `${size}%` }}
            />
          ))}
          <div className="absolute top-[30%] left-1/2 aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 animate-[spin_24s_linear_infinite] motion-reduce:animate-none">
            <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-2 shadow-[0_0_12px_3px_rgb(34_211_238/0.6)]" />
          </div>
        </div>

        {/* Blurred silhouette while loading */}
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 bg-cover bg-bottom blur-lg transition-opacity duration-700 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
          style={{
            aspectRatio: `${portrait.width} / ${portrait.height}`,
            backgroundImage: `url(${portrait.placeholder})`,
            ...imageStyle,
          }}
        />

        <img
          ref={img}
          src={portrait.src}
          srcSet={portrait.srcSet}
          sizes="(min-width: 1024px) 36vw, (min-width: 640px) 26rem, 92vw"
          alt={portrait.alt}
          width={portrait.width}
          height={portrait.height}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={imageStyle}
          className={`absolute inset-x-0 bottom-0 h-auto w-full origin-bottom transition-[opacity,translate,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:scale-[1.015] ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        />

        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">{profile.name}</p>
            <p className="mt-0.5 font-mono text-[11px] text-fg/60">AI/ML Engineer · LLM &amp; RAG</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-bg/70 px-2.5 py-1 font-mono text-[10px] text-fg/70">
            <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" />
            Turing AI
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
