import PageTitle from "~/components/PageTitle";
import Figure from "~/components/Figure";
import { Link } from "react-router";
import BodyLink from "~/components/BodyLink";
import FancyLinks from "~/components/FancyLinks";

import demo1Img from './demo1.jpg'
import demo2Img from './demo2.jpg'

export default function FlappyProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Flappy Clone</PageTitle>

        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <Figure
                src={demo1Img}
                alt="Flappy game demo 1"
                caption="Gameplay screenshot"
                className="float-right w-full xs:max-w-xs sm:max-w-sm ml-4 mb-2 max-h-48"
            />

            <p>
                I developed Flappy Clone in my spare time over the 2016 Christmas holidays. There was a job advertised near where I live that wanted a web developer. Since I had no experience developing websites, and no imagination, I got the idea to produce a clone of the Flappy Bird game that was popular a while ago.
            </p>

            <Figure
                src={demo2Img}
                alt="Flappy game demo 2"
                caption="Another gameplay view"
                className="float-left w-full xs:max-w-xs sm:max-w-sm mr-4 mb-2 max-h-48"
            />

            <p>
                Although I didn't end up getting the job, I believe that I learnt a lot about web development, and this helped me in my future project, <Link to="/projects/linc">LINC</Link>.
            </p>

            <p>
                The game is fully responsive, and can be played on any platform that can access a web browser. Most of the assets are stolen from the original game.
            </p>

            <p>
                For the front end I used the HTML5 Canvas API. For the back end I used the wonderful framework <BodyLink to="https://www.djangoproject.com/" external>Django</BodyLink> to interface with the database.
            </p>

            <FancyLinks className="text-left" links={[
                { text: "Demo", to: "/flappy" },
            ]} />

            <div className="clear-both" />
        </div>
    </>
}
