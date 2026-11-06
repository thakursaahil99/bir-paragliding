'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { site, waLink } from '@/lib/site';
import Field from '../ui/Field';
import Magnetic from '../animations/Magnetic';

const TOPICS = ['Tandem flight', 'Pilot course', 'Stay / camping', 'Travel', 'Something else'];

/** Floating-label form; sends as a WhatsApp message (with an email fallback). */
export default function ContactForm() {
  const [f, setF] = useState({ name: '', phone: '', email: '', message: '' });
  const [topic, setTopic] = useState(TOPICS[0]);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const ok = f.name.trim().length > 1 && f.message.trim().length > 4 && (f.phone.replace(/\D/g, '').length >= 10 || /.+@.+\..+/.test(f.email));

  const text = `Hi Bir Paragliding! (${topic})\n${f.message}\n\n— ${f.name}${f.phone ? `, ${f.phone}` : ''}${f.email ? `, ${f.email}` : ''}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!ok) return;
    window.open(waLink(text), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <form onSubmit={submit} noValidate className="relative">
      <fieldset>
        <legend className="hud text-white/50">I&apos;m asking about</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button key={t} type="button" onClick={() => setTopic(t)} aria-pressed={topic === t} className="relative rounded-full border border-white/15 px-4 py-2 text-sm">
              {topic === t && <motion.span layoutId="topic" className="absolute inset-0 rounded-full bg-dawn" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
              <span className={`relative ${topic === t ? 'text-ink' : 'text-white/75'}`}>{t}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Your name" name="c-name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={touched && f.name.trim().length < 2 ? 'Please add your name.' : undefined} />
        <Field label="Phone / WhatsApp" name="c-phone" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <Field
          label="Email"
          name="c-email"
          type="email"
          autoComplete="email"
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          className="md:col-span-2"
          hint="Phone or email — whichever you prefer we reply on."
          error={touched && !(f.phone.replace(/\D/g, '').length >= 10 || /.+@.+\..+/.test(f.email)) ? 'Add a phone number or a valid email so we can reply.' : undefined}
        />
        <Field label="Your message" name="c-message" textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className="md:col-span-2" error={touched && f.message.trim().length < 5 ? 'Tell us a little more.' : undefined} />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Magnetic>
          <button type="submit" data-cursor="book" data-cursor-text="Send" className="rounded-full bg-gradient-to-r from-dawn to-ember px-7 py-3.5 font-semibold text-ink">
            <span data-magnetic-inner className="block">
              Send via WhatsApp ↗
            </span>
          </button>
        </Magnetic>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${topic}`)}&body=${encodeURIComponent(text)}`}
          className="text-sm text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white"
        >
          or send by email instead
        </a>
      </div>

      <AnimatePresence>
        {sent && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-xl border border-leaf/40 bg-leaf/10 px-4 py-3 text-leaf" role="status">
            WhatsApp opened with your message — hit send there and we&apos;ll reply soon.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
