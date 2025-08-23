import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    index("./routes/index.tsx"),
    route(".well-known/appspecific/com.chrome.devtools.json", "./routes/.well-known.appspecific.com.chrome.devtools.json.tsx"),
] satisfies RouteConfig;
