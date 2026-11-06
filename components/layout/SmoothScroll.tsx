'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import { emitScroll, lenisRef, scrollState } from '@/lib/store';
import { getTier, onTierChange, startPerfMonitor } from '@/lib/perf';

/**
 * Native-scroll stand-in exposing the slice of the Lenis API the app uses (lock / unlock /
 * scrollTo), so menus, modals, the preloader and page transitions work identically on
 * low-tier devices where we let the browser scroll natively (smoothest option on weak CPUs).
 */
const nativeScroller = {
  stop() {
    document.documentElement.style.overflow = 'hidden';
  },
  start() {
    document.documentElement.style.overflow = '';
  },
  scrollTo(target: number | string | HTMLElement, opts: { immediate?: boolean; offset?: number } = {}) {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : typeof target === 'number' ? null : target;
    const top = (typeof target === 'number' ? target : el ? el.getBoundingClientRect().top + window.scrollY : 0) + (opts.offset ?? 0);
    window.scrollTo({ top, behavior: opts.immediate ? 'auto' : 'smooth' });
  },
};

/** Lenis smooth scroll driven by the GSAP ticker (high/mid tiers); native scrolling on low tier. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('js');
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    let detachNative: (() => void) | null = null;

    const goNative = () => {
      let last = window.scrollY;
      const onNative = () => {
        const y = window.scrollY;
        const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        scrollState.velocity = y - last;
        scrollState.direction = y >= last ? 1 : -1;
        scrollState.y = y;
        scrollState.limit = limit;
        scrollState.progress = y / limit;
        last = y;
        emitScroll();
      };
      window.addEventListener('scroll', onNative, { passive: true });
      lenisRef.current = nativeScroller as unknown as Lenis;
      detachNative = () => window.removeEventListener('scroll', onNative);
    };

    const goSmooth = () => {
      const l = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      });
      l.on('scroll', (s: Lenis) => {
        scrollState.y = s.scroll;
        scrollState.velocity = s.velocity;
        scrollState.direction = s.direction === -1 ? -1 : 1;
        scrollState.progress = s.progress;
        scrollState.limit = s.limit;
        ScrollTrigger.update();
        emitScroll();
      });
      tick = (time: number) => l.raf(time * 1000);
      gsap.ticker.add(tick);
      lenis = l;
      lenisRef.current = l;
    };

    if (prefersReduced() || getTier() === 'low') goNative();
    else goSmooth();
    gsap.ticker.lagSmoothing(500, 33);

    // if the device can't keep up, hand scrolling back to the browser mid-visit
    const offTier = onTierChange((t) => {
      if (t !== 'low' || !lenis) return;
      const stopped = lenis.isStopped;
      if (tick) gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
      tick = null;
      goNative();
      if (stopped) nativeScroller.stop();
      ScrollTrigger.refresh();
    });
    startPerfMonitor();

    // keep layout-dependent triggers honest when fonts / images settle (debounced;
    // pin spacers change body height themselves, so only react to real growth)
    let timer = 0;
    let lastH = document.body.scrollHeight;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    };
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) > 40) {
        lastH = h;
        refresh();
      }
    });
    ro.observe(document.body);
    window.addEventListener('load', refresh);

    return () => {
      offTier();
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('load', refresh);
      if (tick) gsap.ticker.remove(tick);
      (lenis as Lenis | null)?.destroy();
      detachNative?.();
      document.documentElement.style.overflow = '';
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
