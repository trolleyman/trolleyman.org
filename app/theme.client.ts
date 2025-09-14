import {
  isTheme,
  resolvedThemeCookie,
  themeCookie as themeCookie,
} from '~/theme';
import type { ResolvedTheme, Theme } from '~/theme';

export function setThemeDocumentCookie(theme: Theme) {
  themeCookie
    .serialize(theme)
    .then((c) => {
      document.cookie = c;
    })
    .catch((e) => {
      console.log('Error setting theme cookie', e);
    });
}

export function setResolvedThemeDocumentCookie(resolvedTheme: ResolvedTheme) {
  resolvedThemeCookie
    .serialize(resolvedTheme)
    .then((c) => {
      document.cookie = c;
    })
    .catch((e) => {
      console.log('Error setting resolved theme cookie', e);
    });
}

export const localStorageKey = 'theme';

export const supportsLocalStorage =
  typeof localStorage !== 'undefined' ? localStorage : undefined;

export function getLocalStorageTheme(): Theme | undefined {
  if (supportsLocalStorage) {
    const localTheme = supportsLocalStorage.getItem(localStorageKey);
    if (isTheme(localTheme)) {
      return localTheme;
    }
  }
  return undefined;
}

export function setLocalStorageTheme(theme: Theme) {
  if (supportsLocalStorage) {
    supportsLocalStorage.setItem(localStorageKey, theme);
  }
}

export function getSystemDarkMediaQuery() {
  return window.matchMedia('(prefers-color-scheme: dark)');
}

export function isSystemDark(): boolean {
  return getSystemDarkMediaQuery().matches;
}

export function resolveTheme(theme: Theme = 'system'): ResolvedTheme {
  return theme === 'system' ? (isSystemDark() ? 'dark' : 'light') : theme;
}

export const initialLocalStorageTheme = getLocalStorageTheme();
