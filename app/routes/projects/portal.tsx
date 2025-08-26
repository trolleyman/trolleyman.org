import PageTitle from "~/components/PageTitle";

export default function PortalProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Portal 2</PageTitle>
        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
                A redo of my first Portal project, attempting to replicate the game mechanics.
            </p>
        </div>
    </>
}
