import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bug, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { PY_KEYWORDS, tokenize } from "../../lib/highlight";
import { ease } from "../../lib/motion";

const BUGGY = [
  "def average_scores(scores):",
  "    total = 0",
  "    for i in range(1, len(scores)):",
  "        total += scores[i]",
  "    return total / len(scores)",
  "",
  "print(average_scores([]))",
];
const ERROR_LINE = 4; // zero-based: "return total / len(scores)"
const LOGIC_LINE = 2; // zero-based: the off-by-one loop

type DiffLine = { kind: "ctx" | "add" | "del"; text: string };
const DIFF: DiffLine[] = [
  { kind: "ctx", text: "def average_scores(scores):" },
  { kind: "add", text: "    if not scores:" },
  { kind: "add", text: "        return 0.0" },
  { kind: "ctx", text: "    total = 0" },
  { kind: "del", text: "    for i in range(1, len(scores)):" },
  { kind: "add", text: "    for i in range(len(scores)):" },
  { kind: "ctx", text: "        total += scores[i]" },
  { kind: "ctx", text: "    return total / len(scores)" },
  { kind: "ctx", text: "" },
  { kind: "ctx", text: "print(average_scores([]))" },
];

const EXPLANATION =
  "Found 2 issues. Line 5: an empty list makes len(scores) zero, which raises ZeroDivisionError, so the function now returns 0.0 early. Line 3: range(1, len(scores)) skips the first score; range(len(scores)) includes every element.";

const ANALYSIS_STEPS = [
  "building LangChain prompt template",
  "POST /api/debug → Express",
  "StarCoder is reasoning about the code",
];

function Code({ text }: { text: string }) {
  return (
    <>
      {tokenize(text, PY_KEYWORDS).map((t, i) => (
        <span key={i} className={t.c ? `tok-${t.c}` : undefined}>
          {t.t}
        </span>
      ))}
    </>
  );
}

function PaneHeader({ name, tone }: { name: string; tone?: "bad" | "ok" }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[11px]">
      <span className="text-muted">{name}</span>
      {tone === "bad" && <span className="text-bad">1 error</span>}
      {tone === "ok" && <span className="text-ok">fixed</span>}
    </div>
  );
}

type Phase = "idle" | "scanning" | "fixed";

