'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { useReady } from '@/lib/useReady';
import { scrollState } from '@/lib/store';
import { cafes, tips } from '@/lib/extra';
import Img from '../animations/Img';
import SplitHeading from '../animations/SplitHeading';
import Particles from '../fx/Particles';
import Magnetic from '../animations/Magnetic';
import { TLink } from '../layout/Transition';

/* ------------------------------------------------------------------ polaroid table */
export function PolaroidTable() {
  const root = useRef<HTMLElement>(null);
  const table = useRef<HTMLDivElement>(null);

  useReady(root, (el) => {
    gsap.from('[data-polaroid]', {
      y: -600,
      rotate: (i) => [-40, 30, -25, 45, -15][i % 5],
      opacity: 0,
      duration: 1.3,
      ease: 'bounce.out',
      stagger: 0.16,
      scrollTrigger: { trigger: el, start: 'top 55%', once: true },
    });
  });

  useEffect(() => {
    const t = table.current!;
    const move = (e: PointerEvent) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--lx', `${((e.clientX - r.left) / r.width) * 100}%`);
      t.style.setProperty('--ly', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    t.addEventListener('pointermove', move);
    return () => t.removeEventListener('pointermove', move);
  }, []);

  const spots = [
    { l: '6%', t: '14%', r: -8 },
    { l: '30%', t: '6%', r: 5 },
    { l: '54%', t: '18%', r: -4 },
    { l: '16%', t: '50%', r: 7 },
    { l: '62%', t: '52%', r: -9 },
  ];

  return (
    <section ref={root} className="relative py-24 md:py-32" aria-labelledby="cafe-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">Cafés, gompas & tea</p>
            <SplitHeading id="cafe-title" className="display mt-4 text-[clamp(2.2rem,5.5vw,5rem)]">
              Slow days on the ground
            </SplitHeading>
          </div>
          <p className="max-w-sm text-white/60">Pick up a print and move it around the table — the lamp follows your hand.</p>
        </div>
        <div
          ref={table}
          className="relative mt-12 h-[90svh] max-h-[760px] min-h-[560px] overflow-hidden rounded-[2rem] border border-white/10 [--lx:50%] [--ly:40%]"
          style={{
            background:
              'radial-gradient(38% 46% at var(--lx) var(--ly), rgba(255,214,150,.30), transparent 70%), repeating-linear-gradient(92deg, #2b1a12 0 26px, #24150f 26px 52px)',
          }}
        >
          <Particles mode="dust" color="#ffd9a0" intensity={0.8} />
          {cafes.map((c, i) => (
            <motion.figure
              key={c.title}
              data-polaroid
              drag
              dragMomentum
              dragElastic={0.2}
              whileDrag={{ scale: 1.06, rotate: 0, zIndex: 50 }}
              whileHover={{ scale: 1.03 }}
              className="absolute w-[44%] max-w-[260px] cursor-grab touch-none bg-[#f6f1e7] p-3 pb-12 text-ink shadow-[0_30px_50px_-20px_rgba(0,0,0,.8)] active:cursor-grabbing sm:w-[30%]"
              style={{ left: spots[i].l, top: spots[i].t, rotate: spots[i].r }}
              data-cursor="drag"
              data-cursor-text="Move"
            >
              <div className="pointer-events-none relative aspect-square overflow-hidden">
                <Img src={c.image} alt={c.title} sizes="260px" draggable={false} />
              </div>
              <figcaption className="pointer-events-none absolute inset-x-3 bottom-2">
                <span className="block font-display text-sm font-bold">{c.title}</span>
                <span className="block text-xs text-ink/60">{c.note}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ prayer-flag tips */
const FLAG_COLORS = ['#2f6fd6', '#f4f7fb', '#d6453a', '#3f9a5a', '#f1c04f', '#2f6fd6'];

export function PrayerFlags() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [gust, setGust] = useState(0.4);

  useEffect(() => {
    const el = root.current!;
    const flags = [...el.querySelectorAll<HTMLElement>('[data-flag]')];
    if (prefersReduced()) return;
    let t = 0;
    let wind = 0.4;
    let lastG = 0;
    const tick = () => {
      t += 0.016;
      wind += (Math.min(3, 0.4 + Math.abs(scrollState.velocity) * 0.18) - wind) * 0.05;
      flags.forEach((f, i) => {
        const a = Math.sin(t * (2 + wind) + i * 0.8) * (6 + wind * 10) + wind * 6;
        f.style.transform = `rotate(${a}deg) skewY(${Math.sin(t * 3 + i) * wind * 3}deg)`;
      });
      if (Math.abs(wind - lastG) > 0.15) {
        lastG = wind;
        setGust(wind);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-[linear-gradient(180deg,#0e2a4f,#3d6fae_60%,#9cc3ea)] py-24 md:py-32" aria-labelledby="flags-title">
      <Particles mode="wind" color="#ffffff" intensity={gust} />
      <div className="container-x relative">
        <p className="hud text-white/80">Good to know</p>
        <SplitHeading id="flags-title" className="display mt-4 max-w-3xl text-[clamp(2.2rem,5.5vw,5rem)]">
          Six tips on the wind
        </SplitHeading>
        <p className="mt-4 max-w-md text-white/80">Scroll faster and the wind picks up. Tap a flag to read it.</p>
        <p className="hud mt-3 text-white/70">Wind · {(gust * 9).toFixed(0)} km/h</p>
      </div>
      <div className="relative mt-16">
        <svg aria-hidden viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-10 w-full">
          <path d="M0 6 Q 720 70 1440 6" fill="none" stroke="#e9dfc8" strokeWidth="3" />
        </svg>
        <div className="container-x relative grid grid-cols-2 gap-x-4 gap-y-10 pt-6 sm:grid-cols-3 lg:grid-cols-6">
          {tips.map((tip, i) => {
            const on = open === i;
            return (
              <button
                key={tip.title}
                type="button"
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className="group relative text-left"
                style={{ marginTop: `${+(Math.sin((i / (tips.length - 1)) * Math.PI) * 26).toFixed(2)}px` }}
              >
                <div
                  data-flag
                  className="origin-top rounded-b-md p-4 pt-5 shadow-[0_20px_30px_-15px_rgba(0,0,0,.45)] transition-[height] duration-500"
                  style={{ background: FLAG_COLORS[i], color: i === 1 || i === 4 ? '#0a1220' : '#fff', minHeight: on ? 190 : 120 }}
                >
                  <span className="block font-mono text-xs opacity-70">0{i + 1}</span>
                  <span className="mt-1 block font-display text-lg font-bold leading-tight">{tip.title}</span>
                  <span className={`mt-2 block text-sm leading-snug transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{tip.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ postcard CTA */
export function PostcardCTA() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', end: 'center 40%', scrub: 1 } });
    tl.fromTo('[data-card]', { rotateY: 0, rotateZ: -6, y: 80 }, { rotateY: 180, rotateZ: 2, y: 0, ease: 'power2.inOut' });
    gsap.fromTo(
      '[data-stamp]',
      { scale: 3, rotate: -30, opacity: 0 },
      { scale: 1, rotate: -8, opacity: 1, duration: 0.5, ease: 'back.out(2)', scrollTrigger: { trigger: el, start: 'center 45%', toggleActions: 'play none none reverse' } }
    );
  });
  return (
    <section ref={root} className="relative overflow-hidden bg-[radial-gradient(70%_60%_at_50%_50%,#2b3f6e,#060a12_75%)] py-24 md:py-36" aria-labelledby="post-title">
      <Particles mode="sparks" color="#ffc56b" intensity={0.5} />
      <div className="container-x relative grid items-center gap-14 md:grid-cols-2">
        <div>
          <p className="hud text-dawn">Wish you were here</p>
          <SplitHeading id="post-title" className="display mt-4 text-[clamp(2.4rem,5.5vw,5.4rem)]">
            Write your own postcard from Bir
          </SplitHeading>
          <p className="mt-6 max-w-md text-white/70">A flight in the morning, momos at noon, monastery bells at dusk. Book the flight — we’ll help with the rest.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <TLink href="/booking" data-cursor="book" className="inline-block rounded-full bg-gradient-to-r from-dawn to-ember px-7 py-3.5 font-semibold text-ink">
                <span data-magnetic-inner className="block">
                  Book your flight
                </span>
              </TLink>
            </Magnetic>
            <TLink href="/packages" className="rounded-full border border-white/25 px-7 py-3.5">
              See packages
            </TLink>
          </div>
        </div>
        <div className="[perspective:1600px]">
          <div data-card className="relative mx-auto aspect-[3/2] w-full max-w-[560px] [transform-style:preserve-3d]">
            <div className="absolute inset-0 overflow-hidden rounded-xl border-[10px] border-[#f6f1e7] shadow-2xl [backface-visibility:hidden]">
              <Img src="/images/flight-cloud-sea.webp" alt="Greetings from Bir — paragliders above the clouds" sizes="560px" />
              <p className="display absolute bottom-3 left-4 text-[clamp(1.6rem,4vw,3rem)] text-white drop-shadow-lg">Greetings from Bir</p>
            </div>
            <div className="absolute inset-0 grid grid-cols-[1.3fr_1fr] gap-4 rounded-xl bg-[#f6f1e7] p-6 text-ink shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="border-r border-ink/15 pr-4">
                <p className="font-serif text-lg italic leading-relaxed text-ink/80">Flew off the Billing ridge this morning — snow peaks behind, the whole valley below. Doing it again tomorrow.</p>
                <p className="mt-3 font-serif italic text-ink/60">— you, after your flight</p>
              </div>
              <div className="relative flex flex-col justify-end gap-3">
                <div data-stamp className="absolute right-0 top-0 grid h-20 w-16 place-items-center border-2 border-dashed border-dawn bg-white p-1">
                  <div className="relative h-full w-full overflow-hidden">
                    <Img src="/images/chokling-monastery.webp" alt="" sizes="64px" />
                  </div>
                </div>
                {[0, 1, 2].map((k) => (
                  <span key={k} className="block h-px bg-ink/25" />
                ))}
                <span className="hud text-ink/50">Bir · Himachal Pradesh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
