import { useRef, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check, Copy, Download, Mail } from "lucide-react";
import { profile } from "../../data/resume";
import { copyText } from "../../lib/clipboard";
import { ease } from "../../lib/motion";
import { MagneticButton } from "../ui/MagneticButton";
import { Reveal } from "../ui/Reveal";
import { useToast } from "../ui/Toast";
import { GitHubIcon, LinkedInIcon } from "../ui/BrandIcons";
import { Glow } from "../ui/Background";

export function Contact() {
  const heading = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  // The heading's gradient follows the cursor. Each line clips its own background,
  // so the centre is set relative to every line.
  const onMove = (e: PointerEvent<HTMLElement>) => {
    heading.current?.querySelectorAll<HTMLElement>("[data-grad]").forEach((line) => {
      const r = line.getBoundingClientRect();
      line.style.setProperty("--gx", `${e.clientX - r.left}px`);
      line.style.setProperty("--gy", `${e.clientY - r.top}px`);
    });
  };

  const copy = async () => {
    if (!(await copyText(profile.email))) return;
    setCopied(true);
    toast("Email copied to clipboard");
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="section overflow-hidden" onPointerMove={onMove}>
      <Glow className="-bottom-40 left-1/2 w-[60rem] -translate-x-1/2" />
      <div className="container-x">
        <Reveal>
          <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-muted uppercase">
            <span className="text-accent">06</span>
            <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
            Contact
          </p>
        </Reveal>

        <h2
          ref={heading}
          className="mt-6 max-w-5xl font-display text-[clamp(2.9rem,9vw,8rem)] leading-[0.95] font-semibold tracking-[-0.04em]"
        >
          {["Let's build", "something", "intelligent."].map((line, i) => (
            <span key={line} className="-mb-[0.08em] block overflow-hidden">
              <motion.span
                data-grad
                // Bottom padding keeps descenders inside the clipped background.
                className="block bg-clip-text pb-[0.16em] text-transparent [background-image:radial-gradient(520px_circle_at_var(--gx,30%)_var(--gy,40%),#a78bfa,#22d3ee_30%,#ededf0_62%)]"
                initial={{ y: "105%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 1, ease, delay: i * 0.08 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>

        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl text-lg text-muted">Have a role, project, or idea in mind? My inbox is open.</p>
        </Reveal>

        <Reveal delay={0.25}>
          <button
            type="button"
            onClick={copy}
            data-cursor="Copy"
            aria-label={`Copy email address ${profile.email}`}
            className="group mt-10 flex max-w-full items-center gap-4 rounded-2xl border border-line bg-white/[0.02] py-4 pr-5 pl-5 text-left transition-colors hover:border-line-strong sm:pr-6"
          >
            <span className="min-w-0 truncate font-mono text-base text-fg sm:text-2xl">{profile.email}</span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors group-hover:text-fg">
              {copied ? <Check className="size-4 text-ok" /> : <Copy className="size-4" />}
            </span>
          </button>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticButton href={`mailto:${profile.email}`}>
              <Mail className="size-4" aria-hidden="true" /> Email me
            </MagneticButton>
            <MagneticButton variant="outline" href={profile.github} external>
              <GitHubIcon /> GitHub <ArrowUpRight className="size-3.5 text-muted" aria-hidden="true" />
            </MagneticButton>
            <MagneticButton variant="outline" href={profile.linkedin} external>
              <LinkedInIcon /> LinkedIn <ArrowUpRight className="size-3.5 text-muted" aria-hidden="true" />
            </MagneticButton>
            <MagneticButton variant="outline" href={profile.resume} download>
              <Download className="size-4" aria-hidden="true" /> Resume
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
