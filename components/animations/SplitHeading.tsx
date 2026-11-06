'use client';

import { createElement, useEffect, useRef, type ReactNode } from 'react';
import { gsap, SplitText, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

type Props = {
  as?: Tag;
  children: ReactNode;
  className?: string;
  /** play as soon as the screen is uncovered (hero headings) instead of on scroll */
  immediate?: boolean;
  delay?: number;
  stagger?: number;
  id?: string;
};

/**
 * Every heading on the site: characters rise out of a line mask with a slight
 * rotation, staggered — powered by GSAP SplitText (auto re-splits on resize).
 */
export default function SplitHeading({ as = 'h2', children, className, immediate, delay = 0, stagger = 0.022, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      el.style.visibility = 'visible';
      return;
    }
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        SplitText.create(el, {
          type: 'lines,words,chars',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: 'visible' });
            return gsap.from(self.chars, {
              yPercent: 118,
              rotate: 7,
              transformOrigin: '0% 100%',
              duration: 1.15,
              ease: 'expo.out',
              stagger,
              delay,
              scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 88%', once: true },
            });
          },
        });
      });
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, [immediate, delay, stagger]);

  return createElement(as, { ref, className, 'data-split': '', id }, children);
}
