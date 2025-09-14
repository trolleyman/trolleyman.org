import { CgDarkMode } from 'react-icons/cg';
import { FaSun, FaMoon } from 'react-icons/fa6';
import { useTheme } from '~/components/ThemeProvider';
import { cn } from '~/utils';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const optionClasses = (active: boolean) =>
    cn(
      'flex-1 inline-flex items-center justify-center h-8 select-none text-xs font-medium cursor-pointer px-1 first:pl-2 last:pr-2 border-gray-400 dark:border-gray-600',
      active
        ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    );

  return (
    <div
      className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden divide-x-1 border-1 border-gray-500 dark:border-gray-400"
      role="group"
      aria-label="Theme toggle"
    >
      <button
        type="button"
        className={optionClasses(theme === 'system')}
        aria-pressed={theme === 'system'}
        onClick={() => setTheme('system')}
        title={`System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`}
      >
        <CgDarkMode className="text-base" />
      </button>
      <button
        type="button"
        className={optionClasses(theme === 'light')}
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
        title="Light"
      >
        <FaSun className="text-base" />
      </button>
      <button
        type="button"
        className={optionClasses(theme === 'dark')}
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
        title="Dark"
      >
        <FaMoon className="text-base" />
      </button>
    </div>
  );
}
