import type React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import ThemeProvider from "./components/ThemeProvider";
import { isTheme, themeCookie, resolvedThemeCookie, type Theme, type ResolvedTheme, isResolvedTheme } from "./theme";

import "./app.css";
import MainLayoutErrorPage from "./components/MainLayoutErrorPage";
import { useRef } from "react";

export const links: Route.LinksFunction = () => [
  // e.g:
  // { rel: "preconnect", href: "https://fonts.googleapis.com" },
  // { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  let cookieTheme: Theme | undefined = undefined
  try {
    const cookieFromHeader = await themeCookie.parse(cookieHeader)
    if (isTheme(cookieFromHeader)) {
      cookieTheme = cookieFromHeader
    }
  } catch {
  }

  let cookieResolvedTheme: ResolvedTheme | undefined = undefined
  try {
    const cookieFromHeader = await resolvedThemeCookie.parse(cookieHeader)
    if (isResolvedTheme(cookieFromHeader)) {
      cookieResolvedTheme = cookieFromHeader
    }
  } catch {
  }

  return {
    cookieTheme,
    cookieResolvedTheme,
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const htmlRef = useRef<HTMLHtmlElement>(null)
  const loaderData = useLoaderData<typeof loader | null | undefined>()
  const cookieTheme = typeof loaderData === 'object' && loaderData !== null ? loaderData.cookieTheme : undefined
  const cookieResolvedTheme = typeof loaderData === 'object' && loaderData !== null ? loaderData.cookieResolvedTheme : undefined

  return (
    <html lang="en" ref={htmlRef} {...(cookieResolvedTheme === "dark" || cookieTheme === "dark" ? { "data-theme": "dark" } : {})}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider cookieTheme={cookieTheme} htmlRef={htmlRef}>
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <MainLayoutErrorPage error={error} />
}
