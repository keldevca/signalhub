<div align="center">
  <img src="public/logo/logo-signal-hub.png" alt="Signal Hub logo" width="100" />
  <h1>Signal Hub</h1>
  <p><strong>A personalized, intelligent tech news aggregator for developers and tech enthusiasts.</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
  [![Tailwind v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

<br />

## Features

- **Personalized feed** — pick the categories you care about (JavaScript, Python, AI, Cloud, Cybersecurity, UI/UX…) and the selection is saved locally in your browser.
- **Smart aggregation** — fetches from 30+ developer RSS feeds (TechCrunch, VentureBeat, Dev.to, InfoQ, Smashing Magazine and more) with strict per-keyword regex matching to avoid false positives (e.g. `java` won't match `javascript`).
- **Fast & cached** — custom in-memory cache with TTL and stale-while-revalidate strategy directly inside the Next.js API route, exposed via `X-Cache: HIT/STALE/MISS` headers.
- **Bookmarks & read tracking** — star articles to keep them, mark items as read, and filter by either, all persisted in `localStorage` with cross-tab sync via `useSyncExternalStore`.
- **Powerful filters** — narrow by date (today / week / month), source, read status, or bookmarks, all in a single sticky filter bar.
- **Modern UI/UX**
  - Dynamic dark / light theme toggle.
  - "Interactive Face" mascot that follows your cursor.
  - Native-feeling horizontal swipe with custom inertia physics.
  - Beautiful particle background canvas.
- **SEO & PWA ready** — dynamic Open Graph image, JSON-LD structured data, sitemap, robots, and a PWA manifest so the app is installable on mobile and desktop.

## Tech stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language** — [TypeScript 5](https://www.typescriptlang.org/)
- **UI** — [React 19](https://react.dev/) and [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend / RSS** — [`rss-parser`](https://www.npmjs.com/package/rss-parser)
- **Lint** — `eslint-config-next` (core-web-vitals + typescript)
- **Deployment** — ready for Vercel or any Node host

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000> in your browser.

### Available scripts

| Command         | Description                            |
| --------------- | -------------------------------------- |
| `npm run dev`   | Start the dev server (Turbopack)       |
| `npm run build` | Build for production                   |
| `npm run start` | Run the production build               |
| `npm run lint`  | Lint with ESLint                       |

### Environment variables

Create a `.env.local` file at the project root (optional, but recommended for production deployments):

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

This is used to generate canonical URLs, the sitemap, robots, Open Graph metadata, and the manifest. It defaults to `http://localhost:3000` if unset.

## Configuration

### Adding a new RSS source

Sources and their categories are defined in `app/api/fetch-news/route.ts`. Append to the `SOURCES` array:

```ts
{
  name: 'My Custom Blog',
  url: 'https://myblog.com/rss',
  categories: ['Web Development', 'Design']
}
```

Make sure each category exists in the `CATEGORY_KEYWORDS` map so the keyword filter can match articles correctly.

### Tuning the cache

In `app/api/fetch-news/route.ts`:

```ts
const CACHE_TTL = 30 * 60 * 1000;   // serve from cache up to 30 min
const CACHE_STALE = 60 * 60 * 1000; // serve stale + revalidate up to 1 h
const PER_SOURCE_LIMIT = 25;        // max articles kept per source
```

## Project structure

```
app/
  api/fetch-news/route.ts   RSS aggregation, filtering, and cache
  components/               UI components (ParticleBackground, InteractiveFace)
  hooks/                    useTheme, useLocalStorage (useSyncExternalStore-based)
  lib/site.ts               Centralized site URL, name, description
  results/                  Results view (server-side metadata + client view)
  layout.tsx                Root layout, JSON-LD, metadata, viewport
  manifest.ts               PWA manifest
  opengraph-image.tsx       Dynamic 1200×630 OG image
  robots.ts                 robots.txt route
  sitemap.ts                sitemap.xml route
public/                     Static assets (logo, icons)
```

## Contributing

Pull requests are welcome. For larger changes, open an issue first to discuss what you'd like to change. Please make sure `npm run lint` and `npm run build` succeed before submitting.

## License

[MIT](LICENSE) © Signal Hub contributors
