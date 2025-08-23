import type { RouteConfig } from "@react-router/dev/routes";
import * as fs from "fs";
import * as path from "path";
import { pathToFileURL, fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ignorePaths = [
  ".well-known/appspecific/com.chrome.devtools.json"
]

export async function generateRoutesJson(outDir: string) {
  globalThis.__reactRouterAppDirectory = path.resolve(outDir, "app");
  const routesPath = path.resolve(globalThis.__reactRouterAppDirectory, "routes.ts");
  const routesModule = await import(pathToFileURL(routesPath).href);
  var routes: RouteConfig = routesModule.default;
  if (routes instanceof Promise) {
    routes = await routes;
  }
  const paths = routes.filter((route) => route.path === undefined || !ignorePaths.includes(route.path)).map((route: { id?: string; path?: string }) => {
    if (route.id === "index" || route.path === undefined) return "/";
    return route.path.startsWith("/") ? route.path : "/" + route.path;
  });
  fs.writeFileSync(path.resolve(outDir, "routes.json"), JSON.stringify(paths, null, 2));
}

export default function generateRoutesJsonPlugin() {
  return {
    name: "generate-routes-json-plugin",
    async buildStart() {
      await generateRoutesJson(path.resolve(__dirname, ".."));
    }
  };
}
