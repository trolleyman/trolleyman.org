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
import ThemeProvider, { isTheme, cookie as themeCookie, type Theme } from "./components/ThemeProvider";

import "./app.css";
import MainLayoutErrorPage from "./components/MainLayoutErrorPage";

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

  return {
    cookieTheme
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<unknown>()
  const cookieTheme = typeof loaderData === 'object' && loaderData !== null && 'cookieTheme' in loaderData && isTheme(loaderData.cookieTheme) ? loaderData.cookieTheme : undefined

  return (
    <html lang="en" suppressHydrationWarning={true /* Needed for dark mode */} {...(cookieTheme === "dark" ? { "data-theme": "dark" } : {})}>
      <head>
        <script>{`(function() {
            var stored = localStorage.getItem("theme")${isTheme(cookieTheme) ? `|| "${cookieTheme}"` : ""};
            var html = document.documentElement;
            if (stored === "dark") {
              html.setAttribute("data-theme", "dark");
            } else if (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
              html.setAttribute("data-theme", "dark");
            }
        })()`}</script>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider cookieTheme={cookieTheme}>
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
