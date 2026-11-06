import { useEffect, useState } from 'react';

/**
 * Device performance tiers — every device gets the richest experience it can run smoothly.
 *
 *  high  i5 / i7 / Ryzen / Apple-silicon class machines: everything on — full-quality 3D hero
 *        (resolution still adapts if the GPU struggles), particles, WebGL hovers, videos,
 *        smooth scrolling, glass blur, film grain, custom cursor.
 *  mid   phones & tablets with decent GPUs, 4-thread laptops on discrete graphics:
 *        everything still runs, on lighter settings (3D "lite", fewer particles, softer blur).
 *  low   i3 / Celeron / old dual-core laptops on integrated Intel graphics, budget phones,
 *        Data Saver / 2G–3G, reduced motion: photo hero, posters instead of video, native
 *        scrolling, no blur or grain — the animations that remain are cheap transforms.
 *
 * First guess: inline <head> script (lib/perf-boot.ts) from CPU threads / memory / pointer.
 * Then a GPU check here, then a live frame-rate monitor. Each step can only LOWER the tier;
 * a lowered tier is remembered for 7 days so the next visit starts light straight away.
 *
 * QA: add ?perf=low|mid|high to any URL to force a tier for that page load.
 */
export type Tier = 'low' | 'mid' | 'high';

const ORDER: Tier[] = ['low', 'mid', 'high'];
const KEY = 'bir-perf-v1';
const rank = (t: Tier) => ORDER.indexOf(t);
const lower = (a: Tier, b: Tier): Tier => (rank(a) <= rank(b) ? a : b);

let tier: Tier | null = null;
const subs = new Set<(t: Tier) => void>();

const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|basic render/i;
const WEAK_MOBILE_GPU = /mali-(4\d\d|t\d+)|mali-g(31|51|52)\b|adreno[^\d]*([1-4]\d\d|50\d|51\d)\b|powervr|sgx|videocore|vivante/i;

function gpuRenderer(): string {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return 'none';
    let r = String(gl.getParameter(gl.RENDERER) || '');
    // Chrome masks RENDERER; Firefox already gives a cleaned-up string (and warns on the extension)
    if (!/firefox/i.test(navigator.userAgent) && (!r || /^webkit|^mozilla/i.test(r))) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) r = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || r);
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return r;
  } catch {
    return 'none';
  }
}

function refine(start: Tier): Tier {
  let t = start;
  if (t === 'low') return t;
  const threads = navigator.hardwareConcurrency || 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const gpu = gpuRenderer();
  if (gpu === 'none' || SOFTWARE_GL.test(gpu)) return 'low';
  if (coarse) return WEAK_MOBILE_GPU.test(gpu) ? 'low' : lower(t, 'mid');
  // laptops: integrated Intel graphics (not Iris / Arc) on ≤ 4 threads = i3 / dual-core class
  const plainIntel = /intel/i.test(gpu) && !/iris|arc/i.test(gpu);
  if (plainIntel && threads <= 4) return 'low';
  if (threads <= 4) t = lower(t, 'mid');
  return t;
}

/** Current tier (client only). Resolves synchronously on first call. */
export function getTier(): Tier {
  if (tier) return tier;
  if (typeof window === 'undefined') return 'high';
  const html = document.documentElement;
  const boot = html.dataset.perf as Tier | undefined;
  const valid = boot && ORDER.includes(boot) ? boot : 'high';
  tier = 'perfForced' in html.dataset ? valid : refine(valid);
  html.dataset.perf = tier;
  return tier;
}

/** Step the tier down (one level, or straight to `to`). Never steps up. */
export function downgrade(to?: Tier) {
  if ('perfForced' in document.documentElement.dataset) return; // ?perf=… QA override
  const cur = getTier();
  const next = to ?? ORDER[Math.max(0, rank(cur) - 1)];
  if (rank(next) >= rank(cur)) return;
  tier = next;
  document.documentElement.dataset.perf = next;
  try {
    localStorage.setItem(KEY, JSON.stringify({ tier: next, at: Date.now() }));
  } catch {
    /* private mode */
  }
  subs.forEach((f) => f(next));
}

export function onTierChange(fn: (t: Tier) => void) {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

/** React hook: null during SSR / first paint (avoids hydration mismatch), then the live tier. */
export function usePerfTier(): Tier | null {
  const [t, setT] = useState<Tier | null>(null);
  useEffect(() => {
    setT(getTier());
    return onTierChange(setT);
  }, []);
  return t;
}

let monitoring = false;
/**
 * Watches real frame pacing. Two consecutive 2.5 s windows below ~40 fps (or with >20 % of
 * frames slower than 25 fps) drop the tier one step. Start-up hitches are ignored.
 */
export function startPerfMonitor() {
  if (monitoring || typeof window === 'undefined' || getTier() === 'low') return;
  monitoring = true;
  let last = performance.now();
  let winStart = last;
  let frames = 0,
    slow = 0,
    time = 0,
    strikes = 0;
  const begin = last + 3500; // hydration, preloader and shader compiles happen here
  const loop = (now: number) => {
    const dt = now - last;
    last = now;
    if (now > begin && document.visibilityState === 'visible' && dt < 400) {
      frames++;
      time += dt;
      if (dt > 40) slow++;
    }
    if (now - winStart >= 2500) {
      if (frames >= 20 && time > 0) {
        const fps = (frames * 1000) / time;
        strikes = fps < 40 || slow / frames > 0.2 ? strikes + 1 : 0;
        if (strikes >= 2) {
          strikes = 0;
          downgrade();
        }
      }
      frames = slow = time = 0;
      winStart = now;
    }
    if (getTier() === 'low') {
      monitoring = false;
      return;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
