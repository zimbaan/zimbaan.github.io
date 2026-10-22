import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { SQL_KEYWORDS, tokenize, type Token } from "../../lib/highlight";
import { sleep } from "../../lib/env";
import { ease } from "../../lib/motion";

type Example = {
  label: string;
  question: string;
  tables: string[];
  sql: string;
  ms: number;
  chart: "bars" | "columns";
  format: (v: number) => string;
  data: { label: string; value: number }[];
};

// Sample data for the simulated demo only.
const EXAMPLES: Example[] = [
  {
    label: "Top customers",
    question: "Top 5 customers by revenue last quarter",
    tables: ["customers", "orders"],
    sql: `SELECT c.name, SUM(o.amount) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.created_at >= '2026-07-01'
  AND o.created_at <  '2026-10-01'
GROUP BY c.id, c.name
ORDER BY revenue DESC
LIMIT 5;`,
    ms: 38,
    chart: "bars",
    format: (v) => `$${v.toFixed(1)}k`,
    data: [
      { label: "Northwind", value: 128.4 },
      { label: "Acme Corp", value: 112.9 },
      { label: "Globex", value: 97.3 },
      { label: "Initech", value: 84.1 },
      { label: "Umbrella", value: 71.6 },
    ],
  },
  {
    label: "Monthly signups",
    question: "Show monthly signups in 2025",
    tables: ["users"],
    sql: `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
       COUNT(*) AS signups
FROM users
WHERE YEAR(created_at) = 2025
GROUP BY month
ORDER BY month;`,
    ms: 24,
    chart: "columns",
    format: (v) => String(v),
    data: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((label, i) => ({
      label,
      value: [420, 465, 510, 498, 560, 612, 655, 640, 702, 748, 790, 836][i],
    })),
  },
  {
    label: "Return rates",
    question: "Which product category has the highest return rate?",
    tables: ["order_items", "products", "returns"],
    sql: `SELECT p.category,
       ROUND(100 * COUNT(r.id) / COUNT(oi.id), 1) AS return_rate
FROM order_items oi
JOIN products p ON p.id = oi.product_id
LEFT JOIN returns r ON r.order_item_id = oi.id
GROUP BY p.category
ORDER BY return_rate DESC;`,
    ms: 51,
    chart: "bars",
    format: (v) => `${v.toFixed(1)}%`,
    data: [
      { label: "Footwear", value: 12.4 },
      { label: "Apparel", value: 9.8 },
      { label: "Electronics", value: 6.1 },
      { label: "Home", value: 4.7 },
      { label: "Books", value: 2.3 },
    ],
  },
];

type RunState = {
  typed: string;
  steps: { text: string; done: boolean }[];
  tokens: Token[];
  shown: number;
  done: boolean;
};

const EMPTY: RunState = { typed: "", steps: [], tokens: [], shown: 0, done: false };

