import type * as CSS from 'csstype';
import { cn } from '~/utils';

export type ImgProps = {
    src: string
    alt?: string
    rendering?: CSS.Properties['imageRendering']
    translucent?: boolean
    rounded?: boolean
    className?: string
}

export default function Img({
    src,
    alt,
    rendering,
    translucent,
    rounded = true,
    className,
}: ImgProps) {
    return (
        <img
            src={src}
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
