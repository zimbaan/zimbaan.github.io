import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, PenLine } from "lucide-react";
import { profile } from "../../data/resume";
import { ease } from "../../lib/motion";

// Example enquiries a visitor might send. "Open in mail" pre-fills the visitor's own mail app.
const DRAFTS = [
  {
    subject: "AI/ML Engineer role",
    body: "Hi Kapil, we're hiring an AI/ML Engineer and your RAG and text-to-SQL work stood out. Free for a quick call this week?",
  },
  {
    subject: "LLM project collaboration",
    body: "Hi Kapil, we'd love help building a LangChain + RAG assistant over our internal docs. Would you be interested?",
  },
  {
    subject: "Text-to-SQL for our data team",
    body: "Hi Kapil, our analysts want to ask questions in plain English. Could your NL→SQL agent approach work for us?",
  },
];

type Phase = "subject" | "body" | "ready";

/** Self-typing email draft that fills the Contact section. Pauses while offscreen. */
export function MessageComposer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduced ? "ready" : "subject");
  const [typed, setTyped] = useState(reduced ? DRAFTS[0].body.length : 0);
  const [subjectTyped, setSubjectTyped] = useState(reduced ? DRAFTS[0].subject.length : 0);

  const { subject, body } = DRAFTS[draft];

  useEffect(() => {
    if (!inView || reduced) return;
    let t: number;
    if (phase === "subject") {
      t = window.setTimeout(
        () => (subjectTyped < subject.length ? setSubjectTyped((n) => n + 1) : setPhase("body")),
        subjectTyped === 0 ? 500 : 45,
      );
    } else if (phase === "body") {
      t = window.setTimeout(
        () => (typed < body.length ? setTyped((n) => Math.min(body.length, n + 2)) : setPhase("ready")),
        typed === 0 ? 300 : 28,
      );
    } else {
      t = window.setTimeout(() => {
        setDraft((d) => (d + 1) % DRAFTS.length);
        setSubjectTyped(0);
        setTyped(0);
        setPhase("subject");
      }, 4200);
    }
    return () => window.clearTimeout(t);
  }, [inView, reduced, phase, subjectTyped, typed, subject.length, body.length]);

  const pick = (i: number) => {
    setDraft(i);
    setSubjectTyped(DRAFTS[i].subject.length);
    setTyped(DRAFTS[i].body.length);
    setPhase("ready");
  };

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const caret = <span className="ml-px inline-block h-[1.05em] w-[0.45em] translate-y-[0.18em] bg-accent-2/80" />;

  return (
    <div ref={ref} className="relative isolate overflow-hidden rounded-[1.4rem] p-px">
      {/* Slowly rotating gradient border */}
      <div
        aria-hidden="true"
        className="absolute -inset-[60%] -z-10 animate-[spin_7s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_65%,#7c5cff_78%,#22d3ee_88%,transparent_100%)] motion-reduce:animate-none"
      />
      <div className="absolute inset-px -z-10 rounded-[calc(1.4rem-1px)] bg-surface" />

      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </div>
          <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
            <PenLine className="size-3.5" aria-hidden="true" /> new message
          </span>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Example drafts">
          {DRAFTS.map((d, i) => (
            <button
              key={d.subject}
              type="button"
              onClick={() => pick(i)}
              aria-label={`Show draft: ${d.subject}`}
              aria-pressed={i === draft}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === draft ? "w-6 bg-accent-2" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </div>

      <dl className="space-y-0 px-5 font-mono text-[13px]">
        <div className="flex gap-4 border-b border-line py-3">
          <dt className="w-14 shrink-0 text-muted">To</dt>
          <dd className="truncate text-fg/90">{profile.email}</dd>
        </div>
        <div className="flex gap-4 border-b border-line py-3">
          <dt className="w-14 shrink-0 text-muted">Subject</dt>
          <dd className="min-w-0 truncate text-fg">
            {subject.slice(0, subjectTyped)}
            {phase === "subject" && caret}
          </dd>
        </div>
      </dl>

      <p className="min-h-[8.5rem] px-5 pt-4 pb-2 text-[15px] leading-relaxed text-fg/85" aria-live="off">
        {body.slice(0, typed)}
        {phase === "body" && caret}
      </p>

      <div className="flex items-center justify-between gap-3 px-5 pt-2 pb-5">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "ready" ? (
            <motion.span
              key="ready"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease }}
              className="flex items-center gap-1.5 font-mono text-xs text-ok"
            >
              <Check className="size-3.5" aria-hidden="true" /> draft ready
            </motion.span>
          ) : (
            <motion.span
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease }}
              className="font-mono text-xs text-muted"
            >
              typing…
            </motion.span>
          )}
        </AnimatePresence>
        <a
          href={mailto}
          data-cursor="Mail"
          className={`group inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-500 ${
            phase === "ready"
              ? "bg-fg text-bg shadow-[0_0_28px_rgb(124_92_255/0.45)]"
              : "border border-line-strong text-fg/80"
          }`}
        >
          Open in mail
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}
