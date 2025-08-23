import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

const isDebug = process.env.DEBUG === "true";

export default flatRoutes({
    ignoredRouteFiles: isDebug
        ? []
        : ["[.]well-known.appspecific.[com.chrome.devtools.json].tsx"]
}) satisfies RouteConfig;
