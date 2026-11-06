'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Cloud, Clouds, Stars, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from 'react';
import * as THREE from 'three';
import type { PaletteName } from './palettes';

type Pointer = { x: number; y: number };
type Props = {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<Pointer>;
  palette: PaletteName;
  active: boolean;
  onReady?: () => void;
};

/* ================================================================== noise */
function hash(x: number, y: number, s: number) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x: number, y: number, s: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s),
    b = hash(xi + 1, yi, s),
    c = hash(xi, yi + 1, s),
    d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, s: number, o = 5) {
  let sum = 0,
    amp = 0.5,
    f = 1,
    n = 0;
  for (let i = 0; i < o; i++) {
    sum += amp * vnoise(x * f, y * f, s + i * 17);
    n += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return sum / n;
}
/** Ridged multifractal: sharp crests + branching gullies (erosion look). */
function ridged(x: number, y: number, s: number, o = 5) {
  let sum = 0,
    amp = 0.5,
    f = 1,
    n = 0,
    prev = 1;
  for (let i = 0; i < o; i++) {
    let r = 1 - Math.abs(vnoise(x * f, y * f, s + i * 31) * 2 - 1);
    r *= r;
    sum += amp * r * prev;
    prev = Math.min(1, r * 1.6);
    n += amp;
    amp *= 0.5;
    f *= 2.1;
  }
  return sum / n;
}
const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cooperative scheduling: long generators hand control back to the browser every ~10 ms,
 *  so the preloader and intro never stutter while the valley is being painted. */
type Tick = () => Promise<void>;
function makeTick(ms = 10): Tick {
  let t = performance.now();
  return async () => {
    if (performance.now() - t > ms) {
      await new Promise<void>((r) => setTimeout(r, 0));
      t = performance.now();
    }
  };
}

/* ================================================================== time-of-day looks */
type V3 = [number, number, number];
type Look = {
  top: string;
  horizon: string;
  below: string;
  sun: string;
  sunDir: V3;
  disc: number;
  glow: number;
  fog: string;
  light: string;
  intensity: number;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  tint: V3;
  alpen: V3;
  haze: number;
  cloud: string;
  shadow: number;
  lights: number;
};
const LOOKS: Record<PaletteName, Look> = {
  day: {
    top: '#1c5ccc', horizon: '#a9c9ec', below: '#9db7d2', sun: '#fff3da', sunDir: [0.42, 0.66, 0.62], disc: 0, glow: 1,
    fog: '#a6c2e0', light: '#fff2df', intensity: 3.3, hemiSky: '#d2e4ff', hemiGround: '#5d543f', hemi: 1.3,
    tint: [1, 1, 1], alpen: [0, 0, 0], haze: 0.14, cloud: '#ffffff', shadow: 0.42, lights: 0,
  },
  dawn: {
    top: '#22356f', horizon: '#f0a98e', below: '#b48e8c', sun: '#ffc79a', sunDir: [0.6, 0.1, -0.79], disc: 1.4, glow: 1,
    fog: '#c39a98', light: '#ffbe94', intensity: 3.0, hemiSky: '#a8b4ea', hemiGround: '#4b3b36', hemi: 1.25,
    tint: [0.9, 0.74, 0.78], alpen: [0.34, 0.11, 0.12], haze: 0.24, cloud: '#ffe2d6', shadow: 0.26, lights: 0.35,
  },
  golden: {
    top: '#28377a', horizon: '#f6ae72', below: '#c4977a', sun: '#ffcf7e', sunDir: [-0.56, 0.12, -0.82], disc: 1.4, glow: 1,
    fog: '#d1a283', light: '#ffc583', intensity: 3.2, hemiSky: '#b4b0e4', hemiGround: '#4b3826', hemi: 1.3,
    tint: [1.0, 0.8, 0.62], alpen: [0.34, 0.15, 0.03], haze: 0.22, cloud: '#ffdcb6', shadow: 0.3, lights: 0.2,
  },
  night: {
    top: '#02060f', horizon: '#16264b', below: '#0e1831', sun: '#d6e2ff', sunDir: [-0.3, 0.25, -0.92], disc: 0.9, glow: 0.18,
    fog: '#132244', light: '#9fb4e6', intensity: 1.0, hemiSky: '#4a62a0', hemiGround: '#0c1019', hemi: 0.7,
    tint: [0.17, 0.21, 0.34], alpen: [0.03, 0.04, 0.08], haze: 0.2, cloud: '#6b7ca5', shadow: 0.08, lights: 1,
  },
};
const FOG_DENSITY = 0.00082;

function makeLive(p: PaletteName) {
  const L = LOOKS[p];
  return {
    top: new THREE.Color(L.top),
    horizon: new THREE.Color(L.horizon),
    below: new THREE.Color(L.below),
    sun: new THREE.Color(L.sun),
    sunDir: new THREE.Vector3(...L.sunDir).normalize(),
    disc: { value: L.disc },
    glow: { value: L.glow },
    fog: new THREE.Color(L.fog),
    light: new THREE.Color(L.light),
    intensity: L.intensity,
    hemiSky: new THREE.Color(L.hemiSky),
    hemiGround: new THREE.Color(L.hemiGround),
    hemi: L.hemi,
    tint: new THREE.Vector3(...L.tint),
    alpen: new THREE.Vector3(...L.alpen),
    haze: { value: L.haze },
    cloud: new THREE.Color(L.cloud),
    shadow: { value: L.shadow },
    lights: { value: L.lights },
    time: { value: 0 },
  };
}
type Live = ReturnType<typeof makeLive>;

/** Eases every colour/light toward the active look so palette switches crossfade instead of snapping. */
function Director({ palette, live, clouds }: { palette: PaletteName; live: Live; clouds: RefObject<THREE.Group | null> }) {
  const { scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const tmp = useMemo(() => ({ c: new THREE.Color(), v: new THREE.Vector3() }), []);
  useLayoutEffect(() => {
    const fog = new THREE.FogExp2(0xffffff, FOG_DENSITY);
    fog.color = live.fog;
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, live]);
  useFrame((state, dt) => {
    const L = LOOKS[palette];
    const k = 1 - Math.pow(0.06, Math.min(dt, 0.1));
    const lc = (c: THREE.Color, hex: string) => c.lerp(tmp.c.set(hex), k);
    lc(live.top, L.top);
    lc(live.horizon, L.horizon);
    lc(live.below, L.below);
    lc(live.sun, L.sun);
    lc(live.fog, L.fog);
    lc(live.light, L.light);
    lc(live.hemiSky, L.hemiSky);
    lc(live.hemiGround, L.hemiGround);
    lc(live.cloud, L.cloud);
    live.sunDir.lerp(tmp.v.set(...L.sunDir).normalize(), k).normalize();
    live.tint.lerp(tmp.v.set(...L.tint), k);
    live.alpen.lerp(tmp.v.set(...L.alpen), k);
    live.disc.value += (L.disc - live.disc.value) * k;
    live.glow.value += (L.glow - live.glow.value) * k;
    live.haze.value += (L.haze - live.haze.value) * k;
    live.shadow.value += (L.shadow - live.shadow.value) * k;
    live.lights.value += (L.lights - live.lights.value) * k;
    live.intensity += (L.intensity - live.intensity) * k;
    live.hemi += (L.hemi - live.hemi) * k;
    live.time.value = state.clock.elapsedTime;
    if (sun.current) {
      sun.current.color.copy(live.light);
      sun.current.intensity = live.intensity;
      sun.current.position.copy(live.sunDir).multiplyScalar(1000);
    }
    if (hemi.current) {
      hemi.current.color.copy(live.hemiSky);
      hemi.current.groundColor.copy(live.hemiGround);
      hemi.current.intensity = live.hemi;
    }
    const g = clouds.current;
    if (g)
      for (const c of g.children) {
        const im = c as THREE.InstancedMesh;
        if (im.isInstancedMesh) (im.material as THREE.MeshBasicMaterial).color.copy(live.cloud);
      }
  });
  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight ref={sun} />
    </>
  );
}

/* ================================================================== sky */
function SkyDome({ live }: { live: Live }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: live.top },
          uHorizon: { value: live.horizon },
          uBelow: { value: live.below },
          uSun: { value: live.sun },
          uSunDir: { value: live.sunDir },
          uDisc: live.disc,
          uGlow: live.glow,
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uBelow; uniform vec3 uSun; uniform vec3 uSunDir;
          uniform float uDisc; uniform float uGlow;
          varying vec3 vDir;
          void main() {
            vec3 d = normalize(vDir);
            float e = d.y;
            vec3 col = mix(uHorizon, uTop, pow(clamp(e, 0.0, 1.0), 0.48));
            // bright haze band hugging the horizon
            col = mix(col, uHorizon * 1.04, exp(-max(e, 0.0) * 26.0) * 0.55);
            float mu = max(dot(d, normalize(uSunDir)), 0.0);
            col += uSun * uGlow * (pow(mu, 6.0) * 0.22 + pow(mu, 48.0) * 0.4 + pow(mu, 600.0) * 0.8);
            col += uSun * uDisc * smoothstep(0.99955, 0.99985, mu) * 3.0;
            col = mix(col, uBelow, smoothstep(0.0, -0.06, e));
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [live]
  );
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return (
    <mesh ref={ref} material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[4000, 48, 24]} />
    </mesh>
  );
}

