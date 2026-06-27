// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://sjoerdkoelewijn.com',
  integrations: [react()],
  image: {
    // allow build-time optimization of Strapi media (local dev http + any https host e.g. Strapi Cloud)
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https' },
    ],
  },
});
