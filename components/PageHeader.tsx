'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import SplitHeading from './animations/SplitHeading';
import Img from './animations/Img';
import { TLink } from './layout/Transition';

type Props = {
  kicker: string;
  title: string;
  intro?: ReactNode;
  image: string;
  imageAlt: string;
  crumb: string;
  children?: ReactNode;
};

/**
 * Inner-page header: the photo opens like a window (inset clip on all sides) and
 * zooms out, then drifts slower than the page as you scroll away.
 */
export default function PageHeader({ kicker, title, intro, image, imageAlt, crumb, children }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap
          .timeline()
          .fromTo('[data-ph-frame]', { clipPath: 'inset(18% 22% 18% 22% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.6, ease: 'expo.inOut' })
          .fromTo('[data-ph-img]', { scale: 1.35 }, { scale: 1.05, duration: 2.2, ease: 'expo.out' }, 0.1)
          .from('[data-ph-fade]', { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.08 }, 0.7);
        gsap.to('[data-ph-img]', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <header ref={root} className="relative flex min-h-[82svh] items-end overflow-hidden pb-14 pt-36 md:pb-20">
      <div data-ph-frame className="absolute inset-0">
        <div data-ph-img className="absolute inset-0 will-change-transform">
          <Img src={image} alt={imageAlt} priority sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/30" />
      </div>
      <div className="container-x relative z-10">
        <nav data-ph-fade aria-label="Breadcrumb" className="hud mb-6 flex items-center gap-2 text-white/60">
          <TLink href="/" className="hover:text-white">
            Home
          </TLink>
          <span aria-hidden>/</span>
          <span className="text-white" aria-current="page">
            {crumb}
          </span>
        </nav>
        <p data-ph-fade className="hud text-dawn">
          {kicker}
        </p>
        <SplitHeading as="h1" immediate delay={0.35} className="display mt-4 max-w-5xl text-[clamp(2.8rem,8vw,8rem)]">
          {title}
        </SplitHeading>
        {intro && (
          <div data-ph-fade className="mt-6 max-w-xl text-lg text-white/75">
            {intro}
          </div>
        )}
        {children}
      </div>
    </header>
  );
}
