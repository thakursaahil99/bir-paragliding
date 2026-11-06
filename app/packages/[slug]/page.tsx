import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { inr, packages, site } from '@/lib/site';
import { pageMeta } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import {
  BookingBar,
  DayTimeline,
  DetailCTA,
  DetailHero,
  FlipFaqs,
  Inclusions,
  OtherDeck,
  Overview,
  PhotoStrip,
  QuickFacts,
  SeasonRing,
} from '@/components/detail/PackageDetail';

export function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = packages.find((x) => x.slug === slug);
  if (!p) return {};
  return pageMeta({
    title: `${p.name} — ${inr(p.price)} · Bir Billing`,
    description: `${p.name} in Bir Billing: ${p.duration}, ${inr(p.price)} ${p.unit}. ${p.description}`,
    path: `/packages/${p.slug}`,
  });
}

/** Package detail: 10 sections, each with its own motion engine. */
export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = packages.find((x) => x.slug === slug);
  if (!p) notFound();
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: `${site.url}${p.image}`,
    brand: { '@type': 'Brand', name: site.name },
    offers: { '@type': 'Offer', price: p.price, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: `${site.url}/packages/${p.slug}` },
  };
  return (
    <>
      <JsonLd data={ld} />
      <DetailHero p={p} />
      <QuickFacts p={p} />
      <Overview p={p} />
      <Inclusions p={p} />
      <DayTimeline p={p} />
      <PhotoStrip p={p} />
      <SeasonRing />
      <FlipFaqs p={p} />
      <OtherDeck p={p} />
      <DetailCTA p={p} />
      <BookingBar p={p} />
    </>
  );
}
