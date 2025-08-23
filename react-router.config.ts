import type { Config } from "@react-router/dev/config";
import prerenderRoutes from "./prerender-routes.json";

export default {
  ssr: true,
  async prerender() {
    return prerenderRoutes;
  }
} satisfies Config;
