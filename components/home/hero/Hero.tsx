'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { usePerfTier } from '@/lib/perf';
import { ridgePath } from '@/lib/ridge';
import Img from '@/components/animations/Img';
import Magnetic from '@/components/animations/Magnetic';
import { TLink } from '@/components/layout/Transition';
import { paletteForHour, paletteOrder, palettes, type PaletteName } from './palettes';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

const PHASES = [
  { at: 0, label: 'Take-off · Billing' },
  { at: 0.22, label: 'Climbing out' },
  { at: 0.42, label: 'Through the cloud deck' },
  { at: 0.66, label: 'Valley glide' },
  { at: 0.86, label: 'Final approach · Bir' },
];

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const tier = usePerfTier();
  // 3D quality is fixed at the first decision (no rebuilds); a later drop to low swaps in the photo hero
  const [quality, setQuality] = useState<'high' | 'mid' | null>(null);
  const show3D = quality !== null && tier !== null && tier !== 'low';
  const [palette, setPalette] = useState<PaletteName>('dawn');
  const [clock, setClock] = useState('');
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (tier && tier !== 'low' && !quality) setQuality(tier);
    if (tier === 'low') setSceneReady(false);
  }, [tier, quality]);
  const [inView, setInView] = useState(true);

  // time-of-day from the visitor's real clock
  useEffect(() => {
    const now = new Date();
    setPalette(paletteForHour(now.getHours()));
    setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // pointer + gyroscope steer the glider
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const tilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      pointer.current.x = Math.max(-1, Math.min(1, e.gamma / 30));
      pointer.current.y = Math.max(-1, Math.min(1, -(e.beta - 50) / 30));
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('deviceorientation', tilt, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('deviceorientation', tilt);
    };
  }, []);

  // pause WebGL when hero is off-screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '100px' });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, []);

  // scroll: progress, HUD, headline dispersal
  useEffect(() => {
    const el = section.current!;
    const alt = el.querySelector<HTMLElement>('[data-hero-alt]');
    const phase = el.querySelector<HTMLElement>('[data-hero-phase]');
    const bar = el.querySelector<HTMLElement>('[data-hero-bar]');
    let lastPhase = -1;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress;
          progress.current = p;
          if (alt) alt.textContent = Math.round(2400 - p * 1000).toLocaleString('en-IN');
          if (bar) bar.style.transform = `scaleX(${p})`;
          const idx = PHASES.reduce((a, ph, i) => (p >= ph.at ? i : a), 0);
          if (idx !== lastPhase && phase) {
            lastPhase = idx;
            gsap.fromTo(phase, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5 });
            phase.textContent = PHASES[idx].label;
          }
        },
      });
      if (prefersReduced()) return;
      const st = { trigger: el, start: 'top top', end: '35% top', scrub: 0.6 };
      gsap.to('[data-hero-line="0"]', { xPercent: -28, yPercent: -40, autoAlpha: 0, filter: 'blur(14px)', ease: 'none', scrollTrigger: st });
      gsap.to('[data-hero-line="1"]', { xPercent: 22, yPercent: -10, autoAlpha: 0, filter: 'blur(14px)', ease: 'none', scrollTrigger: st });
      gsap.to('[data-hero-sub]', { y: -60, autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '25% top' } });
      gsap.fromTo('[data-hero-land]', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'none', scrollTrigger: { trigger: el, start: '72% top', end: '88% top', scrub: true } });
      // fallback layers parallax (low-end)
      gsap.to('[data-fb-layer]', { yPercent: (i) => (i + 1) * 12, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true } });
      gsap.to('[data-fb-img]', { scale: 1.25, yPercent: 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  // intro: chars flip up from the horizon line once the preloader has parted
  useEffect(() => {
    const el = section.current!;
    const h1 = el.querySelector<HTMLElement>('h1')!;
    if (prefersReduced()) {
      h1.style.visibility = 'visible';
      return;
    }
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const split = SplitText.create(el.querySelectorAll('[data-hero-line] > span'), { type: 'words,chars', mask: 'chars', wordsClass: 'whitespace-nowrap' });
        // sky → snow → sunrise gradient, painted per character so it survives the split
        const lerp = gsap.utils.interpolate(['#8ec5ff', '#ffffff', '#ffc56b', '#ff7a2f']);
        const gradChars = split.chars.filter((c) => c.closest('[data-hero-grad]'));
        gradChars.forEach((c, i) => ((c as HTMLElement).style.color = lerp(i / Math.max(1, gradChars.length - 1))));
        gsap.set(h1, { visibility: 'visible' });
        gsap
          .timeline()
          .from(split.chars, { yPercent: 130, rotateX: -80, transformOrigin: '50% 100% -30px', duration: 1.4, ease: 'expo.out', stagger: { each: 0.035, from: 'start' } })
          .from('[data-hero-fade]', { autoAlpha: 0, y: 24, duration: 1, stagger: 0.08 }, 0.5);
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  const cyclePalette = () => setPalette((p) => paletteOrder[(paletteOrder.indexOf(p) + 1) % paletteOrder.length]);

  return (
    <section ref={section} className="relative h-[280vh]" aria-label="Fly above the Himalayas">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* fallback / LCP layer (also the low-end experience) */}
        <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${sceneReady ? 'opacity-0' : 'opacity-100'}`}>
          <div data-fb-img className="absolute inset-0">
            <Img src="/images/flight-cloud-sea.webp" alt="Paragliders soaring above a sea of clouds at Bir Billing" priority sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/10 to-night/80" />
          {[0, 1].map((i) => (
            <svg key={i} data-fb-layer aria-hidden viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[38%] w-full">
              <path d={ridgePath(40 + i * 9, { base: 0.5 + i * 0.18, amp: 0.3, peaks: 6 + i * 3 })} fill={i ? '#060a12' : '#0d1a2e'} opacity={i ? 1 : 0.85} />
            </svg>
          ))}
        </div>

        {show3D && quality && (
          <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
            <HeroScene quality={quality} progress={progress} pointer={pointer} palette={palette} active={inView} onReady={() => setTimeout(() => setSceneReady(true), 300)} />
          </div>
        )}

        {/* legibility vignette */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_40%,rgba(6,10,18,.55)_100%)]" />
        {/* soft shade behind the headline so it reads over bright snow and sky */}
        <div data-hero-shade aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(52%_34%_at_50%_45%,rgba(6,10,18,.42),transparent_78%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-ink/75 to-transparent" />

        {/* HUD — top */}
        <div className="container-x pointer-events-none absolute inset-x-0 top-24 flex items-start justify-between md:top-28">
          <div data-hero-fade className="hud text-white/70">
            <p>N 32°03′ · E 76°43′</p>
            <p className="mt-1 hidden text-white/40 sm:block">Bir Billing · Himachal Pradesh</p>
          </div>
          <button
            data-hero-fade
            type="button"
            onClick={cyclePalette}
            data-cursor="light"
            className="hud pointer-events-auto mr-0 flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-white/80 backdrop-blur-md transition-colors hover:border-white/50 md:mr-14"
            aria-label="Change time-of-day lighting"
          >
            <span className="h-2 w-2 rounded-full bg-dawn shadow-[0_0_10px_2px_rgba(255,122,47,.8)]" />
            {palettes[palette].label}
            {clock && <span className="hidden text-white/40 sm:inline">· {clock}</span>}
          </button>
        </div>

        {/* headline */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center [perspective:900px]">
          <p data-hero-fade className="hud mb-5 text-white/70">
            Bir Billing, Himachal Pradesh · Now booking
          </p>
          <h1 data-split className="display text-[clamp(1.7rem,8.2vw,10.5rem)] uppercase text-snow drop-shadow-[0_10px_40px_rgba(0,0,0,.35)]">
            <span data-hero-line="0" className="block whitespace-nowrap will-change-transform">
              <span>Fly above</span>
            </span>
            <span data-hero-line="1" className="block whitespace-nowrap will-change-transform">
              <span data-hero-grad className="text-sun">
                <span className="mr-[0.18em] align-[0.62em] text-[0.32em] tracking-normal">the</span>
                Himalayas
              </span>
            </span>
          </h1>
          <div data-hero-sub className="mt-8 flex flex-col items-center gap-6">
            <p data-hero-fade className="max-w-md text-balance text-white/80">
              Tandem flights from the 2,400 m Billing launch and pilot courses from P1 to P4 — booked in minutes, confirmed on WhatsApp.
            </p>
            <div data-hero-fade className="flex flex-wrap justify-center gap-3">
              <Magnetic>
                <TLink href="/booking" data-cursor="book" className="inline-block rounded-full bg-gradient-to-r from-dawn to-ember px-7 py-3.5 font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(255,122,47,.9)]">
                  <span data-magnetic-inner className="block">
                    Book a flight
                  </span>
                </TLink>
              </Magnetic>
              <Magnetic>
                <TLink href="/packages" className="glass inline-block rounded-full bg-[linear-gradient(135deg,rgba(6,10,18,.52),rgba(6,10,18,.3))]! px-7 py-3.5 font-medium text-white">
                  <span data-magnetic-inner className="block">
                    See packages
                  </span>
                </TLink>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* touchdown message */}
        <div data-hero-land className="pointer-events-none absolute inset-x-0 top-[30%] text-center opacity-0">
          <p className="hud text-dawn">Touchdown</p>
          <p className="display mt-3 text-[clamp(2.4rem,7vw,6rem)]">Bir landing field</p>
          <p className="hud mt-3 text-white/60">~1,400 m · 1,000 m below the launch</p>
        </div>

        {/* HUD — bottom */}
        <div className="container-x pointer-events-none absolute inset-x-0 bottom-6 flex items-end justify-between gap-4">
          <div data-hero-fade className="flex items-center gap-3">
            <span className="relative block h-10 w-px overflow-hidden bg-white/20">
              <span className="absolute inset-x-0 top-0 h-1/2 bg-dawn [animation:float-y_1.6s_ease-in-out_infinite]" />
            </span>
            <span className="hud text-white/60">Scroll to take off</span>
          </div>
          <div data-hero-fade className="glass mr-16 hidden min-w-[15rem] rounded-2xl px-4 py-3 sm:block md:mr-20">
            <div className="flex items-baseline justify-between gap-6">
              <span className="hud text-white/50">ALT</span>
              <span className="font-mono text-2xl tabular-nums">
                <span data-hero-alt>2,400</span>
                <span className="text-sm text-white/40"> m</span>
              </span>
            </div>
            <div className="mt-2 overflow-hidden">
              <p data-hero-phase className="hud text-dawn">
                {PHASES[0].label}
              </p>
            </div>
            <div className="mt-2 h-px bg-white/10">
              <div data-hero-bar className="h-full origin-left bg-gradient-to-r from-sky to-dawn" style={{ transform: 'scaleX(0)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
