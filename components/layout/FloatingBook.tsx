'use client';

import { waLink } from '@/lib/site';
import Magnetic from '../animations/Magnetic';

/** Floating WhatsApp booking button: sonar pulse at rest, wind-streak ripple on hover. */
export default function FloatingBook() {
  return (
    <div className="fixed bottom-4 right-4 z-[60] md:bottom-6 md:right-16 xl:right-20">
      <Magnetic strength={0.35}>
        <a
          href={waLink('Hi Bir Paragliding! I would like to book a paragliding flight in Bir Billing.')}
          target="_blank"
          rel="noreferrer"
          data-cursor="book"
          aria-label="Book on WhatsApp"
          className="group relative flex h-14 items-center gap-0 overflow-hidden rounded-full bg-[#25D366] pl-4 pr-4 text-ink shadow-[0_10px_40px_-8px_rgba(37,211,102,.7)] transition-[padding,gap] duration-500 ease-[var(--ease-glide)] hover:gap-3 hover:pr-6"
        >
          {/* sonar pulse */}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#25D366] [animation:pulse-ring_2.2s_cubic-bezier(.2,.6,.3,1)_infinite]" />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#25D366] [animation:pulse-ring_2.2s_cubic-bezier(.2,.6,.3,1)_1.1s_infinite]" />
          {/* wind ripple streaks */}
          <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-0 transition-opacity group-hover:opacity-100">
            {[20, 42, 64, 80].map((t, i) => (
              <span
                key={t}
                className="absolute left-0 h-[1.5px] w-1/2 bg-gradient-to-r from-transparent via-white to-transparent group-hover:[animation:wind-line_1.1s_ease-out_infinite]"
                style={{ top: `${t}%`, animationDelay: `${i * 0.18}s` }}
              />
            ))}
          </span>
          <svg data-magnetic-inner viewBox="0 0 32 32" className="relative h-6 w-6 shrink-0" fill="currentColor" aria-hidden>
            <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.33.67 4.6 1.94 6.55L4 29l7.7-1.98a12.1 12.1 0 0 0 4.33.8h.01C22.68 27.82 28 22.46 28 15.85 28 9.24 22.68 3 16.04 3Zm0 22.6h-.01a10 10 0 0 1-5.1-1.4l-.36-.22-4.57 1.17 1.22-4.44-.24-.37a9.9 9.9 0 0 1-1.53-5.37c0-5.5 4.5-9.97 10.6-9.97 5.27 0 9.75 4.47 9.75 9.97 0 5.5-4.5 10.63-9.76 10.63Zm5.48-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
          </svg>
          <span className="relative max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-500 ease-[var(--ease-glide)] group-hover:max-w-[12rem]">
            Book on WhatsApp
          </span>
        </a>
      </Magnetic>
    </div>
  );
}
