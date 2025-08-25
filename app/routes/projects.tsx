import { Link } from 'react-router';
import type * as CSS from 'csstype';
import clsx from 'clsx';

type ProjectProps = React.PropsWithChildren<{
    id: string
    title: string
    date: string
    image?: string | {
        url: string
        alt?: string
        rendering?: CSS.Properties['imageRendering']
        translucent?: boolean,
        rounded?: boolean
    }
    languages?: string[]
    frameworks?: string[]
    links?: Array<{
        text: string
        to: string
        external?: boolean
    }>
}>

function Project({
    id,
    title,
    date,
    children,
    image,
    languages,
    frameworks,
    links
}: ProjectProps) {
    languages ??= []
    frameworks ??= []
    links ??= []

    let imageUrl: string | undefined
    let imageAltText = ""
    let imageRendering: CSS.Properties['imageRendering'] = undefined
    let imageTranslucent = false
    let imageRounded = true

    if (typeof image === "object" && image !== null) {
        imageUrl = image.url
        imageAltText = image.alt ?? ""
        imageRendering = image.rendering ?? imageRendering
        imageTranslucent = !!(image.translucent ?? imageTranslucent)
        imageRounded = image.rounded ?? imageRounded
    } else {
        imageUrl = image
    }

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

            {(languages.length > 0 || frameworks.length > 0) && (
                <div className="space-y-1">
                    {languages.length > 0 && (
                        <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">Languages:</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{languages.join(', ')}</span>
                        </div>
                    )}
                    {frameworks.length > 0 && (
                        <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">Frameworks:</span>{' '}
                            <span className="text-gray-600 dark:text-gray-400">{frameworks.join(', ')}</span>
                        </div>
                    )}
                </div>
            )}

            {links.length > 0 && (
                <div className="-m-1">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            to={link.to}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noopener noreferrer" : undefined}
                            className="m-1 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                        >
                            {link.text}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    const imageElement = imageUrl && (
        <img
            src={imageUrl}
            alt={imageAltText}
            style={{ imageRendering }}
            className={clsx(
                "max-w-32 max-h-32 sm:max-w-48 sm:max-h-48 md:max-w-54 md:max-h-54 lg:max-w-64 lg:max-h-64 object-contain self-start max-sm:group-odd/row:self-end sm:self-center",
                !imageTranslucent && imageRounded && "rounded-lg",
                imageTranslucent ? "drop-shadow-xl" : "shadow-lg",
            )}
        />
    );

    return (
        <section id={id} className="group/row flex flex-col gap-12 items-center sm:flex-row odd:sm:flex-row-reverse odd:text-right">
            {imageElement}
            {content}
        </section>
    );
}

export default function Projects() {
    return <>
        {/* Header */}
        <h1 className="text-center text-5xl font-bold text-gray-900 dark:text-white mb-6 font-serif">
            Projects
        </h1>

        {/* Projects List */}
        <div className="flex flex-col gap-12 max-w-5xl mx-auto px-4">
            <Project
                id="proj_dissertation"
                title="Dissertation"
                date="2018-19"
                image={{ url: "/static/img/projects/dissertation/breakout.png", alt: "Breakout game screenshot", rendering: 'pixelated', rounded: false }}
                languages={["Python"]}
                frameworks={["TensorFlow", "PyTorch"]}
                links={[
                    { text: "Paper PDF", to: "/static/files/Dissertation.pdf", external: true },
                    { text: "More details", to: "/projects/dissertation" }
                ]}
            >
                Final year project exploring Google DeepMind's research into developing general AI for Atari 2600 games using deep learning. Achieved a 1st class mark for this project.
            </Project>

            <Project
                id="proj_website"
                title="trolleyman.org"
                date="2018"
                image={{ url: "/static/img/projects/website/screenshot.png", alt: "Website screenshot" }}
                languages={["Rust", "WASM", "JavaScript", "CSS", "SQL"]}
                frameworks={["Rocket"]}
                links={[
                    { text: "Github", to: "https://github.com/trolleyman/trolleyman.org", external: true },
                    { text: "More details", to: "/projects/website" }
                ]}
            >
                Created this website to keep track of the projects I've been working on.
            </Project>

            <Project
                id="proj_linc"
                title="LINC"
                date="Jun. 2017"
                image={{ url: "/static/img/projects/linc/logo.min.png", alt: "LINC logo", translucent: true }}
                languages={["HTML", "JavaScript", "CSS", "SQL", "Python"]}
                frameworks={["Three.js", "D3.js", "Django"]}
                links={[
                    { text: "Website", to: "/linc" },
                    { text: "Demo", to: "/linc/demo" },
                    { text: "More details", to: "/projects/linc" }
                ]}
            >
                A versatile social network visualization tool, developed with Millennium Point.
            </Project>

            <Project
                id="proj_flappy"
                title="Flappy Clone"
                date="Dec. 2016 - Jul. 2017"
                image={{ url: "/static/img/projects/flappy/logo.png", alt: "Flappy game logo", rendering: 'pixelated', translucent: true }}
                languages={["HTML", "JavaScript", "CSS", "SQL", "Python"]}
                frameworks={["HTML5 Canvas API", "Django"]}
                links={[
                    { text: "Demo", to: "/flappy" },
                    { text: "More details", to: "/projects/flappy" }
                ]}
            >
                Yet another Flappy Bird clone.
            </Project>

            <Project
                id="proj_zucchini"
                title="Zucchini"
                date="Jul. 2017"
                image={{ url: "/static/img/projects/zucchini/logo.min.gif", alt: "Zucchini game logo", rendering: 'crisp-edges', translucent: true }}
                languages={["Java"]}
                frameworks={["LWJGL", "OpenGL", "OpenAL"]}
                links={[
                    { text: "Github", to: "https://github.com/trolleyman/Zucchini", external: true },
                    { text: "More details", to: "/projects/zucchini" }
                ]}
            >
                Atmospheric fast-paced top down shooter. Developed with 5 other students.
            </Project>

            <Project
                id="robot"
                title="Robot Warehouse"
                date="Apr. 2016"
                image={{ url: "/static/img/projects/robot/casterbot.min.jpg", alt: "Robot warehouse system" }}
                languages={["Java"]}
                frameworks={["LeJOS", "Swing"]}
                links={[
                    { text: "Github", to: "https://github.com/trolleyman/rp-warehouse", external: true },
                    { text: "More details", to: "/projects/robot" }
                ]}
            >
                Robot warehouse management system. Developed with 9 other students.
            </Project>

            <Project
                id="portal"
                title="Portal 2"
                date="Nov. 2016"
                image={{ url: "/static/img/projects/portal/screenshot.min.jpg", alt: "Portal 2 game screenshot" }}
                languages={["Rust"]}
                frameworks={["OpenGL"]}
                links={[
                    { text: "Github", to: "https://github.com/trolleyman/Portal2", external: true }
                ]}
            >A redo of my first Portal project, a shameless attempt to copy my favourite video game at the time, Portal. Guess that makes this a redo of a r
                edo.
            </Project>

            <Project
                id="k-means"
                title="k-means"
                date="Sep. 2016"
                image={{ url: "/static/img/projects/k-means/alabama-hills-ca.min.jpg", alt: "K-means clustering visualization" }}
                languages={["Rust"]}
                links={[
                    { text: "Github", to: "https://github.com/trolleyman/kmeans", external: true }
                ]}
            >
                Using the k-means algorithm to create pretty pictures.
            </Project>

            <Project
                id="equator"
                title="Equator"
                date="Dec. 2016"
                image={{ url: "/static/img/projects/equator/screenshot.jpg", alt: "Equator expression editor", rounded: false }}
                languages={["Rust"]}
                frameworks={["GTK+"]}
                links={[
                    { text: "Github", to: "https://github.com/trolleyman/Equator", external: true }
                ]}
            >
                An expression editor and evaluator that allows easy visualization and processing of mathematical expressions.
            </Project>
        </div>
    </>;
}