import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { ease } from "../../lib/motion";

const line: Variants = {
  hidden: { y: "105%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 0.9, ease, delay: i * 0.08 } }),
};

type Props = {
  lines: ReactNode[];
  className?: string;
  /** Classes for each clipping mask (e.g. padding so descenders are not cut off). */
  maskClassName?: string;
  /** Classes for each sliding line. */
  lineClassName?: string;
};

/**
 * Heading whose lines slide up from behind a mask. The reveal is triggered by the heading itself:
 * the lines start fully clipped by their masks, so an observer on a line would never see it.
 */
export function MaskedHeading({ lines, className, maskClassName = "pb-[0.1em]", lineClassName = "" }: Props) {
  return (
    <motion.h2
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {lines.map((content, i) => (
        <span key={i} className={`block overflow-hidden ${maskClassName}`}>
          <motion.span data-line className={`block ${lineClassName}`} variants={line} custom={i}>
            {content}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}
