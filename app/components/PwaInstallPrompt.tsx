'use client';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';
type Status = 'pending' | 'installed' | 'dismissed' | Platform;

const DISMISS_KEY = 'pwa-prompt-dismissed-at';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  const navStandalone = (window.navigator as { standalone?: boolean }).standalone;
  return Boolean(navStandalone);
}

function recentlyDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const at = Number(raw);
  if (Number.isNaN(at)) return false;
  return Date.now() - at < DISMISS_MS;
}

function statusSubscribe() {
  return () => {};
}

function statusServerSnapshot(): Status {
  return 'pending';
}

function statusClientSnapshot(): Status {
  if (typeof window === 'undefined') return 'pending';
  if (isStandalone()) return 'installed';
  if (recentlyDismissed()) return 'dismissed';
  return detectPlatform();
}

export default function PwaInstallPrompt() {
  const status = useSyncExternalStore(
    statusSubscribe,
    statusClientSnapshot,
    statusServerSnapshot
  );

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissedTick, setDismissedTick] = useState(0);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    function handleAppInstalled() {
      setInstallEvent(null);
      setModalOpen(false);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setModalOpen(false);
    setDismissedTick((t) => t + 1);
  }, []);

  const trigger = useCallback(async () => {
    if (installEvent) {
      try {
        await installEvent.prompt();
        const choice = await installEvent.userChoice;
        setInstallEvent(null);
        if (choice.outcome === 'accepted') return;
      } catch {
        /* ignore */
      }
    }
    setModalOpen(true);
  }, [installEvent]);

  if (status === 'pending' || status === 'installed' || status === 'dismissed' || status === 'unknown') {
    return null;
  }

  if (dismissedTick > 0 && recentlyDismissed()) {
    return null;
  }

  const platform = status;
  const showBanner = platform === 'ios' || installEvent !== null;
  if (!showBanner) return null;

  return (
    <>
      <div
        role="region"
        aria-label="Install Signal Hub"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 animate-in slide-in-from-bottom-4 fade-in duration-300"
      >
        <div className="flex items-center gap-3 p-3 rounded-2xl border bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-white/10 shadow-lg shadow-slate-900/10 dark:shadow-black/40">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
            <Image
              src="/logo/logo-signal-hub.png"
              alt=""
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              Install Signal Hub
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
              One-tap access from your home screen
            </p>
          </div>
          <button
            onClick={trigger}
            className="cursor-pointer shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-400 text-white shadow-sm shadow-blue-500/20 transition-colors"
          >
            Install
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="cursor-pointer shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {modalOpen && (
        <InstallModal
          platform={platform}
          onClose={() => setModalOpen(false)}
          onDismiss={dismiss}
        />
      )}
    </>
  );
}

function InstallModal({
  platform,
  onClose,
  onDismiss,
}: {
  platform: Platform;
  onClose: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Install Signal Hub"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-4">
            <Image
              src="/logo/logo-signal-hub.png"
              alt=""
              width={44}
              height={44}
              className="w-11 h-11 object-contain"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Install Signal Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Get a native-feeling app on your home screen — no app store needed.
          </p>
        </div>

        {platform === 'ios' ? (
          <IOSInstructions />
        ) : platform === 'android' ? (
          <AndroidInstructions />
        ) : (
          <DesktopInstructions />
        )}

        <button
          onClick={onDismiss}
          className="cursor-pointer mt-6 w-full text-xs text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
        >
          Don&apos;t show this again
        </button>
      </div>
    </div>
  );
}

function Step({
  index,
  title,
  description,
  icon,
}: {
  index: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </span>
          <span className="shrink-0 text-blue-500 dark:text-blue-400">{icon}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IOSInstructions() {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-1">
        iOS · Safari
      </div>
      <Step
        index={1}
        title="Tap the Share button"
        description="In the Safari toolbar at the bottom of the screen."
        icon={<ShareIcon />}
      />
      <Step
        index={2}
        title='Choose "Add to Home Screen"'
        description="Scroll down in the share sheet if needed."
        icon={<PlusSquareIcon />}
      />
      <Step
        index={3}
        title='Tap "Add"'
        description="The Signal Hub icon will appear on your home screen."
        icon={<CheckIcon />}
      />
    </div>
  );
}

function AndroidInstructions() {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-1">
        Android · Chrome
      </div>
      <Step
        index={1}
        title="Open the menu"
        description="Tap the three-dots icon in the top right."
        icon={<MoreIcon />}
      />
      <Step
        index={2}
        title='Tap "Install app"'
        description='Or "Add to Home screen" depending on your version.'
        icon={<PlusSquareIcon />}
      />
      <Step
        index={3}
        title="Confirm"
        description="The app installs and appears in your launcher."
        icon={<CheckIcon />}
      />
    </div>
  );
}

function DesktopInstructions() {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-1">
        Desktop · Chrome / Edge
      </div>
      <Step
        index={1}
        title="Open the address bar menu"
        description="Look for the install icon at the right of the URL."
        icon={<PlusSquareIcon />}
      />
      <Step
        index={2}
        title='Click "Install Signal Hub"'
        description="A small dialog confirms the installation."
        icon={<CheckIcon />}
      />
      <Step
        index={3}
        title="Launch from your applications"
        description="Signal Hub opens in its own dedicated window."
        icon={<CheckIcon />}
      />
    </div>
  );
}
