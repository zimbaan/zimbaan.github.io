import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Droplets, RotateCcw, Sun } from "lucide-react";
import { ease } from "../../lib/motion";

type Mode = "before" | "after";

// Sample data for the simulated demo only: daily output as a % of a freshly cleaned panel.
const DAYS = 90;
const BEFORE_CLEANS = [0, 41, 66]; // irregular maintenance
const AFTER_CYCLE = 7; // scheduled water cleaning
const BEFORE_AVG = 82.5; // 17.5% average loss to dust
const AFTER_AVG = +(BEFORE_AVG * 1.182).toFixed(1); // 18.2% more output

function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Dust loss grows with days since the last clean, plus day-to-day weather noise, scaled to the given average. */
function series(daysSinceClean: (day: number) => number, average: number, seed: number) {
  const rand = random(seed);
  const dust = Array.from({ length: DAYS }, (_, d) => 1 - Math.exp(-daysSinceClean(d) / 26));
  const noise = dust.map(() => (rand() - 0.5) * 2.4);
  const meanDust = dust.reduce((a, b) => a + b, 0) / DAYS;
  const meanNoise = noise.reduce((a, b) => a + b, 0) / DAYS;
  const scale = (100 - average) / meanDust;
  return dust.map((v, d) => 100 - v * scale + noise[d] - meanNoise);
}

const BEFORE = series((d) => d - Math.max(...BEFORE_CLEANS.filter((c) => c <= d)), BEFORE_AVG, 11);
const AFTER = series((d) => d % AFTER_CYCLE, AFTER_AVG, 29);
const AFTER_CLEANS = Array.from({ length: Math.ceil(DAYS / AFTER_CYCLE) }, (_, i) => i * AFTER_CYCLE);

