import PageTitle from "~/components/PageTitle";
import Figure from "~/components/Figure";
import FancyLinks from "~/components/FancyLinks";
import { cn } from "~/utils";
import { CONTENT_WIDTH_CLASSES } from "..";

import guiImg from './gui.png'
import selfieImg from './selfie.jpg'

export default function RobotProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Robot Warehouse</PageTitle>

        <div className={cn("space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed", CONTENT_WIDTH_CLASSES)}>
            <Figure
                src={guiImg}
                alt="Robot warehouse GUI"
                caption="Warehouse management interface"
                className="float-right w-full xs:max-w-xs sm:max-w-sm ml-4 mb-2"
            />

            <p>
                Our task sounded simple for this project - get a set of robots to pick up and drop off items in a warehouse. It turned into the most frustrating yet rewarding project I've worked on. I was working with a large group of 9 other students as this was a module for my first year computer science degree at uni. Each person was assigned a role, and then we were told to just go out and do it.
            </p>

            <p>
                I was assigned GUI, but my role transformed into general bugfixer and integrator. I remember the final week was spent frantically trying to get the robots to route around eachother rather than bumping into eachother. Eventually I stayed up one night determined to get it working, and in the early hours of the morning, when the sun was rising, I finally made it. I stayed there for another 20 minutes, amazed that it worked finally. Then I packed up, and got a few hours sleep before the project final at 9am.
            </p>

            <Figure
                src={selfieImg}
                alt="Robot project selfie"
                caption="Late night debugging session"
                className="float-left w-full xs:max-w-xs sm:max-w-sm mr-4 mb-2"
            />

            <p>
                This project was also a challenge because it was the first time that I had worked in a large group before, and I believe that I really improved my communication skills on this project, and hope to further improve these skills.
            </p>

            <FancyLinks className="text-left" links={[
                { text: "GitHub", to: "https://github.org/trolleyman/rp-warehouse", external: true },
            ]} />

            <div className="clear-both" />
        </div>
    </>
}
