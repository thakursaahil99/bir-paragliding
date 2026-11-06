'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { flightCompare, flights } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';
import { TLink } from '../layout/Transition';

function Cell({ v }: { v: string | boolean }) {
  if (v === true)
    return (
      <svg viewBox="0 0 20 20" className="mx-auto h-5 w-5 text-leaf" aria-label="Yes">
        <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (v === false)
    return (
      <span className="block text-center text-white/25" aria-label="No">
        —
      </span>
    );
  return <span className="block text-center">{v}</span>;
}

/** Rows wipe in one after another; the chosen column lights up with a sliding glow. */
export default function CompareTable() {
  const root = useRef<HTMLElement>(null);
  const [sel, setSel] = useState(1);

  useEffect(() => {
    if (prefersReduced()) return;
    const el = root.current!;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.from('[data-row]', {
          clipPath: 'inset(0 100% 0 0)',
          x: -30,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el.querySelector('table'), start: 'top 78%', once: true },
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative bg-night py-24 md:py-32" aria-labelledby="cmp-title">
      <div className="container-x">
        <p className="hud text-dawn">Side by side</p>
        <SplitHeading id="cmp-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.4rem)]">
          Compare tandem flights
        </SplitHeading>
        <p className="mt-4 text-white/60">Tap a column to highlight it.</p>

        <div className="no-scrollbar mt-10 overflow-x-auto" data-lenis-prevent>
          <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm md:text-base">
            <thead>
              <tr>
                <th className="w-[34%] p-4 text-left font-normal">
                  <span className="hud text-white/40">Feature</span>
                </th>
                {flights.map((f, i) => (
                  <th key={f.slug} className="relative p-0">
                    <button type="button" onClick={() => setSel(i)} aria-pressed={sel === i} className="relative w-full rounded-t-2xl px-3 py-5 text-center">
                      {sel === i && (
                        <motion.span
                          layoutId="cmp-glow"
                          className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-dawn/25 to-dawn/5 shadow-[0_0_60px_-10px_rgba(255,122,47,.7)]"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative block font-display text-lg font-bold">{f.name}</span>
                      <span className="hud relative mt-1 block text-white/50">{f.durationShort}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flightCompare.map((row) => (
                <tr key={row.label} data-row>
                  <th scope="row" className="border-t border-white/10 p-4 text-left font-normal text-white/70">
                    {row.label}
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={`border-t border-white/10 p-4 transition-[background-color,color] duration-500 ${sel === i ? 'bg-dawn/[0.08] text-white' : 'text-white/75'}`}
                    >
                      <Cell v={v} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr data-row>
                <td className="p-4" />
                {flights.map((f, i) => (
                  <td key={f.slug} className={`rounded-b-2xl p-4 text-center transition-colors duration-500 ${sel === i ? 'bg-dawn/[0.08]' : ''}`}>
                    <TLink
                      href={`/booking?package=${f.slug}`}
                      className={`inline-block rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${sel === i ? 'bg-dawn text-ink' : 'border border-white/20 text-white/80 hover:border-white/60'}`}
                    >
                      Book
                    </TLink>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
