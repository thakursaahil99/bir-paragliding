'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { places } from '@/lib/site';
import { ridgeCrest, ridgePath } from '@/lib/ridge';
import SplitHeading from '../animations/SplitHeading';
import Img from '../animations/Img';

const W = 1000;
const H = 700;
const FULL = `0 0 ${W} ${H}`;
const COLORS: Record<string, string> = { fly: '#ff7a2f', culture: '#ffc56b', food: '#7bd389', camp: '#8ec5ff', trek: '#c3a6ff', travel: '#e8f1ff' };
const GLYPH: Record<string, string> = {
  fly: 'M-7 -1 C -4 -6, 4 -6, 7 -1 L 5.5 0 C 3 -3, -3 -3, -5.5 0 Z M -5.5 0 L 0 6 L 5.5 0',
  culture: 'M-6 5 H6 M-5 5 V-1 H5 V5 M-6.5 -1 L0 -6 L6.5 -1 M-1.5 5 V2 H1.5 V5',
  food: 'M-5 -3 H4 V2 A4 4 0 0 1 -5 2 Z M4 -1 H6 A2 2 0 0 1 4 3',
  camp: 'M-7 5 L0 -6 L7 5 Z M0 -6 V5 M-2 5 L0 1 L2 5',
  trek: 'M-7 5 L-2 -3 L1 1 L3 -2 L7 5 Z',
  travel: 'M-6 -4 H6 V3 H-6 Z M-6 0 H6 M-4 3 V5 M4 3 V5',
};

