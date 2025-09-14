import BodyLink from './BodyLink';

export interface MarkdownLinkProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export default function MarkdownLink({
  href,
  children,
  className,
}: MarkdownLinkProps) {
  if (!href) {
    return <span className={className}>{children}</span>;
  }

  const isExternal = href.startsWith('http://') || href.startsWith('https://');

  return (
    <BodyLink to={href} external={isExternal} className={className}>
      {children}
    </BodyLink>
  );
}
