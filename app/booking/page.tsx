import { Suspense } from 'react';
import { pageMeta } from '@/lib/seo';
import SplitHeading from '@/components/animations/SplitHeading';
import BookingWizard from '@/components/booking/BookingWizard';
import { BringSort, ChatSim, HowPrism, PolicyStamps, SeasonCountdown, TrustRings, WhatsAppCTA } from '@/components/booking/Sections';

export const metadata = pageMeta({
  title: 'Book a Paragliding Flight in Bir Billing',
  description: 'Book a tandem paragliding flight or pilot course in Bir Billing in five quick steps — pick a package, date and group size, then confirm on WhatsApp.',
  path: '/booking',
  image: '/images/billing-launch-flags.webp',
});

/** 9 sections, each with its own motion engine. */
export default function BookingPage() {
  return (
    <>
      <header className="container-x pb-10 pt-36 text-center md:pt-44">
        <p className="hud text-dawn">Five steps · confirmed on WhatsApp</p>
        <SplitHeading as="h1" immediate className="display mx-auto mt-4 max-w-4xl text-[clamp(2.6rem,8vw,7.5rem)]">
          Book your flight
        </SplitHeading>
      </header>
      <Suspense fallback={<div className="container-x min-h-[60vh]" />}>
        <BookingWizard />
      </Suspense>
      <HowPrism />
      <SeasonCountdown />
      <ChatSim />
      <TrustRings />
      <BringSort />
      <PolicyStamps />
      <WhatsAppCTA />
    </>
  );
}
