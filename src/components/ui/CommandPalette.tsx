import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ArrowUpRight, CornerDownLeft, Download, Hash, Mail, Search } from "lucide-react";
import { profile, sections } from "../../data/resume";
import { scrollToId, lockScroll } from "../../lib/scroll";
import { copyText } from "../../lib/clipboard";
import { ease } from "../../lib/motion";
import { useToast } from "./Toast";
import { GitHubIcon, LinkedInIcon } from "./BrandIcons";

type Action = { id: string; label: string; group: string; icon: ReactNode; run: () => void };

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

/** ⌘K / Ctrl+K palette for jumping around the site and quick actions. */
export function CommandPalette({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const toast = useToast();

  const actions = useMemo<Action[]>(
    () => [
      ...sections.map((s) => ({
        id: s.id,
        label: `Go to ${s.label}`,
        group: "Navigate",
        icon: <Hash className="size-4" />,
        run: () => scrollToId(s.id),
      })),
      {
        id: "top",
        label: "Back to top",
        group: "Navigate",
        icon: <ArrowUp className="size-4" />,
        run: () => scrollToId("top"),
      },
      {
        id: "copy",
        label: "Copy email address",
        group: "Actions",
        icon: <Mail className="size-4" />,
        run: async () => {
          if (await copyText(profile.email)) toast("Email copied to clipboard");
        },
      },
      {
        id: "resume",
        label: "Download resume (PDF)",
        group: "Actions",
        icon: <Download className="size-4" />,
        run: () => {
          const a = document.createElement("a");
          a.href = profile.resume;
          a.download = "Kapil_Adhithya_N_Resume.pdf";
          a.click();
        },
      },
      {
        id: "gh",
        label: "Open GitHub",
        group: "Links",
        icon: <GitHubIcon />,
        run: () => window.open(profile.github, "_blank", "noopener"),
      },
      {
        id: "li",
        label: "Open LinkedIn",
        group: "Links",
        icon: <LinkedInIcon />,
        run: () => window.open(profile.linkedin, "_blank", "noopener"),
      },
    ],
    [toast],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
  }, [actions, query]);

  // Global shortcut.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setIndex(0);
    lockScroll(true);
    const t = window.setTimeout(() => input.current?.focus(), 30);
    return () => {
      window.clearTimeout(t);
      lockScroll(false);
      restoreFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const run = (action: Action | undefined) => {
    if (!action) return;
    onOpenChange(false);
    // Let the palette close (and scroll unlock) before navigating.
    window.setTimeout(action.run, 60);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[index]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onOpenChange(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-surface/90 shadow-2xl shadow-black/70 backdrop-blur-xl"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-muted" aria-hidden="true" />
              <input
                ref={input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                placeholder="Type a command or search…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={filtered[index] ? `cmd-${filtered[index].id}` : undefined}
                className="h-14 flex-1 bg-transparent text-[15px] text-fg placeholder:text-muted focus:outline-none"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
            </div>
            <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
              {filtered.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">No results for “{query}”</li>
              )}
              {filtered.map((a, i) => {
                const header = a.group !== lastGroup ? a.group : null;
                lastGroup = a.group;
                return (
                  <li key={a.id} role="presentation">
                    {header && (
                      <p className="px-3 pt-3 pb-1.5 font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                        {header}
                      </p>
                    )}
                    <div
                      id={`cmd-${a.id}`}
                      role="option"
                      aria-selected={i === index}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => run(a)}
                      className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        i === index ? "text-fg" : "text-muted"
                      }`}
                    >
                      {i === index && (
                        <motion.span
                          layoutId="palette-active"
                          className="absolute inset-0 rounded-xl border border-line bg-white/[0.06]"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <span className="relative text-muted">{a.icon}</span>
                      <span className="relative flex-1">{a.label}</span>
                      {i === index && (
                        <span className="relative text-muted">
                          {a.group === "Links" ? (
                            <ArrowUpRight className="size-4" />
                          ) : (
                            <CornerDownLeft className="size-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
