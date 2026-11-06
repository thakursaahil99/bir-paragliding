'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '@/lib/gsap';
import { whenReady } from '@/lib/store';
import { journey } from '@/lib/site';
import SplitHeading from '@/components/animations/SplitHeading';
import Img from '@/components/animations/Img';

// Billing (top) → thermal loop → valley S-turns → Bir landing (bottom)
const TRACK =
  'M200,40 C140,110 290,180 236,268 C214,304 168,318 172,282 C176,244 252,246 262,286 C272,328 226,362 196,350 C150,332 112,420 158,500 C204,580 330,598 300,690 C276,766 150,790 176,880 C186,914 198,936 200,960';
const STOPS = [0, 0.33, 0.66, 1];

export default function FlightJourney() {
  const section = useRef<HTMLElement>(null);
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const [active, setActive] = useState(0);

  // checkpoint positions along the track
  useEffect(() => {
    const path = section.current!.querySelector<SVGPathElement>('[data-track]')!;
    const len = path.getTotalLength();
    setDots(STOPS.map((s) => path.getPointAtLength(s * len)));
  }, []);

  useEffect(() => {
    const el = section.current!;
    const path = el.querySelector<SVGPathElement>('[data-track]')!;
    const glider = el.querySelector<SVGGElement>('[data-glider]')!;
    const alt = el.querySelector<HTMLElement>('[data-j-alt]');
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    const place = (p: number) => {
      const l = p * len;
      const a = path.getPointAtLength(l);
      const b = path.getPointAtLength(Math.min(len, l + 1.5));
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI - 90;
      glider.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang * 0.5})`);
      path.style.strokeDashoffset = `${len - l}`;
      if (alt) alt.textContent = Math.round(2400 - p * 1000).toLocaleString('en-IN');
      const idx = p >= 0.83 ? 3 : p >= 0.5 ? 2 : p >= 0.17 ? 1 : 0;
      setActive(idx);
    };

    if (prefersReduced()) {
      place(1);
      return;
    }
    place(0);
    let ctx: gsap.Context | undefined;
    const off = whenReady(() => {
      ctx = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: '+=320%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            onUpdate: (self) => place(self.progress),
          },
        });
      }, el);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, []);

  // iris-open the active photo, slide the copy
  const prev = useRef(0);
  useEffect(() => {
    const el = section.current!;
    const imgs = el.querySelectorAll<HTMLElement>('[data-j-img]');
    const texts = el.querySelectorAll<HTMLElement>('[data-j-text]');
    const from = prev.current;
    if (from === active) return;
    const dir = active > from ? 1 : -1;
    const dot = dots[active];
    const origin = dot ? `${(dot.x / 400) * 100}% ${(dot.y / 1000) * 100}%` : '50% 50%';
    imgs.forEach((im, i) => (im.style.zIndex = i === active ? '3' : i === from ? '2' : '1'));
    gsap.fromTo(imgs[active], { clipPath: `circle(0% at ${origin})` }, { clipPath: `circle(150% at ${origin})`, duration: 1.2, ease: 'expo.inOut' });
    gsap.fromTo(imgs[active].firstElementChild, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'expo.out' });
    gsap.to(texts[from], { yPercent: -40 * dir, autoAlpha: 0, duration: 0.45, ease: 'power2.in' });
    gsap.fromTo(texts[active], { yPercent: 40 * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, delay: 0.25, ease: 'expo.out' });
    prev.current = active;
  }, [active, dots]);

  return (
    <section ref={section} className="relative h-[100svh] overflow-hidden bg-[radial-gradient(100%_70%_at_20%_0%,#14284d_0%,#060a12_70%)]" aria-labelledby="journey-title">
      <div className="container-x grid h-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 pb-8 pt-24 md:grid-cols-12 md:grid-rows-1 md:gap-10 md:pt-28">
        {/* track */}
        <div className="relative hidden md:col-span-3 md:block">
          <svg viewBox="0 0 400 1000" className="h-full w-full overflow-visible" aria-hidden>
            <path d={TRACK} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" strokeDasharray="3 9" />
            <defs>
              <linearGradient id="j-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8ec5ff" />
                <stop offset="0.5" stopColor="#ffc56b" />
                <stop offset="1" stopColor="#ff7a2f" />
              </linearGradient>
            </defs>
            <path data-track d={TRACK} fill="none" stroke="url(#j-grad)" strokeWidth="3" strokeLinecap="round" />
            {dots.map((d, i) => (
              <g key={i} transform={`translate(${d.x} ${d.y})`}>
                <circle r={i <= active ? 11 : 7} fill={i <= active ? '#ff7a2f' : '#0a1220'} stroke={i <= active ? '#ffc56b' : 'rgba(255,255,255,.35)'} strokeWidth="2" style={{ transition: 'all .5s' }} />
                <text x={i % 2 ? -22 : 22} y="5" textAnchor={i % 2 ? 'end' : 'start'} className="font-mono" fontSize="18" fill={i <= active ? '#fff' : 'rgba(255,255,255,.4)'} style={{ transition: 'fill .5s' }}>
                  {journey[i].label}
                </text>
              </g>
            ))}
            <g data-glider>
              <g transform="translate(-20 -18)">
                <path d="M2 12 C 10 2, 30 2, 38 12 L 35 14 C 28 7, 12 7, 5 14 Z" fill="#ff7a2f" />
                <path d="M5 14 L 20 30 L 35 14" stroke="#fff" strokeWidth="1" fill="none" />
                <circle cx="20" cy="31" r="3" fill="#fff" />
              </g>
            </g>
          </svg>
        </div>

        {/* copy */}
        <div className="flex flex-col justify-between md:col-span-4">
          <div>
            <p className="hud text-dawn">On the day</p>
            <SplitHeading id="journey-title" className="display mt-3 text-[clamp(2rem,3.4vw,3.6rem)]">
              Your flight, minute by minute
            </SplitHeading>
          </div>
          <div className="relative mt-6 min-h-[220px] md:mt-0">
            {journey.map((j, i) => (
              <div key={j.id} data-j-text className="absolute inset-x-0 bottom-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                <p className="hud text-white/50">
                  0{i + 1} · {j.label} · {j.alt}
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold md:text-4xl">{j.title}</h3>
                <p className="mt-4 max-w-md text-white/70">{j.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="glass rounded-2xl px-4 py-3">
              <p className="hud text-white/50">Altitude</p>
              <p className="font-mono text-2xl tabular-nums">
                <span data-j-alt>2,400</span>
                <span className="text-sm text-white/40"> m</span>
              </p>
            </div>
            <div className="flex gap-1.5">
              {journey.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-8 bg-dawn' : 'w-1.5 bg-white/30'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* photos */}
        <div className="relative min-h-0 overflow-hidden rounded-[2rem] md:col-span-5">
          {journey.map((j, i) => (
            <div
              key={j.id}
              data-j-img
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: i === 0 ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)', zIndex: i === 0 ? 3 : 1 }}
            >
              <div className="absolute inset-0">
                <Img src={j.image} alt={j.title} sizes="(min-width: 768px) 42vw, 92vw" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
              <p className="hud absolute bottom-5 left-5 text-white/80">{j.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
