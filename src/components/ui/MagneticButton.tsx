import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { hasFinePointer } from "../../lib/env";

type Variant = "primary" | "outline";

type Props = {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  onClick?: () => void;
  download?: boolean;
  external?: boolean;
  cursor?: string;
  className?: string;
  ariaLabel?: string;
};

const base =
  "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-sm font-medium tracking-tight select-none";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg",
  outline: "border border-line-strong text-fg bg-white/[0.02] backdrop-blur-sm",
};

/** Button/link that drifts toward the cursor, with a gradient fill on hover. */
export function MagneticButton({
  children,
  variant = "primary",
  href,
  onClick,
  download,
  external,
  cursor,
  className = "",
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [fine] = useState(hasFinePointer);
  const x = useSpring(0, { stiffness: 200, damping: 14, mass: 0.4 });
  const y = useSpring(0, { stiffness: 200, damping: 14, mass: 0.4 });
  const innerX = useTransform(x, (v) => v * 0.35);
  const innerY = useTransform(y, (v) => v * 0.35);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!fine || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <>
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-bottom scale-y-0 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 ${
          variant === "primary" ? "bg-gradient-to-r from-accent to-accent-2" : "bg-white/[0.07]"
        }`}
      />
      <motion.span
        style={{ x: innerX, y: innerY }}
        className={`relative z-10 inline-flex items-center gap-2 transition-colors duration-300 ${
          variant === "primary" ? "group-hover:text-white" : ""
        }`}
      >
        {children}
      </motion.span>
    </>
  );

  const shared = {
    style: { x, y },
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    className: `${base} ${variants[variant]} ${className}`,
    "data-cursor": cursor,
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <motion.a
        ref={(el: HTMLAnchorElement | null) => {
          ref.current = el;
        }}
        href={href}
        download={download || undefined}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={onClick}
        {...shared}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={(el: HTMLButtonElement | null) => {
        ref.current = el;
      }}
      type="button"
      onClick={onClick}
      {...shared}
    >
      {content}
    </motion.button>
  );
}
