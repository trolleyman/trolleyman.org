import clsx, { type ClassValue } from 'clsx'
import { useState, useMemo } from 'react';
import { twMerge } from 'tailwind-merge'
import slugify from 'slugify'
export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes))

export const dotMinIfDebug = import.meta.env.DEV ? '.min' : '';

// Expands object types one level deep (helps with debugging)
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// Expands object types recursively (helps with debugging)
export type ExpandRecursively<T> = T extends object
  ? T extends infer O ? { [K in keyof O]: ExpandRecursively<O[K]> } : never
  : T;

export function calculateIdFromChild(children: React.ReactNode): string | undefined {
    if (typeof children === 'string') {
        return slugify(children, { lower: true, strict: true });
    }
    return undefined;
}

export function useAutoId(children: React.ReactNode): string | undefined {
    return useMemo(() => calculateIdFromChild(children), [children]);
}

export function useStaticAutoId(children: React.ReactNode): string | undefined {
    return useMemo(() => calculateIdFromChild(children), []);
}