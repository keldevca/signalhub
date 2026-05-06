import 'server-only';
import Parser from 'rss-parser';

export interface Article {
  title: string;
  link: string;
  date: string;
  source: string;
  snippet: string;
  image: string | null;
}

type CustomItem = {
  'media:thumbnail'?: unknown;
  'media:content'?: unknown;
  'itunes:image'?: unknown;
  'content:encoded'?: string;
};

const parser: Parser<unknown, CustomItem> = new Parser({
  timeout: 5000,
  customFields: {
    item: [
      ['media:thumbnail', 'media:thumbnail'],
      ['media:content', 'media:content'],
      ['itunes:image', 'itunes:image'],
      ['content:encoded', 'content:encoded'],
    ],
  },
});

export const SOURCES = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', categories: ['Tech News', 'Startups'] },
  { name: 'VentureBeat', url: 'https://venturebeat.com/feed/', categories: ['Tech News', 'Startups', 'Artificial Intelligence', 'Machine Learning'] },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', categories: ['UI / UX Design'] },
  { name: 'BlenderNation', url: 'https://www.blendernation.com/feed/', categories: ['3D / Blender'] },
  { name: 'Dev.to (JS/TS)', url: 'https://dev.to/feed/tag/javascript', categories: ['JavaScript', 'TypeScript'] },
  { name: 'Dev.to (Python)', url: 'https://dev.to/feed/tag/python', categories: ['Python'] },
  { name: 'Dev.to (Java)', url: 'https://dev.to/feed/tag/java', categories: ['Java'] },
  { name: 'Dev.to (Rust/Go)', url: 'https://dev.to/feed/tag/go', categories: ['Rust', 'Go'] },
  { name: 'Dev.to (Angular)', url: 'https://dev.to/feed/tag/angular', categories: ['Angular'] },
  { name: 'Dev.to (Vue)', url: 'https://dev.to/feed/tag/vue', categories: ['Vue.js'] },
  { name: 'Dev.to (PHP)', url: 'https://dev.to/feed/tag/php', categories: ['PHP'] },
  { name: 'Dev.to (C/C++)', url: 'https://dev.to/feed/tag/cpp', categories: ['C / C++'] },
  { name: 'Dev.to (Data Sci)', url: 'https://dev.to/feed/tag/datascience', categories: ['Data Science'] },
  { name: 'Dev.to (iOS)', url: 'https://dev.to/feed/tag/ios', categories: ['iOS / Swift'] },
  { name: 'Dev.to (React Native)', url: 'https://dev.to/feed/tag/reactnative', categories: ['React Native'] },
  { name: 'JavaScript Weekly', url: 'https://javascriptweekly.com/rss', categories: ['JavaScript'] },
  { name: 'Real Python', url: 'https://realpython.com/atom.xml', categories: ['Python'] },
  { name: 'Golang Weekly', url: 'https://golangweekly.com/rss', categories: ['Go'] },
  { name: 'Rust Blog', url: 'https://blog.rust-lang.org/feed.xml', categories: ['Rust'] },
  { name: 'This Week in React', url: 'https://thisweekinreact.com/newsletter/rss.xml', categories: ['React', 'Next.js'] },
  { name: 'Docker Blog', url: 'https://www.docker.com/blog/feed/', categories: ['Docker', 'Kubernetes'] },
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', categories: ['Cybersecurity'] },
  { name: 'AWS Blog', url: 'https://aws.amazon.com/blogs/aws/feed/', categories: ['Cloud', 'DevOps'] },
  { name: 'Opensource.com', url: 'https://opensource.com/feed', categories: ['Open Source', 'Linux'] },
  { name: 'Android Developers', url: 'https://android-developers.googleblog.com/feeds/posts/default', categories: ['Android', 'Kotlin'] },
  { name: 'Motionographer', url: 'https://motionographer.com/feed/', categories: ['Motion Design'] },
  { name: 'Node Source', url: 'https://nodesource.com/blog/rss', categories: ['Node.js'] },
  { name: 'InfoQ', url: 'https://feed.infoq.com', categories: ['Java', 'Architecture', 'DevOps', 'Cloud'] },
  { name: 'CSS Tricks', url: 'https://css-tricks.com/feed/', categories: ['UI / UX Design', 'JavaScript', 'CSS'] },
  { name: 'Flutter Blog', url: 'https://medium.com/feed/flutter', categories: ['Flutter', 'Mobile'] },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'JavaScript': ['javascript', 'js', 'npm', 'webpack', 'babel', 'esm', 'v8'],
  'TypeScript': ['typescript', 'ts', 'type-safe', 'typed'],
  'Python': ['python', 'pip', 'django', 'flask', 'fastapi', 'pytorch', 'pandas'],
  'Java': ['java', 'jvm', 'spring', 'maven', 'gradle', 'jakarta', 'jdk'],
  'Rust': ['rust', 'cargo', 'rustacean', 'rustlang'],
  'Go': ['golang', 'go lang', 'goroutine'],
  'PHP': ['php', 'laravel', 'symfony', 'composer', 'wordpress'],
  'C / C++': ['c++', 'cpp', 'cmake', 'clang', 'gcc', 'c language'],
  'React': ['react', 'jsx', 'hooks', 'redux'],
  'Angular': ['angular', 'rxjs', 'ngrx', 'zone.js'],
  'Next.js': ['next.js', 'nextjs', 'vercel'],
  'Vue.js': ['vue', 'vuejs', 'nuxt'],
  'Node.js': ['node.js', 'nodejs', 'express', 'fastify'],
  'Docker': ['docker', 'container', 'dockerfile'],
  'Kubernetes': ['kubernetes', 'k8s', 'helm', 'orchestration'],
  'DevOps': ['devops', 'ci/cd', 'github actions', 'jenkins', 'terraform', 'ansible'],
  'Linux': ['linux', 'ubuntu', 'debian', 'kernel', 'bash', 'shell'],
  'Cloud': ['aws', 'azure', 'gcp', 'google cloud', 'cloud', 'serverless', 'lambda'],
  'Artificial Intelligence': ['artificial intelligence', 'intelligence artificielle', 'llm', 'gpt', 'chatgpt', 'copilot'],
  'Machine Learning': ['machine learning', 'deep learning', 'neural', 'pytorch', 'tensorflow', 'hugging face'],
  'Data Science': ['data science', 'data engineering', 'pandas', 'sql', 'bigquery', 'analytics'],
  'Cybersecurity': ['security', 'vulnerability', 'hack', 'breach', 'malware', 'exploit', 'ransomware', 'cybersecurity'],
  'iOS / Swift': ['ios', 'swift', 'xcode', 'apple developer', 'swiftui'],
  'Android': ['android', 'kotlin', 'jetpack', 'google play'],
  'Flutter': ['flutter', 'dart'],
  'React Native': ['react native', 'expo'],
  'UI / UX Design': ['design', 'ux', 'ui', 'figma', 'accessibility', 'user experience'],
  'CSS': ['css', 'tailwind', 'sass', 'flexbox', 'grid'],
  'Motion Design': ['motion', 'after effects', 'motion design'],
  '3D / Blender': ['blender', '3d', 'modeling', 'render', 'cgi'],
  'Architecture': ['architecture', 'microservices', 'api design', 'system design', 'ddd', 'event-driven'],
  'Open Source': ['open source', 'opensource', 'open-source', 'github'],
  'Tech News': ['tech', 'technology', 'innovation', 'digital'],
  'Startups': ['startup', 'funding', 'venture', 'series a', 'investment', 'founder'],
};

