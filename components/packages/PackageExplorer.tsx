'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useSpring, useTransform } from 'motion/react';
import { flights, courses, inr, type Pkg } from '@/lib/site';
import { lenisRef } from '@/lib/store';
import Img from '../animations/Img';
import SplitHeading from '../animations/SplitHeading';
import { TLink } from '../layout/Transition';

const spring = { type: 'spring', stiffness: 260, damping: 30 } as const;

function SpringPrice({ value, className }: { value: number; className?: string }) {
  const s = useSpring(value, { stiffness: 120, damping: 18 });
  useEffect(() => s.set(value), [s, value]);
  const text = useTransform(s, (v) => inr(Math.round(v / 50) * 50));
  return <motion.span className={className}>{text}</motion.span>;
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="glass flex items-center gap-1 rounded-full p-1.5" aria-label="Number of people">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-full text-xl hover:bg-white/10" aria-label="Fewer people">
        −
      </button>
      <div className="relative h-10 w-16 overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 24, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -24, opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="absolute inset-0 grid place-items-center font-mono text-lg"
          >
            {value} pax
          </motion.span>
        </AnimatePresence>
      </div>
      <button type="button" onClick={() => onChange(Math.min(12, value + 1))} className="grid h-10 w-10 place-items-center rounded-full text-xl hover:bg-white/10" aria-label="More people">
        +
      </button>
    </div>
  );
}

function Card({ p, persons, onOpen }: { p: Pkg; persons: number; onOpen: () => void }) {
  return (
    <motion.article
      layout
      layoutId={`card-${p.slug}`}
      id={p.slug}
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.94 }}
      transition={spring}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate"
      onClick={onOpen}
      data-cursor="view"
      data-cursor-text="Open"
    >
      <motion.div layoutId={`img-${p.slug}`} className="relative aspect-[4/3] overflow-hidden">
        <Img src={p.image} alt={p.name} sizes="(min-width: 1024px) 33vw, 90vw" className="transition-transform duration-[1.2s] ease-[var(--ease-glide)] group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate via-transparent to-transparent" />
        <span className="hud absolute left-4 top-4 rounded-full bg-ink/60 px-3 py-1.5 backdrop-blur">{p.tag}</span>
        {p.popular && <span className="hud absolute right-4 top-4 rounded-full bg-dawn px-3 py-1.5 text-ink">Most popular</span>}
      </motion.div>
      <div className="flex flex-1 flex-col p-6">
        <motion.h3 layoutId={`title-${p.slug}`} className="font-display text-2xl font-bold leading-tight">
          {p.name}
        </motion.h3>
        <p className="mt-1 text-white/60">{p.tagline}</p>
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="hud text-white/40">{persons > 1 ? `${persons} × ${inr(p.price)}` : p.unit}</p>
            <SpringPrice value={p.price * persons} className="font-display text-3xl font-bold" />
          </div>
          <p className="hud text-right text-white/60">{p.durationShort}</p>
        </div>
      </div>
    </motion.article>
  );
}

