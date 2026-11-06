import { pageMeta } from '@/lib/seo';
import { site } from '@/lib/site';
import SplitHeading from '@/components/animations/SplitHeading';
import ContactForm from '@/components/contact/ContactForm';
import MapCard from '@/components/contact/MapCard';
import { ContactHero, MeetingPoints, OpenClock, PaperPlaneCTA, QuickChips, RouteMap, WeekHours } from '@/components/contact/Sections';

export const metadata = pageMeta({
  title: 'Contact — Call or WhatsApp Bir Paragliding',
  description: `Questions about a tandem flight, course or stay in Bir Billing? Call or WhatsApp ${site.phone}, email ${site.email}. Open daily 9 AM – 7 PM.`,
  path: '/contact',
  image: '/images/prayer-flags.webp',
});

/** 8 sections, each with its own motion engine. */
export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <section className="container-x grid gap-10 pb-24 lg:grid-cols-2" aria-label="Contact form and map">
        <div className="glass rounded-[2rem] p-6 md:p-10">
          <SplitHeading className="font-display text-3xl font-bold">Send us a message</SplitHeading>
          <p className="mt-2 text-white/60">We reply on WhatsApp or email — whichever you prefer.</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
        <MapCard />
      </section>
      <OpenClock />
      <MeetingPoints />
      <RouteMap />
      <QuickChips />
      <WeekHours />
      <PaperPlaneCTA />
    </>
  );
}
