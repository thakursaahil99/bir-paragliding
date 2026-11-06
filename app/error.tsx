'use client';

import { useEffect } from 'react';

/**
 * Safety net: instead of Next's blank "Application error" screen, recover gracefully.
 * The first failure in a session reloads the page automatically (fixes stale chunks after a
 * new deploy and any one-off DOM hiccup); if it happens again we show a reload button.
 */
export default function Error({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    try {
      if (!sessionStorage.getItem('bir-recovered')) {
        sessionStorage.setItem('bir-recovered', '1');
        window.location.reload();
      }
    } catch {
      /* private mode: fall through to the button */
    }
  }, [error]);

  return (
    <section className="container-x grid min-h-[80svh] place-items-center py-32 text-center">
      <div>
        <p className="hud text-dawn">Turbulence</p>
        <h1 className="display mt-4 text-[clamp(2.4rem,6vw,5rem)]">Let’s try that again</h1>
        <p className="mx-auto mt-5 max-w-md text-white/70">Something interrupted this page. A quick reload puts you back in the air.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-gradient-to-r from-dawn to-ember px-7 py-3.5 font-semibold text-ink"
        >
          Reload page
        </button>
      </div>
    </section>
  );
}