export default function BirMap() {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [sel, setSel] = useState<string | null>(null);
  const place = places.find((p) => p.id === sel);

  const ridges = useMemo(
    () => [
      ridgePath(5, { w: W, h: 260, base: 0.62, amp: 0.5, peaks: 9, jag: 0.12, steps: 120 }),
      ridgePath(9, { w: W, h: 260, base: 0.8, amp: 0.38, peaks: 6, jag: 0.06, steps: 90 }),
      ridgeCrest(5, { w: W, h: 260, base: 0.62, amp: 0.5, peaks: 9, jag: 0.12, steps: 120 }),
    ],
    []
  );

  // pins drop in with a bounce; flight path dashes forever
  useEffect(() => {
    if (prefersReduced()) return;
    const el = root.current!;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.from('[data-pin]', {
          y: -120,
          opacity: 0,
          duration: 1.2,
          ease: 'bounce.out',
          stagger: { each: 0.09, from: 'random' },
          scrollTrigger: { trigger: svg.current, start: 'top 75%', once: true },
        });
        gsap.from('[data-map-layer]', { opacity: 0, y: 30, duration: 1.2, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: svg.current, start: 'top 85%', once: true } });
        gsap.to('[data-flight-path]', { strokeDashoffset: -200, duration: 6, ease: 'none', repeat: -1 });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  // zoom by tweening the viewBox toward the chosen pin
  useEffect(() => {
    const s = svg.current;
    if (!s) return;
    let vb = FULL;
    if (place) {
      const z = 2.3;
      const w = W / z,
        h = H / z;
      const cx = (place.x / 100) * W,
        cy = (place.y / 100) * H;
      const x = Math.min(Math.max(cx - w / 2, 0), W - w);
      const y = Math.min(Math.max(cy - h / 2, 0), H - h);
      vb = `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
    }
    if (prefersReduced()) s.setAttribute('viewBox', vb);
    else gsap.to(s, { attr: { viewBox: vb }, duration: 1.3, ease: 'expo.inOut' });
  }, [place]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setSel(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const pt = (p: { x: number; y: number }) => ({ x: (p.x / 100) * W, y: (p.y / 100) * H });
  const billing = pt(places[0]);
  const landing = pt(places[1]);

  return (
    <section ref={root} className="relative py-24 md:py-32" aria-labelledby="map-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">The valley, illustrated</p>
            <SplitHeading id="map-title" className="display mt-4 text-[clamp(2.4rem,5.5vw,5rem)]">
              Explore the map
            </SplitHeading>
          </div>
          <p className="max-w-sm text-white/60">Tap a pin to fly in. Press Esc or “Back to valley” to zoom out again.</p>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1d2e]">
          <svg ref={svg} viewBox={FULL} preserveAspectRatio="xMidYMid slice" className="block aspect-[4/5] w-full sm:aspect-[10/7]" role="img" aria-label="Illustrated map of Bir and Billing">
            <defs>
              <linearGradient id="map-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#163a5c" />
                <stop offset="0.45" stopColor="#1d4a3d" />
                <stop offset="1" stopColor="#2f5d34" />
              </linearGradient>
              <pattern id="terrace" width="26" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
                <path d="M0 10 Q 13 4 26 10" fill="none" stroke="rgba(190,220,120,.18)" strokeWidth="1.4" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#map-sky)" />
            <g data-map-layer>
              <path d={ridges[0]} transform="translate(0 -40)" fill="#2c3e57" />
              {/* snow caps */}
              <path d={ridges[2]} transform="translate(0 -40)" fill="none" stroke="#e9f1ff" strokeWidth="3" strokeDasharray="22 40" opacity="0.8" />
            </g>
            <g data-map-layer>
              <path d={ridges[1]} transform="translate(0 40)" fill="#24452f" />
            </g>
            <g data-map-layer>
              <rect x="0" y="330" width={W} height="370" fill="url(#terrace)" />
              {/* river */}
              <path d="M120 300 C 220 380, 160 470, 300 520 S 520 600, 640 640 S 860 690, 1000 660" fill="none" stroke="#5aa9e6" strokeWidth="7" strokeLinecap="round" opacity="0.75" />
              {/* road */}
              <path
                d={`M${billing.x} ${billing.y} C 360 200, 250 260, 330 300 S 430 330, 400 380 S 470 430, ${landing.x} ${landing.y} S 760 560, 880 602`}
                fill="none"
                stroke="rgba(255,255,255,.55)"
                strokeWidth="2.5"
                strokeDasharray="2 8"
                strokeLinecap="round"
              />
              {/* tea gardens + village blobs */}
              <ellipse cx="450" cy="540" rx="60" ry="22" fill="#4f8a3a" opacity="0.6" />
              <ellipse cx="660" cy="500" rx="42" ry="16" fill="#4f8a3a" opacity="0.5" />
              {[...Array(26)].map((_, i) => (
                <rect key={i} x={480 + ((i * 37) % 200)} y={455 + ((i * 53) % 80)} width="7" height="6" fill={i % 4 ? '#e2dccd' : '#c0483c'} opacity="0.85" />
              ))}
            </g>
            {/* flight path Billing → landing */}
            <path
              data-flight-path
              d={`M${billing.x} ${billing.y} C ${billing.x + 160} ${billing.y - 60}, ${landing.x - 220} ${landing.y - 260}, ${landing.x} ${landing.y}`}
              fill="none"
              stroke="#ff7a2f"
              strokeWidth="3"
              strokeDasharray="10 10"
              strokeLinecap="round"
            />
            <text x={W - 24} y="40" textAnchor="end" className="font-mono" fontSize="14" fill="rgba(255,255,255,.6)" letterSpacing="3">
              DHAULADHAR RANGE ↑ N
            </text>

            {places.map((p) => {
              const c = pt(p);
              const active = sel === p.id;
              return (
                <g
                  key={p.id}
                  data-pin
                  transform={`translate(${c.x} ${c.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.name} — ${p.alt}`}
                  aria-pressed={active}
                  onClick={() => setSel(active ? null : p.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(active ? null : p.id))}
                  className="cursor-pointer outline-none [&:focus-visible_circle.ring]:stroke-white"
                  data-cursor="view"
                  data-cursor-text="Fly in"
                >
                  <circle r={active ? 26 : 20} fill={COLORS[p.kind]} opacity="0.18" className="ring" stroke="transparent" strokeWidth="2">
                    <animate attributeName="r" values="18;30;18" dur="2.6s" repeatCount="indefinite" />
                  </circle>
                  <path d="M0 0 C -14 -16, -14 -34, 0 -34 C 14 -34, 14 -16, 0 0 Z" fill={COLORS[p.kind]} stroke="#0a1220" strokeWidth="2" />
                  <g transform="translate(0 -22) scale(0.95)">
                    <path d={GLYPH[p.kind]} fill="none" stroke="#0a1220" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <text y="22" textAnchor="middle" fontSize="15" fill="#fff" className="font-sans" style={{ paintOrder: 'stroke', stroke: 'rgba(6,10,18,.85)', strokeWidth: 4 }}>
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <AnimatePresence>
            {place && (
              <motion.aside
                key={place.id}
                initial={{ opacity: 0, x: 60, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="glass absolute inset-x-3 bottom-3 overflow-hidden rounded-[1.5rem] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-6 sm:w-[360px]"
                aria-live="polite"
              >
                <div className="relative h-40 sm:h-[46%]">
                  <Img src={place.image} alt={place.name} sizes="360px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/90 to-transparent" />
                </div>
                <div className="p-5">
                  <p className="hud" style={{ color: COLORS[place.kind] }}>
                    {place.alt}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold">{place.name}</h3>
                  <p className="mt-2 text-sm text-white/75">{place.text}</p>
                  <button type="button" onClick={() => setSel(null)} className="hud mt-4 rounded-full border border-white/25 px-4 py-2 text-white/80 hover:border-white/70">
                    ← Back to valley
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="Map legend">
          {Object.entries({ fly: 'Flying', culture: 'Culture', food: 'Cafés', camp: 'Camping', trek: 'Treks', travel: 'Travel' }).map(([k, label]) => (
            <li key={k} className="hud flex items-center gap-2 text-white/60">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[k] }} />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
