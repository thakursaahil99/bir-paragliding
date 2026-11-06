'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { whyBir } from '@/lib/site';
import { ridgePath } from '@/lib/ridge';
import SplitHeading from '@/components/animations/SplitHeading';
import Img from '@/components/animations/Img';

/**
 * Pinned horizontal flight: vertical scroll drives the card track sideways while three
 * ridge silhouettes slide at different speeds; cards lean with scroll velocity (crosswind).
 */
export default function WhyBir() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (prefersReduced()) return;
    setPinned(true);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const el = section.current!;
    const tr = track.current!;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth);
        const cards = gsap.utils.toArray<HTMLElement>('[data-why-card]');
        const skewTo = gsap.quickTo(cards, 'skewX', { duration: 0.6, ease: 'power3' });
        const tween = gsap.to(tr, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => skewTo(gsap.utils.clamp(-7, 7, self.getVelocity() / -350)),
            onLeave: () => skewTo(0),
            onLeaveBack: () => skewTo(0),
          },
        });
        gsap.utils.toArray<HTMLElement>('[data-why-layer]').forEach((layer, i) => {
          gsap.to(layer, {
            xPercent: -(8 + i * 14),
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + distance(), scrub: 1, invalidateOnRefresh: true },
          });
        });
        gsap.to('[data-why-ghost]', {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + distance(), scrub: 1, invalidateOnRefresh: true },
        });
        cards.forEach((card) => {
          const img = card.querySelector('[data-why-img]');
          gsap.fromTo(img, { xPercent: -10 }, { xPercent: 10, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
          gsap.from(card.querySelectorAll('[data-why-text]'), {
            y: 40,
            autoAlpha: 0,
            stagger: 0.08,
            duration: 0.9,
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 75%', toggleActions: 'play none none reverse' },
          });
          gsap.fromTo(
            card.querySelector('[data-why-kicker]'),
            { scale: 0.6, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 45%', scrub: true } }
          );
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, [pinned]);

  return (
    <section
      ref={section}
      className={`relative overflow-hidden bg-[linear-gradient(180deg,#0a1220_0%,#122347_55%,#2b2f5e_100%)] ${pinned ? 'h-[100svh]' : 'py-24'}`}
      aria-labelledby="why-title"
    >
      {/* parallax ridges */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]">
        {[0, 1, 2].map((i) => (
          <svg key={i} data-why-layer viewBox="0 0 2880 320" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-full w-[200%]">
            <path
              d={ridgePath(101 + i * 13, { w: 2880, base: 0.42 + i * 0.16, amp: 0.34 - i * 0.07, peaks: 12 + i * 4, steps: 180 })}
              fill={['#1d2c55', '#14203f', '#0b1426'][i]}
              opacity={[0.75, 0.9, 1][i]}
            />
          </svg>
        ))}
      </div>
      <p data-why-ghost aria-hidden className="display pointer-events-none absolute left-[5vw] top-[12%] whitespace-nowrap text-[22vw] text-white/[0.035]">
        BIR BILLING · 2,400 M
      </p>

      <div
        ref={track}
        className={`relative z-10 flex items-center gap-6 px-[var(--gutter)] md:gap-10 ${pinned ? 'h-full w-max' : 'no-scrollbar snap-x snap-mandatory overflow-x-auto'}`}
      >
        <div className="w-[82vw] shrink-0 snap-start md:w-[38vw]">
          <p className="hud text-dawn">Why Bir Billing</p>
          <SplitHeading id="why-title" className="display mt-4 text-[clamp(2.6rem,6vw,5.8rem)]">
            Why pilots pick Bir
          </SplitHeading>
          <p className="mt-6 max-w-md text-white/70">
            Big vertical, a dependable ridge and a season that runs most of the year. Keep scrolling — the valley slides past just like it does from the harness.
          </p>
          <p className="hud mt-10 flex items-center gap-3 text-white/50">
            <span className="h-px w-10 bg-white/40" /> Scroll sideways
          </p>
        </div>

        {whyBir.map((w, i) => (
          <article
            key={w.title}
            data-why-card
            className="glass relative flex h-[68vh] max-h-[620px] min-h-[440px] w-[78vw] shrink-0 snap-center flex-col overflow-hidden rounded-[2rem] sm:w-[60vw] md:w-[34vw]"
          >
            <div className="relative h-[52%] overflow-hidden">
              <div data-why-img className="absolute inset-[-12%_-14%] will-change-transform">
                <Img src={w.image} alt={w.title} sizes="(min-width: 768px) 40vw, 85vw" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />
              <span className="hud absolute left-5 top-5 rounded-full bg-night/60 px-3 py-1.5 text-white/80 backdrop-blur">0{i + 1} / 0{whyBir.length}</span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
              <p data-why-kicker className="display origin-left text-[clamp(2.4rem,4.5vw,4rem)] text-sky-gradient">
                {w.kicker}
              </p>
              <div>
                <h3 data-why-text className="font-display text-2xl font-bold">
                  {w.title}
                </h3>
                <p data-why-text className="mt-3 text-white/70">
                  {w.text}
                </p>
              </div>
            </div>
          </article>
        ))}
        <div className="w-[10vw] shrink-0" aria-hidden />
      </div>
    </section>
  );
}
