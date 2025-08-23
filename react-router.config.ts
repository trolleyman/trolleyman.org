import type { Config } from "@react-router/dev/config";
import routes from "./routes.json";

export default {
  ssr: true,
  async prerender() {
    return routes;
  }
} satisfies Config;
