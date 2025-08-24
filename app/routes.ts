import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    index("./routes/index.tsx"),
    route(".well-known/appspecific/com.chrome.devtools.json", "./routes/.well-known.appspecific.com.chrome.devtools.json.tsx"),
    route("home", "./routes/home.tsx"),
    route("old-index", "./routes/old-index.tsx"),
    route("new-index", "./routes/new-index.tsx"),
] satisfies RouteConfig;
