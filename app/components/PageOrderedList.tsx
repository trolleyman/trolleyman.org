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
    <ol className={cn('list-decimal list-inside space-y-1 my-4', className)}>
      {children}
    </ol>
  );
}
