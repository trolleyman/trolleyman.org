import type * as CSS from 'csstype';
import type { Picture } from 'imagetools-core';

import { cn } from '~/utils';
import RawImg from './RawImg';

export type ImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> & {
  src: string | Picture;
  rendering?: CSS.Properties['imageRendering'];
  translucent?: boolean;
  rounded?: boolean;
};

const FORMAT_ORDER: Record<string, number | undefined> = {
  avif: 1,
  webp: 2,
  png: 3,
  jpg: 4,
  jpeg: 5,
};

export default function Img({
  rendering,
  translucent,
  rounded = true,
  className,
  ...props
}: ImgProps) {
  return (
    <RawImg
      style={{
        imageRendering: rendering,
      }}
      className={cn(
        !translucent && rounded && 'rounded-lg',
        translucent ? 'drop-shadow-xl' : 'shadow-lg',
        className,
      )}
      {...props}
    />
  );
}
