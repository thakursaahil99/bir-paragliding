'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { appState, lenisRef, onScroll, scrollState } from '@/lib/store';
import { site } from '@/lib/site';
import { TLink } from './Transition';
import Logo from './Logo';
import Magnetic from '../animations/Magnetic';
import Menu from './Menu';

const links = [
  { href: '/packages', label: 'Flights' },
  { href: '/experience-bir', label: 'Experience Bir' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Flight Log' },
];

export default function Navbar() {
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // hide on scroll down, reveal on scroll up
  useEffect(() => {
    let hidden = false;
    return onScroll(() => {
      const y = scrollState.y;
      setScrolled(y > 40);
      const shouldHide = y > 160 && scrollState.direction === 1 && Math.abs(scrollState.velocity) > 0.4;
      const shouldShow = scrollState.direction === -1 || y < 160;
      if (shouldHide && !hidden) {
        hidden = true;
        gsap.to(bar.current, { yPercent: -140, duration: 0.6, ease: 'expo.out' });
      } else if (shouldShow && hidden) {
        hidden = false;
        gsap.to(bar.current, { yPercent: 0, duration: 0.6, ease: 'expo.out' });
      }
    });
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (open) lenisRef.current?.stop();
    else if (appState.loaded && !appState.transitioning) lenisRef.current?.start();
  }, [open]);

  return (
    <>
      <header ref={bar} className="fixed inset-x-0 top-0 z-[70] px-3 pt-3 md:px-5 md:pt-4">
        <nav
          className={`mx-auto flex max-w-[1500px] items-center justify-between rounded-full px-3 py-2 transition-[background,border-color,box-shadow] duration-500 md:px-4 ${
            scrolled || open ? 'glass' : 'border border-transparent'
          }`}
          aria-label="Main"
        >
          <TLink href="/" aria-label="Bir Paragliding — home" className="rounded-full pr-2">
            <Logo />
          </TLink>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <TLink
                  href={l.href}
                  className={`group relative block overflow-hidden rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:text-white ${
                    pathname.startsWith(l.href) ? 'text-white' : ''
                  }`}
                >
                  <span className="relative block transition-transform duration-500 ease-[var(--ease-glide)] group-hover:-translate-y-full">{l.label}</span>
                  <span aria-hidden className="absolute inset-x-4 top-full block text-dawn transition-transform duration-500 ease-[var(--ease-glide)] group-hover:-translate-y-full">
                    {l.label}
                  </span>
                  {pathname.startsWith(l.href) && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-dawn" />}
                </TLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a href={site.phoneHref} className="hud hidden px-3 text-white/60 transition-colors hover:text-white xl:block">
              {site.phone}
            </a>
            <Magnetic strength={0.3}>
              <TLink
                href="/booking"
                data-cursor="book"
                className="relative hidden overflow-hidden rounded-full bg-gradient-to-r from-dawn to-ember px-5 py-2.5 text-sm font-semibold text-ink sm:block"
              >
                <span data-magnetic-inner className="relative block">
                  Book a flight
                </span>
              </TLink>
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="group relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5"
            >
              <span className={`absolute h-px w-5 bg-white transition-transform duration-500 ease-[var(--ease-glide)] ${open ? 'rotate-45' : '-translate-y-[4px]'}`} />
              <span className={`absolute h-px bg-white transition-all duration-500 ease-[var(--ease-glide)] ${open ? 'w-5 -rotate-45' : 'w-3 translate-x-[4px] translate-y-[4px] group-hover:w-5 group-hover:translate-x-0'}`} />
            </button>
          </div>
        </nav>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