/* ================================================================== the real Dhauladhar, sky keyed out */
const RANGE_ASPECT = 1919 / 291;
const RANGE_W = 4000;
const RANGE_H = RANGE_W / RANGE_ASPECT;
const RANGE_Z = -1800;
const RANGE_TOP = 430;

function Range({ live, map }: { live: Live; map: THREE.Texture }) {
  const mat = useMemo(() => {
    map.wrapS = THREE.MirroredRepeatWrapping;
    map.anisotropy = 8;
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uMap: { value: map }, uTint: { value: live.tint }, uAlpen: { value: live.alpen }, uHaze: { value: live.fog }, uHazeAmt: live.haze },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = vec2(uv.x * 1.16 - 0.08, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform vec3 uTint; uniform vec3 uAlpen; uniform vec3 uHaze; uniform float uHazeAmt;
        varying vec2 vUv;
        void main() {
          vec4 t = texture2D(uMap, vUv);
          if (t.a < 0.004) discard;
          vec3 c = t.rgb;
          float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
          float snow = smoothstep(0.32, 0.85, lum);
          c = c * uTint + uAlpen * snow;
          // thicker air toward the base of the range
          float h = uHazeAmt * mix(2.2, 0.7, smoothstep(0.15, 0.9, vUv.y));
          c = mix(c, uHaze, clamp(h, 0.0, 0.85));
          gl_FragColor = vec4(c, t.a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
  }, [map, live]);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat} position={[0, RANGE_TOP - RANGE_H / 2, RANGE_Z]} renderOrder={-5}>
      <planeGeometry args={[RANGE_W, RANGE_H]} />
    </mesh>
  );
}

