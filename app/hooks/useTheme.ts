'use client';
import { useCallback, useEffect } from 'react';
import { useLocalStorageString } from './useLocalStorage';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useLocalStorageString('theme', 'dark');
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  return { theme: theme as Theme, toggleTheme, isDark };
}
