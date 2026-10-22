import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Command, Menu, X } from "lucide-react";
import { profile, sections } from "../../data/resume";
import { useActiveSection } from "../../hooks/useActiveSection";
import { lockScroll, scrollToId } from "../../lib/scroll";
import { ease } from "../../lib/motion";
import { GitHubIcon, LinkedInIcon } from "../ui/BrandIcons";

const ids = sections.map((s) => s.id);
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

export function Navbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(ids);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240);
    setScrolled(y > 24);
  });

  useEffect(() => {
    if (!menuOpen) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const go = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToId(id), menuOpen ? 80 : 0);
  };

  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[120] -translate-y-20 rounded-full bg-fg px-4 py-2 text-sm text-bg focus:translate-y-0"
      >
        Skip to content
      </a>

      <motion.header
        initial={false}
        animate={{ y: hidden && !menuOpen ? "-120%" : "0%" }}
        transition={{ duration: 0.45, ease }}
        className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4"
      >
        <div className="container-x">
          <nav
            aria-label="Primary"
            className={`flex h-14 items-center justify-between rounded-full border pr-2 pl-5 transition-[background-color,border-color] duration-500 ${
              scrolled || menuOpen ? "border-line bg-bg/80 backdrop-blur-md" : "border-transparent bg-transparent"
            }`}
          >
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                go("top");
              }}
              className="font-display text-lg font-semibold tracking-tight"
              aria-label="Kapil Adhithya N, back to top"
            >
              kapil<span className="text-accent">.</span>ai
            </a>

            <ul className="hidden items-center gap-1 md:flex">
              {sections.map((s) => {
                const isActive = active === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(s.id);
                      }}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative block rounded-full px-3.5 py-2 text-sm transition-colors duration-300 ${
                        isActive ? "text-fg" : "text-muted hover:text-fg"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full border border-line bg-white/[0.07]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative">{s.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label="Open command palette"
                className="hidden h-10 items-center gap-1.5 rounded-full border border-line px-3.5 font-mono text-xs text-muted transition-colors hover:border-line-strong hover:text-fg sm:flex"
              >
                {isMac ? <Command className="size-3.5" aria-hidden="true" /> : <span>Ctrl</span>}
                <span>K</span>
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="grid size-10 place-items-center rounded-full border border-line md:hidden"
              >
                {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-bg/[0.98] px-6 pt-28 pb-10 md:hidden"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.6, ease }}
          >
            <ul className="space-y-1">
              {sections.map((s, i) => (
                <li key={s.id} className="overflow-hidden">
                  <motion.a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(s.id);
                    }}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.6, ease, delay: 0.12 + i * 0.05 }}
                    className="flex items-baseline gap-4 py-1.5 font-display text-[2.6rem] leading-tight font-semibold tracking-tight"
                  >
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
                    <span className={active === s.id ? "text-fg" : "text-fg/80"}>{s.label}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex items-center justify-between border-t border-line pt-6 text-sm text-muted"
            >
              <a href={`mailto:${profile.email}`} className="truncate pr-4">
                {profile.email}
              </a>
              <div className="flex gap-3">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="grid size-10 place-items-center rounded-full border border-line"
                >
                  <GitHubIcon />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="grid size-10 place-items-center rounded-full border border-line"
                >
                  <LinkedInIcon />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
