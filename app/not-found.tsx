import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white">
      <h1 className="text-5xl font-bold tracking-tight mb-4">404</h1>
      <p className="text-slate-500 dark:text-gray-500 mb-8 text-center">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
      >
        Back to home
      </Link>
    </main>
  );
}
