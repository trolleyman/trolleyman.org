import { CONTENT_WIDTH_CLASSES } from '..';
import BodyLink from '~/components/BodyLink';
import FancyLinks from '~/components/FancyLinks';
import Figure from '~/components/Figure';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';

// @ts-ignore
import graphImg from './img/graph_white.jpg?as=picture&format=webp;avif;jpg&w=300;500;700;1000;';
// @ts-ignore
import darkGraphImg from './img/graph_black.jpg?as=picture&format=webp;avif;jpg&w=300;500;700;1000;';
import logoUrl from './img/logo.min.png?url';

export default function LincProject() {
  return (
    <>
      <PageTitle className="text-3xl md:text-3xl lg:text-4xl">
        <span className="flex items-center gap-3">
          <img src={logoUrl} alt="" className="h-10 w-10" />
          LINC
        </span>
      </PageTitle>

      <div
        className={cn(
          'space-y-4 leading-relaxed text-gray-700 dark:text-gray-300',
          CONTENT_WIDTH_CLASSES,
        )}
      >
        <Figure
          src={graphImg}
          alt="LINC graph visualization"
          caption="Social network graph visualization"
          className="xs:max-w-xs float-right ml-4 mb-2 w-80 sm:max-w-sm"
        />

        <p>
          I developed LINC alongside{' '}
          <BodyLink to="http://peran.co" external>
            Peran Truscott
          </BodyLink>{' '}
          and{' '}
          <BodyLink to="http://tomg.io" external>
            Tom Goodman
          </BodyLink>{' '}
          over the 2017 summer holidays. The project was funded by the wonderful{' '}
          <BodyLink to="https://www.millenniumpoint.org.uk/" external>
            Millennium Point
          </BodyLink>
          , in order to advertise their new CONNECT space opening. We had two
          and a half short weeks, but we managed to generate a digital artpiece
          that captured the attention of the many people there.
        </p>

        <p>
          Everyone entered their name and up to 3 interests into LINC, and they
          were displayed on a graph that connected people to their interests.
          The graph could then be explored manually to view who was similar to
          them, or it could be put onto auto mode to produce a cool screensaver.
        </p>

        <Figure
          src={darkGraphImg}
          alt="Dark mode LINC"
          caption="Dark mode"
          className="xs:max-w-xs float-left mr-4 w-80 sm:max-w-sm"
        />

        <p>
          For the visualisation front end we used{' '}
          <BodyLink to="https://threejs.org/" external>
            THREE.js
          </BodyLink>{' '}
          to render the graph, and{' '}
          <BodyLink to="https://www.npmjs.com/package/d3-force-3d" external>
            d3-force-3d
          </BodyLink>{' '}
          to simulate the forces between the nodes in the graph. The back end
          was developed using Python, with{' '}
          <BodyLink to="https://www.djangoproject.com/" external>
            Django
          </BodyLink>{' '}
          to manage the database and project. We also built a small landing
          page, with templates from{' '}
          <BodyLink to="http://html5up.net" external>
            HTML5 UP
          </BodyLink>
          .
        </p>

        <p>
          I learnt a lot on this project about web development, and I hope to
          further develop these skills. Have a look at the demo below to see how
          I did!
        </p>

        <FancyLinks
          className="text-left"
          links={[
            { text: 'Website', to: '/projects/linc/mainpage' },
            { text: 'Demo', to: '/projects/linc/demo' },
          ]}
        />
      </div>
    </>
  );
}
