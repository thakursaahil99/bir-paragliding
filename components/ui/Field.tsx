'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type Common = { label: string; error?: string; hint?: string };
type InputProps = Common & InputHTMLAttributes<HTMLInputElement> & { textarea?: false };
type AreaProps = Common & TextareaHTMLAttributes<HTMLTextAreaElement> & { textarea: true };

/** Floating label + an underline that draws from the left on focus (gradient sky → dawn). */
export default function Field(props: InputProps | AreaProps) {
  const { label, error, hint, textarea, className, ...rest } = props;
  const id = rest.id ?? rest.name;
  const base =
    'peer block w-full resize-none border-b border-white/20 bg-transparent pb-3 pt-3 text-lg text-white outline-none transition-colors placeholder:text-transparent focus:border-white/40';
  return (
    <div className={`relative pt-5 ${className ?? ''}`}>
      {textarea ? (
        <textarea id={id} placeholder=" " rows={3} className={base} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} placeholder=" " className={base} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-8 origin-left text-lg text-white/50 transition-all duration-300 ease-[var(--ease-glide)] peer-focus:top-0 peer-focus:scale-[0.72] peer-focus:text-dawn peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-[0.72]"
      >
        {label}
      </label>
      <span aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-sky via-sun to-dawn transition-transform duration-500 ease-[var(--ease-glide)] peer-focus:scale-x-100" />
      {error ? (
        <p id={`${id}-err`} className="mt-2 text-sm text-[#ff9a8a]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-sm text-white/40">{hint}</p>
      ) : null}
    </div>
  );
}
