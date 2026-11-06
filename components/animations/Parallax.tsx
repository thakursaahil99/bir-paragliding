'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';

/** Scroll-scrubbed vertical drift. speed > 0 moves slower than scroll (background), < 0 faster (foreground). */
export default function Parallax({ children, speed = 20, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed / 2 },
        { yPercent: speed / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    });
    return () => ctx.revert();
  }, [speed]);
  return (
    <div ref={ref} className={['will-change-transform', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
