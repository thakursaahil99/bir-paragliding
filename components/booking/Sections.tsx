'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { useReady } from '@/lib/useReady';
import { bookingSteps, chat } from '@/lib/extra';
import { packing, waLink } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';
import Particles from '../fx/Particles';
import Img from '../animations/Img';
import Magnetic from '../animations/Magnetic';

function usePinned(ref: React.RefObject<HTMLElement | null>, end: string, onP: (p: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) return onP(1);
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end, pin: true, scrub: 0.5, onUpdate: (s) => onP(s.progress) } });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ------------------------------------------------------------------ rotating prism: how it works */
export function HowPrism() {
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  usePinned(root, '+=200%', setP);
  const rot = -p * 240;
  const face = Math.min(2, Math.round(p * 2));
  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-[radial-gradient(70%_60%_at_50%_50%,#17305e,#060a12)]" aria-labelledby="how-title">
      <Particles mode="dust" color="#9fc4ff" intensity={0.7} />
      <div className="container-x relative z-10 grid h-full content-center gap-10 pt-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="hud text-dawn">How booking works</p>
          <SplitHeading id="how-title" className="display mt-3 text-[clamp(2.2rem,4.6vw,4.4rem)]">
            Three turns of the prism
          </SplitHeading>
          <div className="mt-8 flex gap-2">
            {bookingSteps.map((s, i) => (
              <span key={s.n} className={`h-1 rounded-full transition-all duration-500 ${i === face ? 'w-12 bg-dawn' : 'w-5 bg-white/25'}`} />
            ))}
          </div>
        </div>
        <div className="relative h-[52vh] [perspective:1400px] md:col-span-8">
          <div className="absolute left-1/2 top-1/2 h-[min(46vh,380px)] w-[min(78vw,520px)] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]" style={{ transform: `translateZ(-150px) rotateY(${rot}deg)` }}>
            {bookingSteps.map((s, i) => (
              <article
                key={s.n}
                className="absolute inset-0 flex flex-col justify-between rounded-[2rem] border border-white/15 p-7 [backface-visibility:hidden] md:p-10"
                style={{
                  transform: `rotateY(${i * 120}deg) translateZ(150px)`,
                  background: ['linear-gradient(150deg,#1e5bc0,#0a1220)', 'linear-gradient(150deg,#3a2f6b,#0a1220)', 'linear-gradient(150deg,#ff7a2f,#3a1f2a)'][i],
                  opacity: i === face ? 1 : 0.55,
                }}
              >
                <span className="display text-[clamp(4rem,10vw,7rem)] leading-none text-white/90">{s.n}</span>
                <div>
                  <h3 className="font-display text-3xl font-bold">{s.title}</h3>
                  <p className="mt-3 max-w-sm text-white/80">{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ live season countdown */
function nextMilestone(now: Date) {
  const y = now.getFullYear();
  const reopen = new Date(y, 8, 16);
  const monsoon = new Date(y, 6, 1);
  const peak = new Date(y, 9, 1);
  if (now >= monsoon && now < reopen) return { label: 'Season reopens in', at: reopen, open: false };
  if (now >= reopen && now < peak) return { label: 'Peak autumn season in', at: peak, open: true };
  const nextMonsoon = now < monsoon ? monsoon : new Date(y + 1, 6, 1);
  return { label: 'Flying days left before the monsoon break', at: nextMonsoon, open: true };
}

function FlipDigit({ v }: { v: string }) {
  return (
    <span className="relative inline-grid h-[1.25em] w-[0.75em] place-items-center overflow-hidden rounded-lg bg-[#0b1220] font-mono shadow-[inset_0_-2px_0_rgba(255,255,255,.06)] [perspective:300px]">
      <span key={v} className="block [animation:flipIn_.45s_cubic-bezier(.2,.8,.2,1)]">
        {v}
      </span>
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
    </span>
  );
}

export function SeasonCountdown() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const m = now ? nextMilestone(now) : null;
  const diff = m && now ? Math.max(0, m.at.getTime() - now.getTime()) : 0;
  const parts = [
    ['Days', Math.floor(diff / 86400000)],
    ['Hours', Math.floor(diff / 3600000) % 24],
    ['Min', Math.floor(diff / 60000) % 60],
    ['Sec', Math.floor(diff / 1000) % 60],
  ] as const;
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0a1830,#14305e)] py-24 md:py-32" aria-labelledby="cd-title">
      <style>{`@keyframes flipIn{0%{transform:rotateX(-90deg);opacity:.2}100%{transform:rotateX(0);opacity:1}}`}</style>
      <Particles mode="wind" color="#cfe0ff" intensity={0.6} />
      <div className="container-x relative text-center">
        <p className="hud text-dawn">Live · from today’s date</p>
        <SplitHeading id="cd-title" className="display mx-auto mt-4 max-w-4xl text-[clamp(2rem,5vw,4.4rem)]">
          Your flying window
        </SplitHeading>
        <p className="mt-4 text-lg text-white/75">{m ? m.label : 'Checking the season…'}</p>
        <div className="mt-12 flex flex-wrap items-end justify-center gap-4 md:gap-8" aria-live="off">
          {parts.map(([label, val]) => {
            const s = String(val).padStart(label === 'Days' ? 3 : 2, '0');
            return (
              <div key={label} className="flex flex-col items-center gap-3">
                <span className="flex gap-1 text-[clamp(2.6rem,8vw,6rem)]">
                  {s.split('').map((d, i) => (
                    <FlipDigit key={`${label}-${i}`} v={d} />
                  ))}
                </span>
                <span className="hud text-white/50">{label}</span>
              </div>
            );
          })}
        </div>
        {m && (
          <p className={`hud mt-10 inline-flex items-center gap-2 rounded-full px-4 py-2 ${m.open ? 'bg-leaf/15 text-leaf' : 'bg-ember/20 text-[#ffb59a]'}`}>
            <span className={`h-2 w-2 rounded-full ${m.open ? 'animate-pulse bg-leaf' : 'bg-ember'}`} /> {m.open ? 'Flying season is open' : 'Monsoon break — no flying'}
          </p>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ WhatsApp chat simulation */
export function ChatSim() {
  const root = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  usePinned(root, '+=180%', setP);
  const shown = Math.min(chat.length, Math.floor(p * (chat.length + 0.6)));
  const typing = shown < chat.length && p * (chat.length + 0.6) - shown > 0.45;
  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden" aria-labelledby="chat-title">
      <div className="absolute inset-0">
        <Img src="/images/billing-launch-flags.webp" alt="" sizes="100vw" className="scale-110 blur-md" />
        <div className="absolute inset-0 bg-ink/75" />
      </div>
      <div className="container-x relative z-10 grid h-full content-center gap-10 pt-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="hud text-[#25D366]">Booked in one chat</p>
          <SplitHeading id="chat-title" className="display mt-3 text-[clamp(2.2rem,4.8vw,4.6rem)]">
            It really is this simple
          </SplitHeading>
          <p className="mt-5 max-w-md text-white/70">A sample conversation — scroll to watch it unfold. Your real chat goes straight to our team.</p>
        </div>
        <div className="mx-auto w-[min(86vw,360px)] rounded-[2.4rem] border-[6px] border-[#1c2433] bg-[#0b141a] shadow-[0_50px_100px_-30px_rgba(0,0,0,.9)]">
          <div className="flex items-center gap-3 rounded-t-[2rem] bg-[#1f2c33] px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-dawn font-display font-bold text-ink">B</span>
            <span>
              <span className="block text-sm font-semibold">Bir Paragliding</span>
              <span className="block text-xs text-white/50">{typing ? 'typing…' : 'online'}</span>
            </span>
          </div>
          <div className="flex h-[52vh] max-h-[460px] flex-col justify-end gap-2 overflow-hidden bg-[#0b141a] bg-[radial-gradient(rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:14px_14px] p-3">
            {chat.slice(0, shown).map((c, i) => (
              <div key={i} className={`max-w-[82%] rounded-xl px-3 py-2 text-sm leading-snug shadow [animation:pop_.35s_cubic-bezier(.2,.8,.2,1.2)] ${c.from === 'you' ? 'self-end rounded-tr-sm bg-[#005c4b]' : 'self-start rounded-tl-sm bg-[#1f2c33]'}`}>
                {c.text}
              </div>
            ))}
            {typing && (
              <div className={`flex gap-1 rounded-xl px-3 py-3 ${chat[shown].from === 'you' ? 'self-end bg-[#005c4b]' : 'self-start bg-[#1f2c33]'}`}>
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
          <div className="rounded-b-[2rem] bg-[#1f2c33] px-4 py-3 text-xs text-white/40">Message</div>
        </div>
      </div>
      <style>{`@keyframes pop{0%{transform:scale(.6) translateY(10px);opacity:0}100%{transform:none;opacity:1}}`}</style>
    </section>
  );
}

/* ------------------------------------------------------------------ trust ring badges */
const BADGES = [
  { ring: 'LICENSED PILOTS · LICENSED PILOTS · ', icon: 'M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z' },
  { ring: 'RESERVE ON EVERY FLIGHT · ', icon: 'M4 12a8 8 0 0 1 16 0H4zm0 0l8 9 8-9' },
  { ring: 'CLEAR PRICES · NO SURPRISES · ', icon: 'M5 12h14M12 5v14' },
  { ring: 'WEATHER FIRST · ALWAYS · ', icon: 'M6 16a5 5 0 0 1 1-10 6 6 0 0 1 11 2 4 4 0 0 1 0 8z' },
];

export function TrustRings() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap.from('[data-badge-ring]', { scale: 0, rotate: -180, opacity: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
  });
  return (
    <section ref={root} className="relative overflow-hidden py-24 md:py-32" aria-labelledby="trust-title">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(47,124,246,.18)_40deg,transparent_60deg)] [animation-duration:8s]" />
      <div className="container-x relative">
        <p className="hud text-center text-dawn">Why book with us</p>
        <SplitHeading id="trust-title" className="display mx-auto mt-4 max-w-3xl text-center text-[clamp(2.2rem,5vw,4.6rem)]">
          Four promises, always spinning
        </SplitHeading>
        <div className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-4">
          {BADGES.map((b, i) => (
            <div key={i} data-badge-ring className="group relative mx-auto aspect-square w-full max-w-[220px]">
              <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin [animation-duration:18s] group-hover:[animation-duration:4s]" aria-hidden>
                <defs>
                  <path id={`circ-${i}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <text fontSize="13.5" letterSpacing="3.5" fill="#ffc56b" className="font-mono">
                  <textPath href={`#circ-${i}`}>{b.ring.repeat(2)}</textPath>
                </text>
              </svg>
              <div className="absolute inset-[26%] grid place-items-center rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur">
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-snow" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={b.icon} />
                </svg>
              </div>
              <span className="sr-only">{b.ring.split(' · ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ we bring / you bring — sorting */
const WE = ['Licensed pilot', 'Tandem wing', 'Reserve parachute', 'Helmet & harness', 'Safety briefing', 'GoPro (Classic)'];
export function BringSort() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    const items = gsap.utils.toArray<HTMLElement>('[data-sort]');
    items.forEach((it, i) => {
      const c = el.querySelector<HTMLElement>('[data-sort-center]')!.getBoundingClientRect();
      const r = c.width > 0 ? c : el.getBoundingClientRect();
      const b = it.getBoundingClientRect();
      gsap.fromTo(
        it,
        { x: r.left + r.width / 2 - (b.left + b.width / 2), y: r.top + r.height / 2 - (b.top + b.height / 2), rotate: gsap.utils.random(-25, 25), scale: 0.8, opacity: 0.4 },
        { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 70%', end: 'center 50%', scrub: 1 }, delay: i * 0.02 }
      );
    });
  });
  const you = packing.map((p) => p.split(' — ')[0].split(';')[0]);
  return (
    <section ref={root} className="relative overflow-hidden bg-night py-24 md:py-32" aria-labelledby="bring-title">
      <div className="container-x">
        <p className="hud text-center text-dawn">Packing, sorted</p>
        <SplitHeading id="bring-title" className="display mx-auto mt-4 max-w-3xl text-center text-[clamp(2.2rem,5vw,4.6rem)]">
          We bring · you bring
        </SplitHeading>
        <div className="relative mt-14 grid gap-6 md:grid-cols-[1fr_auto_1fr]">
          <ul className="space-y-3">
            {WE.map((w) => (
              <li key={w} data-sort className="glass rounded-2xl px-5 py-4 text-right md:text-right">
                {w}
              </li>
            ))}
          </ul>
          <div data-sort-center className="relative mx-auto hidden w-24 md:block">
            <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-dawn to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-dawn font-display font-bold text-ink shadow-[0_0_50px_10px_rgba(255,122,47,.45)]">VS</span>
          </div>
          <ul className="space-y-3">
            {you.map((y) => (
              <li key={y} data-sort className="rounded-2xl border border-dawn/30 bg-dawn/10 px-5 py-4">
                {y}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 grid gap-6 text-center md:grid-cols-[1fr_auto_1fr]">
          <p className="hud text-white/50">Provided by us</p>
          <span className="hidden w-24 md:block" />
          <p className="hud text-dawn">Bring yourself</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ policy stamps */
const POLICIES = [
  { stamp: 'RESCHEDULED', title: 'If the weather says no', text: 'Your flight moves to the next suitable slot — or you get a refund for that flight.' },
  { stamp: 'YOUR CALL', title: 'If you need to cancel', text: '[Placeholder] Set your notice period and any charges here.' },
  { stamp: 'BY OPERATOR', title: 'Stays, camps & travel', text: 'Follow the property’s or operator’s own policy, shared before you confirm.' },
];
export function PolicyStamps() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 60%', once: true } });
    el.querySelectorAll<HTMLElement>('[data-stamp]').forEach((s, i) => {
      tl.fromTo(s, { scale: 3.2, rotate: -30, opacity: 0 }, { scale: 1, rotate: [-12, 8, -6][i], opacity: 1, duration: 0.35, ease: 'power4.in' }, i * 0.45).fromTo(el.querySelector('[data-shake]'), { x: 0 }, { x: 6, duration: 0.05, repeat: 5, yoyo: true, ease: 'none' }, '>-0.02');
    });
  });
  return (
    <section ref={root} className="relative py-24 md:py-32" aria-labelledby="policy-title">
      <div className="container-x">
        <p className="hud text-dawn">The fine print, made friendly</p>
        <SplitHeading id="policy-title" className="display mt-4 max-w-3xl text-[clamp(2.2rem,5vw,4.6rem)]">
          Plans change. That’s fine.
        </SplitHeading>
        <div data-shake className="mt-12 grid gap-6 md:grid-cols-3">
          {POLICIES.map((p, i) => (
            <article key={p.stamp} className="relative min-h-[240px] overflow-hidden rounded-2xl bg-[#f3ead8] p-7 text-ink shadow-xl">
              <span className="hud text-ink/50">0{i + 1}</span>
              <h3 className="mt-2 font-display text-2xl font-bold">{p.title}</h3>
              <p className="mt-3 max-w-xs text-ink/75">{p.text}</p>
              <span data-stamp className="absolute bottom-6 right-5 rounded-md border-4 border-[#c0392b] px-3 py-1 font-mono text-lg font-bold tracking-widest text-[#c0392b] opacity-0 mix-blend-multiply">
                {p.stamp}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ WhatsApp CTA */
export function WhatsAppCTA() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#075e54,#128c7e_50%,#25d366)] py-24 text-center md:py-32" aria-labelledby="wa-title">
      <Particles mode="bubbles" color="#ffffff" intensity={1.2} />
      <div className="container-x relative">
        <p className="hud text-white/80">Prefer to just talk?</p>
        <SplitHeading id="wa-title" className="display mx-auto mt-4 max-w-4xl text-[clamp(2.4rem,6vw,5.6rem)]">
          Say hi on WhatsApp
        </SplitHeading>
        <div className="mt-10 flex justify-center">
          <Magnetic strength={0.5}>
            <a href={waLink('Hi Bir Paragliding! I would like to book a flight.')} target="_blank" rel="noreferrer" data-cursor="book" className="grid h-40 w-40 place-items-center rounded-full bg-white text-[#075e54] shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)] md:h-48 md:w-48">
              <span data-magnetic-inner className="font-display text-lg font-bold">
                Open chat ↗
              </span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
