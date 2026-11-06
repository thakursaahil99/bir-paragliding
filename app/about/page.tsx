import { pageMeta } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import Story from '@/components/about/Story';
import Timeline from '@/components/about/Timeline';
import Office from '@/components/about/Office';
import Safety from '@/components/about/Safety';
import Principles from '@/components/about/Principles';
import { GearExploded, SignatureCTA, SpotlightManifesto } from '@/components/about/Advanced';

export const metadata = pageMeta({
  title: 'About Us',
  description: 'Meet the Bir Paragliding team — licensed tandem pilots and instructors based in Bir Billing, Himachal. Our safety standards, our gear, our story and how we work.',
  path: '/about',
  image: '/images/takeoff-snow-peaks.webp',
});

/** 9 sections, each with its own motion engine. */
export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumb="About"
        kicker="About us"
        title="Flown by locals, planned by locals"
        intro="A Bir-based crew of licensed pilots and instructors — the people you'll actually meet on the hill."
        image="/images/takeoff-snow-peaks.webp"
        imageAlt="Pilots preparing at the Billing launch with snow peaks behind"
      />
      <Story />
      <SpotlightManifesto />
      <Timeline />
      <Office />
      <GearExploded />
      <Safety />
      <Principles />
      <SignatureCTA />
    </>
  );
}
