'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { faqs, site, waLink } from '@/lib/site';

const CATS = ['All', ...Array.from(new Set(faqs.map((f) => f.cat)))];

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-dawn/30 px-0.5 text-white">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function FaqList() {
  const root = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(faqs[0].q);

  const list = useMemo(
    () => faqs.filter((f) => (cat === 'All' || f.cat === cat) && (!q || (f.q + ' ' + f.a).toLowerCase().includes(q.toLowerCase()))),
    [cat, q]
  );

  // questions slide in from alternating sides as they scroll into view
  useEffect(() => {
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-faq]').forEach((el, i) => {
          gsap.from(el, { x: i % 2 ? 40 : -40, autoAlpha: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
        });
      }, root);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, [cat]);

  return (
    <div ref={root} className="container-x grid gap-12 pb-24 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          <label className="relative block">
            <span className="sr-only">Search questions</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search — e.g. weight, monsoon, GoPro"
              className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3.5 outline-none transition-colors placeholder:text-white/35 focus:border-dawn"
            />
          </label>
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="FAQ categories">
            {CATS.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className="relative rounded-full px-4 py-2 text-sm">
                {cat === c && <motion.span layoutId="faq-cat" className="absolute inset-0 rounded-full bg-snow" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                <span className={`relative z-10 ${cat === c ? 'text-ink' : 'text-white/70'}`}>{c}</span>
              </button>
            ))}
          </div>
          <div className="glass mt-10 rounded-2xl p-6">
            <p className="font-display text-xl font-bold">Still wondering?</p>
            <p className="mt-2 text-white/65">Ask us directly on WhatsApp or by phone.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={waLink('Hi Bir Paragliding! I have a question:')} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-ink">
                WhatsApp
              </a>
              <a href={site.phoneHref} className="rounded-full border border-white/20 px-4 py-2 text-sm">
                {site.phone}
              </a>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:col-span-8" key={cat}>
        {list.length === 0 && <p className="text-white/60">No questions match “{q}”. Try another word, or message us.</p>}
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {list.map((f) => {
            const on = open === f.q;
            return (
              <li key={f.q} data-faq>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(on ? null : f.q)}
                    aria-expanded={on}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-xl font-bold leading-snug md:text-2xl">
                      <Highlight text={f.q} q={q} />
                    </span>
                    <span className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${on ? 'border-dawn bg-dawn text-ink' : 'border-white/20 group-hover:border-white/60'}`}>
                      <motion.span className="absolute h-[2px] w-4 rounded bg-current" animate={{ rotate: on ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                      <motion.span className="absolute h-4 w-[2px] rounded bg-current" animate={{ rotate: on ? 90 : 0, opacity: on ? 0 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      key="a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: { type: 'spring', stiffness: 220, damping: 30 }, opacity: { duration: 0.25 } }}
                      className="overflow-hidden"
                    >
                      <motion.p initial={{ y: -10 }} animate={{ y: 0 }} className="max-w-2xl pb-7 text-lg text-white/70">
                        <Highlight text={f.a} q={q} />
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
