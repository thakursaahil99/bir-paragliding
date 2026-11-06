'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { getTier } from '@/lib/perf';
import { seasons } from '@/lib/site';
import Img from '../animations/Img';

type Fx = 'petals' | 'rays' | 'rain' | 'leaves' | 'snow';
type P = { kind: Fx; x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; life: number; hue: number };

/** Weather particles drawn on a 2D canvas; the active mode spawns, old particles fall out naturally. */
function useWeather(canvas: React.RefObject<HTMLCanvasElement | null>, mode: React.RefObject<Fx>, running: React.RefObject<boolean>) {
  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    let w = 0,
      h = 0,
      raf = 0,
      t = 0;
    // weaker devices keep the weather, just lighter: 1× canvas, fewer flakes and drops
    const tierNow = getTier();
    const amount = tierNow === 'low' ? 0.4 : tierNow === 'mid' ? 0.7 : 1;
    const dpr = tierNow === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 1;
    const resize = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const ps: P[] = [];
    const spawn = (kind: Fx): P => {
      const r = Math.random;
      switch (kind) {
        case 'rain':
          return { kind, x: r() * (w + 200) - 100, y: -20, vx: -2.2, vy: 14 + r() * 8, r: 10 + r() * 14, rot: 0, vr: 0, life: 1, hue: 0 };
        case 'snow':
          return { kind, x: r() * w, y: -10, vx: r() - 0.5, vy: 0.6 + r() * 1.3, r: 1 + r() * 2.8, rot: r() * 6, vr: 0.02, life: 1, hue: 0 };
        case 'leaves':
          return { kind, x: r() * w, y: -20, vx: 0.5 + r() * 1.5, vy: 1 + r() * 1.6, r: 5 + r() * 6, rot: r() * 6, vr: (r() - 0.5) * 0.12, life: 1, hue: 20 + r() * 25 };
        case 'petals':
          return { kind, x: r() * w, y: -20, vx: 0.3 + r(), vy: 0.6 + r() * 1.1, r: 3 + r() * 4, rot: r() * 6, vr: (r() - 0.5) * 0.08, life: 1, hue: 330 + r() * 25 };
        default:
          return { kind, x: r() * w, y: h * (0.2 + r() * 0.8), vx: (r() - 0.5) * 0.3, vy: -0.15 - r() * 0.3, r: 0.8 + r() * 1.8, rot: 0, vr: 0, life: 1, hue: 45 };
      }
    };
    const rate: Record<Fx, number> = { rain: 6, snow: 2, leaves: 0.5, petals: 0.7, rays: 0.6 };
    let acc = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!running.current) return;
      t += 1;
      ctx.clearRect(0, 0, w, h);
      const m = mode.current;
      acc += rate[m] * amount;
      while (acc >= 1 && ps.length < 260 * amount) {
        ps.push(spawn(m));
        acc -= 1;
      }
      if (m === 'rays') {
        // sun rays fanning from the top-right corner
        ctx.save();
        ctx.translate(w * 0.92, -h * 0.08);
        for (let i = 0; i < 7; i++) {
          const a = 1.75 + i * 0.13 + Math.sin(t * 0.004 + i) * 0.03;
          const g = ctx.createLinearGradient(0, 0, Math.cos(a) * h * 1.6, Math.sin(a) * h * 1.6);
          g.addColorStop(0, 'rgba(255,220,150,0.12)');
          g.addColorStop(1, 'rgba(255,220,150,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, h * 1.8, a - 0.035, a + 0.035);
          ctx.fill();
        }
        ctx.restore();
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx + (p.kind === 'leaves' || p.kind === 'petals' ? Math.sin((t + i * 13) * 0.03) * 0.8 : 0);
        p.y += p.vy;
        p.rot += p.vr;
        if (p.kind !== m) p.life -= 0.004;
        if (p.y > h + 30 || p.y < -40 || p.x < -120 || p.x > w + 120 || p.life <= 0) {
          ps.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.kind === 'rain') {
          ctx.strokeStyle = 'rgba(190,215,255,0.55)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.vx * 1.6, p.r);
          ctx.stroke();
        } else if (p.kind === 'snow') {
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'leaves') {
          ctx.fillStyle = `hsla(${p.hue},85%,52%,0.9)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(80,30,10,.5)';
          ctx.beginPath();
          ctx.moveTo(-p.r, 0);
          ctx.lineTo(p.r, 0);
          ctx.stroke();
        } else if (p.kind === 'petals') {
          ctx.fillStyle = `hsla(${p.hue},80%,82%,0.9)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(255,230,170,0.7)';
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvas, mode, running]);
}

/**
 * Pinned season machine: scroll turns a dial through spring → winter; the photograph, colour grade
 * and live weather (petals, sun rays, rain, falling leaves, snow) change with it.
 */
