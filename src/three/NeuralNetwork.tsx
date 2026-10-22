import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  buildNetwork,
  createPulses,
  FULL_LAYERS,
  layerColor,
  mulberry32,
  pulsePoint,
  stepPulses,
  TRAIL,
  TRAIL_STEP,
  type Network,
  type Pulse,
} from "./network";

/** Normalised pointer position, or null when there is no mouse (the scene then sways on its own). */
export type PointerRef = RefObject<{ x: number; y: number } | null>;

type Props = { still: boolean; pointer: PointerRef };

const PULSE_COLOR = new THREE.Color("#22d3ee");
const WHITE = new THREE.Color("#ffffff");
const PULSE_COUNT = 44;

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aActive;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uScale;
  varying vec3 vColor;
  varying float vActive;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (1.0 + aActive * 1.4) * uPixelRatio * uScale * (12.0 / -mv.z);
    vColor = aColor;
    vActive = aActive;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vActive;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float glow = core * core;
    vec3 col = mix(vColor, vec3(1.0), clamp(vActive * 0.7 + smoothstep(0.12, 0.0, d) * 0.6, 0.0, 1.0));
    gl_FragColor = vec4(col, glow * uOpacity * (0.55 + vActive * 0.45));
  }
`;

function pointsMaterial(pixelRatio: number, scale: number, opacity: number) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uPixelRatio: { value: pixelRatio },
      uScale: { value: scale },
      uOpacity: { value: opacity },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function writePulsePositions(net: Network, pulses: Pulse[], geo: THREE.BufferGeometry) {
  const attr = geo.getAttribute("position") as THREE.BufferAttribute;
  const arr = attr.array as Float32Array;
  pulses.forEach((p, i) => {
    for (let j = 0; j < TRAIL; j++) {
      const v = pulsePoint(net, p, Math.max(0, p.t - j * TRAIL_STEP));
      arr.set([v.x, v.y, v.z], (i * TRAIL + j) * 3);
    }
  });
  attr.needsUpdate = true;
}

export function NeuralNetwork({ still, pointer }: Props) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const fade = useRef(still ? 1 : 0);
  const { viewport, gl } = useThree();

  const net = useMemo(() => buildNetwork(FULL_LAYERS), []);

  const { nodeGeo, nodeMat, activation, edgeGeo, edgeMat, pulseGeo, pulseMat, pulses } = useMemo(() => {
    const pr = Math.min(gl.getPixelRatio(), 1.5);
    const n = net.nodes.length;
    const rand = mulberry32(3);

    // Nodes
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const act = new Float32Array(n);
    net.nodes.forEach((v, i) => {
      pos.set([v.x, v.y, v.z], i * 3);
      col.set(
        layerColor(net, net.layerOf[i]).map((c) => c / 255),
        i * 3,
      );
      size[i] = 14 + rand() * 12;
    });
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    nodeGeo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    nodeGeo.setAttribute("aActive", new THREE.BufferAttribute(act, 1));

    // Edges, coloured by the layer at each end.
    const ePos = new Float32Array(net.edges.length * 6);
    const eCol = new Float32Array(net.edges.length * 6);
    net.edges.forEach(([a, b], i) => {
      ePos.set([net.nodes[a].x, net.nodes[a].y, net.nodes[a].z, net.nodes[b].x, net.nodes[b].y, net.nodes[b].z], i * 6);
      eCol.set([...col.subarray(a * 3, a * 3 + 3), ...col.subarray(b * 3, b * 3 + 3)], i * 6);
    });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
    edgeGeo.setAttribute("color", new THREE.BufferAttribute(eCol, 3));
    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: still ? 0.16 : 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Signal pulses, each drawn as a short comet trail of points.
    const pulses = createPulses(net, PULSE_COUNT, rand);
    const pPos = new Float32Array(PULSE_COUNT * TRAIL * 3);
    const pCol = new Float32Array(PULSE_COUNT * TRAIL * 3);
    const pSize = new Float32Array(PULSE_COUNT * TRAIL);
    const pAct = new Float32Array(PULSE_COUNT * TRAIL);
    for (let i = 0; i < PULSE_COUNT; i++) {
      for (let j = 0; j < TRAIL; j++) {
        const k = i * TRAIL + j;
        const fall = 1 - j / TRAIL;
        PULSE_COLOR.clone()
          .lerp(WHITE, 0.35 * fall)
          .toArray(pCol, k * 3);
        pSize[k] = 22 * fall + 4;
        pAct[k] = j === 0 ? 0.6 : 0;
      }
    }
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pulseGeo.setAttribute("aColor", new THREE.BufferAttribute(pCol, 3));
    pulseGeo.setAttribute("aSize", new THREE.BufferAttribute(pSize, 1));
    pulseGeo.setAttribute("aActive", new THREE.BufferAttribute(pAct, 1));
    writePulsePositions(net, pulses, pulseGeo);

    return {
      nodeGeo,
      nodeMat: pointsMaterial(pr, 1, still ? 1 : 0),
      activation: act,
      edgeGeo,
      edgeMat,
      pulseGeo,
      pulseMat: pointsMaterial(pr, 0.9, still ? 1 : 0),
      pulses,
    };
  }, [net, still, gl]);

  useEffect(
    () => () => {
      [nodeGeo, edgeGeo, pulseGeo].forEach((g) => g.dispose());
      [nodeMat, edgeMat, pulseMat].forEach((m) => m.dispose());
    },
    [nodeGeo, edgeGeo, pulseGeo, nodeMat, edgeMat, pulseMat],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    if (fade.current < 1) fade.current = Math.min(1, fade.current + dt * 0.6);
    nodeMat.uniforms.uOpacity.value = fade.current;
    pulseMat.uniforms.uOpacity.value = fade.current;
    edgeMat.opacity = 0.16 * fade.current;

    if (outer.current && inner.current) {
      outer.current.rotation.y += dt * 0.06;
      const px = pointer.current ? pointer.current.x : Math.sin(time * 0.3) * 0.5;
      const py = pointer.current ? pointer.current.y : Math.cos(time * 0.25) * 0.3;
      const k = 1 - Math.exp(-dt * 2.5);
      inner.current.rotation.x += (-py * 0.35 - inner.current.rotation.x) * k;
      inner.current.rotation.z += (px * 0.12 - inner.current.rotation.z) * k;
      inner.current.position.y += (py * 0.4 - inner.current.position.y) * k;
    }

    stepPulses(net, pulses, activation, dt);
    writePulsePositions(net, pulses, pulseGeo);
    (nodeGeo.getAttribute("aActive") as THREE.BufferAttribute).needsUpdate = true;
  });

  // Wide screens: push the network right so it frames the hero text.
  // Portrait: enlarge it and lift it into the space above the name.
  const wide = viewport.aspect > 1.25;
  const scale = wide ? Math.min(1.05, viewport.width / 22) : Math.min(0.9, viewport.width / 9.5);
  const position: [number, number, number] = wide ? [viewport.width * 0.17, 0, 0] : [0, viewport.height * 0.2, 0];

  return (
    <group ref={outer} position={position} scale={scale} rotation={[0.15, -0.5, 0]}>
      <group ref={inner}>
        <lineSegments geometry={edgeGeo} material={edgeMat} />
        <points geometry={nodeGeo} material={nodeMat} />
        <points geometry={pulseGeo} material={pulseMat} />
      </group>
    </group>
  );
}
