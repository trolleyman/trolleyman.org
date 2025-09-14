import { cn } from '~/utils';

export interface PageListItemProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageListItem({
  children,
  className,
}: PageListItemProps) {
  return (
    <li className={cn('text-gray-700 dark:text-gray-300', className)}>
      {children}
    </li>
  );
}
