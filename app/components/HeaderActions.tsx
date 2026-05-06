'use client';
import { GITHUB_URL } from '../lib/site';

const buttonClass =
  'flex items-center justify-center w-9 h-9 rounded-lg border text-sm transition-all cursor-pointer bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white shadow-sm dark:shadow-none';

export default function HeaderActions({
  isDark,
  toggleTheme,
}: {
  isDark: boolean;
  toggleTheme: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
        className={buttonClass}
      >
        <GithubMark />
      </a>
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={buttonClass}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

function GithubMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4.5 h-4.5"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.67 5.56.67 11.83c0 5.02 3.25 9.27 7.76 10.77.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.95-3.16.69-3.83-1.52-3.83-1.52-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.52-.29-5.18-1.26-5.18-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.16a10.9 10.9 0 015.72 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.67 5.31-5.21 5.59.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.14 0 .3.21.66.79.55 4.5-1.5 7.75-5.75 7.75-10.77C23.33 5.56 18.27.5 12 .5z" />
    </svg>
  );
}
