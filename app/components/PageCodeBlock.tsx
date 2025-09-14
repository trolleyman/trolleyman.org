import { cn } from '~/utils';

export interface PageCodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageCodeBlock({
  children,
  className,
  ...props
}: PageCodeBlockProps) {
  return (
    <pre
      className={cn(
        'bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4',
        className,
      )}
      {...props}
    >
      {children}
    </pre>
  );
}
