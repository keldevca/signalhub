import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleFeed from '../../components/ArticleFeed';
import { ALL_SLUGS, slugToCategories } from '../../lib/categories';
import { fetchArticles } from '../../lib/aggregator';
import { SITE_NAME, SITE_URL } from '../../lib/site';

type Params = Promise<{ slug: string }>;

export const revalidate = 1800;

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

function buildHeadline(categories: string[]): string {
  if (categories.length === 1) return `${categories[0]} news and articles`;
  return categories.join(' · ');
}

function buildDescription(categories: string[]): string {
  if (categories.length === 0) return `Personalized tech feed by ${SITE_NAME}.`;
  if (categories.length === 1) {
    return `Latest ${categories[0]} articles, curated from the top developer sources by ${SITE_NAME}.`;
  }
  return `Latest articles on ${categories.join(', ')} — curated from the top developer sources by ${SITE_NAME}.`;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = slugToCategories(slug);

  if (categories.length === 0) {
    return { title: 'Feed not found', robots: { index: false, follow: false } };
  }

  const isSingle = categories.length === 1;
  const headline = buildHeadline(categories);
  const description = buildDescription(categories);

  return {
    title: headline,
    description,
    alternates: { canonical: `/feed/${slug}` },
    robots: {
      index: isSingle,
      follow: true,
      googleBot: {
        index: isSingle,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${headline} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/feed/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${headline} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function FeedPage({ params }: { params: Params }) {
  const { slug } = await params;
  const categories = slugToCategories(slug);
  if (categories.length === 0) notFound();

  const { articles } = await fetchArticles(categories);
  const headline = buildHeadline(categories);
  const description = buildDescription(categories);
  const canonical = `${SITE_URL}/feed/${slug}`;

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${headline} | ${SITE_NAME}`,
    description,
    url: canonical,
    isPartOf: { '@id': `${SITE_URL}#website` },
    about: categories.map((c) => ({ '@type': 'Thing', name: c })),
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 20).map((a, index) => {
        const item: Record<string, unknown> = {
          '@type': 'ListItem',
          position: index + 1,
          url: a.link,
          name: a.title,
        };
        if (a.image) item.image = a.image;
        return item;
      }),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <ArticleFeed
        categories={categories}
        initialArticles={articles}
        headline={headline}
      />
    </>
  );
}
