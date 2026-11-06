'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { useReady } from '@/lib/useReady';
import { meetingPoints, quickTemplates } from '@/lib/extra';
import { site, waLink } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';
import Particles from '../fx/Particles';
import Img from '../animations/Img';
import Magnetic from '../animations/Magnetic';
import { TLink } from '../layout/Transition';

/** Current time in Bir (IST), as hours/minutes/seconds numbers. */
function useIST() {
  const [t, setT] = useState<{ h: number; m: number; s: number; day: number } | null>(null);
  useEffect(() => {
    const read = () => {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hour12: false }).formatToParts(new Date());
      const g = (k: string) => parts.find((p) => p.type === k)?.value ?? '0';
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setT({ h: Number(g('hour')) % 24, m: Number(g('minute')), s: Number(g('second')), day: days.indexOf(g('weekday')) });
    };
    read();
    const id = window.setInterval(read, 1000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}
const OPEN = 9;
const CLOSE = 19;

/* ------------------------------------------------------------------ hero with radio waves */
export function ContactHero() {
  const root = useRef<HTMLElement>(null);
  useReady(root, () => {
    gsap.from('[data-deal]', { y: 200, x: (i) => (i - 1) * -120, rotate: (i) => (i - 1) * 18, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.4 });
  });
  const cards = [
    { k: 'Call / WhatsApp', v: site.phone, href: waLink('Hi Bir Paragliding!') },
    { k: 'Email', v: site.email, href: `mailto:${site.email}` },
    { k: 'Hours', v: site.hours, href: undefined },
  ];
  return (
    <header ref={root} className="relative overflow-hidden pb-14 pt-36 md:pt-44">
      <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[10%] h-[70vmin] w-[70vmin] md:right-[5%]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="absolute inset-0 rounded-full border border-[#25D366]/40" style={{ animation: `pulse-ring 4s cubic-bezier(.2,.6,.3,1) ${i}s infinite` }} />
        ))}
        <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl bg-[#25D366] text-ink shadow-[0_0_60px_10px_rgba(37,211,102,.35)]">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor" aria-hidden>
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
          </svg>
        </span>
      </div>
      <div className="container-x relative">
        <nav aria-label="Breadcrumb" className="hud mb-6 flex items-center gap-2 text-white/60">
          <TLink href="/" className="hover:text-white">
            Home
          </TLink>
          <span aria-hidden>/</span>
          <span className="text-white" aria-current="page">
            Contact
          </span>
        </nav>
        <p className="hud text-dawn">Say hello</p>
        <SplitHeading as="h1" immediate className="display mt-4 max-w-4xl text-[clamp(2.8rem,8vw,8rem)]">
          Let&apos;s plan your flight
        </SplitHeading>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {cards.map((c) =>
            c.href ? (
              <a key={c.k} data-deal href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="glass group rounded-2xl p-5 transition-transform duration-500 hover:-translate-y-1">
                <p className="hud text-white/45">{c.k}</p>
                <p className="mt-2 break-all font-display text-xl font-bold group-hover:text-dawn">{c.v}</p>
              </a>
            ) : (
              <div key={c.k} data-deal className="glass rounded-2xl p-5">
                <p className="hud text-white/45">{c.k}</p>
                <p className="mt-2 font-display text-xl font-bold">{c.v}</p>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ live open-now clock */
export function OpenClock() {
  const t = useIST();
  const h = t ? t.h + t.m / 60 + t.s / 3600 : 12;
  const open = h >= OPEN && h < CLOSE;
  const until = open ? CLOSE - h : (h < OPEN ? OPEN - h : 24 - h + OPEN);
  const night = h < 6 || h >= 19.5;
  const sky = night ? 'linear-gradient(180deg,#02050f,#14234a)' : h < 9 ? 'linear-gradient(180deg,#1b326b,#ff9f68)' : h < 16.5 ? 'linear-gradient(180deg,#0f56d4,#8fc5ff)' : 'linear-gradient(180deg,#26306c,#ffad5a)';
  const arc = (a0: number, a1: number) => {
    const r = 46;
    const p = (a: number) => [50 + r * Math.sin(a), 50 - r * Math.cos(a)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`;
  };
  const hourA = ((h % 12) / 12) * Math.PI * 2;
  const ang = (x: number) => ((x % 12) / 12) * Math.PI * 2;
  return (
    <section className="relative overflow-hidden py-24 transition-[background] duration-1000 md:py-32" style={{ background: sky }} aria-labelledby="clock-title">
      {night && <Particles mode="stars" color="#e8f1ff" intensity={1} />}
      <div className="container-x relative grid items-center gap-12 md:grid-cols-2">
        <div className="relative mx-auto aspect-square w-[min(80vw,420px)]">
          <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
            <circle cx="50" cy="50" r="49" fill="rgba(6,10,18,.55)" stroke="rgba(255,255,255,.2)" strokeWidth="0.6" />
            <path d={arc(ang(OPEN), ang(OPEN) + ((CLOSE - OPEN) / 12) * Math.PI * 2 - Math.PI * 2 * (CLOSE - OPEN > 12 ? 1 : 0))} fill="none" stroke="#7bd389" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="50" y1="6" x2="50" y2={i % 3 ? 9 : 11} stroke="#fff" strokeWidth={i % 3 ? 0.5 : 1} transform={`rotate(${i * 30} 50 50)`} opacity="0.7" />
            ))}
            <line x1="50" y1="50" x2="50" y2="26" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${(hourA * 180) / Math.PI} 50 50)`} />
            <line x1="50" y1="50" x2="50" y2="16" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" transform={`rotate(${((t?.m ?? 0) / 60) * 360} 50 50)`} />
            <line x1="50" y1="54" x2="50" y2="12" stroke="#ff7a2f" strokeWidth="0.6" strokeLinecap="round" transform={`rotate(${((t?.s ?? 0) / 60) * 360} 50 50)`} style={{ transition: 'transform .3s cubic-bezier(.4,2.2,.6,1)' }} />
            <circle cx="50" cy="50" r="2" fill="#ff7a2f" />
          </svg>
        </div>
        <div>
          <p className="hud text-white/80">Live · Bir time (IST)</p>
          <SplitHeading id="clock-title" className="display mt-3 text-[clamp(2.2rem,5vw,4.6rem)]">
            Are we around right now?
          </SplitHeading>
          <p className="mt-6 font-mono text-5xl tabular-nums">{t ? `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}:${String(t.s).padStart(2, '0')}` : '--:--:--'}</p>
          <p className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${open ? 'bg-leaf/20 text-leaf' : 'bg-black/30 text-white/80'}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${open ? 'animate-pulse bg-leaf' : 'bg-white/50'}`} />
            {open ? `Open now — closes in ${Math.floor(until)}h ${Math.round((until % 1) * 60)}m` : `Closed — opens in ${Math.floor(until)}h ${Math.round((until % 1) * 60)}m`}
          </p>
          <p className="mt-4 max-w-md text-white/75">WhatsApp messages sent after hours are answered the next morning.</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ meeting points with venetian blinds */
const SLATS = 8;
export function MeetingPoints() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    el.querySelectorAll<HTMLElement>('[data-mp]').forEach((card, i) => {
      gsap.fromTo(card.querySelectorAll('[data-slat]'), { rotateX: 90 }, { rotateX: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: i * 0.15, scrollTrigger: { trigger: card, start: 'top 80%', once: true } });
    });
  });
  return (
    <section ref={root} className="relative py-24 md:py-32" aria-labelledby="mp-title">
      <div className="container-x">
        <p className="hud text-dawn">Where we meet</p>
        <SplitHeading id="mp-title" className="display mt-4 max-w-3xl text-[clamp(2.2rem,5vw,4.6rem)]">
          Three places you’ll know us by
        </SplitHeading>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {meetingPoints.map((m) => (
            <article key={m.title} data-mp>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] [perspective:900px]">
                {Array.from({ length: SLATS }, (_, s) => (
                  <div key={s} data-slat className="absolute inset-x-0 origin-top overflow-hidden" style={{ top: `${(s / SLATS) * 100}%`, height: `${100 / SLATS + 0.5}%` }}>
                    <div className="absolute inset-x-0" style={{ top: `-${s * 100}%`, height: `${SLATS * 100}%` }}>
                      <Img src={m.image} alt={s === 0 ? m.title : ''} sizes="(min-width: 768px) 33vw, 100vw" />
                    </div>
                  </div>
                ))}
                <span className="hud absolute left-4 top-4 z-10 rounded-full bg-ink/60 px-3 py-1.5 backdrop-blur">{m.alt}</span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold">{m.title}</h3>
              <p className="mt-2 text-white/65">{m.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ route metro map */
const NODES: Record<string, [number, number]> = { Delhi: [80, 330], Chandigarh: [330, 220], Pathankot: [300, 70], Gaggal: [560, 80], Mandi: [700, 300], Baijnath: [800, 170], Bir: [900, 120] };
const LINES = [
  { id: 'bus', label: 'Overnight Volvo', color: '#ff7a2f', path: ['Delhi', 'Chandigarh', 'Mandi', 'Baijnath', 'Bir'], icon: 'M-7 -4 H7 V3 H-7 Z M-4 3 V5 M4 3 V5', dur: 9 },
  { id: 'train', label: 'Train + taxi via Pathankot', color: '#2f7cf6', path: ['Delhi', 'Pathankot', 'Gaggal', 'Baijnath', 'Bir'], icon: 'M-6 -5 H6 V3 H-6 Z M-4 3 L-6 6 M4 3 L6 6', dur: 11 },
  { id: 'air', label: 'Fly to Gaggal + taxi', color: '#7bd389', path: ['Delhi', 'Gaggal', 'Bir'], icon: 'M-8 0 L8 0 M2 -6 L6 0 L2 6', dur: 6 },
];
const lineD = (path: string[]) => path.map((n, i) => `${i ? 'L' : 'M'}${NODES[n][0]},${NODES[n][1]}`).join(' ');
export function RouteMap() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    el.querySelectorAll<SVGPathElement>('[data-route]').forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: `${len}`, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, delay: i * 0.25, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 65%', once: true } });
    });
    gsap.from('[data-node]', { scale: 0, duration: 0.6, ease: 'back.out(3)', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 65%', once: true } });
  });
  return (
    <section ref={root} className="relative overflow-hidden bg-night py-24 md:py-32" aria-labelledby="route-title">
      <div className="container-x">
        <p className="hud text-dawn">Getting to us</p>
        <SplitHeading id="route-title" className="display mt-4 max-w-3xl text-[clamp(2.2rem,5vw,4.6rem)]">
          All lines lead to Bir
        </SplitHeading>
        <div className="no-scrollbar mt-10 overflow-x-auto" data-lenis-prevent>
          <svg viewBox="0 0 980 400" className="min-w-[680px] w-full" role="img" aria-label="Stylised route map: Delhi to Bir by overnight bus via Chandigarh and Mandi, by train via Pathankot, or by air to Gaggal">
            {LINES.map((l) => (
              <g key={l.id}>
                <path d={lineD(l.path)} fill="none" stroke={l.color} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" opacity="0.18" />
                <path data-route d={lineD(l.path)} fill="none" stroke={l.color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                <path id={`r-${l.id}`} d={lineD(l.path)} fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="2 14" className="[animation:dashflow_1.2s_linear_infinite]" opacity="0.6" />
                {(
                  <g>
                    <circle r="12" fill={l.color} />
                    <path d={l.icon} fill="none" stroke="#060a12" strokeWidth="1.8" strokeLinecap="round" />
                    <animateMotion dur={`${l.dur}s`} repeatCount="indefinite" rotate="auto">
                      <mpath href={`#r-${l.id}`} />
                    </animateMotion>
                  </g>
                )}
              </g>
            ))}
            {Object.entries(NODES).map(([n, [x, y]]) => (
              <g key={n} data-node transform={`translate(${x} ${y})`}>
                <circle r={n === 'Bir' ? 14 : 9} fill="#060a12" stroke={n === 'Bir' ? '#ffc56b' : '#fff'} strokeWidth="4" />
                <text y={n === 'Bir' ? -24 : -18} textAnchor="middle" fontSize={n === 'Bir' ? 20 : 15} fill="#fff" className="font-display" fontWeight="700">
                  {n}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {LINES.map((l) => (
            <li key={l.id} className="flex items-center gap-3 text-white/75">
              <span className="h-1.5 w-8 rounded-full" style={{ background: l.color }} />
              {l.label}
            </li>
          ))}
        </ul>
      </div>
      <style>{`@keyframes dashflow{to{stroke-dashoffset:-32}}`}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ quick message chips */
export function QuickChips() {
  const [text, setText] = useState('');
  const [target, setTarget] = useState('');
  const [sent, setSent] = useState(false);
  const plane = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!target) return;
    if (prefersReduced()) return setText(target);
    setText('');
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setText(target.slice(0, i));
      if (i >= target.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [target]);
  const send = () => {
    if (!text) return;
    window.open(waLink(text), '_blank', 'noopener,noreferrer');
    setSent(true);
    if (plane.current && !prefersReduced()) gsap.fromTo(plane.current, { x: 0, y: 0, rotate: 0, opacity: 1 }, { x: 260, y: -220, rotate: -20, opacity: 0, duration: 1.1, ease: 'power2.in' });
  };
  return (
    <section className="relative overflow-hidden py-24 md:py-32" aria-labelledby="chips-title">
      <div className="container-x grid items-center gap-12 md:grid-cols-2">
        <div>
          <p className="hud text-dawn">In a hurry?</p>
          <SplitHeading id="chips-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
            Tap a question, we’ll type it
          </SplitHeading>
          <div className="mt-8 flex flex-wrap gap-3">
            {quickTemplates.map((q) => (
              <button key={q} type="button" onClick={() => (setSent(false), setTarget(q))} className={`rounded-full border px-4 py-2.5 text-sm transition-all duration-300 hover:-translate-y-0.5 ${target === q ? 'border-dawn bg-dawn text-ink' : 'border-white/20 hover:border-white/60'}`}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0b141a] p-5 shadow-2xl">
          <p className="hud text-white/40">To: Bir Paragliding · WhatsApp</p>
          <div className="mt-4 min-h-[120px] rounded-2xl bg-[#1f2c33] p-4 text-lg">
            {text || <span className="text-white/30">Pick a question on the left…</span>}
            {target && text.length < target.length && <span className="ml-0.5 inline-block h-5 w-2 translate-y-1 animate-pulse bg-[#25D366]" />}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-white/40">{sent ? 'Opened in WhatsApp ✓' : `${text.length} characters`}</span>
            <button type="button" onClick={send} disabled={!text} className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-ink disabled:opacity-40" aria-label="Send on WhatsApp">
              <svg ref={plane} viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ week hours with live playhead */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export function WeekHours() {
  const t = useIST();
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap.from('[data-hours]', { scaleX: 0, transformOrigin: '0% 50%', duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
  });
  const nowPct = t ? ((t.h + t.m / 60) / 24) * 100 : -10;
  return (
    <section ref={root} className="relative bg-night py-24 md:py-32" aria-labelledby="week-title">
      <div className="container-x">
        <p className="hud text-dawn">Every day of the season</p>
        <SplitHeading id="week-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
          9 to 7, all week
        </SplitHeading>
        <div className="mt-12 space-y-3">
          <div className="hud ml-14 flex justify-between text-white/35">
            {['00', '06', '12', '18', '24'].map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {DAYS.map((d, i) => {
            const today = t?.day === i;
            return (
              <div key={d} className="flex items-center gap-4">
                <span className={`w-10 font-mono text-sm ${today ? 'text-dawn' : 'text-white/50'}`}>{d}</span>
                <div className="relative h-8 flex-1 rounded-full bg-white/5">
                  <div data-hours className={`absolute inset-y-0 rounded-full ${today ? 'bg-gradient-to-r from-sun to-dawn' : 'bg-white/15'}`} style={{ left: `${+((OPEN / 24) * 100).toFixed(3)}%`, width: `${+(((CLOSE - OPEN) / 24) * 100).toFixed(3)}%` }} />
                  {today && (
                    <span className="absolute inset-y-[-6px] w-0.5 bg-white shadow-[0_0_12px_2px_rgba(255,255,255,.8)] transition-[left] duration-1000" style={{ left: `${nowPct}%` }}>
                      <span className="hud absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] text-white">now</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="hud mt-6 text-white/40">Times in IST · flying itself depends on the season and the weather</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ paper-plane CTA */
const FLIGHT = 'M -40 260 C 160 60, 360 380, 560 200 S 900 40, 1100 180 S 1300 320, 1480 120';
export function PaperPlaneCTA() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    const path = el.querySelector<SVGPathElement>('[data-fp]')!;
    const trail = el.querySelector<SVGPathElement>('[data-trail]')!;
    const plane = el.querySelector<SVGGElement>('[data-plane]')!;
    const len = path.getTotalLength();
    trail.style.strokeDasharray = `${len}`;
    const st = { p: 0 };
    gsap.to(st, {
      p: 1,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 30%', scrub: 0.8 },
      onUpdate: () => {
        const a = path.getPointAtLength(st.p * len);
        const b = path.getPointAtLength(Math.min(len, st.p * len + 2));
        plane.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI})`);
        trail.style.strokeDashoffset = `${len * (1 - st.p)}`;
      },
    });
  });
  return (
    <section ref={root} className="relative overflow-hidden bg-[linear-gradient(180deg,#060a12,#122347)] py-28 md:py-40" aria-labelledby="pp-title">
      <svg aria-hidden viewBox="0 0 1440 400" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-10 h-[60%] w-full">
        <path data-fp d={FLIGHT} fill="none" stroke="transparent" />
        <path data-trail d={FLIGHT} fill="none" stroke="rgba(255,197,107,.6)" strokeWidth="2" strokeDasharray="6 10" />
        <g data-plane>
          <path d="M-18 -10 L22 0 L-18 10 L-10 0 Z" fill="#f4f7fb" />
          <path d="M-10 0 L22 0" stroke="#9fb2c8" strokeWidth="1" />
        </g>
      </svg>
      <div className="container-x relative text-center">
        <p className="hud text-dawn">Last stop</p>
        <SplitHeading id="pp-title" className="display mx-auto mt-4 max-w-4xl text-[clamp(2.4rem,6vw,5.6rem)]">
          Send it our way
        </SplitHeading>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <a href={waLink('Hi Bir Paragliding!')} target="_blank" rel="noreferrer" data-cursor="book" className="inline-block rounded-full bg-gradient-to-r from-dawn to-ember px-7 py-3.5 font-semibold text-ink">
              <span data-magnetic-inner className="block">
                WhatsApp us ↗
              </span>
            </a>
          </Magnetic>
          <a href={`mailto:${site.email}`} className="rounded-full border border-white/25 px-7 py-3.5">
            {site.email}
          </a>
        </div>
      </div>
    </section>
  );
}
