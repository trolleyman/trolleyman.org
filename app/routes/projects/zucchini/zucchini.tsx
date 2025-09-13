import PageTitle from "~/components/PageTitle";
import Figure from "~/components/Figure";
import FancyLinks from "~/components/FancyLinks";

import shootingImg from './shooting.png'
import victoryImg from './victory.png'
import laserImg from './laser.png'
import { cn } from "~/utils";
import { CONTENT_WIDTH_CLASSES } from "..";

export default function ZucchiniProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Zucchini</PageTitle>

        <div className={cn("space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed", CONTENT_WIDTH_CLASSES)}>
            <Figure
                src={shootingImg}
                alt="Zucchini shooting gameplay"
                caption="Combat gameplay"
                className="float-right w-full sm:max-w-sm ml-4 mb-2"
            />

            <p  className="sm:text-right">
                I developed Zucchini with 5 other students as part of a team project module for my course at the University of Birmingham. We had 11 weeks to produce a working multiplayer game. We each had differing roles, and as the integration manager I had to ensure that everyone was on the same page about the project, so that we could effectively work as a team.
            </p>

            <p className="sm:text-right">
                I learnt a lot during this project about team management and game development that I hope to apply in the future.
            </p>

            <div className="clear-both" />
            <Figure
                src={victoryImg}
                alt="Zucchini victory screen"
                caption="Victory celebration"
                className="float-left w-full sm:max-w-sm mr-4 mb-2"
            />

            <p>
                The game consists of a set of 4-person deathmatches. The game can be played singleplayer, in which case AI will take over to fill the lobby, or with others via LAN or over the internet. The lighting system means that it sometimes becomes a tense game of cat and mouse where one person turns off their flashlight in order to be less detectable by the other person, but leaves themselves open to attack by zombies scattered throughout the map.
            </p>

            <div className="clear-both" />
            <Figure
                src={laserImg}
                alt="Zucchini laser effects"
                caption="Laser weapon effects"
                className="float-right w-full sm:max-w-sm ml-4 mb-2"
            />

            <p className="sm:text-right">
                We used Java with the LWJGL framework to develop the game. This involved OpenGL which was difficult to begin with, however it left open the possibility of cool effects, like a realistic lighting system and occlusion of the unseen portions of the map.
            </p>

            <FancyLinks className="text-left" links={[
                { text: "GitHub", to: "https://github.com/trolleyman/Zucchini", external: true },
            ]} />

            <div className="clear-both" />
        </div>
    </>
}
