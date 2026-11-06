import type { Metadata } from 'next';
import Hero from '@/components/home/hero/Hero';
import Cockpit from '@/components/home/Cockpit';
import RidgeLift from '@/components/home/RidgeLift';
import WhyBir from '@/components/home/WhyBir';
import PackagesPreview from '@/components/home/PackagesPreview';
import FlightJourney from '@/components/home/FlightJourney';
import VideoExpand from '@/components/home/VideoExpand';
import Testimonials from '@/components/home/Testimonials';
import GalleryAssemble from '@/components/home/GalleryAssemble';
import CTA from '@/components/home/CTA';

export const metadata: Metadata = {
  title: { absolute: 'Paragliding in Bir Billing — Tandem Flights from ₹2,500 | Bir Paragliding' },
  description:
    'Tandem paragliding in Bir Billing, Himachal: First Flight ₹2,500, Classic ₹4,000, Cross-Country ₹6,500. Licensed pilots, 2,400 m launch, P1–P4 courses. Book on WhatsApp.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Cockpit />
      <WhyBir />
      <RidgeLift />
      <PackagesPreview />
      <FlightJourney />
      <VideoExpand />
      <Testimonials />
      <GalleryAssemble />
      <CTA />
    </>
  );
}
