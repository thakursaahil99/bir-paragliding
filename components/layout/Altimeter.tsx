'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { scrollState } from '@/lib/store';

const TOP = 2400;
const BOTTOM = 1400;

/**
 * Scroll progress as a flight instrument: the page is the descent from Billing (2,400 m)
 * to the Bir landing field (1,400 m). The variometer reads live scroll velocity.
 * Kept to a slim vertical strip so it lives inside the page gutter.
 */
export default function Altimeter() {
  const marker = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const alt = useRef<HTMLSpanElement>(null);
  const vario = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let p = 0;
    let v = 0;
    const tick = () => {
      const target = Math.min(1, Math.max(0, scrollState.progress || 0));
      p += (target - p) * 0.12;
      v += (-(scrollState.velocity || 0) * 0.22 - v) * 0.1;
      const vv = Math.max(-9.9, Math.min(9.9, v));
      if (marker.current) marker.current.style.transform = `translate3d(0, ${p * 100}cqh, 0)`;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      if (alt.current) alt.current.textContent = `${Math.round(TOP - p * (TOP - BOTTOM)).toLocaleString('en-IN')} m`;
      if (vario.current) {
        vario.current.textContent = `${vv >= 0 ? '+' : '−'}${Math.abs(vv).toFixed(1)} m/s`;
        vario.current.style.color = vv < -0.2 ? '#ff9a4d' : vv > 0.2 ? '#7bd389' : 'rgba(255,255,255,.55)';
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const ticks = Array.from({ length: 21 }, (_, i) => i);

  return (
    <aside aria-hidden className="pointer-events-none fixed right-2 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-center gap-3 md:flex xl:right-4">
      <span ref={alt} className="font-mono text-[0.62rem] tabular-nums text-white/80 [writing-mode:vertical-rl]">
        2,400 m
      </span>
      <div className="relative h-[40vh] w-4 [container-type:size]">
        <div className="absolute inset-y-0 right-0 w-px bg-white/15" />
        <div ref={fill} className="absolute right-0 top-0 h-full w-px origin-top bg-gradient-to-b from-sky to-dawn" style={{ transform: 'scaleY(0)' }} />
        {ticks.map((i) => (
          <span key={i} className={`absolute right-0 h-px ${i % 5 === 0 ? 'w-2.5 bg-white/50' : 'w-1 bg-white/25'}`} style={{ top: `${(i / 20) * 100}%` }} />
        ))}
        <div ref={marker} className="absolute -right-1.5 top-0 will-change-transform">
          <svg viewBox="0 0 24 16" className="-mt-2 h-4 w-5 drop-shadow-[0_0_6px_rgba(255,122,47,.8)]">
            <path d="M1 6 C 6 0, 18 0, 23 6 L 21 7 C 17 3, 7 3, 3 7 Z" fill="#ff7a2f" />
            <path d="M3 7 L 12 15 L 21 7" stroke="#fff" strokeWidth=".7" fill="none" />
          </svg>
        </div>
      </div>
      <span ref={vario} className="font-mono text-[0.62rem] tabular-nums [writing-mode:vertical-rl]">
        +0.0 m/s
      </span>
    </aside>
  );
}
