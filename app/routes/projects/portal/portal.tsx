import PageTitle from '~/components/PageTitle';
import FancyLinks from '~/components/FancyLinks';
import BodyLink from '~/components/BodyLink';
import { cn } from '~/utils';
import { CONTENT_WIDTH_CLASSES } from '..';

import Figure from '~/components/Figure';

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
          'space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed',
          CONTENT_WIDTH_CLASSES,
        )}
      >
        <Figure
          src={portalImg}
          alt="Portal 2"
          caption="Portal 2"
          className="float-right w-full sm:max-w-sm ml-4 mb-2"
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
