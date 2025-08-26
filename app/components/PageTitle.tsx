import { cn } from "~/utils";

export default function PageTitle({ className, children }: React.PropsWithChildren<{ className?: string }>) {
    return <>
        {/* Header */}
        <h1 className={cn("text-center text-5xl font-bold text-gray-900 dark:text-white font-serif", className)}>
            {children}
        </h1>
        <hr className="text-gray-500 w-full m-4" />
    </>
}