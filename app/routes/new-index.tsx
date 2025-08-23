import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faDesktop, faEnvelope, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "~/components/ThemeProvider";
import { Link } from 'react-router';

// Example: import projects from a local file or paste the array here
const projects = [
    {
        id: "dissertation",
        title: "Dissertation",
        date: "2018-19",
        image: "/static/img/projects/dissertation/breakout.png",
        url: "projects/dissertation",
        description: "Final year project exploring Google DeepMind's research into developing general AI for Atari 2600 games using deep learning.",
        achievement: "Achieved a 1st class mark for this project.",
        languages: ["Python"],
        frameworks: ["TensorFlow", "PyTorch"],
        links: [
            { label: "Paper PDF", url: "/static/files/Dissertation.pdf", target: "_blank" },
            { label: "More details", url: "projects/dissertation" }
        ]
    },
    {
        id: "website",
        title: "trolleyman.org",
        date: "2018",
        image: "/static/img/projects/website/screenshot.png",
        url: "projects/website",
        description: "Created this website to keep track of the projects I've been working on.",
        languages: ["Rust", "WASM", "JavaScript", "CSS", "SQL"],
        frameworks: ["Rocket"],
        links: [
            { label: "Github", url: "https://github.com/trolleyman/trolleyman.org" },
            { label: "More details", url: "projects/website" }
        ]
    },
    {
        id: "linc",
        title: "LINC",
        date: "Jun. 2017",
        image: "/static/img/projects/linc/logo.min.png",
        url: "projects/linc",
        description: "A versatile social network visualization tool, developed with Millennium Point.",
        languages: ["HTML", "JavaScript", "CSS", "SQL", "Python"],
        frameworks: ["Three.js", "D3.js", "Django"],
        links: [
            { label: "Website", url: "linc" },
            { label: "Demo", url: "linc/demo" },
            { label: "More details", url: "projects/linc" }
        ]
    },
    {
        id: "flappy",
        title: "Flappy Clone",
        date: "Dec. 2016 - Jul. 2017",
        image: "/static/img/projects/flappy/logo.png",
        url: "projects/flappy",
        description: "Yet another Flappy Bird clone.",
        languages: ["HTML", "JavaScript", "CSS", "SQL", "Python"],
        frameworks: ["HTML5 Canvas API", "Django"],
        links: [
            { label: "Demo", url: "/flappy" },
            { label: "More details", url: "projects/flappy" }
        ]
    },
    {
        id: "zucchini",
        title: "Zucchini",
        date: "Jul. 2017",
        image: "/static/img/projects/zucchini/logo.min.gif",
        url: "projects/zucchini",
        description: "Atmospheric fast-paced top down shooter. Developed with 5 other students.",
        languages: ["Java", "Java", "more Java"],
        frameworks: ["LWJGL", "OpenGL", "OpenAL"],
        links: [
            { label: "Github", url: "https://github.com/trolleyman/Zucchini" },
            { label: "More details", url: "projects/zucchini" }
        ]
    },
    {
        id: "robot",
        title: "Robot Warehouse",
        date: "Apr. 2016",
        image: "/static/img/projects/robot/casterbot.min.jpg",
        url: "projects/robot",
        description: "Robot warehouse management system. Developed with 9 other students.",
        languages: ["Yet more Java"],
        frameworks: ["LeJOS", "Swing"],
        links: [
            { label: "Github", url: "https://github.com/trolleyman/rp-warehouse" },
            { label: "More details", url: "projects/robot" }
        ]
    },
    {
        id: "portal",
        title: "Portal 2",
        date: "Nov. 2016",
        image: "/static/img/projects/portal/screenshot.min.jpg",
        url: "projects/portal",
        description: "A redo of my first Portal project, a shameless attempt to copy my favourite video game at the time, Portal. Guess that makes this a redo of a redo.",
        languages: ["Rust and OpenGL"],
        links: [
            { label: "Github", url: "https://github.com/trolleyman/Portal2" }
        ]
    },
    {
        id: "k-means",
        title: "k-means",
        date: "Sep. 2016",
        image: "/static/img/projects/k-means/alabama-hills-ca.min.jpg",
        url: "projects/k-means",
        description: "Using the k-means algorithm to create pretty pictures.",
        languages: ["Rust"],
        links: [
            { label: "Github", url: "https://github.com/trolleyman/kmeans" }
        ]
    },
    {
        id: "equator",
        title: "Equator",
        date: "Dec. 2016",
        image: "/static/img/projects/equator/screenshot.jpg",
        url: "projects/equator",
        description: "An expression editor and evaluator that allows easy visualization and processing of mathematical expressions.",
        languages: ["Rust using GTK+"],
        links: [
            { label: "Github", url: "https://github.com/trolleyman/Equator" }
        ]
    }
];

