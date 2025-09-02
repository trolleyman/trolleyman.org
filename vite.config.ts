import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { imagetools, resolveConfigs } from 'vite-imagetools'

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    imagetools({
      resolveConfigs: (entries, outputFormats) => {
        const trolleyman_config = entries.find(([key]) => key === "trolleyman")
        console.log('entries', entries)
        console.log('outputFormats', outputFormats)
        if (trolleyman_config) {
          var resolved = resolveConfigs([['w', ['500', '900', '1200']], ['format', ['avif', 'webp', 'jpg']], ['as', ['meta']]], outputFormats)
          console.log('resolvedb', resolved)
          return resolved
        }
        var resolved = resolveConfigs(entries, outputFormats)
        console.log('resolveda', resolved)
        return resolved
      }
    }),
  ],
});
