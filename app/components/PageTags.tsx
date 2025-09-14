import { cn } from '~/utils';

export interface PageTagsProps {
  tags: string[];
  className?: string;
}

export default function PageTags({ tags, className }: PageTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
