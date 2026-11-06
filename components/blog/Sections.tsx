'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { useReady } from '@/lib/useReady';
import { posts, type BlogPost } from '@/lib/blog';
import { blogQuote } from '@/lib/extra';
import { waLink } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';
import Particles, { type FxMode } from '../fx/Particles';
import Img from '../animations/Img';
import { TLink } from '../layout/Transition';

const TAGS = ['Tandem', 'Seasons', 'Courses', 'Safety', 'Travel', 'Pricing', 'Thermals', 'Monsoon', 'Packing', 'Triund', 'Monasteries', 'Cafés', 'XC', 'First flight', 'Dhauladhar', 'Landing'];
const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/* ------------------------------------------------------------------ hero with vertical tag marquees */
export function BlogHero() {
  const cols = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (prefersReduced()) return;
    const st = cols.current.map(() => ({ y: 0 }));
    const tick = (_t: number, dt: number) => {
      cols.current.forEach((c, i) => {
        if (!c) return;
        const half = c.scrollHeight / 2;
        st[i].y += (i ? 0.5 : -0.5) * (dt / 16.67);
        if (st[i].y <= -half) st[i].y += half;
        if (st[i].y > 0) st[i].y -= half;
        c.style.transform = `translate3d(0,${st[i].y}px,0)`;
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return (
    <header className="relative overflow-hidden pb-14 pt-36 md:pt-44">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] gap-4 overflow-hidden opacity-60 [mask-image:linear-gradient(transparent,#000_20%,#000_80%,transparent)] md:flex">
        {[0, 1].map((k) => (
          <div key={k} className="flex-1 overflow-hidden">
            <div ref={(el) => void (cols.current[k] = el)} className="flex flex-col gap-4">
              {[...TAGS, ...TAGS].map((t, i) => (
                <span key={i} className={`rounded-2xl border px-5 py-4 font-display text-2xl font-bold ${i % 3 === 0 ? 'border-dawn/50 text-dawn' : 'border-white/15 text-white/70'}`}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="container-x relative">
        <nav aria-label="Breadcrumb" className="hud mb-6 flex items-center gap-2 text-white/60">
          <TLink href="/" className="hover:text-white">
            Home
          </TLink>
          <span aria-hidden>/</span>
          <span className="text-white" aria-current="page">
            Flight Log
          </span>
        </nav>
        <p className="hud text-dawn">Guides from the ridge</p>
        <SplitHeading as="h1" immediate className="display mt-4 max-w-3xl text-[clamp(2.8rem,8vw,8rem)]">
          The Flight Log
        </SplitHeading>
        <p className="mt-6 max-w-md text-lg text-white/70">Prices, seasons, routes and first-flight nerves — practical reads before you book.</p>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ featured post */
export function FeaturedPost({ post }: { post: BlogPost }) {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap.fromTo('[data-feat-img]', { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
    gsap.fromTo('[data-feat-inner]', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  return (
    <section ref={root} className="container-x pb-16" aria-label="Featured guide">
      <TLink href={`/blog/${post.slug}`} className="group grid overflow-hidden rounded-[2rem] border border-white/10 bg-slate md:grid-cols-5" data-cursor="view" data-cursor-text="Read">
        <div data-feat-img className="relative aspect-[16/10] overflow-hidden md:col-span-3 md:aspect-auto md:min-h-[480px]">
          <div data-feat-inner className="absolute inset-[-10%_0]">
            <Img src={post.image} alt={post.title} sizes="(min-width: 768px) 60vw, 100vw" priority className="transition-transform duration-[1.4s] ease-[var(--ease-glide)] group-hover:scale-105" />
          </div>
        </div>
        <div className="flex flex-col justify-end p-7 md:col-span-2 md:p-10">
          <p className="hud text-dawn">
            Latest · {post.tag} · {post.minutes} min read
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-bold leading-tight">{post.title}</h2>
          <p className="mt-4 text-white/65">{post.excerpt}</p>
          <p className="hud mt-8 flex items-center gap-3 text-white/50">
            {fmt(post.date)} <span className="h-px flex-1 bg-white/15" /> Read →
          </p>
        </div>
      </TLink>
    </section>
  );
}

/* ------------------------------------------------------------------ wavy quote */
export function JournalQuote() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    if (window.matchMedia('(pointer: coarse)').matches || prefersReduced()) return;
    const chars = [...el.querySelectorAll<HTMLElement>('[data-qc]')];
    const move = (e: PointerEvent) => {
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / 160);
        c.style.transform = `translateY(${-k * 18}px) rotate(${k * 6}deg)`;
        c.style.color = k > 0.05 ? `rgba(255,${197 - k * 60},${107 - k * 60},1)` : '';
      });
    };
    const leave = () => chars.forEach((c) => ((c.style.transform = ''), (c.style.color = '')));
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  useReady(root, (el) => {
    gsap.fromTo(el.querySelector('[data-qwrap]'), { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 40%', scrub: true } });
  });
  return (
    <section ref={root} className="relative py-24 md:py-36" aria-label="From the Flight Log">
      <div className="container-x">
        <p className="hud text-dawn">From the Flight Log</p>
        <blockquote
          data-qwrap
          className="mt-8 bg-[linear-gradient(90deg,#f4f7fb_0%,#f4f7fb_45%,rgba(255,255,255,.18)_55%,rgba(255,255,255,.18)_100%)] bg-[length:220%_100%] bg-clip-text font-display text-[clamp(1.8rem,4.4vw,4.2rem)] font-bold leading-[1.12] tracking-tight text-transparent [-webkit-background-clip:text]"
        >
          “
          {blogQuote.text.split(' ').map((w, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {w.split('').map((ch, ci) => (
                <span key={ci} data-qc className="inline-block transition-[transform,color] duration-200 ease-out">
                  {ch}
                </span>
              ))}
              &nbsp;
            </span>
          ))}
          ”
        </blockquote>
        <p className="hud mt-6 text-white/50">— {blogQuote.by}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ season guide tiles */
const GUIDES: { name: string; fx: FxMode; color: string; bg: string; slug: string }[] = [
  { name: 'Spring', fx: 'bokeh', color: '#ffb3c7', bg: 'linear-gradient(160deg,#2a6f6b,#f6b3a4)', slug: 'best-time-for-paragliding-in-bir' },
  { name: 'Monsoon', fx: 'wind', color: '#bcd6ff', bg: 'linear-gradient(160deg,#1b2733,#43566b)', slug: 'best-time-for-paragliding-in-bir' },
  { name: 'Autumn', fx: 'sparks', color: '#ffb35c', bg: 'linear-gradient(160deg,#7a2e0e,#f39c3d)', slug: 'best-time-for-paragliding-in-bir' },
  { name: 'Winter', fx: 'dust', color: '#ffffff', bg: 'linear-gradient(160deg,#16233f,#a9c3e8)', slug: 'best-time-for-paragliding-in-bir' },
];
export function SeasonGuides() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    gsap.from('[data-guide]', { y: 120, rotateY: 35, opacity: 0, transformOrigin: '0% 50%', duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
  });
  return (
    <section ref={root} className="relative bg-night py-24 md:py-32" aria-labelledby="sg-title">
      <div className="container-x">
        <p className="hud text-dawn">Read by season</p>
        <SplitHeading id="sg-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
          Pick your weather
        </SplitHeading>
        <div className="mt-12 grid gap-5 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-4">
          {GUIDES.map((g) => (
            <TLink key={g.name} href={`/blog/${g.slug}`} data-guide className="group relative block h-[360px] overflow-hidden rounded-[1.75rem]" style={{ background: g.bg }} data-cursor="view" data-cursor-text="Read">
              <Particles mode={g.fx} color={g.color} intensity={1.2} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="display text-5xl transition-transform duration-500 group-hover:-translate-y-2">{g.name}</p>
                <p className="hud mt-2 text-white/80">Season guide →</p>
              </div>
            </TLink>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ reading rings */
export function ReadingRings() {
  const root = useRef<HTMLElement>(null);
  useReady(root, (el) => {
    el.querySelectorAll<SVGCircleElement>('[data-ring]').forEach((c, i) => {
      const len = 2 * Math.PI * 26;
      const k = Number(c.dataset.k);
      gsap.fromTo(c, { strokeDashoffset: len }, { strokeDashoffset: len * (1 - k), duration: 1.6, delay: i * 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 70%', once: true } });
    });
  });
  return (
    <section ref={root} className="relative py-24 md:py-32" aria-labelledby="rr-title">
      <div className="container-x">
        <p className="hud text-dawn">Quick reads</p>
        <SplitHeading id="rr-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
          Under five minutes
        </SplitHeading>
        <ul className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {posts.map((p) => (
            <li key={p.slug}>
              <TLink href={`/blog/${p.slug}`} className="group flex items-center gap-6 py-5">
                <svg viewBox="0 0 60 60" className="h-14 w-14 shrink-0 -rotate-90" aria-hidden>
                  <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="5" />
                  <circle data-ring data-k={p.minutes / 5} cx="30" cy="30" r="26" fill="none" stroke="#ffc56b" strokeWidth="5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26} />
                </svg>
                <span className="font-mono text-sm text-white/50">{p.minutes} min</span>
                <span className="flex-1 font-display text-lg font-bold transition-colors group-hover:text-sun md:text-2xl">{p.title}</span>
                <span className="hud hidden text-white/40 sm:block">{p.tag}</span>
              </TLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ repelling tag cloud */
export function TagCloud() {
  const area = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = area.current!;
    if (window.matchMedia('(pointer: coarse)').matches || prefersReduced()) return;
    const tags = [...el.querySelectorAll<HTMLElement>('[data-tag]')];
    const setters = tags.map((t) => ({ x: gsap.quickTo(t, 'x', { duration: 0.6, ease: 'power3' }), y: gsap.quickTo(t, 'y', { duration: 0.6, ease: 'power3' }), t }));
    const move = (e: PointerEvent) => {
      setters.forEach(({ x, y, t }) => {
        const r = t.getBoundingClientRect();
        const dx = r.left + r.width / 2 - e.clientX;
        const dy = r.top + r.height / 2 - e.clientY;
        const d = Math.hypot(dx, dy);
        const f = Math.max(0, 1 - d / 220) * 70;
        x((dx / (d || 1)) * f);
        y((dy / (d || 1)) * f);
      });
    };
    const leave = () => setters.forEach(({ x, y }) => (x(0), y(0)));
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(60%_60%_at_50%_50%,#1b2f5c,#060a12)] py-24 md:py-32" aria-labelledby="tc-title">
      <div className="container-x text-center">
        <p className="hud text-dawn">Topics</p>
        <SplitHeading id="tc-title" className="display mx-auto mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
          Push the topics around
        </SplitHeading>
        <div ref={area} className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-3 py-8" data-cursor="drag" data-cursor-text="Push">
          {TAGS.map((t, i) => (
            <span key={t} data-tag className={`rounded-full border px-5 py-2.5 font-display font-bold ${i % 4 === 0 ? 'border-dawn bg-dawn/15 text-dawn text-2xl' : i % 3 === 0 ? 'border-sky/50 text-sky text-xl' : 'border-white/20 text-white/80 text-lg'}`}>
              #{t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ newsletter with paper plane */
export function Newsletter() {
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const plane = useRef<SVGSVGElement>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(waLink(`Hi Bir Paragliding! Please send me season updates and new guides.${name ? ` — ${name}` : ''}`), '_blank', 'noopener,noreferrer');
    setSent(true);
    if (plane.current && !prefersReduced()) gsap.fromTo(plane.current, { x: 0, y: 0, rotate: 0, opacity: 1 }, { x: 420, y: -260, rotate: -25, opacity: 0, duration: 1.3, ease: 'power2.in' });
  };
  return (
    <section className="relative overflow-hidden bg-snow py-24 text-ink md:py-32" aria-labelledby="nl-title">
      <div className="container-x grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="hud text-dawn">Season updates</p>
          <SplitHeading id="nl-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.6rem)]">
            Get the season digest
          </SplitHeading>
          <p className="mt-5 max-w-md text-ink/70">New guides, season openings and peak-week reminders — sent to your WhatsApp. No spam, just sky.</p>
        </div>
        <form onSubmit={submit} className="relative flex flex-col gap-4 rounded-[2rem] bg-ink p-6 text-snow sm:flex-row sm:items-center">
          <label className="flex-1">
            <span className="sr-only">Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="w-full rounded-full bg-white/10 px-5 py-4 outline-none placeholder:text-white/40 focus:bg-white/15" />
          </label>
          <button type="submit" className="relative flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-semibold text-ink">
            {sent ? 'Opened ✓' : 'Subscribe'}
            <svg ref={plane} viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
