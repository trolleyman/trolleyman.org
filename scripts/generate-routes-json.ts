import * as fs from "fs";
import * as path from "path";
import { pathToFileURL, fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const routesPath = path.resolve(__dirname, "../app/routes.ts");
    const routesModule = await import(pathToFileURL(routesPath).href);
    const routes = routesModule.default;
    const paths = routes.map((route: { id?: string; path?: string }) => {
        if (route.id === "index" || route.path === undefined) return "/";
        return route.path.startsWith("/") ? route.path : "/" + route.path;
    });
    fs.writeFileSync(path.resolve(__dirname, "../routes.json"), JSON.stringify(paths, null, 2));
}

main().catch(err => {
    console.error("Failed to generate routes.json:", err);
    process.exit(1);
});
