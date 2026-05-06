import { ImageResponse } from 'next/og';
import { slugToCategories } from '../../lib/categories';
import { SITE_NAME } from '../../lib/site';

type Params = Promise<{ slug: string }>;

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function FeedOgImage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const categories = slugToCategories(slug);
  const headline =
    categories.length > 0 ? categories.join(' · ') : 'Tech feed';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background:
            'radial-gradient(ellipse at top, #1e293b 0%, #0a0a0f 60%, #000 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: '#3b82f6',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: 8,
            marginBottom: 32,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1.05,
            background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {headline}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 32,
            color: '#94a3b8',
            maxWidth: 1000,
            lineHeight: 1.4,
          }}
        >
          Latest articles curated from the top developer sources.
        </div>
      </div>
    ),
    { ...size }
  );
}
