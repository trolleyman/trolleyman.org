import PageTitle from "~/components/PageTitle";
import FancyLinks from "~/components/FancyLinks";
import { cn } from "~/utils";
import { CONTENT_WIDTH_CLASSES } from "..";

export default function KMeansProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">k-means</PageTitle>

        <div className={cn("space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed", CONTENT_WIDTH_CLASSES)}>
            <p>
                Using the k-means algorithm to create pretty pictures. This project implements the classic k-means clustering algorithm in Rust, applying it to image processing and data visualization tasks.
            </p>

            <p>
                The k-means algorithm groups data points into clusters by iteratively assigning points to the nearest cluster center and then recalculating the center based on the assigned points. When applied to images, this can create interesting artistic effects by reducing the color palette while maintaining the overall structure and composition.
            </p>

            <p>
                The implementation focuses on performance and efficiency, taking advantage of Rust's memory safety and zero-cost abstractions. The algorithm can process various image formats and output both the clustered image and statistical information about the clustering process.
            </p>

            <FancyLinks className="text-left" links={[
                { text: "GitHub", to: "https://github.com/trolleyman/kmeans", external: true },
            ]} />
        </div>
    </>
}
