import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ease } from "../../lib/motion";

type Props = { children: ReactNode; delay?: number; y?: number; className?: string };

/** Fade-and-rise when scrolled into view (once). */
export function Reveal({ children, delay = 0, y = 24, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
