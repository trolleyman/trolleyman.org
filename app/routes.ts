import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
    layout('./layouts/MainLayout.tsx', [
        index("./routes/index.tsx"),
        route("blog", "./routes/blog.tsx"),
        route("projects", "./routes/projects.tsx"),
    ]),
    route(".well-known/appspecific/com.chrome.devtools.json", "./routes/.well-known.appspecific.com.chrome.devtools.json.tsx"),
] satisfies RouteConfig;
