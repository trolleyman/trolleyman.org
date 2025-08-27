import { createContext, useContext, useEffect, useState } from "react";
import { createCookie, useLoaderData } from "react-router";
import { type loader as rootLoader } from "~/root"

// Theme type
export type Theme = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

const cookieExpirySeconds = 60 * 60 * 24 * 365;
const cookiePath = "/"
const cookieSameSite = 'lax'
const cookieSecure = false

export function isTheme(theme: any): theme is Theme {
    return (theme === 'system' || theme === 'dark' || theme === 'light')
}

export const cookie = createCookie("theme", {
    path: cookiePath,
    sameSite: cookieSameSite,
    httpOnly: false,
    secure: cookieSecure,
    maxAge: cookieExpirySeconds,
});

// Theme context for global theme management
const ThemeContext = createContext({
    theme: "system" as Theme,
    setTheme: (_theme: Theme) => { },
    resolvedTheme: "light" as ResolvedTheme,
});

function setDocumentCookie(theme: Theme) {
    cookie.serialize(theme).then(c => {
        document.cookie = c
    }).catch(e => {
        console.log('Error setting theme cookie', e)
    })
}

export function useTheme() {
    return useContext(ThemeContext);
}

export default function ThemeProvider({ children, cookieTheme }: { children: React.ReactNode, cookieTheme?: Theme }) {
    const [theme, setThemeState] = useState<Theme>(cookieTheme || "system");
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

    // Load theme from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || stored === "light" || stored === "system") {
            setThemeState(stored as Theme);
        }
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        const mq = getSystemDarkMediaQuery();
        const updateResolved = () => setResolvedTheme(resolveTheme(theme, mq));
        mq.addEventListener("change", updateResolved);
        updateResolved();
        return () => mq.removeEventListener("change", updateResolved);
    }, [theme]);

    // Update <html> attribute and localStorage
    useEffect(() => {
        let effectiveTheme = theme;
        if (theme === "system") {
            effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        setResolvedTheme(effectiveTheme as ResolvedTheme);
        const html = document.documentElement;
        if (effectiveTheme === "dark") {
            html.setAttribute("data-theme", "dark");
        } else {
            html.removeAttribute("data-theme");
        }
        localStorage.setItem("theme", theme);
        setDocumentCookie(theme)
    }, [theme]);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem("theme", t);
        setDocumentCookie(t)
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function getSystemDarkMediaQuery() {
    return window.matchMedia("(prefers-color-scheme: dark)");
}

export function isSystemDark(mediaQuery?: MediaQueryList): boolean {
    return (mediaQuery ?? getSystemDarkMediaQuery()).matches;
}

export function resolveTheme(theme: Theme = "system", mediaQuery?: MediaQueryList): ResolvedTheme {
    return theme === "system" ? isSystemDark(mediaQuery) ? "dark" : "light" : theme;
}
