// Layered "neural network" shared by the WebGL hero and the lightweight 2D canvas fallback.
// Kept free of three.js so the 2D version never pulls it in.

export type Vec3 = { x: number; y: number; z: number };
export type Pulse = { edge: number; t: number; speed: number };
export type Network = ReturnType<typeof buildNetwork>;

export const FULL_LAYERS = [12, 22, 30, 30, 22, 12];
export const LITE_LAYERS = [6, 10, 12, 10, 6];

export const VIOLET: [number, number, number] = [124, 92, 255];
export const CYAN: [number, number, number] = [34, 211, 238];

/** Deterministic PRNG so the network looks the same on every load. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dist2 = (a: Vec3, b: Vec3) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;

export function buildNetwork(layerCounts: number[]) {
  const rand = mulberry32(11);
  const nodes: Vec3[] = [];
  const layerOf: number[] = [];
  const layers: number[][] = [];
  const spacing = 3.1;
  const L = layerCounts.length;

  layerCounts.forEach((count, li) => {
    const x = (li - (L - 1) / 2) * spacing;
    const radius = 1.2 + Math.sqrt(count) * 0.62;
    const ids: number[] = [];
    for (let i = 0; i < count; i++) {
      // Fibonacci disc in the y/z plane, jittered so it does not look like a grid.
      const r = radius * Math.sqrt((i + 0.5) / count);
      const theta = i * 2.39996323 + li;
      nodes.push({
        x: x + (rand() - 0.5) * 0.9,
        y: r * Math.cos(theta) + (rand() - 0.5) * 0.3,
        z: r * Math.sin(theta) + (rand() - 0.5) * 0.3,
      });
      layerOf.push(li);
      ids.push(nodes.length - 1);
    }
    layers.push(ids);
  });

  const edges: [number, number][] = [];
  const outgoing: number[][] = nodes.map(() => []);
  for (let li = 0; li < L - 1; li++) {
    const next = layers[li + 1];
    for (const a of layers[li]) {
      const byDistance = [...next].sort((p, q) => dist2(nodes[a], nodes[p]) - dist2(nodes[a], nodes[q]));
      const picks = new Set<number>();
      const k = Math.min(3, next.length);
      while (picks.size < k) {
        picks.add(byDistance[Math.floor(rand() ** 2 * Math.min(byDistance.length, 9))]);
      }
      for (const b of picks) {
        outgoing[a].push(edges.length);
        edges.push([a, b]);
      }
    }
  }
  return { nodes, layerOf, layers, edges, outgoing, L };
}

/** RGB for a node, blending violet → cyan across the layers. */
export function layerColor(net: Network, layer: number): [number, number, number] {
  const t = layer / (net.L - 1);
  return [0, 1, 2].map((k) => Math.round(VIOLET[k] + (CYAN[k] - VIOLET[k]) * t)) as [number, number, number];
}

export function createPulses(net: Network, count: number, rand: () => number): Pulse[] {
  return Array.from({ length: count }, () => ({
    edge: Math.floor(rand() * net.edges.length),
    t: rand(),
    speed: 0.45 + rand() * 0.5,
  }));
}

/** Advance the signals; when one reaches a node, light that node and hop to one of its outgoing edges. */
export function stepPulses(net: Network, pulses: Pulse[], activation: Float32Array, dt: number) {
  for (const p of pulses) {
    p.t += p.speed * dt;
    if (p.t < 1) continue;
    const target = net.edges[p.edge][1];
    activation[target] = 1;
    const out = net.outgoing[target];
    if (out.length) {
      p.edge = out[Math.floor(Math.random() * out.length)];
    } else {
      const first = net.layers[0][Math.floor(Math.random() * net.layers[0].length)];
      activation[first] = 1;
      const firstOut = net.outgoing[first];
      p.edge = firstOut[Math.floor(Math.random() * firstOut.length)];
    }
    p.t = 0;
  }
  const decay = Math.exp(-dt * 2.2);
  for (let i = 0; i < activation.length; i++) activation[i] *= decay;
}

/** Point `t` of the way along a pulse's current edge. */
export function pulsePoint(net: Network, p: Pulse, t: number): Vec3 {
  const [a, b] = net.edges[p.edge];
  const A = net.nodes[a];
  const B = net.nodes[b];
  return { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t, z: A.z + (B.z - A.z) * t };
}

export const TRAIL = 5;
export const TRAIL_STEP = 0.045;
