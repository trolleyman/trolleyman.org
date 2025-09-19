import type { Picture } from 'imagetools-core';

import { cn } from '~/utils';

export type RawImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> & {
  src: string | Picture;
};

const FORMAT_ORDER: Record<string, number | undefined> = {
  avif: 1,
  webp: 2,
  png: 3,
  jpg: 4,
  jpeg: 5,
};

export default function RawImg({
  src,
  width,
  height,
  style,
  className,
  ...props
}: RawImgProps) {
  width ??= typeof src === 'object' ? src.img.w : undefined;
  height ??= typeof src === 'object' ? src.img.h : undefined;
  style ??= {};
  if (width && height && !style.aspectRatio) {
    style.aspectRatio = `${width} / ${height}`;
  }

  const imageElement = (
    <img
      src={typeof src === 'string' ? src : src.img.src}
      width={width}
      height={height}
      style={style}
      className={cn('w-auto h-auto', className)}
      {...props}
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
