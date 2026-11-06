'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { site } from '@/lib/site';

/**
 * Location card: a radar-style sweep scans while the embedded Google Map loads lazily,
 * then the map fades in under a pulsing pin and a coordinates HUD.
 */
export default function MapCard() {
  const root = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: '200px' });
    io.observe(el);
    if (prefersReduced()) return () => io.disconnect();
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.from(el, { clipPath: 'circle(0% at 70% 40%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        gsap.from('[data-map-info] > *', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.8, delay: 0.6, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      }, el);
    });
    return () => {
      io.disconnect();
      off();
      ctx?.revert();
    };
  }, []);

  const q = encodeURIComponent('Bir Paragliding Landing Site, Bir, Himachal Pradesh');

  return (
    <div ref={root} className="relative h-full min-h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1626]">
      {load && (
        <iframe
          title="Map of Bir, Himachal Pradesh"
          src={`https://www.google.com/maps?q=${q}&z=13&output=embed`}
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 [filter:grayscale(.35)_contrast(1.05)_brightness(.85)] ${ready ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setReady(true)}
        />
      )}
      {/* radar sweep while loading */}
      <div aria-hidden className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative h-72 w-72 rounded-full border border-sky/30">
          <div className="absolute inset-8 rounded-full border border-sky/20" />
          <div className="absolute inset-20 rounded-full border border-sky/20" />
          <div className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(47,124,246,.45)_50deg,transparent_60deg)] [animation-duration:2.4s]" />
        </div>
      </div>
      {/* pin */}
      <div aria-hidden className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
        <span className="absolute left-1/2 top-full h-4 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dawn/40 blur-sm [animation:pulse-ring_2s_ease-out_infinite]" />
        <svg viewBox="0 0 30 40" className="relative h-12 w-9 drop-shadow-[0_8px_16px_rgba(0,0,0,.5)] [animation:float-y_2.4s_ease-in-out_infinite]">
          <path d="M15 39 C 15 39, 1 22, 1 14 A 14 14 0 0 1 29 14 C 29 22, 15 39, 15 39 Z" fill="#ff7a2f" />
          <circle cx="15" cy="14" r="5" fill="#fff" />
        </svg>
      </div>
      <div data-map-info className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-ink/85 p-5 shadow-2xl backdrop-blur-md md:right-auto md:w-80">
        <p className="hud text-dawn">Base</p>
        <p className="mt-1 font-display text-2xl font-bold">Bir, Himachal Pradesh</p>
        <p className="mt-1 text-sm text-white/65">Landing field ~1,400 m · launch at Billing ~2,400 m, 40 min uphill.</p>
        <p className="hud mt-3 text-white/45">
          N {site.geo.lat.toFixed(4)}° · E {site.geo.lng.toFixed(4)}°
        </p>
        <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noreferrer" className="hud mt-3 inline-block text-white underline decoration-dawn underline-offset-4">
          Open in Google Maps ↗
        </a>
      </div>
    </div>
  );
}
