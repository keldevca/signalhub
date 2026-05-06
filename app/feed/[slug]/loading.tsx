import Image from 'next/image';

export default function FeedLoading() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]"
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-blue-500/10" />
          <Image
            src="/logo/logo-signal-hub.png"
            alt=""
            width={64}
            height={64}
            priority
            className="relative w-16 h-16 object-contain drop-shadow-md"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-blue-600 dark:text-blue-400">
            Loading
          </span>
          <span className="text-base sm:text-lg font-semibold text-slate-700 dark:text-gray-300">
            Curating your feed
          </span>
          <span className="text-xs text-slate-400 dark:text-gray-600">
            Fetching the latest articles from your sources…
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </main>
  );
}
