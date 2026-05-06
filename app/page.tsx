'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ParticleBackground from './components/ParticleBackground';
import InteractiveFace from './components/InteractiveFace';
import HeaderActions from './components/HeaderActions';
import { useTheme } from './hooks/useTheme';
import { useLocalStorageStringArray } from './hooks/useLocalStorage';
import { categoriesToSlug } from './lib/categories';

const PREFERENCE_GROUPS = [
  { id: 'langages', label: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Rust', 'Go', 'PHP', 'C / C++'] },
  { id: 'frameworks', label: 'Frameworks', items: ['React', 'Angular', 'Next.js', 'Vue.js', 'Node.js'] },
  { id: 'devops', label: 'DevOps & Infra', items: ['Docker', 'Kubernetes', 'DevOps', 'Linux'] },
  { id: 'cloud', label: 'Cloud', items: ['Cloud'] },
  { id: 'ia', label: 'AI & Data', items: ['Artificial Intelligence', 'Machine Learning', 'Data Science'] },
  { id: 'securite', label: 'Security', items: ['Cybersecurity'] },
  { id: 'mobile', label: 'Mobile', items: ['iOS / Swift', 'Android', 'Flutter', 'React Native'] },
  { id: 'design', label: 'Design & Creative', items: ['UI / UX Design', 'Motion Design', '3D / Blender', 'CSS'] },
  { id: 'archi', label: 'Architecture', items: ['Architecture'] },
  { id: 'general', label: 'General', items: ['Open Source', 'Tech News', 'Startups'] },
];

function SwipeIndicator() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setOffset(prev => prev === 0 ? 4 : 0), 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center gap-2 mt-2 select-none text-slate-400 dark:text-gray-500">
      <span
        className="text-xs transition-transform duration-[750ms] ease-in-out"
        style={{ transform: `translateX(-${offset}px)` }}
      >←</span>
      <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase">swipe</span>
      <span
        className="text-xs transition-transform duration-[750ms] ease-in-out"
        style={{ transform: `translateX(${offset}px)` }}
      >→</span>
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useLocalStorageStringArray('preferences');
  const [activeGroup, setActiveGroup] = useState(PREFERENCE_GROUPS[0].id);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const tabsRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragScrollLeft = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const animFrame = useRef<number>(0);

  function updateScrollProgress() {
    const el = tabsRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
  }

  useEffect(() => {
    updateScrollProgress();
    const el = tabsRef.current;
    el?.addEventListener('scroll', updateScrollProgress);
    window.addEventListener('resize', updateScrollProgress);
    return () => {
      el?.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      cancelAnimationFrame(animFrame.current);
    };
  }, []);

  function onMouseDown(e: React.MouseEvent) {
    cancelAnimationFrame(animFrame.current);
    isDragging.current = true;
    velocity.current = 0;
    lastX.current = e.clientX;
    dragScrollLeft.current = tabsRef.current?.scrollLeft ?? 0;
    if (tabsRef.current) tabsRef.current.style.cursor = 'grabbing';
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !tabsRef.current) return;
    e.preventDefault();
    const delta = e.clientX - lastX.current;
    velocity.current = delta;
    lastX.current = e.clientX;
    tabsRef.current.scrollLeft -= delta;
  }

  function applyInertia() {
    if (!tabsRef.current || Math.abs(velocity.current) < 0.5) return;
    tabsRef.current.scrollLeft -= velocity.current;
    velocity.current *= 0.95;
    animFrame.current = requestAnimationFrame(applyInertia);
  }

  function onMouseUp() {
    isDragging.current = false;
    if (tabsRef.current) tabsRef.current.style.cursor = 'grab';
    applyInertia();
  }

  function togglePreference(pref: string) {
    setSelected(
      selected.includes(pref)
        ? selected.filter((p) => p !== pref)
        : [...selected, pref]
    );
  }

  function handleSubmit() {
    const slug = categoriesToSlug(selected);
    if (!slug) return;
    router.push(`/feed/${slug}`);
  }

  const currentGroup = PREFERENCE_GROUPS.find(g => g.id === activeGroup)!;

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center pt-20 sm:pt-[12vh] pb-6 sm:pb-16 px-4 sm:px-6 bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white transition-colors duration-300">
      <ParticleBackground isDark={isDark} />

      {/* Logo & Titre */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex sm:flex-col items-center select-none">
        <Image
          src="/logo/logo-signal-hub.png"
          alt="Signal Hub logo"
          width={40}
          height={40}
          priority
          className="w-10 h-10 object-contain sm:mb-1.5 drop-shadow-md"
        />
        <span translate="no" className="fixed top-[22px] left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 text-[12px] sm:text-[10px] font-bold tracking-widest uppercase text-slate-900 dark:text-white">
          Signal Hub
        </span>
      </div>

      <HeaderActions isDark={isDark} toggleTheme={toggleTheme} />

      <div
        className={`relative z-10 w-full max-w-2xl flex flex-col gap-4 sm:gap-8 transition-transform duration-500 ease-out ${selected.length === 0 ? 'translate-y-[12vh] sm:translate-y-[15vh]' : 'translate-y-0'
          }`}
      >

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-1 sm:mb-3 text-slate-900 dark:bg-gradient-to-br dark:from-white dark:to-gray-400 dark:bg-clip-text dark:text-transparent">
            What topics interest you?
          </h1>
          <p className="text-slate-500 dark:text-gray-500 mb-2 sm:mb-0">
            Pick a domain and select your topics.
          </p>
          <div className="hidden sm:block">
            <InteractiveFace />
          </div>
        </div>

        {/* Onglets groupes */}
        <div className="flex flex-col gap-1.5">
          <div className="relative w-full">
            <div
              ref={tabsRef}
              className="flex gap-2 overflow-x-auto pb-1 px-4 select-none [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]"
              style={{ scrollbarWidth: 'none', cursor: 'grab' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {PREFERENCE_GROUPS.map((group) => {
                const count = group.items.filter(i => selected.includes(i)).length;
                const isActive = activeGroup === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroup(group.id)}
                    className={`cursor-pointer shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${isActive
                      ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : isDark
                        ? 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 shadow-sm'
                      }`}
                  >
                    {group.label}
                    <span className={`text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold transition-all ${count > 0
                      ? isActive ? 'bg-white/25 text-white' : 'bg-blue-500 text-white'
                      : 'hidden'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barre de progression scroll */}
          <div className={`relative h-0.5 rounded-full overflow-hidden mt-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-150"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>

          {/* Indicateur Swipe */}
          <SwipeIndicator />
        </div>

        {/* Sous-catégories */}
        <div className={`rounded-2xl border p-4 sm:p-6 transition-all duration-200 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className={`text-xs font-mono uppercase tracking-widest mb-4 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
            {currentGroup.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {currentGroup.items.map((pref) => {
              const isSelected = selected.includes(pref);
              return (
                <button
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${isSelected
                    ? 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20 scale-105'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-slate-900'
                    }`}
                >
                  <span className={isSelected ? 'mr-1.5' : 'hidden'}>✓</span>
                  <span>{pref}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sélections actives */}
        {selected.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className={`text-xs mb-2 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
              Selected ({selected.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selected.map((pref) => (
                <button
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${isDark
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                    : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                    }`}
                >
                  <span>{pref}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bouton */}
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="w-full py-4 mb-2 sm:mb-8 bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-xl font-semibold text-base text-white transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-400/30"
        >
          View my articles →
        </button>

      </div>
    </main>
  );
}
