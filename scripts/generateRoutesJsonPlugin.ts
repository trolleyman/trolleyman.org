import * as fs from "fs";
import * as path from "path";
import { pathToFileURL, fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateRoutesJson(outDir: string) {
  const routesPath = path.resolve(outDir, "app/routes.ts");
  const routesModule = await import(pathToFileURL(routesPath).href);
  const routes = routesModule.default;
  const paths = routes.map((route: { id?: string; path?: string }) => {
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
