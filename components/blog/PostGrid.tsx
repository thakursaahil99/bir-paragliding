'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import type { BlogPost } from '@/lib/blog';
import Img from '../animations/Img';
import { TLink } from '../layout/Transition';

const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Cards tip up from a flat, perspective-tilted plane as they enter; images zoom on hover. */
export default function PostGrid({ posts, noLead = false }: { posts: BlogPost[]; noLead?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-post]').forEach((el, i) => {
          gsap.from(el, {
            rotateX: 38,
            y: 120,
            autoAlpha: 0,
            transformOrigin: '50% 100%',
            duration: 1.3,
            ease: 'expo.out',
            delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });
      }, root);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  const lead = noLead ? null : posts[0];
  const rest = noLead ? posts : posts.slice(1);
  return (
    <div ref={root} className="container-x pb-24 [perspective:1400px]">
      {lead && (
      <TLink href={`/blog/${lead.slug}`} data-post className="group grid overflow-hidden rounded-[2rem] border border-white/10 bg-slate md:grid-cols-2" data-cursor="view" data-cursor-text="Read">
        <div className="relative aspect-[16/11] overflow-hidden md:aspect-auto md:min-h-[440px]">
          <Img src={lead.image} alt={lead.title} sizes="(min-width: 768px) 50vw, 100vw" priority className="transition-transform duration-[1.4s] ease-[var(--ease-glide)] group-hover:scale-110" />
        </div>
        <div className="flex flex-col justify-end p-7 md:p-12">
          <p className="hud text-dawn">
            Latest · {lead.tag} · {lead.minutes} min read
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,3.4vw,3rem)] font-bold leading-tight">{lead.title}</h2>
          <p className="mt-4 text-white/65">{lead.excerpt}</p>
          <p className="hud mt-8 text-white/40">{fmt(lead.date)}</p>
        </div>
      </TLink>
      )}
      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <TLink key={p.slug} href={`/blog/${p.slug}`} data-post className="group block" data-cursor="view" data-cursor-text="Read">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
              <Img src={p.image} alt={p.title} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="transition-transform duration-[1.4s] ease-[var(--ease-glide)] group-hover:scale-110" />
              <span className="hud absolute left-4 top-4 rounded-full bg-ink/60 px-3 py-1.5 backdrop-blur">{p.tag}</span>
            </div>
            <p className="hud mt-5 text-white/40">
              {fmt(p.date)} · {p.minutes} min
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold leading-snug transition-colors group-hover:text-sun">{p.title}</h3>
            <p className="mt-2 text-white/60">{p.excerpt}</p>
          </TLink>
        ))}
      </div>
    </div>
  );
}
