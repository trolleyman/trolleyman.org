import PageTitle from "~/components/PageTitle";

export default function FlappyProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Flappy Clone</PageTitle>
        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
                Yet another Flappy Bird clone.
            </p>
        </div>
    </>
}
