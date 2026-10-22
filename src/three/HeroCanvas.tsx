import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { NeuralNetwork } from "./NeuralNetwork";
import { hasFinePointer } from "../lib/env";

/** Lazy-loaded WebGL hero background (capable devices only). Pauses when scrolled offscreen. */
export default function HeroCanvas({ still }: { still: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    if (hasFinePointer()) window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 16], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={still ? "demand" : inView ? "always" : "never"}
      >
        <NeuralNetwork still={still} pointer={pointer} />
      </Canvas>
    </div>
  );
}