function Chart({ ex }: { ex: Example }) {
  const max = Math.max(...ex.data.map((d) => d.value));
  if (ex.chart === "columns") {
    return (
      <div className="flex h-32 items-end gap-1.5">
        {ex.data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <motion.div
              className="w-full rounded-t-[3px] bg-gradient-to-t from-accent to-accent-2"
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.7, ease, delay: i * 0.04 }}
              title={`${d.value}`}
            />
            <span className="text-[10px] text-muted">{d.label}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {ex.data.map((d, i) => (
        <div key={d.label} className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-3 text-[11px]">
          <span className="truncate text-fg/80">{d.label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.8, ease, delay: i * 0.07 }}
            />
          </div>
          <span className="text-right text-muted tabular-nums">{ex.format(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

/** Scripted, client-side "try it" terminal for the NL → SQL agent. */
export function SqlTerminal() {
  const [active, setActive] = useState<number | null>(null);
  const [state, setState] = useState<RunState>(EMPTY);
  const runId = useRef(0);
  const body = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, margin: "-20% 0px" });
  const reduced = useReducedMotion();

  const run = useCallback(
    async (index: number) => {
      const id = ++runId.current;
      const ex = EXAMPLES[index];
      const wait = (ms: number) => (reduced ? Promise.resolve() : sleep(ms));
      const alive = () => id === runId.current;
      setActive(index);
      setState(EMPTY);

      for (let k = 1; k <= ex.question.length; k++) {
        await wait(24);
        if (!alive()) return;
        setState((s) => ({ ...s, typed: ex.question.slice(0, k) }));
      }

      const steps = [
        "loading chat memory · MongoDB",
        `retrieving schema · ChromaDB → ${ex.tables.join(", ")}`,
        "generating SQL · Ollama",
      ];
      for (const text of steps) {
        await wait(200);
        if (!alive()) return;
        setState((s) => ({ ...s, steps: [...s.steps, { text, done: false }] }));
        await wait(480);
        if (!alive()) return;
        setState((s) => ({ ...s, steps: s.steps.map((st) => (st.text === text ? { ...st, done: true } : st)) }));
      }

      const tokens = tokenize(ex.sql, SQL_KEYWORDS, true);
      setState((s) => ({ ...s, tokens }));
      for (let k = 1; k <= tokens.length; k++) {
        if (tokens[k - 1].t.trim()) await wait(26);
        if (!alive()) return;
        setState((s) => ({ ...s, shown: k }));
      }

      await wait(300);
      if (!alive()) return;
      setState((s) => ({ ...s, done: true }));
    },
    [reduced],
  );

  // Auto-run the first example the first time the terminal scrolls into view.
  useEffect(() => {
    if (inView && active === null) run(0);
  }, [inView, active, run]);

  useEffect(() => () => void runId.current++, []);

  // Keep the newest output in view while it streams.
  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [state]);

  const ex = active !== null ? EXAMPLES[active] : null;
  const streaming = state.tokens.length > 0 && state.shown < state.tokens.length;

  return (
    <div ref={root} className="overflow-hidden rounded-2xl border border-line bg-[#08080a]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-xs text-muted">nl-sql-agent</span>
        </div>
        <span className="rounded-full border border-accent-2/30 bg-accent-2/10 px-2 py-0.5 font-mono text-[10px] text-accent-2">
          Simulated demo
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <span className="mr-1 font-mono text-[11px] text-muted">Try:</span>
        {EXAMPLES.map((e, i) => (
          <button
            key={e.label}
            type="button"
            onClick={() => run(i)}
            aria-pressed={active === i}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              active === i
                ? "border-accent/60 bg-accent/15 text-fg"
                : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div
        ref={body}
        data-lenis-prevent
        className="h-[23rem] overflow-y-auto p-4 font-mono text-[11.5px] leading-relaxed sm:text-[12.5px]"
        aria-live="off"
      >
        {ex && (
          <>
            <p className="text-fg">
              <span className="text-accent-2">❯ </span>
              {state.typed}
              {!state.steps.length && (
                <span className="ml-0.5 inline-block h-[1.1em] w-[0.5em] translate-y-[0.2em] animate-pulse bg-fg/70" />
              )}
            </p>

            <div className="mt-3 space-y-1">
              {state.steps.map((st) => (
                <motion.p
                  key={st.text}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-muted"
                >
                  {st.done ? (
                    <Check className="size-3.5 text-ok" />
                  ) : (
                    <Loader2 className="size-3.5 animate-spin text-accent" />
                  )}
                  {st.text}
                </motion.p>
              ))}
            </div>

            {state.tokens.length > 0 && (
              <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-white/[0.02] p-3.5 whitespace-pre text-fg/90">
                <code>
                  {state.tokens.slice(0, state.shown).map((tk, i) => (
                    <span key={i} className={tk.c ? `tok-${tk.c}` : undefined}>
                      {tk.t}
                    </span>
                  ))}
                  {streaming && (
                    <span className="ml-px inline-block h-[1.1em] w-[0.5em] translate-y-[0.2em] bg-accent-2" />
                  )}
                </code>
              </pre>
            )}

            <AnimatePresence>
              {state.done && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="mt-4"
                >
                  <p className="flex items-center gap-2 text-ok">
                    <Check className="size-3.5" /> executed · {ex.data.length} rows · {ex.ms} ms
                  </p>
                  <div className="mt-3 rounded-xl border border-line bg-white/[0.02] p-4">
                    <Chart ex={ex} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
