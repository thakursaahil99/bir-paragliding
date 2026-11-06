'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import { emitScroll, lenisRef, scrollState } from '@/lib/store';

/** Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger & Lenis share one clock. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('js');

    if (prefersReduced()) {
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
      return () => window.removeEventListener('scroll', onNative);
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (l: Lenis) => {
      scrollState.y = l.scroll;
      scrollState.velocity = l.velocity;
      scrollState.direction = l.direction === -1 ? -1 : 1;
      scrollState.progress = l.progress;
      scrollState.limit = l.limit;
      ScrollTrigger.update();
      emitScroll();
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);

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
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
