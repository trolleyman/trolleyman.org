import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

import { cn } from '~/utils';

import { highlight } from '~/syntax';

import { TOKEN_CLASSES, splitCodeBlock, tokenize } from '../highlight';

/**
 * Styling that the highlighted layer and the textarea must share exactly. Any
 * difference in font, size, spacing, padding or wrapping moves one layer
 * relative to the other and the caret stops lining up with the text.
 *
 * `text-base` rather than `text-sm` is deliberate: iOS zooms the page when a
 * focused field is under 16px, which on a phone is worse than slightly large
 * text.
 *
 * `font-writer` is iA Writer Quattro: proportional, so a card does not read
 * like source code, but duplexed, so its bold is exactly as wide as its
 * regular. See the note in app.css for why only its upright faces are loaded.
 *
 * `font-synthesis-weight: none` covers the case where Quattro has not loaded.
 * If the fallback family has no bold face, this stops the browser faking one,
 * since a synthesised bold is smeared wider than the original and would drag
 * the highlighted layer out of step with the textarea. Losing the bold is a
 * much better failure than losing the alignment. Style synthesis stays on,
 * because a synthesised oblique is a shear and leaves widths untouched, which
 * is exactly how italic is drawn here.
 */
const SHARED = `m-0 w-full px-3 py-2 font-writer text-base leading-6
  break-words whitespace-pre-wrap [font-synthesis-weight:none]`;

interface BlockRect {
  top: number;
  height: number;
}

function sameRects(a: BlockRect[], b: BlockRect[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (rect, index) =>
        Math.abs(rect.top - b[index].top) < 0.5 &&
        Math.abs(rect.height - b[index].height) < 0.5,
    )
  );
}

/**
 * Finds where each fenced code block sits within the field, so a full width
 * rectangle can be painted behind it.
 *
 * Measuring is the only way to get a solid block here. A background on the text
 * itself stops at the end of each line, which leaves the block ragged down its
 * right hand side and puts a hole through any blank line, since a blank line's
 * inline fragment is zero characters wide. Taking the union of the token's line
 * rectangles instead gives one clean rectangle covering the whole fence.
 */
function useCodeBlockRects(
  containerRef: RefObject<HTMLDivElement | null>,
  preRef: RefObject<HTMLPreElement | null>,
  value: string,
): BlockRect[] {
  const [rects, setRects] = useState<BlockRect[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;

    function measure() {
      // `top` on an absolutely positioned child is measured from the padding
      // box of its containing block, not the border box that
      // getBoundingClientRect reports, so the border has to come off or every
      // rectangle sits a pixel low.
      const base =
        container!.getBoundingClientRect().top + container!.clientTop;
      const next: BlockRect[] = [];
      for (const element of pre!.querySelectorAll('[data-code-block]')) {
        const lines = [...element.getClientRects()];
        if (lines.length === 0) continue;
        const top = Math.min(...lines.map((line) => line.top)) - base;
        const bottom = Math.max(...lines.map((line) => line.bottom)) - base;
        next.push({ top, height: bottom - top });
      }
      // Bail out when nothing moved, or this would loop forever.
      setRects((current) => (sameRects(current, next) ? current : next));
    }

    measure();

    // The field rewraps when it is resized, and again when the webfont finally
    // arrives and the metrics change under it.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [containerRef, preRef, value]);

  return rects;
}

/**
 * A fenced block, with its body coloured for whatever language the fence
 * declared. There is no auto detection: an unknown language, or none at all,
 * leaves the body as plain code text rather than guessing at it.
 *
 * highlight.js output is injected as HTML because it is the only way to get its
 * tokens, but that is safe for alignment: it escapes rather than rewrites, so
 * the rendered text is character for character what was typed. The classes it
 * emits are restyled under `.editor-hljs` in app.css to colour only, since the
 * stock theme also sets padding and a background.
 */
function CodeBlockToken({ text }: { text: string }) {
  const { open, body, close, language } = splitCodeBlock(text);
  const highlighted = useMemo(
    () => highlight(body, language),
    [body, language],
  );
  const fence = TOKEN_CLASSES.codeBlock;

  return (
    <span data-code-block="">
      <span className={fence}>{open}</span>
      {highlighted === null ? (
        <span className={fence}>{body}</span>
      ) : (
        <span
          className={cn(fence, 'editor-hljs')}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      )}
      <span className={fence}>{close}</span>
    </span>
  );
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const blocks = useCodeBlockRects(containerRef, preRef, value);

  return (
    // overflow-hidden keeps the code block rectangles inside the rounded
    // corners. It does not clip the focus ring, which is this element's own
    // shadow rather than a child's.
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-md border border-gray-300
        bg-white focus-within:border-blue-500 focus-within:ring-1
        focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
    >
      {blocks.map((block, index) => (
        <div
          key={index}
          aria-hidden
          className="editor-code-block pointer-events-none absolute inset-x-0"
          style={{ top: block.top, height: block.height }}
        />
      ))}

      <pre
        ref={preRef}
        aria-hidden
        className={cn(SHARED, 'relative text-gray-900 dark:text-gray-100')}
        style={{ minHeight: `calc(${rows} * 1.5rem + 1rem)` }}
      >
        {value.length === 0 && placeholder ? (
          <span className="text-gray-400 dark:text-gray-500">
            {placeholder}
          </span>
        ) : (
          tokens.map((token, index) =>
            token.kind === 'codeBlock' ? (
              <CodeBlockToken key={index} text={token.text} />
            ) : (
              <span key={index} className={TOKEN_CLASSES[token.kind]}>
                {token.text}
              </span>
            ),
          )
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
