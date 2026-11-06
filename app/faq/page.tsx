import { pageMeta, faqLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import FaqList from '@/components/faq/FaqList';
import { AskCTA, FaqHero, FlyabilityBars, Glossary, LimitGauges, MythDeck, QuickAnswers, WindRoom } from '@/components/faq/Sections';

export const metadata = pageMeta({
  title: 'FAQ — Paragliding in Bir Billing',
  description: 'Answers about paragliding in Bir Billing: season, safety, age and weight limits, flight duration, GoPro video, courses, how to reach Bir and where to stay.',
  path: '/faq',
  image: '/images/dhauladhar-naddi.webp',
});

/** 9 sections, each with its own motion engine. */
export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqLd} />
      <FaqHero />
      <QuickAnswers />
      <FaqList />
      <WindRoom />
      <LimitGauges />
      <FlyabilityBars />
      <MythDeck />
      <Glossary />
      <AskCTA />
    </>
  );
}