const CACHE_TTL = 30 * 60 * 1000;
const CACHE_STALE = 60 * 60 * 1000;
const PER_SOURCE_LIMIT = 25;

const cache: Map<string, { data: Article[]; timestamp: number }> = new Map();
const refreshing = new Set<string>();

export const ALLOWED_CATEGORIES = new Set(SOURCES.flatMap((s) => s.categories));

function pickAttr(node: unknown, attr: string): string | null {
  if (!node || typeof node !== 'object') return null;
  const value = node as { $?: Record<string, string>; url?: string; href?: string };
  if (value.$?.[attr]) return value.$[attr];
  if (value.url) return value.url;
  if (value.href) return value.href;
  return null;
}

function extractImage(item: Record<string, unknown>): string | null {
  const tryHttps = (url: string | null): string | null =>
    url && /^https:\/\//i.test(url) ? url : null;

  const thumb = item['media:thumbnail'];
  const fromThumb = tryHttps(pickAttr(Array.isArray(thumb) ? thumb[0] : thumb, 'url'));
  if (fromThumb) return fromThumb;

  const content = item['media:content'];
  const contentArr = Array.isArray(content) ? content : content ? [content] : [];
  for (const entry of contentArr) {
    const fromContent = tryHttps(pickAttr(entry, 'url'));
    if (fromContent) return fromContent;
  }

  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;
  if (enclosure?.url) {
    const isImage =
      enclosure.type?.startsWith('image/') ||
      /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(enclosure.url);
    if (isImage) {
      const fromEnclosure = tryHttps(enclosure.url);
      if (fromEnclosure) return fromEnclosure;
    }
  }

  const fromItunes = tryHttps(pickAttr(item['itunes:image'], 'href'));
  if (fromItunes) return fromItunes;

  const html =
    (item['content:encoded'] as string | undefined) ??
    (item.content as string | undefined) ??
    '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const fromHtml = tryHttps(match?.[1] ?? null);
  if (fromHtml) return fromHtml;

  return null;
}

