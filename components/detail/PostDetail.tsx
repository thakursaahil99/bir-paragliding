'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, SplitText } from '@/lib/gsap';
import { useReady } from '@/lib/useReady';
import type { BlogBlock } from '@/lib/blog';
import { waLink } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';
import Img from '../animations/Img';
import Parallax from '../animations/Parallax';
import { TLink } from '../layout/Transition';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ------------------------------------------------------------------ key takeaways as sticky notes */
export function KeyTakeaways({ items }: { items: string[] }) {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap.from('[data-note]', { y: -220, rotate: (i) => [-14, 10, -6, 12][i % 4], opacity: 0, duration: 1.1, ease: 'bounce.out', stagger: 0.14, scrollTrigger: { trigger: el, start: 'top 75%', once: true } });
  });
  if (!items.length) return null;
  const colors = ['#ffe58a', '#ffc6a8', '#b8e3c4', '#bcd6ff'];
  return (
    <section ref={root} className="relative py-16" aria-labelledby="kt-title">
      <div className="container-x">
        <SplitHeading id="kt-title" className="display text-[clamp(1.8rem,3.4vw,3rem)]">
          In this guide
        </SplitHeading>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((t, i) => (
            <a key={t} href={`#${slug(t)}`} data-note className="relative block min-h-[150px] p-5 font-medium text-ink shadow-[0_20px_30px_-12px_rgba(0,0,0,.6)] transition-transform hover:-translate-y-1" style={{ background: colors[i % 4], transform: `rotate(${[-2, 1.5, -1, 2][i % 4]}deg)` }}>
              <span className="absolute left-1/2 top-[-10px] h-5 w-16 -translate-x-1/2 rotate-[-3deg] bg-white/60" aria-hidden />
              <span className="hud text-ink/50">0{i + 1}</span>
              <span className="mt-2 block font-display text-lg font-bold leading-snug">{t}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ article body with sticky TOC */
type Group = { t: 'p' | 'h2'; text: string } | { t: 'ul'; items: string[] };
export function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  const [active, setActive] = useState<string>('');
  const groups: Group[] = [];
  for (const b of blocks) {
    if (b.t === 'li') {
      const last = groups[groups.length - 1];
      if (last && last.t === 'ul') last.items.push(b.text);
      else groups.push({ t: 'ul', items: [b.text] });
    } else groups.push({ t: b.t, text: b.text });
  }
  const heads = blocks.filter((b) => b.t === 'h2').map((b) => b.text);
  useEffect(() => {
    const els = heads.map((h) => document.getElementById(slug(h))).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [heads]);
  return (
    <div className="container-x grid gap-12 py-16 lg:grid-cols-12">
      <aside className="hidden lg:col-span-3 lg:block">
        <nav className="sticky top-32" aria-label="Table of contents">
          <p className="hud text-white/45">Contents</p>
          <ol className="mt-4 space-y-1 border-l border-white/10">
            {heads.map((h) => (
              <li key={h}>
                <a href={`#${slug(h)}`} className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${active === slug(h) ? 'border-dawn text-white' : 'border-transparent text-white/50 hover:text-white'}`}>
                  {h}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
      <div id="article-body" className="max-w-3xl text-lg leading-relaxed text-white/80 lg:col-span-8 lg:col-start-5">
        {groups.map((b, i) =>
          b.t === 'h2' ? (
            <SplitHeading key={i} id={slug(b.text)} className="mb-4 mt-12 scroll-mt-28 font-display text-3xl font-bold leading-tight text-white">
              {b.text}
            </SplitHeading>
          ) : b.t === 'ul' ? (
            <ul key={i} className="my-6 space-y-3">
              {b.items.map((it) => (
                <li key={it} className="flex gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-dawn" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p key={i} className="my-5">
              {b.text}
            </p>
          )
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ pull quote with word scrub */
export function PullQuote({ text }: { text: string }) {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    const split = SplitText.create(el.querySelector('[data-pq]')!, { type: 'words' });
    gsap.fromTo(split.words, { opacity: 0.12, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)', stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 55%', scrub: true } });
  });
  return (
    <section ref={root} className="relative overflow-hidden bg-night py-24 md:py-32" aria-label="Pull quote">
      <div className="container-x">
        <span aria-hidden className="display block text-[8rem] leading-none text-dawn/40">“</span>
        <p data-pq className="-mt-10 max-w-5xl font-display text-[clamp(1.8rem,4vw,3.6rem)] font-bold leading-[1.15] tracking-tight">
          {text}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ parallax photo trio */
export function PhotoTrio({ images }: { images: string[] }) {
  return (
    <section className="relative overflow-hidden py-24" aria-label="Photos from Bir">
      <div className="container-x grid grid-cols-3 items-center gap-3 md:gap-6">
        {images.slice(0, 3).map((src, i) => (
          <div key={src} className={`relative overflow-hidden rounded-2xl ${i === 1 ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
            <Parallax speed={[22, -18, 30][i]} className="absolute inset-[-14%_0]">
              <div className="relative h-full w-full">
                <Img src={src} alt="" sizes="33vw" />
              </div>
            </Parallax>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ plan-it cards with cursor glow */
export function PlanIt() {
  const cards = [
    { k: 'Book', title: 'Reserve a flight', text: 'Pick a package and a date in five quick steps.', href: '/booking' },
    { k: 'Compare', title: 'See all packages', text: 'Three tandem flights and P1–P4 courses, side by side.', href: '/packages' },
    { k: 'Ask', title: 'Message a pilot', text: 'Questions about weather, weight or timing? Just ask.', href: waLink('Hi Bir Paragliding! I read your guide and have a question:') },
  ];
  return (
    <section className="relative py-24" aria-labelledby="plan-title">
      <div className="container-x">
        <p className="hud text-dawn">Next steps</p>
        <SplitHeading id="plan-title" className="display mt-4 text-[clamp(2rem,4.4vw,4rem)]">
          Turn the read into a flight
        </SplitHeading>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map((c) => {
            const inner = (
              <>
                <span className="hud text-dawn">{c.k}</span>
                <span className="mt-3 block font-display text-2xl font-bold">{c.title}</span>
                <span className="mt-2 block text-white/65">{c.text}</span>
                <span className="mt-8 block text-sm text-white/80">→</span>
              </>
            );
            const cls =
              'group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 [--gx:50%] [--gy:50%] before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 before:[background:radial-gradient(240px_circle_at_var(--gx)_var(--gy),rgba(255,122,47,.25),transparent_70%)] hover:before:opacity-100';
            const onMove = (e: React.PointerEvent<HTMLElement>) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`);
            };
            return c.href.startsWith('http') ? (
              <a key={c.k} href={c.href} target="_blank" rel="noreferrer" className={cls} onPointerMove={onMove}>
                {inner}
              </a>
            ) : (
              <TLink key={c.k} href={c.href} className={cls} onPointerMove={onMove}>
                {inner}
              </TLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
