import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

type NestedPath = {
  index?: boolean;
  path?: string;
  children?: NestedPath[];
};

function* getAllPaths(
  routes: NestedPath[],
  prefix: string = '',
): Generator<string> {
  for (const route of routes) {
    if (route.path !== undefined) {
      yield prefix + route.path;
    } else if (route.index) {
      yield '/';
    }
    if (route.children) {
      if (route.path) {
        prefix += route.path + '/';
      }
      yield* getAllPaths(route.children, prefix);
    }
  }
}

export default {
  ssr: true,
  presets: [vercelPreset()],
  routeDiscovery: import.meta.env.PROD ? { mode: 'initial' } : undefined,
  async prerender(): Promise<string[]> {
    // TODO: For some reason in app/routes, importing SSR is false, but here it is true when running npm build
    //       This means that we miss the 404 route, so unfortunately it has to be manually added
    // console.log('importing app/routes', import.meta.env)
    let routeConfig = (await import('app/routes')).default;
    if (routeConfig instanceof Promise) {
      routeConfig = await routeConfig;
    }
    var paths = Array.from(getAllPaths(routeConfig));
    paths.push('404');
    paths = paths.filter(
      (path) =>
        !path.endsWith('.well-known/appspecific/com.chrome.devtools.json') &&
        path !== '*',
    );
    //console.log("Paths:", paths);
    return paths;
  },
} satisfies Config;
