import { index as routerIndex, layout as routerLayout, route as routerRoute, prefix as routerPrefix, type RouteConfig, type RouteConfigEntry } from "@react-router/dev/routes";

type WithPropertyType<T extends object, K extends keyof any, PropertyType> = Omit<T, K> & { [Key in K]: PropertyType }
type WithChildren<T extends object, Children> = WithPropertyType<T, 'children', Children>
type WithPath<T extends object, Path> = WithPropertyType<T, 'path', Path>
type WithIndex<T extends object, Index> = WithPropertyType<T, 'index', Index>
type WithPathChildren<T extends object, Path, Children> = WithChildren<WithPath<T, Path>, Children>

//declare function index(file: string, options?: CreateIndexOptions): RouteConfigEntry;
type CreateIndexOptions = Parameters<typeof routerIndex>[1]
function index(file: string, options?: CreateIndexOptions): WithPath<WithIndex<RouteConfigEntry, true>, undefined> {
    return routerIndex(file, options) as any
}

// declare function layout(file: string, children?: RouteConfigEntry[]): RouteConfigEntry;
// declare function layout(file: string, options: CreateLayoutOptions, children?: RouteConfigEntry[]): RouteConfigEntry;
type CreateLayoutOptions = Parameters<typeof routerLayout>[1]
function layout<Children extends RouteConfigEntry[]>(file: string, children?: Children): WithChildren<RouteConfigEntry, Children>;
function layout<Children extends RouteConfigEntry[]>(file: string, options: CreateLayoutOptions, children?: Children): WithChildren<RouteConfigEntry, Children>;
function layout<Children extends RouteConfigEntry[]>(file: string, childrenOrOptions?: Children | CreateLayoutOptions, children?: Children): WithChildren<RouteConfigEntry, Children> {
    if (childrenOrOptions instanceof Array || typeof childrenOrOptions === "undefined") {
        return routerLayout(file, childrenOrOptions) as any
    } else {
        return routerLayout(file, childrenOrOptions, children) as any
    }
}

type ApplyPathPrefix<T extends { path?: string }, Prefix extends string> = { path: T['path'] extends string ? `${Prefix}${T['path']}` : undefined }
type ApplyAllPathPrefix<T extends { path?: string }[], Prefix extends string> = {
    [Index in keyof T]: ApplyPathPrefix<T[Index], Prefix>
}

// const x = [{ path: 'abc' }, { path: 'def/ghi' }, { path: undefined }] as const satisfies { path?: string }[]
// type X = typeof x
// type Y0 = ApplyPathPrefix<X[0], 'prefix/'>
// type Y1 = ApplyPathPrefix<X[1], 'prefix/'>
// type Y2 = ApplyPathPrefix<X[2], 'prefix/'>
// type Y = ApplyAllPathPrefix<X, 'prefix/'>

// declare function prefix(prefixPath: string, routes: RouteConfigEntry[]): RouteConfigEntry[];
function prefix<PrefixPath extends string, Routes extends RouteConfigEntry[]>(prefixPath: PrefixPath, routes: Routes): ApplyAllPathPrefix<Routes, PrefixPath> {
    return routerPrefix(prefixPath, routes) as any
}

// declare function route(path: string | null | undefined, file: string, children?: RouteConfigEntry[]): RouteConfigEntry;
// declare function route(path: string | null | undefined, file: string, options: CreateRouteOptions, children?: RouteConfigEntry[]): RouteConfigEntry;
type CreateRouteOptions = Parameters<typeof routerRoute>[2]
function route<Path extends string | null | undefined, Children extends RouteConfigEntry[]>(path: Path, file: string, children?: Children): WithPathChildren<RouteConfigEntry, Path, Children>;
function route<Path extends string | null | undefined, Children extends RouteConfigEntry[]>(path: Path, file: string, options: CreateRouteOptions, children?: Children): WithPathChildren<RouteConfigEntry, Path, Children>;
function route<Path extends string | null | undefined, Children extends RouteConfigEntry[]>(path: Path, file: string, childrenOrOptions?: CreateRouteOptions | Children, children?: RouteConfigEntry[]): WithPathChildren<RouteConfigEntry, Path, Children> {
    if (childrenOrOptions instanceof Array || typeof childrenOrOptions === "undefined") {
        return routerRoute(path, file, childrenOrOptions) as any
    } else {
        return routerRoute(path, file, childrenOrOptions, children) as any
    }
}

export const staticRoutesList = [
    layout('./layouts/MainLayout.tsx', [
        index("./routes/index.tsx"),
        route("blog", "./routes/blog.tsx"),
        route("projects", "./routes/projects.tsx"),
        route("404", "./routes/error_404.tsx"),
    ]),
    route(".well-known/appspecific/com.chrome.devtools.json", "./routes/.well-known.appspecific.com.chrome.devtools.json.tsx"),
] as const satisfies RouteConfigEntry[]
// console.log(JSON.stringify(staticRoutesList, null, '  '))

// type X = ExpandRecursively<typeof staticRoutesList>

/*
function routesToMap<T extends readonly RouteConfigEntry[]>(routes: T): any {
    const result: Record<string, string> = {};

    for (const route of routes) {
        if (route.children) {
            // Layout with nested routes
            const nestedRoutes = routesToMap(route.children);
            for (const [nestedPath, nestedFile] of Object.entries(nestedRoutes)) {
                // For index routes, use the layout path, otherwise combine paths
                const fullPath = nestedPath === '/' ? (route.path || '/') : `${route.path || ''}/${nestedPath}`.replace(/\/+/g, '/');
                result[fullPath] = nestedFile;
            }
        } else {
            // Direct route
            const path = route.index ? '/' : (route.path || '/');
            result[path] = route.file;
        }
    }

    return result;
}*/

// export const staticRoutes = routesToMap(staticRoutesList)

export default staticRoutesList satisfies RouteConfig;
