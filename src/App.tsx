import { lazy, Suspense, useCallback, useState } from "react";
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

const BelowFold = lazy(() => import("./components/sections/BelowFold"));

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
          <Suspense fallback={<div className="min-h-[100svh]" />}>
            <BelowFold />
          </Suspense>
        </main>
        <Footer />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </ToastProvider>
    </MotionConfig>
  );
}