// Chart geometry (SVG user units).
const X0 = 44;
const X1 = 584;
const Y0 = 14;
const Y1 = 226;
const MIN = 60;
const MAX = 104;
const x = (day: number) => X0 + (day / (DAYS - 1)) * (X1 - X0);
const y = (v: number) => Y1 - ((v - MIN) / (MAX - MIN)) * (Y1 - Y0);
const line = (values: number[]) =>
  values.map((v, d) => `${d ? "L" : "M"}${x(d).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
const lossArea = (values: number[]) => `M${X0} ${y(100)} ${line(values).replace(/^M/, "L")} L${X1} ${y(100)} Z`;

const STATS = [
  { value: "50,000+", label: "readings analysed", mode: null },
  { value: "−17.5%", label: "avg output lost to dust", mode: "before" },
  { value: "+18.2%", label: "output after scheduled cleaning", mode: "after" },
  { value: "₹15K", label: "saved per year", mode: "after" },
] as const;

const CAPTIONS: Record<Mode, string> = {
  before:
    "With irregular cleaning, dust builds up for weeks at a time. Across the readings, panels ran 17.5% below their clean-panel output on average.",
  after:
    "A water-cleaning cycle every 7 days keeps panels close to clean output: 18.2% more energy, and about ₹15K a year saved on maintenance.",
};

/** Interactive recreation of the solar study: dust losses under irregular vs. scheduled cleaning. */
export function SolarStudy() {
  const [mode, setMode] = useState<Mode>("before");
  const [hover, setHover] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const touched = useRef(false);
  const inView = useInView(root, { once: true, margin: "-20% 0px" });
  const reduced = useReducedMotion();

  const paths = useMemo(
    () => ({ before: line(BEFORE), after: line(AFTER), beforeLoss: lossArea(BEFORE), afterLoss: lossArea(AFTER) }),
    [],
  );

  // Play the before → after story once, the first time the chart scrolls into view.
  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(() => !touched.current && setMode("after"), 2600);
    return () => window.clearTimeout(t);
  }, [inView, reduced]);

  const choose = (next: Mode) => {
    touched.current = true;
    setMode(next);
  };

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const ux = ((e.clientX - box.left) / box.width) * 600;
    setHover(Math.max(0, Math.min(DAYS - 1, Math.round(((ux - X0) / (X1 - X0)) * (DAYS - 1)))));
  };

  const after = mode === "after";
  const cleans = after ? AFTER_CLEANS : BEFORE_CLEANS;

  return (
    <div ref={root} className="overflow-hidden rounded-2xl border border-line bg-[#08080a]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </div>
          <span className="font-mono text-xs text-muted">solar_study.ipynb</span>
        </div>
        <span className="whitespace-nowrap rounded-full border border-accent-2/30 bg-accent-2/10 px-2 py-0.5 font-mono text-[10px] text-accent-2">
          Simulated demo
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Maintenance plan" className="relative flex rounded-full border border-line p-1">
            {(["before", "after"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => choose(m)}
                className={`relative rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                  mode === m ? "text-bg" : "text-muted hover:text-fg"
                }`}
              >
                {mode === m && (
                  <motion.span
                    layoutId="solar-mode"
                    className="absolute inset-0 -z-0 rounded-full bg-fg"
                    transition={{ duration: 0.4, ease }}
                  />
                )}
                <span className="relative">{m === "before" ? "Irregular cleaning" : "Scheduled cleaning"}</span>
              </button>
            ))}
          </div>
          <p className="font-mono text-[11px] text-muted" aria-live="polite">
            {hover === null ? (
              <>
                90-day avg <span className="text-bad">{BEFORE_AVG.toFixed(1)}%</span>
                {after && (
                  <>
                    {" "}
                    → <span className="text-ok">{AFTER_AVG.toFixed(1)}%</span>
                  </>
                )}
              </>
            ) : (
              <>
                Day {hover + 1} · <span className="text-bad">{BEFORE[hover].toFixed(1)}%</span>
                {after && (
                  <>
                    {" "}
                    → <span className="text-ok">{AFTER[hover].toFixed(1)}%</span>
                  </>
                )}
              </>
            )}
          </p>
        </div>

        <svg
          ref={svg}
          viewBox="0 0 600 256"
          className="mt-4 h-auto w-full touch-pan-y"
          role="img"
          aria-label={`Daily solar panel output over 90 days. Irregular cleaning averages ${BEFORE_AVG}% of clean-panel output; scheduled cleaning averages ${AFTER_AVG}%.`}
        >
          <defs>
            <linearGradient id="solar-after" gradientUnits="userSpaceOnUse" x1={X0} y1="0" x2={X1} y2="0">
              <stop offset="0%" stopColor="#7c5cff" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {[60, 70, 80, 90, 100].map((v) => (
            <g key={v}>
              <line
                x1={X0}
                x2={X1}
                y1={y(v)}
                y2={y(v)}
                stroke={v === 100 ? "rgb(255 255 255 / 0.22)" : "rgb(255 255 255 / 0.06)"}
              />
              <text x={X0 - 8} y={y(v)} dy="0.35em" textAnchor="end" className="font-mono text-[10px]" fill="#8b8b96">
                {v}%
              </text>
            </g>
          ))}
          <text x={X1} y={y(100) - 6} textAnchor="end" className="font-mono text-[10px]" fill="#8b8b96">
            clean panel
          </text>
          {[0, 29, 59, 89].map((d) => (
            <text
              key={d}
              x={x(d)}
              y={248}
              textAnchor={d === 0 ? "start" : d === DAYS - 1 ? "end" : "middle"}
              className="font-mono text-[10px]"
              fill="#8b8b96"
            >
              Day {d + 1}
            </text>
          ))}

          {/* Output lost to dust */}
          <motion.path
            d={paths.beforeLoss}
            fill="#f87171"
            initial={false}
            animate={{ opacity: after ? 0.05 : 0.14 }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d={paths.afterLoss}
            fill="#22d3ee"
            initial={false}
            animate={{ opacity: after ? 0.12 : 0 }}
            transition={{ duration: 0.6 }}
          />

          <motion.path
            d={paths.before}
            fill="none"
            stroke="#f87171"
            strokeWidth={1.75}
            strokeLinejoin="round"
            initial={false}
            animate={{ opacity: after ? 0.35 : 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d={paths.after}
            fill="none"
            stroke="url(#solar-after)"
            strokeWidth={2.25}
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: after ? 1 : 0, opacity: after ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : after ? 1.4 : 0.3, ease }}
          />

          {/* Average lines */}
          {(after ? [BEFORE_AVG, AFTER_AVG] : [BEFORE_AVG]).map((avg) => (
            <line
              key={avg}
              x1={X0}
              x2={X1}
              y1={y(avg)}
              y2={y(avg)}
              stroke={avg === AFTER_AVG ? "#34d399" : "#f87171"}
              strokeDasharray="4 5"
              opacity={0.7}
            />
          ))}

          {/* Cleaning days */}
          {cleans.map((d) => (
            <motion.circle
              key={`${mode}-${d}`}
              cx={x(d)}
              cy={Y1}
              r={3.5}
              fill="#22d3ee"
              initial={{ scale: reduced ? 1 : 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: reduced ? 0 : (d / DAYS) * 0.8 }}
            />
          ))}

          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={Y0} y2={Y1} stroke="rgb(255 255 255 / 0.25)" />
              <circle cx={x(hover)} cy={y(BEFORE[hover])} r={4} fill="#f87171" />
              {after && <circle cx={x(hover)} cy={y(AFTER[hover])} r={4} fill="#22d3ee" />}
            </g>
          )}

          <rect
            x={X0}
            y={Y0}
            width={X1 - X0}
            height={Y1 - Y0}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        <p className="mt-1 flex items-center gap-2 font-mono text-[10px] text-muted">
          <span className="size-2 rounded-full bg-accent-2" aria-hidden="true" /> cleaning day
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STATS.map((s) => {
            const lit = s.mode === null || s.mode === mode;
            return (
              <div
                key={s.label}
                className={`rounded-xl border px-3 py-2.5 transition-colors duration-500 ${
                  lit ? "border-line-strong bg-white/[0.04]" : "border-line bg-transparent"
                }`}
              >
                <p
                  className={`font-display text-lg font-semibold tracking-tight transition-colors duration-500 ${
                    !lit ? "text-fg/35" : s.mode === "before" ? "text-bad" : s.mode === "after" ? "text-ok" : "text-fg"
                  }`}
                >
                  {s.value}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-start">
        <div className="flex min-h-[3.5rem] flex-1 gap-3 text-sm leading-relaxed">
          {after ? (
            <Droplets className="mt-0.5 size-4 shrink-0 text-accent-2" aria-hidden="true" />
          ) : (
            <Sun className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden="true" />
          )}
          <p className="text-fg/85">{CAPTIONS[mode]}</p>
        </div>
        <button
          type="button"
          onClick={() => choose(after ? "before" : "after")}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line px-4 py-2 text-xs text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          {after ? <RotateCcw className="size-3.5" /> : <Droplets className="size-3.5" />}
          {after ? "Reset" : "Apply cleaning schedule"}
        </button>
      </div>
    </div>
  );
}
