'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { ridgePath } from '@/lib/ridge';
import { site, waLink } from '@/lib/site';
import { TLink } from './Transition';
import Magnetic from '../animations/Magnetic';

const cols = [
  {
    title: 'Fly',
    links: [
      { href: '/packages', label: 'Tandem flights' },
      { href: '/packages#courses', label: 'Paragliding courses' },
      { href: '/booking', label: 'Book a flight' },
      { href: '/gallery', label: 'Gallery' },
    ],
  },
  {
    title: 'Plan',
    links: [
      { href: '/experience-bir', label: 'Experience Bir' },
      { href: '/blog', label: 'Flight Log & guides' },
      { href: '/faq', label: 'FAQs' },
      { href: '/about', label: 'About us' },
    ],
  },
];


/**
 * Curtain footer: it sits fixed beneath the page and is uncovered as the last section
 * scrolls away; the giant wordmark rises letter by letter and three ridge lines drift apart.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true, refreshPriority: -1 };
      gsap.fromTo('[data-brand-char]', { yPercent: 105 }, { yPercent: 0, ease: 'none', stagger: 0.04, scrollTrigger: st });
      gsap.fromTo('[data-ridge="0"]', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: st });
      gsap.fromTo('[data-ridge="1"]', { yPercent: 70 }, { yPercent: 0, ease: 'none', scrollTrigger: st });
      gsap.fromTo('[data-ridge="2"]', { yPercent: 100 }, { yPercent: 0, ease: 'none', scrollTrigger: st });
      gsap.fromTo('[data-foot-top]', { y: -120, autoAlpha: 0.2 }, { y: 0, autoAlpha: 1, ease: 'none', scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={root} className="relative h-[100svh] min-h-[720px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
      <div className="fixed bottom-0 left-0 flex h-[100svh] min-h-[720px] w-full flex-col overflow-hidden bg-[linear-gradient(180deg,#0a1220_0%,#101d36_45%,#3a2340_75%,#ff7a2f_140%)]">
        {/* ridges */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]">
          {[0, 1, 2].map((i) => (
            <svg key={i} data-ridge={i} viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-full w-full">
              <path
                d={ridgePath(11 + i * 7, { base: 0.45 + i * 0.12, amp: 0.32 - i * 0.06, peaks: 5 + i * 2 })}
                fill={['#1a2747', '#121c34', '#070c17'][i]}
                opacity={[0.8, 0.92, 1][i]}
              />
            </svg>
          ))}
        </div>

        <div data-foot-top className="container-x relative z-10 grid flex-1 content-start gap-12 pt-28 md:grid-cols-12 md:pt-32">
          <div className="md:col-span-5">
            <p className="hud text-dawn">Next stop · 2,400 m</p>
            <p className="display mt-4 text-[clamp(2.6rem,6vw,5rem)]">Ready when the wind is.</p>
            <p className="mt-4 max-w-sm text-white/60">Pick a flight and a date — we&apos;ll confirm your slot, pickup and timing on WhatsApp.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <TLink href="/booking" data-cursor="book" className="inline-block rounded-full bg-snow px-6 py-3 font-semibold text-ink">
                  <span data-magnetic-inner className="block">
                    Start planning
                  </span>
                </TLink>
              </Magnetic>
              <a href={waLink('Hi Bir Paragliding! I have a question about booking.')} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-6 py-3 text-white/80 hover:border-white/60">
                WhatsApp us ↗
              </a>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <p className="hud mb-4 text-white/40">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <TLink href={l.href} className="text-white/75 transition-colors hover:text-dawn">
                      {l.label}
                    </TLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="md:col-span-3">
            <p className="hud mb-4 text-white/40">Contact</p>
            <ul className="space-y-2.5 text-white/75">
              <li>
                <a href={site.phoneHref} className="hover:text-dawn">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-dawn">
                  {site.email}
                </a>
              </li>
              <li>Bir, Himachal Pradesh, India</li>
              <li>{site.hours}</li>
            </ul>
          </div>
        </div>

        <div className="relative z-10">
          <p aria-label="Bir Paragliding" className="display flex select-none flex-col items-center px-2 leading-[0.8]">
            {['BIR', 'PARAGLIDING'].map((word, w) => (
              <span key={word} className={`flex overflow-hidden ${w === 0 ? 'text-[clamp(1.6rem,5vw,6rem)] text-dawn' : 'text-[clamp(2.4rem,8.2vw,10rem)] text-snow'}`}>
                {word.split('').map((ch, i) => (
                  <span key={i} aria-hidden data-brand-char className="inline-block">
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </p>
          <div className="container-x flex flex-col items-start justify-between gap-2 border-t border-white/10 py-4 text-xs text-white/45 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} Bir Paragliding. All rights reserved.</p>
            <p className="flex flex-wrap gap-4">
              <TLink href="/legal/terms" className="hover:text-white">
                Terms
              </TLink>
              <TLink href="/legal/privacy" className="hover:text-white">
                Privacy
              </TLink>
              <TLink href="/legal/cancellation" className="hover:text-white">
                Cancellation & refunds
              </TLink>
              <TLink href="/credits" className="hover:text-white">
                Photo & video credits
              </TLink>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
