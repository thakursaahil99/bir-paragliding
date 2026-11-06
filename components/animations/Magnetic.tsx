'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Pulls its child toward the pointer; an optional [data-magnetic-inner]
 * child travels further for a layered, parallax "lens" feel.
 */
export default function Magnetic({ children, strength = 0.4, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const ease = 'elastic.out(1, 0.35)';
    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease });
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.9, ease }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.9, ease }) : null;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.45);
      iyTo?.(dy * strength * 0.45);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={['inline-block will-change-transform', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
