import { NextResponse } from 'next/server';
import { fetchArticles } from '../../lib/aggregator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('categories') ?? '';
  const categories = raw.split(',').map((c) => c.trim()).filter(Boolean);

  try {
    const { articles, cacheStatus, ageSeconds } = await fetchArticles(categories);
    return NextResponse.json(articles, {
      headers: {
        'X-Cache': cacheStatus,
        'X-Cache-Age': String(ageSeconds),
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
