import { cn } from '~/utils';

export interface PageOrderedListProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageOrderedList({
  children,
  className,
}: PageOrderedListProps) {
  return (
    <ol className={cn('my-4 list-inside list-decimal space-y-1', className)}>
      {children}
    </ol>
  );
}
