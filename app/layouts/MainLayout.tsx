import { useTheme } from '~/components/ThemeProvider';
import { Link, Outlet } from 'react-router';
import { CgDarkMode } from "react-icons/cg";
import { FaSun, FaMoon } from 'react-icons/fa6';

export default function MainLayout() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    const themeTitle = theme === 'dark' ? `Dark` : theme === 'light' ? 'Light' : `System (${resolvedTheme === 'dark' ? "Dark" : "Light"})`

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-raleway">
            {/* Navigation Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                <nav className="mx-auto px-6 py-4 flex justify-between items-baseline">
                    <Link to="/" className="text-xl font-mono font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 ">
                        @trolleyman
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/blog/" prefetch='viewport' className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Blog
                        </Link>
                        <Link to="/projects/" prefetch='viewport' className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Projects
                        </Link>
                        <Link
                            to="#"
                            onClick={(e) => {
                                e.preventDefault();
                                cycleTheme();
                            }}
                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                            aria-label="Cycle theme"
                            title={themeTitle}
                        >
                            {theme === 'system'
                                ? <CgDarkMode className="text-lg" />
                                : theme === 'dark'
                                    ? <FaMoon className="text-lg" />
                                    : <FaSun className="text-lg" />}
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-24">{/* pt and pb here assume a certain height for header and footer */}
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                <div className="mx-auto px-6 py-4 flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">©2025 Callum Tolley</p>
                </div>
            </footer>
        </div>
    );
}
