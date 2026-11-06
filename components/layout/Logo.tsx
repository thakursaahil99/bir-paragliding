import { useId } from 'react';

/** Bir Paragliding mark: sunrise canopy over a snow-capped Dhauladhar peak. */
export function LogoMark({ className = 'h-10 w-10' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffc56b" />
          <stop offset="0.55" stopColor="#ff7a2f" />
          <stop offset="1" stopColor="#ff4d1a" />
        </linearGradient>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b8bff" />
          <stop offset="1" stopColor="#0f3f99" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#101d36" />
          <stop offset="1" stopColor="#060a12" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect width="64" height="64" rx="16" />
        </clipPath>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id}b)`} />
      <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" fill="none" stroke="rgba(255,255,255,.12)" />
      <g clipPath={`url(#${id}c)`}>
        <path d="M0 64 L0 55 L13 46 L20 50.5 L32 40.5 L42 49.5 L48 45.5 L64 56 L64 64 Z" fill={`url(#${id}p)`} />
        <path d="M32 40.5 L28.4 43.6 L30.6 43 L32 44.6 L33.6 43 L35.8 43.8 Z" fill="#f4f7fb" />
      </g>
      <path d="M10 22 C 18 8.5, 46 8.5, 54 22 L 50.2 24.2 C 43.5 14.6, 20.5 14.6, 13.8 24.2 Z" fill={`url(#${id}w)`} />
      <path
        d="M13.8 24.2 L 32 34.4 M 50.2 24.2 L 32 34.4 M 23.5 17.6 L 32 34.4 M 40.5 17.6 L 32 34.4"
        stroke="#f4f7fb"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="32" cy="36" r="2.8" fill="#f4f7fb" />
    </svg>
  );
}

/** Lockup: mark + stacked wordmark (BIR / PARAGLIDING). */
export default function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.3rem] font-extrabold tracking-[-0.02em]">BIR</span>
          <span className="mt-[3px] font-mono text-[0.62rem] font-medium tracking-[0.26em] text-dawn">PARAGLIDING</span>
        </span>
      )}
    </span>
  );
}
