import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";
import { Trophy } from "lucide-react";
import { stats, summary, type Stat } from "../../data/resume";
import { trackSpotlight } from "../../lib/spotlight";
import { prefersReducedMotion } from "../../lib/env";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Glow } from "../ui/Background";
import { Portrait } from "../ui/Portrait";

/** Renders **highlighted** phrases from the summary copy. */
function Highlighted({ text, lead }: { text: string; lead: boolean }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 0 ? (
          part
        ) : (
          <span
            key={i}
            className={
              lead
                ? "bg-[linear-gradient(90deg,var(--color-accent),var(--color-accent-2))] bg-[length:100%_1px] bg-bottom bg-no-repeat text-fg"
                : "text-fg"
            }
          >
            {part}
          </span>
        ),
      )}
    </>
  );
}

function CountUp({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  // Writes straight to the DOM so the count-up never re-renders React each frame.
  useEffect(() => {
    if (!inView || !ref.current || prefersReducedMotion()) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (el.textContent = v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return <span ref={ref}>{prefersReducedMotion() ? value.toFixed(decimals) : (0).toFixed(decimals)}</span>;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  return (
    <Reveal delay={index * 0.06} className="h-full">
      <div onPointerMove={trackSpotlight} className="card spotlight flex h-full flex-col justify-between gap-5 p-5">
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">0{index + 1}</span>
        <div>
          {stat.kind === "number" ? (
            <p className="font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              <CountUp value={stat.value} decimals={stat.decimals} />
              {stat.suffix && <span className="text-xl text-muted sm:text-2xl">{stat.suffix}</span>}
            </p>
          ) : (
            <p className="flex items-center gap-2 font-display text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
              <Trophy className="size-5 shrink-0 text-accent" aria-hidden="true" />
              {stat.value}
            </p>
          )}
          <p className="mt-1.5 text-sm text-muted">{stat.label}</p>
        </div>
      </div>
    </Reveal>
  );
}

export function About() {
  return (
    <section id="about" className="section">
      <Glow className="top-10 -left-40 w-[42rem]" />
      <div className="container-x">
        <SectionHeading
          index="01"
          label="About"
          lines={[
            "From raw data",
            <>
              to <span className="text-gradient">intelligent</span> systems.
            </>,
          ]}
        />

        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:col-span-5">
            <Portrait />
          </Reveal>

          <div className="lg:col-span-7">
            <div className="space-y-6">
              {summary.map((p, i) => (
                <Reveal key={i} delay={0.05 + i * 0.08}>
                  <p
                    className={
                      i === 0
                        ? "font-display text-[clamp(1.4rem,2.4vw,1.85rem)] leading-snug font-medium tracking-tight text-fg/70"
                        : "max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl"
                    }
                  >
                    <Highlighted text={p} lead={i === 0} />
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <div className="mt-10 flex items-start gap-4 rounded-2xl border border-line bg-white/[0.02] p-5">
                <span className="relative mt-1.5 flex size-2.5 shrink-0">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-ok" />
                  <span className="relative size-2.5 rounded-full bg-ok" />
                </span>
                <div>
                  <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Now</p>
                  <p className="mt-1 text-fg">Data Analyst at Turing AI</p>
                  <p className="mt-1 text-sm text-muted">
                    Reviewing and correcting model responses for the Gemini AI Code project to support LLM fine-tuning.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((s, i) => (
                <StatCard key={s.label} stat={s} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
