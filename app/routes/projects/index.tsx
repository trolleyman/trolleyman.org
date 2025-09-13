import PageTitle from '~/components/PageTitle';
import Img, { type ImgProps } from '~/components/Img';
import { cn } from '~/utils';
import type { FancyLinksArray } from '~/components/FancyLinks';
import FancyLinks from '~/components/FancyLinks';

import breakoutImg from './dissertation/breakout.png';
import dissertationPdfUrl from './dissertation/Dissertation.pdf'
import websiteImg from './website/screenshot.png';
import websiteRemixImg from './website-remix/screenshot.png';
import lincImg from './linc/img/logo.min.png';
import flappyImg from './flappy/img/logo.png';
import zucchiniImg from './zucchini/logo.min.gif';
import robotImg from './robot/casterbot.min.jpg';
import portalImg from './portal/screenshot.min.jpg';
import kmeansImg from './k-means/alabama-hills-ca.min.jpg';
import equatorImg from './equator/screenshot.jpg';

export const CONTENT_WIDTH_CLASSES: string = "max-w-5xl mx-auto px-4"

type ProjectProps = React.PropsWithChildren<{
    id: string
    title: string
    date: string
    image?: string | Omit<ImgProps, 'className'>
    languages?: string[]
    libraries?: string[]
    tools?: string[]
    links?: FancyLinksArray
}>

function Project({
    id,
    title,
    date,
    children,
    image,
    languages,
    libraries,
    tools,
    links
}: ProjectProps) {
    languages ??= []
    libraries ??= []
    tools ??= []
    const content = (
        <div className="w-full lg:w-3/4 space-y-4">
            <div className='space-y-1'>
                <div className="flex justify-between items-end">
                    <h2 className="order-1 group-odd/row:order-2 text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <div className="order-2 group-odd/row:order-1 text-sm text-gray-500 dark:text-gray-400">{date}</div>
                </div>
                <hr className="text-gray-500" />
            </div>

            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>

            {(languages.length > 0 || libraries.length > 0 || tools.length > 0) && (
                <div className="space-y-1">
                    {languages.length > 0 && (
                        <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">Languages:</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{languages.join(', ')}</span>
                        </div>
                    )}
                    {libraries.length > 0 && (
                        <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">Libraries:</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{libraries.join(', ')}</span>
                        </div>
                    )}
                    {tools.length > 0 && (
                        <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">Tools:</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{tools.join(', ')}</span>
                        </div>
                    )}
                </div>
            )}

            <FancyLinks links={links}></FancyLinks>
        </div>
    );

    const imageProps = typeof image === "string" ? { src: image } : image
    const imageElement = imageProps && (
        <Img
            className={cn(
                "max-w-32 max-h-32 sm:max-w-48 sm:max-h-48 md:max-w-54 md:max-h-54 self-start max-sm:group-odd/row:self-end sm:self-center",
            )}
            {...imageProps}
        />
    );

    return (
        <section id={id} className="group/row flex flex-col gap-4 sm:gap-12 items-center sm:flex-row odd:sm:flex-row-reverse odd:text-right">
            {imageElement}
            {content}
        </section>
    );
}

