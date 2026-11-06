'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useReady } from '@/lib/useReady';
import SplitHeading from '../animations/SplitHeading';
import DistortImage from './DistortImage';

const PLACES = [
  { title: 'The launch', alt: '~2,400 m', text: 'Mornings start on the Billing meadow — wings laid out, prayer flags snapping in the breeze.', image: '/images/billing-launch-flags.webp' },
  { title: 'The sky', alt: '15–50 min', text: 'The part you came for: thermals, ridge lines and the Dhauladhar over your shoulder.', image: '/images/flight-cloud-sea.webp' },
  { title: 'The landing field', alt: '~1,400 m', text: 'Where every flight ends — an easy jog onto the grass and a cup of chai.', image: '/images/landing-field.webp' },
];

/**
 * "Our office has no walls": three places we work, each photo answering the cursor
 * with a WebGL liquid ripple + RGB split. Cards deal in from a fanned stack.
 */
export default function Office() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap.from('[data-office]', {
      y: 160,
      rotate: (i) => [-10, 3, 12][i % 3],
      xPercent: (i) => [30, 0, -30][i % 3],
      autoAlpha: 0,
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: { trigger: el.querySelector('[data-office-grid]'), start: 'top 80%', once: true },
    });
    gsap.from('[data-office-alt]', { scale: 0, rotate: -40, duration: 0.7, ease: 'back.out(2.5)', stagger: 0.08, scrollTrigger: { trigger: el.querySelector('[data-office-grid]'), start: 'top 60%', once: true } });
  });
  return (
    <section ref={root} className="relative py-24 md:py-36" aria-labelledby="office-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">Where we work</p>
            <SplitHeading id="office-title" className="display mt-4 text-[clamp(2.4rem,6vw,5.5rem)]">
              Our office has no walls
            </SplitHeading>
          </div>
          <p className="max-w-sm text-white/65">Launch, sky, landing — the three places our days are spent. Hover a photo and the air ripples.</p>
        </div>
        <div data-office-grid className="mt-14 grid gap-6 md:grid-cols-3">
          {PLACES.map((p) => (
            <article key={p.title} data-office className="relative">
              <DistortImage src={p.image} alt={p.title} className="aspect-[4/5] rounded-[1.75rem]" />
              <span data-office-alt className="hud absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 text-sun backdrop-blur">
                {p.alt}
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold">{p.title}</h3>
              <p className="mt-2 text-white/65">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
