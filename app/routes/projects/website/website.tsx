import { CONTENT_WIDTH_CLASSES } from '..';
import FancyLinks from '~/components/FancyLinks';
import Img from '~/components/Img';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';

// @ts-ignore
import screenshot from './screenshot.png?as=picture&format=webp;avif;png&w=300;500;700;1000;';

export default function WebsiteProject() {
  return (
    <>
      <PageTitle className="text-3xl md:text-3xl lg:text-4xl">
        trolleyman.org
      </PageTitle>

      <div
        className={cn(
          'space-y-4 pt-4 leading-relaxed text-gray-700 dark:text-gray-300',
          CONTENT_WIDTH_CLASSES,
        )}
      >
        <Img
          src={screenshot}
          alt="Website screenshot"
          className="mx-auto mb-4 max-h-48 sm:float-right sm:mr-0 sm:ml-4
            md:max-h-64"
        />

        <p className="sm:text-right">
          Created a website to keep track of the projects I've been working on.
          Built with Rust and Rocket. Caddy used for HTTPS and serving static
          files. Used a HTML5 UP template for the index page.
        </p>

        <p className="sm:text-right">
          Things got fairly out of hand quite quickly. I used Docker compose to
          run the website and the backend, and implemented a route that would
          restart the server if GitHub was updated, using push webhooks.
        </p>

        <FancyLinks
          className="text-right"
          links={[
            {
              text: 'GitHub',
              to: 'https://github.com/trolleyman/trolleyman.org',
              external: true,
            },
          ]}
        />
      </div>
    </>
  );
}
