import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../../lib/env";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

type Char = { c: string; scrambling: boolean };

const toChars = (s: string): Char[] => [...s].map((c) => ({ c, scrambling: false }));

/** Cycles through phrases with a decode/scramble transition. */
export function ScrambleText({
  phrases,
  start,
  interval = 2800,
  className,
}: {
  phrases: string[];
  start: boolean;
  interval?: number;
  className?: string;
}) {
  const [chars, setChars] = useState<Char[]>(() => toChars(phrases[0]));
  const current = useRef(phrases[0]);

  useEffect(() => {
    if (!start || prefersReducedMotion()) return;
    let raf = 0;
    let timeout = 0;
    let index = 0;

    const scrambleTo = (next: string) => {
      const from = current.current;
      const length = Math.max(from.length, next.length);
      const queue = Array.from({ length }, (_, k) => {
        const begin = Math.floor(Math.random() * 14);
        return { from: from[k] ?? "", to: next[k] ?? "", begin, end: begin + 10 + Math.floor(Math.random() * 18) };
      });
      let frame = 0;
      const update = () => {
        let done = 0;
        const out: Char[] = [];
        for (const q of queue) {
          if (frame >= q.end) {
            done++;
            if (q.to) out.push({ c: q.to, scrambling: false });
          } else if (frame >= q.begin) {
            out.push({ c: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], scrambling: true });
          } else if (q.from) {
            out.push({ c: q.from, scrambling: false });
          }
        }
        setChars(out);
        if (done === queue.length) {
          current.current = next;
          timeout = window.setTimeout(() => {
            index = (index + 1) % phrases.length;
            scrambleTo(phrases[index]);
          }, interval);
        } else {
          frame++;
          raf = requestAnimationFrame(update);
        }
      };
      update();
    };

    timeout = window.setTimeout(() => {
      index = 1 % phrases.length;
      scrambleTo(phrases[index]);
    }, interval);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [start, phrases, interval]);

  return (
    <span className={className} aria-hidden="true">
      {chars.map((ch, i) => (
        <span key={i} className={ch.scrambling ? "text-accent-2/70" : undefined}>
          {ch.c}
        </span>
      ))}
    </span>
  );
}
