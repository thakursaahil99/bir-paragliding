'use client';

import { useEffect, useState } from 'react';

/** Heuristic for devices that should skip heavy WebGL scenes. */
export function isLowEnd(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (nav.connection?.saveData) return true;
  if (nav.connection?.effectiveType && /(^|-)2g|3g/.test(nav.connection.effectiveType)) return true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  if (mem <= 2 || cores <= 2) return true;
  if (coarse && (mem <= 4 || cores <= 4)) return true;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return true;
  } catch {
    return true;
  }
  return false;
}

export function useLowEnd() {
  const [low, setLow] = useState<boolean | null>(null);
  useEffect(() => setLow(isLowEnd()), []);
  return low;
}

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(mq.matches);
    const fn = () => setR(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return r;
}

export function useIsTouch() {
  const [t, setT] = useState(false);
  useEffect(() => setT(window.matchMedia('(pointer: coarse)').matches), []);
  return t;
}
