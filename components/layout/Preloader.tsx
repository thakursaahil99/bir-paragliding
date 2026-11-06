'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import { lenisRef, markLoaded } from '@/lib/store';

const PATH = 'M -40 300 C 160 120, 320 360, 520 210 S 860 80, 1040 230 S 1300 330, 1480 120';

/**
 * Preloader: a paraglider flies a curving track, drawing its own trail, while the
 * altimeter climbs 0 m → 2,400 m. Then the two cloud banks part to reveal the page.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const finish = () => {
      markLoaded();
      lenisRef.current?.start();
      setDone(true);
      try {
        sessionStorage.setItem('bir-seen', '1');
      } catch {
        /* private mode */
      }
    };
    let seen = false;
    try {
      seen = sessionStorage.getItem('bir-seen') === '1';
    } catch {
      /* private mode */
    }
    if (prefersReduced()) {
      gsap.to(el, { autoAlpha: 0, duration: 0.3, onComplete: finish });
      return;
    }
    // make sure Lenis exists before stopping it (SmoothScroll mounts in the same pass)
    const stopper = requestAnimationFrame(() => lenisRef.current?.stop());

    const path = el.querySelector<SVGPathElement>('#pl-path')!;
    const trail = el.querySelector<SVGPathElement>('#pl-trail')!;
    const glider = el.querySelector<SVGGElement>('#pl-glider')!;
    const counter = el.querySelector<HTMLElement>('#pl-count')!;
    const bar = el.querySelector<HTMLElement>('#pl-bar')!;
    const len = path.getTotalLength();
    trail.style.strokeDasharray = `${len}`;
    trail.style.strokeDashoffset = `${len}`;

    // only the type has to be ready — images stream in behind the clouds (never wait on window.load)
    const ready = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2600))]);

    // returning in the same session: skip the flight, just part the clouds
    if (seen) {
      const quick = gsap.context(() => {
        gsap.set(['[data-pl-fade]', '#pl-svg'], { autoAlpha: 0 });
        gsap
          .timeline({ delay: 0.15 })
          .to('#pl-top', { yPercent: -102, duration: 0.75, ease: 'expo.inOut' }, 0)
          .to('#pl-bot', { yPercent: 102, duration: 0.75, ease: 'expo.inOut' }, 0)
          .to('#pl-mist', { autoAlpha: 0, duration: 0.6 }, 0)
          .add(() => {
            markLoaded();
            requestAnimationFrame(() => ScrollTrigger.refresh());
          }, 0.3)
          .add(finish);
      }, el);
      return () => {
        cancelAnimationFrame(stopper);
        quick.revert();
      };
    }

    const state = { p: 0 };
    const place = () => {
      const l = state.p * len;
      const pt = path.getPointAtLength(l);
      const pt2 = path.getPointAtLength(Math.min(len, l + 2));
      const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
      glider.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang * 0.35})`);
      trail.style.strokeDashoffset = `${len - l}`;
      counter.textContent = String(Math.round(state.p * 2400)).padStart(4, '0');
      bar.style.transform = `scaleX(${state.p})`;
    };
    place();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from('[data-pl-fade]', { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.06, ease: 'power3.out' })
        .to(state, { p: 0.86, duration: 1.3, ease: 'power2.inOut', onUpdate: place }, 0.1)
        .add(() => {
          tl.pause();
          ready.then(() => tl.resume());
        })
        .to(state, { p: 1, duration: 0.4, ease: 'power2.out', onUpdate: place })
        .to('[data-pl-fade]', { autoAlpha: 0, y: -10, duration: 0.3, stagger: 0.03 }, '+=0.05')
        .to('#pl-svg', { autoAlpha: 0, scale: 1.08, duration: 0.35 }, '<')
        .addLabel('part')
        .to('#pl-top', { yPercent: -102, duration: 1, ease: 'expo.inOut' }, 'part')
        .to('#pl-bot', { yPercent: 102, duration: 1, ease: 'expo.inOut' }, 'part')
        .to('#pl-mist', { autoAlpha: 0, scale: 1.6, duration: 0.9, ease: 'power2.out' }, 'part+=0.05')
        .add(() => {
          markLoaded();
          requestAnimationFrame(() => ScrollTrigger.refresh());
        }, 'part+=0.35')
        .add(finish);
    }, el);

    return () => {
      cancelAnimationFrame(stopper);
      ctx.revert();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} id="preloader" className="fixed inset-0 z-[95] overflow-hidden" aria-live="polite" aria-label="Loading">
      {/* two cloud banks that part */}
      <div id="pl-top" className="absolute inset-x-0 top-0 h-[52%] bg-night">
        <svg className="absolute -bottom-[38px] left-0 h-10 w-full text-night" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 0h1440v8c-40 18-80 28-120 14s-70-30-120-10-90 34-140 16-80-30-130-10-90 30-140 12-90-28-140-6-80 30-130 14-80-28-130-10-90 30-140 14S80 6 0 18z" />
        </svg>
      </div>
      <div id="pl-bot" className="absolute inset-x-0 bottom-0 h-[52%] bg-night">
        <svg className="absolute -top-[38px] left-0 h-10 w-full rotate-180 text-night" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 0h1440v10c-60 16-100 24-150 8s-80-26-130-8-90 30-140 14-80-30-130-12-90 28-140 12-80-26-130-6-90 30-140 12-80-24-130-8S90 22 0 10z" />
        </svg>
      </div>
      <div id="pl-mist" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(255,154,77,0.18),transparent_70%)]" />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <svg id="pl-svg" viewBox="0 0 1440 420" className="w-[140vw] max-w-none md:w-full" aria-hidden>
          <defs>
            <linearGradient id="pl-grad" x1="0" x2="1">
              <stop offset="0%" stopColor="#2f7cf6" stopOpacity="0" />
              <stop offset="40%" stopColor="#8ec5ff" />
              <stop offset="100%" stopColor="#ff7a2f" />
            </linearGradient>
          </defs>
          <path id="pl-path" d={PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 10" />
          <path id="pl-trail" d={PATH} fill="none" stroke="url(#pl-grad)" strokeWidth="2.5" strokeLinecap="round" />
          <g id="pl-glider">
            <g transform="translate(-26 -40)">
              <path d="M2 14 C 14 0, 38 0, 50 14 L 46 17 C 36 8, 16 8, 6 17 Z" fill="#ff7a2f" />
              <path d="M6 17 L 24 40 M 46 17 L 28 40 M 16 11 L 25 40 M 36 11 L 27 40" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
              <circle cx="26" cy="42" r="3.2" fill="#f4f7fb" />
            </g>
          </g>
        </svg>
        <div className="mt-2 text-center">
          <p data-pl-fade className="hud text-white/50">Altitude · Billing take-off</p>
          <p data-pl-fade className="mt-2 font-mono text-[clamp(3rem,9vw,7rem)] font-medium leading-none tracking-tight text-white tabular-nums">
            <span id="pl-count">0000</span>
            <span className="text-dawn">m</span>
          </p>
          <div data-pl-fade className="mx-auto mt-5 h-px w-48 overflow-hidden bg-white/10">
            <div id="pl-bar" className="h-full origin-left bg-gradient-to-r from-sky to-dawn" style={{ transform: 'scaleX(0)' }} />
          </div>
          <p data-pl-fade className="hud mt-4 text-white/40">Bir Paragliding · Bir Billing, Himachal</p>
        </div>
      </div>
    </div>
  );
}
