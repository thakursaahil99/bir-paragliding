'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useSpring, useTransform } from 'motion/react';
import { gsap } from '@/lib/gsap';
import { packages, inr, waLink, type Pkg } from '@/lib/site';
import Field from '../ui/Field';
import Img from '../animations/Img';
import DatePicker, { fmtDate } from './DatePicker';
import Confetti from './Confetti';
import { TLink } from '../layout/Transition';

const STEPS = ['Package', 'Date', 'People', 'Details', 'Confirm'];
const SLOTS = [
  { id: 'Morning', note: 'Smoothest air — best for first flights' },
  { id: 'Midday', note: 'Stronger lift, longer flights' },
  { id: 'Afternoon', note: 'Golden light, livelier air' },
];
const TRACK = 'M 20 70 C 140 10, 260 10, 360 50 S 560 100, 660 40 S 860 0, 980 60';

function Total({ value }: { value: number }) {
  const s = useSpring(value, { stiffness: 140, damping: 20 });
  useEffect(() => s.set(value), [s, value]);
  const t = useTransform(s, (v) => inr(Math.round(v / 50) * 50));
  return <motion.span>{t}</motion.span>;
}

/** The progress paraglider: flies along a curved track to the current step's waypoint. */
function FlightProgress({ step }: { step: number }) {
  const path = useRef<SVGPathElement>(null);
  const glider = useRef<SVGGElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const state = useRef({ p: 0 });
  const [pts, setPts] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const p = path.current!;
    const len = p.getTotalLength();
    setPts(STEPS.map((_, i) => p.getPointAtLength((i / (STEPS.length - 1)) * len)));
    if (trail.current) trail.current.style.strokeDasharray = `${len}`;
  }, []);

  useEffect(() => {
    const p = path.current!;
    const len = p.getTotalLength();
    const place = () => {
      const l = state.current.p * len;
      const a = p.getPointAtLength(l);
      const b = p.getPointAtLength(Math.min(len, l + 2));
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      glider.current?.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang * 0.4})`);
      if (trail.current) trail.current.style.strokeDashoffset = `${len - l}`;
    };
    const tween = gsap.to(state.current, { p: step / (STEPS.length - 1), duration: 1.1, ease: 'power3.inOut', onUpdate: place });
    place();
    return () => {
      tween.kill();
    };
  }, [step]);

  return (
    <div className="relative">
      <svg viewBox="0 0 1000 110" className="h-auto w-full overflow-visible" aria-hidden>
        <path ref={path} d={TRACK} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="2" strokeDasharray="4 8" />
        <path ref={trail} d={TRACK} fill="none" stroke="url(#bk-grad)" strokeWidth="3" strokeLinecap="round" />
        <defs>
          <linearGradient id="bk-grad" x1="0" x2="1">
            <stop offset="0" stopColor="#8ec5ff" />
            <stop offset="1" stopColor="#ff7a2f" />
          </linearGradient>
        </defs>
        {pts.map((pt, i) => (
          <g key={i} transform={`translate(${pt.x} ${pt.y})`}>
            <circle r={i <= step ? 7 : 5} fill={i <= step ? '#ff7a2f' : '#0a1220'} stroke={i <= step ? '#ffc56b' : 'rgba(255,255,255,.35)'} strokeWidth="2" style={{ transition: 'all .5s' }} />
          </g>
        ))}
        <g ref={glider}>
          <g transform="translate(-22 -34)">
            <path d="M2 12 C 10 2, 34 2, 42 12 L 39 14 C 31 7, 13 7, 5 14 Z" fill="#ff7a2f" />
            <path d="M5 14 L 22 30 L 39 14" stroke="#fff" strokeWidth="1" fill="none" />
            <circle cx="22" cy="31" r="3" fill="#fff" />
          </g>
        </g>
      </svg>
      <ol className="relative mt-1 h-5">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`hud absolute top-0 -translate-x-1/2 whitespace-nowrap text-[0.55rem] transition-colors sm:text-[0.68rem] ${i === step ? 'text-white' : i < step ? 'text-dawn' : 'text-white/35'}`}
            style={
              i === 0
                ? { left: 0, translate: 'none' }
                : i === STEPS.length - 1
                  ? { right: 0, left: 'auto', translate: 'none' }
                  : { left: `${pts[i] ? pts[i].x / 10 : (i / (STEPS.length - 1)) * 96 + 2}%` }
            }
            aria-current={i === step ? 'step' : undefined}
          >
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function PackagePick({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const groups: [string, Pkg[]][] = [
    ['Tandem flights', packages.filter((p) => p.kind === 'flight')],
    ['Pilot courses', packages.filter((p) => p.kind === 'course')],
  ];
  return (
    <div className="space-y-8">
      {groups.map(([g, list]) => (
        <fieldset key={g}>
          <legend className="hud mb-3 text-white/50">{g}</legend>
          <div className="grid gap-3 md:grid-cols-3">
            {list.map((p) => {
              const on = value === p.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => onChange(p.slug)}
                  aria-pressed={on}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-[border-color,transform] duration-300 hover:-translate-y-0.5 ${on ? 'border-dawn' : 'border-white/12'}`}
                >
                  {on && <motion.span layoutId="pkg-sel" className="absolute inset-0 bg-dawn/10" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  <div className="relative flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Img src={p.image} alt="" sizes="64px" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold leading-tight">{p.name}</p>
                      <p className="mt-1 text-sm text-white/55">
                        {p.durationShort} · {inr(p.price)}
                      </p>
                    </div>
                    <span className={`ml-auto mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${on ? 'border-dawn bg-dawn' : 'border-white/30'}`}>
                      {on && <span className="h-2 w-2 rounded-full bg-ink" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export default function BookingWizard() {
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [done, setDone] = useState(false);
  const [slug, setSlug] = useState(() => (packages.some((p) => p.slug === params.get('package')) ? (params.get('package') as string) : 'classic-tandem'));
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState('Morning');
  const [persons, setPersons] = useState(() => Math.min(12, Math.max(1, Number(params.get('persons')) || 1)));
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [touched, setTouched] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const pkg = packages.find((p) => p.slug === slug)!;
  const total = pkg.price * persons;
  const phoneOk = form.phone.replace(/\D/g, '').length >= 10;
  const emailOk = !form.email || /.+@.+\..+/.test(form.email);
  const valid = [true, !!date, persons >= 1, form.name.trim().length > 1 && phoneOk && emailOk, true][step];

  const message = useMemo(
    () =>
      [
        'Hi Bir Paragliding! I would like to book:',
        `• ${pkg.kind === 'course' ? 'Course' : 'Flight'}: ${pkg.name} (${inr(pkg.price)} × ${persons} = ${inr(total)})`,
        `• Date: ${date ? fmtDate(date) : '-'}${pkg.kind === 'flight' ? ` — ${slot}` : ' (course start)'}`,
        `• ${pkg.kind === 'course' ? 'Students' : 'People'}: ${persons}`,
        `• Name: ${form.name}`,
        `• Phone: ${form.phone}`,
        form.email ? `• Email: ${form.email}` : '',
        form.notes ? `• Notes: ${form.notes}` : '',
        '',
        'Please confirm availability. Thank you!',
      ]
        .filter((l) => l !== '')
        .join('\n'),
    [pkg, persons, total, date, slot, form]
  );

  const next = (d: number) => {
    if (d > 0 && !valid) {
      setTouched(true);
      return;
    }
    setTouched(false);
    setDir(d);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d)));
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const send = () => {
    window.open(waLink(message), '_blank', 'noopener,noreferrer');
    setDone(true);
  };

  if (done) return <Success name={form.name} pkg={pkg.name} date={date ? fmtDate(date) : ''} />;

  return (
    <div ref={top} className="container-x scroll-mt-28 pb-24">
      <div className="mx-auto max-w-5xl">
        <FlightProgress step={step} />

        <div className="relative mt-10 min-h-[460px]">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ x: dir * 120, opacity: 0, filter: 'blur(6px)' }}
              animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ x: dir * -120, opacity: 0, filter: 'blur(6px)' }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            >
              {step === 0 && (
                <section aria-label="Choose a package">
                  <h2 className="display mb-6 text-[clamp(1.8rem,4vw,3rem)]">What would you like to book?</h2>
                  <PackagePick value={slug} onChange={setSlug} />
                </section>
              )}
              {step === 1 && (
                <section aria-label="Choose a date" className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="display mb-6 text-[clamp(1.8rem,4vw,3rem)]">{pkg.kind === 'course' ? 'When should the course start?' : 'Pick your flying day'}</h2>
                    <DatePicker value={date} onChange={setDate} />
                    {touched && !date && <p className="mt-3 text-sm text-[#ff9a8a]">Please choose a date.</p>}
                  </div>
                  {pkg.kind === 'flight' && (
                    <div>
                      <p className="hud mb-3 mt-2 text-white/50 md:mt-24">Preferred time</p>
                      <div className="space-y-3">
                        {SLOTS.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSlot(s.id)}
                            aria-pressed={slot === s.id}
                            className={`relative flex w-full items-center justify-between overflow-hidden rounded-2xl border p-4 text-left ${slot === s.id ? 'border-dawn' : 'border-white/12'}`}
                          >
                            {slot === s.id && <motion.span layoutId="slot-sel" className="absolute inset-0 bg-dawn/10" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                            <span className="relative">
                              <span className="block font-medium">{s.id}</span>
                              <span className="text-sm text-white/55">{s.note}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-white/45">Exact slot times are confirmed on WhatsApp — they depend on the day&apos;s wind.</p>
                    </div>
                  )}
                </section>
              )}
              {step === 2 && (
                <section aria-label="Number of people" className="flex flex-col items-center text-center">
                  <h2 className="display text-[clamp(1.8rem,4vw,3rem)]">{pkg.kind === 'course' ? 'How many students?' : 'How many flyers?'}</h2>
                  <div className="mt-10 flex items-center gap-6">
                    <button type="button" onClick={() => setPersons((p) => Math.max(1, p - 1))} className="grid h-16 w-16 place-items-center rounded-full border border-white/20 text-3xl hover:border-white/60" aria-label="Fewer">
                      −
                    </button>
                    <div className="relative h-28 w-28 overflow-hidden">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={persons}
                          initial={{ y: 60, opacity: 0, rotateX: -60 }}
                          animate={{ y: 0, opacity: 1, rotateX: 0 }}
                          exit={{ y: -60, opacity: 0, rotateX: 60 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                          className="display absolute inset-0 grid place-items-center text-8xl"
                        >
                          {persons}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <button type="button" onClick={() => setPersons((p) => Math.min(12, p + 1))} className="grid h-16 w-16 place-items-center rounded-full border border-white/20 text-3xl hover:border-white/60" aria-label="More">
                      +
                    </button>
                  </div>
                  <p className="mt-8 text-white/60">
                    {inr(pkg.price)} × {persons} =
                  </p>
                  <p className="display mt-1 text-5xl text-sun">
                    <Total value={total} />
                  </p>
                  <p className="mt-4 max-w-sm text-sm text-white/45">Group larger than 12? Mention it in the notes and we&apos;ll get back to you.</p>
                </section>
              )}
              {step === 3 && (
                <section aria-label="Your details" className="mx-auto max-w-2xl">
                  <h2 className="display mb-4 text-[clamp(1.8rem,4vw,3rem)]">Who&apos;s flying?</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full name" name="name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={touched && form.name.trim().length < 2 ? 'Please enter your name.' : undefined} />
                    <Field
                      label="Phone / WhatsApp"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      error={touched && !phoneOk ? 'Enter a valid phone number (10+ digits).' : undefined}
                    />
                    <Field label="Email (optional)" name="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={touched && !emailOk ? 'That email looks off.' : undefined} className="md:col-span-2" />
                    <Field label="Notes — weights, pickup, questions (optional)" name="notes" textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="md:col-span-2" />
                  </div>
                </section>
              )}
              {step === 4 && (
                <section aria-label="Confirm booking" className="grid gap-8 md:grid-cols-5">
                  <div className="md:col-span-3">
                    <h2 className="display mb-6 text-[clamp(1.8rem,4vw,3rem)]">Ready for take-off?</h2>
                    <dl className="glass divide-y divide-white/10 rounded-2xl">
                      {[
                        [pkg.kind === 'course' ? 'Course' : 'Flight', pkg.name],
                        ['Date', `${date ? fmtDate(date) : '-'}${pkg.kind === 'flight' ? ` · ${slot}` : ''}`],
                        [pkg.kind === 'course' ? 'Students' : 'People', String(persons)],
                        ['Name', form.name],
                        ['Phone', form.phone],
                        ...(form.email ? [['Email', form.email]] : []),
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-6 px-5 py-4">
                          <dt className="text-white/50">{k}</dt>
                          <dd className="text-right font-medium">{v}</dd>
                        </div>
                      ))}
                      <div className="flex items-end justify-between px-5 py-5">
                        <dt className="hud text-white/50">Total</dt>
                        <dd className="display text-4xl text-sun">{inr(total)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="md:col-span-2">
                    <p className="hud mb-3 text-white/50">Message preview</p>
                    <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#0b1a12] p-4 font-sans text-sm text-white/80" data-lenis-prevent>
                      {message}
                    </pre>
                    <p className="mt-3 text-sm text-white/45">This opens WhatsApp with your booking filled in. Nothing is paid on this website — we confirm everything in the chat.</p>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
          <button type="button" onClick={() => next(-1)} disabled={step === 0} className="rounded-full border border-white/20 px-6 py-3 disabled:opacity-30">
            ← Back
          </button>
          <p className="hud hidden text-white/45 sm:block">
            {pkg.name} · <Total value={total} />
          </p>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => next(1)} className={`rounded-full px-7 py-3 font-semibold transition-opacity ${valid ? 'bg-snow text-ink' : 'bg-white/20 text-white/60'}`}>
              Continue →
            </button>
          ) : (
            <button type="button" onClick={send} data-cursor="book" className="flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 font-semibold text-ink">
              Send on WhatsApp ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Success({ name, pkg, date }: { name: string; pkg: string; date: string }) {
  const words = 'See you in the sky'.split(' ');
  return (
    <div className="container-x relative flex min-h-[70svh] flex-col items-center justify-center pb-24 text-center">
      <Confetti />
      <motion.svg viewBox="0 0 60 40" className="h-16 w-24" initial={{ x: -300, y: 80, rotate: -12, opacity: 0 }} animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 60, damping: 12 }} aria-hidden>
        <path d="M3 14 C 14 2, 46 2, 57 14 L 53 17 C 43 8, 17 8, 7 17 Z" fill="#ff7a2f" />
        <path d="M7 17 L 30 36 L 53 17" stroke="#fff" strokeWidth="1.2" fill="none" />
        <circle cx="30" cy="37" r="3" fill="#fff" />
      </motion.svg>
      <h2 className="display mt-8 flex flex-wrap justify-center gap-x-[0.3em] text-[clamp(2.8rem,9vw,8rem)]">
        {words.map((w, i) => (
          <span key={w} className="inline-block overflow-hidden pb-2">
            <motion.span className="inline-block" initial={{ y: '110%', rotate: 8 }} animate={{ y: 0, rotate: 0 }} transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 120, damping: 16 }}>
              {w}
            </motion.span>
          </span>
        ))}
      </h2>
      <motion.p className="mt-6 max-w-lg text-lg text-white/75" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
        Thanks{name ? `, ${name.split(' ')[0]}` : ''}! Your {pkg} request{date ? ` for ${date}` : ''} is on its way to us on WhatsApp. We&apos;ll confirm your slot and pickup there.
      </motion.p>
      <motion.div className="mt-10 flex flex-wrap justify-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
        <TLink href="/experience-bir" className="rounded-full bg-snow px-6 py-3 font-semibold text-ink">
          Plan the rest of your trip
        </TLink>
        <TLink href="/" className="rounded-full border border-white/25 px-6 py-3">
          Back home
        </TLink>
      </motion.div>
    </div>
  );
}
