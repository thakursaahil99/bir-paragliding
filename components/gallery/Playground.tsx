'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { getTier } from '@/lib/perf';
import { useReady } from '@/lib/useReady';
import { scrollState } from '@/lib/store';
import { imageMeta } from '@/lib/blur';
import { gallery, waLink } from '@/lib/site';
import Img from '../animations/Img';
import SplitHeading from '../animations/SplitHeading';
import Particles from '../fx/Particles';
import Lightbox from './Lightbox';

/* ------------------------------------------------------------------ colour stories */
const PALETTE = [
  'flight-sunset', 'tandem-red-wing', 'chokling-monastery', 'tea-garden', 'triund-night', 'dhauladhar-alpenglow', 'season-autumn', 'monks-billing', 'flight-cloud-sea', 'camp-himalaya',
].map((n) => ({ src: `/images/${n}.webp`, alt: gallery.find((g) => g.src.endsWith(`${n}.webp`))?.alt ?? n }));

export function ColorStories() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState('50% 100%');
  const prev = useRef(0);
  const color = imageMeta[PALETTE[active].src]?.c ?? '#ff7a2f';

  useReady(root, () => {
    gsap.from('[data-swatch]', { scale: 0, rotate: -90, duration: 0.9, ease: 'back.out(2.4)', stagger: 0.05, scrollTrigger: { trigger: '[data-swatches]', start: 'top 85%', once: true } });
  });

  useEffect(() => {
    if (prev.current === active) return;
    const layers = stage.current?.querySelectorAll<HTMLElement>('[data-cs-layer]');
    if (!layers) return;
    layers.forEach((l, i) => (l.style.zIndex = i === active ? '3' : i === prev.current ? '2' : '1'));
    if (!prefersReduced()) gsap.fromTo(layers[active], { clipPath: `circle(0% at ${origin})` }, { clipPath: `circle(150% at ${origin})`, duration: 1.1, ease: 'expo.inOut' });
    else layers[active].style.clipPath = 'none';
    prev.current = active;
  }, [active, origin]);

  const pick = (i: number, e: React.MouseEvent) => {
    const s = stage.current!.getBoundingClientRect();
    setOrigin(`${((e.clientX - s.left) / s.width) * 100}% ${((e.clientY - s.top) / s.height) * 100}%`);
    setActive(i);
  };

  return (
    <section ref={root} className="relative overflow-hidden py-24 transition-colors duration-[1200ms] md:py-32" style={{ background: `radial-gradient(70% 60% at 50% 40%, ${color}55, #060a12 75%)` }} aria-labelledby="cs-title">
      <Particles mode="bokeh" color={color} intensity={1} />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">Colour stories</p>
            <SplitHeading id="cs-title" className="display mt-4 text-[clamp(2.2rem,5.5vw,5rem)]">
              The palette of Bir
            </SplitHeading>
          </div>
          <p className="max-w-sm text-white/65">Every swatch is pulled from a real photo. Tap one — the picture blooms out of its colour.</p>
        </div>
        <div ref={stage} className="relative mt-12 aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)] sm:aspect-[16/9]">
          {PALETTE.map((p, i) => (
            <div key={p.src} data-cs-layer className="absolute inset-0" style={{ zIndex: i === 0 ? 3 : 1, clipPath: i === 0 ? 'none' : 'circle(0% at 50% 50%)' }}>
              <Img src={p.src} alt={p.alt} sizes="100vw" />
            </div>
          ))}
          <div className="absolute bottom-0 left-0 z-10 m-4 rounded-2xl bg-ink/70 px-4 py-3 backdrop-blur-md">
            <p className="hud" style={{ color }}>
              {color.toUpperCase()}
            </p>
            <p className="text-sm text-white/85">{PALETTE[active].alt}</p>
          </div>
        </div>
        <div data-swatches className="mt-8 flex flex-wrap justify-center gap-3 md:gap-4" role="tablist" aria-label="Pick a colour">
          {PALETTE.map((p, i) => {
            const c = imageMeta[p.src]?.c ?? '#888';
            return (
              <button
                key={p.src}
                data-swatch
                role="tab"
                aria-selected={active === i}
                aria-label={`Colour ${c} — ${p.alt}`}
                onClick={(e) => pick(i, e)}
                className={`relative h-12 w-12 rounded-full transition-transform duration-300 hover:scale-110 md:h-14 md:w-14 ${active === i ? 'scale-110 ring-2 ring-white ring-offset-4 ring-offset-transparent' : ''}`}
                style={{ background: c, boxShadow: `0 10px 30px -8px ${c}` }}
                data-cursor="view"
                data-cursor-text="Bloom"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ image trail */
const TRAIL = gallery.filter((_, i) => i % 3 === 0).slice(0, 14).map((g) => g.src);

export function ImageTrail() {
  const root = useRef<HTMLElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = area.current!;
    if (prefersReduced()) return;
    const pool = [...el.querySelectorAll<HTMLElement>('[data-trail]')];
    let idx = 0,
      lx = -999,
      ly = -999,
      z = 1;
    const drop = (x: number, y: number) => {
      const n = pool[idx % pool.length];
      idx++;
      setCount((c) => c + 1);
      gsap.killTweensOf(n);
      gsap.set(n, { x, y, xPercent: -50, yPercent: -50, zIndex: z++, opacity: 1, scale: 0.4, rotate: gsap.utils.random(-14, 14) });
      gsap.to(n, { scale: 1, duration: 0.45, ease: 'back.out(2)' });
      gsap.to(n, { opacity: 0, scale: 0.85, y: y + 60, duration: 0.9, delay: 0.85, ease: 'power2.in' });
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (Math.hypot(x - lx, y - ly) > 90) {
        drop(x, y);
        lx = x;
        ly = y;
      }
    };
    el.addEventListener('pointermove', move);
    // idle demo: draw a figure-eight until the visitor moves
    let demo = true;
    const st = { t: 0 };
    const tw = gsap.to(st, {
      t: Math.PI * 2,
      duration: 6,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        if (!demo) return;
        const r = el.getBoundingClientRect();
        const x = r.width / 2 + Math.sin(st.t) * r.width * 0.32;
        const y = r.height / 2 + Math.sin(st.t * 2) * r.height * 0.22;
        if (Math.hypot(x - lx, y - ly) > 110) {
          drop(x, y);
          lx = x;
          ly = y;
        }
      },
    });
    const stopDemo = () => (demo = false);
    el.addEventListener('pointerenter', stopDemo);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tw.play() : tw.pause()));
    io.observe(el);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerenter', stopDemo);
      tw.kill();
      io.disconnect();
    };
  }, []);

  return (
    <section ref={root} className="relative py-24 md:py-32" aria-labelledby="trail-title">
      <div className="container-x">
        <div
          ref={area}
          className="relative h-[78svh] min-h-[480px] cursor-crosshair overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:48px_48px]"
          data-cursor="drag"
          data-cursor-text="Paint"
        >
          <div className="pointer-events-none absolute inset-0 z-[500] flex flex-col items-center justify-center text-center mix-blend-difference">
            <p className="hud text-white/80">Interactive</p>
            <SplitHeading id="trail-title" className="display mt-3 text-[clamp(2.4rem,7vw,7rem)] text-white">
              Paint the sky
            </SplitHeading>
            <p className="mt-4 text-white/80">Move your cursor or drag a finger across the canvas.</p>
            <p className="hud mt-6 text-white/80">{String(count).padStart(4, '0')} frames dropped</p>
          </div>
          {TRAIL.map((src) => (
            <div key={src} data-trail className="pointer-events-none absolute left-0 top-0 h-[200px] w-[150px] overflow-hidden rounded-xl opacity-0 shadow-2xl md:h-[260px] md:w-[200px]">
              <Img src={src} alt="" sizes="200px" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ reels */
const REELS = [
  { video: '/media/flight-loop.mp4', poster: '/media/flight-loop-poster.jpg', title: 'Pilot’s-eye view', tag: 'POV · 14s' },
  { video: '/media/ridge-loop.mp4', poster: '/media/ridge-loop-poster.jpg', title: 'Ridge soaring over snow', tag: 'Ridge · 14s' },
  { image: '/images/flight-sunset-pair.webp', title: 'Sunset pair', tag: 'Still · golden hour' },
];

function Phone({ r, i }: { r: (typeof REELS)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => {
      const v = vid.current;
      if (!v) return;
      if (e.isIntersecting && getTier() !== 'low') v.play().catch(() => {});
      else v.pause();
    });
    io.observe(el);
    if (window.matchMedia('(pointer: coarse)').matches || prefersReduced()) return () => io.disconnect();
    const ry = gsap.quickTo(el, 'rotateY', { duration: 0.8, ease: 'power3' });
    const rx = gsap.quickTo(el, 'rotateX', { duration: 0.8, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      ry(((e.clientX - b.left) / b.width - 0.5) * 24);
      rx(-((e.clientY - b.top) / b.height - 0.5) * 18);
    };
    const leave = () => {
      ry(i === 0 ? 10 : i === 2 ? -10 : 0);
      rx(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      io.disconnect();
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [i]);
  return (
    <div className="[perspective:1200px]" data-reel>
      <div ref={ref} className="relative mx-auto aspect-[9/19] w-[min(72vw,280px)] rounded-[2.6rem] border-[6px] border-[#1c2433] bg-black shadow-[0_50px_100px_-30px_rgba(0,0,0,.9)] [transform-style:preserve-3d]" style={{ transform: `rotateY(${i === 0 ? 10 : i === 2 ? -10 : 0}deg)` }}>
        <div className="absolute inset-0 overflow-hidden rounded-[2.2rem]">
          {r.video ? (
            <video ref={vid} className="h-full w-full object-cover" poster={r.poster} muted loop playsInline preload="none" aria-label={r.title}>
              <source src={r.video} type="video/mp4" />
            </video>
          ) : (
            <div className="absolute inset-0 animate-[float-y_6s_ease-in-out_infinite]">
              <Img src={r.image!} alt={r.title} sizes="280px" className="scale-110" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="absolute inset-x-4 bottom-5">
            <p className="hud text-dawn">{r.tag}</p>
            <p className="mt-1 font-display text-lg font-bold">{r.title}</p>
          </div>
          {/* glare */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.12)_45%,transparent_55%)]" />
        </div>
      </div>
    </div>
  );
}

export function Reels() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap.from('[data-reel]', { y: 200, rotate: (i) => [-12, 0, 12][i], opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
  });
  return (
    <section ref={root} className="relative overflow-hidden bg-[radial-gradient(60%_50%_at_50%_60%,#3a1f2a_0%,#060a12_70%)] py-24 md:py-32" aria-labelledby="reels-title">
      <Particles mode="sparks" color="#ffb35c" intensity={0.6} />
      <div className="container-x relative">
        <p className="hud text-center text-dawn">Reels</p>
        <SplitHeading id="reels-title" className="display mx-auto mt-4 max-w-3xl text-center text-[clamp(2.2rem,5.5vw,5rem)]">
          Hold the phone, feel the lift
        </SplitHeading>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          {REELS.map((r, i) => (
            <Phone key={r.title} r={r} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3D ring */
export function RingSection() {
  const ring = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const shown = gallery.filter((_, i) => i % 2 === 0).slice(0, 18);
  const n = shown.length;
  const moved = useRef(0);

  useEffect(() => {
    const el = ring.current!;
    const st = { a: 0, v: 0, dragging: false, lastX: 0 };
    const reduce = prefersReduced();
    const tick = () => {
      if (!st.dragging) {
        st.v *= 0.95;
        if (!reduce && Math.abs(st.v) < 0.05) st.v += (-0.06 - st.v) * 0.02;
        st.v += -scrollState.velocity * 0.004;
      }
      st.a += st.v;
      el.style.transform = `translateZ(calc(var(--r) * -1)) rotateX(-6deg) rotateY(${st.a}deg)`;
    };
    gsap.ticker.add(tick);
    const parent = el.parentElement!;
    const down = (e: PointerEvent) => {
      st.dragging = true;
      st.lastX = e.clientX;
      moved.current = 0;
    };
    const move = (e: PointerEvent) => {
      if (!st.dragging) return;
      const dx = e.clientX - st.lastX;
      st.lastX = e.clientX;
      moved.current += Math.abs(dx);
      st.v = dx * 0.25;
    };
    const up = () => (st.dragging = false);
    parent.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      gsap.ticker.remove(tick);
      parent.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <section className="relative overflow-hidden py-24 md:py-32" aria-labelledby="ring-title">
      <Particles mode="stars" color="#cfe0ff" intensity={0.7} />
      <div className="container-x relative text-center">
        <p className="hud text-dawn">Drag · scroll · spin</p>
        <SplitHeading id="ring-title" className="display mx-auto mt-4 text-[clamp(2.2rem,5.5vw,5rem)]">
          Spin the valley
        </SplitHeading>
      </div>
      <div className="relative mx-auto mt-10 h-[64svh] max-h-[600px] touch-pan-y select-none [perspective:1400px]" data-cursor="drag" data-cursor-text="Spin">
        <div ref={ring} className="absolute left-1/2 top-1/2 h-0 w-0 [--r:min(70vw,560px)] [transform-style:preserve-3d] md:[--r:min(46vw,680px)]">
          {shown.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => moved.current < 6 && setOpen(i)}
              className="absolute -left-[100px] -top-[135px] h-[270px] w-[200px] overflow-hidden rounded-2xl border border-white/15 [backface-visibility:hidden]"
              style={{ transform: `rotateY(${(i / n) * 360}deg) translateZ(var(--r))` }}
              aria-label={`Open: ${s.alt}`}
            >
              <Img src={s.src} alt={s.alt} sizes="200px" />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <span className="hud absolute bottom-3 left-3 text-white/80">{s.cat}</span>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>{open !== null && <Lightbox items={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ share marquee CTA */
const PILLS = ['flight-sunset', 'monks-billing', 'tandem-red-wing', 'tea-garden', 'triund-night', 'billing-launch-flags'];

export function ShareMarquee() {
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReduced()) return;
    const el = row.current!;
    const s = { x: 0, v: 1 };
    const tick = (_t: number, dt: number) => {
      const target = (1.2 + Math.min(Math.abs(scrollState.velocity) * 0.5, 12)) * scrollState.direction;
      s.v += (target - s.v) * 0.05;
      s.x -= s.v * (dt / 16.67);
      const half = el.scrollWidth / 2;
      if (s.x <= -half) s.x += half;
      if (s.x > 0) s.x -= half;
      el.style.transform = `translate3d(${s.x}px,0,0) skewX(${-s.v * 0.6}deg)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  const seq = [...PILLS, ...PILLS];
  return (
    <section className="relative overflow-hidden bg-snow py-20 text-ink md:py-28" aria-labelledby="share-title">
      <div className="overflow-hidden">
        <div ref={row} className="flex w-max items-center gap-6 will-change-transform md:gap-10">
          {[0, 1].map((k) =>
            seq.map((p, i) => (
              <div key={`${k}-${i}`} className="flex items-center gap-6 md:gap-10">
                <span className="display whitespace-nowrap text-[clamp(3rem,9vw,9rem)] [-webkit-text-stroke:2px_#060a12] [color:transparent]">{i % 2 ? 'Tag your flight' : '#FlyBir'}</span>
                <span className="relative h-[clamp(3rem,8vw,7.5rem)] w-[clamp(6rem,16vw,15rem)] overflow-hidden rounded-full">
                  <Img src={`/images/${p}.webp`} alt="" sizes="240px" />
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="container-x mt-14 flex flex-col items-center gap-6 text-center">
        <SplitHeading id="share-title" className="display max-w-3xl text-[clamp(2rem,4.5vw,4rem)]">
          Flew with us? Send us your best shot
        </SplitHeading>
        <a href={waLink('Hi Bir Paragliding! Here is a photo from my flight:')} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-7 py-3.5 font-semibold text-snow" data-cursor="book" data-cursor-text="Share">
          Share on WhatsApp ↗
        </a>
      </div>
    </section>
  );
}
