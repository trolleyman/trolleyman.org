import type { RouteConfig } from "@react-router/dev/routes";
import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";
import type { Plugin } from "vite";

export default function extractRoutesPlugin(): Plugin {
    return {
        name: "extract-routes-plugin",
        async buildStart() {
            const routesPath = path.resolve(__dirname, "app/routes.ts");
            // Use dynamic import with file URL to load the route config
            const routesModule = await import(pathToFileURL(routesPath).href);
            var routes: RouteConfig = routesModule.default;
            if (routes instanceof Promise) {
                routes = await routes;
            }
            // Extract paths from the route config
            const paths = routes.map((route) => {
                // For index routes, use "/"; for others, derive from filename
                if (route.path === undefined) return "/";
                return route.path.startsWith("/") ? route.path : "/" + route.path;
            });
            fs.writeFileSync(path.resolve(__dirname, "prerender-routes.json"), JSON.stringify(paths, null, 2));
        }
    };
}
