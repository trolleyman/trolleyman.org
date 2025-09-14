import type { Config } from '@react-router/dev/config';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import { vercelPreset } from '@vercel/react-router/vite';

function* getAllPaths(
  routes: RouteConfigEntry[],
  prefix: string = '',
): Generator<[string, RouteConfigEntry]> {
  for (const route of routes) {
    if (route.path !== undefined) {
      yield [prefix + route.path, route];
    } else if (route.index) {
      yield ['/', route];
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
    const getRouteConfig = (await import('app/routes')).getRouteConfig;
    // We have to pass ssr: true here because when importing app/routes, import.meta.env.SSR is false, even though it is true here
    let routeConfig = getRouteConfig({ ssr: true });
    if (routeConfig instanceof Promise) {
      routeConfig = await routeConfig;
    }
    var paths: string[] = [];
    for (const [path, route] of getAllPaths(routeConfig)) {
      if (route.path === '*') {
        continue;
      }
      paths.push(path);
    }
    return paths;
  },
} satisfies Config;
