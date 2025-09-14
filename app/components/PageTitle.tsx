import { DateTime } from 'luxon';
import { cn } from '~/utils';
import PageDate from './PageDate';
import PageAuthor from './PageAuthor';
import PageTags from './PageTags';

export interface PageTitleProps {
  className?: string;
  children: React.ReactNode;
  author?: string;
  date?: DateTime | string;
  tags?: string[];
}

export default function PageTitle({
  className,
  children,
  author,
  date,
  tags,
}: PageTitleProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <h1
          className={cn(
            'text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-serif flex-1',
            className,
          )}
        >
          {children}
        </h1>

        {tags && tags.length > 0 && (
          <PageTags tags={tags} className="flex-shrink-0" />
        )}
      </div>

      <hr className="text-gray-500 w-full mb-4" />

      {(date || author) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 text-sm">
          {date && <PageDate date={date} />}
          {author && <PageAuthor author={author} />}
        </div>
      )}
    </div>
  );
}
