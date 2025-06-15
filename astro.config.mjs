import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://thebytelite.com',
  integrations: [
    mdx(),
    sitemap(),
    tailwind()
  ],
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    optimizeDeps: {
      exclude: ['@astrojs/tailwind']
    }
  }
});
