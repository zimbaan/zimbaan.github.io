import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowUpRight, MousePointerClick } from "lucide-react";
import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import {
  evidenceLabels,
  marquee,
  skillCategories,
  type EvidenceId,
  type Skill,
  type SkillCategory,
} from "../../data/resume";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { scrollToId } from "../../lib/scroll";
import { ease } from "../../lib/motion";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Glow } from "../ui/Background";

type SkillRef = Skill & { key: string; cat: SkillCategory };

const allSkills: SkillRef[] = skillCategories.flatMap((cat) =>
  cat.skills.map((s) => ({ ...s, key: `${cat.id}:${s.name}`, cat })),
);
const byKey = new Map(allSkills.map((s) => [s.key, s]));

function relatedTo(skill: SkillRef | null) {
  if (!skill || skill.usedIn.length === 0) return new Set<string>();
  return new Set(
    allSkills.filter((s) => s.key !== skill.key && s.usedIn.some((e) => skill.usedIn.includes(e))).map((s) => s.key),
  );
}

/* ----------------------------- Layout ----------------------------- */

type GNode = SimulationNodeDatum & {
  id: string;
  kind: "center" | "hub" | "skill";
  label: string;
  catId: string;
  w: number;
  h: number;
};

/** Pushes overlapping pill-shaped nodes apart (d3's built-in collide only handles circles). */
function rectCollide(padding: number) {
  let nodes: GNode[] = [];
  const force = () => {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x! + b.vx! - (a.x! + a.vx!);
        const dy = b.y! + b.vy! - (a.y! + a.vy!);
        const ox = (a.w + b.w) / 2 + padding - Math.abs(dx);
        const oy = (a.h + b.h) / 2 + padding - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        if (ox / (a.w + b.w) < oy / (a.h + b.h)) {
          const s = (ox / 2) * Math.sign(dx || 1) * 0.5;
          a.vx! -= s;
          b.vx! += s;
        } else {
          const s = (oy / 2) * Math.sign(dy || 1) * 0.5;
          a.vy! -= s;
          b.vy! += s;
        }
      }
    }
  };
  force.initialize = (n: GNode[]) => {
    nodes = n;
  };
  return force;
}

