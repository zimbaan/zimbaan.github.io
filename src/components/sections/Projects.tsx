import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { projects, type Project } from "../../data/resume";
import { hasFinePointer } from "../../lib/env";
import { lockScroll } from "../../lib/scroll";
import { trackSpotlight } from "../../lib/spotlight";
import { ease } from "../../lib/motion";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Glow } from "../ui/Background";
import { GitHubIcon } from "../ui/BrandIcons";
import { SqlPipeline } from "../demos/SqlPipeline";
import { SqlTerminal } from "../demos/SqlTerminal";
import { CodeDebugger } from "../demos/CodeDebugger";

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  const [fine] = useState(hasFinePointer);
  const rotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 });

  const onMove = (e: PointerEvent<HTMLElement>) => {
    trackSpotlight(e);
    if (!fine) return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 7);
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 7);
  };
  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div layoutId={`project-${project.id}`} className="rounded-[1.25rem]">
        <motion.article
          style={{ rotateX, rotateY }}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="card spotlight overflow-hidden p-6 sm:p-8"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -bottom-10 font-display text-[10rem] leading-none font-bold text-white/[0.03] select-none"
          >
            0{index + 1}
          </span>
          <div className="flex items-center justify-between font-mono text-xs text-muted">
            <span className="text-accent">Project 0{index + 1}</span>
            <span>{project.dates}</span>
          </div>
          <h3 className="mt-6 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h3>
          <p className="mt-4 text-fg/75">{project.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpen}
              data-cursor="Open"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg"
            >
              Case study
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm text-fg transition-colors hover:bg-white/[0.06]"
              >
                <GitHubIcon /> Source
                <ArrowUpRight className="size-3.5 text-muted" aria-hidden="true" />
              </a>
            )}
          </div>
        </motion.article>
      </motion.div>
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;
    const previous = document.activeElement as HTMLElement | null;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeBtn.current?.focus(), 50);
    return () => {
      window.clearTimeout(t);
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [project, onClose]);

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {project && (
        <div key="dialog" className="pointer-events-none fixed inset-0 z-[86] grid place-items-center p-3 sm:p-6">
          <motion.div
            layoutId={`project-${project.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            data-lenis-prevent
            className="card pointer-events-auto max-h-[88svh] w-full max-w-2xl overflow-y-auto"
            transition={{ duration: 0.55, ease }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4, ease } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="p-6 sm:p-10"
            >
              <div className="flex items-start justify-between gap-6">
                <p className="font-mono text-xs text-muted">
                  <span className="text-accent">Case study</span> · {project.dates}
                </p>
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={onClose}
                  aria-label="Close case study"
                  className="-mt-2 -mr-2 grid size-10 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  <X className="size-4" />
                </button>
              </div>
              <h3
                id="project-modal-title"
                className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                {project.title}
              </h3>
              <p className="mt-4 text-fg/75">{project.blurb}</p>

              <h4 className="mt-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">What I built</h4>
              <ul className="mt-4 space-y-3">
                {project.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-fg/85">
                    <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>

              <h4 className="mt-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">How a request flows</h4>
              <ol className="mt-4 flex flex-wrap items-center gap-2">
                {project.flow.map((f, i) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="rounded-lg border border-line bg-white/[0.03] px-3 py-1.5 text-xs text-fg/85">
                      {f}
                    </span>
                    {i < project.flow.length - 1 && <ArrowRight className="size-3.5 text-accent" aria-hidden="true" />}
                  </li>
                ))}
              </ol>

              <h4 className="mt-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Stack</h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>

              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg"
                >
                  <GitHubIcon /> View source on GitHub
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Projects() {
  const [openId, setOpenId] = useState<Project["id"] | null>(null);
  const open = projects.find((p) => p.id === openId) ?? null;
  const close = useCallback(() => setOpenId(null), []);

  return (
    <section id="projects" className="section">
      <Glow className="top-1/4 -left-56 w-[46rem]" />
      <Glow color="accent-2" className="-right-40 bottom-0 w-[36rem]" />
      <div className="container-x">
        <SectionHeading
          index="04"
          label="Projects"
          lines={["Things I've built", "with language models."]}
          intro="Two flagship LLM builds. The panels beside each one are interactive, client-side recreations of how the system works."
        />

        <div className="space-y-24 md:space-y-32">
          {projects.map((project, i) => (
            <div key={project.id} className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
              <Reveal className={`lg:sticky lg:top-28 lg:col-span-5 ${i % 2 ? "lg:order-2" : ""}`}>
                <ProjectCard project={project} index={i} onOpen={() => setOpenId(project.id)} />
              </Reveal>
              <Reveal delay={0.1} className={`lg:col-span-7 ${i % 2 ? "lg:order-1" : ""}`}>
                {project.id === "nlsql" ? (
                  <div className="space-y-6">
                    <div className="card p-5 sm:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Architecture</p>
                        <p className="font-mono text-[10px] text-muted">RAG → SQL pipeline</p>
                      </div>
                      <SqlPipeline />
                    </div>
                    <SqlTerminal />
                  </div>
                ) : (
                  <CodeDebugger />
                )}
              </Reveal>
            </div>
          ))}
        </div>
      </div>
      <ProjectModal project={open} onClose={close} />
    </section>
  );
}
