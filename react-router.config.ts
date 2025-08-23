import type { Config } from "@react-router/dev/config";

type RouteJson = {
  id: string;
  path?: string;
  file: string;
  children?: RouteJson[];
};

function* getAllPaths(routes: RouteJson[], prefix: string = "/"): Generator<string> {
  for (const route of routes) {
    if (route.path !== undefined)
    {
      yield prefix + route.path;
    }
    if (route.children) {
      if (route.path) {
        prefix += route.path + "/";
      }
      yield* getAllPaths(route.children, prefix);
    }
  }
}

export default {
  ssr: true,
  async prerender(): Promise<string[]> {
    // Use npx react-router routes --json to get the routes
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);
    const { stdout } = await execAsync("npx react-router routes --json");
    var json: RouteJson[] = JSON.parse(stdout);
    // console.log("Prerendering with routes:", JSON.stringify(json, null, 2));
    var paths = Array.from(getAllPaths(json)).filter((path) => path !== "/.well-known/appspecific/com.chrome.devtools.json");
    // console.log("Paths:", paths);
    return paths;
  }
} satisfies Config;
