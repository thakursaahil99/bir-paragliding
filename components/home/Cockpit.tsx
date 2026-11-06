'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import Img from '@/components/animations/Img';
import SplitHeading from '@/components/animations/SplitHeading';

const FACTS = [
  { k: 'Launch', v: '2,400 m' },
  { k: 'Landing', v: '1,400 m' },
  { k: 'Vertical drop', v: '1,000 m' },
  { k: 'Flyable days', v: '200+ / yr' },
  { k: 'Longest tandem', v: '50 min' },
  { k: 'World Cup host', v: '2015' },
];

function Dial({ children, label, value }: { children: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative aspect-square w-full max-w-[200px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#2a3346,#0b0f17_70%)] p-2 shadow-[inset_0_2px_6px_rgba(255,255,255,.08),0_20px_40px_-15px_rgba(0,0,0,.9)] ring-4 ring-[#1a202c]">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          {children}
        </svg>
        <div className="pointer-events-none absolute inset-2 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,.12),transparent_45%)]" />
      </div>
      <p className="font-mono text-sm tabular-nums text-white">{value}</p>
      <p className="hud text-[0.58rem] text-white/45">{label}</p>
    </div>
  );
}

const ticks = (n: number, from = -135, span = 270, len = 6) =>
  Array.from({ length: n + 1 }, (_, i) => <line key={i} x1="50" y1="8" x2="50" y2={8 + (i % 5 === 0 ? len + 3 : len)} stroke="#cfd6e3" strokeWidth={i % 5 === 0 ? 1.4 : 0.7} transform={`rotate(${from + (span / n) * i} 50 50)`} />);

/** Pinned cockpit: scroll flies the instruments through a full descent while the facts light up like annunciators. */
export default function Cockpit() {
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = root.current!;
    if (prefersReduced()) return setP(1);
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=170%', pin: true, scrub: 0.6, onUpdate: (s) => setP(s.progress) } });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  const alt = 2400 - p * 1000;
  const vario = Math.sin(p * 22) * 2.4 - 0.6;
  const bank = Math.sin(p * 9) * 18;
  const pitch = Math.sin(p * 13) * 6;
  const heading = 190 + Math.sin(p * 5) * 55;
  const speed = 34 + Math.sin(p * 17) * 5;
  const mins = p * 25;
  const lit = Math.floor(p * (FACTS.length + 0.5));

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-[#07090e]" aria-labelledby="cockpit-title">
      {/* windshield */}
      <div className="absolute inset-x-0 top-0 h-[46%] overflow-hidden">
        <div className="absolute inset-[-12%]" style={{ transform: `rotate(${-bank * 0.6}deg) translateY(${pitch * 3}px) scale(1.1)` }}>
          <Img src="/images/flight-dhauladhar.webp" alt="" sizes="100vw" className="object-[50%_35%]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07090e]" />
        <div className="absolute inset-0 shadow-[inset_0_0_120px_40px_rgba(0,0,0,.6)]" />
      </div>
      {/* dashboard */}
      <div className="absolute inset-x-0 bottom-0 h-[64%] rounded-t-[50%_12%] bg-[linear-gradient(180deg,#141a24,#0a0d13)] shadow-[0_-30px_60px_rgba(0,0,0,.6)]" />

      <div className="container-x relative z-10 flex h-full flex-col justify-end gap-6 pb-8 pt-24 md:pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="hud text-sun">Instrument panel · scroll to fly</p>
            <SplitHeading id="cockpit-title" className="display mt-2 text-[clamp(1.9rem,3.6vw,3.4rem)]">
              Bir, by the numbers
            </SplitHeading>
          </div>
          <p className="hud text-white/45">{p < 0.98 ? 'Descending to Bir' : 'Landed · Bir'}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:grid-cols-6">
          <Dial label="Altimeter" value={`${Math.round(alt).toLocaleString('en-IN')} m`}>
            {ticks(20)}
            <line x1="50" y1="50" x2="50" y2="16" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" transform={`rotate(${((alt % 1000) / 1000) * 360} 50 50)`} />
            <line x1="50" y1="50" x2="50" y2="28" stroke="#ffc56b" strokeWidth="3.4" strokeLinecap="round" transform={`rotate(${(alt / 3000) * 360} 50 50)`} />
            <circle cx="50" cy="50" r="3" fill="#ff7a2f" />
          </Dial>
          <Dial label="Variometer" value={`${vario >= 0 ? '+' : '−'}${Math.abs(vario).toFixed(1)} m/s`}>
            {ticks(10, -135, 270)}
            <text x="50" y="72" textAnchor="middle" fontSize="7" fill={vario >= 0 ? '#7bd389' : '#ff9a4d'} className="font-mono">
              {vario >= 0 ? 'UP' : 'DN'}
            </text>
            <line x1="50" y1="50" x2="50" y2="16" stroke={vario >= 0 ? '#7bd389' : '#ff9a4d'} strokeWidth="2.6" strokeLinecap="round" transform={`rotate(${(vario / 5) * 135} 50 50)`} />
            <circle cx="50" cy="50" r="3" fill="#fff" />
          </Dial>
          <Dial label="Attitude" value={`Bank ${Math.round(bank)}°`}>
            <defs>
              <clipPath id="att">
                <circle cx="50" cy="50" r="44" />
              </clipPath>
            </defs>
            <g clipPath="url(#att)">
              <g transform={`rotate(${-bank} 50 50) translate(0 ${pitch})`}>
                <rect x="-20" y="-20" width="140" height="70" fill="#2f7cf6" />
                <rect x="-20" y="50" width="140" height="70" fill="#8a5a3b" />
                <line x1="-20" y1="50" x2="120" y2="50" stroke="#fff" strokeWidth="1.2" />
                {[-10, 10].map((d) => (
                  <line key={d} x1="38" x2="62" y1={50 + d * 1.6} y2={50 + d * 1.6} stroke="#fff" strokeWidth="0.8" />
                ))}
              </g>
            </g>
            <path d="M30 50 H44 L50 56 L56 50 H70" fill="none" stroke="#ffc56b" strokeWidth="2.4" />
          </Dial>
          <Dial label="Heading" value={`${Math.round(heading % 360)}° ${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round((heading % 360) / 45) % 8]}`}>
            <g transform={`rotate(${-heading} 50 50)`}>
              {ticks(35, 0, 350, 4)}
              {['N', 'E', 'S', 'W'].map((d, i) => (
                <text key={d} x="50" y="24" textAnchor="middle" fontSize="8" fill={d === 'N' ? '#ff7a2f' : '#fff'} transform={`rotate(${i * 90} 50 50)`} className="font-mono">
                  {d}
                </text>
              ))}
            </g>
            <path d="M50 30 L46 46 L50 43 L54 46 Z" fill="#ffc56b" />
          </Dial>
          <Dial label="Airspeed" value={`${Math.round(speed)} km/h`}>
            {ticks(12)}
            <path d={`M ${50 + 42 * Math.sin((-135 * Math.PI) / 180)} ${50 - 42 * Math.cos((-135 * Math.PI) / 180)} A 42 42 0 0 1 ${50 + 42 * Math.sin((-20 * Math.PI) / 180)} ${50 - 42 * Math.cos((-20 * Math.PI) / 180)}`} fill="none" stroke="#7bd389" strokeWidth="3" opacity="0.7" />
            <line x1="50" y1="50" x2="50" y2="16" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" transform={`rotate(${-135 + (speed / 60) * 270} 50 50)`} />
            <circle cx="50" cy="50" r="3" fill="#ff7a2f" />
          </Dial>
          <Dial label="Airtime" value={`${String(Math.floor(mins)).padStart(2, '0')}:${String(Math.floor((mins % 1) * 60)).padStart(2, '0')}`}>
            {ticks(12, 0, 360)}
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#ffc56b" strokeWidth="6" strokeDasharray={`${(mins / 25) * 238.8} 238.8`} transform="rotate(-90 50 50)" strokeLinecap="round" />
          </Dial>
        </div>

        <ul className="grid grid-cols-2 gap-2 font-mono text-[0.68rem] sm:grid-cols-3 lg:grid-cols-6" aria-label="Key facts">
          {FACTS.map((f, i) => {
            const on = i < lit;
            return (
              <li key={f.k} className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 transition-all duration-500 ${on ? 'border-sun/70 bg-sun/15 text-sun shadow-[0_0_20px_-4px_rgba(255,197,107,.7)]' : 'border-white/10 bg-black/30 text-white/35'}`}>
                <span className="uppercase tracking-wider">{f.k}</span>
                <span className="font-bold">{f.v}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
