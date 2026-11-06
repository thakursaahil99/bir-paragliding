'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import Img from './Img';

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** direction the clip opens toward */
  from?: 'bottom' | 'top' | 'left' | 'right';
  cursor?: string;
};

const clips = {
  bottom: 'inset(100% 0% 0% 0%)',
  top: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
};

/** Every image: clip-path wipe open + the photo settles from 1.3x scale. */
export default function RevealImage({ src, alt, className, imgClassName, sizes, priority, from = 'bottom', cursor }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !inner.current) return;
    if (prefersReduced()) {
      el.style.clipPath = 'none';
      return;
    }
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
        tl.fromTo(el, { clipPath: clips[from] }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }).fromTo(
          inner.current,
          { scale: 1.32 },
          { scale: 1, duration: 1.8, ease: 'expo.out' },
          0.1
        );
      });
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, [from]);

  return (
    <div ref={wrap} data-reveal="" data-cursor={cursor} className={['relative overflow-hidden', className].filter(Boolean).join(' ')}>
      <div ref={inner} className="absolute inset-0 will-change-transform">
        <Img src={src} alt={alt} sizes={sizes} priority={priority} className={imgClassName} />
      </div>
    </div>
  );
}
