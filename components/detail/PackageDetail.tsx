'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { useReady } from '@/lib/useReady';
import { faqs, gallery, inr, packages, type Pkg } from '@/lib/site';
import { flyability } from '@/lib/extra';
import SplitHeading from '../animations/SplitHeading';
import Img from '../animations/Img';
import Magnetic from '../animations/Magnetic';
import Particles from '../fx/Particles';
import { TLink } from '../layout/Transition';

/* ------------------------------------------------------------------ 1. lens-reveal hero */
export function DetailHero({ p }: { p: Pkg }) {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap
      .timeline()
      .fromTo('[data-lens]', { clipPath: 'circle(12% at 50% 55%)' }, { clipPath: 'circle(120% at 50% 55%)', duration: 1.8, ease: 'expo.inOut' })
      .fromTo('[data-lens-img]', { scale: 1.6 }, { scale: 1.05, duration: 2.4, ease: 'expo.out' }, 0)
      .from('[data-dh-fade]', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9 }, 0.9)
      .from('[data-price-badge]', { scale: 0, rotate: -30, duration: 0.9, ease: 'back.out(2.2)' }, 1.1);
    gsap.to('[data-lens-img]', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
  });
  return (
    <header ref={root} className="relative flex min-h-[100svh] items-end overflow-hidden pb-14 pt-36">
      <div data-lens className="absolute inset-0">
        <div data-lens-img className="absolute inset-0">
          <Img src={p.image} alt={p.name} priority sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
      </div>
      <div className="container-x relative z-10 grid items-end gap-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <nav data-dh-fade aria-label="Breadcrumb" className="hud mb-6 flex flex-wrap items-center gap-2 text-white/60">
            <TLink href="/" className="hover:text-white">
              Home
            </TLink>
            <span aria-hidden>/</span>
            <TLink href="/packages" className="hover:text-white">
              Flights & courses
            </TLink>
            <span aria-hidden>/</span>
            <span className="text-white" aria-current="page">
              {p.name}
            </span>
          </nav>
          <p data-dh-fade className="hud text-dawn">
            {p.tag} · {p.duration}
          </p>
          <SplitHeading as="h1" immediate delay={0.5} className="display mt-4 text-[clamp(2.6rem,7.4vw,7.6rem)]">
            {p.name}
          </SplitHeading>
          <p data-dh-fade className="mt-6 max-w-xl text-lg text-white/80">
            {p.tagline}
          </p>
        </div>
        <div className="md:col-span-4 md:justify-self-end">
          <div data-price-badge className="grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-dawn to-ember text-center text-ink shadow-[0_30px_60px_-20px_rgba(255,122,47,.8)]">
            <div>
              <p className="hud text-ink/70">{p.unit}</p>
              <p className="font-display text-3xl font-bold">{inr(p.price)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ 2. count-up facts with blur */
export function QuickFacts({ p }: { p: Pkg }) {
  const root = useRef<HTMLElement>(null);
  const facts: { n?: number; text?: string; prefix?: string; suffix?: string; label: string }[] = [
    { n: parseInt(p.durationShort, 10), suffix: p.kind === 'flight' ? ' min' : ' days', label: p.kind === 'flight' ? 'In the air' : 'Course length' },
    { n: p.price, prefix: '₹', label: p.unit },
    p.kind === 'flight' ? { n: 0, suffix: ' hrs', label: 'Training needed' } : { text: p.slug.startsWith('p1') ? 'None' : p.slug.startsWith('p3') ? 'P2' : 'P3+', label: 'Level required' },
    { n: 2400, suffix: ' m', label: 'Launch altitude' },
  ];
  useReady(root, (el) => {
    el.querySelectorAll<HTMLElement>('[data-count]').forEach((c, i) => {
      const to = Number(c.dataset.count);
      const o = { v: 0 };
      gsap.fromTo(c, { filter: 'blur(14px)', opacity: 0.2 }, { filter: 'blur(0px)', opacity: 1, duration: 1.6, delay: i * 0.12, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
      gsap.to(o, {
        v: to,
        duration: 1.8,
        delay: i * 0.12,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        onUpdate: () => (c.textContent = Math.round(o.v).toLocaleString('en-IN')),
      });
    });
  });
  return (
    <section ref={root} className="relative border-y border-white/10 bg-night py-14" aria-label="Quick facts">
      <div className="container-x grid grid-cols-2 gap-8 md:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label}>
            <p className="font-mono text-[clamp(2rem,4.5vw,3.6rem)] leading-none tabular-nums">
              {f.prefix}
              {f.text ?? <span data-count={f.n}>{(f.n ?? 0).toLocaleString('en-IN')}</span>}
              <span className="text-dawn">{f.suffix}</span>
            </p>
            <p className="hud mt-3 text-white/50">{f.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3. overview with highlighter sweep */
export function Overview({ p }: { p: Pkg }) {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap.utils.toArray<HTMLElement>('[data-mark]').forEach((m) => {
      gsap.fromTo(m, { backgroundSize: '0% 42%' }, { backgroundSize: '100% 42%', ease: 'none', scrollTrigger: { trigger: m, start: 'top 80%', end: 'top 45%', scrub: true } });
    });
  });
  const sentences = p.description.split(/(?<=[.—])\s+/);
  return (
    <section ref={root} className="relative py-24 md:py-32" aria-labelledby="ov-title">
      <div className="container-x grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="hud text-dawn">Overview</p>
          <SplitHeading id="ov-title" className="display mt-4 text-[clamp(2rem,3.6vw,3.4rem)]">
            What it’s like
          </SplitHeading>
        </div>
        <p className="font-display text-[clamp(1.5rem,2.8vw,2.6rem)] font-semibold leading-[1.25] md:col-span-8">
          {sentences.map((s, i) => (
            <span key={i}>
              <span data-mark className="bg-[linear-gradient(transparent_60%,rgba(255,122,47,.45)_60%)] bg-no-repeat [background-position:0_88%]">
                {s}
              </span>{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 4. inclusions with drawn ticks */
export function Inclusions({ p }: { p: Pkg }) {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
    el.querySelectorAll<HTMLElement>('[data-inc]').forEach((row, i) => {
      const path = row.querySelector<SVGPathElement>('path')!;
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      tl.from(row, { x: 80, autoAlpha: 0, duration: 0.6, ease: 'expo.out' }, i * 0.14).to(path, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, i * 0.14 + 0.25);
    });
  });
  return (
    <section ref={root} className="relative bg-[radial-gradient(60%_80%_at_80%_50%,#14284d,#060a12)] py-24 md:py-32" aria-labelledby="inc-title">
      <div className="container-x grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="hud text-dawn">Included</p>
          <SplitHeading id="inc-title" className="display mt-4 text-[clamp(2rem,4vw,3.8rem)]">
            Everything in the price
          </SplitHeading>
          <p className="mt-5 max-w-sm text-white/60">No add-ons hiding at checkout — this is the whole package.</p>
        </div>
        <ul className="space-y-3 md:col-span-7">
          {p.inclusions.map((inc) => (
            <li key={inc} data-inc className="glass flex items-center gap-4 rounded-2xl px-5 py-4 text-lg">
              <svg viewBox="0 0 28 28" className="h-7 w-7 shrink-0" aria-hidden>
                <circle cx="14" cy="14" r="13" fill="rgba(123,211,137,.15)" stroke="rgba(123,211,137,.5)" />
                <path d="M8 14.5l4 4 8-9" fill="none" stroke="#7bd389" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {inc}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 5. pinned horizontal day / syllabus */
const DAY = [
  { t: 'Pickup', d: 'Meet at the agreed point in Bir — we drive you up the hill.' },
  { t: 'Briefing', d: 'Two minutes on the run, the seat and the landing.' },
  { t: 'Launch', d: 'A few strong steps on the Billing meadow and you’re airborne.' },
  { t: 'Flight', d: 'Thermals, ridge, valley — your pilot flies, you look around.' },
  { t: 'Landing', d: 'A gentle jog onto the Bir landing field. Chai time.' },
];
export function DayTimeline({ p }: { p: Pkg }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [act, setAct] = useState(0);
  const steps = p.syllabus ? p.syllabus.map((s) => ({ t: s.title, d: s.text })) : DAY;
  useEffect(() => {
    const el = root.current!;
    const tr = track.current!;
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const dist = () => Math.max(0, tr.scrollWidth - tr.parentElement!.clientWidth);
        gsap.to(tr, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + Math.max(window.innerHeight, dist() * 1.2), pin: true, scrub: 0.6, invalidateOnRefresh: true, onUpdate: (s) => setAct(Math.min(steps.length - 1, Math.floor(s.progress * steps.length))) },
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, [steps.length]);
  return (
    <section ref={root} className="relative flex h-[100svh] flex-col justify-center overflow-hidden" aria-labelledby="day-title">
      <Particles mode="dust" color="#ffd9a0" intensity={0.5} />
      <div className="container-x relative">
        <p className="hud text-dawn">{p.kind === 'flight' ? 'Your day, step by step' : 'Syllabus'}</p>
        <SplitHeading id="day-title" className="display mt-3 text-[clamp(2rem,4.4vw,4rem)]">
          {p.kind === 'flight' ? 'From pickup to touchdown' : 'What you’ll learn'}
        </SplitHeading>
        <div className="relative mt-6 h-1 rounded-full bg-white/10">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky to-dawn transition-[width] duration-500" style={{ width: `${((act + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      <div className="relative mt-10 overflow-hidden">
        <div ref={track} className="flex w-max gap-6 px-[var(--gutter)]">
          {steps.map((s, i) => (
            <article
              key={s.t}
              className={`flex h-[44vh] min-h-[300px] w-[78vw] shrink-0 flex-col justify-between rounded-[2rem] border p-7 transition-all duration-500 sm:w-[46vw] lg:w-[30vw] ${i === act ? 'scale-100 border-dawn/60 bg-dawn/10' : 'scale-95 border-white/10 bg-white/[0.03] opacity-60'}`}
            >
              <span className="display text-[clamp(3rem,7vw,6rem)] leading-none text-white/90">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-display text-2xl font-bold">{s.t}</h3>
                <p className="mt-2 text-white/70">{s.d}</p>
              </div>
            </article>
          ))}
          <div className="w-[10vw] shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 6. draggable photo strip */
export function PhotoStrip({ p }: { p: Pkg }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(0);
  const pool = gallery.filter((g) => (p.kind === 'flight' ? g.cat === 'Flights' : g.cat === 'Launch & courses')).slice(0, 9);
  useEffect(() => {
    const el = wrap.current!;
    const calc = () => setLimit(Math.max(0, (el.firstElementChild as HTMLElement).scrollWidth - el.clientWidth));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="strip-d-title">
      <div className="container-x">
        <p className="hud text-dawn">Drag through it</p>
        <SplitHeading id="strip-d-title" className="display mt-4 text-[clamp(2rem,4.4vw,4rem)]">
          What it looks like
        </SplitHeading>
      </div>
      <div ref={wrap} className="mt-10 overflow-hidden pl-[var(--gutter)]" data-cursor="drag" data-cursor-text="Drag">
        <motion.div drag="x" dragConstraints={{ left: -limit, right: 0 }} dragElastic={0.08} className="flex w-max cursor-grab gap-4 active:cursor-grabbing">
          {pool.map((g, i) => (
            <motion.div key={g.src} whileHover={{ y: -10 }} className={`relative shrink-0 overflow-hidden rounded-2xl ${i % 3 === 1 ? 'h-[52vh] w-[34vh]' : 'h-[44vh] w-[56vh]'} max-w-[80vw]`}>
              <Img src={g.src} alt={g.alt} sizes="50vw" draggable={false} className="pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 7. radial season ring */
export function SeasonRing() {
  const root = useRef<HTMLElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  useReady(root, (el) => {
    gsap.from('[data-seg]', { scale: 0, svgOrigin: '50 50', opacity: 0, duration: 0.8, ease: 'back.out(1.8)', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
  });
  const seg = (i: number, v: number) => {
    const a0 = (i / 12) * Math.PI * 2 + 0.03;
    const a1 = ((i + 1) / 12) * Math.PI * 2 - 0.03;
    const r0 = 38;
    const r1 = 38 + 10 + v * 34;
    const P = (r: number, a: number) => `${+(50 + r * Math.sin(a) * 0.5).toFixed(3)} ${+(50 - r * Math.cos(a) * 0.5).toFixed(3)}`;
    return `M ${P(r0, a0)} L ${P(r1, a0)} A ${r1 / 2} ${r1 / 2} 0 0 1 ${P(r1, a1)} L ${P(r0, a1)} A ${r0 / 2} ${r0 / 2} 0 0 0 ${P(r0, a0)} Z`;
  };
  const cur = hover ?? 9;
  const f = flyability[cur];
  return (
    <section ref={root} className="relative bg-night py-24 md:py-32" aria-labelledby="ring-s-title">
      <div className="container-x grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="hud text-dawn">When to book it</p>
          <SplitHeading id="ring-s-title" className="display mt-4 text-[clamp(2rem,4.4vw,4rem)]">
            The year in one ring
          </SplitHeading>
          <p className="mt-5 max-w-md text-white/65">Longer bars mean more dependable flying (indicative). The monsoon gap — July to mid-September — is closed.</p>
          <p className="mt-8 font-display text-4xl font-bold">{f.m}</p>
          <p className="hud mt-2 text-white/60">{f.v === 0 ? 'Closed for monsoon' : f.v > 0.85 ? 'Excellent' : f.v > 0.6 ? 'Good' : 'Patchy'}</p>
        </div>
        <svg viewBox="0 0 100 100" className="mx-auto w-full max-w-[460px]" role="img" aria-label="Radial chart of indicative flying conditions by month">
          {flyability.map((m, i) => (
            <g key={m.m} data-seg>
              <path
                d={seg(i, m.v)}
                fill={m.v === 0 ? 'rgba(255,90,31,.25)' : m.v > 0.85 ? '#ff7a2f' : '#2f7cf6'}
                opacity={hover === null || hover === i ? 1 : 0.35}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                style={{ transition: 'opacity .3s', cursor: 'pointer' }}
              />
            </g>
          ))}
          {flyability.map((m, i) => {
            const a = ((i + 0.5) / 12) * Math.PI * 2;
            return (
              <text key={m.m} x={+(50 + 15 * Math.sin(a)).toFixed(3)} y={+(51.5 - 15 * Math.cos(a)).toFixed(3)} textAnchor="middle" fontSize="3.4" fill="rgba(255,255,255,.7)" className="font-mono">
                {m.m}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 8. flip-card FAQs */
export function FlipFaqs({ p }: { p: Pkg }) {
  const list = faqs.filter((f) => (p.kind === 'flight' ? f.cat === 'Tandem flights' : f.cat === 'Courses')).slice(0, 4);
  const [flip, setFlip] = useState<number | null>(null);
  return (
    <section className="relative py-24 md:py-32" aria-labelledby="ff-title">
      <div className="container-x">
        <p className="hud text-dawn">Good to know</p>
        <SplitHeading id="ff-title" className="display mt-4 text-[clamp(2rem,4.4vw,4rem)]">
          Tap to flip the answers
        </SplitHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {list.map((f, i) => (
            <button key={f.q} type="button" onClick={() => setFlip(flip === i ? null : i)} className="relative h-56 text-left [perspective:1200px]" aria-expanded={flip === i}>
              <div className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]" style={{ transform: `rotateX(${flip === i ? 180 : 0}deg)` }}>
                <div className="glass absolute inset-0 flex flex-col justify-between rounded-2xl p-6 [backface-visibility:hidden]">
                  <span className="hud text-dawn">Q · 0{i + 1}</span>
                  <span className="font-display text-xl font-bold">{f.q}</span>
                </div>
                <div className="absolute inset-0 overflow-auto rounded-2xl bg-dawn p-6 text-ink [backface-visibility:hidden] [transform:rotateX(180deg)]" data-lenis-prevent>
                  <span className="text-sm leading-relaxed">{f.a}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 9. fanned deck of other packages */
export function OtherDeck({ p }: { p: Pkg }) {
  const others = packages.filter((x) => x.slug !== p.slug && x.kind === p.kind).concat(packages.filter((x) => x.kind !== p.kind).slice(0, 1));
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(60%_60%_at_50%_100%,#3a1f2a,#060a12_70%)] py-24 md:py-32" aria-labelledby="deck-title">
      <div className="container-x text-center">
        <p className="hud text-dawn">Compare</p>
        <SplitHeading id="deck-title" className="display mx-auto mt-4 text-[clamp(2rem,4.4vw,4rem)]">
          Or pick another card
        </SplitHeading>
      </div>
      <div className="group relative mx-auto mt-14 flex h-[440px] max-w-4xl items-end justify-center">
        {others.map((o, i) => {
          const mid = (others.length - 1) / 2;
          const off = i - mid;
          return (
            <TLink
              key={o.slug}
              href={`/packages/${o.slug}`}
              className="absolute bottom-0 h-[380px] w-[240px] origin-bottom overflow-hidden rounded-[1.6rem] border border-white/15 shadow-2xl transition-transform duration-700 ease-[var(--ease-glide)] hover:!z-20 sm:w-[260px]"
              style={{ transform: `translateX(${off * 40}px) rotate(${off * 6}deg)`, zIndex: 10 - Math.abs(off) }}
              data-deck
              data-off={off}
            >
              <Img src={o.image} alt={o.name} sizes="260px" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-left">
                <p className="hud text-dawn">{o.tag}</p>
                <p className="font-display text-xl font-bold leading-tight">{o.name}</p>
                <p className="mt-1 text-white/70">{inr(o.price)}</p>
              </div>
            </TLink>
          );
        })}
        <style>{`.group:hover [data-deck]{transform:translateX(calc(var(--o)*1px)) rotate(0deg)!important}`}</style>
      </div>
      <DeckSpread count={others.length} />
    </section>
  );
}
/** Spreads the deck on hover (sets per-card offsets as CSS variables). */
function DeckSpread({ count }: { count: number }) {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-deck]').forEach((c) => {
      const off = Number(c.dataset.off);
      c.style.setProperty('--o', String(off * (window.innerWidth < 640 ? 70 : 280)));
    });
  }, [count]);
  return null;
}

/* ------------------------------------------------------------------ 10. sticky booking bar + final CTA */
export function BookingBar({ p }: { p: Pkg }) {
  const [show, setShow] = useState(false);
  const [n, setN] = useState(1);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.8 && window.scrollY < document.documentElement.scrollHeight - window.innerHeight * 2.2);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <motion.div
      initial={false}
      animate={{ y: show ? 0 : 140, opacity: show ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className="fixed inset-x-3 bottom-3 z-[58] mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full border border-white/15 bg-ink/85 p-2 pl-5 shadow-2xl backdrop-blur-xl md:bottom-6"
    >
      <span className="min-w-0">
        <span className="block truncate font-display text-sm font-bold md:text-base">{p.name}</span>
        <span className="hud text-white/60">
          {inr(p.price * n)} · {n} {p.kind === 'course' ? 'student' : 'person'}
          {n > 1 ? 's' : ''}
        </span>
      </span>
      <span className="flex items-center gap-2">
        <button type="button" onClick={() => setN((x) => Math.max(1, x - 1))} className="hidden h-9 w-9 rounded-full border border-white/20 sm:block" aria-label="Fewer people">
          −
        </button>
        <button type="button" onClick={() => setN((x) => Math.min(12, x + 1))} className="hidden h-9 w-9 rounded-full border border-white/20 sm:block" aria-label="More people">
          +
        </button>
        <TLink href={`/booking?package=${p.slug}&persons=${n}`} className="rounded-full bg-gradient-to-r from-dawn to-ember px-5 py-2.5 text-sm font-semibold text-ink" data-cursor="book">
          Book now
        </TLink>
      </span>
    </motion.div>
  );
}

export function DetailCTA({ p }: { p: Pkg }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f4bb8,#2f7cf6_45%,#ff9a4d)] py-24 text-center md:py-36" aria-labelledby="dcta-title">
      <Particles mode="wind" color="#ffffff" intensity={1} />
      <div className="container-x relative">
        <p className="hud text-white/80">{p.duration} · {inr(p.price)} {p.unit}</p>
        <SplitHeading id="dcta-title" className="display mx-auto mt-4 max-w-4xl text-[clamp(2.4rem,6vw,5.6rem)]">
          {p.kind === 'flight' ? 'Your seat on this wing is open' : 'Your first solo starts here'}
        </SplitHeading>
        <div className="mt-10 flex justify-center">
          <Magnetic strength={0.5}>
            <TLink href={`/booking?package=${p.slug}`} data-cursor="book" className="grid h-40 w-40 place-items-center rounded-full bg-ink text-snow md:h-48 md:w-48">
              <span data-magnetic-inner className="font-display text-lg font-bold">
                Book it ↗
              </span>
            </TLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
