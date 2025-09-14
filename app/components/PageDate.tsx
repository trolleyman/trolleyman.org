import { DateTime } from 'luxon';
import { useState } from 'react';
import { cn } from '~/utils';

export interface PageDateProps {
  date: DateTime;
  className?: string;
}

export default function PageDate({ date, className }: PageDateProps) {
  const [showAbsolute, setShowAbsolute] = useState(false);

  const relativeTime = date.toRelative();
  const absoluteTime = date.toFormat("MMMM d, yyyy 'at' h:mm a ZZZZ");

  return (
    <time
      dateTime={date.toISO() || undefined}
      className={cn(
        'text-sm text-gray-600 dark:text-gray-400 cursor-help transition-colors',
        'hover:text-gray-800 dark:hover:text-gray-200',
        className,
      )}
      onMouseEnter={() => setShowAbsolute(true)}
      onMouseLeave={() => setShowAbsolute(false)}
      title={absoluteTime}
    >
      {showAbsolute ? absoluteTime : relativeTime}
    </time>
  );
}
