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
        'font-code text-sm',
        language ? `language-${language}` : '',
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
