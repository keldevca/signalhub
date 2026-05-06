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
- **Article thumbnails** — pulled directly from the RSS payload (`media:thumbnail`, `media:content`, `enclosure`, `itunes:image`, or the first image in `content:encoded`). HTTPS-only and gracefully hidden if the source URL fails.
- **Reading time** — a "~N min read" estimate is computed client-side from the article snippet.
- **Search & shortcuts** — instant client-side search across title, snippet and source. Press <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> from anywhere, or <kbd>/</kbd> when not typing, to focus the search bar.
- **Share** — native Web Share on mobile, with a clipboard fallback on desktop.
- **Bookmarks & read tracking** — star articles to keep them, mark items as read, and filter by either, all persisted in `localStorage` with cross-tab sync via `useSyncExternalStore`.
- **Powerful filters** — narrow by date (today / week / month), source, read status, or bookmarks, all in a single filter bar with one-click reset.
- **Modern UI/UX**
  - Dynamic dark / light theme toggle.
  - "Interactive Face" mascot that follows your cursor.
  - Native-feeling horizontal swipe with custom inertia physics.
  - Particle background canvas.
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

## Keyboard shortcuts

| Shortcut                                | Action                          |
| --------------------------------------- | ------------------------------- |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd> | Focus the search bar            |
| <kbd>/</kbd>                            | Focus the search bar (when idle) |

## URL structure

| URL                                | Purpose                                             | Indexable |
| ---------------------------------- | --------------------------------------------------- | --------- |
| `/`                                | Home — pick categories                              | ✅        |
| `/feed/[slug]`                     | Feed for one or more categories                     | Single ✅ / Multi ❌ |

Each category has a stable slug (`javascript`, `typescript`, `c-cpp`, `ai`, …). Multiple categories are joined with `_`, e.g. `/feed/javascript_python_typescript`. Single-category feeds are pre-rendered at build time, indexed in `sitemap.xml`, and exposed to search engines. Multi-category combinations are server-rendered on demand and marked `noindex` to avoid duplicate-content dilution.

## Project structure

```
app/
  api/fetch-news/route.ts   RSS aggregation, image extraction, filtering, cache
  components/               UI components (ArticleFeed, ParticleBackground, InteractiveFace, HeaderActions)
  hooks/                    useTheme, useLocalStorage (useSyncExternalStore-based)
  lib/site.ts               Centralized site URL, name, description, GitHub URL
  lib/categories.ts         Category list, slug ↔ name mapping
  feed/[slug]/page.tsx      Server: generateStaticParams, generateMetadata, JSON-LD
  feed/[slug]/opengraph-image.tsx  Dynamic OG image per feed
  layout.tsx                Root layout, JSON-LD, metadata, viewport
  manifest.ts               PWA manifest
  opengraph-image.tsx       Default 1200×630 OG image
  robots.ts                 robots.txt route
  sitemap.ts                sitemap.xml route
public/                     Static assets (logo, icons)
```

## Contributing

Pull requests are welcome. For larger changes, open an issue first to discuss what you'd like to change. Please make sure `npm run lint` and `npm run build` succeed before submitting.

## License

[MIT](LICENSE) © Signal Hub contributors
