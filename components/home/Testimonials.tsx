'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { scrollState } from '@/lib/store';
import { testimonials } from '@/lib/site';
import SplitHeading from '@/components/animations/SplitHeading';
import Particles from '@/components/fx/Particles';

type T = (typeof testimonials)[number];

function Card({ t }: { t: T }) {
  return (
    <figure className="glass relative w-[78vw] shrink-0 rounded-3xl p-6 sm:w-[420px] md:p-7">
      {t.placeholder && <span className="hud absolute right-5 top-5 rounded-full border border-dawn/60 px-2.5 py-1 text-[0.58rem] text-dawn">Sample</span>}
      <div className="flex gap-1 text-sun" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
          </svg>
        ))}
      </div>
      <blockquote className="mt-4 text-lg leading-relaxed text-white/85">“{t.quote}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky to-dawn font-display font-bold text-ink">{t.name.charAt(0)}</span>
        <span>
          <span className="block font-medium">{t.name}</span>
          <span className="hud text-white/45">{t.meta}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Two marquee rows drifting in opposite directions. Scroll speed feeds the wind:
 * scrolling accelerates them, scrolling up reverses them, hover becalms a row.
 */
export default function Testimonials() {
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (prefersReduced()) return;
    const state = rows.current.map(() => ({ x: 0, speed: 1, hover: false }));
    const cleanups: (() => void)[] = [];
    rows.current.forEach((row, i) => {
      if (!row) return;
      const enter = () => (state[i].hover = true);
      const leave = () => (state[i].hover = false);
      row.addEventListener('pointerenter', enter);
      row.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        row.removeEventListener('pointerenter', enter);
        row.removeEventListener('pointerleave', leave);
      });
    });
    const tick = (_t: number, dt: number) => {
      const boost = Math.min(Math.abs(scrollState.velocity) * 0.6, 14);
      const dir = scrollState.direction;
      rows.current.forEach((row, i) => {
        if (!row) return;
        const s = state[i];
        const target = s.hover ? 0 : (0.6 + boost) * dir;
        s.speed += (target - s.speed) * 0.06;
        const half = row.scrollWidth / 2;
        s.x += s.speed * (i % 2 ? 1 : -1) * (dt / 16.67);
        if (s.x <= -half) s.x += half;
        if (s.x > 0) s.x -= half;
        row.style.transform = `translate3d(${s.x}px,0,0)`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      cleanups.forEach((c) => c());
    };
  }, []);


  const a = testimonials.slice(0, 4);
  const b = testimonials.slice(4);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#060a12,#123064_45%,#3a2f6b_75%,#060a12)] py-24 md:py-36" aria-labelledby="tst-title">
      <Particles mode="wind" color="#cfe0ff" intensity={0.7} />
      <div className="container-x flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="hud text-dawn">Flyer stories</p>
          <SplitHeading id="tst-title" className="display mt-4 text-[clamp(2.6rem,6.5vw,6rem)]">
            Landed, grinning
          </SplitHeading>
        </div>
        <div className="max-w-sm">
          <p className="text-white/65">
            Scroll faster and the reviews catch the wind; scroll back and they turn around. Hover a row to read in still air.
          </p>
          <p className="hud mt-4 inline-block rounded-full border border-dawn/50 px-3 py-1.5 text-dawn">Placeholder · add your Google rating & reviews</p>
        </div>
      </div>

      <div className="mt-14 space-y-6 [perspective:1200px]" data-cursor="drag" data-cursor-text="Hover to pause">
        {[a, b].map((list, i) => (
          <div key={i} className="overflow-hidden [transform-style:preserve-3d]" style={{ transform: `rotateX(${i ? -8 : 8}deg) rotateZ(${i ? 1.2 : -1.2}deg)` }}>
            <div ref={(el) => void (rows.current[i] = el)} className="flex w-max gap-6 pr-6 will-change-transform">
              {[...list, ...list, ...list, ...list].map((t, k) => (
                <Card key={k} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
