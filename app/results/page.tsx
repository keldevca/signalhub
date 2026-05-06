import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResultsView from './ResultsView';
import { SITE_NAME } from '../lib/site';

type SearchParams = Promise<{ categories?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { categories = '' } = await searchParams;
  const list = categories.split(',').map((c) => c.trim()).filter(Boolean);
  const titleBase =
    list.length > 0 ? `${list.join(' · ')}` : 'Your articles';
  const description =
    list.length > 0
      ? `Latest articles on ${list.join(', ')} — curated from top developer sources by ${SITE_NAME}.`
      : `Your personalized tech feed on ${SITE_NAME}.`;

  return {
    title: titleBase,
    description,
    alternates: { canonical: '/results' },
    robots: { index: false, follow: true },
    openGraph: {
      title: `${titleBase} | ${SITE_NAME}`,
      description,
      type: 'website',
    },
  };
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]" />}
    >
      <ResultsView />
    </Suspense>
  );
}
