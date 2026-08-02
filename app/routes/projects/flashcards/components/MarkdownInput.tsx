import { useMemo, type RefObject } from 'react';

import { cn } from '~/utils';

import { TOKEN_CLASSES, tokenize } from '../highlight';

/**
 * Styling that the highlighted layer and the textarea must share exactly. Any
 * difference in font, size, spacing, padding or wrapping moves one layer
 * relative to the other and the caret stops lining up with the text.
 *
 * `text-base` rather than `text-sm` is deliberate: iOS zooms the page when a
 * focused field is under 16px, which on a phone is worse than slightly large
 * text.
 *
 * `font-synthesis-weight: none` is what makes bold highlighting safe. Fira Code
 * is duplexed, so its real bold face is the same width as its regular and
 * bolding shifts nothing. If it has not loaded and the stack falls back to a
 * system monospace that has no bold face, this stops the browser faking one,
 * since a synthesised bold is smeared wider than the original and would drag
 * the highlighted layer out of step with the textarea. Losing the bold in that
 * case is a much better failure than losing the alignment.
 */
const SHARED = `m-0 w-full px-3 py-2 font-code text-base leading-6
  break-words whitespace-pre-wrap [font-synthesis-weight:none]`;

export interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  ariaLabel: string;
  /** Minimum height, in lines. */
  rows?: number;
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}

/**
 * A textarea with markdown syntax highlighting that does not change the layout
 * of what you type.
 *
 * It works by painting a highlighted copy of the text in a `pre` and laying a
 * transparent textarea over the top, so the real text is still an ordinary
 * editable textarea with native caret, selection, undo, spellcheck and mobile
 * keyboard behaviour. The `pre` is the element in normal flow, so it drives the
 * height of the box and the textarea stretches to match, which means neither
 * layer ever needs to scroll independently.
 *
 * Bold and italic are applied as well as colour, which is only possible because
 * the editor is set in a duplexed font. See TOKEN_CLASSES in highlight.ts.
 */
export default function MarkdownInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  ariaLabel,
  rows = 3,
  autoFocus,
  inputRef,
}: MarkdownInputProps) {
  const tokens = useMemo(() => tokenize(value), [value]);

  return (
    <div
      className="relative rounded-md border border-gray-300 bg-white
        focus-within:border-blue-500 focus-within:ring-1
        focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
    >
      <pre
        aria-hidden
        className={cn(SHARED, 'text-gray-900 dark:text-gray-100')}
        style={{ minHeight: `calc(${rows} * 1.5rem + 1rem)` }}
      >
        {value.length === 0 && placeholder ? (
          <span className="text-gray-400 dark:text-gray-500">
            {placeholder}
          </span>
        ) : (
          tokens.map((token, index) => (
            <span key={index} className={TOKEN_CLASSES[token.kind]}>
              {token.text}
            </span>
          ))
        )}
        {/*
          A `pre` swallows one trailing newline, so put it back. Without this,
          pressing enter on the last line does not grow the box and the caret
          sits outside the highlighted layer.
        */}
        {value.endsWith('\n') ? '\n' : ''}
      </pre>

      <textarea
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        spellCheck
        className={cn(
          SHARED,
          `absolute inset-0 h-full resize-none overflow-hidden border-0
          bg-transparent text-transparent caret-gray-900 outline-none
          dark:caret-gray-100`,
        )}
      />
    </div>
  );
}
