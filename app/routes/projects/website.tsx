import PageTitle from "~/components/PageTitle";

export default function WebsiteProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">trolleyman.org</PageTitle>
        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
                Created this website to keep track of the projects I've been working on.
            </p>
        </div>
    </>
}
