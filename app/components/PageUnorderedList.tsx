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
    <ul className={cn('my-4 list-inside list-disc space-y-1', className)}>
      {children}
    </ul>
  );
}
