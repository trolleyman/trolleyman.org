import PageTitle from "~/components/PageTitle";
import BodyLink from "~/components/BodyLink";
import FancyLinks from "~/components/FancyLinks";
import Img from "~/components/Img";

import demo1Img from './img/demo1.jpg'
import demo2Img from './img/demo2.jpg'
import demo3Img from './img/demo3.jpg'

export default function FlappyProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Flappy Clone</PageTitle>

        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <div className="flex justify-center gap-4 md:gap-8 md:mt-4 md:mb-6 lg:gap-12">
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

            <p>
                Developed over the Christmas holidays 2016, sitting by the fire. Learnt a lot about Canvas, JS, spritesheets, and more! Fully responsive, can be played on a desktop and mobile. Leaderboard was modifiable at one point in time (<BodyLink to="https://www.djangoproject.com/" external>Django</BodyLink>), but as this is a static site, this has been disabled, forever cementing 'egg2' as the high scorer 🥚
            </p>

            <FancyLinks className="text-right" links={[
                { text: "Demo", to: "demo" },
            ]} />
        </div>
    </>
}
