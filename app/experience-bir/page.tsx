import { pageMeta } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import BirMap from '@/components/experience/BirMap';
import Seasons from '@/components/experience/Seasons';
import DepartureBoard from '@/components/experience/DepartureBoard';
import { DayCycle, StaysCurtain, TrekProfile } from '@/components/experience/Journeys';
import { PolaroidTable, PostcardCTA, PrayerFlags } from '@/components/experience/Culture';

export const metadata = pageMeta({
  title: 'Experience Bir — Travel Guide, Best Season & How to Reach',
  description:
    'Plan your Bir Billing trip: an illustrated map, the best season month by month, a 3-day itinerary, cafés and monasteries, the Triund trek, stays near the landing field and how to reach Bir.',
  path: '/experience-bir',
  image: '/images/chokling-monastery.webp',
});

/** 10 sections, each with its own motion engine. */
export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        crumb="Experience Bir"
        kicker="Beyond the flight"
        title="Stay a few days longer"
        intro="Gompas and momos, tea gardens and forest trails, campfires under the Dhauladhar — Bir is a valley worth slowing down for."
        image="/images/chokling-monastery.webp"
        imageAlt="Chokling Monastery in Bir"
      />
      <BirMap />
      <Seasons />
      <DayCycle />
      <PolaroidTable />
      <TrekProfile />
      <StaysCurtain />
      <PrayerFlags />
      <DepartureBoard />
      <PostcardCTA />
    </>
  );
}
