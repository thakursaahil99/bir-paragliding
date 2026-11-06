'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReduced } from '@/lib/gsap';
import { getTier } from '@/lib/perf';
import SplitHeading from '@/components/animations/SplitHeading';

/** Ridge profile 0..1 → height fraction (crest around x≈0.62). */
const ridge = (x: number) => 0.18 + 0.5 * Math.exp(-Math.pow((x - 0.62) / 0.2, 2)) + 0.08 * Math.sin(x * 9) * Math.exp(-Math.pow((x - 0.62) / 0.35, 2));

/**
 * Interactive ridge-soaring simulator. Wind flows over the slope; air forced up the
 * windward face is the "lift band" the glider rides. Too little wind and it sinks,
 * too much and it's blown back over the crest.
 */
export default function RidgeLift() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [wind, setWind] = useState(16);
  const windRef = useRef(16);
  windRef.current = wind;
  const status = wind < 9 ? { t: 'Too light — the glider sinks', c: '#ff9a4d' } : wind <= 26 ? { t: 'Ideal — soaring the ridge', c: '#7bd389' } : { t: 'Too strong — pilots land', c: '#ff6a5a' };

  useEffect(() => {
    const c = cv.current!;
    const ctx = c.getContext('2d')!;
    const tierNow = getTier();
    const dpr = tierNow === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 1;
    let w = 0,
      h = 0,
      raf = 0,
      t = 0,
      visible = false;
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);
    type P = { x: number; y: number; life: number };
    const ps: P[] = Array.from({ length: tierNow === 'low' ? 110 : tierNow === 'mid' ? 180 : 260 }, () => ({ x: Math.random(), y: Math.random() * 0.9, life: Math.random() }));
    const g = { x: 0.42, y: 0.4, vy: 0, bank: 0 };
    const surf = (x: number) => 1 - ridge(x); // y (0 top..1 bottom) of terrain

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      t += 1;
      const W = windRef.current;
      const k = W / 18;
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#0d2a55');
      sky.addColorStop(1, '#5d8fd0');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      // streamlines
      ctx.lineWidth = 1.2;
      for (const p of ps) {
        const sy = surf(p.x);
        const d = sy - p.y; // distance above terrain (0..1)
        const slope = (surf(p.x + 0.004) - surf(p.x - 0.004)) / 0.008; // dy/dx
        let vx = 0.0016 * k;
        let vy = slope * vx * Math.exp(-Math.max(0, d) / 0.22); // follow the slope near the ground
        if (p.x > 0.66) vy += (Math.random() - 0.5) * 0.004 * k * Math.exp(-Math.max(0, d) / 0.2); // lee rotor
        const ox = p.x * w,
          oy = p.y * h;
        p.x += vx;
        p.y += vy;
        p.life += 0.004;
        if (p.y > surf(p.x) - 0.005) p.y = surf(p.x) - 0.006;
        ctx.strokeStyle = `rgba(255,255,255,${0.12 + Math.min(0.4, 0.12 * k)})`;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(p.x * w + vx * w * 6, p.y * h + vy * h * 6);
        ctx.stroke();
        if (p.x > 1.02 || p.life > 1.6) {
          p.x = -0.02;
          p.y = Math.random() * 0.88;
          p.life = 0;
        }
      }
      // terrain
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i <= 200; i++) {
        const x = i / 200;
        ctx.lineTo(x * w, surf(x) * h);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      const tg = ctx.createLinearGradient(0, h * 0.3, 0, h);
      tg.addColorStop(0, '#2f4a33');
      tg.addColorStop(1, '#0d1a12');
      ctx.fillStyle = tg;
      ctx.fill();
      // lift band
      ctx.fillStyle = `rgba(123,211,137,${0.05 + 0.08 * Math.min(1, k)})`;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const x = 0.3 + (i / 60) * 0.32;
        ctx.lineTo(x * w, (surf(x) - 0.22) * h);
      }
      for (let i = 60; i >= 0; i--) {
        const x = 0.3 + (i / 60) * 0.32;
        ctx.lineTo(x * w, (surf(x) - 0.02) * h);
      }
      ctx.fill();
      // glider physics (very simplified)
      const targetX = W > 26 ? Math.min(0.78, g.x + 0.0018) : W < 9 ? 0.38 : 0.44 + Math.sin(t * 0.01) * 0.06;
      g.x += (targetX - g.x) * 0.02;
      const groundY = surf(g.x);
      const lift = W < 9 ? -0.0009 : W > 26 ? 0.0002 : 0.0007 * Math.min(1, k);
      g.vy += (-lift - g.vy * 0.05) * 0.2;
      g.y += g.vy;
      const ceiling = groundY - 0.32;
      if (g.y < ceiling) g.y = ceiling;
      if (g.y > groundY - 0.04) g.y = groundY - 0.04;
      g.bank += ((Math.sin(t * 0.02) * 10 + (W > 26 ? 18 : 0)) - g.bank) * 0.05;
      // draw glider
      ctx.save();
      ctx.translate(g.x * w, g.y * h);
      ctx.rotate((g.bank * Math.PI) / 180);
      ctx.fillStyle = '#ff7a2f';
      ctx.beginPath();
      ctx.moveTo(-26, -8);
      ctx.quadraticCurveTo(0, -24, 26, -8);
      ctx.lineTo(23, -5);
      ctx.quadraticCurveTo(0, -18, -23, -5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-23, -5);
      ctx.lineTo(0, 14);
      ctx.lineTo(23, -5);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 15, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // labels
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.font = '12px ui-monospace, monospace';
      ctx.fillText('WINDWARD FACE', w * 0.36, surf(0.42) * h + 26);
      ctx.fillText('LEE · ROTOR', w * 0.74, surf(0.78) * h + 26);
      ctx.fillText(`WIND ${Math.round(W)} km/h →`, 16, 24);
    };
    if (!prefersReduced()) raf = requestAnimationFrame(frame);
    else {
      visible = true;
      frame();
      cancelAnimationFrame(raf);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <section className="relative py-24 md:py-32" aria-labelledby="ridge-title">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="hud text-dawn">How a wing stays up</p>
          <SplitHeading id="ridge-title" className="display mt-4 text-[clamp(2.2rem,4.4vw,4.2rem)]">
            Play with the wind
          </SplitHeading>
          <p className="mt-5 max-w-sm text-white/70">Wind hitting the Billing ridge is pushed upward — that rising band of air is what keeps a glider soaring. Drag the slider and watch.</p>
          <label className="mt-8 block">
            <span className="hud flex justify-between text-white/60">
              <span>Wind speed</span>
              <span className="font-mono text-white">{wind} km/h</span>
            </span>
            <input type="range" min={0} max={40} value={wind} onChange={(e) => setWind(Number(e.target.value))} className="mt-3 w-full accent-[#ff7a2f]" aria-label="Wind speed in km/h" />
          </label>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold" style={{ borderColor: status.c, color: status.c }} aria-live="polite">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: status.c }} />
            {status.t}
          </p>
          <p className="hud mt-4 text-white/40">A simplified illustration — real decisions are made by your pilot on the day.</p>
        </div>
        <div className="lg:col-span-8">
          <canvas ref={cv} className="h-[56svh] min-h-[340px] w-full rounded-[2rem] border border-white/10" role="img" aria-label="Animated diagram of wind rising over a ridge and a paraglider soaring in the lift band" data-cursor="drag" data-cursor-text="Wind" />
        </div>
      </div>
    </section>
  );
}
