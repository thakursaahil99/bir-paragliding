'use client';

import { useEffect, useRef, useState } from 'react';
import { prefersReduced } from '@/lib/gsap';
import { packing, reach } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';

const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789–~.:+';

/** One split-flap cell: flips through characters before landing on its target. */
function Flap({ target, go, delay }: { target: string; go: boolean; delay: number }) {
  const [ch, setCh] = useState(' ');
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go || prefersReduced()) {
      if (go) setCh(target);
      return;
    }
    let i = 0;
    const flips = 6 + Math.floor(Math.random() * 10);
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        i++;
        setN((x) => x + 1);
        if (i >= flips) {
          setCh(target);
          window.clearInterval(id);
        } else setCh(CHARS[Math.floor(Math.random() * CHARS.length)]);
      }, 55);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [go, target, delay]);
  return (
    <span className="relative inline-grid h-[1.6em] w-[1.05em] place-items-center overflow-hidden rounded-[3px] bg-[#0b1220] font-mono text-sun shadow-[inset_0_-1px_0_rgba(255,255,255,.06)] [perspective:200px]">
      <span key={n} className="block [animation:flap_.12s_ease-out]">
        {ch === ' ' ? ' ' : ch}
      </span>
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
    </span>
  );
}

function FlapText({ text, go, base = 0, pad = 0 }: { text: string; go: boolean; base?: number; pad?: number }) {
  const t = text.toUpperCase().padEnd(pad, ' ');
  return (
    <span className="inline-flex gap-[2px]" aria-label={text}>
      {t.split('').map((c, i) => (
        <Flap key={i} target={c} go={go} delay={base + i * 35} />
      ))}
    </span>
  );
}

function Typewriter({ items }: { items: string[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const [shown, setShown] = useState<number[]>(() => items.map(() => 0));
  const [go, setGo] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setGo(true), { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!go) return;
    if (prefersReduced()) {
      setShown(items.map((s) => s.length));
      return;
    }
    let row = 0;
    let col = 0;
    const id = window.setInterval(() => {
      if (row >= items.length) return window.clearInterval(id);
      col += 2;
      setShown((s) => s.map((v, i) => (i === row ? Math.min(col, items[row].length) : v)));
      if (col >= items[row].length) {
        row++;
        col = 0;
      }
    }, 18);
    return () => window.clearInterval(id);
  }, [go, items]);
  return (
    <ul ref={ref} className="space-y-4">
      {items.map((it, i) => {
        const done = shown[i] >= it.length;
        return (
          <li key={it} className="flex items-start gap-4 font-mono text-[0.95rem] text-white/85">
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors duration-300 ${done ? 'border-leaf bg-leaf/20 text-leaf' : 'border-white/25'}`} aria-hidden>
              {done && '✓'}
            </span>
            <span aria-label={it}>
              {it.slice(0, shown[i])}
              {shown[i] > 0 && !done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-dawn" />}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function DepartureBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setGo(true), { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative bg-night py-24 md:py-32" aria-labelledby="reach-title">
      <style>{`@keyframes flap{0%{transform:rotateX(-90deg);opacity:.2}100%{transform:rotateX(0);opacity:1}}`}</style>
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <p className="hud text-dawn">Getting here</p>
          <SplitHeading id="reach-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.4rem)]">
            Arrivals: Bir
          </SplitHeading>
          <div ref={ref} className="no-scrollbar mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-[#070c16] p-4 md:p-6" data-lenis-prevent>
            <div className="min-w-[640px]">
              <div className="hud grid grid-cols-[5.5rem_1fr_7rem_6rem] gap-4 border-b border-white/10 pb-3 text-white/40">
                <span>From</span>
                <span>Route</span>
                <span>Time</span>
                <span>Dist</span>
              </div>
              {reach.map((r, i) => (
                <div key={r.code} className="grid grid-cols-[5.5rem_1fr_7rem_6rem] items-center gap-4 border-b border-white/5 py-4 text-sm md:text-base">
                  <FlapText text={r.code} go={go} base={i * 260} pad={3} />
                  <div>
                    <p className="font-medium">{r.from}</p>
                    <p className="text-sm text-white/55">{r.how}</p>
                  </div>
                  <FlapText text={r.time.replace(/\s/g, '')} go={go} base={i * 260 + 120} pad={6} />
                  <FlapText text={r.dist.replace(/\s/g, '')} go={go} base={i * 260 + 200} pad={5} />
                </div>
              ))}
              <p className="hud mt-4 flex items-center gap-2 text-leaf">
                <span className="h-2 w-2 animate-pulse rounded-full bg-leaf" /> Times are approximate — weather and traffic vary
              </p>
            </div>
          </div>
        </div>
        <div className="min-w-0 lg:col-span-4">
          <p className="hud text-dawn">Pack this</p>
          <SplitHeading as="h3" className="display mt-4 text-[clamp(1.8rem,3vw,2.6rem)]">For the morning you fly</SplitHeading>
          <div className="glass mt-8 rounded-2xl p-6">
            <Typewriter items={packing} />
          </div>
        </div>
      </div>
    </section>
  );
}