/* ================================================================== procedural textures */
function detailCanvas() {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = 'rgb(196,196,196)';
  ctx.fillRect(0, 0, S, S);
  const r = mulberry(11);
  // overlapping tree crowns with a shadow side → forest canopy / field grain at any distance
  for (let i = 0; i < 5200; i++) {
    const x = r() * S,
      y = r() * S,
      rad = 1.4 + r() * r() * 5.5,
      v = Math.round(150 + r() * 105);
    for (const dx of [-S, 0, S])
      for (const dy of [-S, 0, S]) {
        const cx = x + dx,
          cy = y + dy;
        if (cx < -12 || cx > S + 12 || cy < -12 || cy > S + 12) continue;
        ctx.fillStyle = `rgb(${v - 70},${v - 70},${v - 70})`;
        ctx.beginPath();
        ctx.arc(cx + rad * 0.5, cy + rad * 0.5, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
  }
  return cv;
}

/** Tileable soft blobs — drifting cumulus shadows sampled in world space. */
function shadowCanvas() {
  const S = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, S, S);
  const r = mulberry(5);
  for (let i = 0; i < 26; i++) {
    const x = r() * S,
      y = r() * S,
      rad = 14 + r() * 34;
    for (const dx of [-S, 0, S])
      for (const dy of [-S, 0, S]) {
        const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad);
        g.addColorStop(0, 'rgba(255,255,255,0.9)');
        g.addColorStop(0.55, 'rgba(255,255,255,0.45)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x + dx - rad, y + dy - rad, rad * 2, rad * 2);
      }
  }
  return cv;
}

/** Soft cumulus sprite: radial falloff modulated by fbm billows (no hard lobes). */
function puffDataURL() {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d')!;
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = ((x + 0.5) / S) * 2 - 1,
        v = ((y + 0.5) / S) * 2 - 1;
      const r = Math.sqrt(u * u + v * v);
      const n = fbm(u * 2.6 + 5, v * 2.6 + 5, 77, 5);
      const dens = Math.max(0, 1 - r) * 0.95 + n * 0.75 - 0.62;
      const a = sstep(0.0, 0.32, dens) * sstep(1.0, 0.72, r);
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(a * 255);
    }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL('image/png');
}

/* ------------------------------------------------------------------ valley floor: fields, rivers, roads, villages */
const FLOOR = { x0: -560, x1: 560, z0: -700, z1: 100 };
const LANDING = { x: 0, z: -265, w: 170, h: 170 / (1920 / 1079) };

