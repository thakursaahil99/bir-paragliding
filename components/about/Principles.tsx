'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { principles } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';

const TINTS = ['#13254a', '#1b2f5c', '#2a2f63', '#3a2c55'];

/** Sticky stacked cards: each new principle slides over the last, which sinks back and dims. */
export default function Principles() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const el = root.current!;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-pr-card]');
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          gsap.to(card, {
            scale: 0.9 - (cards.length - i) * 0.01,
            filter: 'brightness(0.55)',
            rotateX: 8,
            ease: 'none',
            scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true },
          });
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative py-24 md:py-36" aria-labelledby="pr-title">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <p className="hud text-dawn">How we work</p>
            <SplitHeading id="pr-title" className="display mt-4 text-[clamp(2.2rem,3.2vw,3.4rem)]">
              Four promises
            </SplitHeading>
            <p className="mt-6 max-w-sm text-white/65">Small rules that make a big difference to how your day on the hill feels.</p>
          </div>
        </div>
        <div className="space-y-6 [perspective:1200px] md:col-span-7 md:col-start-6">
          {principles.map((p, i) => (
            <article
              key={p.title}
              data-pr-card
              className="sticky top-28 flex min-h-[46vh] origin-top flex-col justify-between rounded-[2rem] border border-white/10 p-8 shadow-[0_-20px_60px_-20px_rgba(0,0,0,.6)] md:p-12"
              style={{ background: `linear-gradient(150deg, ${TINTS[i]} 0%, #0a1220 100%)`, top: `${7 + i * 1.2}rem` }}
            >
              <span className="font-mono text-sm text-dawn">0{i + 1} / 0{principles.length}</span>
              <div>
                <h3 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-bold leading-none">{p.title}</h3>
                <p className="mt-5 max-w-lg text-lg text-white/70">{p.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