function Modal({ p, persons, onClose }: { p: Pkg; persons: number; onClose: () => void }) {
  useEffect(() => {
    lenisRef.current?.stop();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => {
      window.removeEventListener('keydown', k);
      lenisRef.current?.start();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-3 md:p-8" role="dialog" aria-modal="true" aria-labelledby={`m-${p.slug}`}>
      <motion.button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.article
        layoutId={`card-${p.slug}`}
        transition={spring}
        className="relative z-10 grid max-h-[92svh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate md:grid-cols-2"
      >
        <motion.div layoutId={`img-${p.slug}`} className="relative min-h-[220px] md:min-h-full">
          <Img src={p.image} alt={p.name} sizes="(min-width: 768px) 50vw, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate/90 via-transparent md:bg-gradient-to-r md:from-transparent md:to-slate/40" />
        </motion.div>
        <div className="overflow-y-auto p-6 md:p-10" data-lenis-prevent>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }} exit={{ opacity: 0 }}>
            <p className="hud text-dawn">
              {p.tag} · {p.duration}
            </p>
          </motion.div>
          <motion.h3 layoutId={`title-${p.slug}`} id={`m-${p.slug}`} className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
            {p.name}
          </motion.h3>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
            <p className="mt-4 text-white/70">{p.description}</p>
            <h4 className="hud mt-8 text-white/50">Included</h4>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {p.inclusions.map((i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/85">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dawn" />
                  {i}
                </li>
              ))}
            </ul>
            {p.syllabus && (
              <>
                <h4 className="hud mt-8 text-white/50">Syllabus</h4>
                <ol className="mt-3 space-y-3">
                  {p.syllabus.map((s, i) => (
                    <li key={s.title} className="flex gap-4">
                      <span className="font-mono text-dawn">0{i + 1}</span>
                      <span>
                        <span className="block font-medium">{s.title}</span>
                        <span className="text-sm text-white/60">{s.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            )}
            <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="hud text-white/40">
                  Total · {persons} {p.kind === 'course' ? (persons > 1 ? 'students' : 'student') : persons > 1 ? 'people' : 'person'}
                </p>
                <SpringPrice value={p.price * persons} className="font-display text-4xl font-bold" />
              </div>
              <TLink href={`/packages/${p.slug}`} className="rounded-full border border-white/25 px-5 py-3.5 font-medium hover:border-white/60">
                Full details
              </TLink>
              <TLink href={`/booking?package=${p.slug}&persons=${persons}`} data-cursor="book" className="rounded-full bg-gradient-to-r from-dawn to-ember px-6 py-3.5 font-semibold text-ink">
                Book this {p.kind === 'course' ? 'course' : 'flight'}
              </TLink>
            </div>
          </motion.div>
        </div>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ink/70 text-xl backdrop-blur" aria-label="Close">
          ×
        </button>
      </motion.article>
    </div>
  );
}

export default function PackageExplorer() {
  const [kind, setKind] = useState<'flight' | 'course'>('flight');
  const [persons, setPersons] = useState(1);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (window.location.hash === '#courses' || params.get('type') === 'course') {
      setKind('course');
      setTimeout(() => document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth' }), 400);
    }
  }, []);

  const list = kind === 'flight' ? flights : courses;
  const active = [...flights, ...courses].find((p) => p.slug === open);

  return (
    <section id="explorer" className="relative py-20 md:py-28" aria-labelledby="explorer-title">
      <span id="courses" className="absolute -top-24" aria-hidden />
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="hud text-dawn">Prices per person · tap a card for details</p>
            <SplitHeading id="explorer-title" className="display mt-4 text-[clamp(2.4rem,5.5vw,5rem)]">
              Pick your flight
            </SplitHeading>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div role="tablist" aria-label="Package type" className="glass inline-flex rounded-full p-1.5">
              {(
                [
                  ['flight', 'Tandem flights'],
                  ['course', 'Pilot courses'],
                ] as const
              ).map(([id, label]) => (
                <button key={id} role="tab" aria-selected={kind === id} type="button" onClick={() => setKind(id)} className="relative rounded-full px-5 py-2.5 text-sm font-medium">
                  {kind === id && <motion.span layoutId="kind-pill" className="absolute inset-0 rounded-full bg-snow" transition={{ type: 'spring', stiffness: 420, damping: 30 }} />}
                  <span className={`relative z-10 transition-colors ${kind === id ? 'text-ink' : 'text-white/70'}`}>{label}</span>
                </button>
              ))}
            </div>
            <Stepper value={persons} onChange={setPersons} />
          </div>
        </div>

        <LayoutGroup>
          <motion.div layout className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((p) => (
                <Card key={p.slug} p={p} persons={persons} onOpen={() => setOpen(p.slug)} />
              ))}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>{active && <Modal key={active.slug} p={active} persons={persons} onClose={() => setOpen(null)} />}</AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}
