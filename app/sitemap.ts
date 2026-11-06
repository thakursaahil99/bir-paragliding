import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { posts } from '@/lib/blog';
import { legal } from '@/lib/legal';
import { packages } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { path: '/', priority: 1 },
    { path: '/packages', priority: 0.95 },
    { path: '/booking', priority: 0.9 },
    { path: '/experience-bir', priority: 0.8 },
    { path: '/about', priority: 0.7 },
    { path: '/gallery', priority: 0.7 },
    { path: '/faq', priority: 0.7 },
    { path: '/contact', priority: 0.7 },
    { path: '/blog', priority: 0.6 },
  ];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p.path}`, lastModified: now, changeFrequency: 'weekly' as const, priority: p.priority })),
    ...packages.map((p) => ({ url: `${site.url}/packages/${p.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.85 })),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...legal.map((l) => ({ url: `${site.url}/legal/${l.slug}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.2 })),
    { url: `${site.url}/credits`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.1 },
  ];
}
