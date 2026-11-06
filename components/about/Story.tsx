'use client';

import { useEffect, useRef } from 'react';
import { gsap, SplitText, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import SplitHeading from '../animations/SplitHeading';
import RevealImage from '../animations/RevealImage';

const STORY =
  'We are a small Bir-based team of pilots, instructors and trip planners. We spend the whole season on the Billing ridge, and we built Bir Paragliding so your trip is as simple as the flight itself: one clear price, one conversation, and a pilot we would trust with our own families.';

/** Manifesto paragraph whose words light up one by one, scrubbed to scroll — like reading at the pace you fly. */
export default function Story() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const p = el.querySelector<HTMLElement>('[data-story]')!;
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const split = SplitText.create(p, { type: 'words' });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: p, start: 'top 75%', end: 'bottom 45%', scrub: true } }
        );
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative py-24 md:py-36" aria-labelledby="story-title">
      <div className="container-x grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="hud text-dawn">Who we are</p>
          <SplitHeading id="story-title" className="display mt-4 text-[clamp(2.2rem,4.5vw,4rem)]">
            Locals who fly for a living
          </SplitHeading>
          <RevealImage src="/images/monks-billing.webp" alt="Tibetan monks with a red umbrella at the Billing launch" className="mt-10 aspect-[4/5] rounded-[1.5rem]" sizes="(min-width: 768px) 30vw, 90vw" />
        </div>
        <div className="md:col-span-7 md:col-start-6 md:pt-16">
          <p data-story className="font-display text-[clamp(1.6rem,3.2vw,2.9rem)] font-semibold leading-[1.18] tracking-tight">
            {STORY}
          </p>
          <p className="mt-10 max-w-xl text-white/60">
            <span className="hud mr-2 rounded-full border border-dawn/50 px-2 py-1 text-dawn">Placeholder</span>
            Add your own founding story here — who started Bir Paragliding, when, and the moment you knew this valley was home.
          </p>
        </div>
      </div>
    </section>
  );
}
