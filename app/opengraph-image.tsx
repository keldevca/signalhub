import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION, SITE_NAME } from './lib/site';

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background:
            'radial-gradient(ellipse at top, #1e293b 0%, #0a0a0f 60%, #000 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            letterSpacing: -4,
            background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#94a3b8',
            marginTop: 24,
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {SITE_DESCRIPTION}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            display: 'flex',
            gap: 16,
            fontSize: 22,
            color: '#3b82f6',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: 6,
          }}
        >
          <span>Tech</span>
          <span>·</span>
          <span>News</span>
          <span>·</span>
          <span>Aggregator</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
