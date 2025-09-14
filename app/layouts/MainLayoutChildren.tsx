import { Link, useNavigation } from 'react-router';
import type React from 'react';
import ThemeToggle from '~/components/ThemeToggle';

export default function MainLayoutChildren({
  children,
}: React.PropsWithChildren) {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <div className="min-h-svh flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-raleway">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <nav className="px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-mono font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 "
          >
            @trolleyman
          </Link>
          <div className="flex items-center gap-4">
            {isNavigating && (
              <div className="w-4 h-4 animate-spin">
                <div className="w-full h-full border-2 border-gray-300 dark:border-gray-600 rounded-full">
                  <div className="w-full h-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-ping" />
                </div>
              </div>
            )}
            <Link
              to="/blog"
              prefetch="viewport"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Blog
            </Link>
            <Link
              to="/projects"
              prefetch="viewport"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Projects
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-6 pt-24 pb-6">
        {/* pt accounts for fixed header height */}
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 flex justify-between items-center">
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
