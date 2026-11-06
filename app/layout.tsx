import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Syne } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { localBusinessLd } from '@/lib/seo';
import { PERF_BOOT_SCRIPT } from '@/lib/perf-boot';
import JsonLd from '@/components/JsonLd';
import SmoothScroll from '@/components/layout/SmoothScroll';
import { TransitionProvider } from '@/components/layout/Transition';
import Preloader from '@/components/layout/Preloader';
import Cursor from '@/components/layout/Cursor';
import Navbar from '@/components/layout/Navbar';
import Altimeter from '@/components/layout/Altimeter';
import FloatingBook from '@/components/layout/FloatingBook';
import Footer from '@/components/layout/Footer';

const syne = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-syne', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jet = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jet', display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Paragliding in Bir Billing — Tandem Flights & Courses | Bir Paragliding',
    template: '%s | Bir Paragliding',
  },
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  applicationName: site.name,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: site.name,
    title: 'Paragliding in Bir Billing | Bir Paragliding',
    description: site.description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Bir Paragliding — tandem flights in Bir Billing' }],
  },
  twitter: { card: 'summary_large_image', title: 'Paragliding in Bir Billing | Bir Paragliding', description: site.description, images: ['/og.jpg'] },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#060a12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable} ${jet.variable}`} suppressHydrationWarning>
      <head>
        {/* flag JS early so reveal states never flash, and pick a device tier before first paint */}
        <script dangerouslySetInnerHTML={{ __html: PERF_BOOT_SCRIPT }} />
        <noscript>
          <style>{'#preloader{display:none!important}'}</style>
        </noscript>
        <JsonLd data={localBusinessLd} />
      </head>
      <body className="grain">
        <SmoothScroll>
          <TransitionProvider>
            <Preloader />
            <Navbar />
            <main id="main" className="relative z-10 bg-ink">
              {children}
            </main>
            <Footer />
            <Altimeter />
            <FloatingBook />
            <Cursor />
          </TransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
