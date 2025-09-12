import PageTitle from "~/components/PageTitle";
import FancyLinks from "~/components/FancyLinks";
import Img from "~/components/Img";

import { cn } from "~/utils";
import { CONTENT_WIDTH_CLASSES } from "..";

import screenshot from './screenshot.png'

export default function WebsiteProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">trolleyman.org</PageTitle>

        <div className={cn("space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed", CONTENT_WIDTH_CLASSES)}>
            <Img
                src={screenshot}
                alt="Website screenshot"
                className="mb-6 mt-4 w-full"
            />

            <p>
                Created a website to keep track of the projects I've been working on. Built with Rust and Rocket. Caddy used for HTTPS and serving static files. Used a HTML5 UP template for the index page.
            </p>

            <FancyLinks className="text-left" links={[
                { text: "GitHub", to: "https://github.com/trolleyman/trolleyman.org", external: true },
            ]} />
        </div>
    </>
}
