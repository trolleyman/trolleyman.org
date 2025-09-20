import { Link, type To } from 'react-router';

export type FancyLinkProps = React.PropsWithChildren<{
  to: To;
  external?: boolean;
}>;

export default function FancyLink({ children, to, external }: FancyLinkProps) {
  return (
    <Link
      to={to}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="m-1 inline-flex items-center rounded-lg bg-blue-50 px-4 py-2
        text-sm font-medium text-blue-600 transition-colors duration-200
        hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400
        dark:hover:bg-blue-900/30"
    >
      {children}
    </Link>
  );
}
