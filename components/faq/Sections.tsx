'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { useReady } from '@/lib/useReady';
import { flyability, glossary, myths } from '@/lib/extra';
import { site, waLink } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';
import Particles from '../fx/Particles';
import Magnetic from '../animations/Magnetic';
import { TLink } from '../layout/Transition';

/* ------------------------------------------------------------------ hero with floating glyphs */
const GLYPHS = Array.from({ length: 18 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 100, s: 0.6 + ((i * 7) % 10) / 6, d: (i % 3) + 1 }));
export function FaqHero() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    if (window.matchMedia('(pointer: coarse)').matches || prefersReduced()) return;
    const layers = [...el.querySelectorAll<HTMLElement>('[data-glyph]')];
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((g) => {
        const d = Number(g.dataset.depth);
        gsap.to(g, { x: -px * 60 * d, y: -py * 40 * d, rotate: px * 20 * d, duration: 1.2, ease: 'power3.out' });
      });
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, []);
  return (
    <header ref={root} className="relative flex min-h-[78svh] items-end overflow-hidden pb-16 pt-36 md:pt-44">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {GLYPHS.map((g, i) => (
          <span key={i} data-glyph data-depth={g.d} className="absolute" style={{ left: `${g.x}%`, top: `${g.y}%` }}>
            <span
              className="display block select-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,197,107,.35)]"
              style={{ fontSize: `${+(g.s * 6).toFixed(2)}rem`, opacity: +(0.25 + g.d * 0.15).toFixed(2), animation: `float-y ${4 + g.d}s ease-in-out ${i * 0.2}s infinite` }}
            >
              ?
            </span>
          </span>
        ))}
      </div>
      <div className="container-x relative">
        <nav aria-label="Breadcrumb" className="hud mb-6 flex items-center gap-2 text-white/60">
          <TLink href="/" className="hover:text-white">
            Home
          </TLink>
          <span aria-hidden>/</span>
          <span className="text-white" aria-current="page">
            FAQ
          </span>
        </nav>
        <p className="hud text-dawn">Before you fly</p>
        <SplitHeading as="h1" immediate className="display mt-4 max-w-5xl text-[clamp(2.8rem,8vw,8rem)]">
          Questions, answered
        </SplitHeading>
        <p className="mt-6 max-w-xl text-lg text-white/70">Short answers first, details below — plus a few tools to check the weather logic, your limits and the lingo.</p>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ origami quick answers */
const QUICK = [
  { q: 'Experience needed?', a: 'None for a tandem — your pilot flies.' },
  { q: 'When to come?', a: 'Mid-Sep to June. Oct–Nov is the sweet spot.' },
  { q: 'How long in the air?', a: '~18, 25 or 50 minutes, by package.' },
  { q: 'Bad weather?', a: 'We reschedule or refund that flight.' },
];
export function QuickAnswers() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
    el.querySelectorAll<HTMLElement>('[data-fold]').forEach((f, i) => {
      tl.fromTo(f.querySelector('[data-fold-top]'), { rotateX: -100 }, { rotateX: 0, duration: 0.7, ease: 'back.out(1.6)' }, i * 0.18)
        .fromTo(f.querySelector('[data-fold-bottom]'), { rotateX: 100 }, { rotateX: 0, duration: 0.7, ease: 'back.out(1.6)' }, i * 0.18 + 0.25)
        .fromTo(f.querySelector('[data-crease]'), { opacity: 0.8 }, { opacity: 0, duration: 0.6 }, i * 0.18 + 0.5);
    });
  });
  return (
    <section ref={root} className="relative py-16 md:py-24" aria-labelledby="quick-title">
      <div className="container-x">
        <SplitHeading id="quick-title" className="display text-[clamp(1.8rem,3.6vw,3rem)]">
          The 10-second version
        </SplitHeading>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((c) => (
            <div key={c.q} data-fold className="relative [perspective:900px]">
              <div data-fold-top className="origin-bottom rounded-t-2xl bg-gradient-to-b from-[#1e5bc0] to-[#16408a] p-5 pb-4 [transform-style:preserve-3d]">
                <p className="font-display text-xl font-bold">{c.q}</p>
              </div>
              <div data-fold-bottom className="relative origin-top rounded-b-2xl bg-gradient-to-b from-[#13306e] to-[#0e2147] p-5 pt-4 [transform-style:preserve-3d]">
                <p className="text-white/85">{c.a}</p>
                <span data-crease aria-hidden className="pointer-events-none absolute inset-0 rounded-b-2xl bg-gradient-to-b from-black/60 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ wind room */
const STATES = [
  { name: 'Calm', kmh: '0–8', status: 'FLYING', color: '#7bd389', note: 'Smooth air. Pilots launch on gentle breezes up the slope.', k: 0.4, wobble: 4 },
  { name: 'Ideal', kmh: '8–18', status: 'FLYING', color: '#7bd389', note: 'A steady breeze up the hill — clean launches and buoyant air.', k: 1, wobble: 8 },
  { name: 'Gusty', kmh: '18–28', status: 'ON HOLD', color: '#ffc56b', note: 'Gusts and crosswinds. Pilots wait for a calmer cycle.', k: 2.2, wobble: 22 },
  { name: 'Storm', kmh: '28+', status: 'CANCELLED', color: '#ff7a5a', note: 'Strong wind or storms nearby — nobody flies. Your slot moves.', k: 3.6, wobble: 45 },
];
export function WindRoom() {
  const root = useRef<HTMLElement>(null);
  const needle = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(1);
  useEffect(() => {
    const el = root.current!;
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=220%', pin: true, scrub: 0.4, onUpdate: (s) => setI(Math.min(STATES.length - 1, Math.floor(s.progress * STATES.length))) } });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);
  const s = STATES[i];
  useEffect(() => {
    if (prefersReduced() || !needle.current) return;
    const tw = gsap.to(needle.current, { rotate: `+=${s.wobble}`, duration: 0.18 + 0.6 / s.k, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.set(needle.current, { rotate: 200 - s.wobble / 2 });
    return () => {
      tw.kill();
    };
  }, [s]);
  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden transition-colors duration-700" style={{ background: `radial-gradient(70% 60% at 60% 50%, ${s.color}22, #060a12 70%)` }} aria-labelledby="wind-title">
      <Particles mode="wind" color={s.color} intensity={s.k} />
      <div className="container-x relative z-10 grid h-full content-center gap-10 pt-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="hud text-white/70">Why flights get rescheduled</p>
          <SplitHeading id="wind-title" className="display mt-3 text-[clamp(2.2rem,4.8vw,4.6rem)]">
            Read the wind with us
          </SplitHeading>
          <AnimatePresence mode="wait">
            <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-8">
              <p className="display text-[clamp(3rem,8vw,6.5rem)] leading-none" style={{ color: s.color }}>
                {s.name}
              </p>
              <p className="mt-2 font-mono text-xl">{s.kmh} km/h</p>
              <p className="mt-4 max-w-md text-white/75">{s.note}</p>
            </motion.div>
          </AnimatePresence>
          <p className="hud mt-6 text-white/40">Indicative only — the pilot’s call on the day is what counts.</p>
        </div>
        <div className="flex flex-col items-center gap-8 md:col-span-6">
          <div className="relative h-64 w-64 rounded-full border border-white/20 md:h-80 md:w-80">
            {['N', 'E', 'S', 'W'].map((d, k) => (
              <span key={d} className="hud absolute text-white/60" style={{ left: `${+(50 + Math.sin((k * Math.PI) / 2) * 44).toFixed(3)}%`, top: `${+(50 - Math.cos((k * Math.PI) / 2) * 44).toFixed(3)}%`, transform: 'translate(-50%,-50%)' }}>
                {d}
              </span>
            ))}
            <div ref={needle} className="absolute left-[calc(50%-3px)] top-[8%] h-[42%] w-1.5 origin-bottom rounded-full" style={{ background: `linear-gradient(${s.color}, transparent)` }} />
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black/40 font-mono backdrop-blur">
            <div className="flex justify-between border-b border-white/10 px-5 py-3 text-xs text-white/50">
              <span>BILLING LAUNCH</span>
              <span>STATUS</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-white/80">Tandem slots</span>
              <span className="flex items-center gap-2 text-lg font-bold" style={{ color: s.color }}>
                <span className="h-2.5 w-2.5 animate-pulse rounded-full" style={{ background: s.color }} />
                {s.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ limit gauges with sliders */
function Gauge({ value, min, max, okMin, okMax, label, unit }: { value: number; min: number; max: number; okMin: number; okMax: number; label: string; unit: string }) {
  const toA = (v: number) => -120 + ((v - min) / (max - min)) * 240;
  const arc = (a0: number, a1: number) => {
    const r = 80;
    const p = (a: number) => [100 + r * Math.sin((a * Math.PI) / 180), 100 - r * Math.cos((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
  };
  const ok = value >= okMin && value <= okMax;
  return (
    <div className="glass rounded-[1.75rem] p-6 text-center">
      <svg viewBox="0 0 200 150" className="mx-auto w-full max-w-[260px]" aria-hidden>
        <path d={arc(-120, 120)} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="14" strokeLinecap="round" />
        <path d={arc(toA(okMin), toA(okMax))} fill="none" stroke="#7bd389" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
        <g style={{ transform: `rotate(${toA(value)}deg)`, transformOrigin: '100px 100px', transition: 'transform .8s cubic-bezier(.34,1.56,.64,1)' }}>
          <line x1="100" y1="100" x2="100" y2="32" stroke={ok ? '#fff' : '#ff9a8a'} strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="8" fill="#fff" />
      </svg>
      <p className="font-mono text-3xl tabular-nums">
        {value}
        <span className="text-base text-white/50"> {unit}</span>
      </p>
      <p className="hud mt-1 text-white/50">{label}</p>
      <p className={`mt-3 text-sm font-semibold ${ok ? 'text-leaf' : 'text-[#ff9a8a]'}`}>{ok ? 'Within the usual range' : 'Message us before booking'}</p>
    </div>
  );
}
export function LimitGauges() {
  const [age, setAge] = useState(26);
  const [kg, setKg] = useState(68);
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="limits-title">
      <div className="container-x">
        <p className="hud text-dawn">Check yourself</p>
        <SplitHeading id="limits-title" className="display mt-4 max-w-3xl text-[clamp(2.2rem,5vw,4.6rem)]">
          Can I fly? Slide and see
        </SplitHeading>
        <p className="mt-4 max-w-xl text-white/60">A general guide (about 12+ years, roughly 30–90 kg). Limits vary by pilot and package — when in doubt, ask us.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div>
            <Gauge value={age} min={0} max={80} okMin={12} okMax={80} label="Age" unit="yrs" />
            <input type="range" min={5} max={80} value={age} onChange={(e) => setAge(Number(e.target.value))} aria-label="Your age" className="mt-5 w-full accent-[#ff7a2f]" />
          </div>
          <div>
            <Gauge value={kg} min={20} max={130} okMin={30} okMax={90} label="Body weight" unit="kg" />
            <input type="range" min={20} max={130} value={kg} onChange={(e) => setKg(Number(e.target.value))} aria-label="Your weight in kg" className="mt-5 w-full accent-[#ff7a2f]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ flyability bars */
export function FlyabilityBars() {
  const root = useRef<HTMLElement>(null);
  const [hl, setHl] = useState(-1);
  useReady(root, (el) => {
    gsap.from('[data-bar]', { scaleY: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'elastic.out(1, 0.6)', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom 40%', scrub: true, onUpdate: (s) => setHl(Math.min(11, Math.floor(s.progress * 12))) } });
  });
  const cur = hl >= 0 ? flyability[hl] : null;
  return (
    <section ref={root} className="relative overflow-hidden bg-night py-24 md:py-32" aria-labelledby="fly-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">Month by month</p>
            <SplitHeading id="fly-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
              The flying year
            </SplitHeading>
          </div>
          <p className="hud text-white/60" aria-live="polite">
            {cur ? `${cur.m} · ${cur.v === 0 ? 'closed (monsoon)' : cur.v > 0.85 ? 'excellent' : cur.v > 0.6 ? 'good' : 'patchy'}` : 'Scroll to sweep the year'}
          </p>
        </div>
        <div className="mt-12 flex h-[44vh] items-end gap-1.5 md:gap-3" role="img" aria-label="Indicative flying conditions by month: best October–November and March–May, closed July to mid-September">
          {flyability.map((f, i) => (
            <div key={f.m} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div
                data-bar
                className="w-full rounded-t-lg transition-[filter,box-shadow] duration-300"
                style={{
                  height: `${Math.max(4, f.v * 100)}%`,
                  background: f.v === 0 ? 'repeating-linear-gradient(135deg,rgba(255,90,31,.5) 0 4px,transparent 4px 8px)' : `linear-gradient(180deg, ${f.v > 0.85 ? '#ffc56b' : '#2f7cf6'}, ${f.v > 0.85 ? '#ff7a2f' : '#1b4fb3'})`,
                  filter: i === hl ? 'brightness(1.35)' : 'none',
                  boxShadow: i === hl ? '0 0 30px 4px rgba(255,197,107,.45)' : 'none',
                }}
              />
              <span className={`hud text-[0.55rem] md:text-[0.68rem] ${i === hl ? 'text-white' : 'text-white/45'}`}>{f.m}</span>
            </div>
          ))}
        </div>
        <p className="hud mt-4 text-white/40">Indicative conditions based on the seasonal pattern · Jul – mid Sep closed</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ myth vs fact swipe deck */
export function MythDeck() {
  const [gone, setGone] = useState<number[]>([]);
  const [flip, setFlip] = useState<number | null>(null);
  const left = myths.map((_, i) => i).filter((i) => !gone.includes(i));
  const top = left[left.length - 1];
  const dismiss = (i: number) => {
    setFlip(null);
    setGone((g) => [...g, i]);
  };
  return (
    <section className="relative overflow-hidden py-24 md:py-32" aria-labelledby="myth-title">
      <div className="container-x grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="hud text-dawn">Swipe the myths away</p>
          <SplitHeading id="myth-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
            Myth or fact?
          </SplitHeading>
          <p className="mt-5 max-w-md text-white/65">Tap a card to reveal the truth, then drag it off the deck.</p>
          <button type="button" onClick={() => setGone([])} className="hud mt-6 rounded-full border border-white/20 px-4 py-2 hover:border-white/60">
            Reset deck
          </button>
        </div>
        <div className="relative mx-auto h-[380px] w-[min(86vw,360px)]">
          <AnimatePresence>
            {left.map((i, k) => {
              const isTop = i === top;
              const revealed = flip === i;
              return (
                <motion.article
                  key={i}
                  className="absolute inset-0 cursor-grab touch-none select-none rounded-[2rem] border border-white/15 p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] active:cursor-grabbing"
                  style={{ background: revealed ? 'linear-gradient(150deg,#1d5c3a,#0a1220)' : 'linear-gradient(150deg,#3a1f2a,#0a1220)', zIndex: k }}
                  initial={{ scale: 0.9, y: 30, opacity: 0 }}
                  animate={{ scale: 1 - (left.length - 1 - k) * 0.04, y: -(left.length - 1 - k) * 14, rotate: (k % 2 ? 2 : -2) * (left.length - 1 - k), opacity: 1 }}
                  exit={{ x: 400, rotate: 25, opacity: 0, transition: { duration: 0.4 } }}
                  drag={isTop ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.9}
                  onDragEnd={(_, info) => Math.abs(info.offset.x) > 110 && dismiss(i)}
                  onClick={() => isTop && setFlip(revealed ? null : i)}
                  data-cursor="drag"
                  data-cursor-text={revealed ? 'Swipe' : 'Tap'}
                >
                  <span className={`hud inline-block rounded-md border-2 px-2 py-1 ${revealed ? 'border-leaf text-leaf' : 'border-[#ff7a5a] text-[#ff7a5a]'}`}>{revealed ? 'FACT' : 'MYTH'}</span>
                  <p className="mt-8 font-display text-[1.7rem] font-bold leading-tight">{revealed ? myths[i].fact : `“${myths[i].myth}”`}</p>
                  <p className="hud absolute bottom-6 left-7 text-white/40">
                    {gone.length + 1} / {myths.length}
                  </p>
                </motion.article>
              );
            })}
          </AnimatePresence>
          {left.length === 0 && <p className="absolute inset-0 grid place-items-center text-center text-white/60">All myths busted. Ready to fly?</p>}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ glossary decode */
const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=?';
function Decode({ text, go }: { text: string; go: boolean }) {
  const [out, setOut] = useState(text.replace(/\S/g, '·'));
  useEffect(() => {
    if (!go) return;
    if (prefersReduced()) return setOut(text);
    let f = 0;
    const id = window.setInterval(() => {
      f++;
      setOut(
        text
          .split('')
          .map((c, i) => (c === ' ' ? ' ' : i < f / 2 ? c : CH[Math.floor(Math.random() * CH.length)]))
          .join('')
      );
      if (f / 2 > text.length) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
  }, [go, text]);
  return <span aria-label={text}>{out}</span>;
}
export function Glossary() {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setGo(true), { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section className="relative bg-[#071730] bg-[linear-gradient(rgba(120,170,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(120,170,255,.06)_1px,transparent_1px)] bg-[size:32px_32px] py-24 md:py-32" aria-labelledby="gl-title">
      <div className="container-x">
        <p className="hud text-sky">Speak like a pilot</p>
        <SplitHeading id="gl-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
          The glossary
        </SplitHeading>
        <div ref={ref} className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {glossary.map((g, i) => (
            <div key={g.term} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} className="group bg-[#081a36] p-6 transition-colors hover:bg-[#0d2550]">
              <p className="font-mono text-lg font-bold uppercase text-sun">
                <Decode text={g.term} go={go || hover === i} key={hover === i ? `h${i}` : `n${i}`} />
              </p>
              <p className="mt-3 text-sm text-white/70">{g.def}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3D question CTA */
export function AskCTA() {
  const glyph = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const g = glyph.current!;
    if (window.matchMedia('(pointer: coarse)').matches || prefersReduced()) return;
    const rx = gsap.quickTo(g, 'rotateX', { duration: 1, ease: 'power3' });
    const ry = gsap.quickTo(g, 'rotateY', { duration: 1, ease: 'power3' });
    const move = (e: PointerEvent) => {
      ry((e.clientX / window.innerWidth - 0.5) * 50);
      rx(-(e.clientY / window.innerHeight - 0.5) * 40);
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
  const depth = Array.from({ length: 14 }, (_, i) => `${i + 1}px ${i + 1}px 0 hsl(${20 + i * 2} 90% ${40 - i * 1.5}%)`).join(',');
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(60%_60%_at_50%_40%,#2a1b3a,#060a12)] py-24 md:py-32" aria-labelledby="ask-title">
      <Particles mode="stars" color="#ffd9a0" intensity={0.6} />
      <div className="container-x relative grid items-center gap-10 md:grid-cols-2">
        <div className="text-center [perspective:900px]">
          <span ref={glyph} aria-hidden className="display inline-block text-[clamp(10rem,30vw,22rem)] leading-none text-sun" style={{ textShadow: depth }}>
            ?
          </span>
        </div>
        <div>
          <p className="hud text-dawn">Still curious?</p>
          <SplitHeading id="ask-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
            Ask a human
          </SplitHeading>
          <p className="mt-5 max-w-md text-white/70">WhatsApp or call {site.phone} — {site.hours.toLowerCase()}.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <a href={waLink('Hi Bir Paragliding! I have a question:')} target="_blank" rel="noreferrer" data-cursor="book" className="inline-block rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-ink">
                <span data-magnetic-inner className="block">
                  WhatsApp us ↗
                </span>
              </a>
            </Magnetic>
            <a href={site.phoneHref} className="rounded-full border border-white/25 px-7 py-3.5">
              Call now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
