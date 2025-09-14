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

const FORMAT_ORDER: Record<string, number | undefined> = {
  avif: 1,
  webp: 2,
  png: 3,
  jpg: 4,
  jpeg: 5,
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

  const style: CSS.Properties = {
    imageRendering: rendering,
  };
  if (width && height) {
    style.aspectRatio = `${width} / ${height}`;
  }

  const imageElement = (
    <img
      src={typeof src === 'string' ? src : src.img.src}
      width={width}
      height={height}
      alt={alt ?? ''}
      style={style}
      className={cn(
        'w-auto h-auto',
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
      {Object.entries(src.sources)
        .sort(([a], [b]) => (FORMAT_ORDER[a] || 999) - (FORMAT_ORDER[b] || 999))
        .map(([format, srcset]) => (
          <source key={format} srcSet={srcset} type={`image/${format}`} />
        ))}{' '}
      {imageElement}
    </picture>
  );
}