export default function HomePage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-4xl mx-auto py-6 px-4 flex justify-between items-center">
                    <Link to="/" className="text-3xl font-bold hover:text-blue-400">Callum Tolley</Link>
                    <nav className="flex items-center space-x-6">
                        <ul className="flex space-x-6">
                            <li><Link to="#about" className="hover:text-blue-400">About</Link></li>
                            <li><Link to="#projects" className="hover:text-blue-400">Projects</Link></li>
                            <li><Link to="#contact" className="hover:text-blue-400">Contact</Link></li>
                        </ul>
                        <Link to="https://github.com/trolleyman" target="_blank" rel="noopener noreferrer" className="ml-4 text-xl hover:text-blue-400" aria-label="GitHub"><FontAwesomeIcon icon={faGithub} /></Link>
                        <Link to="mailto:your@email.com" className="ml-2 text-xl hover:text-blue-400" aria-label="Email"><FontAwesomeIcon icon={faEnvelope} /></Link>
                        <Link to="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="ml-2 text-xl hover:text-blue-400" aria-label="LinkedIn"><FontAwesomeIcon icon={faLinkedin} /></Link>
                        <button
                            onClick={() => setTheme(theme === "system" ? "dark" : theme === "dark" ? "light" : "system")}
                            className="ml-4 text-xl focus:outline-none hover:text-blue-400 cursor-pointer"
                            aria-label="Toggle dark mode"
                            title="Toggle dark mode"
                        >
                            <FontAwesomeIcon icon={theme === "system" ? faDesktop : theme === "dark" ? faMoon : faSun} />
                        </button>
                    </nav>
                </div>
            </header>

            {/* About Section */}
            <section id="about" className="max-w-4xl mx-auto py-12 px-4">
                <h2 className="text-2xl font-semibold mb-4">About Me</h2>
                <p className="text-lg">I'm a software developer passionate about building impactful projects. Welcome to my personal website!</p>
            </section>

            {/* Projects Section */}
            <section id="projects" className="max-w-4xl mx-auto py-12 px-4">
                <h2 className="text-2xl font-semibold mb-4">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map(project => (
                        <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <img src={project.image} alt={project.title} className="w-full h-40 object-cover rounded mb-4" />
                            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                            <p className="mb-2 text-sm text-gray-400 dark:text-gray-500">{project.date}</p>
                            <p className="mb-2">{project.description}</p>
                            {project.achievement && <p className="mb-2 text-green-400 dark:text-green-300">{project.achievement}</p>}
                            <div className="mb-2 text-xs">
                                <span className="font-semibold">Languages:</span> {project.languages.join(", ")}
                            </div>
                            {project.frameworks && (
                                <div className="mb-2 text-xs">
                                    <span className="font-semibold">Frameworks:</span> {project.frameworks.join(", ")}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {project.links && project.links.map((link, idx) => (
                                    <a key={idx} href={link.url} target={link.target || "_self"} rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm px-2 py-1 border border-blue-400 rounded">
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="max-w-4xl mx-auto py-12 px-4">
                <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                <div className="flex items-center space-x-4 mb-6">
                    <a href="https://github.com/trolleyman" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400" aria-label="GitHub"><FontAwesomeIcon icon={faGithub} /></a>
                    <a href="mailto:your@email.com" className="text-2xl hover:text-blue-400" aria-label="Email"><FontAwesomeIcon icon={faEnvelope} /></a>
                    <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-400" aria-label="LinkedIn"><FontAwesomeIcon icon={faLinkedin} /></a>
                </div>
                <form className="space-y-4">
                    <input type="text" placeholder="Name" className="w-full p-2 border rounded dark:bg-gray-900 dark:text-gray-100" />
                    <input type="email" placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-900 dark:text-gray-100" />
                    <textarea placeholder="Message" className="w-full p-2 border rounded dark:bg-gray-900 dark:text-gray-100" rows={4} />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
                </form>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t mt-12 py-6 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Your Name. All rights reserved.
            </footer>
        </div>
    );
}
