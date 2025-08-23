import { createContext, useContext, useEffect, useState } from "react";

// Theme type
export type Theme = "system" | "dark" | "light";
export type ResolvedTheme = "dark" | "light";

// Theme context for global theme management
const ThemeContext = createContext({
    theme: "system" as Theme,
    setTheme: (_theme: Theme) => { },
    resolvedTheme: "light" as ResolvedTheme,
});

export function useTheme() {
    return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system");
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
    }, [theme]);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem("theme", t);
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
