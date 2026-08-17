import { cn } from '~/utils';

import type { TagCount } from '../store';
import { hintClasses } from '../styles';

export interface TagFilterProps {
  tags: TagCount[];
  selected: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({
  tags,
  selected,
  onToggle,
  onClear,
}: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(tag)}
              className={cn(
                `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
                text-xs font-medium transition-colors`,
                active
                  ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-900'
                  : `bg-blue-100 text-blue-800 hover:bg-blue-200
                    dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800`,
              )}
            >
              #{tag}
              <span className="opacity-60">{count}</span>
            </button>
          );
        })}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-gray-500 underline decoration-gray-400
              hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            clear
          </button>
        )}
      </div>
      {selected.length > 1 && (
        <p className={hintClasses}>Showing cards with all selected tags.</p>
      )}
    </div>
  );
}
