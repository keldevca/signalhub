'use client';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

const STORAGE_EVENT = 'signalhub:storage';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function notify(key: string) {
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
}

export function useLocalStorageString(
  key: string,
  defaultValue: string
): [string, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => (typeof window === 'undefined' ? defaultValue : localStorage.getItem(key) ?? defaultValue),
    () => defaultValue
  );

  const setValue = useCallback(
    (next: string) => {
      localStorage.setItem(key, next);
      notify(key);
    },
    [key]
  );

  return [value, setValue];
}

export function useLocalStorageStringArray(
  key: string
): [string[], (value: string[]) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => (typeof window === 'undefined' ? null : localStorage.getItem(key)),
    () => null
  );

  const value = useMemo<string[]>(() => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }, [raw]);

  const setValue = useCallback(
    (next: string[]) => {
      if (next.length === 0) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(next));
      notify(key);
    },
    [key]
  );

  return [value, setValue];
}

export function useLocalStorageSet(
  key: string
): [Set<string>, (value: Set<string>) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => (typeof window === 'undefined' ? null : localStorage.getItem(key)),
    () => null
  );

  const value = useMemo<Set<string>>(() => {
    if (!raw) return new Set();
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set<string>(parsed) : new Set();
    } catch {
      return new Set();
    }
  }, [raw]);

  const setValue = useCallback(
    (next: Set<string>) => {
      if (next.size === 0) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify([...next]));
      notify(key);
    },
    [key]
  );

  return [value, setValue];
}
