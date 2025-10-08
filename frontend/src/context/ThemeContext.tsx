'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isReady: boolean;
}

const STORAGE_KEY = 'hairpros-theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    root.classList.add('theme-dark');
  } else {
    root.classList.remove('theme-dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeState(storedTheme);
      applyTheme(storedTheme);
      setIsReady(true);
      return;
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    const initialTheme: Theme = prefersDark ? 'dark' : 'light';
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme, isReady]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: theme,
      toggleTheme,
      setTheme,
      isReady,
    }),
    [theme, toggleTheme, setTheme, isReady],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
