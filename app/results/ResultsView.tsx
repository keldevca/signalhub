'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '../hooks/useTheme';
import { useLocalStorageSet } from '../hooks/useLocalStorage';
import ParticleBackground from '../components/ParticleBackground';
import HeaderActions from '../components/HeaderActions';

interface Article {
  title: string;
  link: string;
  date: string;
  source: string;
  snippet: string;
}

type DateFilter = 'all' | 'today' | 'week' | 'month';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;
const TIME_AGO_INTERVAL = 30 * 1000;
const READ_KEY = 'readArticles';
const BOOKMARK_KEY = 'bookmarkedArticles';

const DATE_RANGES: Record<Exclude<DateFilter, 'all'>, number> = {
  today: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

const DATE_LABELS: Record<DateFilter, string> = {
  all: 'All',
  today: 'Today',
  week: 'Week',
  month: 'Month',
};

function timeAgoFrom(timestamp: number, now: number): string {
  const seconds = Math.floor((now - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function ResultsView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [readLinks, setReadLinks] = useLocalStorageSet(READ_KEY);
  const [bookmarks, setBookmarks] = useLocalStorageSet(BOOKMARK_KEY);
  const [hideRead, setHideRead] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const { isDark, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categories = useMemo(
    () => searchParams.get('categories')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );

  function markAsRead(link: string) {
    if (readLinks.has(link)) return;
    const next = new Set(readLinks);
    next.add(link);
    setReadLinks(next);
  }

  function clearRead() {
    setReadLinks(new Set());
  }

  function toggleBookmark(link: string) {
    const next = new Set(bookmarks);
    if (next.has(link)) next.delete(link);
    else next.add(link);
    setBookmarks(next);
  }

  useEffect(() => {
    let cancelled = false;

    async function load(isBackground: boolean) {
      if (isBackground) setRefreshing(true);
      else {
        setLoading(true);
        setError(false);
      }

      try {
        const res = await fetch(
          `/api/fetch-news?categories=${categories.join(',')}`
        );
        if (!res.ok) throw new Error('Server error');
        const data: Article[] = await res.json();
        if (cancelled) return;

        if (isBackground) {
          setArticles((current) => {
            const currentLinks = new Set(current.map((a) => a.link));
            const newOnes = data.filter((a) => !currentLinks.has(a.link));
            if (newOnes.length > 0) setPendingArticles(data);
            return current;
          });
        } else {
          setArticles(data);
          setLastUpdated(Date.now());
        }
      } catch {
        if (!cancelled && !isBackground) setError(true);
      } finally {
        if (cancelled) return;
        if (isBackground) setRefreshing(false);
        else setLoading(false);
      }
    }

    load(false);
    const interval = setInterval(() => load(true), AUTO_REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [categories]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TIME_AGO_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  function applyPendingArticles() {
    setArticles(pendingArticles);
    setPendingArticles([]);
    setLastUpdated(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const availableSources = useMemo(
    () => Array.from(new Set(articles.map((a) => a.source))).sort(),
    [articles]
  );

  const visibleArticles = useMemo(() => {
    return articles.filter((a) => {
      if (hideRead && readLinks.has(a.link)) return false;
      if (showBookmarksOnly && !bookmarks.has(a.link)) return false;
      if (sourceFilter !== 'all' && a.source !== sourceFilter) return false;
      if (dateFilter !== 'all') {
        const ts = new Date(a.date).getTime();
        if (Number.isNaN(ts)) return false;
        if (now - ts > DATE_RANGES[dateFilter]) return false;
      }
      return true;
    });
  }, [
    articles,
    hideRead,
    showBookmarksOnly,
    sourceFilter,
    dateFilter,
    readLinks,
    bookmarks,
    now,
  ]);

  const readCount = useMemo(
    () => articles.filter((a) => readLinks.has(a.link)).length,
    [articles, readLinks]
  );
  const bookmarkCount = useMemo(
    () => articles.filter((a) => bookmarks.has(a.link)).length,
    [articles, bookmarks]
  );
  const hasFilters =
    hideRead ||
    showBookmarksOnly ||
    sourceFilter !== 'all' ||
    dateFilter !== 'all';

  const timeAgoLabel = lastUpdated ? timeAgoFrom(lastUpdated, now) : '';

  function resetFilters() {
    setHideRead(false);
    setShowBookmarksOnly(false);
    setSourceFilter('all');
    setDateFilter('all');
  }

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white px-6 py-12 transition-colors duration-300">
      <ParticleBackground isDark={isDark} />

      <div
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex sm:flex-col items-center select-none cursor-pointer"
        onClick={() => router.push('/')}
      >
        <Image
          src="/logo/logo-signal-hub.png"
          alt="Signal Hub logo"
          width={40}
          height={40}
          priority
          className="w-10 h-10 object-contain sm:mb-1.5 drop-shadow-md"
        />
        <span
          translate="no"
          className="fixed top-[22px] left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 text-[12px] sm:text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white"
        >
          Signal Hub
        </span>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-8">
        <HeaderActions isDark={isDark} toggleTheme={toggleTheme} />

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:bg-gradient-to-br dark:from-white dark:to-gray-400 dark:bg-clip-text dark:text-transparent">
            Your articles
          </h1>
          <button
            onClick={() => router.push('/')}
            className="cursor-pointer text-sm px-4 py-2 rounded-lg transition-all border bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white shadow-sm dark:shadow-none"
          >
            ← Preferences
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-xs px-3 py-1 rounded-full border bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {refreshing && (
              <span className="text-xs animate-pulse text-slate-400 dark:text-gray-600">
                Refreshing...
              </span>
            )}
            {timeAgoLabel && !refreshing && (
              <span className="text-xs text-slate-400 dark:text-gray-600">
                Updated {timeAgoLabel}
              </span>
            )}
          </div>
        </div>

        <FilterBar
          isDark={isDark}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          availableSources={availableSources}
          hideRead={hideRead}
          setHideRead={setHideRead}
          showBookmarksOnly={showBookmarksOnly}
          setShowBookmarksOnly={setShowBookmarksOnly}
          readCount={readCount}
          bookmarkCount={bookmarkCount}
          hasFilters={hasFilters}
          onReset={resetFilters}
          onClearRead={clearRead}
        />

        {pendingArticles.length > 0 && (
          <button
            onClick={applyPendingArticles}
            className="cursor-pointer w-full mb-6 py-3 rounded-xl text-sm transition-all border bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
          >
            New articles available — click to view
          </button>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl animate-pulse bg-slate-200 dark:bg-white/5"
              />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={() => router.refresh()} />
        ) : visibleArticles.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onReset={resetFilters}
            onEditPreferences={() => router.push('/')}
          />
        ) : (
          <>
            <p className="text-xs text-slate-400 dark:text-gray-600 mb-4">
              {visibleArticles.length} article
              {visibleArticles.length === 1 ? '' : 's'}
            </p>
            <div className="flex flex-col gap-4">
              {visibleArticles.map((art) => (
                <ArticleCard
                  key={art.link}
                  article={art}
                  isRead={readLinks.has(art.link)}
                  isBookmarked={bookmarks.has(art.link)}
                  onMarkRead={() => markAsRead(art.link)}
                  onToggleBookmark={() => toggleBookmark(art.link)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function FilterBar(props: {
  isDark: boolean;
  dateFilter: DateFilter;
  setDateFilter: (v: DateFilter) => void;
  sourceFilter: string;
  setSourceFilter: (v: string) => void;
  availableSources: string[];
  hideRead: boolean;
  setHideRead: (v: boolean) => void;
  showBookmarksOnly: boolean;
  setShowBookmarksOnly: (v: boolean) => void;
  readCount: number;
  bookmarkCount: number;
  hasFilters: boolean;
  onReset: () => void;
  onClearRead: () => void;
}) {
  const {
    isDark,
    dateFilter,
    setDateFilter,
    sourceFilter,
    setSourceFilter,
    availableSources,
    hideRead,
    setHideRead,
    showBookmarksOnly,
    setShowBookmarksOnly,
    readCount,
    bookmarkCount,
    hasFilters,
    onReset,
    onClearRead,
  } = props;

  return (
    <div
      className={`flex flex-col gap-3 mb-6 p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-gray-600 shrink-0">
          Date
        </span>
        {(Object.keys(DATE_LABELS) as DateFilter[]).map((key) => {
          const active = dateFilter === key;
          return (
            <button
              key={key}
              onClick={() => setDateFilter(key)}
              className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-all ${
                active
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : isDark
                    ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {DATE_LABELS[key]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-gray-600 shrink-0">
          Source
        </span>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          aria-label="Filter by source"
          className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-all outline-none ${
            isDark
              ? 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300'
          }`}
        >
          <option value="all">All sources</option>
          {availableSources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
            showBookmarksOnly
              ? 'bg-amber-500 border-amber-500 text-white'
              : isDark
                ? 'bg-white/5 border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-500/40'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-300'
          }`}
        >
          <BookmarkIcon filled={showBookmarksOnly} />
          Bookmarks
          {bookmarkCount > 0 && (
            <span
              className={`px-1.5 rounded-full text-[10px] font-semibold ${showBookmarksOnly ? 'bg-white/30' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}
            >
              {bookmarkCount}
            </span>
          )}
        </button>

        {readCount > 0 && (
          <button
            onClick={() => setHideRead(!hideRead)}
            className={`cursor-pointer text-xs px-3 py-1.5 rounded-full border transition-all ${
              hideRead
                ? 'bg-blue-500 border-blue-500 text-white'
                : isDark
                  ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            {hideRead ? 'Show read' : 'Hide read'} ({readCount})
          </button>
        )}

        {readCount > 0 && (
          <button
            onClick={onClearRead}
            className="cursor-pointer text-xs px-3 py-1.5 rounded-full border border-transparent text-slate-400 dark:text-gray-600 hover:text-red-500 hover:underline"
          >
            Reset read
          </button>
        )}

        {hasFilters && (
          <button
            onClick={onReset}
            className="cursor-pointer text-xs ml-auto text-slate-400 dark:text-gray-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  isRead,
  isBookmarked,
  onMarkRead,
  onToggleBookmark,
}: {
  article: Article;
  isRead: boolean;
  isBookmarked: boolean;
  onMarkRead: () => void;
  onToggleBookmark: () => void;
}) {
  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none ${isRead ? 'opacity-50' : ''}`}
    >
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onMarkRead}
        className="block p-5 pb-16"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400">
            {article.source}
          </span>
          <span className="text-xs text-slate-400 dark:text-gray-600">
            {new Date(article.date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
        <h2 className="text-base font-semibold leading-snug mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
          {article.title}
        </h2>
        <p className="text-sm line-clamp-2 leading-relaxed text-slate-600 dark:text-gray-500">
          {article.snippet}
        </p>
      </a>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={onToggleBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${
            isBookmarked
              ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:border-amber-400 dark:hover:border-amber-500/50 opacity-0 group-hover:opacity-100'
          }`}
        >
          <BookmarkIcon filled={isBookmarked} />
        </button>

        {!isRead && (
          <button
            onClick={onMarkRead}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 opacity-0 group-hover:opacity-100 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/50 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-24">
      <p className="text-4xl mb-4">⚠️</p>
      <p className="text-slate-600 dark:text-gray-400 mb-6">
        An error occurred while fetching articles.
      </p>
      <button
        onClick={onRetry}
        className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onReset,
  onEditPreferences,
}: {
  hasFilters: boolean;
  onReset: () => void;
  onEditPreferences: () => void;
}) {
  return (
    <div className="text-center py-24 text-slate-400 dark:text-gray-600">
      <p className="text-4xl mb-4">{hasFilters ? '✓' : '∅'}</p>
      <p className="mb-6">
        {hasFilters
          ? 'No articles match the current filters.'
          : 'No articles found for these categories.'}
      </p>
      <button
        onClick={hasFilters ? onReset : onEditPreferences}
        className="cursor-pointer px-6 py-3 rounded-lg text-sm transition-colors border bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none"
      >
        {hasFilters ? 'Clear filters' : 'Edit preferences'}
      </button>
    </div>
  );
}
