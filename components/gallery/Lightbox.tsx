'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, animate } from 'motion/react';
import Img from '../animations/Img';
import { lenisRef } from '@/lib/store';
import { imageMeta } from '@/lib/blur';

export type Shot = { src: string; alt: string; cat: string };

const variants = {
  enter: (d: number) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0, scale: 0.92 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0, scale: 0.92 }),
};

/** Fullscreen viewer: FLIP from the thumbnail, swipe/drag between photos, double-tap / wheel / pinch zoom. */
export default function Lightbox({ items, index, onIndex, onClose }: { items: Shot[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const [dir, setDir] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const scale = useMotionValue(1);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const shot = items[index];
  const meta = imageMeta[shot.src];
  const ratio = meta ? meta.w / meta.h : 1.5;

  const resetZoom = useCallback(() => {
    setZoomed(false);
    animate(scale, 1, { type: 'spring', stiffness: 300, damping: 30 });
    animate(panX, 0);
    animate(panY, 0);
  }, [scale, panX, panY]);

  const go = useCallback(
    (d: number) => {
      resetZoom();
      setDir(d);
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex, resetZoom]
  );

  useEffect(() => {
    lenisRef.current?.stop();
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', k);
    return () => {
      window.removeEventListener('keydown', k);
      lenisRef.current?.start();
    };
  }, [go, onClose]);

  const setZoom = (z: number) => {
    const v = Math.min(4, Math.max(1, z));
    animate(scale, v, { type: 'spring', stiffness: 300, damping: 30 });
    setZoomed(v > 1.01);
    if (v <= 1.01) {
      animate(panX, 0);
      animate(panY, 0);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      data-lenis-prevent
    >
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <p className="hud text-white/60">
          {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')} · {shot.cat}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setZoom(zoomed ? 1 : 2.2)} className="hud rounded-full border border-white/20 px-4 py-2 hover:border-white/60">
            {zoomed ? 'Zoom out' : 'Zoom in'}
          </button>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl hover:bg-white/20" aria-label="Close viewer">
            ×
          </button>
        </div>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 md:px-20"
        onWheel={(e) => setZoom(scale.get() - e.deltaY * 0.0025)}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            const [a, b] = [e.touches[0], e.touches[1]];
            pinch.current = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s: scale.get() };
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && pinch.current) {
            const [a, b] = [e.touches[0], e.touches[1]];
            const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
            const v = Math.min(4, Math.max(1, (pinch.current.s * d) / pinch.current.d));
            scale.set(v);
            setZoomed(v > 1.01);
          }
        }}
        onTouchEnd={() => (pinch.current = null)}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={shot.src}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            className="relative max-h-full w-full"
            style={{ aspectRatio: ratio, maxWidth: `min(100%, calc((100svh - 170px) * ${ratio}))` }}
          >
            <motion.div
              layoutId={`g-${shot.src}`}
              className="absolute inset-0 overflow-hidden rounded-xl"
              style={{ scale, x: panX, y: panY }}
              drag={zoomed ? true : 'x'}
              dragElastic={zoomed ? 0.1 : 0.6}
              dragConstraints={zoomed ? { left: -600, right: 600, top: -400, bottom: 400 } : { left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (zoomed) return;
                if (info.offset.x < -90 || info.velocity.x < -500) go(1);
                else if (info.offset.x > 90 || info.velocity.x > 500) go(-1);
              }}
              onDoubleClick={() => setZoom(zoomed ? 1 : 2.4)}
              data-cursor="drag"
              data-cursor-text={zoomed ? 'Pan' : 'Drag'}
            >
              <Img src={shot.src} alt={shot.alt} sizes="100vw" priority className="pointer-events-none object-contain" draggable={false} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl hover:bg-white/20 md:grid" aria-label="Previous photo">
          ←
        </button>
        <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl hover:bg-white/20 md:grid" aria-label="Next photo">
          →
        </button>
      </div>

      <p className="px-4 pb-5 pt-3 text-center text-sm text-white/70 md:px-8">{shot.alt}</p>
    </motion.div>
  );
}
