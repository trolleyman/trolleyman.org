import PageTitle from "~/components/PageTitle";

export default function KMeansProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">k-means</PageTitle>
        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
                Using the k-means algorithm to create pretty pictures.
            </p>
        </div>
    </>
}
