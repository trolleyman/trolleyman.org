import type { DateTime } from 'luxon';
import { ArticleHeader, type Author } from './ArticleHeader';

export type ArticleProps = React.PropsWithChildren<{
  title: string | React.ReactNode;
  description?: string;
  author?: string | Author;
  date?: DateTime;
  tags?: string[];
}>;

export function Article({
  title,
  description,
  author,
  date,
  tags,
  children,
}: ArticleProps) {
  return (
    <article className="prose dark:prose-invert w-full">
      <ArticleHeader
        title={title}
        description={description}
        author={author}
        date={date}
        tags={tags}
      />
      {children}
    </article>
  );
}
