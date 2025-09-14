import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
  ssr: true,
  presets: [vercelPreset()],
  routeDiscovery: import.meta.env.PROD ? { mode: 'initial' } : undefined,
  async prerender() {
    return await (await import('app/routes')).getPrerenderRoutes();
  },
} satisfies Config;
