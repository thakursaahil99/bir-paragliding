'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { rng } from '@/lib/ridge';
import SplitHeading from '@/components/animations/SplitHeading';
import Img from '@/components/animations/Img';
import Magnetic from '@/components/animations/Magnetic';
import { TLink } from '@/components/layout/Transition';

const shots = [
  { src: '/images/flight-sunset.webp', alt: 'Paraglider against the setting sun in Bir' },
  { src: '/images/chokling-monastery.webp', alt: 'Chokling Monastery in Bir' },
  { src: '/images/tandem-red-wing.webp', alt: 'Tandem flight under a red wing' },
  { src: '/images/triund-night.webp', alt: 'Triund ridge under a night sky' },
  { src: '/images/billing-launch-flags.webp', alt: 'Prayer flags at the Billing launch' },
  { src: '/images/dhauladhar-alpenglow.webp', alt: 'Alpenglow on the Dhauladhar' },
  { src: '/images/monks-billing.webp', alt: 'Monks with a red umbrella at Billing' },
  { src: '/images/tea-garden.webp', alt: 'Tea garden in the Kangra valley' },
  { src: '/images/flight-cloud-sea.webp', alt: 'Gliders above the cloud sea' },
];

/** Photos float scattered through 3D space, then fly into a tidy grid as you scroll. */
export default function GalleryAssemble() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const el = section.current!;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const r = rng(42);
        const tiles = gsap.utils.toArray<HTMLElement>('[data-tile]');
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top top', end: '+=180%', pin: true, scrub: 1, anticipatePin: 1 },
        });
        tiles.forEach((t, i) => {
          tl.fromTo(
            t,
            {
              x: () => (r() - 0.5) * window.innerWidth * 1.3,
              y: () => (r() - 0.5) * window.innerHeight * 1.2,
              z: () => -1600 + r() * 2000,
              rotateX: (r() - 0.5) * 120,
              rotateY: (r() - 0.5) * 140,
              rotateZ: (r() - 0.5) * 60,
              autoAlpha: 0.15,
            },
            { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0, autoAlpha: 1, ease: 'power3.inOut', duration: 1 },
            i * 0.04
          );
        });
        tl.fromTo('[data-ga-cta]', { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.3 }, 0.9).to({}, { duration: 0.25 });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={section} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ink py-20" aria-labelledby="ga-title">
      <div className="container-x relative z-10 mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="hud text-dawn">Moments from Bir</p>
          <SplitHeading id="ga-title" className="display mt-3 text-[clamp(2.2rem,5.5vw,5rem)]">
            Sky, trails & campfires
          </SplitHeading>
        </div>
        <div data-ga-cta>
          <Magnetic>
            <TLink href="/gallery" data-cursor="view" className="glass inline-block rounded-full px-6 py-3 text-sm font-medium">
              <span data-magnetic-inner className="block">
                Open the gallery →
              </span>
            </TLink>
          </Magnetic>
        </div>
      </div>
      <div className="container-x [perspective:1400px]">
        <div className="grid h-[calc(100svh-15rem)] min-h-[360px] grid-flow-dense grid-cols-4 grid-rows-3 gap-2 [transform-style:preserve-3d] sm:gap-4">
          {shots.map((s, i) => (
            <div key={s.src} data-tile className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${i === 0 ? "row-span-2" : ""} ${i === 4 || i === 7 ? "col-span-2" : ""}`}>
              <Img src={s.src} alt={s.alt} sizes="33vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
