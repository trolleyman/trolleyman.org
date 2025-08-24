import { Link } from 'react-router';

type ProjectProps = React.PropsWithChildren<{
    id: string;
    title: string;
    date: string;
    image: string;
    imageAlt: string;
    languages?: string[];
    frameworks?: string[];
    links?: Array<{
        text: string;
        to: string;
        external?: boolean;
    }>;
}>

function Project({
    id,
    title,
    date,
    children,
    image,
    imageAlt,
    languages,
    frameworks,
    links
}: ProjectProps) {
    languages ??= []
    frameworks ??= []
    links ??= []

    const content = (
        <div className="flex-1 space-y-4">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">{date}</div>
            </div>

            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</div>

            {(languages.length > 0 || frameworks.length > 0) && (
                <div className="space-y-2">
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
                <div className="flex flex-wrap gap-3">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            to={link.to}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noopener noreferrer" : undefined}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                        >
                            {link.text}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    const imageElement = (
        <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md">
                <img
                    src={image}
                    alt={imageAlt}
                    className="w-full h-auto rounded-lg shadow-lg object-cover"
                />
            </div>
        </div>
    );

    return (
        <section id={id} className="py-16">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12 items-center even:lg:flex-row-reverse">
                    {imageElement}
                    {content}
                </div>
            </div>
        </section>
    );
}

export default function Projects() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            {/* Header */}
            <div className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Projects
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        A collection of my work across various technologies and domains, from AI research to game development.
                    </p>
                </div>
            </div>

            {/* Projects List */}
            <div className="py-8">
                <Project
                    id="proj_dissertation"
                    title="Dissertation"
                    date="2018-19"
                    image="/static/img/projects/dissertation/breakout.png"
                    imageAlt="Breakout game screenshot"
                    languages={["Python"]}
                    frameworks={["TensorFlow", "PyTorch"]}
                    links={[
                        { text: "Paper PDF", to: "/static/files/Dissertation.pdf", external: true },
                        { text: "More details", to: "/projects/dissertation" }
                    ]}
                >Final year project exploring Google DeepMind's research into developing general AI for Atari 2600 games using deep learning. Achieved a 1st class mark for this project.</Project>

                <div className="max-w-6xl mx-auto px-6">
                    <hr className="border-gray-200 dark:border-gray-700" />
                </div>

                <Project
                    id="proj_website"
                    title="trolleyman.org"
                    date="2018"
                    image="/static/img/projects/website/screenshot.png"
                    imageAlt="Website screenshot"
                    languages={["Rust", "WASM", "JavaScript", "CSS", "SQL"]}
                    frameworks={["Rocket"]}
                    links={[
                        { text: "Github", to: "https://github.com/trolleyman/trolleyman.org", external: true },
                        { text: "More details", to: "/projects/website" }
                    ]}
                >Created this website to keep track of the projects I've been working on.</Project>

                <div className="max-w-6xl mx-auto px-6">
                    <hr className="border-gray-200 dark:border-gray-700" />
                </div>

                <Project
                    id="proj_linc"
                    title="LINC"
                    date="Jun. 2017"
                    image="/static/img/projects/linc/logo.min.png"
                    imageAlt="LINC logo"
                    languages={["HTML", "JavaScript", "CSS", "SQL", "Python"]}
                    frameworks={["Three.js", "D3.js", "Django"]}
                    links={[
                        { text: "Website", to: "/linc" },
                        { text: "Demo", to: "/linc/demo" },
                        { text: "More details", to: "/projects/linc" }
                    ]}
                >A versatile social network visualization tool, developed with Millennium Point.</Project>

                <div className="max-w-6xl mx-auto px-6">
                    <hr className="border-gray-200 dark:border-gray-700" />
                </div>

                <Project
                    id="proj_flappy"
                    title="Flappy Clone"
                    date="Dec. 2016 - Jul. 2017"
                    image="/static/img/projects/flappy/logo.png"
                    imageAlt="Flappy game logo"
                    languages={["HTML", "JavaScript", "CSS", "SQL", "Python"]}
                    frameworks={["HTML5 Canvas API", "Django"]}
                    links={[
                        { text: "Demo", to: "/flappy" },
                        { text: "More details", to: "/projects/flappy" }
                    ]}
                >Yet another Flappy Bird clone.</Project>

                <div className="max-w-6xl mx-auto px-6">
                    <hr className="border-gray-200 dark:border-gray-700" />
                </div>

                <Project
                    id="proj_zucchini"
                    title="Zucchini"
                    date="Jul. 2017"
                    image="/static/img/projects/zucchini/logo.min.gif"
                    imageAlt="Zucchini game logo"
                    languages={["Java"]}
                    frameworks={["LWJGL", "OpenGL", "OpenAL"]}
                    links={[
                        { text: "Github", to: "https://github.com/trolleyman/Zucchini", external: true },
                        { text: "More details", to: "/projects/zucchini" }
                    ]}
                >Atmospheric fast-paced top down shooter. Developed with 5 other students.</Project>

                <div className="max-w-6xl mx-auto px-6">
                    <hr className="border-gray-200 dark:border-gray-700" />
                </div>

                <Project
                    id="robot"
                    title="Robot Warehouse"
                    date="Apr. 2016"
                    image="/static/img/projects/robot/casterbot.min.jpg"
                    imageAlt="Robot warehouse system"
                    languages={["Java"]}
                    frameworks={["LeJOS", "Swing"]}
                    links={[
                        { text: "Github", to: "https://github.com/trolleyman/rp-warehouse", external: true },
                        { text: "More details", to: "/projects/robot" }
                    ]}
                >Robot warehouse management system. Developed with 9 other students.</Project>

                <div className="max-w-6xl mx-auto px-6">
                    <hr className="border-gray-200 dark:border-gray-700" />
                </div>

                <Project
                    id="portal"
                    title="Portal 2"
                    date="Nov. 2016"
                    image="/static/img/projects/portal/screenshot.min.jpg"
                    imageAlt="Portal 2 game screenshot"
                    languages={["Rust"]}
                    frameworks={["OpenGL"]}
                    links={[
                        { text: "Github", to: "https://github.com/trolleyman/Portal2", external: true }
                    ]}
                >A redo of my first Portal project, a shameless attempt to copy my favourite video game at the time, Portal. Guess that makes this a redo of a redo.</Project>

                <div className="max-w-6xl mx-auto px-6">
                    <hr className="border-gray-200 dark:border-gray-700" />
                </div>

                <Project
                    id="k-means"
                    title="k-means"
                    date="Sep. 2016"
                    image="/static/img/projects/k-means/alabama-hills-ca.min.jpg"
                    imageAlt="K-means clustering visualization"
                    languages={["Rust"]}
                    links={[
                        { text: "Github", to: "https://github.com/trolleyman/kmeans", external: true }
                    ]}
                >Using the k-means algorithm to create pretty pictures.</Project>

                <div className="max-w-6xl mx-auto px-6">
                    <hr className="border-gray-200 dark:border-gray-700" />
                </div>

                <Project
                    id="equator"
                    title="Equator"
                    date="Dec. 2016"
                    image="/static/img/projects/equator/screenshot.jpg"
                    imageAlt="Equator expression editor"
                    languages={["Rust"]}
                    frameworks={["GTK+"]}
                    links={[
                        { text: "Github", to: "https://github.com/trolleyman/Equator", external: true }
                    ]}
                >An expression editor and evaluator that allows easy visualization and processing of mathematical expressions.</Project>
            </div>
        </div>
    );
}