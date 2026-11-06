'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { gsap, ScrollTrigger, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { gallery, galleryCats, type GalleryCat } from '@/lib/site';
import { imageMeta } from '@/lib/blur';
import Img from '../animations/Img';
import Lightbox from './Lightbox';
import SplitHeading from '../animations/SplitHeading';

export default function GalleryApp() {
  const [cat, setCat] = useState<GalleryCat>('All');
  const [open, setOpen] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const items = useMemo(() => (cat === 'All' ? gallery : gallery.filter((g) => g.cat === cat)), [cat]);

  // masonry: staggered blur → sharp reveal, batched as tiles enter
  useEffect(() => {
    if (prefersReduced()) return;
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const tiles = gsap.utils.toArray<HTMLElement>('[data-g-item]');
        gsap.set(tiles, { opacity: 0, y: 60, filter: 'blur(18px)', scale: 1.04 });
        ScrollTrigger.batch(tiles, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
        });
        ScrollTrigger.refresh();
      }, grid);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, [items]);

  return (
    <section className="relative pb-24 pt-24 md:pt-32" aria-labelledby="grid-title">
      <div className="container-x">
        <p className="hud text-dawn">Browse by theme</p>
        <SplitHeading id="grid-title" className="display mt-4 text-[clamp(2.2rem,5.5vw,5rem)]">
          Every frame, filtered
        </SplitHeading>
      </div>
      <div className="container-x sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="no-scrollbar glass -mx-1 flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5" role="tablist" aria-label="Filter photos">
          {galleryCats.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className="relative shrink-0 rounded-full px-4 py-2 text-sm">
              {cat === c && <motion.span layoutId="g-cat" className="absolute inset-0 rounded-full bg-snow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className={`relative z-10 ${cat === c ? 'text-ink' : 'text-white/70'}`}>{c}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="container-x mt-6">
          <div key={cat} ref={grid} className="columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-4">
            {items.map((s, i) => {
              const m = imageMeta[s.src];
              return (
                <button
                  key={s.src}
                  data-g-item
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl"
                  data-cursor="view"
                  aria-label={`Open: ${s.alt}`}
                >
                  <motion.div layoutId={`g-${s.src}`} className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: m ? `${m.w} / ${m.h}` : '4 / 3' }}>
                    <Img src={s.src} alt={s.alt} sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-[1.2s] ease-[var(--ease-glide)] group-hover:scale-[1.06]" />
                  </motion.div>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/80 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <span className="text-left text-sm">{s.alt}</span>
                    <span className="hud text-white/60">{s.cat}</span>
                  </span>
                </button>
              );
            })}
          </div>
      </div>

      <AnimatePresence>{open !== null && <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
