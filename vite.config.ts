import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import netlifyPlugin from "@netlify/vite-plugin-react-router";

export default defineConfig(({ isSsrBuild }) => {
  return {
    plugins: [
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
      netlifyPlugin(),
    ],
    rollupOptions: isSsrBuild
      ? {
        input: ['virtual:react-router/server-build', './workers/app.ts'],
      } : undefined,
    ssr: {
      resolve: {
        conditions: ['workerd', 'browser', 'node']
      },
    },
  };
});
