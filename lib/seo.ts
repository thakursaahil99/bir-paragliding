import type { Metadata } from 'next';
import { faqs, packages, site } from './site';

/**
 * Per-page metadata. Social cards use the branded 1200×630 JPEG (/og.jpg) — the most widely
 * supported format (WhatsApp, LinkedIn, X). `image` is kept for pages that want their own card.
 */
export function pageMeta({ title, description, path = '/', image }: { title: string; description: string; path?: string; image?: string }): Metadata {
  const card = image && image.endsWith('.jpg') ? image : '/og.jpg';
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      images: [{ url: card, width: 1200, height: 630, alt: `${title} — ${site.name}` }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${title} | ${site.name}`, description, images: [card] },
  };
}

export const localBusinessLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'SportsActivityLocation'],
      '@id': `${site.url}/#business`,
      name: site.name,
      alternateName: site.legalName,
      url: site.url,
      logo: `${site.url}/logo-512.png`,
      image: `${site.url}/images/flight-cloud-sea.webp`,
      description: site.description,
      telephone: site.phone,
      email: site.email,
      address: { '@type': 'PostalAddress', addressLocality: site.address.locality, addressRegion: site.address.region, addressCountry: 'IN' },
      geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:00', closes: '19:00' },
      ],
      priceRange: '₹2,500 – ₹60,000',
      sameAs: [`https://wa.me/${site.whatsapp}`],
      makesOffer: packages.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        price: p.price,
        priceCurrency: 'INR',
        description: p.description,
        url: `${site.url}/packages/${p.slug}`,
      })),
    },
    {
      '@type': 'TouristAttraction',
      '@id': `${site.url}/#bir-billing`,
      name: 'Bir Billing Paragliding Site',
      description:
        'A world-class paragliding site in the Kangra valley: launch at Billing (~2,400 m), land beside Bir (~1,400 m). Host of the 2015 Paragliding World Cup, flyable most days from mid-September to June.',
      touristType: ['Adventure tourism', 'Paragliding'],
      geo: { '@type': 'GeoCoordinates', latitude: site.takeoffGeo.lat, longitude: site.takeoffGeo.lng },
      address: { '@type': 'PostalAddress', addressLocality: 'Bir', addressRegion: 'Himachal Pradesh', addressCountry: 'IN' },
      isAccessibleForFree: false,
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { '@id': `${site.url}/#business` },
    },
  ],
};

export const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};
