import type * as CSS from 'csstype';
import type { ProcessedImageMetadata } from 'imagetools-core';
import { cn } from '~/utils';

export type ImgProps = {
    src: string | ProcessedImageMetadata | ProcessedImageMetadata[]
    width?: number
    height?: number
    alt?: string
    rendering?: CSS.Properties['imageRendering']
    translucent?: boolean
    rounded?: boolean
    className?: string
}

function processArgs(src: string | ProcessedImageMetadata | ProcessedImageMetadata[]): { src: string, width?: number, height?: number } {
    if (typeof src === "string") {
        return { src }
    }

    const [mainImage, ...restImages] = src instanceof Array ? src : [src]
    return 12 as any // TODO
}

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

    return (
        <img
            src={src}
            width={width}
            height={height}
            alt={alt ?? ''}
            style={{ imageRendering: rendering }}
            className={cn(
                "object-contain",
                !translucent && rounded && "rounded-lg",
                translucent ? "drop-shadow-xl" : "shadow-lg",
                className,
            )}
        />
    );
}
