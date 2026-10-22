import { useCallback, useState } from "react";
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
import { About } from "./components/sections/About";
import { Skills } from "./components/sections/Skills";
import { Experience } from "./components/sections/Experience";
import { Projects } from "./components/sections/Projects";
import { Education } from "./components/sections/Education";
import { Contact } from "./components/sections/Contact";
import { Footer } from "./components/sections/Footer";

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
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Education />
          <Contact />
        </main>
        <Footer />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </ToastProvider>
    </MotionConfig>
  );
}
