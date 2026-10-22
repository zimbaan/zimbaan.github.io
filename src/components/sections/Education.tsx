import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Award, GraduationCap, Medal, Trophy } from "lucide-react";
import { awards, education } from "../../data/resume";
import { trackSpotlight } from "../../lib/spotlight";
import { ease } from "../../lib/motion";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

const icons = { trophy: Trophy, medal: Medal, award: Award };

function CgpaRing({ value }: { value: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-36 shrink-0">
      <svg ref={ref} viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="cgpa-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="6" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#cgpa-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: c * (1 - value / 10) } : {}}
          transition={{ duration: 1.8, ease }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-3xl font-semibold tracking-tight">{value}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">CGPA / 10</p>
        </div>
      </div>
    </div>
  );
}

export function Education() {
  return (
    <section id="education" className="section">
      <div className="container-x">
        <SectionHeading index="05" label="Education & Awards" lines={["Foundations,", "and recognition."]} />

        <div className="grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <article onPointerMove={trackSpotlight} className="card spotlight h-full p-6 sm:p-8">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <GraduationCap className="size-6 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {education.school}
                  </h3>
                  <p className="mt-2 text-fg/80">{education.degree}</p>
                  <p className="mt-1 font-mono text-sm text-muted">
                    {education.start} — {education.end}
                  </p>
                </div>
                <CgpaRing value={education.cgpa} />
              </div>
              <p className="mt-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Coursework</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {education.coursework.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>

          <div className="grid gap-4 lg:col-span-5">
            {awards.map((a, i) => {
              const Icon = icons[a.icon];
              return (
                <Reveal key={a.title} delay={0.08 * (i + 1)}>
                  <article className="card shine group flex items-start gap-4 p-5 transition-colors hover:border-line-strong sm:p-6">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-tight">{a.title}</h3>
                      <p className="mt-1 text-sm text-muted">{a.detail}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
