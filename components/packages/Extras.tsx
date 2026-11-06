'use client';

import { useState } from 'react';
import { extras, inr, waLink } from '@/lib/site';
import SplitHeading from '../animations/SplitHeading';
import Img from '../animations/Img';

/** Add-ons as an accordion of photo blades: the active blade widens, the rest fold to slivers. */
export default function Extras() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative py-24 md:py-32" aria-labelledby="extras-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="hud text-dawn">Make it a trip</p>
            <SplitHeading id="extras-title" className="display mt-4 text-[clamp(2.2rem,5vw,4.4rem)]">
              Camps, stays & the ride up
            </SplitHeading>
          </div>
          <p className="max-w-sm text-white/60">Add any of these to your booking in the same WhatsApp chat.</p>
        </div>

        <div className="mt-12 flex flex-col gap-3 md:h-[520px] md:flex-row">
          {extras.map((x, i) => {
            const on = active === i;
            return (
              <article
                key={x.name}
                tabIndex={0}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                data-active={on}
                aria-label={`${x.group}: ${x.name}`}
                className={`group relative h-24 overflow-hidden rounded-[1.5rem] text-left transition-[flex-grow,height] duration-700 ease-[var(--ease-glide)] md:h-auto md:min-w-0 ${
                  on ? 'h-80 md:flex-[5]' : 'md:flex-[1]'
                }`}
              >
                <Img src={x.image} alt={x.name} sizes="(min-width: 768px) 45vw, 100vw" className={`transition-transform duration-[1.2s] ${on ? 'scale-100' : 'scale-125'}`} />
                <div className={`absolute inset-0 transition-colors duration-700 ${on ? 'bg-gradient-to-t from-ink/90 via-ink/30 to-transparent' : 'bg-ink/60'}`} />
                <span
                  className={`hud absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-white/80 transition-opacity duration-300 md:block ${on ? 'opacity-0' : 'opacity-100'}`}
                >
                  {x.group} · {x.name}
                </span>
                <span className={`hud absolute left-5 top-1/2 -translate-y-1/2 text-white/85 md:hidden ${on ? 'opacity-0' : ''}`}>
                  {x.group} · {x.name}
                </span>
                <div className={`absolute inset-x-0 bottom-0 p-6 transition-[opacity,transform] duration-500 ${on ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-6 opacity-0'}`}>
                  <p className="hud text-dawn">{x.group}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold">{x.name}</h3>
                  <p className="mt-2 max-w-md text-white/75">{x.text}</p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="font-display text-2xl font-bold">
                      {x.price ? inr(x.price) : 'On request'} <span className="text-sm font-normal text-white/50">{x.unit}</span>
                    </p>
                    <a
                      href={waLink(`Hi Bir Paragliding! Please add "${x.name}" to my trip.`)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full bg-snow px-4 py-2 text-sm font-semibold text-ink"
                    >
                      Add via WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
