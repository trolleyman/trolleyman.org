import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import generateRoutesJsonPlugin from "./scripts/generateRoutesJsonPlugin";

export default defineConfig({
  plugins: [
    generateRoutesJsonPlugin(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
