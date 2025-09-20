import { CONTENT_WIDTH_CLASSES } from '..';
import BodyLink from '~/components/BodyLink';
import FancyLinks from '~/components/FancyLinks';
import Figure from '~/components/Figure';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';

// @ts-ignore
import portalImg from './screenshot.jpg?as=picture&format=webp;avif;jpg&w=300;500;700;1000;';

export default function PortalProject() {
  return (
    <>
      <PageTitle className="text-3xl md:text-3xl lg:text-4xl">
        Portal 2
      </PageTitle>

      <div
        className={cn(
          'space-y-4 leading-relaxed text-gray-700 dark:text-gray-300',
          CONTENT_WIDTH_CLASSES,
        )}
      >
        <Figure
          src={portalImg}
          alt="Portal 2"
          caption="Portal 2"
          className="float-right mb-2 ml-4 w-full sm:max-w-sm"
        />

        <p className="sm:text-right">
          A redo of my first Portal project, a shameless attempt to copy my
          favourite video game at the time, Portal. This project was developed
          in Rust using OpenGL for graphics rendering, focusing on implementing
          the core portal mechanics that made the original game so innovative.
        </p>

        <p className="sm:text-right">
          I mainly followed{' '}
          <BodyLink
            to="https://en.wikibooks.org/wiki/OpenGL_Programming/Mini-Portal"
            external
          >
            this tutorial
          </BodyLink>
          , but in Rust.
        </p>

        <FancyLinks
          className="text-right"
          links={[
            {
              text: 'GitHub',
              to: 'https://github.com/trolleyman/Portal2',
              external: true,
            },
          ]}
        />
      </div>
    </>
  );
}
