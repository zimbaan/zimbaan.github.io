import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { experience } from "../../data/resume";
import { prefersReducedMotion } from "../../lib/env";
import { trackSpotlight } from "../../lib/spotlight";
import { ease } from "../../lib/motion";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function Experience() {
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);

  // The timeline line draws itself with scroll; each node lights up as the line reaches it.
  // GSAP is loaded on demand so it stays out of the initial bundle.
  useEffect(() => {
    if (!list.current || !line.current) return;
    const nodes = list.current.querySelectorAll<HTMLElement>("[data-node]");
    if (prefersReducedMotion()) {
      line.current.style.transform = "none";
      nodes.forEach((n) => (n.dataset.on = "true"));
      return;
    }
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(
          line.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: list.current, start: "top 65%", end: "bottom 55%", scrub: 0.6 },
          },
        );
        nodes.forEach((node) => {
          ScrollTrigger.create({
            trigger: node,
            start: "top 65%",
            onEnter: () => (node.dataset.on = "true"),
            onLeaveBack: () => (node.dataset.on = "false"),
          });
        });
      }, list);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section id="experience" className="section">
      <div className="container-x">
        <SectionHeading index="03" label="Experience" lines={["Where I've been", "shipping models."]} />

        <div className="relative">
          <div aria-hidden="true" className="absolute top-2 bottom-2 left-[7px] w-px bg-line md:left-[231px]">
            <div
              ref={line}
              style={{ transform: "scaleY(0)" }}
              className="absolute inset-0 origin-top bg-gradient-to-b from-accent via-accent to-accent-2"
            />
          </div>
          <ol ref={list} className="relative">
            {experience.map((job) => (
              <li
                key={job.id}
                className="relative grid gap-4 pb-14 pl-10 last:pb-0 md:grid-cols-[200px_1fr] md:gap-16 md:pl-0"
              >
                <span
                  data-node
                  aria-hidden="true"
                  className="absolute top-1.5 left-0 size-[15px] rounded-full border border-line-strong bg-bg transition-all duration-500 data-[on=true]:border-accent data-[on=true]:bg-accent data-[on=true]:shadow-[0_0_24px_4px_rgb(124_92_255/0.55)] md:left-[224px]"
                />
                <Reveal className="md:pt-0.5 md:text-right">
                  <p className="font-mono text-sm text-fg">
                    {job.start} — {job.end}
                  </p>
                  <p className="mt-1 text-sm text-muted">{job.company}</p>
                </Reveal>

                <Reveal delay={0.08}>
                  <article onPointerMove={trackSpotlight} className="card spotlight p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{job.role}</h3>
                      {job.current && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-ok uppercase">
                          <span className="relative flex size-1.5">
                            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-ok" />
                            <span className="relative size-1.5 rounded-full bg-ok" />
                          </span>
                          Present
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-accent">@ {job.company}</p>

                    <ul className="mt-6 space-y-3">
                      {job.points.map((p, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                          transition={{ duration: 0.6, ease, delay: 0.15 + i * 0.08 }}
                          className="flex gap-3 text-[15px] leading-relaxed text-fg/80"
                        >
                          <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                          {p}
                        </motion.li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {job.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
