import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { MaskedHeading } from "./MaskedHeading";

type Props = { index: string; label: string; lines: ReactNode[]; intro?: string };

/** "01 / About" label + a heading whose lines slide up from behind a mask. */
export function SectionHeading({ index, label, lines, intro }: Props) {
  return (
    <div className="mb-12 max-w-4xl md:mb-16">
      <Reveal>
        <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-muted uppercase">
          <span className="text-accent">{index}</span>
          <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
          {label}
        </p>
      </Reveal>
      <MaskedHeading
        lines={lines}
        className="mt-5 font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] font-semibold tracking-tight"
      />
      {intro && (
        <Reveal delay={0.15}>
          <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
