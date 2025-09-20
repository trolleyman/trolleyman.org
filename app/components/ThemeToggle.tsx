import { CgDarkMode } from 'react-icons/cg';
import { FaSun, FaMoon } from 'react-icons/fa6';

import { useTheme } from '~/components/ThemeProvider';
import { cn } from '~/utils';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const optionClasses = (active: boolean) =>
    cn(
      `inline-flex h-8 flex-1 cursor-pointer items-center justify-center
      border-gray-400 px-1 text-xs font-medium select-none first:pl-2 last:pr-2
      dark:border-gray-600`,
      active
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        : `text-gray-600 hover:bg-gray-100 dark:text-gray-300
          dark:hover:bg-gray-800`,
    );

  return (
    <div
      className="inline-flex items-center divide-x-1 overflow-hidden
        rounded-full border-1 border-gray-500 bg-gray-100 dark:border-gray-400
        dark:bg-gray-800"
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
