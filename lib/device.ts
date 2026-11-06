'use client';

import { useEffect, useState } from 'react';
import { getTier, usePerfTier } from './perf';

/** Devices that should skip heavy WebGL scenes — see the tier rules in lib/perf.ts. */
export function isLowEnd(): boolean {
  if (typeof window === 'undefined') return false;
  return getTier() === 'low';
}

/** null until resolved on the client, then true for low-tier devices (live: follows downgrades). */
export function useLowEnd() {
  const tier = usePerfTier();
  return tier === null ? null : tier === 'low';
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
