import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPost, posts } from '@/lib/blog';
import { pageMeta } from '@/lib/seo';
import { gallery, site } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import SplitHeading from '@/components/animations/SplitHeading';
import RevealImage from '@/components/animations/RevealImage';
import ReadingProgress from '@/components/blog/ReadingProgress';
import PostGrid from '@/components/blog/PostGrid';
import { Newsletter } from '@/components/blog/Sections';
import { ArticleBody, KeyTakeaways, PhotoTrio, PlanIt, PullQuote } from '@/components/detail/PostDetail';
import { TLink } from '@/components/layout/Transition';

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.excerpt, path: `/blog/${p.slug}` });
}

/** Flight Log article: 9 sections, each with its own motion engine. */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const date = new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const heads = post.blocks.filter((b) => b.t === 'h2').map((b) => b.text);
  const firstP = post.blocks.find((b) => b.t === 'p')?.text ?? post.excerpt;
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const trio = [0, 1, 2].map((k) => gallery[(idx * 7 + k * 11) % gallery.length].src);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: `${site.url}${post.image}`,
    datePublished: post.date,
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.url}/logo-512.png` } },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <>
      <JsonLd data={ld} />
      <ReadingProgress target="#article-body" />
      <article>
        <header className="container-x pb-10 pt-36 md:pt-44">
          <nav aria-label="Breadcrumb" className="hud mb-6 flex items-center gap-2 text-white/60">
            <TLink href="/" className="hover:text-white">
              Home
            </TLink>
            <span aria-hidden>/</span>
            <TLink href="/blog" className="hover:text-white">
              Flight Log
            </TLink>
          </nav>
          <p className="hud text-dawn">
            {post.tag} · {post.minutes} min read · {date}
          </p>
          <SplitHeading as="h1" immediate className="display mt-4 max-w-5xl text-[clamp(2.2rem,5.6vw,5.4rem)]">
            {post.title}
          </SplitHeading>
          <p className="mt-6 max-w-2xl text-xl text-white/70">{post.excerpt}</p>
        </header>
        <div className="container-x">
          <RevealImage src={post.image} alt={post.title} priority className="aspect-[16/8] rounded-[2rem]" sizes="100vw" />
        </div>
        <KeyTakeaways items={heads} />
        <ArticleBody blocks={post.blocks} />
      </article>
      <PullQuote text={firstP} />
      <PhotoTrio images={trio} />
      <PlanIt />
      <section aria-labelledby="more-title" className="pt-8">
        <div className="container-x">
          <p className="hud text-dawn">Keep reading</p>
          <SplitHeading id="more-title" className="display mt-4 text-[clamp(2rem,4.4vw,4rem)]">
            More from the Flight Log
          </SplitHeading>
        </div>
        <div className="mt-6">
          <PostGrid posts={more} noLead />
        </div>
      </section>
      <Newsletter />
    </>
  );
}
