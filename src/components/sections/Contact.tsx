import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRight, Check, Copy, Download, Mail } from "lucide-react";
import { profile } from "../../data/resume";
import { copyText } from "../../lib/clipboard";
import { MagneticButton } from "../ui/MagneticButton";
import { MaskedHeading } from "../ui/MaskedHeading";
import { MessageComposer } from "../ui/MessageComposer";
import { Reveal } from "../ui/Reveal";
import { useToast } from "../ui/Toast";
import { GitHubIcon, LinkedInIcon } from "../ui/BrandIcons";
import { Glow } from "../ui/Background";

export function Contact() {
  const heading = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  // The heading's gradient follows the cursor. Each line clips its own background, so the
  // centre is set relative to every line; updates are batched to one per animation frame.
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const scheduled = pointer.current !== null;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (scheduled) return;
    requestAnimationFrame(() => {
      const p = pointer.current;
      pointer.current = null;
      if (!p) return;
      heading.current?.querySelectorAll<HTMLElement>("[data-line]").forEach((line) => {
        const r = line.getBoundingClientRect();
        line.style.setProperty("--gx", `${p.x - r.left}px`);
        line.style.setProperty("--gy", `${p.y - r.top}px`);
      });
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

        <div className="mt-6 grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div ref={heading}>
              <MaskedHeading
                lines={["Let's build", "something", "intelligent."]}
                className="font-display text-[clamp(2.9rem,7vw,6.25rem)] leading-[0.95] font-semibold tracking-[-0.04em]"
                maskClassName="-mb-[0.08em]"
                // Bottom padding keeps descenders inside the clipped gradient background.
                lineClassName="bg-clip-text pb-[0.16em] text-transparent [background-image:radial-gradient(520px_circle_at_var(--gx,30%)_var(--gy,40%),#a78bfa,#22d3ee_30%,#ededf0_62%)]"
              />
            </div>

            <Reveal delay={0.2}>
              <p className="mt-8 max-w-xl text-lg text-muted">
                Have a role, project, or idea in mind? My inbox is open.
              </p>
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

          <Reveal delay={0.15} className="lg:col-span-5">
            <MessageComposer />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
