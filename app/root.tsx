import React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import ThemeProvider from "./components/ThemeProvider";

import "./app.css";

export const links: Route.LinksFunction = () => [
  // e.g:
  // { rel: "preconnect", href: "https://fonts.googleapis.com" },
  // { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>
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
  let title = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = `Error ${error.status}`;
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen bg-[#424d75] text-white text-center font-raleway font-bold [text-shadow:2px_2px_7px_black] text-[14pt] max-[1680px]:text-[13pt] max-[1280px]:text-[11pt] max-[980px]:text-[11pt] max-[736px]:text-[9pt] max-[640px]:text-[7pt]" >
      <h1 className="status text-[8em] mt-0 mb-[-10px] text-[#2e3141] font-bold text-shadow-[-1px_-1px_0_#FFF,_1px_-1px_0_#FFF,_-1px_1px_0_#FFF,_1px_1px_0_#FFF,_2px_2px_0_#FFF,_3px_3px_0_#FFF,_2px_1px_0_#FFF,_3px_2px_0_#FFF,3px_3px_20px_black]"
      // style={{
      //   textShadow:
      //     "-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF, 2px 2px 0 #FFF, 3px 3px 0 #FFF, 2px 1px 0 #FFF, 3px 2px 0 #FFF, 3px 3px 20px black"
      // }}
      >{title}</h1>
      <p className="text-[3em] mt-0 mb-0">{details}</p>
      {stack && (
        <pre className="mt-2 text-[1.1em] text-[#afafaf] w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
