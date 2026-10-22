import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently crossing the middle of the viewport.
 * Sections may mount later (they are lazy-loaded), so it keeps watching until all are found.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observed = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    const attach = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && !observed.has(id)) {
          io.observe(el);
          observed.add(id);
        }
      }
      if (observed.size === ids.length) mo.disconnect();
    };
    const mo = new MutationObserver(attach);
    mo.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });
    attach();
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ids]);

  return active;
}
