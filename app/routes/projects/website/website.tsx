import PageTitle from "~/components/PageTitle";
import FancyLinks from "~/components/FancyLinks";
import { cn } from "~/utils";
import { CONTENT_WIDTH_CLASSES } from "..";

export default function WebsiteProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">trolleyman.org</PageTitle>

        <div className={cn("space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed", CONTENT_WIDTH_CLASSES)}>
            <p>
                Created this website to keep track of the projects I've been working on. Built with modern web technologies including React Router, Tailwind CSS, and TypeScript for a responsive and maintainable codebase.
            </p>

            <p>
                The site features a clean, minimalist design with dark/light theme support and smooth navigation between different project showcases. Each project page includes detailed descriptions, technology stacks, and relevant links to demos or source code.
            </p>

            <p>
                This project demonstrates my ability to build modern web applications with current best practices, responsive design principles, and a focus on user experience and accessibility.
            </p>

            <FancyLinks className="text-left" links={[
                { text: "GitHub", to: "https://github.com/trolleyman/trolleyman.org", external: true },
            ]} />
        </div>
    </>
}
