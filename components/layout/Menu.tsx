'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { routes, site, waLink } from '@/lib/site';
import { TLink } from './Transition';
import Img from '../animations/Img';

const SLATS = 6;

/**
 * Fullscreen menu: six vertical slats drop like blinds (staggered from the centre),
 * links rise out of masks, and a mountain photo per link irises in on hover.
 */
export default function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.inOut' } })
        .set(el, { visibility: 'visible' })
        .fromTo('[data-slat]', { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.8, stagger: { each: 0.05, from: 'center' } })
        .fromTo('[data-menu-bg]', { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'expo.out' }, 0.45)
        .fromTo('[data-menu-link]', { yPercent: 120, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1, ease: 'expo.out', stagger: 0.05 }, 0.5)
        .fromTo('[data-menu-fade]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, 0.7);
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const t = tl.current;
    if (!t) return;
    // never let a closing menu swallow clicks meant for the page underneath
    if (root.current) root.current.style.pointerEvents = open ? 'auto' : 'none';
    if (open) t.timeScale(1).play();
    else if (t.progress() > 0) {
      t.timeScale(1.6).reverse();
      t.eventCallback('onReverseComplete', () => gsap.set(root.current, { visibility: 'hidden' }));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);

  return (
    <div ref={root} id="site-menu" className="fixed inset-0 z-[65] overflow-hidden" style={{ visibility: 'hidden' }} aria-hidden={!open} data-lenis-prevent>
      <div className="absolute inset-0 flex">
        {Array.from({ length: SLATS }, (_, i) => (
          <div key={i} data-slat="" className="h-full flex-1 bg-night" style={{ marginLeft: -1 }} />
        ))}
      </div>

      {/* hover image stack */}
      <div data-menu-bg className="absolute inset-0 md:left-[45%]">
        {routes.map((r, i) => (
          <div
            key={r.href}
            className="absolute inset-0 transition-[clip-path,transform] duration-[1100ms] ease-[var(--ease-glide)]"
            style={{
              clipPath: i === active ? 'circle(75% at 50% 50%)' : 'circle(0% at 50% 50%)',
              transform: i === active ? 'scale(1)' : 'scale(1.15)',
              zIndex: i === active ? 2 : 1,
            }}
          >
            <Img src={r.image} alt="" sizes="60vw" />
          </div>
        ))}
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-night via-night/60 to-night/10 md:via-night/30" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between overflow-y-auto px-[var(--gutter)] pb-8 pt-28">
        <ul className="flex flex-col gap-1">
          {routes.map((r, i) => (
            <li key={r.href} className="overflow-hidden">
              <TLink
                href={r.href}
                onClick={onClose}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                tabIndex={open ? 0 : -1}
                className="group flex items-baseline gap-4"
              >
                <span data-menu-link className="flex items-baseline gap-4">
                  <span className="hud w-8 text-white/40">{String(i + 1).padStart(2, '0')}</span>
                  <span
                    className={`display text-[clamp(2.2rem,6.4vw,5.6rem)] transition-[color,transform] duration-500 ease-[var(--ease-glide)] group-hover:translate-x-4 ${
                      active === i ? 'text-white' : 'text-white/35'
                    }`}
                  >
                    {r.label}
                  </span>
                </span>
              </TLink>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-6 text-sm text-white/70 sm:grid-cols-3">
          <div data-menu-fade>
            <p className="hud mb-2 text-white/40">Call / WhatsApp</p>
            <a href={site.phoneHref} className="hover:text-dawn">
              {site.phone}
            </a>
            <br />
            <a href={waLink('Hi! I want to book a paragliding flight in Bir.')} target="_blank" rel="noreferrer" className="hover:text-dawn">
              Chat on WhatsApp ↗
            </a>
          </div>
          <div data-menu-fade>
            <p className="hud mb-2 text-white/40">Email</p>
            <a href={`mailto:${site.email}`} className="hover:text-dawn">
              {site.email}
            </a>
          </div>
          <div data-menu-fade>
            <p className="hud mb-2 text-white/40">Base</p>
            <p>Bir, Himachal Pradesh, India</p>
            <p>{site.hours}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
