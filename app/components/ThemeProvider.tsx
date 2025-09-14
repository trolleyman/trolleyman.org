import { createContext, useContext, useEffect, useState } from 'react';
import type { ResolvedTheme, Theme } from '~/theme';
import {
  getLocalStorageTheme,
  getSystemDarkMediaQuery,
  resolveTheme,
  setThemeDocumentCookie,
  setLocalStorageTheme,
  setResolvedThemeDocumentCookie,
} from '~/theme.client';

// Theme context for global theme management
const ThemeContext = createContext({
  theme: 'system' as Theme,
  setTheme: (_theme: Theme) => {},
  resolvedTheme: 'light' as ResolvedTheme,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({
  children,
  cookieTheme,
  htmlRef,
}: {
  children: React.ReactNode;
  cookieTheme?: Theme;
  htmlRef: React.RefObject<HTMLHtmlElement | null>;
}) {
  const [theme, setTheme] = useState<Theme>(cookieTheme || 'system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Load theme from localStorage
  useEffect(() => {
    const stored = getLocalStorageTheme();
    if (stored) {
      setTheme(stored);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const systemDarkMediaQuery = getSystemDarkMediaQuery();
    const updateResolved = () => setResolvedTheme(resolveTheme(theme));
    systemDarkMediaQuery.addEventListener('change', updateResolved);
    updateResolved();
    return () =>
      systemDarkMediaQuery.removeEventListener('change', updateResolved);
  }, [theme]);

  // Update <html> attribute and localStorage
  useEffect(() => {
    setLocalStorageTheme(theme);
    setThemeDocumentCookie(theme);
    setResolvedTheme(resolveTheme(theme));
  }, [theme]);

  useEffect(() => {
    setResolvedThemeDocumentCookie(resolvedTheme);
    if (htmlRef.current) {
      if (resolvedTheme === 'dark') {
        htmlRef.current.setAttribute('data-theme', 'dark');
      } else {
        htmlRef.current.removeAttribute('data-theme');
      }
    }
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
