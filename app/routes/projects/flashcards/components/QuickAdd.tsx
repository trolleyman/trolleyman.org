import { useRef, useState } from 'react';

import { cn } from '~/utils';

import { parseQuickAdd } from '../store';
import { buttonPrimary, hintClasses, inputClasses } from '../styles';

export interface QuickAddProps {
  onAdd: (front: string, back: string, tags: string[]) => void;
  /** Tags currently selected in the filter, applied to anything added here. */
  impliedTags: string[];
}

/**
 * One line card entry: type, press enter, keep typing. The input holds focus
 * after each add so a run of cards can go in without touching the mouse.
 */
export default function QuickAdd({ onAdd, impliedTags }: QuickAddProps) {
  const [value, setValue] = useState('');
  const [justAdded, setJustAdded] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = parseQuickAdd(value);
  const tags = parsed
    ? [...new Set([...impliedTags, ...parsed.tags])].sort()
    : [];

  function submit() {
    if (!parsed) return;
    onAdd(parsed.front, parsed.back, tags);
    setValue('');
    setJustAdded((count) => count + 1);
    inputRef.current?.focus();
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
            if (event.key === 'Escape') setValue('');
          }}
          placeholder="capital of France :: Paris #geography"
          aria-label="Quick add a card"
          className={cn(inputClasses, 'font-code text-sm')}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!parsed}
          className={cn(buttonPrimary, 'shrink-0')}
        >
          Add
        </button>
      </div>

      {parsed ? (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs">
          <span className="text-gray-500 dark:text-gray-400">front</span>
          <span className="text-gray-900 dark:text-gray-100">
            {parsed.front}
          </span>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="text-gray-500 dark:text-gray-400">back</span>
          <span className="text-gray-900 dark:text-gray-100">
            {parsed.back}
          </span>
          {tags.length > 0 && (
            <span className="text-blue-600 dark:text-blue-400">
              {tags.map((tag) => `#${tag}`).join(' ')}
            </span>
          )}
        </div>
      ) : (
        <p className={hintClasses}>
          Split the two sides with <code className="font-code">::</code> and put{' '}
          <code className="font-code">#tags</code> at the end. Markdown and{' '}
          <code className="font-code">$math$</code> both work.
          {justAdded > 0 && (
            <span className="ml-2 text-green-600 dark:text-green-400">
              {justAdded} added
            </span>
          )}
        </p>
      )}
    </div>
  );
}
