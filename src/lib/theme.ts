import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'kit-theme';

function readStoredTheme(): Theme | null {
  try {
    const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedValue === 'dark' || storedValue === 'light') {
      return storedValue;
    }
  } catch {
    return null;
  }
  return null;
}

function prefersDarkScheme(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
}

export function getInitialTheme(): Theme {
  const storedTheme = readStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }
  const rootTheme = document.documentElement.dataset.theme;
  if (rootTheme === 'dark' || rootTheme === 'light') {
    return rootTheme;
  }
  return prefersDarkScheme() ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Persistence is best-effort; theme still applies in-session.
  }
  if (typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kit:theme', { detail: theme }));
  }
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggle = (): void => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return { theme, toggle };
}
