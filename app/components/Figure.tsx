import Img, { type ImgProps } from './Img';

export type FigureProps = {
    caption?: string | React.ReactNode
    className?: string
    imgClassName?: string
} & ImgProps

export default function Figure({
    src,
    alt,
    rendering,
    translucent,
    rounded,
    caption,
    className,
    imgClassName,
}: FigureProps) {
    return (
        <figure className={className}>
            <Img
                src={src}
                alt={alt}
                rendering={rendering}
                translucent={translucent}
                rounded={rounded}
                className={imgClassName}
            />
            {caption && (
                <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}