function articleMatchesCategories(
  article: { title: string; snippet: string },
  categories: string[]
): boolean {
  const text = `${article.title} ${article.snippet}`.toLowerCase();
  return categories.some((cat) => {
    const keywords = CATEGORY_KEYWORDS[cat] ?? [];
    return keywords.some((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s|\\W)${escaped}(\\s|\\W|$)`, 'i');
      return regex.test(text);
    });
  });
}

function buildCacheKey(categories: string[]): string {
  return [...categories].sort().join(',');
}

function filterSources(categories: string[]): typeof SOURCES {
  if (categories.length === 0) return SOURCES;
  return SOURCES.filter((s) => s.categories.some((c) => categories.includes(c)));
}

async function refresh(cacheKey: string, sources: typeof SOURCES, categories: string[]) {
  if (refreshing.has(cacheKey)) return;
  refreshing.add(cacheKey);

  try {
    const settled = await Promise.allSettled(
      sources.map((s) => parser.parseURL(s.url))
    );

    const seen = new Set<string>();
    const items: Article[] = settled
      .flatMap((result, index) => {
        if (result.status === 'rejected') return [];
        return result.value.items
          .map((item) => ({
            title: item.title ?? '',
            link: item.link ?? '',
            date: item.pubDate ?? '',
            source: sources[index].name,
            snippet: item.contentSnippet ?? '',
            image: extractImage(item as unknown as Record<string, unknown>),
          }))
          .filter(
            (article) =>
              categories.length === 0 ||
              articleMatchesCategories(article, categories)
          )
          .slice(0, PER_SOURCE_LIMIT);
      })
      .filter((article) => {
        if (!article.link || seen.has(article.link)) return false;
        seen.add(article.link);
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    cache.set(cacheKey, { data: items, timestamp: Date.now() });
  } catch (error) {
    console.error('aggregator refresh error:', error);
  } finally {
    refreshing.delete(cacheKey);
  }
}

export interface AggregatorResult {
  articles: Article[];
  cacheStatus: 'HIT' | 'STALE' | 'MISS';
  ageSeconds: number;
}

export async function fetchArticles(rawCategories: string[]): Promise<AggregatorResult> {
  const categories = rawCategories.filter((c) => ALLOWED_CATEGORIES.has(c));
  const cacheKey = buildCacheKey(categories);
  const sources = filterSources(categories);
  const cached = cache.get(cacheKey);

  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_TTL) {
      return { articles: cached.data, cacheStatus: 'HIT', ageSeconds: Math.floor(age / 1000) };
    }
    if (age < CACHE_STALE) {
      void refresh(cacheKey, sources, categories);
      return { articles: cached.data, cacheStatus: 'STALE', ageSeconds: Math.floor(age / 1000) };
    }
  }

  await refresh(cacheKey, sources, categories);
  const fresh = cache.get(cacheKey);
  if (!fresh) throw new Error('Aggregator fetch failed');
  return { articles: fresh.data, cacheStatus: 'MISS', ageSeconds: 0 };
}
