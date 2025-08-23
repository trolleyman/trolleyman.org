import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import extractRoutesPlugin from "./extractRoutesPlugin";

export default defineConfig({
  plugins: [
    extractRoutesPlugin(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
