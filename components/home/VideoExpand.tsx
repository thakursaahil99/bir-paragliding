'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';

/**
 * A small rounded "window" that opens into a full-bleed film as you scroll —
 * done with clip-path (inset + round) so nothing re-lays out per frame.
 */
export default function VideoExpand() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = section.current!;
    const v = video.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto';
          v.play().catch(() => {});
        } else v.pause();
      },
      { rootMargin: '200px' }
    );
    io.observe(el);

    if (prefersReduced()) {
      el.querySelector<HTMLElement>('[data-v-frame]')!.style.clipPath = 'none';
      return () => io.disconnect();
    }
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
        tl.fromTo('[data-v-frame]', { clipPath: 'inset(26% 30% 26% 30% round 36px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 0.7 })
          .fromTo('[data-v-media]', { scale: 1.35 }, { scale: 1, ease: 'power2.inOut', duration: 0.7 }, 0)
          .fromTo('[data-v-left]', { xPercent: 0 }, { xPercent: -120, ease: 'power2.in', duration: 0.6 }, 0)
          .fromTo('[data-v-right]', { xPercent: 0 }, { xPercent: 120, ease: 'power2.in', duration: 0.6 }, 0)
          .fromTo('[data-v-caption]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.7)
          .to({}, { duration: 0.3 });
      }, el);
    });
    return () => {
      io.disconnect();
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={section} className="relative h-[280vh] bg-ink" aria-label="Tandem paragliding — video">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-v-frame className="absolute inset-0 will-change-[clip-path]" style={{ clipPath: 'inset(26% 30% 26% 30% round 36px)' }}>
          <div data-v-media className="absolute inset-0">
            <video ref={video} className="h-full w-full object-cover" poster="/media/flight-loop-poster.jpg" muted loop playsInline preload="none" aria-label="Tandem paragliding flight footage">
              <source src="/media/flight-loop.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-[var(--gutter)] py-[12svh]">
          <p data-v-left className="display self-start text-[clamp(2.4rem,7vw,7.5rem)]">
            See it
          </p>
          <p data-v-right className="display self-end text-right text-[clamp(2.4rem,7vw,7.5rem)] text-sky-gradient">
            in action
          </p>
        </div>

        <div data-v-caption className="container-x absolute inset-x-0 bottom-10 flex flex-col justify-between gap-4 opacity-0 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">Free flight, in motion</p>
            <p className="display mt-2 text-[clamp(2rem,4.5vw,4rem)]">This is what 25 minutes feels like</p>
          </div>
          <p className="hud max-w-xs text-white/50">HD footage: Wikimedia Commons (CC licence, see credits). Swap in your own GoPro reel any time.</p>
        </div>
      </div>
    </section>
  );
}
