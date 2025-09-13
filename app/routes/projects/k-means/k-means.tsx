import PageTitle from "~/components/PageTitle";
import FancyLinks from "~/components/FancyLinks";
import { cn } from "~/utils";
import { CONTENT_WIDTH_CLASSES } from "..";
import Figure from "~/components/Figure";

import alabamaOriginal from './repo/examples/alabama-hills-ca/alabama-hills-ca.png';
import alabamaK2 from './repo/examples/alabama-hills-ca/alabama-hills-ca-2.png';
import exampleData from './repo/matlab/kmeans_example_data.png';
import exampleClusters1 from './repo/matlab/kmeans_example_clusters_1.png';

import yellowstoneBefore from './repo/examples/yellowstone/yellowstone.jpg';
import yellowstoneK2 from './repo/examples/yellowstone/yellowstone-2.jpg';
import yellowstoneK4 from './repo/examples/yellowstone/yellowstone-4.jpg';
import yellowstoneK16 from './repo/examples/yellowstone/yellowstone-16.jpg';

import blueMountainsBefore from './repo/examples/blue mountains 1/blue mountains 1.png';
import blueMountainsK3 from './repo/examples/blue mountains 1/blue mountains 1-3.png';
import blueMountainsK5 from './repo/examples/blue mountains 1/blue mountains 1-5.png';
import blueMountainsK8 from './repo/examples/blue mountains 1/blue mountains 1-8.png';

import blueMountains2Before from './repo/examples/blue mountains 2/blue mountains 2.png';
import blueMountains2K2 from './repo/examples/blue mountains 2/blue mountains 2-2.png';
import blueMountains2K3 from './repo/examples/blue mountains 2/blue mountains 2-3.png';
import blueMountains2K7 from './repo/examples/blue mountains 2/blue mountains 2-7.png';

import blueMountains3Before from './repo/examples/blue mountains 3/blue mountains 3.png';
import blueMountains3K2 from './repo/examples/blue mountains 3/blue mountains 3-2.png';
import blueMountains3K6 from './repo/examples/blue mountains 3/blue mountains 3-6.png';
import blueMountains3K8 from './repo/examples/blue mountains 3/blue mountains 3-8.png';

import fjadrargljufurBefore from './repo/examples/fjadrargljufur/fjadrargljufur.jpg';
import fjadrargljufurK2 from './repo/examples/fjadrargljufur/fjadrargljufur-2.jpg';
import fjadrargljufurK3 from './repo/examples/fjadrargljufur/fjadrargljufur-3.jpg';
import fjadrargljufurK12 from './repo/examples/fjadrargljufur/fjadrargljufur-12.jpg';

import papercourtBefore from './repo/examples/papercourt/IMG_4700.jpg';
import papercourtK2 from './repo/examples/papercourt/IMG_4700-2.jpg';
import papercourtK5 from './repo/examples/papercourt/IMG_4700-5.jpg';
import papercourtK8 from './repo/examples/papercourt/IMG_4700-8.jpg';

import PageHeading from "~/components/PageHeading";
import PageSubHeading from "~/components/PageSubHeading";

export function K() {
    return <i>k</i>
}

export function KEq(props: { k: number }) {
    return <><K />={props.k}</>
}

export function KMeans() {
    return <><K />-means</>
}

