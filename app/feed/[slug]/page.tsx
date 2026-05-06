import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import ArticleFeed from '../../components/ArticleFeed';
import { ALL_SLUGS, slugToCategories } from '../../lib/categories';
import { SITE_NAME, SITE_URL } from '../../lib/site';

type Params = Promise<{ slug: string }>;

export const revalidate = 1800;

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
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
  const title = isSingle
    ? `${categories[0]} news and articles`
    : categories.join(' · ');
  const description = isSingle
    ? `Latest ${categories[0]} articles, curated from the top developer sources by ${SITE_NAME}.`
    : `Latest articles on ${categories.join(', ')} — curated from the top developer sources by ${SITE_NAME}.`;

  return {
    title,
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
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/feed/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function FeedPage({ params }: { params: Params }) {
  const { slug } = await params;
  const categories = slugToCategories(slug);
  if (categories.length === 0) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categories.join(', ')} | ${SITE_NAME}`,
    url: `${SITE_URL}/feed/${slug}`,
    isPartOf: { '@id': `${SITE_URL}#website` },
    about: categories.map((c) => ({ '@type': 'Thing', name: c })),
  };

  return (
    <>
      <Script
        id={`feed-jsonld-${slug}`}
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <ArticleFeed categories={categories} />
    </>
  );
}
