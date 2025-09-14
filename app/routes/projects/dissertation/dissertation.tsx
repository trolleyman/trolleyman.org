import PageTitle from "~/components/PageTitle";
import Figure from "~/components/Figure";
import Img from "~/components/Img";
import FancyLinks from "~/components/FancyLinks";
import BodyLink from "~/components/BodyLink";
import { cn } from "~/utils";
import { CONTENT_WIDTH_CLASSES } from "..";

// @ts-ignore
import games from './games.png?as=picture&format=webp;avif;png&w=300;500;700;1000;';
// @ts-ignore
import breakoutGraph from './breakout_graph.png?as=picture&format=webp;avif;png&w=300;500;700;1000;'
import dissertationPdfUrl from './Dissertation.pdf'

export default function Dissertation() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Artificial Intelligence in Atari 2600 Games using Deep Q-Learning</PageTitle>

        <Img
            src={games}
            rendering="pixelated"
            className="mb-6 mt-4 w-full"
        />

        <div className={cn("space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed", CONTENT_WIDTH_CLASSES)}>
            <p>
                For my dissertation project I chose to explore the topic of game AI. <BodyLink to="https://deepmind.com/" external>Google DeepMind</BodyLink> had recently released a <BodyLink to="https://deepmind.com/research/dqn/" external>paper</BodyLink> about a novel technique of creating general game AIs using machine learning. They then demonstrated the efficacy of their method on a variety of Atari 2600 games (Breakout, Space Invaders, Pacman, etc.).
            </p>
            <Figure
                src={breakoutGraph}
                alt="Breakout Q-values over time"
                caption="Annotated graph of Q-values over time for an episode of Breakout."
                className="float-right w-full xs:max-w-xs sm:max-w-sm ml-4 mb-2"
            />
            <p>
                The method is explained more fully in my <BodyLink to={dissertationPdfUrl}>dissertation paper</BodyLink>, but it essentially combines the traditional technique of Q-learning with neural networks. The aim of the disseration was twofold. Firstly, to try to actually reproduce these results, and potentially improve upon them. Secondly, to develop a visualization tool to try and understand what was going on "behind the scenes". Neural networks are famously opaque, so the aim was to try and understand why each agent took the actions it did.
            </p>
            <p>
                Since the method requires a large amount of computation, I wrote a program that distributed the workload over 150 lab computers in the computer science building at the university. I also used <BodyLink to="https://cloud.google.com/storage/" external>Google Cloud Storage</BodyLink> to store the results.
            </p>
            <p>
                This was a challenging project, and I was proud at the end of it when I achieved similar results to the Google DeepMind team with a much smaller amount of resources.
            </p>

            <FancyLinks className="text-right" links={[
                { text: "Paper", to: dissertationPdfUrl, external: true },
            ]} />

            <div className="clear-both" />
        </div>
    </>
}
