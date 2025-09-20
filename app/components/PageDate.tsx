import { DateTime } from 'luxon';
import { useState } from 'react';
import { cn } from '~/utils';

export interface PageDateProps {
  date: DateTime | string;
  className?: string;
}

export default function PageDate({ date, className }: PageDateProps) {
  const [showAbsolute, setShowAbsolute] = useState(false);

  // Ensure date is a Luxon DateTime object
  const luxonDate = DateTime.isDateTime(date)
    ? date
    : DateTime.fromISO(date as any);

  if (!luxonDate.isValid) {
    console.error('Invalid date passed to PageDate:', date);
    return <span className={className}>Invalid date</span>;
  }

  const relativeTime = luxonDate.toRelative();
  const absoluteTime = luxonDate.toFormat("MMMM d, yyyy 'at' h:mm a ZZZZ");

  return (
    <time
      dateTime={luxonDate.toISO() || undefined}
      className={cn(
        'cursor-help text-sm text-gray-600 transition-colors dark:text-gray-400',
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
