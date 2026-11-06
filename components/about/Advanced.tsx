'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { useReady } from '@/lib/useReady';
import { gearParts } from '@/lib/extra';
import { ridgePath } from '@/lib/ridge';
import SplitHeading from '../animations/SplitHeading';
import Particles from '../fx/Particles';
import Magnetic from '../animations/Magnetic';
import { TLink } from '../layout/Transition';

/* ------------------------------------------------------------------ spotlight manifesto */
const LINES = ['We fly when', 'the sky says yes —', 'and wait when it doesn’t.'];

export function SpotlightManifesto() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    const set = (x: number, y: number) => {
      el.style.setProperty('--sx', `${x}px`);
      el.style.setProperty('--sy', `${y}px`);
    };
    const r0 = el.getBoundingClientRect();
    set(r0.width / 2, r0.height / 2);
    let auto = window.matchMedia('(pointer: coarse)').matches;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      auto = false;
      const r = el.getBoundingClientRect();
      set(e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('pointermove', move);
    const st = { t: 0 };
    const tw = gsap.to(st, {
      t: Math.PI * 2,
      duration: 9,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        if (!auto) return;
        const r = el.getBoundingClientRect();
        set(r.width / 2 + Math.sin(st.t) * r.width * 0.32, r.height / 2 + Math.sin(st.t * 2) * r.height * 0.18);
      },
    });
    return () => {
      el.removeEventListener('pointermove', move);
      tw.kill();
    };
  }, []);
  useReady(root, (el) => {
    gsap.utils.toArray<HTMLElement>('[data-sl-line]').forEach((l, i) => {
      gsap.fromTo(l, { xPercent: i % 2 ? 30 : -30, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: `top ${80 - i * 8}%`, end: `top ${35 - i * 8}%`, scrub: true } });
    });
  });
  const textCls = 'display block text-center text-[clamp(2.6rem,8.5vw,8.6rem)] leading-[0.95]';
  return (
    <section ref={root} className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink py-24 [--sx:50%] [--sy:50%]" aria-label="Our manifesto" data-cursor="view" data-cursor-text="Torch">
      <Particles mode="dust" color="#ffd9a0" intensity={0.6} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(260px circle at var(--sx) var(--sy), rgba(255,197,107,.18), transparent 70%)' }}
      />
      <div className="container-x relative w-full">
        <p className="hud mb-8 text-center text-dawn">Our one rule</p>
        <div className="relative">
          {/* dim base layer */}
          <p className="text-white/[0.09]">
            {LINES.map((l) => (
              <span key={l} data-sl-line className={textCls}>
                {l}
              </span>
            ))}
          </p>
          {/* photo-filled layer revealed by the torch */}
          <p
            aria-hidden
            className="absolute inset-0 bg-cover bg-center bg-clip-text text-transparent [-webkit-background-clip:text]"
            style={{
              backgroundImage: `url(/_next/image?url=${encodeURIComponent('/images/dhauladhar-alpenglow.webp')}&w=1920&q=75)`,
              WebkitMaskImage: 'radial-gradient(240px circle at var(--sx) var(--sy), #000 40%, transparent 72%)',
              maskImage: 'radial-gradient(240px circle at var(--sx) var(--sy), #000 40%, transparent 72%)',
            }}
          >
            {LINES.map((l) => (
              <span key={l} className={textCls}>
                {l}
              </span>
            ))}
          </p>
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center text-white/60">Move your cursor — the light finds the mountains hidden inside the words.</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ gear exploded view */
export function GearExploded() {
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = root.current!;
    if (prefersReduced()) return setP(1);
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=200%', pin: true, scrub: 0.6, onUpdate: (s) => setP(s.progress) } });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);
  const e = gsap.parseEase('power2.inOut')(Math.min(1, p * 1.25));
  const labels = Math.max(0, (p - 0.45) / 0.4);
  return (
    <section
      ref={root}
      className="relative h-[100svh] overflow-hidden bg-[#071730] bg-[linear-gradient(rgba(120,170,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,170,255,.08)_1px,transparent_1px)] bg-[size:40px_40px]"
      aria-labelledby="gear-title"
    >
      <div className="container-x relative z-10 grid h-full content-center gap-6 pt-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="hud text-sky">Blueprint · tandem rig</p>
          <SplitHeading id="gear-title" className="display mt-3 text-[clamp(2.2rem,4.6vw,4.4rem)]">
            What keeps you up there
          </SplitHeading>
          <p className="mt-5 max-w-sm text-white/65">Scroll to pull the rig apart — five layers, each checked before every flying day.</p>
          <p className="hud mt-6 text-white/50">Exploded · {Math.round(e * 100)}%</p>
        </div>
        <div className="relative h-[62vh] [perspective:1200px] md:col-span-8">
          <div className="absolute inset-0" style={{ transform: `rotateX(${e * 18}deg) rotateZ(${-e * 4}deg)`, transformStyle: 'preserve-3d' }}>
            <svg viewBox="-260 -230 520 460" className="h-full w-full overflow-visible" aria-label="Exploded diagram of tandem paragliding equipment">
              {gearParts.map((g, i) => {
                const dy = g.y * e * 0.9;
                const side = i % 2 ? 1 : -1;
                return (
                  <g key={g.id} transform={`translate(0 ${dy})`}>
                    {g.id === 'wing' && <path d="M-200 -120 C -120 -200, 120 -200, 200 -120 L 185 -108 C 110 -175, -110 -175, -185 -108 Z" fill="#ff7a2f" stroke="#ffc56b" strokeWidth="2" />}
                    {g.id === 'lines' && (
                      <g stroke="#cfe0ff" strokeWidth="1.2" opacity="0.85">
                        {[-185, -130, -70, 0, 70, 130, 185].map((x) => (
                          <line key={x} x1={x} y1={-110} x2={x > 0 ? 18 : -18} y2={-20} />
                        ))}
                      </g>
                    )}
                    {g.id === 'risers' && (
                      <g stroke="#ffc56b" strokeWidth="5" strokeLinecap="round">
                        <line x1="-24" y1="-22" x2="-30" y2="18" />
                        <line x1="24" y1="-22" x2="30" y2="18" />
                        <line x1="-40" y1="18" x2="40" y2="18" stroke="#fff" strokeWidth="4" />
                      </g>
                    )}
                    {g.id === 'harness' && (
                      <g>
                        <rect x="-46" y="30" width="40" height="52" rx="12" fill="#2f7cf6" />
                        <rect x="6" y="38" width="40" height="52" rx="12" fill="#14213a" stroke="#2f7cf6" strokeWidth="2" />
                      </g>
                    )}
                    {g.id === 'reserve' && <rect x="10" y="94" width="34" height="22" rx="6" fill="#7bd389" />}
                    {/* leader line + label */}
                    <g opacity={labels}>
                      <line x1={side * 60} y1={g.id === 'wing' ? -150 : g.id === 'lines' ? -60 : g.id === 'risers' ? 0 : g.id === 'harness' ? 60 : 105} x2={side * 150} y2={g.id === 'wing' ? -150 : g.id === 'lines' ? -60 : g.id === 'risers' ? 0 : g.id === 'harness' ? 60 : 105} stroke="#8ec5ff" strokeDasharray="3 4" />
                      <text x={side * 156} y={(g.id === 'wing' ? -150 : g.id === 'lines' ? -60 : g.id === 'risers' ? 0 : g.id === 'harness' ? 60 : 105) + 4} textAnchor={side > 0 ? 'start' : 'end'} fontSize="13" fill="#fff" className="font-mono">
                        {g.label.toUpperCase()}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
      <ul className="container-x absolute inset-x-0 bottom-6 z-10 hidden gap-4 md:grid md:grid-cols-5" style={{ opacity: labels }}>
        {gearParts.map((g) => (
          <li key={g.id} className="rounded-xl border border-sky/20 bg-[#071730]/80 p-3 text-xs text-white/70 backdrop-blur">
            <span className="block font-medium text-white">{g.label}</span>
            {g.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ signature CTA */
export function SignatureCTA() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    const text = el.querySelector<SVGTextElement>('[data-sign]')!;
    gsap.fromTo(text, { strokeDashoffset: 1600, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 3, ease: 'power2.inOut', scrollTrigger: { trigger: el, start: 'top 60%', once: true } });
    gsap.to(text, { fillOpacity: 1, duration: 1, delay: 2.4, scrollTrigger: { trigger: el, start: 'top 60%', once: true } });
    gsap.utils.toArray<HTMLElement>('[data-sig-ridge]').forEach((r, i) => gsap.fromTo(r, { yPercent: 30 + i * 20 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true } }));
  });
  return (
    <section ref={root} className="relative overflow-hidden bg-[linear-gradient(180deg,#1b2a55_0%,#6a3a5c_45%,#ff8a4c_100%)] pb-0 pt-24 md:pt-32" aria-labelledby="sign-title">
      {/* birds */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[0, 1, 2, 3, 4].map((b) => (
          <svg key={b} viewBox="0 0 20 8" className="absolute h-3 w-8 text-ink/60" style={{ top: `${18 + b * 7}%`, left: '-10%', animation: `bird ${18 + b * 3}s linear ${b * 2.5}s infinite` }}>
            <path d="M0 6 Q 5 0 10 5 Q 15 0 20 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        ))}
      </div>
      <style>{`@keyframes bird{0%{transform:translateX(0) translateY(0)}50%{transform:translateX(60vw) translateY(-20px)}100%{transform:translateX(125vw) translateY(10px)}}`}</style>
      <div className="container-x relative z-10 text-center">
        <p className="hud text-white/80">From the whole crew</p>
        <h2 id="sign-title" className="sr-only">
          See you on the hill
        </h2>
        <svg viewBox="0 0 1200 220" className="mx-auto mt-4 w-full max-w-5xl" aria-hidden>
          <text
            data-sign
            x="600"
            y="150"
            textAnchor="middle"
            className="display"
            fontSize="128"
            textLength="1120"
            lengthAdjust="spacingAndGlyphs"
            fill="#f4f7fb"
            fillOpacity="0"
            stroke="#f4f7fb"
            strokeWidth="2"
            strokeDasharray="1600"
            strokeDashoffset="1600"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em' }}
          >
            See you on the hill
          </text>
        </svg>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <TLink href="/booking" data-cursor="book" className="inline-block rounded-full bg-ink px-7 py-3.5 font-semibold text-snow">
              <span data-magnetic-inner className="block">
                Book your flight
              </span>
            </TLink>
          </Magnetic>
          <TLink href="/contact" className="rounded-full border border-white/40 px-7 py-3.5">
            Talk to a pilot
          </TLink>
        </div>
      </div>
      <div className="relative mt-16 h-[32vh]">
        {[0, 1, 2].map((i) => (
          <svg key={i} data-sig-ridge viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-full w-full">
            <path d={ridgePath(70 + i * 5, { base: 0.4 + i * 0.18, amp: 0.3, peaks: 6 + i * 2 })} fill={['#4a2c4a', '#2b1a33', '#060a12'][i]} />
          </svg>
        ))}
      </div>
    </section>
  );
}
