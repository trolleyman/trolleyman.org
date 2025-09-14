import {
  layout,
  route,
  index,
  type RouteConfigEntry,
  type RouteConfig,
} from '@react-router/dev/routes';

// import { index as routerIndex, layout as routerLayout, route as routerRoute, prefix as routerPrefix, type RouteConfig, type RouteConfigEntry } from "@react-router/dev/routes";

// type WithPropertyType<T extends object, K extends keyof any, PropertyType> = Omit<T, K> & { [Key in K]: PropertyType }
// type WithChildren<T extends object, Children> = WithPropertyType<T, 'children', Children>
// type WithPath<T extends object, Path> = WithPropertyType<T, 'path', Path>
// type WithIndex<T extends object, Index> = WithPropertyType<T, 'index', Index>
// type WithPathChildren<T extends object, Path, Children> = WithChildren<WithPath<T, Path>, Children>

// type CreateIndexOptions = Parameters<typeof routerIndex>[1]
// function index(file: string, options?: CreateIndexOptions): WithPath<WithIndex<RouteConfigEntry, true>, undefined> {
//     return routerIndex(file, options) as any
// }

// type CreateLayoutOptions = Parameters<typeof routerLayout>[1]
// function layout<Children extends RouteConfigEntry[]>(file: string, children?: Children): WithChildren<RouteConfigEntry, Children>;
// function layout<Children extends RouteConfigEntry[]>(file: string, options: CreateLayoutOptions, children?: Children): WithChildren<RouteConfigEntry, Children>;
// function layout<Children extends RouteConfigEntry[]>(file: string, childrenOrOptions?: Children | CreateLayoutOptions, children?: Children): WithChildren<RouteConfigEntry, Children> {
//     if (childrenOrOptions instanceof Array || typeof childrenOrOptions === "undefined") {
//         return routerLayout(file, childrenOrOptions) as any
//     } else {
//         return routerLayout(file, childrenOrOptions, children) as any
//     }
// }

// type ApplyPathPrefix<T extends { path?: string }, Prefix extends string> = { path: T['path'] extends string ? `${Prefix}${T['path']}` : undefined }
// type ApplyAllPathPrefix<T extends { path?: string }[], Prefix extends string> = {
//     [Index in keyof T]: ApplyPathPrefix<T[Index], Prefix>
// }

// function prefix<PrefixPath extends string, Routes extends RouteConfigEntry[]>(prefixPath: PrefixPath, routes: Routes): ApplyAllPathPrefix<Routes, PrefixPath> {
//     return routerPrefix(prefixPath, routes) as any
// }

// type CreateRouteOptions = Parameters<typeof routerRoute>[2]
// function route<Path extends string | null | undefined, Children extends RouteConfigEntry[]>(path: Path, file: string, children?: Children): WithPathChildren<RouteConfigEntry, Path, Children>;
// function route<Path extends string | null | undefined, Children extends RouteConfigEntry[]>(path: Path, file: string, options: CreateRouteOptions, children?: Children): WithPathChildren<RouteConfigEntry, Path, Children>;
// function route<Path extends string | null | undefined, Children extends RouteConfigEntry[]>(path: Path, file: string, childrenOrOptions?: CreateRouteOptions | Children, children?: RouteConfigEntry[]): WithPathChildren<RouteConfigEntry, Path, Children> {
//     if (childrenOrOptions instanceof Array || typeof childrenOrOptions === "undefined") {
//         return routerRoute(path, file, childrenOrOptions) as any
//     } else {
//         return routerRoute(path, file, childrenOrOptions, children) as any
//     }
// }

type GetRouteConfigOptions = {
  ssr?: boolean;
  dev?: boolean;
};

export function getRouteConfig(options?: GetRouteConfigOptions): RouteConfig {
  let { ssr, dev } = options ?? {};
  ssr = ssr ?? import.meta.env.SSR;
  dev = dev ?? import.meta.env.DEV;
  return [
    route(
      '.well-known/appspecific/com.chrome.devtools.json',
      './routes/.well-known.appspecific.com.chrome.devtools.json.tsx',
    ),
    route(
      'projects/flappy/demo',
      './routes/projects/flappy/demo/flappy-demo.tsx',
    ),
    route(
      'projects/flappy/demo/api/leaderboard',
      './routes/projects/flappy/demo/api/leaderboard.tsx',
    ),
    route('projects/linc/demo', './routes/projects/linc/demo.tsx'),
    route('projects/linc/api/graph', './routes/projects/linc/api/graph.tsx'),
    route('projects/linc/mainpage', './routes/projects/linc/mainpage.tsx'),
    layout('./layouts/MainLayout.tsx', [
      layout('./layouts/ErrorContentLayout.tsx', [
        route(ssr ? '404' : undefined, './routes/error_404_template.tsx'),
        index('./routes/index.tsx'),
        route(dev ? 'img-test' : undefined, './routes/img-test/index.tsx'),
        route('blog', './routes/blog.tsx'),
        route('projects', './routes/projects/index.tsx'),
        route(
          'projects/website-remix',
          './routes/projects/website-remix/website-remix.tsx',
        ),
        route(
          'projects/dissertation',
          './routes/projects/dissertation/dissertation.tsx',
        ),
        route('projects/website', './routes/projects/website/website.tsx'),
        route('projects/linc', './routes/projects/linc/index.tsx'),
        route('projects/flappy', './routes/projects/flappy/index.tsx'),
        route('projects/zucchini', './routes/projects/zucchini/zucchini.tsx'),
        route('projects/robot', './routes/projects/robot/robot.tsx'),
        route('projects/k-means', './routes/projects/k-means/k-means.tsx'),
        route('projects/portal', './routes/projects/portal/portal.tsx'),
        route('*', './routes/catch-all.tsx'),
      ]),
    ]),
  ];
}

export default getRouteConfig() satisfies RouteConfig;
