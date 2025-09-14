import type * as CSS from 'csstype';
import type { Picture } from 'imagetools-core';
import { cn } from '~/utils';

export type ImgProps = {
  src: string | Picture;
  width?: number;
  height?: number;
  alt?: string;
  rendering?: CSS.Properties['imageRendering'];
  translucent?: boolean;
  rounded?: boolean;
  className?: string;
};

export default function Img({
  src,
  width,
  height,
  alt,
  rendering,
  translucent,
  rounded = true,
  className,
}: ImgProps) {
  width ??= typeof src === 'object' ? src.img.w : undefined;
  height ??= typeof src === 'object' ? src.img.h : undefined;

  const imageElement = (
    <img
      src={typeof src === 'string' ? src : src.img.src}
      width={width}
      height={height}
      alt={alt ?? ''}
      style={{ imageRendering: rendering }}
      className={cn(
        'object-contain w-auto',
        !translucent && rounded && 'rounded-lg',
        translucent ? 'drop-shadow-xl' : 'shadow-lg',
        className,
      )}
    />
  );

  return typeof src === 'string' ? (
    imageElement
  ) : (
    <picture>
      {Object.entries(src.sources).map(([format, srcset]) => (
        <source key={format} srcSet={srcset} type={`image/${format}`} />
      ))}
      {imageElement}
    </picture>
  );
}