async function valleyCanvas(tick: Tick) {
  const W = 2560;
  const k = W / (FLOOR.x1 - FLOOR.x0);
  const H = Math.round((FLOOR.z1 - FLOOR.z0) * k);
  const cx = (x: number) => (x - FLOOR.x0) * k;
  const cz = (z: number) => (z - FLOOR.z0) * k;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  const r = mulberry(42);
  ctx.fillStyle = '#738c3b';
  ctx.fillRect(0, 0, W, H);

  // terraced plots on a warped grid; crop zones (paddy, wheat, mustard, fallow, orchard) drift across the plain
  const cell = 10;
  const nx = Math.ceil(W / cell) + 3,
    ny = Math.ceil(H / cell) + 3;
  const gx = new Float32Array(nx * ny),
    gy = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    await tick();
    for (let i = 0; i < nx; i++) {
      const bx = (i - 1) * cell,
        by = (j - 1) * cell;
      gx[j * nx + i] = bx + (fbm(bx * 0.004, by * 0.004, 3, 3) - 0.5) * 90 + (r() - 0.5) * cell * 0.7;
      gy[j * nx + i] = by + (fbm(bx * 0.004 + 9, by * 0.004, 4, 3) - 0.5) * 90 + (r() - 0.5) * cell * 0.7;
    }
  }
  const zones: [number, number, number][][] = [
    [[143, 172, 72], [151, 178, 80], [134, 165, 68], [158, 182, 86]], // paddy
    [[178, 178, 98], [188, 182, 108], [170, 172, 92]], // wheat
    [[160, 150, 104], [168, 158, 112], [150, 144, 98]], // fallow
    [[104, 132, 58], [112, 140, 62], [96, 124, 54]], // orchard / tea
  ];
  for (let j = 0; j < ny - 1; j++) {
    await tick();
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i,
        b = a + 1,
        c = a + nx + 1,
        d = a + nx;
      const zn = fbm(i * 0.035, j * 0.035, 7, 3) * 1.15 + (r() - 0.5) * 0.18;
      const zone = zones[zn < 0.46 ? 0 : zn < 0.56 ? 1 : zn < 0.64 ? 2 : 3];
      const base = zone[Math.floor(r() * zone.length)];
      const f = 0.94 + r() * 0.12;
      ctx.fillStyle = `rgb(${Math.round(base[0] * f)},${Math.round(base[1] * f)},${Math.round(base[2] * f)})`;
      ctx.beginPath();
      ctx.moveTo(gx[a], gy[a]);
      ctx.lineTo(gx[b], gy[b]);
      ctx.lineTo(gx[c], gy[c]);
      ctx.lineTo(gx[d], gy[d]);
      ctx.closePath();
      ctx.fill();
    }
  }
  // grassy bunds between terraces (stroked in batches so no single call runs long)
  ctx.strokeStyle = 'rgba(70,86,40,0.16)';
  ctx.lineWidth = 1;
  for (let j0 = 0; j0 < ny; j0 += 24) {
    await tick();
    ctx.beginPath();
    for (let j = j0; j < Math.min(ny, j0 + 24); j++)
      for (let i = 0; i < nx; i++) {
        const a = j * nx + i;
        if (i === 0) ctx.moveTo(gx[a], gy[a]);
        else ctx.lineTo(gx[a], gy[a]);
      }
    ctx.stroke();
  }
  for (let i0 = 0; i0 < nx; i0 += 24) {
    await tick();
    ctx.beginPath();
    for (let i = i0; i < Math.min(nx, i0 + 24); i++)
      for (let j = 0; j < ny; j++) {
        const a = j * nx + i;
        if (j === 0) ctx.moveTo(gx[a], gy[a]);
        else ctx.lineTo(gx[a], gy[a]);
      }
    ctx.stroke();
  }
  // lone trees on field corners → hedgerows
  for (let q = 0; q < nx * ny; q++) {
    if ((q & 2047) === 0) await tick();
    if (r() > 0.11) continue;
    const rad = 0.9 + r() * 1.3;
    ctx.fillStyle = 'rgba(16,24,10,0.55)';
    ctx.beginPath();
    ctx.arc(gx[q] + rad * 0.6, gy[q] + rad * 0.6, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = r() > 0.5 ? '#3b5229' : '#2f4422';
    ctx.beginPath();
    ctx.arc(gx[q], gy[q], rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // large-scale tonal drift so the plain never reads as one flat green
  for (let i = 0; i < 70; i++) {
    const x = r() * W,
      y = r() * H,
      rad = 90 + r() * 280;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, r() > 0.5 ? 'rgba(204,182,96,0.22)' : 'rgba(34,58,24,0.26)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // tree clumps (denser toward the valley walls)
  const tree = (x: number, y: number, rad: number) => {
    ctx.fillStyle = '#1f2b17';
    ctx.beginPath();
    ctx.arc(x + rad * 0.6, y + rad * 0.6, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = r() > 0.5 ? '#34482a' : '#2c3e22';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  };
  const clump = (x: number, y: number, spread: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2,
        d = Math.sqrt(r()) * spread;
      tree(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.3 + r() * 2.2);
    }
  };
  for (let i = 0; i < 170; i++) {
    let x = (r() * 2 - 1) * 560;
    if (r() < 0.55) x = Math.sign(x || 1) * (330 + r() * 230);
    const z = FLOOR.z0 + r() * (FLOOR.z1 - FLOOR.z0);
    if (Math.abs(x - LANDING.x) < LANDING.w * 0.45 && Math.abs(z - LANDING.z) < LANDING.h * 0.45) continue;
    clump(cx(x), cz(z), 8 + r() * 30, 20 + Math.floor(r() * 90));
    await tick();
  }

  // braided, stony river beds with a thread of water, lined by trees
  const river = (x0: number, amp: number, seed: number, wid: number) => {
    const pts: [number, number][] = [];
    for (let z = FLOOR.z0 - 20; z <= FLOOR.z1 + 20; z += 6) {
      const x = x0 + Math.sin(z * 0.0105 + seed) * amp + (fbm(z * 0.01, seed, 9, 3) - 0.5) * amp * 1.4;
      pts.push([cx(x), cz(z)]);
    }
    const stroke = (col: string, w: number) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    };
    pts.forEach(([x, y], i) => i % 3 === 0 && clump(x + (r() - 0.5) * wid * 3, y, wid * 1.4, 6));
    stroke('#a8a596', wid * k);
    stroke('#c4c0b2', wid * k * 0.62);
    stroke('#6f989b', Math.max(1.2, wid * k * 0.14));
  };
  river(-330, 46, 1.7, 13);
  await tick();
  river(390, 34, 4.2, 8);
  await tick();

  // lanes
  ctx.strokeStyle = 'rgba(206,194,162,0.78)';
  ctx.lineWidth = 1.6;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let x = FLOOR.x0; x <= FLOOR.x1; x += 4) {
    const z = -70 + Math.sin(x * 0.009) * 22 + (fbm(x * 0.012, 2, 5, 4) - 0.5) * 60;
    if (x === FLOOR.x0) ctx.moveTo(cx(x), cz(z));
    else ctx.lineTo(cx(x), cz(z));
  }
  for (let z = FLOOR.z1; z >= FLOOR.z0; z -= 4) {
    const x = -60 + (fbm(z * 0.008, 7, 5, 4) - 0.5) * 180 + Math.sin(z * 0.03) * 6;
    if (z === FLOOR.z1) ctx.moveTo(cx(x), cz(z));
    else ctx.lineTo(cx(x), cz(z));
  }
  ctx.stroke();

  // the landing field: a long mown meadow with wings laid out after touchdown
  {
    const lw = 44 * k,
      lh = 24 * k;
    ctx.save();
    ctx.translate(cx(LANDING.x), cz(LANDING.z));
    ctx.rotate(-0.12);
    ctx.fillStyle = 'rgb(158,184,94)';
    ctx.beginPath();
    [
      [-0.5, -0.42],
      [-0.1, -0.52],
      [0.48, -0.46],
      [0.52, 0.38],
      [0.05, 0.5],
      [-0.47, 0.44],
    ].forEach(([px, py], i) => (i ? ctx.lineTo(px * lw, py * lh) : ctx.moveTo(px * lw, py * lh)));
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,255,226,0.07)' : 'rgba(30,60,10,0.06)';
      ctx.fillRect(-lw * 0.44 + (i * lw * 0.88) / 10, -lh * 0.4, (lw * 0.88) / 10, lh * 0.8);
    }
    const wings = ['#e8622a', '#f2c230', '#2d64c8', '#d83a3a', '#2fb39a', '#f2efe9', '#8b45d8'];
    for (let i = 0; i < 10; i++) {
      ctx.save();
      ctx.translate((r() - 0.5) * lw * 0.75, (r() - 0.5) * lh * 0.6);
      ctx.rotate(r() * Math.PI);
      ctx.fillStyle = wings[i % wings.length];
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.9 * k, 0.55 * k, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // villages: clusters of tin and slate roofs
  const roofs = ['#e6e1d6', '#cfc8bb', '#b2452f', '#4b6ea2', '#9ba2a8', '#d8b48a', '#efece6'];
  const lamps: number[] = [];
  for (let v = 0; v < 22; v++) {
    const x = (r() * 2 - 1) * 470,
      z = FLOOR.z0 + 40 + r() * (FLOOR.z1 - FLOOR.z0 - 60);
    if (Math.abs(x - LANDING.x) < LANDING.w * 0.55 && Math.abs(z - LANDING.z) < LANDING.h * 0.55) continue;
    await tick();
    const n = 18 + Math.floor(r() * 60),
      spread = 10 + r() * 22,
      ang = r() * Math.PI;
    clump(cx(x), cz(z), spread * k * 1.3, Math.floor(n * 0.6));
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2,
        d = Math.sqrt(r()) * spread * k;
      const hx = cx(x) + Math.cos(a) * d,
        hy = cz(z) + Math.sin(a) * d;
      const w = 2 + r() * 2.5,
        h = 1.6 + r() * 1.8;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(ang + (r() - 0.5) * 0.4);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(-w / 2 + 0.8, -h / 2 + 0.8, w, h);
      ctx.fillStyle = roofs[Math.floor(r() * roofs.length)];
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
      if (i % 2 === 0) lamps.push(hx / k + FLOOR.x0, 0.6, hy / k + FLOOR.z0);
    }
  }
  return { cv, lamps: new Float32Array(lamps) };
}

