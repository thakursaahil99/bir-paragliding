'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { useReady } from '@/lib/useReady';
import { gallery } from '@/lib/site';
import Img from '../animations/Img';
import SplitHeading from '../animations/SplitHeading';
import { TLink } from '../layout/Transition';


/* ------------------------------------------------------------------ 1. 3D photo tunnel hero */
const TUNNEL = [
  'flight-sunset', 'chokling-monastery', 'tandem-red-wing', 'triund-night', 'monks-billing', 'dhauladhar-alpenglow',
  'flight-gaggle', 'tea-garden', 'billing-launch-flags', 'camp-himalaya', 'flight-cloud-sea', 'bir-street',
].map((n) => `/images/${n}.webp`);
const GAP = 900;

export function GalleryTunnel() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    const world = el.querySelector<HTMLElement>('[data-world]')!;
    const cards = [...el.querySelectorAll<HTMLElement>('[data-tcard]')];
    const place = (cam: number) => {
      world.style.transform = `translateZ(${cam}px)`;
      cards.forEach((c, i) => {
        const dz = -i * GAP + cam; // card z relative to viewer
        const o = Math.max(0, Math.min(1, (dz + 3200) / 1600)) * Math.max(0, Math.min(1, (700 - dz) / 500));
        c.style.opacity = String(o);
      });
    };
    place(0);
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const st = { cam: 0 };
        gsap.to(st, {
          cam: (cards.length - 1) * GAP + 600,
          ease: 'none',
          onUpdate: () => place(st.cam),
          scrollTrigger: { trigger: el, start: 'top top', end: '+=320%', pin: true, scrub: 0.8, anticipatePin: 1 },
        });
        gsap.to('[data-tunnel-title]', { scale: 2.2, autoAlpha: 0, filter: 'blur(12px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: '+=60%', scrub: true } });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-[radial-gradient(80%_60%_at_50%_45%,#132650_0%,#060a12_70%)]" aria-label="Fly through the gallery">
      <div className="absolute inset-0 [perspective:1000px] [perspective-origin:50%_45%]">
        <div data-world className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]">
          {TUNNEL.map((src, i) => {
            const side = i % 2 ? 1 : -1;
            const x = side * (18 + (i % 3) * 8);
            const y = ((i % 4) - 1.5) * 9;
            return (
              <div
                key={src}
                data-tcard
                className="absolute h-[44vh] w-[min(64vw,420px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] sm:w-[min(30vw,420px)]"
                style={{ transform: `translate3d(${x}vw, ${y}vh, ${-i * GAP}px)` }}
              >
                <Img src={src} alt="" sizes="(min-width: 640px) 30vw, 64vw" priority={i < 2} />
              </div>
            );
          })}
        </div>
      </div>
      <div data-tunnel-title className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <nav aria-label="Breadcrumb" className="hud mb-5 flex items-center gap-2 text-white/60">
          <TLink href="/" className="pointer-events-auto hover:text-white">
            Home
          </TLink>
          <span aria-hidden>/</span>
          <span className="text-white" aria-current="page">
            Gallery
          </span>
        </nav>
        <p className="hud text-dawn">Bir, frame by frame</p>
        <SplitHeading as="h1" immediate className="display mt-4 text-[clamp(2.6rem,9vw,9rem)] drop-shadow-[0_10px_50px_rgba(0,0,0,.6)]">
          Fly through the gallery
        </SplitHeading>
        <p className="hud mt-6 text-white/60">Scroll — the photos come to you</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 2. strip puzzle */
const STRIPS = 9;
export function StripPuzzle() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
        gsap.fromTo(
          '[data-strip]',
          { yPercent: (i) => (i % 2 ? 110 : -110), rotate: (i) => (i % 2 ? 6 : -6), opacity: 0 },
          { yPercent: 0, rotate: 0, opacity: 1, ease: 'power3.out', stagger: { each: 0.06, from: 'center' }, scrollTrigger: { trigger: el, start: 'top 75%', end: 'center 55%', scrub: 1 } }
        );
        gsap.fromTo('[data-strip-cap]', { letterSpacing: '0.6em', autoAlpha: 0 }, { letterSpacing: '0.18em', autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'center 70%', end: 'center 45%', scrub: true } });
  });
  const src = `/_next/image?url=${encodeURIComponent('/images/dhauladhar-alpenglow.webp')}&w=1920&q=80`;
  return (
    <section ref={root} className="relative overflow-hidden py-24 md:py-32" aria-labelledby="strip-title">
      <div className="container-x">
        <p className="hud text-dawn">Photo of the season</p>
        <SplitHeading id="strip-title" className="display mt-4 max-w-4xl text-[clamp(2.2rem,5.5vw,5rem)]">
          Alpenglow on the Dhauladhar
        </SplitHeading>
        <div className="relative mt-12 flex aspect-[2/1] w-full overflow-hidden rounded-[2rem]" role="img" aria-label="Pink evening light on the snowy Dhauladhar range above Dharamshala">
          {Array.from({ length: STRIPS }, (_, i) => (
            <div
              key={i}
              data-strip
              className="h-full flex-1"
              style={{ backgroundImage: `url(${src})`, backgroundSize: `${STRIPS * 100}% 100%`, backgroundPosition: `${(i / (STRIPS - 1)) * 100}% 50%` }}
            />
          ))}
        </div>
        <p data-strip-cap className="hud mt-6 text-center text-white/70">
          Last light · Kangra valley · the range that shadows every Bir flight
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 3. parallax columns */
export function ParallaxColumns() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
        const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true };
        gsap.fromTo('[data-col="0"]', { yPercent: 8 }, { yPercent: -22, ease: 'none', scrollTrigger: st });
        gsap.fromTo('[data-col="1"]', { yPercent: -26 }, { yPercent: 6, ease: 'none', scrollTrigger: st });
        gsap.fromTo('[data-col="2"]', { yPercent: 12 }, { yPercent: -34, ease: 'none', scrollTrigger: st });
        gsap.fromTo('[data-col-word]', { xPercent: 20 }, { xPercent: -40, ease: 'none', scrollTrigger: st });
  });
  const cols = [0, 1, 2].map((c) => gallery.filter((_, i) => i % 3 === c).slice(0, 5));
  return (
    <section ref={root} className="relative h-[130vh] overflow-hidden bg-night" aria-label="The valley in motion">
      <p data-col-word aria-hidden className="display pointer-events-none absolute top-1/2 z-0 -translate-y-1/2 whitespace-nowrap text-[22vw] text-white/[0.05]">
        valley in motion
      </p>
      <div className="container-x relative z-10 grid h-full grid-cols-3 gap-3 md:gap-6">
        {cols.map((list, c) => (
          <div key={c} data-col={c} className="flex flex-col gap-3 will-change-transform md:gap-6">
            {list.map((s) => (
              <div key={s.src} className="relative aspect-[3/4] overflow-hidden rounded-xl md:rounded-2xl">
                <Img src={s.src} alt={s.alt} sizes="33vw" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-40 bg-gradient-to-b from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-ink to-transparent" />
      <div className="absolute inset-x-0 top-1/2 z-30 -translate-y-1/2 text-center">
        <h2 className="display inline-block rounded-full bg-ink/70 px-6 py-3 text-[clamp(1.6rem,4vw,3.4rem)] backdrop-blur-md">The valley in motion</h2>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 4. compare slider */
export function CompareSlider() {
  const root = useRef<HTMLElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const stage = useRef<HTMLDivElement>(null);

  useReady(root, (el) => {
        const st = { p: 50 };
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top 60%', once: true } })
          .to(st, { p: 12, duration: 1, ease: 'power2.inOut', onUpdate: () => setPos(st.p) })
          .to(st, { p: 88, duration: 1.4, ease: 'power2.inOut', onUpdate: () => setPos(st.p) })
          .to(st, { p: 50, duration: 0.9, ease: 'power3.out', onUpdate: () => setPos(st.p) });
  });

  const move = (clientX: number) => {
    const r = stage.current!.getBoundingClientRect();
    setPos(Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <section ref={root} className="relative py-24 md:py-32" aria-labelledby="cmp-g-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">Two points of view</p>
            <SplitHeading id="cmp-g-title" className="display mt-4 text-[clamp(2.2rem,5.5vw,5rem)]">
              Ground vs. sky
            </SplitHeading>
          </div>
          <p className="max-w-sm text-white/60">Drag the handle. Left: the landing field crowd. Right: the same valley from the harness.</p>
        </div>
        <div
          ref={stage}
          className="relative mt-12 aspect-[16/10] w-full touch-pan-y select-none overflow-hidden rounded-[2rem] md:aspect-[16/8]"
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            move(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && move(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          data-cursor="drag"
          data-cursor-text="Drag"
        >
          <Img src="/images/valley-panorama.webp" alt="The Bir valley seen from the air" sizes="100vw" />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Img src="/images/landing-field.webp" alt="Crowd at the Bir landing field" sizes="100vw" />
          </div>
          <span className="hud absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 backdrop-blur">From the ground</span>
          <span className="hud absolute right-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 backdrop-blur">From the sky</span>
          <div className="absolute inset-y-0 w-[2px] bg-white" style={{ left: `${pos}%` }}>
            <button
              type="button"
              aria-label="Drag to compare"
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') setPos((p) => Math.max(2, p - 5));
                if (e.key === 'ArrowRight') setPos((p) => Math.min(98, p + 5));
              }}
              className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-snow text-ink shadow-xl"
            >
              ⟷
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
