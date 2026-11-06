'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { safety } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';

const ICONS: Record<string, string[]> = {
  license: ['M6 10h36v26H6z', 'M17 21m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0', 'M9 33c1.5-4 4.5-6 8-6s6.5 2 8 6', 'M28 18h10', 'M28 24h10', 'M28 30h6'],
  wing: ['M4 18C12 6 36 6 44 18', 'M8 20C16 11 32 11 40 20', 'M8 20l16 18 16-18', 'M16 14l8 24 8-24', 'M24 38m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0'],
  reserve: ['M8 24a16 16 0 0 1 32 0', 'M8 24h32', 'M8 24l16 16 16-16', 'M18 24l6 16 6-16', 'M24 6v4'],
  weather: ['M14 30a8 8 0 0 1 1-16 10 10 0 0 1 19 3 6.5 6.5 0 0 1 0 13H14z', 'M8 37h20', 'M14 42h22', 'M32 37h8'],
  brief: ['M8 8h32v24H22l-8 8v-8H8z', 'M15 16h18', 'M15 22h12'],
  rules: ['M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z', 'M16 23l6 6 11-12'],
};

/** Icons ink themselves in (stroke-dash draw), then the fills breathe in. */
export default function Safety() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const paths = el.querySelectorAll<SVGPathElement>('[data-draw]');
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = prefersReduced() ? '0' : `${len}`;
    });
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-safety]').forEach((card, i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%', once: true } });
          tl.to(card.querySelectorAll('[data-draw]'), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.12 }, (i % 3) * 0.15)
            .from(card.querySelector('[data-safety-glow]'), { scale: 0, autoAlpha: 0, duration: 1, ease: 'expo.out' }, '-=0.6')
            .from(card.querySelectorAll('[data-safety-text]'), { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, '-=0.9');
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-[linear-gradient(180deg,#060a12,#0e1a31)] py-24 md:py-36" aria-labelledby="safety-title">
      <div className="container-x">
        <p className="hud text-dawn">Safety first, every flight</p>
        <SplitHeading id="safety-title" className="display mt-4 max-w-4xl text-[clamp(2.4rem,6vw,5.5rem)]">
          Boring on purpose
        </SplitHeading>
        <p className="mt-6 max-w-xl text-white/65">The exciting part should be the view. Everything else — pilots, gear and weather calls — is deliberately, reassuringly dull.</p>
        <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {safety.map((s) => (
            <article key={s.title} data-safety className="relative bg-night p-8 md:p-10">
              <div className="relative h-16 w-16">
                <span data-safety-glow aria-hidden className="absolute inset-0 rounded-full bg-dawn/20 blur-xl" />
                <svg viewBox="0 0 48 48" className="relative h-16 w-16 text-sun" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {ICONS[s.icon].map((d, i) => (
                    <path key={i} data-draw d={d} />
                  ))}
                </svg>
              </div>
              <h3 data-safety-text className="mt-6 font-display text-2xl font-bold">
                {s.title}
              </h3>
              <p data-safety-text className="mt-3 text-white/65">
                {s.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
