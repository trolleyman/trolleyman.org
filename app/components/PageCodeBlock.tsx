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
        'my-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800',
        className,
      )}
      {...props}
    >
      {children}
    </pre>
  );
}
