import { cn } from '~/utils';

export interface PageUnorderedListProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageUnorderedList({
  children,
  className,
}: PageUnorderedListProps) {
  return (
    <ul className={cn('list-disc list-inside space-y-1 my-4', className)}>
      {children}
    </ul>
  );
}
