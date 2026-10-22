import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useTransform, type MotionValue } from "motion/react";
import { Trophy } from "lucide-react";
import { stats, summary, type Stat } from "../../data/resume";
import { trackSpotlight } from "../../lib/spotlight";
import { prefersReducedMotion } from "../../lib/env";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Glow } from "../ui/Background";

const KEYWORDS = new Set(["LLM", "RAG", "natural-language-to-SQL", "LangChain,", "ChromaDB,", "fine-tuning."]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  // Unread words stay above 3:1 contrast for this large text while still reading as "dim"
  // (cyan keywords are darker than white, so they need a slightly higher floor).
  const keyword = KEYWORDS.has(word);
  const opacity = useTransform(progress, range, [keyword ? 0.52 : 0.42, 1]);
  return (
    <motion.span style={{ opacity }} className={keyword ? "text-accent-2" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

/** Paragraph whose words light up one by one as it scrolls through the viewport. */
function ScrollHighlight({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className="font-display text-[clamp(1.35rem,2.6vw,2.1rem)] leading-[1.35] font-medium tracking-tight">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </span>
    </p>
  );
}

function CountUp({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [display, setDisplay] = useState(() =>
    prefersReducedMotion() ? value.toFixed(decimals) : (0).toFixed(decimals),
  );

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return <span ref={ref}>{display}</span>;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  return (
    <Reveal delay={index * 0.08} className="h-full">
      <div
        onPointerMove={trackSpotlight}
        className="card spotlight flex h-full flex-col justify-between gap-6 p-5 sm:p-6"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">0{index + 1}</span>
        <div>
          {stat.kind === "number" ? (
            <p className="font-display text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
              <CountUp value={stat.value} decimals={stat.decimals} />
              {stat.suffix && <span className="text-2xl text-muted sm:text-3xl">{stat.suffix}</span>}
            </p>
          ) : (
            <p className="flex items-center gap-2 font-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
              <Trophy className="size-6 shrink-0 text-accent" aria-hidden="true" />
              {stat.value}
            </p>
          )}
          <p className="mt-2 text-sm text-muted">{stat.label}</p>
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

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ScrollHighlight text={summary} />
            <Reveal delay={0.1}>
              <div className="mt-10 flex items-start gap-4 rounded-2xl border border-line bg-white/[0.02] p-5">
                <span className="relative mt-1.5 flex size-2.5 shrink-0">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-ok" />
                  <span className="relative size-2.5 rounded-full bg-ok" />
                </span>
                <div>
                  <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Now</p>
                  <p className="mt-1 text-fg">Data Analyst at Turing AI</p>
                  <p className="mt-1 text-sm text-muted">
                    Reviewing and correcting model responses for the Gemini AI Code project to support fine-tuning.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-3 self-start sm:gap-4 lg:col-span-5">
            {stats.map((s, i) => (
              <StatCard key={s.label} stat={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
