'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const isMonsoon = (d: Date) => d.getMonth() === 6 || d.getMonth() === 7 || (d.getMonth() === 8 && d.getDate() <= 15);
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/** Month grid that slides between months; monsoon closure days are hatched and disabled. */
export default function DatePicker({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const max = useMemo(() => new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()), [today]);
  const [view, setView] = useState(() => {
    const v = value ?? today;
    return { y: v.getFullYear(), m: v.getMonth() };
  });
  const [dir, setDir] = useState(1);

  const days = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(view.y, view.m + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.y, view.m, i + 1))] as (Date | null)[];
  }, [view]);

  const shift = (d: number) => {
    setDir(d);
    setView((v) => {
      const n = new Date(v.y, v.m + d, 1);
      return { y: n.getFullYear(), m: n.getMonth() };
    });
  };
  const canPrev = new Date(view.y, view.m, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(view.y, view.m + 1, 1) <= max;

  return (
    <div className="glass w-full max-w-md rounded-[1.75rem] p-5">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 disabled:opacity-25" aria-label="Previous month">
          ←
        </button>
        <div className="relative h-7 w-48 overflow-hidden text-center">
          <AnimatePresence custom={dir} initial={false} mode="popLayout">
            <motion.p
              key={`${view.y}-${view.m}`}
              custom={dir}
              initial={{ y: dir * 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: dir * -24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="absolute inset-0 font-display text-lg font-bold"
              aria-live="polite"
            >
              {MONTHS[view.m]} {view.y}
            </motion.p>
          </AnimatePresence>
        </div>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 disabled:opacity-25" aria-label="Next month">
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center">
        {WEEK.map((w) => (
          <span key={w} className="hud py-1 text-white/40">
            {w}
          </span>
        ))}
      </div>
      <div className="relative mt-1 h-[264px] overflow-hidden">
        <AnimatePresence custom={dir} initial={false} mode="popLayout">
          <motion.div
            key={`${view.y}-${view.m}`}
            custom={dir}
            initial={{ x: `${dir * 100}%`, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: `${dir * -100}%`, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="absolute inset-0 grid grid-cols-7 content-start gap-y-1"
          >
            {days.map((d, i) => {
              if (!d) return <span key={i} />;
              const past = d < today || d > max;
              const closed = isMonsoon(d);
              const sel = value && d.getTime() === startOfDay(value).getTime();
              const disabled = past || closed;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(d)}
                  title={closed ? 'Monsoon — no flying' : undefined}
                  aria-label={`${fmtDate(d)}${closed ? ' — closed for monsoon' : ''}`}
                  aria-pressed={!!sel}
                  className={`relative mx-auto grid h-10 w-10 place-items-center rounded-full text-sm transition-colors ${
                    disabled ? 'cursor-not-allowed text-white/20' : 'hover:bg-white/10'
                  } ${closed && !past ? 'bg-[repeating-linear-gradient(135deg,rgba(255,90,31,.18)_0_3px,transparent_3px_7px)]' : ''}`}
                >
                  {sel && <motion.span layoutId="day-sel" className="absolute inset-0 rounded-full bg-gradient-to-br from-sun to-dawn" transition={{ type: 'spring', stiffness: 500, damping: 34 }} />}
                  <span className={`relative ${sel ? 'font-bold text-ink' : ''}`}>{d.getDate()}</span>
                  {d.getTime() === today.getTime() && !sel && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-dawn" />}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="hud mt-2 flex items-center gap-2 text-white/45">
        <span className="h-3 w-3 rounded-sm bg-[repeating-linear-gradient(135deg,rgba(255,90,31,.5)_0_2px,transparent_2px_4px)]" /> 1 Jul – 15 Sep · monsoon, no flying
      </p>
    </div>
  );
}
