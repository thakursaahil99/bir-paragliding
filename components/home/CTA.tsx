'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { waLink } from '@/lib/site';
import { getTier } from '@/lib/perf';
import Magnetic from '@/components/animations/Magnetic';
import { TLink } from '@/components/layout/Transition';

/**
 * Snow-white finale: the flight film plays *inside* the giant letters
 * (screen-blended knockout), and the type settles from oversized as you arrive.
 */
export default function CTA() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = section.current!;
    const v = video.current!;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && getTier() !== 'low' ? v.play().catch(() => {}) : v.pause()), { rootMargin: '200px' });
    io.observe(el);
    if (prefersReduced()) return () => io.disconnect();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-cta-word]',
        { scale: 1.6, yPercent: 30, letterSpacing: '0.04em' },
        { scale: 1, yPercent: 0, letterSpacing: '-0.035em', ease: 'none', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 1 } }
      );
      gsap.fromTo('[data-cta-media]', { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, el);
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-snow text-ink" aria-labelledby="cta-title">
      <div className="relative">
        {/* film */}
        <div data-cta-media className="absolute inset-[-15%_0]">
          <video ref={video} className="h-full w-full object-cover" poster="/media/ridge-loop-poster.jpg" muted loop playsInline preload="none" aria-hidden>
            <source src="/media/ridge-loop.mp4" type="video/mp4" />
          </video>
        </div>
        {/* knockout layer: white stays white, black text becomes a window onto the film */}
        <div className="relative bg-snow py-24 mix-blend-screen md:py-32">
          <h2 id="cta-title" className="display text-center text-[clamp(2.6rem,10vw,11.5rem)] uppercase leading-[0.82] text-black">
            <span data-cta-word className="block will-change-transform">
              Book your
            </span>
            <span data-cta-word className="block will-change-transform">
              flight
            </span>
          </h2>
        </div>
      </div>
      <div className="container-x flex flex-col items-center gap-8 pb-24 text-center md:pb-32">
        <p className="max-w-xl text-lg text-ink/70">
          Pick a flight, choose your date, and we&apos;ll confirm your slot on WhatsApp. Season runs mid-September to June — October, November and March to May fill up first.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Magnetic strength={0.5}>
            <TLink
              href="/booking"
              data-cursor="book"
              className="relative grid h-36 w-36 place-items-center rounded-full bg-ink text-snow shadow-[0_30px_60px_-20px_rgba(6,10,18,.6)] md:h-44 md:w-44"
            >
              <span data-magnetic-inner className="font-display text-lg font-bold">
                Book now ↗
              </span>
            </TLink>
          </Magnetic>
          <a
            href={waLink('Hi Bir Paragliding! I want to book a tandem flight.')}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-ink/20 px-6 py-3 font-medium transition-colors hover:border-ink hover:bg-ink hover:text-snow"
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
