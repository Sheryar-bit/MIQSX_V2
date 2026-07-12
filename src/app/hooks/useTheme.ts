'use client';
import { useState, useCallback } from 'react';

const KEY = 'mqsx-theme';

function getInitialDark(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

export function useTheme() {
  // Lazy initializer reads the value the inline <script> already set on <html>
  // so there is no flash — the DOM and React state agree from the first render.
  const [dark, setDarkState] = useState<boolean>(getInitialDark);

  const setDark = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setDarkState(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem(KEY, next ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      } catch (_) {}
      return next;
    });
  }, []);

  return [dark, setDark] as const;
}
