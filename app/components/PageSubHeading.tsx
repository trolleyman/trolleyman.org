import { cn, useStaticAutoId } from "~/utils";

export type PageSubHeadingProps = React.PropsWithChildren<{
    id?: string
    className?: string
}>

export default function PageSubHeading({ id, className, children }: PageSubHeadingProps) {
    const autoId = useStaticAutoId(children);
    id ??= autoId;
    return <>
        <h3 id={id} className={cn("text-md font-semibold text-gray-900 dark:text-gray-100", className)}>
            {children}
        </h3>
    </>
}