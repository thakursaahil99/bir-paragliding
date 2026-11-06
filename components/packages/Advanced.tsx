'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { useReady } from '@/lib/useReady';
import { courses, flights, inr, waLink } from '@/lib/site';
import { included } from '@/lib/extra';
import SplitHeading from '../animations/SplitHeading';
import Particles from '../fx/Particles';
import Magnetic from '../animations/Magnetic';
import { TLink } from '../layout/Transition';

/** Pins `ref` for `length` and reports progress 0..1. */
function usePinProgress(ref: React.RefObject<HTMLElement | null>, length: string, onP: (p: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) return onP(1);
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: length, pin: true, scrub: 0.5, onUpdate: (s) => onP(s.progress) } });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ------------------------------------------------------------------ airtime clock */
const MAX_MIN = 52;
const altAt = (m: number) => 2400 + Math.sin(m * 0.45) * 160 + Math.sin(m * 0.13) * 220 - m * 14 + (m > 20 ? Math.sin((m - 20) * 0.3) * 120 : 0);

export function AirtimeClock() {
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  usePinProgress(root, '+=260%', setP);
  const min = p * MAX_MIN;
  const pts = Array.from({ length: 105 }, (_, i) => {
    const m = (i / 104) * min;
    return `${(m / MAX_MIN) * 1000},${300 - ((altAt(m) - 1400) / 1300) * 280}`;
  }).join(' ');
  const climbing = altAt(min + 0.4) > altAt(min);
  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-[linear-gradient(180deg,#0b3a7a,#2f7cf6_55%,#ffbe7a)]" aria-labelledby="air-title">
      <Particles mode="bubbles" color="#ffffff" intensity={climbing ? 1.6 : 0.5} />
      <div className="container-x relative z-10 grid h-full content-center gap-8 pt-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="hud text-white/80">Airtime, visualised</p>
          <SplitHeading id="air-title" className="display mt-3 text-[clamp(2.2rem,4.8vw,4.6rem)]">
            How long you’ll fly
          </SplitHeading>
          <p className="mt-6 font-mono text-[clamp(3.4rem,9vw,7rem)] leading-none tabular-nums">
            {String(Math.floor(min)).padStart(2, '0')}:{String(Math.floor((min % 1) * 60)).padStart(2, '0')}
          </p>
          <p className={`hud mt-3 ${climbing ? 'text-leaf' : 'text-sun'}`}>{climbing ? '▲ climbing in a thermal' : '▼ gliding down the valley'}</p>
          <ul className="mt-8 space-y-3">
            {flights.map((f) => {
              const mins = parseInt(f.durationShort, 10);
              const landed = min >= mins;
              return (
                <li key={f.slug} className={`flex items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-md transition-all duration-500 ${landed ? 'border-white/10 bg-black/20 opacity-60' : 'border-white/40 bg-white/15'}`}>
                  <span>
                    <span className="block font-display font-bold">{f.name}</span>
                    <span className="hud text-white/70">{inr(f.price)}</span>
                  </span>
                  <span className="text-right font-mono text-sm">{landed ? `Touchdown · ${mins} min` : `In the air · ${mins - Math.floor(min)} min left`}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="relative md:col-span-7">
          <svg viewBox="0 0 1000 320" className="w-full overflow-visible" aria-label="Illustrative altitude over time for a tandem flight">
            {[18, 25, 50].map((m) => (
              <g key={m}>
                <line x1={(m / MAX_MIN) * 1000} x2={(m / MAX_MIN) * 1000} y1="0" y2="300" stroke="rgba(255,255,255,.35)" strokeDasharray="4 6" />
                <text x={(m / MAX_MIN) * 1000 + 6} y="16" fontSize="14" fill="#fff" className="font-mono">
                  {m} min
                </text>
              </g>
            ))}
            <polyline points={pts} fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
            <circle cx={(min / MAX_MIN) * 1000} cy={300 - ((altAt(min) - 1400) / 1300) * 280} r="8" fill="#ff7a2f" stroke="#fff" strokeWidth="3" />
          </svg>
          <p className="hud mt-3 text-white/70">Illustrative profile — real flights follow the day’s air</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pilot pathway (P1→P4) */
const LEVELS = [
  { code: 'P1', title: 'Ground & first hops', note: 'Kiting, inflation, tiny hops on the training slope.', course: courses[0] },
  { code: 'P2', title: 'First solo flights', note: 'Radio-guided flights from launch to landing.', course: courses[0] },
  { code: 'P3', title: 'Thermals & soaring', note: 'Climbing, centring lift and ridge soaring.', course: courses[1] },
  { code: 'P4', title: 'Cross-country', note: 'Route planning and multi-day XC flying.', course: courses[2] },
];

export function PilotPathway() {
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  usePinProgress(root, '+=240%', setP);
  const lvl = Math.min(LEVELS.length - 1, Math.floor(p * LEVELS.length));
  const L = LEVELS[lvl];
  const bg = ['#2f7cf6', '#1b4fb3', '#13306e', '#060d24'][lvl];
  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden transition-[background-color] duration-1000" style={{ backgroundColor: bg }} aria-labelledby="path-title">
      <div className="absolute inset-0" style={{ opacity: lvl / 3 }}>
        <Particles mode="stars" color="#e8f1ff" intensity={0.4 + lvl * 0.4} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="container-x relative z-10 grid h-full content-center gap-10 pt-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="hud text-white/80">Learn to fly · P1 → P4</p>
          <SplitHeading id="path-title" className="display mt-3 text-[clamp(2.2rem,4.8vw,4.6rem)]">
            The pilot pathway
          </SplitHeading>
          <div key={L.code} className="mt-8 animate-[float-y_4s_ease-in-out_infinite]">
            <p className="display text-[clamp(4rem,10vw,8rem)] leading-none text-sun">{L.code}</p>
            <h3 className="mt-2 font-display text-3xl font-bold">{L.title}</h3>
            <p className="mt-2 max-w-sm text-white/75">{L.note}</p>
            <p className="hud mt-4 text-white/70">
              {L.course.name} · {L.course.duration} · {inr(L.course.price)}
            </p>
          </div>
        </div>
        <div className="relative h-[56vh] md:col-span-6 md:col-start-7">
          {/* ladder */}
          <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-white/20" />
          <div className="absolute bottom-0 left-1/2 w-[3px] -translate-x-1/2 bg-gradient-to-t from-sun to-dawn transition-[height] duration-700" style={{ height: `${((lvl + 0.5) / LEVELS.length) * 100}%` }} />
          {LEVELS.map((l, i) => {
            const on = i <= lvl;
            return (
              <div key={l.code} className="absolute left-1/2 flex -translate-x-1/2 items-center gap-4" style={{ bottom: `${((i + 0.5) / LEVELS.length) * 100}%` }}>
                <span className={`grid h-14 w-14 place-items-center rounded-full border-2 font-mono text-sm font-bold transition-all duration-500 ${on ? 'scale-110 border-sun bg-sun text-ink shadow-[0_0_40px_8px_rgba(255,197,107,.5)]' : 'border-white/30 bg-black/30 text-white/50'}`}>
                  {l.code}
                </span>
              </div>
            );
          })}
          {/* climbing glider */}
          <svg viewBox="0 0 60 40" className="absolute left-1/2 h-10 w-16 translate-x-6 transition-[bottom] duration-700" style={{ bottom: `calc(${((lvl + 0.5) / LEVELS.length) * 100}% - 20px)` }} aria-hidden>
            <path d="M3 14 C 14 2, 46 2, 57 14 L 53 17 C 43 8, 17 8, 7 17 Z" fill="#ff7a2f" />
            <path d="M7 17 L 30 36 L 53 17" stroke="#fff" strokeWidth="1.2" fill="none" />
            <circle cx="30" cy="37" r="3" fill="#fff" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ included orbit */
const ICON: Record<string, string> = {
  pilot: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0',
  wing: 'M2 10C6 4 18 4 22 10M5 11l7 9 7-9',
  reserve: 'M4 12a8 8 0 0 1 16 0H4zm0 0l8 9 8-9',
  helmet: 'M4 15a8 8 0 0 1 16 0v2H4zm0 2h16',
  brief: 'M4 4h16v12H10l-4 4v-4H4z',
  camera: 'M3 8h4l2-3h6l2 3h4v11H3zm9 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

export function IncludedOrbit() {
  const root = useRef<HTMLElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useReady(root, (el) => {
    gsap.to(ring.current, { rotate: 200, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('[data-orbit-item]', { scale: 0, opacity: 0, duration: 1, ease: 'elastic.out(1, 0.5)', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 65%', once: true } });
  });
  useEffect(() => {
    const el = root.current!;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const stage = el.querySelector<HTMLElement>('[data-orbit-stage]')!;
    const rx = gsap.quickTo(stage, 'rotateX', { duration: 1, ease: 'power3' });
    const ry = gsap.quickTo(stage, 'rotateY', { duration: 1, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 20);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 20);
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, []);
  return (
    <section ref={root} className="relative overflow-hidden bg-[radial-gradient(50%_50%_at_50%_50%,#15284d,#060a12)] py-24 md:py-32" aria-labelledby="orbit-title">
      <div className="container-x relative text-center">
        <p className="hud text-dawn">Every tandem includes</p>
        <SplitHeading id="orbit-title" className="display mx-auto mt-4 max-w-3xl text-[clamp(2.2rem,5.5vw,5rem)]">
          Everything orbits your safety
        </SplitHeading>
      </div>
      <div className="relative mx-auto mt-10 aspect-square w-[min(92vw,640px)] [perspective:1200px]">
        <div data-orbit-stage className="absolute inset-0 [transform-style:preserve-3d]">
          {[1, 0.72, 0.44].map((s) => (
            <div key={s} className="absolute rounded-full border border-white/10" style={{ inset: `${(1 - s) * 50}%` }} />
          ))}
          <div className="absolute inset-[34%] grid place-items-center rounded-full bg-gradient-to-br from-dawn/30 to-sky/20 shadow-[0_0_80px_10px_rgba(255,122,47,.25)]">
            <svg viewBox="0 0 60 40" className="w-1/2 animate-[float-y_3s_ease-in-out_infinite]" aria-hidden>
              <path d="M3 14 C 14 2, 46 2, 57 14 L 53 17 C 43 8, 17 8, 7 17 Z" fill="#ff7a2f" />
              <path d="M7 17 L 30 34 L 53 17" stroke="#fff" strokeWidth="1.2" fill="none" />
              <circle cx="27" cy="35" r="3" fill="#fff" />
              <circle cx="33" cy="35" r="3" fill="#ffc56b" />
            </svg>
          </div>
          <div ref={ring} className="absolute inset-0">
            {included.map((it, i) => {
              const a = (i / included.length) * Math.PI * 2;
              return (
                <div key={it.label} className="absolute" style={{ left: `${+(50 + Math.cos(a) * 42).toFixed(3)}%`, top: `${+(50 + Math.sin(a) * 42).toFixed(3)}%` }}>
                  <div data-orbit-item className="glass flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-2xl px-3 py-3 text-center">
                    <svg viewBox="0 0 24 24" className="h-7 w-7 text-sun" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={ICON[it.icon]} />
                    </svg>
                    <span className="max-w-[7rem] text-xs font-medium leading-tight">{it.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ holographic gift card */
export function GiftCard() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const el = card.current!;
    if (window.matchMedia('(pointer: coarse)').matches || prefersReduced()) return;
    const rx = gsap.quickTo(el, 'rotateX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotateY', { duration: 0.6, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * 22);
      ry((px - 0.5) * 26);
      el.style.setProperty('--px', `${px * 100}%`);
      el.style.setProperty('--py', `${py * 100}%`);
      el.style.setProperty('--hue', `${px * 360}deg`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  useReady(root, (el) => {
    gsap.from(card.current, { y: 160, rotateX: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 65%', once: true } });
  });
  return (
    <section ref={root} className="relative overflow-hidden py-24 md:py-32" aria-labelledby="gift-title">
      <Particles mode="sparks" color="#ffd36b" intensity={0.8} />
      <div className="container-x relative grid items-center gap-14 md:grid-cols-2">
        <div>
          <p className="hud text-dawn">Give the sky</p>
          <SplitHeading id="gift-title" className="display mt-4 text-[clamp(2.2rem,5.5vw,5rem)]">
            Gift a flight
          </SplitHeading>
          <p className="mt-6 max-w-md text-white/70">Birthdays, anniversaries, a friend who needs a lift. Tell us who it’s for — we’ll arrange a gift voucher on WhatsApp.</p>
          <a
            href={waLink('Hi Bir Paragliding! I would like to gift a tandem flight. Recipient name: … Package: …')}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block rounded-full bg-snow px-7 py-3.5 font-semibold text-ink"
            data-cursor="book"
            data-cursor-text="Gift"
          >
            Arrange a gift ↗
          </a>
        </div>
        <div className="[perspective:1400px]">
          <div
            ref={card}
            onClick={() => setFlipped((f) => !f)}
            className="relative mx-auto aspect-[1.6/1] w-full max-w-[520px] cursor-pointer [--hue:200deg] [--px:50%] [--py:50%] [transform-style:preserve-3d]"
            data-cursor="view"
            data-cursor-text="Flip"
          >
            <div className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]" style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}>
              <div className="absolute inset-0 overflow-hidden rounded-[1.6rem] border border-white/20 bg-[linear-gradient(135deg,#0f2547,#3a1f2a)] p-7 [backface-visibility:hidden]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-60 mix-blend-color-dodge"
                  style={{ background: 'conic-gradient(from var(--hue) at var(--px) var(--py), #ff7a2f, #ffc56b, #7bd389, #2f7cf6, #c3a6ff, #ff7a2f)' }}
                />
                <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at var(--px) var(--py), rgba(255,255,255,.45), transparent 40%)' }} />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="font-display text-xl font-extrabold">BIR</span>
                    <span className="hud rounded-full bg-black/30 px-3 py-1">Gift voucher</span>
                  </div>
                  <div>
                    <p className="display text-[clamp(1.8rem,4vw,3rem)]">One flight over Bir</p>
                    <p className="hud mt-2 text-white/80">From {inr(flights[0].price)} · valid all season</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 rounded-[1.6rem] bg-snow p-7 text-ink [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="hud text-dawn">To: [recipient]</p>
                <p className="mt-4 font-serif text-xl italic">“Go on — the view from 2,400 m is on me.”</p>
                <p className="hud mt-6 text-ink/50">Redeem on WhatsApp · {flights.map((f) => f.durationShort).join(' / ')}</p>
                <p className="hud mt-2 text-ink/40">[Placeholder — voucher terms & validity]</p>
              </div>
            </div>
          </div>
          <p className="hud mt-5 text-center text-white/50">Tilt it · tap to flip</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ slot-machine price CTA */
function Slot({ digit, i }: { digit: string; i: number }) {
  if (!/\d/.test(digit)) return <span className="inline-block">{digit}</span>;
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-bottom leading-none">
      <span data-slot data-d={digit} data-i={i} className="flex flex-col">
        {Array.from({ length: 30 }, (_, k) => (
          <span key={k} className="block h-[1em] leading-none">
            {k % 10}
          </span>
        ))}
      </span>
    </span>
  );
}

export function PriceCTA() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    el.querySelectorAll<HTMLElement>('[data-slot]').forEach((s) => {
      const d = Number(s.dataset.d);
      const i = Number(s.dataset.i);
      gsap.fromTo(s, { yPercent: 0 }, { yPercent: -((20 + d) / 30) * 100, duration: 2.2 + i * 0.25, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
    });
  });
  const price = inr(flights[0].price).replace('₹', '');
  return (
    <section ref={root} className="relative overflow-hidden bg-[linear-gradient(135deg,#ff7a2f,#ff4d1a_45%,#3a1f2a)] py-24 text-ink md:py-36" aria-labelledby="price-title">
      <Particles mode="wind" color="#ffffff" intensity={1} />
      <div className="container-x relative flex flex-col items-center text-center">
        <p className="hud text-ink/70">Tandem flights</p>
        <h2 id="price-title" className="display mt-4 text-[clamp(2rem,4vw,3.4rem)]">
          From
        </h2>
        <p className="display flex items-end text-[clamp(4.5rem,17vw,15rem)] leading-none text-snow drop-shadow-[0_20px_40px_rgba(0,0,0,.25)]">
          <span>₹</span>
          {price.split('').map((c, i) => (
            <Slot key={i} digit={c} i={i} />
          ))}
        </p>
        <p className="mt-4 max-w-md text-ink/80">Per person, licensed pilot included. Courses from {inr(courses[0].price)}.</p>
        <div className="mt-10">
          <Magnetic strength={0.5}>
            <TLink href="/booking" data-cursor="book" className="grid h-36 w-36 place-items-center rounded-full bg-ink text-snow md:h-44 md:w-44">
              <span data-magnetic-inner className="font-display text-lg font-bold">
                Book now ↗
              </span>
            </TLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