export default function Projects() {
    return <>
        <PageTitle>Projects</PageTitle>

        {/* Projects List */}
        <div className={cn("flex flex-col gap-12 mt-6", CONTENT_WIDTH_CLASSES)}>
            <Project
                id="proj_website_remix"
                title="trolleyman.org (Remix)"
                date="2025"
                image={{ src: websiteRemixImg, alt: "Website screenshot" }}
                languages={["TypeScript", "CSS", "HTML"]}
                libraries={["React Router", "Vite", "Tailwind CSS"]}
                tools={["Vercel"]}
                links={[
                    { text: "GitHub", to: "https://github.com/trolleyman/trolleyman.org-remix", external: true },
                    { text: "Details", to: "/projects/website-remix" }
                ]}
            >
                Rewrite of the original website using React Router v7 (formerly Remix).
            </Project>

            <Project
                id="proj_dissertation"
                title="Dissertation"
                date="2018-19"
                image={{ src: breakoutImg, alt: "Breakout game screenshot", rendering: 'pixelated', rounded: false }}
                languages={["Python"]}
                libraries={["TensorFlow", "PyTorch"]}
                links={[
                    { text: "Paper", to: dissertationPdfUrl, external: true },
                    { text: "Details", to: "/projects/dissertation" }
                ]}
            >
                Final year project exploring Google DeepMind's research into developing general AI for Atari 2600 games using deep learning. Achieved a 1st class mark for this project.
            </Project>

            <Project
                id="proj_website"
                title="trolleyman.org"
                date="2018"
                image={{ src: websiteImg, alt: "Website screenshot" }}
                languages={["Rust", "WASM", "JavaScript", "CSS", "SQL"]}
                libraries={["Rocket"]}
                links={[
                    { text: "GitHub", to: "https://github.com/trolleyman/trolleyman.org", external: true },
                    { text: "Details", to: "/projects/website" }
                ]}
            >
                Created a website to keep track of the projects I've been working on. This was my first website, built with Rust and Rocket.
            </Project>

            <Project
                id="proj_linc"
                title="LINC"
                date="Jun. 2017"
                image={{ src: lincImg, alt: "LINC logo", translucent: true }}
                languages={["HTML", "JavaScript", "CSS", "SQL", "Python"]}
                libraries={["Three.js", "D3.js", "Django"]}
                links={[
                    { text: "Website", to: "/projects/linc/mainpage" },
                    { text: "Demo", to: "/projects/linc/demo" },
                    { text: "Details", to: "/projects/linc" }
                ]}
            >
                A versatile social network visualization tool, developed with Millennium Point.
            </Project>

            <Project
                id="proj_flappy"
                title="Flappy Clone"
                date="Dec. 2016 - Jul. 2017"
                image={{ src: flappyImg, alt: "Flappy game logo", rendering: 'pixelated', translucent: true }}
                languages={["HTML", "JavaScript", "CSS", "SQL", "Python"]}
                libraries={["HTML5 Canvas API", "Django"]}
                links={[
                    { text: "Demo", to: "/projects/flappy/demo" },
                    { text: "Details", to: "/projects/flappy" }
                ]}
            >
                Yet another Flappy Bird clone.
            </Project>

            <Project
                id="proj_zucchini"
                title="Zucchini"
                date="Jul. 2017"
                image={{ src: zucchiniImg, alt: "Zucchini game logo", rendering: 'crisp-edges', translucent: true }}
                languages={["Java"]}
                libraries={["LWJGL", "OpenGL", "OpenAL"]}
                links={[
                    { text: "GitHub", to: "https://github.com/trolleyman/Zucchini", external: true },
                    { text: "Details", to: "/projects/zucchini" }
                ]}
            >
                Atmospheric fast-paced top down shooter. Developed with 5 other students.
            </Project>

            <Project
                id="robot"
                title="Robot Warehouse"
                date="Apr. 2016"
                image={{ src: robotImg, alt: "Robot warehouse system" }}
                languages={["Java"]}
                libraries={["LeJOS", "Swing"]}
                links={[
                    { text: "GitHub", to: "https://github.com/trolleyman/rp-warehouse", external: true },
                    { text: "Details", to: "/projects/robot" }
                ]}
            >
                Robot warehouse management system. Developed with 9 other students.
            </Project>

            <Project
                id="portal"
                title="Portal 2"
                date="Nov. 2016"
                image={{ src: portalImg, alt: "Portal 2 game screenshot" }}
                languages={["Rust"]}
                libraries={["OpenGL"]}
                links={[
                    { text: "GitHub", to: "https://github.com/trolleyman/Portal2", external: true },
                    { text: "Details", to: "/projects/portal" }
                ]}
            >A redo of my first Portal project, a shameless attempt to copy my favourite video game at the time, Portal. Guess that makes this a redo of a r
                edo.
            </Project>

            <Project
                id="k-means"
                title="k-means"
                date="Sep. 2016"
                image={{ src: kmeansImg, alt: "K-means clustering visualization" }}
                languages={["Rust"]}
                links={[
                    { text: "GitHub", to: "https://github.com/trolleyman/kmeans", external: true },
                    { text: "Details", to: "/projects/k-means" }
                ]}
            >
                Using the k-means algorithm to create pretty pictures.
            </Project>

            <Project
                id="equator"
                title="Equator"
                date="Dec. 2016"
                image={{ src: equatorImg, alt: "Equator expression editor", rounded: false }}
                languages={["Rust"]}
                libraries={["GTK+"]}
                links={[
                    { text: "GitHub", to: "https://github.com/trolleyman/Equator", external: true }
                ]}
            >
                An expression editor and evaluator that allows easy visualization and processing of mathematical expressions.
            </Project>
        </div>
    </>;
}