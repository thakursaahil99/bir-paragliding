import { pageMeta } from '@/lib/seo';
import { posts } from '@/lib/blog';
import PostGrid from '@/components/blog/PostGrid';
import { BlogHero, FeaturedPost, JournalQuote, Newsletter, ReadingRings, SeasonGuides, TagCloud } from '@/components/blog/Sections';

export const metadata = pageMeta({
  title: 'Flight Log — Bir Billing Paragliding Guides',
  description: 'Practical guides for paragliding in Bir Billing: prices, the best season, how to reach Bir, your first tandem flight, choosing a course and safety.',
  path: '/blog',
  image: '/images/trek-cloud-sea.webp',
});

/** 8 sections, each with its own motion engine. */
export default function BlogPage() {
  return (
    <>
      <BlogHero />
      <FeaturedPost post={posts[0]} />
      <PostGrid posts={posts.slice(1)} noLead />
      <JournalQuote />
      <SeasonGuides />
      <ReadingRings />
      <TagCloud />
      <Newsletter />
    </>
  );
}
