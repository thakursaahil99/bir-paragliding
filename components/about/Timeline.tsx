'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { timeline } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';

/** A vertical contrail grows with scroll; each milestone pops off it like a waypoint being logged. */
export default function Timeline() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.fromTo('[data-tl-line]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-tl-list]', start: 'top 70%', end: 'bottom 60%', scrub: true } });
        gsap.utils.toArray<HTMLElement>('[data-tl-item]').forEach((item, i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 72%', toggleActions: 'play none none reverse' } });
          tl.fromTo(item.querySelector('[data-tl-dot]'), { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' })
            .fromTo(item.querySelector('[data-tl-ring]'), { scale: 0.4, opacity: 1 }, { scale: 2.6, opacity: 0, duration: 0.9, ease: 'power2.out' }, 0)
            .fromTo(
              item.querySelector('[data-tl-card]'),
              { autoAlpha: 0, x: i % 2 ? -60 : 60, rotate: i % 2 ? -4 : 4, scale: 0.9 },
              { autoAlpha: 1, x: 0, rotate: 0, scale: 1, duration: 0.9, ease: 'back.out(1.6)' },
              0.1
            );
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative bg-night py-24 md:py-36" aria-labelledby="tl-title">
      <div className="container-x">
        <p className="hud text-center text-dawn">Milestones</p>
        <SplitHeading id="tl-title" className="display mx-auto mt-4 max-w-3xl text-center text-[clamp(2.4rem,5.5vw,5rem)]">
          How we got here
        </SplitHeading>
        <div data-tl-list className="relative mx-auto mt-20 max-w-4xl">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-white/10 md:left-1/2" />
          <div data-tl-line className="absolute bottom-0 left-4 top-0 w-[2px] origin-top bg-gradient-to-b from-sky via-sun to-dawn md:left-1/2 md:-ml-px" />
          <ol className="space-y-16">
            {timeline.map((t, i) => (
              <li key={t.title} data-tl-item className={`relative pl-14 md:w-1/2 md:pl-0 ${i % 2 ? 'md:ml-auto md:pl-14' : 'md:pr-14 md:text-right'}`}>
                <span className={`absolute left-4 top-3 -ml-[9px] ${i % 2 ? 'md:left-0' : 'md:-right-[9px] md:left-auto md:ml-0'}`}>
                  <span data-tl-ring className="absolute inset-0 rounded-full border-2 border-dawn" />
                  <span data-tl-dot className="relative block h-[18px] w-[18px] rounded-full border-[3px] border-ink bg-dawn" />
                </span>
                <div data-tl-card className={`glass rounded-2xl p-6 ${t.placeholder ? 'border-dashed !border-dawn/40' : ''}`}>
                  <p className="font-mono text-sm text-dawn">{t.year}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold">{t.title}</h3>
                  <p className="mt-2 text-white/65">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
