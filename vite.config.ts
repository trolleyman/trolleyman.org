import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: ["@fortawesome/react-fontawesome"], // TODO: Remove when https://github.com/FortAwesome/react-fontawesome/issues/589 is fixed
  },
});
