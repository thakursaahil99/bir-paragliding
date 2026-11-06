'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { itinerary, stays, triund } from '@/lib/extra';
import Img from '../animations/Img';
import SplitHeading from '../animations/SplitHeading';
import Particles from '../fx/Particles';

const lerpColor = gsap.utils.interpolate;

/* ------------------------------------------------------------------ day-cycle itinerary */
export function DayCycle() {
  const root = useRef<HTMLElement>(null);
  const [day, setDay] = useState(0);
  const [phase, setPhase] = useState(0); // 0..1 within the day
  const [night, setNight] = useState(0);

  useEffect(() => {
    const el = root.current!;
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '+=330%',
            pin: true,
            scrub: 0.5,
            onUpdate: (self) => {
              const p = self.progress * itinerary.length;
              const d = Math.min(itinerary.length - 1, Math.floor(p));
              const f = Math.min(1, p - d);
              setDay(d);
              setPhase(f);
              setNight(Math.max(0, (f - 0.78) / 0.22));
            },
          },
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  const it = itinerary[day];
  // sky: dawn → day → dusk → night
  const sky = (() => {
    const stops = ['#f6a46a', '#4f9dff', '#ff8a4c', '#070d1f'];
    const tops = ['#28417f', '#0f56d4', '#3a2f6b', '#02050f'];
    const seg = Math.min(2.999, phase * 3);
    const i = Math.floor(seg);
    const k = seg - i;
    return { bottom: lerpColor(stops[i], stops[i + 1], k) as string, top: lerpColor(tops[i], tops[i + 1], k) as string };
  })();
  const angle = Math.PI * (1 - phase); // sun from left to right
  const sunX = 50 + Math.cos(angle) * 40;
  const sunY = 78 - Math.sin(angle) * 58;
  const activeSlot = Math.min(it.slots.length - 1, Math.floor(phase * it.slots.length));
  const clock = (() => {
    const mins = 6 * 60 + phase * 15 * 60;
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(Math.floor(mins % 60)).padStart(2, '0')}`;
  })();

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden" style={{ background: `linear-gradient(180deg, ${sky.top}, ${sky.bottom})` }} aria-label="A three-day Bir itinerary">
      <div className="absolute inset-0" style={{ opacity: night }}>
        <Particles mode="stars" color="#e8f1ff" intensity={1} />
      </div>
      {/* sun / moon */}
      <div
        aria-hidden
        className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full md:h-32 md:w-32"
        style={{
          left: `${+sunX.toFixed(3)}%`,
          top: `${+sunY.toFixed(3)}%`,
          background: night > 0.5 ? 'radial-gradient(circle at 35% 35%, #fff, #cfd8ea 60%, #9aa7c0)' : 'radial-gradient(circle, #fff7d6, #ffc56b 55%, rgba(255,140,60,0) 72%)',
          boxShadow: night > 0.5 ? '0 0 60px 10px rgba(200,220,255,.35)' : '0 0 120px 40px rgba(255,190,110,.45)',
        }}
      />
      {/* arc */}
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M10 78 A 40 58 0 0 1 90 78" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="0.15" strokeDasharray="0.6 1" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* hills */}
      <svg aria-hidden viewBox="0 0 1440 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full">
        <path d="M0 300 L0 170 C 180 90 300 150 420 120 S 700 40 860 110 S 1180 60 1440 130 L1440 300 Z" fill={lerpColor('#1d3a2c', '#03060c', night) as string} />
        <path d="M0 300 L0 230 C 240 170 420 230 640 200 S 1040 160 1440 220 L1440 300 Z" fill={lerpColor('#14261d', '#010205', night) as string} />
      </svg>

      <div className="container-x relative z-10 grid h-full content-center gap-8 pt-20 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="hud text-white/80">Three days in Bir · scroll the clock</p>
          <div className="mt-4 flex items-end gap-5">
            <span className="display text-[clamp(4rem,12vw,10rem)] leading-[0.8] text-white">{String(day + 1).padStart(2, '0')}</span>
            <span className="pb-2">
              <span className="hud block text-white/70">{it.day}</span>
              <span className="font-display text-2xl font-bold md:text-3xl">{it.title}</span>
            </span>
          </div>
          <p className="mt-6 font-mono text-5xl tabular-nums text-white/90 md:text-6xl">{clock}</p>
        </div>
        <ol className="space-y-3 md:col-span-5 md:col-start-8">
          {it.slots.map((s, i) => (
            <li
              key={`${day}-${s.t}`}
              className={`flex gap-4 rounded-2xl border px-5 py-4 backdrop-blur-md transition-all duration-500 ${
                i === activeSlot ? 'scale-[1.03] border-white/50 bg-white/20' : i < activeSlot ? 'border-white/10 bg-black/10 opacity-60' : 'border-white/10 bg-black/20'
              }`}
            >
              <span className="font-mono text-sm text-white/80">{s.t}</span>
              <span className="text-white">{s.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Triund elevation profile */
const W = 1000;
const H = 360;
const PAD = 30;
const minM = 2000;
const maxM = 2900;
const xOf = (km: number) => PAD + (km / 9) * (W - PAD * 2);
const yOf = (m: number) => H - PAD - ((m - minM) / (maxM - minM)) * (H - PAD * 2);
const PROFILE = (() => {
  const pts = triund.map((p) => [xOf(p.km), yOf(p.m)]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
})();
const TREK_IMG = ['/images/trek-stream.webp', '/images/trek-triund-evening.webp', '/images/camp-triund.webp', '/images/trek-cloud-sea.webp', '/images/triund-night.webp'];

export function TrekProfile() {
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = root.current!;
    const path = el.querySelector<SVGPathElement>('[data-profile]')!;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    const dot = el.querySelector<SVGGElement>('[data-hiker]')!;
    const fill = el.querySelector<SVGPathElement>('[data-fill]')!;
    const place = (v: number) => {
      const pt = path.getPointAtLength(v * len);
      dot.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      path.style.strokeDashoffset = `${len * (1 - v)}`;
      fill.style.clipPath = `inset(0 ${100 - v * 100}% 0 0)`;
    };
    place(prefersReduced() ? 1 : 0);
    if (prefersReduced()) return setP(1);
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '+=240%',
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              place(self.progress);
              setP(self.progress);
            },
          },
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  const km = p * 9;
  const seg = triund.findIndex((t, i) => i === triund.length - 1 || km < triund[i + 1].km);
  const a = triund[Math.max(0, seg)];
  const b = triund[Math.min(triund.length - 1, seg + 1)];
  const k = b.km === a.km ? 0 : Math.min(1, Math.max(0, (km - a.km) / (b.km - a.km)));
  const alt = Math.round(a.m + (b.m - a.m) * k);
  const cooler = ((alt - triund[0].m) * 0.0065).toFixed(1);
  const imgIdx = Math.min(TREK_IMG.length - 1, Math.floor(p * TREK_IMG.length));

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-night" aria-labelledby="trek-title">
      {TREK_IMG.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === imgIdx ? 0.45 : 0 }}>
          <Img src={src} alt="" sizes="100vw" className="scale-105" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/40 to-ink/90" />
      <div className="absolute inset-0" style={{ opacity: 0.25 + p * 0.75 }}>
        <Particles mode="dust" color="#dfe8f5" intensity={0.6 + p * 1.4} />
      </div>
      <div className="container-x relative z-10 flex h-full flex-col justify-center pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="hud text-dawn">Day hike · near Dharamshala</p>
            <SplitHeading id="trek-title" className="display mt-3 text-[clamp(2.2rem,5vw,4.6rem)]">
              Climb to Triund
            </SplitHeading>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-sm md:gap-4">
            {[
              ['Distance', `${km.toFixed(1)} km`],
              ['Altitude', `~${alt.toLocaleString('en-IN')} m`],
              ['Air', `−${cooler}°C`],
            ].map(([kk, v]) => (
              <div key={kk} className="glass rounded-xl px-3 py-2 md:px-4 md:py-3">
                <p className="hud text-white/50">{kk}</p>
                <p className="mt-1 text-lg tabular-nums md:text-2xl">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-8 w-full overflow-visible" aria-label="Elevation profile of the Triund trail, about 9 km from roughly 2,080 m to 2,850 m">
          {[2200, 2400, 2600, 2800].map((m) => (
            <g key={m}>
              <line x1={PAD} x2={W - PAD} y1={yOf(m)} y2={yOf(m)} stroke="rgba(255,255,255,.08)" />
              <text x={PAD} y={yOf(m) - 6} fontSize="12" fill="rgba(255,255,255,.4)" className="font-mono">
                {m} m
              </text>
            </g>
          ))}
          <path data-fill d={`${PROFILE} L${xOf(9)},${H - PAD} L${xOf(0)},${H - PAD} Z`} fill="url(#trek-grad)" opacity="0.5" />
          <defs>
            <linearGradient id="trek-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffc56b" stopOpacity="0.7" />
              <stop offset="1" stopColor="#ff7a2f" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={PROFILE} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="2" strokeDasharray="4 8" />
          <path data-profile d={PROFILE} fill="none" stroke="#ffc56b" strokeWidth="3.5" strokeLinecap="round" />
          {triund.map((t) => (
            <g key={t.label} transform={`translate(${xOf(t.km)} ${yOf(t.m)})`}>
              <circle r="5" fill={km >= t.km - 0.05 ? '#ff7a2f' : '#0a1220'} stroke="#ffc56b" strokeWidth="2" />
              <text y="-14" textAnchor="middle" fontSize="13" fill={km >= t.km - 0.05 ? '#fff' : 'rgba(255,255,255,.45)'} className="font-sans">
                {t.label}
              </text>
            </g>
          ))}
          <g data-hiker>
            <circle r="11" fill="#ff7a2f" opacity="0.25">
              <animate attributeName="r" values="9;16;9" dur="1.6s" repeatCount="indefinite" />
            </circle>
            <circle r="6" fill="#fff" />
          </g>
        </svg>
        <p className="hud mt-4 text-white/45">Approximate figures · air cools ~6.5 °C per 1,000 m of climb</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ stays with curtain reveals */
export function StaysCurtain() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const el = root.current!;
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: `+=${stays.length * 70}%`,
            pin: true,
            scrub: 0.4,
            onUpdate: (self) => setI(Math.min(stays.length - 1, Math.floor(self.progress * stays.length))),
          },
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    if (prev.current === i || prefersReduced()) return;
    const el = root.current!;
    const layer = el.querySelectorAll<HTMLElement>('[data-stay]')[i];
    el.querySelectorAll<HTMLElement>('[data-stay]').forEach((l, k) => (l.style.zIndex = k === i ? '3' : k === prev.current ? '2' : '1'));
    const left = layer.querySelector('[data-curtain="l"]');
    const right = layer.querySelector('[data-curtain="r"]');
    gsap.fromTo([left, right], { xPercent: 0 }, { xPercent: (k) => (k === 0 ? -101 : 101), duration: 1.2, ease: 'expo.inOut' });
    gsap.fromTo(layer.querySelector('[data-stay-img]'), { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' });
    gsap.fromTo(el.querySelectorAll('[data-stay-copy] > *'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.7, ease: 'expo.out' });
    prev.current = i;
  }, [i]);

  const s = stays[i];
  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-ink" aria-labelledby="stays-title">
      <div className="container-x grid h-full grid-rows-[auto_1fr] gap-6 pb-8 pt-24 md:grid-cols-12 md:grid-rows-1 md:items-center md:pt-0">
        <div className="md:col-span-5">
          <p className="hud text-dawn">Where to sleep</p>
          <SplitHeading id="stays-title" className="display mt-3 text-[clamp(2.2rem,4.6vw,4.4rem)]">
            Stays near the landing
          </SplitHeading>
          <div data-stay-copy className="mt-8">
            <p className="font-mono text-sm text-white/50">
              0{i + 1} / 0{stays.length}
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold">{s.title}</h3>
            <p className="mt-3 max-w-sm text-white/70">{s.text}</p>
          </div>
          <div className="mt-8 flex gap-2">
            {stays.map((_, k) => (
              <span key={k} className={`h-1 rounded-full transition-all duration-500 ${k === i ? 'w-10 bg-dawn' : 'w-4 bg-white/25'}`} />
            ))}
          </div>
        </div>
        <div className="relative min-h-0 overflow-hidden rounded-[2rem] md:col-span-7 md:h-[72vh]">
          {stays.map((st, k) => (
            <div key={st.title} data-stay className="absolute inset-0" style={{ zIndex: k === 0 ? 3 : 1 }}>
              <div data-stay-img className="absolute inset-0">
                <Img src={st.image} alt={st.title} sizes="(min-width: 768px) 58vw, 100vw" />
              </div>
              {k !== 0 && (
                <>
                  <div data-curtain="l" className="absolute inset-y-0 left-0 w-1/2 bg-[repeating-linear-gradient(90deg,#3a1f2a_0_18px,#2a1520_18px_36px)] shadow-[inset_-30px_0_40px_rgba(0,0,0,.5)]" />
                  <div data-curtain="r" className="absolute inset-y-0 right-0 w-1/2 bg-[repeating-linear-gradient(90deg,#2a1520_0_18px,#3a1f2a_18px_36px)] shadow-[inset_30px_0_40px_rgba(0,0,0,.5)]" />
                </>
              )}
            </div>
          ))}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-[linear-gradient(#8a5a3b,#5a3a26)] shadow-lg" aria-hidden />
        </div>
      </div>
    </section>
  );
}
