'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/** Thin altitude-style reading bar pinned under the navbar, tracking only the article body. */
export default function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.3 - r.top) / Math.max(1, total)));
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (label.current) label.current.textContent = `${Math.round(p * 100)}%`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [target]);
  return (
    <div className="fixed inset-x-0 top-0 z-[75] h-1 bg-white/5" aria-hidden>
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-sky via-sun to-dawn" style={{ transform: 'scaleX(0)' }} />
      <span ref={label} className="hud absolute right-3 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[0.6rem] text-white/70 backdrop-blur">
        0%
      </span>
    </div>
  );
}