export default function Seasons() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const mode = useRef<Fx>('petals');
  const running = useRef(false);
  const [idx, setIdx] = useState(0);
  const s = seasons[idx];

  useWeather(canvas, mode, running);

  useEffect(() => {
    mode.current = s.fx as Fx;
  }, [s]);

  useEffect(() => {
    const el = root.current!;
    const io = new IntersectionObserver(([e]) => (running.current = e.isIntersecting && !prefersReduced()));
    io.observe(el);
    if (prefersReduced()) return () => io.disconnect();
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: `+=${seasons.length * 90}%`,
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              const i = Math.min(seasons.length - 1, Math.floor(self.progress * seasons.length));
              setIdx(i);
              el.style.setProperty('--dial', `${self.progress * 360}deg`);
            },
          },
        });
      }, el);
    });
    return () => {
      io.disconnect();
      off();
      ctx?.revert();
    };
  }, []);

  // text swap
  useEffect(() => {
    if (prefersReduced()) return;
    gsap.fromTo('[data-season-copy] > *', { y: 30, autoAlpha: 0, filter: 'blur(8px)' }, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.06, ease: 'expo.out' });
    gsap.fromTo('[data-season-name] span', { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.03, ease: 'expo.out' });
  }, [idx]);

  return (
    <section
      ref={root}
      className="relative h-[100svh] overflow-hidden"
      aria-label="Bir Billing through the seasons"
      style={{ background: `linear-gradient(160deg, ${s.from}, ${s.to})`, transition: 'background 1.2s ease' }}
    >
      {seasons.map((x, i) => (
        <div key={x.id} className="absolute inset-0 transition-opacity duration-[1400ms]" style={{ opacity: i === idx ? 0.55 : 0 }} aria-hidden={i !== idx}>
          <Img src={x.image} alt={`${x.name} in the Kangra valley`} sizes="100vw" className={`transition-transform duration-[6s] ${i === idx ? 'scale-105' : 'scale-125'}`} />
        </div>
      ))}
      <div className="absolute inset-0 mix-blend-multiply" style={{ background: `linear-gradient(160deg, ${s.from}cc, transparent 70%)`, transition: 'background 1.2s' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40" />
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="container-x relative z-10 grid h-full items-end gap-10 pb-12 pt-28 md:grid-cols-12 md:items-center md:pb-0">
        <div className="md:col-span-7">
          <p className="hud text-white/70">When to fly · scroll through the year</p>
          <h2 data-season-name aria-live="polite" className="display mt-4 flex overflow-hidden text-[clamp(2.6rem,6.4vw,7.4rem)] leading-[0.85]">
            {s.name.split('').map((c, i) => (
              <span key={`${s.id}-${i}`} className="inline-block">
                {c}
              </span>
            ))}
          </h2>
          <div data-season-copy className="mt-6 max-w-lg">
            <p className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-lg">{s.months}</span>
              <span className={`hud rounded-full px-3 py-1.5 ${s.open ? 'bg-leaf/20 text-leaf' : 'bg-ember/25 text-[#ffb59a]'}`}>{s.status}</span>
            </p>
            <p className="mt-4 text-lg text-white/85">{s.text}</p>
          </div>
        </div>

        {/* season dial */}
        <div className="hidden justify-self-end md:col-span-5 md:block">
          <div className="relative h-[min(34vw,420px)] w-[min(34vw,420px)]">
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
              <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1" />
              {seasons.map((x, i) => {
                const a0 = (i / seasons.length) * Math.PI * 2 - Math.PI / 2;
                const a1 = ((i + 1) / seasons.length) * Math.PI * 2 - Math.PI / 2;
                const r = 80;
                const d = `M ${100 + r * Math.cos(a0 + 0.04)} ${100 + r * Math.sin(a0 + 0.04)} A ${r} ${r} 0 0 1 ${100 + r * Math.cos(a1 - 0.04)} ${100 + r * Math.sin(a1 - 0.04)}`;
                const am = (a0 + a1) / 2;
                return (
                  <g key={x.id}>
                    <path d={d} fill="none" stroke={i === idx ? x.accent : 'rgba(255,255,255,.25)'} strokeWidth={i === idx ? 6 : 3} strokeLinecap="round" style={{ transition: 'all .6s' }} />
                    <text x={100 + 62 * Math.cos(am)} y={100 + 62 * Math.sin(am) + 3} textAnchor="middle" fontSize="8" fill={i === idx ? '#fff' : 'rgba(255,255,255,.5)'} className="font-mono" letterSpacing="1">
                      {x.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-0 transition-transform duration-300" style={{ transform: 'rotate(var(--dial, 0deg))' }}>
              <div className="absolute left-1/2 top-[6%] h-[44%] w-[2px] -translate-x-1/2 bg-gradient-to-b from-white to-transparent" />
              <div className="absolute left-1/2 top-[4%] h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_18px_4px_rgba(255,255,255,.6)]" />
            </div>
            <div className="absolute inset-[30%] grid place-items-center rounded-full border border-white/20 bg-ink/40 text-center backdrop-blur-md">
              <div>
                <p className="hud text-white/50">Flying</p>
                <p className={`font-display text-3xl font-bold ${s.open ? 'text-leaf' : 'text-[#ffb59a]'}`}>{s.open ? 'Open' : 'Closed'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
