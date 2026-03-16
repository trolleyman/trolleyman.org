import { CONTENT_WIDTH_CLASSES } from '..';
import FancyLinks from '~/components/FancyLinks';
import Figure from '~/components/Figure';
import PageTitle from '~/components/PageTitle';
import { cn } from '~/utils';

// @ts-ignore
import screenshotImg from './screenshot.png?as=picture&format=webp;avif;png&w=300;500;700;1000;1500;';
import iconUrl from './icon.png?url';

export default function HydraProject() {
  return (
    <>
      <PageTitle className="text-3xl md:text-3xl lg:text-4xl">
        <span className="flex items-center gap-3">
          <img src={iconUrl} alt="" className="h-10 rounded-xl" />
          Hydra
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
          alt="Hydra web interface showing agent management"
          caption="Hydra's web interface - spawn and monitor agents"
          className="float-right mb-2 ml-4 w-full sm:max-w-lg"
        />

        <p className='text-right'>
          Hydra is an AI agent orchestrator: you describe a task, it spawns an
          autonomous AI agent to complete it. Each agent runs in an isolated
          Docker container with its own Git worktree, so agents can work in
          parallel on the same codebase without interfering with each other.
        </p>

        <p className='text-right'>
          The project is a single binary combining a Go backend and a React
          frontend. You can interact with agents through the web UI, a TUI
          dashboard, or the CLI. The CLI supports commands like{' '}
          <code>spawn</code>, <code>list</code>, <code>attach</code>,{' '}
          <code>kill</code>, and <code>merge</code> - the last of which
          integrates a completed agent's work back into the current branch.
        </p>

        <p className='text-right'>
          Multiple AI providers are supported (Claude, Gemini, Copilot), and
          agents can be tracked by name, provider, and status in real time.
        </p>

        <FancyLinks
          className="text-left"
          links={[
            {
              text: 'GitHub',
              to: 'https://github.com/trolleyman/hydra',
              external: true,
            },
          ]}
        />
      </div>
    </>
  );
}
