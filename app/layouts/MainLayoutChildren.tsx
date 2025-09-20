import type React from 'react';
import { Link, useNavigation } from 'react-router';

import ThemeToggle from '~/components/ThemeToggle';

export default function MainLayoutChildren({
  children,
}: React.PropsWithChildren) {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <div
      className="font-raleway flex min-h-svh flex-col bg-white text-gray-900
        dark:bg-gray-900 dark:text-white"
    >
      {/* Navigation Header */}
      <header
        className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200
          bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80"
      >
        <nav className="flex items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="font-mono text-xl font-bold text-gray-900
              hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
          >
            @trolleyman
          </Link>
          <div className="flex items-center gap-4">
            {isNavigating && (
              <div className="h-4 w-4 animate-spin">
                <div
                  className="h-full w-full rounded-full border-2 border-gray-300
                    dark:border-gray-600"
                >
                  <div
                    className="h-full w-full animate-ping rounded-full border-2
                      border-blue-600 border-t-transparent dark:border-blue-400"
                  />
                </div>
              </div>
            )}
            {import.meta.env.DEV ? <ThemeToggle /> : undefined}
            <Link
              to="/blog"
              prefetch="viewport"
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300
                dark:hover:text-blue-400"
            >
              Blog
            </Link>
            <Link
              to="/projects"
              prefetch="viewport"
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300
                dark:hover:text-blue-400"
            >
              Projects
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main
        className="flex w-full flex-1 flex-col items-center justify-center px-6
          pt-24 pb-6"
      >
        {/* pt accounts for fixed header height */}
        {children}
      </main>

      {/* Footer */}
      <footer
        className="w-full border-t border-gray-200 bg-white/80 backdrop-blur-sm
          dark:border-gray-700 dark:bg-gray-900/80"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-gray-600 dark:text-gray-400">
            ©2025 Callum Tolley
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
