import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { ease } from "../../lib/motion";

type NodeId = "question" | "langchain" | "chroma" | "mongo" | "ollama" | "sql" | "db" | "charts";

const NODES: Record<NodeId, { x: number; y: number; title: string; sub: string }> = {
  question: { x: 90, y: 50, title: "Question", sub: "plain English" },
  langchain: { x: 300, y: 50, title: "LangChain", sub: "orchestrator" },
  chroma: { x: 510, y: 50, title: "ChromaDB", sub: "schema RAG" },
  mongo: { x: 300, y: 170, title: "MongoDB", sub: "chat memory" },
  ollama: { x: 510, y: 170, title: "Ollama LLM", sub: "SQL generation" },
  sql: { x: 510, y: 290, title: "SQL", sub: "executable query" },
  db: { x: 300, y: 290, title: "Database", sub: "execute" },
  charts: { x: 90, y: 290, title: "Recharts", sub: "insights" },
};

const EDGES: [NodeId, NodeId][] = [
  ["question", "langchain"],
  ["langchain", "mongo"],
  ["langchain", "chroma"],
  ["chroma", "ollama"],
  ["ollama", "sql"],
  ["sql", "db"],
  ["db", "charts"],
];

const SEQUENCE: { node: NodeId; caption: string }[] = [
  { node: "question", caption: "A user asks a question in plain English." },
  { node: "langchain", caption: "LangChain receives it and orchestrates the agent." },
  { node: "mongo", caption: "Conversation context is loaded from MongoDB memory." },
  { node: "langchain", caption: "Memory is merged into the prompt." },
  { node: "chroma", caption: "Relevant table schemas are retrieved from ChromaDB (RAG)." },
  { node: "ollama", caption: "A local LLM served by Ollama generates the SQL." },
  { node: "sql", caption: "The result is an optimized, executable SQL statement." },
  { node: "db", caption: "The query runs against the target database." },
  { node: "charts", caption: "Results come back as interactive Recharts visuals." },
];

const W = 128;
const H = 50;
const edgeKey = (a: NodeId, b: NodeId) => [a, b].sort().join("-");

/** Animated architecture diagram: a glowing packet travels through the RAG → SQL pipeline. */
export function SqlPipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduced = useReducedMotion();
  const [step, setStep] = useState(reduced ? SEQUENCE.length - 1 : 0);
  const [playing, setPlaying] = useState(!reduced);

  useEffect(() => {
    if (!inView || !playing || reduced) return;
    const last = step === SEQUENCE.length - 1;
    const t = window.setTimeout(() => setStep(last ? 0 : step + 1), last ? 2600 : 1100);
    return () => window.clearTimeout(t);
  }, [inView, playing, step, reduced]);

  const visitedNodes = new Set(SEQUENCE.slice(0, step + 1).map((s) => s.node));
  const visitedEdges = new Set<string>();
  for (let i = 1; i <= step; i++) visitedEdges.add(edgeKey(SEQUENCE[i - 1].node, SEQUENCE[i].node));
  const current = NODES[SEQUENCE[step].node];

  return (
    <div ref={ref}>
      <div className="relative">
        <svg
          viewBox="0 0 600 340"
          className="h-auto w-full"
          role="img"
          aria-label="Architecture of the Natural Language SQL Agent"
        >
          <defs>
            {/* userSpaceOnUse: straight horizontal/vertical lines have a zero-size bounding box. */}
            <linearGradient id="pipe-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="340">
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <radialGradient id="packet-glow">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
          </defs>

          {EDGES.map(([a, b]) => {
            const A = NODES[a];
            const B = NODES[b];
            const on = visitedEdges.has(edgeKey(a, b));
            return (
              <g key={`${a}-${b}`}>
                <line
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke="rgb(255 255 255 / 0.08)"
                  strokeWidth={1.5}
                  strokeDasharray={a === "langchain" && b === "mongo" ? "4 4" : undefined}
                />
                <motion.line
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke="url(#pipe-grad)"
                  strokeWidth={2}
                  initial={false}
                  animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                  transition={{ duration: step === 0 ? 0.2 : 0.6, ease }}
                />
              </g>
            );
          })}

          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const n = NODES[id];
            const on = visitedNodes.has(id);
            const isCurrent = SEQUENCE[step].node === id;
            return (
              <g key={id} transform={`translate(${n.x - W / 2} ${n.y - H / 2})`}>
                <rect
                  width={W}
                  height={H}
                  rx={12}
                  fill={isCurrent ? "rgb(124 92 255 / 0.22)" : on ? "#141419" : "#0c0c0f"}
                  stroke={isCurrent ? "#22d3ee" : on ? "rgb(124 92 255 / 0.7)" : "rgb(255 255 255 / 0.1)"}
                  strokeWidth={isCurrent ? 1.5 : 1}
                  style={{ transition: "fill .4s, stroke .4s" }}
                />
                <text
                  x={W / 2}
                  y={21}
                  textAnchor="middle"
                  className="font-sans text-[13px] font-semibold"
                  fill={on ? "#ededf0" : "#8b8b96"}
                  style={{ transition: "fill .4s" }}
                >
                  {n.title}
                </text>
                <text x={W / 2} y={37} textAnchor="middle" className="font-mono text-[9.5px]" fill="#8b8b96">
                  {n.sub}
                </text>
              </g>
            );
          })}

          {/* Step counter in the empty grid cell */}
          <g transform="translate(90 170)" aria-hidden="true">
            <text textAnchor="middle" dy="-0.1em" className="font-display text-[34px] font-semibold" fill="#ededf0">
              {String(step + 1).padStart(2, "0")}
            </text>
            <text textAnchor="middle" y={24} className="font-mono text-[10px] tracking-[0.2em]" fill="#8b8b96">
              / {String(SEQUENCE.length).padStart(2, "0")} STEPS
            </text>
          </g>

          {!reduced && (
            <motion.g
              initial={false}
              animate={{ x: current.x, y: current.y }}
              transition={step === 0 ? { duration: 0 } : { duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
            >
              <circle r={16} fill="url(#packet-glow)" />
              <circle r={4.5} fill="#fff" />
            </motion.g>
          )}
        </svg>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause pipeline animation" : "Play pipeline animation"}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
        <p className="min-h-[2.75rem] flex-1 text-sm text-fg/80">
          <span className="mr-2 font-mono text-xs text-accent-2">{String(step + 1).padStart(2, "0")}</span>
          {SEQUENCE[step].caption}
        </p>
      </div>
    </div>
  );
}
