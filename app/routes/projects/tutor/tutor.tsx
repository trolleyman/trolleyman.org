import { CONTENT_WIDTH_CLASSES } from '..';
import BodyLink from '~/components/BodyLink';
import FancyLinks from '~/components/FancyLinks';
import Figure from '~/components/Figure';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';

// @ts-ignore
import screenshotImg from './screenshot.png?as=picture&format=webp;avif;png&w=300;500;700;1000;1500;';

export default function TutorProject() {
  return (
    <>
      <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Tutoring Website</PageTitle>

      <div
        className={cn(
          'space-y-4 leading-relaxed text-gray-700 dark:text-gray-300',
          CONTENT_WIDTH_CLASSES,
        )}
      >
        <Figure
          src={screenshotImg}
          alt="Elizabeth Campbell tutoring website"
          caption="elizabethmcampbell.co.uk"
          className="float-right mb-2 ml-4 w-full sm:max-w-sm"
        />

        <p className='text-right'>
          A tutoring website built for{' '}
          <BodyLink to="https://elizabethmcampbell.co.uk" external>
            elizabethmcampbell.co.uk
          </BodyLink>
          .
        </p>

        <p className='text-right'>
          The site is a static TypeScript + React site built with Bun + Vite, designed to be
          clean and professional - covering background, subjects, pricing,
          and contact details.
        </p>

        <FancyLinks
          className="text-right"
          links={[
            {
              text: 'GitHub',
              to: 'https://github.com/trolleyman/tutor',
              external: true,
            },
            {
              text: 'Website',
              to: 'https://elizabethmcampbell.co.uk',
              external: true,
            },
          ]}
        />
      </div>
    </>
  );
}
