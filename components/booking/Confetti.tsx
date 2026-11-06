'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#ff7a2f', '#ffc56b', '#2f7cf6', '#8ec5ff', '#f4f7fb', '#7bd389'];

/** Canvas confetti: two cannons from the bottom corners + a burst from the centre. */
export default function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = (cv.width = window.innerWidth * dpr);
    const h = (cv.height = window.innerHeight * dpr);
    type C = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; c: string; shape: number; life: number };
    const ps: C[] = [];
    const add = (x: number, y: number, angle: number, spread: number, n: number, speed: number) => {
      for (let i = 0; i < n; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const s = speed * (0.5 + Math.random() * 0.8) * dpr;
        ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: (4 + Math.random() * 6) * dpr, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: COLORS[(Math.random() * COLORS.length) | 0], shape: (Math.random() * 3) | 0, life: 1 });
      }
    };
    add(0, h, -Math.PI / 3, 0.6, 90, 22);
    add(w, h, (-Math.PI * 2) / 3, 0.6, 90, 22);
    setTimeout(() => add(w / 2, h * 0.45, -Math.PI / 2, Math.PI * 2, 120, 14), 250);
    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.vy += 0.35 * dpr;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.004;
        if (p.y > h + 40 || p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life * 1.5);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (p.shape === 0) ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.r / 2);
          ctx.lineTo(p.r / 2, p.r / 2);
          ctx.lineTo(-p.r / 2, p.r / 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (ps.length) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[95] h-full w-full" />;
}