function computeLayout() {
  const cx = 500;
  const cy = 320;
  const nodes: GNode[] = [
    { id: "center", kind: "center", label: "AI / ML", catId: "", w: 112, h: 112, x: cx, y: cy, fx: cx, fy: cy },
  ];
  const hubPos = new Map<string, { x: number; y: number }>();
  skillCategories.forEach((cat, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / skillCategories.length;
    const x = cx + Math.cos(angle) * 300;
    const y = cy + Math.sin(angle) * 190;
    hubPos.set(cat.id, { x, y });
    nodes.push({
      id: cat.id,
      kind: "hub",
      label: cat.short,
      catId: cat.id,
      w: cat.short.length * 9.2 + 38,
      h: 36,
      x,
      y,
      fx: x,
      fy: y,
    });
  });
  const links: SimulationLinkDatum<GNode>[] = [];
  allSkills.forEach((s, i) => {
    const hub = hubPos.get(s.cat.id)!;
    const a = i * 2.4;
    nodes.push({
      id: s.key,
      kind: "skill",
      label: s.name,
      catId: s.cat.id,
      w: s.name.length * 7.5 + 26,
      h: 30,
      x: hub.x + Math.cos(a) * 60,
      y: hub.y + Math.sin(a) * 40,
    });
    links.push({ source: s.key, target: s.cat.id });
  });

  const target = (d: GNode) => hubPos.get(d.catId) ?? { x: cx, y: cy };
  const sim = forceSimulation<GNode>(nodes)
    .force(
      "link",
      forceLink<GNode, SimulationLinkDatum<GNode>>(links)
        .id((d) => d.id)
        .distance(64)
        .strength(0.35),
    )
    .force("charge", forceManyBody<GNode>().strength(-55))
    .force("collide", rectCollide(6))
    .force("x", forceX<GNode>((d) => target(d).x).strength(0.07))
    .force("y", forceY<GNode>((d) => target(d).y).strength(0.1))
    .stop();
  for (let i = 0; i < 420; i++) sim.tick();

  // Final pass so no two pills overlap after the simulation settles.
  for (let iter = 0; iter < 120; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x! - a.x!;
        const dy = b.y! - a.y!;
        const ox = (a.w + b.w) / 2 + 5 - Math.abs(dx);
        const oy = (a.h + b.h) / 2 + 5 - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        const aFixed = a.fx != null;
        const bFixed = b.fx != null;
        if (aFixed && bFixed) continue;
        const share = aFixed || bFixed ? 1 : 0.5;
        if (ox / (a.w + b.w) < oy / (a.h + b.h)) {
          const m = ox * share * Math.sign(dx || 1);
          if (!aFixed) a.x! -= m;
          if (!bFixed) b.x! += m;
        } else {
          const m = oy * share * Math.sign(dy || 1);
          if (!aFixed) a.y! -= m;
          if (!bFixed) b.y! += m;
        }
      }
    }
  }

  const pad = 16;
  const minX = Math.min(...nodes.map((n) => n.x! - n.w / 2)) - pad;
  const maxX = Math.max(...nodes.map((n) => n.x! + n.w / 2)) + pad;
  const minY = Math.min(...nodes.map((n) => n.y! - n.h / 2)) - pad;
  const maxY = Math.max(...nodes.map((n) => n.y! + n.h / 2)) + pad;
  return { nodes, viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`, center: { x: cx, y: cy } };
}

/* ----------------------------- Graph ----------------------------- */

type GraphProps = {
  active: SkillRef | null;
  activeCat: string | null;
  related: Set<string>;
  selected: string | null;
  onHover: (key: string | null) => void;
  onSelect: (key: string) => void;
  onHoverCat: (id: string | null) => void;
};

function SkillGraph({ active, activeCat, related, selected, onHover, onSelect, onHoverCat }: GraphProps) {
  const layout = useMemo(computeLayout, []);
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const pos = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout]);

  const stateOf = (n: GNode): "active" | "related" | "cat" | "dim" | "idle" => {
    if (active) {
      if (n.id === active.key) return "active";
      if (related.has(n.id)) return "related";
      if (n.kind === "hub" && n.id === active.cat.id) return "cat";
      return "dim";
    }
    if (activeCat) return n.catId === activeCat ? "cat" : n.kind === "center" ? "idle" : "dim";
    return "idle";
  };

  const delayFor = (n: GNode) => Math.hypot(n.x! - layout.center.x, n.y! - layout.center.y) / 900;

  return (
    <svg
      ref={ref}
      viewBox={layout.viewBox}
      className="h-auto w-full select-none"
      role="group"
      aria-label="Skill constellation"
    >
      <defs>
        <linearGradient id="rel-grad" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="850" y2="640">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* Center → hub spokes */}
      {layout.nodes
        .filter((n) => n.kind === "hub")
        .map((n) => (
          <motion.line
            key={`spoke-${n.id}`}
            x1={layout.center.x}
            y1={layout.center.y}
            x2={n.x}
            y2={n.y}
            stroke="rgb(255 255 255 / 0.14)"
            strokeDasharray="3 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1, ease, delay: 0.1 }}
          />
        ))}

      {/* Hub → skill links */}
      {layout.nodes
        .filter((n) => n.kind === "skill")
        .map((n) => {
          const hub = pos.get(n.catId)!;
          const s = stateOf(n);
          const lit = s === "active" || s === "cat" || (activeCat === n.catId && !active);
          return (
            <motion.line
              key={`link-${n.id}`}
              x1={hub.x}
              y1={hub.y}
              x2={n.x}
              y2={n.y}
              stroke={lit ? "rgb(124 92 255 / 0.7)" : "rgb(255 255 255 / 0.1)"}
              style={{ transition: "stroke .3s" }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: s === "dim" ? 0.4 : 1 } : {}}
              transition={{ duration: 0.6, delay: inView && !active && !activeCat ? 0.3 + delayFor(n) : 0 }}
            />
          );
        })}

      {/* Active skill → related skills (shared projects) */}
      {active &&
        [...related].map((key) => {
          const a = pos.get(active.key)!;
          const b = pos.get(key)!;
          const mx = (a.x! + b.x!) / 2 + (layout.center.x - (a.x! + b.x!) / 2) * 0.35;
          const my = (a.y! + b.y!) / 2 + (layout.center.y - (a.y! + b.y!) / 2) * 0.35;
          return (
            <motion.path
              key={`rel-${active.key}-${key}`}
              d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
              fill="none"
              stroke="url(#rel-grad)"
              strokeWidth={1.2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.5, ease }}
            />
          );
        })}

      {/* Nodes */}
      {layout.nodes.map((n) => {
        const s = stateOf(n);
        const delay = 0.2 + delayFor(n);

        if (n.kind === "center") {
          return (
            <g key={n.id} transform={`translate(${n.x} ${n.y})`} aria-hidden="true">
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease }}
              >
                <circle r={60} fill="url(#rel-grad)" opacity={0.12} className="animate-pulse" />
                <circle r={44} fill="#0c0c0f" stroke="url(#rel-grad)" strokeWidth={1.5} />
                <text textAnchor="middle" dy="0.35em" className="fill-fg font-display text-[17px] font-semibold">
                  {n.label}
                </text>
              </motion.g>
            </g>
          );
        }

        if (n.kind === "hub") {
          const on = s === "cat" || s === "active";
          return (
            <g
              key={n.id}
              transform={`translate(${n.x} ${n.y})`}
              onPointerEnter={() => onHoverCat(n.id)}
              onPointerLeave={() => onHoverCat(null)}
              style={{ opacity: s === "dim" ? 0.35 : 1, transition: "opacity .3s" }}
            >
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.7, ease, delay: 0.15 }}
              >
                <rect
                  x={-n.w / 2}
                  y={-n.h / 2}
                  width={n.w}
                  height={n.h}
                  rx={n.h / 2}
                  fill={on ? "rgb(124 92 255 / 0.22)" : "#141419"}
                  stroke={on ? "#7c5cff" : "rgb(124 92 255 / 0.45)"}
                  style={{ transition: "fill .3s, stroke .3s" }}
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  className="fill-fg font-mono text-[13px] font-medium tracking-wider uppercase"
                >
                  {n.label}
                </text>
              </motion.g>
            </g>
          );
        }

        const skill = byKey.get(n.id)!;
        const fill =
          s === "active"
            ? "#7c5cff"
            : s === "related"
              ? "rgb(34 211 238 / 0.12)"
              : s === "cat"
                ? "rgb(124 92 255 / 0.12)"
                : "#0c0c0f";
        const stroke =
          s === "active"
            ? "#7c5cff"
            : s === "related"
              ? "rgb(34 211 238 / 0.6)"
              : s === "cat"
                ? "rgb(124 92 255 / 0.5)"
                : "rgb(255 255 255 / 0.1)";
        const textFill = s === "active" ? "#fff" : s === "idle" || s === "dim" ? "#a1a1aa" : "#ededf0";
        return (
          <g
            key={n.id}
            transform={`translate(${n.x} ${n.y})`}
            role="button"
            tabIndex={0}
            aria-pressed={selected === n.id}
            aria-label={`${skill.name}. ${
              skill.usedIn.length
                ? `Used in ${skill.usedIn.map((e) => evidenceLabels[e].title).join(", ")}`
                : "In my toolkit"
            }`}
            onPointerEnter={() => onHover(n.id)}
            onPointerLeave={() => onHover(null)}
            onFocus={() => onHover(n.id)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(n.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(n.id);
              }
            }}
            className="outline-none [&:focus-visible>g>rect]:stroke-accent-2"
            style={{ opacity: s === "dim" ? 0.28 : 1, transition: "opacity .3s" }}
          >
            <motion.g
              initial={{ scale: 0.4, opacity: 0 }}
              animate={inView ? { scale: s === "active" ? 1.08 : 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, ease, delay: inView && !active && !activeCat ? delay : 0 }}
            >
              <rect
                x={-n.w / 2}
                y={-n.h / 2}
                width={n.w}
                height={n.h}
                rx={n.h / 2}
                fill={fill}
                stroke={stroke}
                style={{ transition: "fill .3s, stroke .3s" }}
              />
              <text
                textAnchor="middle"
                dy="0.35em"
                fill={textFill}
                className="font-sans text-[13.5px]"
                style={{ transition: "fill .3s" }}
              >
                {n.label}
              </text>
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}

/* ----------------------------- Info panel ----------------------------- */

const evidenceTarget: Record<EvidenceId, string> = {
  turing: "experience",
  iqube: "experience",
  nlsql: "projects",
  debugger: "projects",
};

function InfoPanel({
  skill,
  related,
  activeCat,
  onHoverCat,
  showLegend,
}: {
  skill: SkillRef | null;
  related: Set<string>;
  activeCat: string | null;
  onHoverCat: (id: string | null) => void;
  showLegend: boolean;
}) {
  return (
    <div className="card p-6 lg:min-h-[22rem]" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {skill ? (
          <motion.div
            key={skill.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease }}
          >
            <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">{skill.cat.name}</p>
            <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">{skill.name}</h3>

            <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Where I used it</p>
            {skill.usedIn.length ? (
              <ul className="mt-3 space-y-2">
                {skill.usedIn.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => scrollToId(evidenceTarget[id])}
                      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-line-strong hover:bg-white/[0.04]"
                    >
                      <span>
                        <span className="block font-mono text-[10px] tracking-wider text-muted uppercase">
                          {evidenceLabels[id].kind}
                        </span>
                        <span className="block text-sm text-fg">{evidenceLabels[id].title}</span>
                      </span>
                      <ArrowUpRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Part of my toolkit. Not tied to a specific project on this page.
              </p>
            )}

            {related.size > 0 && (
              <>
                <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-muted uppercase">Used alongside</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[...related].slice(0, 10).map((k) => (
                    <span key={k} className="chip !text-[11px] !text-fg/80">
                      {byKey.get(k)!.name}
                    </span>
                  ))}
                  {related.size > 10 && <span className="chip !text-[11px]">+{related.size - 10}</span>}
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease }}
          >
            <MousePointerClick className="size-5 text-accent" aria-hidden="true" />
            <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              {showLegend ? "Hover a skill" : "Tap a skill"}
            </h3>
            <p className="mt-2 text-sm text-muted">
              Every skill links to the role or project where I actually used it, and lights up the tools I paired it
              with.
            </p>
            {showLegend && (
              <ul className="mt-6 space-y-1">
                {skillCategories.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onPointerEnter={() => onHoverCat(c.id)}
                      onPointerLeave={() => onHoverCat(null)}
                      onFocus={() => onHoverCat(c.id)}
                      onBlur={() => onHoverCat(null)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeCat === c.id ? "bg-white/[0.06] text-fg" : "text-muted hover:text-fg"
                      }`}
                    >
                      {c.name}
                      <span className="font-mono text-xs">{c.skills.length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------- Mobile tabs ----------------------------- */

function SkillTabs({ selected, onSelect }: { selected: string | null; onSelect: (key: string) => void }) {
  const [tab, setTab] = useState(skillCategories[0].id);
  const cat = skillCategories.find((c) => c.id === tab)!;
  return (
    <div>
      <div
        role="tablist"
        aria-label="Skill categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
      >
        {skillCategories.map((c) => (
          <button
            key={c.id}
            role="tab"
            type="button"
            aria-selected={tab === c.id}
            onClick={() => setTab(c.id)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${tab === c.id ? "text-fg" : "text-muted"}`}
          >
            {tab === c.id && (
              <motion.span
                layoutId="skill-tab"
                className="absolute inset-0 rounded-full border border-accent/50 bg-accent/15"
              />
            )}
            <span className="relative">{c.short}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={cat.name}>
        <motion.ul key={tab} className="mt-5 flex flex-wrap gap-2">
          {cat.skills.map((s, i) => {
            const key = `${cat.id}:${s.name}`;
            const on = selected === key;
            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease, delay: i * 0.03 }}
              >
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onSelect(key)}
                  className={`rounded-full border px-4 py-2.5 text-sm transition-colors ${
                    on ? "border-accent bg-accent text-white" : "border-line bg-white/[0.02] text-fg/85"
                  }`}
                >
                  {s.name}
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </div>
  );
}

/* ----------------------------- Marquee ----------------------------- */

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="mask-fade-x group flex overflow-hidden">
      <div
        className={`flex w-max shrink-0 animate-marquee gap-10 pr-10 group-hover:[animation-play-state:paused] ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
      >
        {doubled.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-10 font-display text-2xl font-medium tracking-tight text-transparent [-webkit-text-stroke:1px_rgb(237_237_240/0.4)] sm:text-4xl"
          >
            {t}
            <span className="size-1.5 rounded-full bg-accent/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Section ----------------------------- */

export function Skills() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const activeKey = hovered ?? selected;
  const active = activeKey ? (byKey.get(activeKey) ?? null) : null;
  const related = useMemo(() => relatedTo(active), [active]);
  const toggle = (key: string) => setSelected((cur) => (cur === key ? null : key));

  return (
    <section id="skills" className="section">
      <Glow color="accent-2" className="top-1/3 -right-48 w-[40rem]" />
      <div className="container-x">
        <SectionHeading
          index="02"
          label="Skills"
          lines={["A toolkit wired", "for real-world AI."]}
          intro="Not progress bars. Each skill connects to the work that used it, so you can see the evidence, not just the list."
        />

        {desktop ? (
          <div className="grid grid-cols-12 items-start gap-8">
            <Reveal className="col-span-8">
              <div className="card overflow-hidden p-4 xl:p-6">
                <SkillGraph
                  active={active}
                  activeCat={hoveredCat}
                  related={related}
                  selected={selected}
                  onHover={setHovered}
                  onSelect={toggle}
                  onHoverCat={setHoveredCat}
                />
              </div>
            </Reveal>
            <Reveal className="sticky top-28 col-span-4" delay={0.1}>
              <InfoPanel
                skill={active}
                related={related}
                activeCat={hoveredCat}
                onHoverCat={setHoveredCat}
                showLegend
              />
            </Reveal>
          </div>
        ) : (
          <div className="space-y-6">
            <SkillTabs selected={selected} onSelect={toggle} />
            <InfoPanel
              skill={active}
              related={related}
              activeCat={null}
              onHoverCat={setHoveredCat}
              showLegend={false}
            />
          </div>
        )}
      </div>

      <div className="mt-20 space-y-5 sm:mt-28" aria-hidden="true">
        <MarqueeRow items={marquee.slice(0, 8)} />
        <MarqueeRow items={marquee.slice(8)} reverse />
      </div>
    </section>
  );
}
