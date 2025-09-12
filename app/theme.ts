import { createCookie } from "react-router";

export type Theme = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

export function isTheme(theme: any): theme is Theme {
    return (theme === 'system' || theme === 'dark' || theme === 'light')
}

export function isResolvedTheme(theme: any): theme is ResolvedTheme {
    return (theme === 'dark' || theme === 'light')
}

export const themeCookie = createCookie("theme", {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure: false,
    maxAge: 60 * 60 * 24 * 365,
});

export const resolvedThemeCookie = createCookie("resolvedTheme", {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure: false,
    maxAge: 60 * 60 * 24 * 365,
});
