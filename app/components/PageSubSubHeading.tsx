import { Link } from 'react-router';

import { cn, useStaticAutoId } from '~/utils';

export type PageSubHeadingProps = React.PropsWithChildren<{
  id?: string;
  className?: string;
}>;

export default function PageSubHeading({
  id,
  className,
  children,
}: PageSubHeadingProps) {
  const autoId = useStaticAutoId(children);
  id ??= autoId;
  return (
    <h4
      id={id}
      className={cn(
        'text-sm font-semibold text-gray-900 dark:text-gray-100',
        className,
      )}
    >
      <Link to={{ hash: `#${id}` }}>{children}</Link>
    </h4>
  );
}