/* ------------------------------------------------------------------ shared ground shading: world-space detail + drifting cloud shadows */
type GroundOpts = { detail: THREE.Texture; shadow: THREE.Texture; live: Live; scale: number; amount: number };
function groundMaterial(base: THREE.MeshLambertMaterialParameters, o: GroundOpts) {
  const m = new THREE.MeshLambertMaterial(base);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uDetail = { value: o.detail };
    sh.uniforms.uCloudTex = { value: o.shadow };
    sh.uniforms.uTime = o.live.time;
    sh.uniforms.uShadowAmt = o.live.shadow;
    sh.uniforms.uDScale = { value: o.scale };
    sh.uniforms.uDAmt = { value: o.amount };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <fog_vertex>', '#include <fog_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vWPos;
uniform sampler2D uDetail; uniform sampler2D uCloudTex;
uniform float uTime; uniform float uShadowAmt; uniform float uDScale; uniform float uDAmt;`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
 vec2 dp = vWPos.xz + vec2(vWPos.y * 0.7);
 float d1 = texture2D(uDetail, dp * uDScale).r;
 float d2 = texture2D(uDetail, dp * uDScale * 0.137 + 0.31).r;
 diffuseColor.rgb *= mix(1.0, d1 * 1.3, uDAmt) * mix(1.0, d2 * 1.3, uDAmt * 0.6);`
      )
      .replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>
 float cs = texture2D(uCloudTex, vWPos.xz * 0.0017 + vec2(uTime * 0.0045, uTime * 0.0016)).r;
 reflectedLight.directDiffuse *= 1.0 - uShadowAmt * smoothstep(0.38, 0.8, cs);`
      );
  };
  m.customProgramCacheKey = () => `bir-ground-${o.scale}-${o.amount}`;
  return m;
}

/* ------------------------------------------------------------------ terrain geometry */
const C = (h: string) => new THREE.Color(h);
const FOREST_A = C('#2a3a22');
const FOREST_B = C('#3a4b2b');
const MEADOW = C('#6b763f');
const ROCK = C('#6c675e');
const SCREE = C('#8a8478');

async function paint(g: THREE.BufferGeometry, height: number, seed: number, tick: Tick) {
  g.computeVertexNormals();
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const t = new THREE.Color();
  const rock = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    if ((i & 1023) === 0) await tick();
    const x = pos.getX(i),
      z = pos.getZ(i);
    const hn = pos.getY(i) / height;
    const slope = 1 - nrm.getY(i);
    const n1 = fbm(x * 0.012, z * 0.012, seed + 9, 3);
    const n2 = fbm(x * 0.05, z * 0.05, seed + 21, 2);
    t.copy(FOREST_A).lerp(FOREST_B, n1);
    t.lerp(MEADOW, sstep(0.58, 0.8, n2) * sstep(0.22, 0.08, slope) * 0.55);
    const r = Math.min(1, sstep(0.42, 0.7, slope) * 0.85 + sstep(0.82, 1.0, hn) * 0.45);
    t.lerp(rock.copy(ROCK).lerp(SCREE, n2), r);
    col[i * 3] = t.r;
    col[i * 3 + 1] = t.g;
    col[i * 3 + 2] = t.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

type Belt = { width: number; depth: number; segW: number; segD: number; height: number; seed: number; spacing: number };
/** A mountain belt: jittered summits joined by a spine, carved by ridged gullies. */
async function makeBelt(o: Belt, tick: Tick) {
  const g = new THREE.PlaneGeometry(o.width, o.depth, o.segW, o.segD);
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    if ((i & 1023) === 0) await tick();
    const x = pos.getX(i),
      z = pos.getZ(i);
    const nz = (z + o.depth / 2) / o.depth; // 0 far edge → 1 near edge
    let peaks = 0;
    const k0 = Math.floor(x / o.spacing);
    for (let k = k0 - 2; k <= k0 + 2; k++) {
      const px = (k + 0.15 + 0.7 * hash(k, 1, o.seed)) * o.spacing;
      const pz = 0.42 + (hash(k, 2, o.seed) - 0.5) * 0.3;
      const ph = 0.45 + 0.55 * hash(k, 3, o.seed);
      const pw = o.spacing * (0.55 + 0.45 * hash(k, 4, o.seed));
      const dx = (x - px) / pw,
        dz = ((nz - pz) * o.depth) / pw;
      peaks = Math.max(peaks, ph * Math.exp(-Math.pow(Math.sqrt(dx * dx + dz * dz), 1.3) * 1.9));
    }
    const spine = 0.3 * Math.exp(-Math.pow((nz - 0.42) / 0.28, 2));
    const r = ridged(x / (o.spacing * 0.32), z / (o.spacing * 0.32), o.seed + 7, 5);
    const edge = sstep(0, 0.1, nz) * sstep(1, 0.86, nz);
    pos.setY(i, o.height * edge * Math.max(peaks, spine) * (0.72 + 0.4 * r));
  }
  return paint(g, o.height, o.seed, tick);
}

/** The valley walls left & right of Bir plus the rising ground behind the launch. */
async function makeWalls(tick: Tick) {
  const g = new THREE.PlaneGeometry(3400, 1300, 340, 130);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0, -350);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    if ((i & 1023) === 0) await tick();
    const x = pos.getX(i),
      z = pos.getZ(i);
    const side = x < 0 ? 1 : 2;
    const edge = 440 + (fbm(z * 0.003, side * 3.1, 41, 3) - 0.5) * 120;
    const w = (Math.abs(x) - edge) / 420;
    let h = -4;
    if (w > 0) {
      const r = ridged(x / 150, z / 150, 23, 5);
      h += Math.pow(w, 1.1) * 112 * (0.65 + 0.5 * fbm(x / 320, z / 320, 29, 3)) * (0.78 + 0.34 * r);
    }
    const lz = (z - 70) / 200;
    if (lz > 0) h = Math.max(h, Math.pow(lz, 1.2) * 110 * (0.8 + 0.3 * fbm(x / 200, z / 200, 31, 3)) - 4);
    pos.setY(i, h);
  }
  return paint(g, 150, 23, tick);
}

/* ------------------------------------------------------------------ one-time asset build (cached for the session) */
type HeroAssets = {
  detail: HTMLCanvasElement;
  shadow: HTMLCanvasElement;
  valley: HTMLCanvasElement;
  lamps: Float32Array;
  puff: string;
  far: THREE.BufferGeometry;
  mid: THREE.BufferGeometry;
  walls: THREE.BufferGeometry;
};
let assetsPromise: Promise<HeroAssets> | null = null;
function loadHeroAssets() {
  assetsPromise ??= (async () => {
    const tick = makeTick(10);
    const detail = detailCanvas();
    await tick();
    const shadow = shadowCanvas();
    await tick();
    const puff = puffDataURL();
    await tick();
    const { cv: valley, lamps } = await valleyCanvas(tick);
    const far = await makeBelt({ width: 5200, depth: 420, segW: 300, segD: 28, height: 92, seed: 3, spacing: 520 }, tick);
    const mid = await makeBelt({ width: 3800, depth: 380, segW: 380, segD: 38, height: 74, seed: 7, spacing: 360 }, tick);
    const walls = await makeWalls(tick);
    return { detail, shadow, valley, lamps, puff, far, mid, walls };
  })();
  return assetsPromise;
}

function Terrain({ live, assets }: { live: Live; assets: HeroAssets }) {
  const res = useMemo(() => {
    const detail = new THREE.CanvasTexture(assets.detail);
    detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
    detail.anisotropy = 8;
    const shadow = new THREE.CanvasTexture(assets.shadow);
    shadow.wrapS = shadow.wrapT = THREE.RepeatWrapping;
    const valley = new THREE.CanvasTexture(assets.valley);
    valley.colorSpace = THREE.SRGBColorSpace;
    valley.anisotropy = 8;
    const mk = (base: THREE.MeshLambertMaterialParameters, scale: number, amount: number) => groundMaterial(base, { detail, shadow, live, scale, amount });
    return { detail, shadow, valley, rock: mk({ vertexColors: true }, 0.03, 0.62), floor: mk({ map: valley }, 0.11, 0.32) };
  }, [live, assets]);
  useEffect(
    () => () => {
      [res.detail, res.shadow, res.valley].forEach((t) => t.dispose());
      [res.rock, res.floor].forEach((m) => m.dispose());
      // free GPU buffers; the CPU-side geometry stays cached and re-uploads on the next visit
      [assets.far, assets.mid, assets.walls].forEach((g) => g.dispose());
    },
    [res, assets]
  );
  const fw = FLOOR.x1 - FLOOR.x0,
    fd = FLOOR.z1 - FLOOR.z0;
  return (
    <group>
      {/* endless haze plain under everything, so no gap ever opens onto the sky */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -6, -1200]}>
        <planeGeometry args={[9000, 5000]} />
        <meshBasicMaterial color="#56614a" />
      </mesh>
      <mesh geometry={assets.far} material={res.rock} position={[0, -4, -1360]} />
      <mesh geometry={assets.mid} material={res.rock} position={[0, -3, -830]} />
      <mesh geometry={assets.walls} material={res.rock} />
      <mesh material={res.floor} rotation-x={-Math.PI / 2} position={[(FLOOR.x0 + FLOOR.x1) / 2, 0, (FLOOR.z0 + FLOOR.z1) / 2]}>
        <planeGeometry args={[fw, fd]} />
      </mesh>
    </group>
  );
}

/** Warm house lights scattered through the villages; they fade up at dusk and glow at night. */
function VillageLights({ live, lamps }: { live: Live; lamps: Float32Array }) {
  const { geo, mat } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(lamps, 3));
    const cv = document.createElement('canvas');
    cv.width = cv.height = 64;
    const ctx = cv.getContext('2d')!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,236,200,1)');
    g.addColorStop(0.25, 'rgba(255,190,110,0.85)');
    g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const mat = new THREE.PointsMaterial({ map: new THREE.CanvasTexture(cv), size: 1.6, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    return { geo, mat };
  }, [lamps]);
  useEffect(
    () => () => {
      geo.dispose();
      mat.map?.dispose();
      mat.dispose();
    },
    [geo, mat]
  );
  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    const v = live.lights.value;
    mat.opacity = v * (0.85 + Math.sin(state.clock.elapsedTime * 2.3) * 0.04);
    if (ref.current) ref.current.visible = v > 0.01;
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

/* ================================================================== clouds */
type Puff = { p: V3; b: V3; v: number; s: number; seed: number };
const DECK: Puff[] = [
  { p: [6, 47, -58], b: [30, 6, 24], v: 26, s: 30, seed: 2 }, // the one we fly through
  { p: [-118, 45, -128], b: [40, 7, 28], v: 30, s: 30, seed: 4 },
  { p: [132, 43, -212], b: [46, 7, 30], v: 32, s: 30, seed: 6 },
];
/** Inversion cloud-sea pooled in the far valleys; the foothills poke through it. */
const SEA: Puff[] = [
  { p: [-640, 26, -1080], b: [300, 8, 90], v: 110, s: 20, seed: 21 },
  { p: [-60, 22, -1120], b: [320, 8, 80], v: 120, s: 20, seed: 23 },
  { p: [560, 28, -1060], b: [320, 9, 90], v: 115, s: 20, seed: 25 },
  { p: [1100, 34, -1300], b: [300, 10, 90], v: 130, s: 14, seed: 27 },
  { p: [-1150, 32, -1320], b: [300, 10, 90], v: 130, s: 14, seed: 29 },
];

function CloudField({ groupRef, url }: { groupRef: RefObject<THREE.Group | null>; url: string }) {
  const drift = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (drift.current) drift.current.position.x = Math.sin(state.clock.elapsedTime * 0.021) * 26;
  });
  return (
    <group ref={drift}>
      <Clouds ref={groupRef} material={THREE.MeshBasicMaterial} texture={url} limit={240} frustumCulled={false}>
        {DECK.map((c) => (
          <group key={c.seed}>
            {/* sunlit tops */}
            <Cloud seed={c.seed} segments={c.s} bounds={c.b} volume={c.v} smallestVolume={0.45} color="#ffffff" fade={40} speed={0.1} growth={4} opacity={0.9} position={c.p} />
            {/* shaded bases */}
            <Cloud seed={c.seed + 100} segments={Math.round(c.s * 0.5)} bounds={[c.b[0] * 0.8, c.b[1] * 0.5, c.b[2] * 0.8]} volume={c.v * 0.85} smallestVolume={0.5} color="#a9b4c4" fade={40} speed={0.08} growth={3} opacity={0.8} position={[c.p[0], c.p[1] - c.b[1] * 0.9, c.p[2]]} />
          </group>
        ))}
        {SEA.map((c) => (
          <Cloud key={c.seed} seed={c.seed} segments={c.s} bounds={c.b} volume={c.v} smallestVolume={0.5} concentrate="random" color="#f6f8fb" fade={60} speed={0.04} growth={6} opacity={0.85} position={c.p} />
        ))}
      </Clouds>
    </group>
  );
}

/* ================================================================== paragliders */
function canopyGeometry(span = 7.4, arc = 0.95, chord = 1.9, segS = 44, segC = 8, stripes = true) {
  const R = span / 2 / Math.sin(arc);
  const verts: number[] = [];
  const cols: number[] = [];
  const idx: number[] = [];
  const stripe = ['#e8622a', '#e8622a', '#f2efe9', '#2d64c8', '#f2efe9'].map(C);
  for (let i = 0; i <= segS; i++) {
    const a = -arc + (2 * arc * i) / segS;
    const x = R * Math.sin(a);
    const yb = R * Math.cos(a) - R;
    const taper = 1 - 0.38 * Math.pow(Math.abs(a) / arc, 2);
    const cell = Math.floor((i / segS) * 22);
    const c = stripes ? stripe[cell % stripe.length].clone().multiplyScalar(i % 2 ? 0.94 : 1) : new THREE.Color(1, 1, 1);
    for (let j = 0; j <= segC; j++) {
      const tt = j / segC;
      verts.push(x, yb + Math.sin(Math.PI * tt) * 0.22 * taper, (tt - 0.5) * chord * taper);
      cols.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < segS; i++)
    for (let j = 0; j < segC; j++) {
      const a = i * (segC + 1) + j;
      const b = a + segC + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return { g, R, arc, chord, segS };
}

/** Our tandem, riding just ahead of the camera and banking with the pointer. */
function Glider({ progress, pointer }: { progress: MutableRefObject<number>; pointer: MutableRefObject<Pointer> }) {
  const ref = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const canopy = useMemo(() => canopyGeometry(), []);
  const lines = useMemo(() => {
    const pts: number[] = [];
    for (let k = 1; k < 10; k++) {
      const a = -canopy.arc + (2 * canopy.arc * k) / 10;
      const x = canopy.R * Math.sin(a);
      const y = canopy.R * Math.cos(a) - canopy.R;
      [-0.5, 0.5].forEach((zf) => pts.push(x, y, zf * canopy.chord * 0.5, x * 0.08, -5.2, 0.15));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [canopy]);
  const s = useRef({ x: 0, y: 0, bank: 0, p: 0 });
  const v = useMemo(() => ({ fwd: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), q: new THREE.Quaternion(), z: new THREE.Vector3(0, 0, 1) }), []);
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.pow(0.04, dt);
    const st = s.current;
    const px = st.x;
    st.x += (pointer.current.x - st.x) * k;
    st.y += (pointer.current.y - st.y) * k;
    st.p += (progress.current - st.p) * k;
    st.bank += (-(st.x - px) * 30 - st.x * 0.35 - st.bank) * 0.08;
    camera.getWorldDirection(v.fwd);
    v.up.copy(camera.up).applyQuaternion(camera.quaternion);
    v.right.crossVectors(v.fwd, v.up).normalize();
    v.up.crossVectors(v.right, v.fwd).normalize();
    const landing = sstep(0.8, 1, st.p);
    const narrow = size.width < 700 ? 0.55 : 1;
    const bob = Math.sin(state.clock.elapsedTime * 1.3) * 0.25;
    g.position
      .copy(camera.position)
      .addScaledVector(v.fwd, 17 + landing * 24)
      .addScaledVector(v.right, st.x * 4.2 * narrow + 4.4 * narrow)
      .addScaledVector(v.up, -2.4 + st.y * 2.2 + bob - landing * 9);
    g.quaternion.copy(camera.quaternion);
    v.q.setFromAxisAngle(v.z, st.bank);
    g.quaternion.multiply(v.q);
    g.scale.setScalar(narrow < 1 ? 0.4 : 0.48);
  });
  return (
    <group ref={ref}>
      <mesh geometry={canopy.g}>
        <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.62} metalness={0.02} />
      </mesh>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#d8dde6" transparent opacity={0.35} />
      </lineSegments>
      <group position={[0, -5.45, 0.15]}>
        <mesh position={[0, 0, 0.32]}>
          <capsuleGeometry args={[0.2, 0.5, 6, 10]} />
          <meshStandardMaterial color="#c4552a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.05, -0.32]}>
          <capsuleGeometry args={[0.22, 0.55, 6, 10]} />
          <meshStandardMaterial color="#1a2233" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

/** Other pilots working thermals over the valley — tiny banked wings circling and climbing. */
const GAGGLE = [
  { c: '#f2c230', r: 13, h: 60, x: -120, z: -170, sp: 0.2, ph: 0 },
  { c: '#d83a3a', r: 10, h: 54, x: -96, z: -196, sp: 0.23, ph: 2.1 },
  { c: '#3a7bd8', r: 12, h: 68, x: 150, z: -270, sp: 0.17, ph: 1.2 },
  { c: '#f07b2a', r: 9, h: 40, x: 64, z: -340, sp: 0.24, ph: 3.3 },
  { c: '#ece7dc', r: 15, h: 74, x: -46, z: -430, sp: 0.15, ph: 4.4 },
  { c: '#8b45d8', r: 11, h: 50, x: 214, z: -128, sp: 0.21, ph: 5.1 },
  { c: '#2fb39a', r: 12, h: 64, x: -260, z: -520, sp: 0.18, ph: 0.7 },
];
function Gaggle() {
  const small = useMemo(() => canopyGeometry(7.4, 0.95, 1.9, 16, 2, false), []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const e = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    GAGGLE.forEach((w, i) => {
      const g = refs.current[i];
      if (!g) return;
      const a = t * w.sp + w.ph;
      g.position.set(w.x + Math.cos(a) * w.r, w.h + Math.sin(t * 0.12 + w.ph) * 4, w.z + Math.sin(a) * w.r);
      e.set(-0.05, Math.PI - a, -0.42);
      g.rotation.copy(e);
    });
  });
  return (
    <group>
      {GAGGLE.map((w, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)} scale={0.34}>
          <mesh geometry={small.g}>
            <meshLambertMaterial color={w.c} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -5.2, 0]}>
            <boxGeometry args={[0.7, 1.1, 0.7]} />
            <meshBasicMaterial color="#141820" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ================================================================== camera */
const CAM = new THREE.CatmullRomCurve3(
  [new THREE.Vector3(0, 74, 40), new THREE.Vector3(-14, 66, -6), new THREE.Vector3(6, 50, -50), new THREE.Vector3(16, 42, -95), new THREE.Vector3(6, 35, -125), new THREE.Vector3(0, 30, -150)],
  false,
  'centripetal'
);
const AIM = new THREE.CatmullRomCurve3(
  [new THREE.Vector3(0, 63, -140), new THREE.Vector3(-12, 50, -170), new THREE.Vector3(8, 30, -200), new THREE.Vector3(10, 18, -240), new THREE.Vector3(2, 6, -270), new THREE.Vector3(0, 0, -300)],
  false,
  'centripetal'
);

function CameraRig({ progress, pointer }: { progress: MutableRefObject<number>; pointer: MutableRefObject<Pointer> }) {
  const { camera, size } = useThree();
  const cur = useRef({ p: 0, x: 0, y: 0 });
  const v = useMemo(() => ({ pos: new THREE.Vector3(), aim: new THREE.Vector3(), tan: new THREE.Vector3() }), []);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    // keep a usable horizontal field of view on tall phones
    const aspect = size.width / size.height;
    cam.fov = aspect < 1 ? 62 : 45;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.06, dt);
    const c0 = cur.current;
    c0.p += (progress.current - c0.p) * k;
    c0.x += (pointer.current.x - c0.x) * k * 0.6;
    c0.y += (pointer.current.y - c0.y) * k * 0.6;
    const p = Math.min(1, Math.max(0, c0.p));
    CAM.getPointAt(p, v.pos);
    AIM.getPointAt(p, v.aim);
    CAM.getTangentAt(p, v.tan);
    const t = state.clock.elapsedTime;
    camera.position.set(v.pos.x + c0.x * 3 + Math.sin(t * 0.4) * 0.5, v.pos.y + c0.y * 1.4 + Math.sin(t * 0.7) * 0.25, v.pos.z);
    camera.lookAt(v.aim.x + c0.x * 10, v.aim.y + c0.y * 4, v.aim.z);
    // roll into the turns of the descent + a breath of turbulence
    camera.rotateZ(-c0.x * 0.04 - v.tan.x * 0.3 + Math.sin(t * 0.9) * 0.004);
  });
  return null;
}

/** Steps resolution down (never up) if the GPU can't hold ~45 fps, so weaker laptops stay smooth. */
function AdaptiveQuality() {
  const setDpr = useThree((st) => st.setDpr);
  const s = useRef({ warm: 0, acc: 0, n: 0, level: 0 });
  useFrame((_, dt) => {
    const st = s.current;
    const d = Math.min(dt, 0.1);
    if ((st.warm += d) < 2) return; // let shader compiles and uploads settle
    st.acc += d;
    if (++st.n < 50) return;
    const avg = st.acc / st.n;
    st.acc = st.n = 0;
    if (avg > 1 / 45 && st.level < 2) {
      st.level++;
      setDpr(st.level === 1 ? 1 : 0.75);
    }
  });
  return null;
}

/* ================================================================== scene */
function World({ progress, pointer, palette, onReady, assets }: Omit<Props, 'active'> & { assets: HeroAssets }) {
  const range = useTexture('/images/hero-range.webp');
  useLayoutEffect(() => {
    range.colorSpace = THREE.SRGBColorSpace;
  }, [range]);
  const live = useMemo(() => makeLive(palette), []); // eslint-disable-line react-hooks/exhaustive-deps
  const clouds = useRef<THREE.Group>(null);
  const frames = useRef(0);
  const ready = useRef(onReady);
  ready.current = onReady;
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) ready.current?.();
  });
  return (
    <>
      <Director palette={palette} live={live} clouds={clouds} />
      <SkyDome live={live} />
      {palette === 'night' && <Stars radius={900} depth={60} count={2600} factor={7} saturation={0} fade speed={0.3} />}
      <Range live={live} map={range} />
      <Terrain live={live} assets={assets} />
      <CloudField groupRef={clouds} url={assets.puff} />
      <VillageLights live={live} lamps={assets.lamps} />
      {palette !== 'night' && <Gaggle />}
      <Glider progress={progress} pointer={pointer} />
      <CameraRig progress={progress} pointer={pointer} />
      <AdaptiveQuality />
    </>
  );
}

/** Realistic 3D descent from Billing to Bir: photographic Dhauladhar, aerial-perspective haze, drifting cumulus and their shadows. */
export default function HeroScene({ progress, pointer, palette, active, onReady }: Props) {
  const [assets, setAssets] = useState<HeroAssets | null>(null);
  useEffect(() => {
    let alive = true;
    loadHeroAssets().then((a) => alive && setAssets(a));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 45, near: 0.5, far: 6000, position: [0, 74, 40] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      {assets && (
        <Suspense fallback={null}>
          <World progress={progress} pointer={pointer} palette={palette} onReady={onReady} assets={assets} />
        </Suspense>
      )}
    </Canvas>
  );
}
