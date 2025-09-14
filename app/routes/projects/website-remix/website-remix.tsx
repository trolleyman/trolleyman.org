import { CONTENT_WIDTH_CLASSES } from '..';
import BodyLink from '~/components/BodyLink';
import FancyLinks from '~/components/FancyLinks';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';

export default function WebsiteProject() {
  return (
    <>
      <PageTitle className="text-3xl md:text-3xl lg:text-4xl">
        trolleyman.org
      </PageTitle>

      <div
        className={cn(
          'space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed',
          CONTENT_WIDTH_CLASSES,
        )}
      >
        {/* TODO: Screenshot */}
        <p>
          Created a website to keep track of the projects I've been working on.
          This is a rewrite of the{' '}
          <BodyLink to="/projects/website">original website</BodyLink> using
          React Router v7 (formerly Remix).
        </p>

        <p>
          The website is hosted by Vercel at{' '}
          <BodyLink to="https://trolleyman-org-remix.vercel.app">
            trolleyman-org-remix.vercel.app
          </BodyLink>
          , with a custom domain at{' '}
          <BodyLink to="https://trolleyman.org">trolleyman.org</BodyLink>.
        </p>

        <p>
          This was a fun project to learn about React Router - I had some
          experience with Remix, but hadn't tried the update. It was also a good
          opportunity to learn about Tailwind CSS and Vite. Tried hosting on
          Netlify, but it was a bit of a pain to get working with React Router.
          It may have been because it was quite new.
        </p>

        <p>
          Looked at a few different ways to build the new website. I wanted to
          have free hosting, so I ideally wanted to have SSR, so that GitHub
          Pages was a good option. I had some experience with Next.js, but I
          wanted to try Remix again, mainly due to{' '}
          <BodyLink to="https://remix.run/blog/remix-vs-next">
            this blog post
          </BodyLink>{' '}
          by Ryan Florence.
        </p>

        <FancyLinks
          className="text-left"
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
