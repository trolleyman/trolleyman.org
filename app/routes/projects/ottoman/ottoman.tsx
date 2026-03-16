import { CONTENT_WIDTH_CLASSES } from '..';
import FancyLinks from '~/components/FancyLinks';
import Figure from '~/components/Figure';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';

// @ts-ignore
import screenshotImg from './screenshot.png?as=picture&format=webp;avif;png&w=300;500;700;1000;1500;';
import logoUrl from './logo.webp?url';

export default function OttomanProject() {
  return (
    <>
      <PageTitle className="text-3xl md:text-3xl lg:text-4xl">
        <span className="flex items-center gap-3">
          <img src={logoUrl} alt="" className="h-10" />
          Ottoman
        </span>
      </PageTitle>

      <div
        className={cn(
          'space-y-4 leading-relaxed text-gray-700 dark:text-gray-300',
          CONTENT_WIDTH_CLASSES,
        )}
      >
        <Figure
          src={screenshotImg}
          alt="Ottoman web interface showing display layouts and monitor management"
          caption="Ottoman's web interface - manage display layouts and monitors"
          className="float-right mb-2 ml-4 w-full sm:max-w-lg"
        />

        <p className='text-right'>
          Ottoman is a home orchestrator for managing a desktop PC from a
          Raspberry Pi Zero 2 W. It ships as a single binary with two modes: a{' '}
          <em>controller</em> that runs on the Pi and an <em>agent</em> that runs on
          the desktop.
        </p>

        <p className='text-right'>
          The controller exposes an HTTP API and web UI, proxying requests through
          to the desktop agent. Features include Wake-on-LAN (to power on the
          desktop remotely), display layout management (save, list, apply, and
          alias monitor configurations), and a real-time trackpad to control the
          mouse from any browser.
        </p>

        <p className='text-right'>
          Display management is platform-aware - it uses xrandr on Linux and the
          Windows API on Windows, with the same CLI and web interface on both.
          The client auto-starts via systemd on Linux or a startup script on
          Windows.
        </p>

        <FancyLinks
          className="text-right"
          links={[
            {
              text: 'GitHub',
              to: 'https://github.com/trolleyman/ottoman',
              external: true,
            },
          ]}
        />
      </div>
    </>
  );
}
