import { TLink } from '@/components/layout/Transition';

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <p className="hud text-dawn">Off course · 404</p>
      <h1 className="display mt-4 text-[clamp(3rem,12vw,11rem)]">Lost the thermal</h1>
      <p className="mt-6 max-w-md text-lg text-white/70">This page drifted out of range. Let&apos;s glide you back to the landing field.</p>
      <TLink href="/" className="mt-10 rounded-full bg-snow px-6 py-3 font-semibold text-ink">
        Back to home
      </TLink>
    </section>
  );
}
