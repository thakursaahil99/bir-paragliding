'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { flights, inr, type Pkg } from '@/lib/site';
import SplitHeading from '@/components/animations/SplitHeading';
import Img from '@/components/animations/Img';
import { TLink } from '@/components/layout/Transition';
import Particles from '@/components/fx/Particles';

function FlipCard({ pkg, index }: { pkg: Pkg; index: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const o = outer.current!;
    const t = tilt.current!;
    if (window.matchMedia('(pointer: coarse)').matches || prefersReduced()) return;
    const rx = gsap.quickTo(t, 'rotateX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(t, 'rotateY', { duration: 0.7, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const r = o.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * 16);
      ry((px - 0.5) * 18);
      glare.current?.style.setProperty('--gx', `${px * 100}%`);
      glare.current?.style.setProperty('--gy', `${py * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    o.addEventListener('pointermove', move);
    o.addEventListener('pointerleave', leave);
    return () => {
      o.removeEventListener('pointermove', move);
      o.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div
      ref={outer}
      data-pkg-card
      className="[perspective:1300px]"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setFlipped(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setFlipped(false)}
    >
      <div ref={tilt} className="relative [transform-style:preserve-3d]">
        <div
          className="relative h-[520px] w-full transition-transform duration-[900ms] ease-[var(--ease-glide)] [transform-style:preserve-3d] md:h-[560px]"
          style={{ transform: `rotateY(${flipped ? 180 : 0}deg)` }}
        >
          {/* FRONT */}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/10 bg-slate [backface-visibility:hidden] [transform-style:preserve-3d]">
            <Img src={pkg.image} alt={pkg.name} sizes="(min-width: 1024px) 33vw, 90vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6 [transform:translateZ(50px)]">
              <span className="hud rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">{pkg.tag}</span>
              {pkg.popular && <span className="hud rounded-full bg-dawn px-3 py-1.5 text-ink">Most popular</span>}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 [transform:translateZ(70px)] md:p-7">
              <p className="hud text-white/60">0{index + 1} · {pkg.durationShort} airtime</p>
              <h3 className="mt-2 font-display text-[1.9rem] font-bold leading-tight">{pkg.name}</h3>
              <p className="mt-1 text-white/70">{pkg.tagline}</p>
              <div className="mt-5 flex items-end justify-between">
                <p className="font-display text-4xl font-bold">
                  {inr(pkg.price)}
                  <span className="ml-1 text-sm font-normal text-white/50">/ person</span>
                </p>
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  className="hud rounded-full border border-white/25 px-3 py-2 text-white/80 md:pointer-events-none"
                  aria-label={`Show what's included in ${pkg.name}`}
                >
                  Inclusions ↻
                </button>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(160deg,#16305e_0%,#0d1a33_55%,#3a1f2a_100%)] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] md:p-8">
            <p className="hud text-dawn">What&apos;s included</p>
            <h3 className="mt-2 font-display text-2xl font-bold">{pkg.name}</h3>
            <ul className="mt-6 space-y-3.5">
              {pkg.inclusions.map((inc) => (
                <li key={inc} className="flex items-start gap-3 text-white/85">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-dawn" aria-hidden>
                    <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6 10.5l2.6 2.6L14.5 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {inc}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-white/60">{pkg.description}</p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-6">
              <p className="font-display text-3xl font-bold">{inr(pkg.price)}</p>
              <span className="flex gap-2">
                <TLink href={`/packages/${pkg.slug}`} className="rounded-full border border-white/30 px-4 py-3 text-sm">
                  Details
                </TLink>
                <TLink href={`/booking?package=${pkg.slug}`} data-cursor="book" className="rounded-full bg-snow px-5 py-3 text-sm font-semibold text-ink">
                  Book
                </TLink>
              </span>
            </div>
          </div>
        </div>
        {/* glare */}
        <div
          ref={glare}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem] mix-blend-overlay transition-opacity duration-500 [transform:translateZ(90px)]"
          style={{ background: 'radial-gradient(circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,.6), transparent 45%)', opacity: flipped ? 0.85 : 0 }}
        />
      </div>
    </div>
  );
}

export default function PackagesPreview() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const el = root.current!;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        // cards fall in like wings opening: rotateX from flat, staggered
        gsap.from('[data-pkg-card]', {
          rotateX: -75,
          y: 120,
          autoAlpha: 0,
          transformOrigin: '50% 0%',
          duration: 1.4,
          ease: 'expo.out',
          stagger: 0.14,
          scrollTrigger: { trigger: el.querySelector('[data-pkg-grid]'), start: 'top 82%', once: true },
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-[radial-gradient(70%_60%_at_50%_100%,#3a1f2a,#060a12_70%)] py-24 md:py-36" aria-labelledby="pkg-title">
      <Particles mode="bubbles" color="#ffc56b" intensity={0.8} />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">Tandem paragliding</p>
            <SplitHeading id="pkg-title" className="display mt-4 max-w-3xl text-[clamp(2.6rem,6.5vw,6rem)]">
              Choose your airtime
            </SplitHeading>
          </div>
          <div className="max-w-sm">
            <p className="text-white/65">No experience needed on any tandem — a licensed pilot flies the wing. Hover a card to flip it and see what&apos;s included.</p>
            <TLink href="/packages" className="hud mt-4 inline-block text-white underline decoration-dawn underline-offset-8">
              All flights & courses →
            </TLink>
          </div>
        </div>
        <div data-pkg-grid className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {flights.map((p, i) => (
            <FlipCard key={p.slug} pkg={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
