'use client';

import { useEffect, useRef } from 'react';
import { getTier, onTierChange } from '@/lib/perf';

export type FxMode = 'bubbles' | 'wind' | 'stars' | 'bokeh' | 'sparks' | 'dust' | 'none';

type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; life: number; seed: number; kind: FxMode };

/**
 * Lightweight generative layer (2D canvas). Change `mode`, `color` or `intensity`
 * at any time — existing particles fade out naturally while the new mode spawns.
 * Pauses itself when off-screen and respects reduced motion. Device tiers: off on 'low',
 * half density at 1× resolution on 'mid' (see lib/perf.ts).
 */
export default function Particles({ mode, color = '#ffffff', intensity = 1, className = '' }: { mode: FxMode; color?: string; intensity?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useRef({ mode, color, intensity });
  live.current = { mode, color, intensity };

  useEffect(() => {
    const cv = ref.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (getTier() === 'low') return;
    let lite = getTier() === 'mid';
    const ctx = cv.getContext('2d')!;
    const dpr = lite ? 1 : Math.min(window.devicePixelRatio, 1.5);
    let w = 0,
      h = 0,
      raf = 0,
      t = 0,
      visible = false,
      acc = 0;
    const ps: P[] = [];
    const resize = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, w * dpr);
      cv.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);

    const spawn = (kind: FxMode): P => {
      const r = Math.random;
      switch (kind) {
        case 'bubbles':
          return { kind, x: w * (0.3 + r() * 0.4) + (r() - 0.5) * 80, y: h + 10, vx: 0, vy: -(0.6 + r() * 1.6), r: 2 + r() * 7, a: 0.5, life: 1, seed: r() * 100 };
        case 'wind':
          return { kind, x: -60, y: r() * h, vx: 3 + r() * 6, vy: 0, r: 30 + r() * 120, a: 0.35, life: 1, seed: r() * 100 };
        case 'stars':
          return { kind, x: r() * w, y: r() * h, vx: 0, vy: 0, r: 0.4 + r() * 1.4, a: 0, life: 1, seed: r() * 100 };
        case 'bokeh':
          return { kind, x: r() * w, y: r() * h, vx: (r() - 0.5) * 0.4, vy: -(0.15 + r() * 0.35), r: 12 + r() * 46, a: 0, life: 1, seed: r() * 100 };
        case 'sparks':
          return { kind, x: r() * w, y: h * (0.4 + r() * 0.6), vx: (r() - 0.5) * 1.2, vy: -(0.8 + r() * 2), r: 0.8 + r() * 1.8, a: 1, life: 1, seed: r() * 100 };
        case 'dust':
        default:
          return { kind: 'dust', x: r() * w, y: r() * h, vx: (r() - 0.5) * 0.25, vy: (r() - 0.5) * 0.2, r: 0.6 + r() * 1.6, a: 0.5, life: 1, seed: r() * 100 };
      }
    };
    const rate: Record<FxMode, number> = { bubbles: 1.6, wind: 0.9, stars: 2, bokeh: 0.25, sparks: 1.2, dust: 0.8, none: 0 };
    const cap: Record<FxMode, number> = { bubbles: 160, wind: 70, stars: 260, bokeh: 28, sparks: 140, dust: 120, none: 0 };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      t++;
      const { mode: m, color: col, intensity: k } = live.current;
      ctx.clearRect(0, 0, w, h);
      const count = ps.filter((p) => p.kind === m).length;
      acc += rate[m] * k * (lite ? 0.6 : 1);
      while (acc >= 1) {
        if (count < cap[m] * Math.max(0.3, k) * (lite ? 0.5 : 1)) ps.push(spawn(m));
        acc -= 1;
      }
      ctx.fillStyle = col;
      ctx.strokeStyle = col;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (p.kind !== m) p.life -= 0.012;
        switch (p.kind) {
          case 'bubbles':
            p.x += Math.sin((t + p.seed * 10) * 0.03) * 0.6;
            p.y += p.vy * k;
            p.r *= 0.999;
            ctx.globalAlpha = 0.35 * p.life * Math.min(1, (h - p.y) / 120);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 'wind': {
            p.x += p.vx * k;
            const y = p.y + Math.sin((p.x + p.seed * 40) * 0.01) * 14;
            ctx.globalAlpha = p.a * p.life * Math.min(1, p.x / 80);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x - p.r, y + Math.sin((p.x - p.r + p.seed * 40) * 0.01) * 4);
            ctx.lineTo(p.x, y);
            ctx.stroke();
            break;
          }
          case 'stars':
            p.a = Math.min(1, p.a + 0.01);
            ctx.globalAlpha = p.life * p.a * (0.45 + 0.55 * Math.abs(Math.sin(t * 0.02 + p.seed)));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'bokeh':
            p.x += p.vx;
            p.y += p.vy;
            p.a = Math.min(0.22, p.a + 0.002);
            ctx.globalAlpha = p.a * p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'sparks':
            p.x += p.vx + Math.sin(t * 0.05 + p.seed) * 0.3;
            p.y += p.vy * k;
            p.a -= 0.006;
            ctx.globalAlpha = Math.max(0, p.a) * p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            break;
          default:
            p.x += p.vx;
            p.y += p.vy;
            ctx.globalAlpha = p.a * p.life * (0.5 + 0.5 * Math.sin(t * 0.01 + p.seed));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        if (p.life <= 0 || p.y < -80 || p.y > h + 80 || p.x > w + 200 || p.x < -220 || (p.kind === 'sparks' && p.a <= 0)) ps.splice(i, 1);
        else if (p.kind === 'stars' && ps.length > cap.stars * 1.2) ps.splice(i, 1);
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    const offTier = onTierChange((t) => {
      if (t === 'mid') lite = true;
      if (t === 'low') {
        cancelAnimationFrame(raf);
        ctx.clearRect(0, 0, w, h);
      }
    });
    return () => {
      offTier();
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
