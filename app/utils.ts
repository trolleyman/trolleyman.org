import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))

export const dotMinIfDebug = import.meta.env.DEV ? '.min' : '';

// Expands object types one level deep (helps with debugging)
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// Expands object types recursively (helps with debugging)
export type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T;
