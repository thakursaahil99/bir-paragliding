'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Glowing dot + trailing ring. The ring stretches along the direction of travel like a
 * windsock at speed, and morphs into a label pill ("DRAG", "VIEW", "BOOK") over
 * elements carrying data-cursor="...".
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const sock = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const html = document.documentElement;
    html.classList.add('has-cursor');
    const d = dot.current!;
    const r = ring.current!;
    const s = sock.current!;
    const l = label.current!;

    const dx = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'power3' });
    const dy = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'power3' });
    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3' });

    let mode = '';
    let lx = 0,
      ly = 0,
      speed = 0,
      angle = 0,
      visible = false;

    const move = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const vx = e.clientX - lx;
      const vy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      speed = Math.min(Math.hypot(vx, vy), 60);
      if (speed > 1) angle = (Math.atan2(vy, vx) * 180) / Math.PI;
    };

    const tick = () => {
      speed *= 0.86;
      if (!mode) gsap.set(s, { rotate: angle, scaleX: 1 + speed / 45, scaleY: 1 - speed / 160 });
    };
    gsap.ticker.add(tick);

    const setMode = (m: string, text = '') => {
      if (m === mode) return;
      mode = m;
      r.dataset.mode = m;
      l.textContent = text;
      if (m) gsap.to(s, { rotate: 0, scaleX: 1, scaleY: 1, duration: 0.3 });
    };

    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const c = t?.closest<HTMLElement>('[data-cursor]');
      if (c && c.dataset.cursor) {
        setMode('label', (c.dataset.cursorText || c.dataset.cursor).toUpperCase());
        return;
      }
      const a = t?.closest('a,button,[role="button"],input,textarea,select,label');
      setMode(a ? 'hover' : '');
    };

    const down = () => gsap.to(s, { scale: 0.8, duration: 0.15 });
    const up = () => gsap.to(s, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
    const leave = () => {
      visible = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.3 });
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerleave', leave);

    return () => {
      html.classList.remove('has-cursor');
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block">
      <div ref={ring} className="cursor-ring invisible absolute left-0 top-0 flex h-0 w-0 items-center justify-center opacity-0" data-mode="">
        <div ref={sock} className="cursor-sock shrink-0">
          <span ref={label} className="cursor-label" />
        </div>
      </div>
      <div ref={dot} className="invisible absolute left-0 top-0 flex h-0 w-0 items-center justify-center opacity-0">
        <span className="block h-2 w-2 shrink-0 rounded-full bg-dawn shadow-[0_0_12px_3px_rgba(255,122,47,0.75)]" />
      </div>
      <style>{`
        .cursor-sock{width:38px;height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.55);display:grid;place-items:center;
          transition:width .45s var(--ease-glide),height .45s var(--ease-glide),background-color .35s,border-color .35s;}
        .cursor-label{font-family:var(--font-mono);font-size:10px;letter-spacing:.2em;color:#060a12;opacity:0;transition:opacity .2s}
        .cursor-ring[data-mode="hover"] .cursor-sock{width:64px;height:64px;border-color:rgba(255,197,107,.9);background:rgba(255,122,47,.08)}
        .cursor-ring[data-mode="label"] .cursor-sock{width:92px;height:92px;background:#ffc56b;border-color:#ffc56b}
        .cursor-ring[data-mode="label"] .cursor-label{opacity:1;transition-delay:.12s}
      `}</style>
    </div>
  );
}