export default function KMeansProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl"><KMeans /></PageTitle>

        <div className={cn("space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed", CONTENT_WIDTH_CLASSES)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Figure src={alabamaOriginal} alt="Alabama Hills, CA original" caption="Before" />
                <Figure src={alabamaK2} alt="Alabama Hills, CA clustered with k=2" caption={<>After (<KEq k={2} />)</>} />
            </div>

            <p>
                This project explores the k-means clustering algorithm by compressing an image’s colours into <K /> representative clusters. Each pixel is assigned to its nearest cluster centre and the image is reconstructed using only those <K /> colours, producing painterly posterisation effects.
            </p>

            <PageHeading>How <KMeans /> works</PageHeading>
            <div>
                <p>
                    The algorithm first picks <K /> random centroids from the data (here, pixel colours), and then iterates over two simple steps until convergence:
                </p>
                <ul className="list-disc pt-2 pl-6 space-y-1">
                    <li><b>Assignment</b>: assign each point to the nearest centroid.</li>
                    <li><b>Update</b>: recompute each centroid as the mean of its assigned points.</li>
                </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Figure src={exampleData} alt="Example 2D data for k-means" caption="Example 2D dataset." />
                <Figure src={exampleClusters1} alt="Initial random centroids" caption={<>Initial random centroids for <KEq k={2} />.</>} />
            </div>

            <PageHeading>Results</PageHeading>
            <PageSubHeading>Yellowstone</PageSubHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Figure src={yellowstoneBefore} alt="Yellowstone original" caption="Before" />
                <Figure src={yellowstoneK2} alt="Yellowstone clustered with k=2" caption={<>After (<KEq k={2} />)</>} />
                <Figure src={yellowstoneK4} alt="Yellowstone clustered with k=4" caption={<>After (<KEq k={4} />)</>} />
                <Figure src={yellowstoneK16} alt="Yellowstone clustered with k=16" caption={<>After (<KEq k={16} />)</>} />
            </div>

            <PageSubHeading>Blue Mountains #1</PageSubHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Figure src={blueMountainsBefore} alt="Blue Mountains original" caption="Before" />
                <Figure src={blueMountainsK3} alt="Blue Mountains clustered with k=2" caption={<>After (<KEq k={3} />)</>} />
                <Figure src={blueMountainsK5} alt="Blue Mountains clustered with k=4" caption={<>After (<KEq k={5} />)</>} />
                <Figure src={blueMountainsK8} alt="Blue Mountains clustered with k=16" caption={<>After (<KEq k={8} />)</>} />
            </div>

            <PageSubHeading>Blue Mountains #2</PageSubHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Figure src={blueMountains2Before} alt="Blue Mountains 2 original" caption="Before" />
                <Figure src={blueMountains2K2} alt="Blue Mountains 2 clustered with k=2" caption={<>After (<KEq k={2} />)</>} />
                <Figure src={blueMountains2K3} alt="Blue Mountains 2 clustered with k=3" caption={<>After (<KEq k={3} />)</>} />
                <Figure src={blueMountains2K7} alt="Blue Mountains 2 clustered with k=7" caption={<>After (<KEq k={7} />)</>} />
            </div>

            <PageSubHeading>Blue Mountains #3</PageSubHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Figure src={blueMountains3Before} alt="Blue Mountains 3 original" caption="Before" />
                <Figure src={blueMountains3K2} alt="Blue Mountains 3 clustered with k=2" caption={<>After (<KEq k={2} />)</>} />
                <Figure src={blueMountains3K6} alt="Blue Mountains 3 clustered with k=6" caption={<>After (<KEq k={6} />)</>} />
                <Figure src={blueMountains3K8} alt="Blue Mountains 3 clustered with k=8" caption={<>After (<KEq k={8} />)</>} />
            </div>

            <PageSubHeading>Fjadrargljufur</PageSubHeading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Figure src={fjadrargljufurBefore} alt="Fjadrargljufur original" caption="Before" />
                <Figure src={fjadrargljufurK2} alt="Fjadrargljufur clustered with k=2" caption={<>After (<KEq k={2} />)</>} />
                <Figure src={fjadrargljufurK3} alt="Fjadrargljufur clustered with k=3" caption={<>After (<KEq k={3} />)</>} />
                <Figure src={fjadrargljufurK12} alt="Fjadrargljufur clustered with k=12" caption={<>After (<KEq k={12} />)</>} />
            </div>

            <PageSubHeading>Papercourt</PageSubHeading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Figure src={papercourtBefore} alt="Papercourt original" caption="Before" />
                <Figure src={papercourtK2} alt="Papercourt clustered with k=2" caption={<>After (<KEq k={2} />)</>} />
                <Figure src={papercourtK5} alt="Papercourt clustered with k=5" caption={<>After (<KEq k={5} />)</>} />
                <Figure src={papercourtK8} alt="Papercourt clustered with k=8" caption={<>After (<KEq k={8} />)</>} />
            </div>

            <FancyLinks className="text-right" links={[
                { text: "GitHub", to: "https://github.com/trolleyman/kmeans", external: true },
            ]} />
        </div>
    </>
}
