import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLegal, legal } from '@/lib/legal';
import { pageMeta } from '@/lib/seo';
import SplitHeading from '@/components/animations/SplitHeading';
import { TLink } from '@/components/layout/Transition';

export function generateStaticParams() {
  return legal.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegal(slug);
  if (!doc) return {};
  return pageMeta({ title: doc.title, description: doc.intro, path: `/legal/${doc.slug}` });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegal(slug);
  if (!doc) notFound();
  return (
    <article className="container-x mx-auto max-w-3xl pb-24 pt-36 md:pt-44">
      <nav aria-label="Legal pages" className="hud mb-8 flex flex-wrap gap-4 text-white/50">
        {legal.map((l) => (
          <TLink key={l.slug} href={`/legal/${l.slug}`} className={l.slug === doc.slug ? 'text-dawn' : 'hover:text-white'}>
            {l.title}
          </TLink>
        ))}
      </nav>
      <SplitHeading as="h1" immediate className="display text-[clamp(2.6rem,7vw,5.5rem)]">
        {doc.title}
      </SplitHeading>
      <p className="mt-6 text-xl text-white/70">{doc.intro}</p>
      <p className="hud mt-6 inline-block rounded-full border border-dawn/50 px-3 py-1.5 text-dawn">Template · review before launch</p>
      {doc.sections.map((s) => (
        <section key={s.h} className="mt-12">
          <SplitHeading className="font-display text-2xl font-bold">{s.h}</SplitHeading>
          {s.p.map((p) => (
            <p key={p} className="mt-3 text-lg leading-relaxed text-white/75">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
