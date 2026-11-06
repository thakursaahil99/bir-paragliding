import { pageMeta } from '@/lib/seo';
import { packages, site } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import PageHeader from '@/components/PageHeader';
import PackageExplorer from '@/components/packages/PackageExplorer';
import CompareTable from '@/components/packages/CompareTable';
import Extras from '@/components/packages/Extras';
import { AirtimeClock, GiftCard, IncludedOrbit, PilotPathway, PriceCTA } from '@/components/packages/Advanced';

export const metadata = pageMeta({
  title: 'Bir Billing Paragliding Price — Tandem Flights & Courses',
  description:
    'Bir Billing paragliding price list: First Flight tandem ₹2,500 (18 min), Classic ₹4,000 with GoPro (25 min), Cross-Country ₹6,500 (50 min). P1+P2 course ₹25,000, P3 ₹35,000, P4 ₹60,000.',
  path: '/packages',
  image: '/images/tandem-red-wing.webp',
});

const offersLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Bir Paragliding flights and courses',
  itemListElement: packages.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Product',
      name: p.name,
      description: p.description,
      image: `${site.url}${p.image}`,
      brand: { '@type': 'Brand', name: site.name },
      offers: { '@type': 'Offer', price: p.price, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: `${site.url}/packages/${p.slug}` },
    },
  })),
};

/** 9 sections, each with its own motion engine. */
export default function PackagesPage() {
  return (
    <>
      <JsonLd data={offersLd} />
      <PageHeader
        crumb="Flights & courses"
        kicker="Tandem flights · P1–P4 courses"
        title="Choose your airtime"
        intro="Three tandem flights from 18 to 50 minutes, and pilot courses from your first kite to cross-country. One clear price, no surprises."
        image="/images/tandem-red-wing.webp"
        imageAlt="Tandem paraglider under a red wing over the Bir valley"
      />
      <PackageExplorer />
      <AirtimeClock />
      <CompareTable />
      <PilotPathway />
      <IncludedOrbit />
      <Extras />
      <GiftCard />
      <PriceCTA />
    </>
  );
}
