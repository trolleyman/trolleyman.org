/**
 * Shared control styling, kept in one place so the buttons and inputs across
 * the flashcard views stay consistent with the rest of the site's palette.
 */
import { cn } from '~/utils';

export const buttonBase = `rounded-md px-3 py-2 text-sm font-medium
  transition-colors disabled:cursor-not-allowed disabled:opacity-40`;

export const buttonPrimary = cn(
  buttonBase,
  `bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-gray-900
  dark:hover:bg-blue-400`,
);

export const buttonSecondary = cn(
  buttonBase,
  `border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600
  dark:text-gray-300 dark:hover:bg-gray-800`,
);

export const buttonQuiet = cn(
  buttonBase,
  `text-gray-500 hover:text-gray-900 dark:text-gray-400
  dark:hover:text-gray-100`,
);

export const buttonDanger = cn(
  buttonBase,
  'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40',
);

export const inputClasses = `w-full rounded-md border border-gray-300
  bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400
  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none
  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
  dark:placeholder:text-gray-500`;

export const panelClasses = `rounded-lg border border-gray-200 bg-white
  dark:border-gray-700 dark:bg-gray-800/50`;

export const hintClasses = 'text-xs text-gray-500 dark:text-gray-400';
