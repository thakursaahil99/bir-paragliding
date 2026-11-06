import { pageMeta } from '@/lib/seo';
import GalleryApp from '@/components/gallery/GalleryApp';
import { CompareSlider, GalleryTunnel, ParallaxColumns, StripPuzzle } from '@/components/gallery/Showcase';
import { ColorStories, ImageTrail, Reels, RingSection, ShareMarquee } from '@/components/gallery/Playground';

export const metadata = pageMeta({
  title: 'Gallery — Paragliding in Bir Billing in Photos',
  description: 'HD photos and reels of tandem paragliding in Bir Billing: the Billing launch, flights over the Kangra valley, monasteries, camps, treks and the Dhauladhar range.',
  path: '/gallery',
  image: '/images/flight-sunset.webp',
});

/** 10 sections, each with its own motion engine. */
export default function GalleryPage() {
  return (
    <>
      <GalleryTunnel />
      <StripPuzzle />
      <GalleryApp />
      <ParallaxColumns />
      <CompareSlider />
      <ColorStories />
      <Reels />
      <ImageTrail />
      <RingSection />
      <ShareMarquee />
    </>
  );
}
