import type { Route } from "./+types/[.]well-known.appspecific.[com.chrome.devtools.json]";
import path from "path";

export const loader = async ({}: Route.LoaderArgs) => {
    const projectRoot = path.resolve()
    const jsonData = {
       workspace: {
           root: projectRoot,
           uuid: '2aaf5ce7-42d5-41b9-9ef3-2e3c413f915a',
       }
    };
    return Response.json(jsonData);
};
