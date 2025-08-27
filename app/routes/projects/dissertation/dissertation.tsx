import PageTitle from "~/components/PageTitle";
import Figure from "~/components/Figure";
import { Link } from "react-router";
import Img from "~/components/Img";
import FancyLinks from "~/components/FancyLinks";
import type { ImageMetadata } from "vite-imagetools";

const bg: ImageMetadata[] = (await import('./bg.png?format=webp;avif;jpg&as=metadata')).default
console.log('aaaa', bg)

import bgUrl from './bg.png'

export default function Dissertation() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Artificial Intelligence in Atari 2600 Games using Deep Q-Learning</PageTitle>

        <Img
            img={bg}
            rendering="pixelated"
            className="mb-6 mt-4 w-full"
        />

        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
                For my dissertation project I chose to explore the topic of game AI. <Link to="https://deepmind.com/" target="_blank" rel="noopener noreferrer">Google DeepMind</Link> had recently released a <Link to="https://deepmind.com/research/dqn/" target="_blank" rel="noopener noreferrer">paper</Link> about a novel technique of creating general game AIs using machine learning. They then demonstrated the efficacy of their method on a variety of Atari 2600 games (Breakout, Space Invaders, Pacman, etc.).
            </p>
            <Figure
                src="/static/img/projects/dissertation/breakout_graph.png"
                alt="Breakout Q-values over time"
                caption="Annotated graph of Q-values over time for an episode of Breakout."
                className="float-right w-full xs:max-w-xs sm:max-w-sm ml-4 mb-2"
            />
            <p>
                The method is explained more fully in my <Link to="/static/files/Dissertation.pdf">dissertation paper</Link>, but it essentially combines the traditional technique of Q-learning with neural networks. The aim of the disseration was twofold. Firstly, to try to actually reproduce these results, and potentially improve upon them. Secondly, to develop a visualization tool to try and understand what was going on "behind the scenes". Neural networks are famously opaque, so the aim was to try and understand why each agent took the actions it did.
            </p>
            <p>
                Since the method requires a large amount of computation, I wrote a program that distributed the workload over 150 lab computers in the computer science building at the university. I also used <Link to="https://cloud.google.com/storage/" target="_blank" rel="noopener noreferrer">Google Cloud Storage</Link> to store the results.
            </p>
            <p>
                This was a challenging project, and I was proud at the end of it when I achieved similar results to the Google DeepMind team with a much smaller amount of resources.
            </p>

            <FancyLinks className="text-right" links={[
                { text: "Paper", to: "/static/files/Dissertation.pdf", external: true },
            ]} />

            <div className="clear-both" />
        </div>
    </>
}
