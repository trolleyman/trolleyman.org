import clsx, { type ClassValue } from 'clsx';
import { useState, useMemo } from 'react';
import React from 'react';
import { renderToString } from 'react-dom/server';
import slugify from 'slugify';
import { twMerge } from 'tailwind-merge';

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));

export const dotMinIfDebug = import.meta.env.DEV ? '.min' : '';

// Expands object types one level deep (helps with debugging)
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// Expands object types recursively (helps with debugging)
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

export function calculateIdFromChildren(
  children: React.ReactNode,
): string | undefined {
  if (typeof children === 'string') {
    return slugify(children, { lower: true, strict: true });
  }
  if (typeof children === 'number') {
    return slugify(children.toString(), { lower: true, strict: true });
  }
  if (React.isValidElement(children)) {
    // Extract text content from React element recursively
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
      }
      if (React.isValidElement(node)) {
        // Try to get children first
        const children = (node.props as any)?.children;
        if (children !== undefined) {
          return extractText(children);
        }
        // If no children, try to render the element to get text
        try {
          const rendered = renderToString(node);
          // Strip HTML tags to get just text content
          return rendered.replace(/<[^>]*>/g, ' ');
        } catch {
          return '';
        }
      }
      if (Array.isArray(node)) {
        return node.map(extractText).join(' ');
      }
      return '';
    };

    const textContent = extractText(children);
    return textContent
      ? slugify(textContent, { lower: true, strict: true })
      : undefined;
  }
  if (Array.isArray(children)) {
    const textContent = children
      .map(calculateIdFromChildren)
      .filter(Boolean)
      .join(' ');
    return textContent
      ? slugify(textContent, { lower: true, strict: true })
      : undefined;
  }
  return undefined;
}

export function useAutoId(children: React.ReactNode): string | undefined {
  return useMemo(() => calculateIdFromChildren(children), [children]);
}

export function useStaticAutoId(children: React.ReactNode): string | undefined {
  return useMemo(() => calculateIdFromChildren(children), []);
}
