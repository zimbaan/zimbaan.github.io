import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { profile } from "../../data/resume";
import { scrollToId } from "../../lib/scroll";

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

export function Footer() {
  const [time, setTime] = useState(() => timeFormat.format(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setTime(timeFormat.format(new Date())), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-base font-semibold text-fg">
            kapil<span className="text-accent">.</span>ai
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} {profile.name}. Designed & built by {profile.name}.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <p className="font-mono text-xs">
            <span className="mr-2 inline-block size-1.5 rounded-full bg-ok align-middle" aria-hidden="true" />
            {time} IST
          </p>
          <button
            type="button"
            onClick={() => scrollToId("top")}
            className="group inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-fg transition-colors hover:border-line-strong"
          >
            Back to top
            <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
