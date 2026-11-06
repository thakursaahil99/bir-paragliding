'use client';

import { useEffect, type DependencyList, type RefObject } from 'react';
import { gsap, prefersReduced } from './gsap';
import { whenReady } from './store';

/**
 * Runs `build(el)` once the screen is uncovered (preloader / page transition done)
 * inside a gsap.context scoped to `ref`, and reverts it on unmount.
 * Skipped entirely for prefers-reduced-motion.
 */
export function useReady(ref: RefObject<HTMLElement | null>, build: (el: HTMLElement) => void, deps: DependencyList = []) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => build(el), el);
    });
    return () => {
      off();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
