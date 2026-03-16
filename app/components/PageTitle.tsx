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
    <div className="mx-auto max-w-4xl">
      <div
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start
          sm:justify-between"
      >
        <h1
          className={cn(
            `flex-1 font-serif text-3xl font-bold text-gray-900 md:text-4xl
            dark:text-white`,
            className,
          )}
        >
          {children}
        </h1>

        {tags && tags.length > 0 && (
          <PageTags tags={tags} className="flex-shrink-0" />
        )}
      </div>

      <hr className="mb-6 w-full text-gray-500" />

      {(date || author) && (
        <div
          className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center
            sm:justify-end"
        >
          {date && <PageDate date={date} />}
          {author && <PageAuthor author={author} />}
        </div>
      )}
    </div>
  );
}
