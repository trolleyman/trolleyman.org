import type { Route } from './+types/root';

import type React from 'react';
import { useRef } from 'react';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';

import MainLayoutErrorPage from './components/MainLayoutErrorPage';
import ThemeProvider from './components/ThemeProvider';
import { isTheme, themeCookie, type Theme } from './theme';

import './app.css';

export const links: Route.LinksFunction = () => [
  // e.g:
  // { rel: "preconnect", href: "https://fonts.googleapis.com" },
  // { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie');
  let cookieTheme: Theme | undefined = undefined;
  try {
    const cookieFromHeader = await themeCookie.parse(cookieHeader);
    if (isTheme(cookieFromHeader)) {
      cookieTheme = cookieFromHeader;
    }
  } catch {}

  return { cookieTheme };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const htmlRef = useRef<HTMLHtmlElement>(null);
  const loaderData = useLoaderData<typeof loader | null | undefined>();
  const cookieTheme =
    typeof loaderData === 'object' && loaderData !== null
      ? loaderData.cookieTheme
      : undefined;

  return (
    <html lang="en" ref={htmlRef} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var c=document.cookie.split(';'),t,r;for(var i=0;i<c.length;i++){var p=c[i].trim().split('='),k=p[0],v=decodeURIComponent(p.slice(1).join('='));try{v=JSON.parse(v);}catch(e){}if(k==='theme')t=v;if(k==='resolvedTheme')r=v;}if(!t){try{t=localStorage.getItem('theme');}catch(e){}}var dark=r==='dark'||t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.setAttribute('data-theme','dark');}catch(e){}})()`,
          }}
        />
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
  return <MainLayoutErrorPage error={error} />;
}
