import PageTitle from "~/components/PageTitle";
import BodyLink from "~/components/BodyLink";
import FancyLinks from "~/components/FancyLinks";
import Img from "~/components/Img";
import { cn } from "~/utils";
import { CONTENT_WIDTH_CLASSES } from "..";

// @ts-ignore
import demo1Img from './img/demo1.jpg?as=picture&format=webp;avif;jpg&w=300;500;700;1000;'
// @ts-ignore
import demo2Img from './img/demo2.jpg?as=picture&format=webp;avif;jpg&w=300;500;700;1000;'
// @ts-ignore
import demo3Img from './img/demo3.jpg?as=picture&format=webp;avif;jpg&w=300;500;700;1000;'

export default function FlappyProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Flappy Clone</PageTitle>

        <div className={cn("space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed", CONTENT_WIDTH_CLASSES)}>

            <div className="w-screen ml-[calc(50%-50vw)] overflow-x-auto">
                <div className="grid grid-cols-3 grid-rows-1 w-fit mx-auto mb-6 mt-4 gap-4 md:gap-8 lg:gap-12 min-w-max">
                    <Img
                        src={demo1Img}
                        className="max-h-64 sm:max-h-70"
                    />
                    <Img
                        src={demo2Img}
                        className="max-h-64 sm:max-h-70"
                    />
                    <Img
                        src={demo3Img}
                        className="max-h-64 sm:max-h-70"
                    />
                </div>
            </div>

            <p>
                Developed over the Christmas holidays 2016, sitting by the fire. Learnt a lot about Canvas, JS, spritesheets, and more! Fully responsive, can be played on a desktop and mobile. Leaderboard was modifiable at one point in time (<BodyLink to="https://www.djangoproject.com/" external>Django</BodyLink>), but as this is a static site, this has been disabled, forever cementing 'egg2' as the high scorer 🥚
            </p>

            <FancyLinks className="text-right" links={[
                { text: "Demo", to: "demo" },
            ]} />
        </div>
    </>
}
