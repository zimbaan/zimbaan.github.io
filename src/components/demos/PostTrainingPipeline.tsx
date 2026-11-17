import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { CheckCircle2, Database, FlaskConical, GitCompareArrows, Play, Sparkles, Target, XCircle } from "lucide-react";
import { ease } from "../../lib/motion";

const STAGES = [
  {
    icon: Database,
    title: "Spider data",
    detail: "8,659 training questions over 200 SQLite databases. 2,000 are held out for preference mining.",
  },
  {
    icon: Sparkles,
    title: "LoRA SFT",
    detail: "Qwen2.5-Coder-0.5B-Instruct with TRL's SFTTrainer. Loss only on the SQL answer tokens.",
  },
  {
    icon: Play,
    title: "Sample + execute",
    detail: "The SFT model writes 8 queries per held-out question. Each one runs in a read-only SQLite sandbox.",
  },
  {
    icon: GitCompareArrows,
    title: "Preference pairs",
    detail: "Queries whose result matches the gold answer become chosen; wrong ones become rejected.",
  },
  {
    icon: Target,
    title: "DPO",
    detail: "Continues from the SFT adapter, with a frozen copy of it as the reference model.",
  },
  {
    icon: FlaskConical,
    title: "Evaluate",
    detail: "Execution accuracy on 1,034 Spider dev questions, broken down by query type.",
  },
];

const PAIR = {
  question: "How many singers are older than 30?",
  chosen: "SELECT count(*) FROM singer WHERE age > 30",
  rejected: "SELECT count(name) FROM singer WHERE age >= 30",
};

// Measured execution accuracy on all 1,034 Spider dev questions (one run, Kaggle T4).
const RUNS = [
  { name: "Base", note: "no training", acc: 45.5 },
  { name: "SFT 25%", note: "data-size ablation", acc: 56.0 },
  { name: "SFT", note: "full SFT split", acc: 58.3 },
  { name: "SFT, all data", note: "control for DPO", acc: 59.4 },
  { name: "SFT + DPO", note: "execution-verified pairs", acc: 61.3, best: true },
];

/** The SFT -> execution-verified DPO loop as a stepped diagram, plus the experiment grid. */
export function PostTrainingPipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused || reduced) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % STAGES.length), 2200);
    return () => window.clearTimeout(t);
  }, [inView, paused, reduced, active]);

  const pick = (i: number) => {
    setPaused(true);
    setActive(i);
  };

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-line bg-[#08080a]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-xs text-muted">text2sql-post-training</span>
        </div>
        <span className="whitespace-nowrap rounded-full border border-accent-2/30 bg-accent-2/10 px-2 py-0.5 font-mono text-[10px] text-accent-2">
          Training loop
        </span>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ol className="relative space-y-1.5" aria-label="Pipeline stages">
          {STAGES.map((s, i) => {
            const on = i === active;
            const done = i < active;
            const Icon = s.icon;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-current={on ? "step" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-300 ${
                    on
                      ? "border-accent-2/50 bg-accent/15"
                      : done
                        ? "border-line bg-white/[0.03]"
                        : "border-line bg-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-300 ${
                      on ? "bg-accent-2/20 text-accent-2" : done ? "bg-accent/15 text-accent" : "bg-white/5 text-muted"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] text-muted">0{i + 1}</span>
                    <span className={`block text-sm ${on ? "text-fg" : "text-fg/75"}`}>{s.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex min-h-[18rem] flex-col gap-4">
          <motion.div
            key={active}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="rounded-xl border border-line bg-white/[0.02] p-4"
          >
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
              Stage 0{active + 1} · {STAGES[active].title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-fg/85">{STAGES[active].detail}</p>
          </motion.div>

          <div className="rounded-xl border border-line p-4">
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Example pair (illustrative)</p>
            <p className="mt-2 text-sm text-fg/80">{PAIR.question}</p>
            <div className="mt-3 space-y-2 font-mono text-[11.5px]">
              <p className="flex gap-2 rounded-lg bg-ok/10 px-2.5 py-1.5 text-fg/90">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-ok" aria-label="chosen" />
                <span className="break-words">{PAIR.chosen}</span>
              </p>
              <p className="flex gap-2 rounded-lg bg-bad/10 px-2.5 py-1.5 text-fg/70">
                <XCircle className="mt-0.5 size-3.5 shrink-0 text-bad" aria-label="rejected" />
                <span className="break-words">{PAIR.rejected}</span>
              </p>
            </div>
            <p className="mt-2 text-[11px] text-muted">The label comes from running both queries, not from a judge model.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-line p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">Results</p>
          <p className="font-mono text-[10px] text-muted">execution accuracy · Spider dev · 1,034 questions</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {RUNS.map((r) => (
            <div
              key={r.name}
              className={`rounded-xl border px-3 py-2.5 ${
                r.best ? "border-accent-2/50 bg-accent/15" : "border-line bg-white/[0.02]"
              }`}
            >
              <p className={`font-display text-xl font-semibold tracking-tight ${r.best ? "text-accent-2" : "text-fg"}`}>
                {r.acc.toFixed(1)}%
              </p>
              <p className="mt-1 text-sm text-fg/85">{r.name}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">{r.note}</p>
              <div className="mt-2 h-1 rounded-full bg-white/10" aria-hidden="true">
                <div
                  className={`h-1 rounded-full ${r.best ? "bg-accent-2" : "bg-accent/70"}`}
                  style={{ width: `${r.acc}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
