'use client';

import Link, { type LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import { lenisRef, setTransitioning } from '@/lib/store';
import { routeTitle } from '@/lib/site';

type Ctx = { go: (href: string) => void };
const TransitionCtx = createContext<Ctx>({ go: () => {} });
export const useTransitionNav = () => useContext(TransitionCtx);

const BANDS = 7;
const BAND_COLORS = ['#0a1220', '#0f2547', '#123a7a', '#1e5bc0', '#3b7fe6', '#ff9a4d', '#ff6a2a'];

/**
 * "Wind gust" route transition: rounded jet-stream bands sweep across the screen,
 * the next page's name slides through the gap, then the bands blow off the other side.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const pending = useRef<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  const bands = () => overlay.current?.querySelectorAll<HTMLElement>('[data-band]') ?? [];

  const go = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.href = href;
        return;
      }
      if (url.pathname === window.location.pathname) {
        if (url.hash) document.querySelector(url.hash)?.scrollIntoView();
        else lenisRef.current?.scrollTo(0, { duration: 1.4 });
        if (url.search !== window.location.search) router.push(href, { scroll: false });
        return;
      }
      if (busy.current) return;
      busy.current = true;

      if (prefersReduced()) {
        router.push(href);
        busy.current = false;
        return;
      }

      setTransitioning(true);
      lenisRef.current?.stop();
      setTitle(routeTitle(url.pathname));
      gsap.set(overlay.current, { visibility: 'visible' });
      gsap
        .timeline({
          onComplete: () => {
            pending.current = url.pathname;
            router.push(href, { scroll: false });
          },
        })
        .fromTo(
          bands(),
          { xPercent: -105, skewX: -12 },
          { xPercent: 0, skewX: 0, duration: 0.85, ease: 'expo.inOut', stagger: { each: 0.045, from: 'center' } }
        )
        .fromTo('[data-wind]', { xPercent: -100, opacity: 0 }, { xPercent: 260, opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.06 }, 0.1);
    },
    [router]
  );

  // when the new route has rendered, uncover it
  useEffect(() => {
    if (!pending.current || pending.current !== pathname) return;
    pending.current = null;
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(overlay.current, { visibility: 'hidden' });
            busy.current = false;
          },
        })
        .add(() => setTitle(null), 0.25)
        .to(bands(), { xPercent: 105, skewX: 12, duration: 0.95, ease: 'expo.inOut', stagger: { each: 0.045, from: 'edges' } }, 0.35)
        .add(() => {
          lenisRef.current?.start();
          setTransitioning(false);
          requestAnimationFrame(() => ScrollTrigger.refresh());
        }, 0.6);
    }, 120);
    return () => clearTimeout(t);
  }, [pathname]);

  // back/forward: no overlay but make sure scroll is unlocked
  useEffect(() => {
    const pop = () => {
      busy.current = false;
      lenisRef.current?.start();
      setTransitioning(false);
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);

  return (
    <TransitionCtx.Provider value={{ go }}>
      {children}
      <div ref={overlay} aria-hidden className="pointer-events-none fixed inset-0 z-[85] overflow-hidden" style={{ visibility: 'hidden' }}>
        {Array.from({ length: BANDS }, (_, i) => (
          <div
            key={i}
            data-band=""
            className="absolute left-[-20vw] w-[140vw] rounded-full will-change-transform"
            style={{
              top: `${(i / BANDS) * 100 - 2}%`,
              height: `${100 / BANDS + 5}%`,
              background: `linear-gradient(90deg, ${BAND_COLORS[i]} 0%, ${BAND_COLORS[(i + 1) % BANDS]} 100%)`,
            }}
          />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            data-wind=""
            className="absolute left-0 h-px w-[40vw] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0"
            style={{ top: `${18 + i * 15}%` }}
          />
        ))}
        <div className="absolute inset-0 grid place-items-center">
          <div className="overflow-hidden text-center">
            <AnimatePresence mode="wait">
              {title && (
                <motion.div key={title} initial={{ y: '110%' }} animate={{ y: '0%' }} exit={{ y: '-110%' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  <p className="hud mb-3 text-white/60">Next waypoint</p>
                  <p className="display text-[clamp(3rem,11vw,10rem)] text-white">{title}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </TransitionCtx.Provider>
  );
}

type TLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & LinkProps & { children: ReactNode };

/** Drop-in <Link> that plays the wind transition for internal routes. */
export function TLink({ href, onClick, children, ...rest }: TLinkProps) {
  const { go } = useTransitionNav();
  const h = typeof href === 'string' ? href : String(href.pathname ?? '/');
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (rest.target === '_blank') return;
        e.preventDefault();
        go(h);
      }}
    >
      {children}
    </Link>
  );
}
