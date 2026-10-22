import { useEffect, useRef } from "react";
import { hasFinePointer } from "../lib/env";
import {
  buildNetwork,
  createPulses,
  LITE_LAYERS,
  layerColor,
  mulberry32,
  pulsePoint,
  stepPulses,
  TRAIL,
  TRAIL_STEP,
  type Vec3,
} from "./network";

const CAMERA_Z = 16;
const HALF_FOV_TAN = Math.tan((45 / 2) * (Math.PI / 180));
const SPRITE = 64;

/** Pre-renders a glow sprite matching the WebGL point shader's falloff. */
function makeSprite([r, g, b]: [number, number, number]) {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(SPRITE, SPRITE);
  const smooth = (e0: number, e1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };
  for (let y = 0; y < SPRITE; y++) {
    for (let x = 0; x < SPRITE; x++) {
      const d = Math.hypot(x + 0.5 - SPRITE / 2, y + 0.5 - SPRITE / 2) / SPRITE;
      const core = smooth(0.5, 0, d);
      const white = smooth(0.12, 0, d) * 0.6;
      const i = (y * SPRITE + x) * 4;
      img.data[i] = r + (255 - r) * white;
      img.data[i + 1] = g + (255 - g) * white;
      img.data[i + 2] = b + (255 - b) * white;
      img.data[i + 3] = core * core * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Dependency-free 2D canvas version of the hero network for phones and low-power devices.
 * Same layout and signal behaviour as the WebGL scene, projected by hand.
 */
export default function HeroCanvas2D({ still }: { still: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const net = buildNetwork(LITE_LAYERS);
    const rand = mulberry32(3);
    const pulses = createPulses(net, 14, rand);
    const activation = new Float32Array(net.nodes.length);
    const sizes = net.nodes.map(() => 14 + rand() * 12);
    const colors = Array.from({ length: net.L }, (_, li) => layerColor(net, li));
    const sprites = colors.map(makeSprite);
    const pulseSprite = makeSprite([140, 230, 245]);
    const edgeStyles = colors.slice(0, -1).map((c, li) => {
      const n = colors[li + 1];
      return [0, 1, 2].map((k) => Math.round((c[k] + n[k]) / 2)).join(",");
    });

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let pointer: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      pointer = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1) };
    };
    if (hasFinePointer()) window.addEventListener("pointermove", onMove, { passive: true });

    let spin = 0;
    let swayX = 0;
    let swayY = 0;
    let swayZ = 0;
    let fade = still ? 1 : 0;
    let time = 0;

    const draw = () => {
      const worldH = 2 * CAMERA_Z * HALF_FOV_TAN;
      const worldW = worldH * (w / h);
      const wide = w / h > 1.25;
      const scale = wide ? Math.min(1.05, worldW / 22) : Math.min(0.9, worldW / 9.5);
      const offX = wide ? worldW * 0.17 : 0;
      const offY = wide ? 0 : worldH * 0.2;
      const ay = -0.5 + spin;
      const tilt = 0.15;
      const focal = h / 2 / HALF_FOV_TAN;

      const project = (p: Vec3) => {
        let { x, y, z } = p;
        // Inner sway (pointer-driven), then outer scale → rotate Y → rotate X → translate.
        [x, y] = [x * Math.cos(swayZ) - y * Math.sin(swayZ), x * Math.sin(swayZ) + y * Math.cos(swayZ)];
        [y, z] = [y * Math.cos(swayX) - z * Math.sin(swayX), y * Math.sin(swayX) + z * Math.cos(swayX)];
        y += swayY;
        x *= scale;
        y *= scale;
        z *= scale;
        [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
        [y, z] = [y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
        const depth = CAMERA_Z - z;
        const k = focal / depth;
        return { sx: w / 2 + (x + offX) * k, sy: h / 2 - (y + offY) * k, depth };
      };

      const pts = net.nodes.map(project);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // Edges, batched per layer pair.
      ctx.lineWidth = 1;
      for (let li = 0; li < net.L - 1; li++) {
        ctx.strokeStyle = `rgba(${edgeStyles[li]},${0.16 * fade})`;
        ctx.beginPath();
        for (const a of net.layers[li]) {
          for (const e of net.outgoing[a]) {
            const b = net.edges[e][1];
            ctx.moveTo(pts[a].sx, pts[a].sy);
            ctx.lineTo(pts[b].sx, pts[b].sy);
          }
        }
        ctx.stroke();
      }

      // Nodes
      pts.forEach((p, i) => {
        const act = activation[i];
        const size = (sizes[i] * (1 + act * 1.4) * 12) / p.depth;
        ctx.globalAlpha = fade * (0.55 + act * 0.45);
        ctx.drawImage(sprites[net.layerOf[i]], p.sx - size / 2, p.sy - size / 2, size, size);
      });

      // Pulses with comet trails
      for (const pulse of pulses) {
        for (let j = 0; j < TRAIL; j++) {
          const p = project(pulsePoint(net, pulse, Math.max(0, pulse.t - j * TRAIL_STEP)));
          const fall = 1 - j / TRAIL;
          const size = ((22 * fall + 4) * 0.9 * 12) / p.depth;
          ctx.globalAlpha = fade * (j === 0 ? 0.85 : 0.55);
          ctx.drawImage(pulseSprite, p.sx - size / 2, p.sy - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let last = performance.now();
    let visible = true;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      fade = Math.min(1, fade + dt * 0.6);
      spin += dt * 0.06;
      const px = pointer ? pointer.x : Math.sin(time * 0.3) * 0.5;
      const py = pointer ? pointer.y : Math.cos(time * 0.25) * 0.3;
      const k = 1 - Math.exp(-dt * 2.5);
      swayX += (-py * 0.35 - swayX) * k;
      swayY += (py * 0.4 - swayY) * k;
      swayZ += (px * 0.12 - swayZ) * k;
      stepPulses(net, pulses, activation, dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (still || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    draw();
    if (visible) start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [still]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />;
}
