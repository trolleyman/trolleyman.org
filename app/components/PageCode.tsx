import { cn } from '~/utils';

export interface PageCodeProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageCode({
  children,
  className,
  ...props
}: PageCodeProps) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  return (
    <code
      className={cn(
        'text-sm font-code',
        language ? `language-${language}` : '',
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
