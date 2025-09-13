import { calculateIdFromChild, cn, useStaticAutoId } from "~/utils";

export type PageHeadingProps = React.PropsWithChildren<{
    id?: string
    className?: string
}>

export default function PageHeading({ id, className, children }: PageHeadingProps) {
    const autoId = useStaticAutoId(children);
    id ??= autoId;
    return <>
        <h2 id={id} className={cn("text-xl font-semibold text-gray-900 dark:text-gray-100", className)}>
            {children}
        </h2>
    </>
}