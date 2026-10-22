import { Suspense, useCallback, useState } from "react";
import { MotionConfig } from "motion/react";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { ToastProvider } from "./components/ui/Toast";
import { Background } from "./components/ui/Background";
import { Cursor } from "./components/ui/Cursor";
import { ScrollProgress } from "./components/ui/ScrollProgress";
import { CommandPalette } from "./components/ui/CommandPalette";
import { Preloader } from "./components/sections/Preloader";
import { Navbar } from "./components/sections/Navbar";
import { Hero } from "./components/sections/Hero";
import { Footer } from "./components/sections/Footer";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { lazyRetry } from "./lib/lazyRetry";

const BelowFold = lazyRetry(() => import("./components/sections/BelowFold"));

function SectionsFailed() {
  return (
    <div className="container-x flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-muted">The rest of the page couldn't load. Your connection may have dropped.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full border border-line-strong px-5 py-2.5 text-sm text-fg hover:bg-white/[0.06]"
      >
        Try again
      </button>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  useSmoothScroll();

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <Preloader onDone={onReady} />
        <Background />
        <Cursor />
        <ScrollProgress />
        <Navbar onOpenPalette={openPalette} />
        <main id="main">
          <Hero ready={ready} />
          {/* Placeholder height keeps the footer below the fold while the chunk loads. */}
          <ErrorBoundary fallback={<SectionsFailed />}>
            <Suspense fallback={<div className="min-h-[100svh]" />}>
              <BelowFold />
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </ToastProvider>
    </MotionConfig>
  );
}