/** Scripted demo: buggy Python → scan → diff + explanation. */
export function CodeDebugger() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);
  const reduced = useReducedMotion();
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const debug = () => {
    clearTimers();
    setTyped(0);
    setStep(0);
    if (reduced) {
      setPhase("fixed");
      setTyped(EXPLANATION.length);
      return;
    }
    setPhase("scanning");
    ANALYSIS_STEPS.forEach((_, i) => timers.current.push(window.setTimeout(() => setStep(i + 1), 450 * (i + 1))));
    timers.current.push(window.setTimeout(() => setPhase("fixed"), 1900));
  };

  const reset = () => {
    clearTimers();
    setPhase("idle");
    setTyped(0);
    setStep(0);
  };

  // Type out the explanation once the diff has landed.
  useEffect(() => {
    if (phase !== "fixed" || typed >= EXPLANATION.length) return;
    const t = window.setTimeout(() => setTyped((n) => Math.min(EXPLANATION.length, n + 3)), typed === 0 ? 700 : 16);
    return () => window.clearTimeout(t);
  }, [phase, typed]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#08080a]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-xs text-muted">ai-code-debugger</span>
        </div>
        <span className="rounded-full border border-accent-2/30 bg-accent-2/10 px-2 py-0.5 font-mono text-[10px] text-accent-2">
          Simulated demo
        </span>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Buggy input */}
        <div className="relative border-b border-line md:border-r md:border-b-0">
          <PaneHeader name="average.py" tone="bad" />
          <div className="relative overflow-hidden">
            <pre className="overflow-x-auto py-3 font-mono text-[11.5px] leading-[1.75] sm:text-[12px]">
              {BUGGY.map((line, i) => {
                const isError = i === ERROR_LINE;
                const isLogic = i === LOGIC_LINE && phase === "fixed";
                return (
                  <div
                    key={i}
                    className={`relative flex pr-4 ${isError ? "bg-bad/10" : isLogic ? "bg-amber-400/10" : ""}`}
                  >
                    {isError && (
                      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 animate-pulse bg-bad" />
                    )}
                    {isLogic && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-amber-400" />}
                    <span className="w-9 shrink-0 pr-3 text-right text-white/20 select-none">{i + 1}</span>
                    <code className="whitespace-pre">
                      <Code text={line} />
                    </code>
                  </div>
                );
              })}
            </pre>
            <AnimatePresence>
              {phase === "scanning" && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-accent-2/25 to-transparent"
                  initial={{ top: "-20%" }}
                  animate={{ top: ["-20%", "100%"] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.95, ease: "easeInOut", repeat: 1 }}
                />
              )}
            </AnimatePresence>
          </div>
          <div className="border-t border-line px-4 py-3 font-mono text-[11px] leading-relaxed">
            <p className="text-muted">$ python average.py</p>
            <p className="text-bad">ZeroDivisionError: division by zero</p>
            <p className="text-white/30"> File "average.py", line 5</p>
          </div>
        </div>

        {/* Fix output */}
        <div className="relative flex min-h-[18rem] flex-col">
          <PaneHeader name="fix.diff" tone={phase === "fixed" ? "ok" : undefined} />
          <div className="relative flex-1">
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div
                  key="idle"
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
                >
                  <p className="max-w-[16rem] text-sm text-muted">
                    Send this snippet to StarCoder and get a fix with an explanation.
                  </p>
                  <button
                    type="button"
                    onClick={debug}
                    className="group relative isolate inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-accent/50"
                    />
                    <Bug className="size-4" /> Debug with StarCoder
                  </button>
                </motion.div>
              )}
              {phase === "scanning" && (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 p-4 font-mono text-[11.5px]"
                >
                  {ANALYSIS_STEPS.slice(0, step).map((s) => (
                    <motion.p
                      key={s}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-muted"
                    >
                      <span className="text-accent-2">→</span> {s}
                    </motion.p>
                  ))}
                  <p className="flex items-center gap-2 text-fg/80">
                    <Loader2 className="size-3.5 animate-spin text-accent" /> analyzing…
                  </p>
                </motion.div>
              )}
              {phase === "fixed" && (
                <motion.pre
                  key="diff"
                  className="overflow-x-auto py-3 font-mono text-[11.5px] leading-[1.75] sm:text-[12px]"
                >
                  {DIFF.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, ease, delay: i * 0.05 }}
                      className={`flex pr-4 ${
                        line.kind === "add"
                          ? "bg-ok/10"
                          : line.kind === "del"
                            ? "bg-bad/10 line-through decoration-bad/40"
                            : ""
                      }`}
                    >
                      <span
                        className={`w-7 shrink-0 text-center select-none ${
                          line.kind === "add" ? "text-ok" : line.kind === "del" ? "text-bad" : "text-white/20"
                        }`}
                      >
                        {line.kind === "add" ? "+" : line.kind === "del" ? "−" : " "}
                      </span>
                      <code className="whitespace-pre">
                        <Code text={line.text} />
                      </code>
                    </motion.div>
                  ))}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-start">
        <div className="flex min-h-[4.5rem] flex-1 gap-3 text-sm leading-relaxed">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          {phase === "fixed" ? (
            <p className="text-fg/85">
              {EXPLANATION.slice(0, typed)}
              {typed < EXPLANATION.length && (
                <span className="ml-0.5 inline-block h-[1em] w-[0.45em] translate-y-[0.15em] bg-accent-2" />
              )}
            </p>
          ) : (
            <p className="text-muted">The explanation from the model will appear here.</p>
          )}
        </div>
        <button
          type="button"
          onClick={phase === "idle" ? debug : reset}
          disabled={phase === "scanning"}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line px-4 py-2 text-xs text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-40"
        >
          {phase === "idle" ? <Bug className="size-3.5" /> : <RotateCcw className="size-3.5" />}
          {phase === "idle" ? "Run debugger" : "Reset"}
        </button>
      </div>
    </div>
  );
}
