import PageTitle from "~/components/PageTitle";
import FancyLinks from "~/components/FancyLinks";

export default function PortalProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Portal 2</PageTitle>

        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
                A redo of my first Portal project, a shameless attempt to copy my favourite video game at the time, Portal. This project was developed in Rust using OpenGL for graphics rendering, focusing on implementing the core portal mechanics that made the original game so innovative.
            </p>

            <p>
                The goal was to recreate the fundamental portal system where players can create linked portals between surfaces, allowing for complex spatial reasoning puzzles and creative problem-solving approaches. This involved implementing 3D graphics, collision detection, and the mathematical calculations needed for portal rendering and physics.
            </p>

            <p>
                While not a complete game, this project demonstrated my ability to work with low-level graphics programming, understand complex game mechanics, and implement them in a systems programming language like Rust.
            </p>

            <FancyLinks className="text-left" links={[
                { text: "GitHub", to: "https://github.com/trolleyman/Portal2", external: true },
            ]} />
        </div>
    </>
}
