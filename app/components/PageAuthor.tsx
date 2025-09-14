import { cn } from '~/utils';

export interface PageAuthorProps {
  author: string;
  className?: string;
}

export default function PageAuthor({ author, className }: PageAuthorProps) {
  return (
    <span className={cn('text-sm text-gray-600 dark:text-gray-400', className)}>
      by {author}
    </span>
  );
}
