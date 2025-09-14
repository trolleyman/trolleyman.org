import { type To } from 'react-router';

import FancyLink from '~/components/FancyLink';
import { cn } from '~/utils';

export type FancyLinksArray = { text: string; to: To; external?: boolean }[];
export type FancyLinksProps = { links?: FancyLinksArray; className?: string };

export default function FancyLinks({ links, className }: FancyLinksProps) {
  return (
    links && (
      <div className={cn('-m-1', className)}>
        {links.map((link, index) => (
          <FancyLink key={index} to={link.to} external={link.external}>
            {link.text}
          </FancyLink>
        ))}
      </div>
    )
  );
}
