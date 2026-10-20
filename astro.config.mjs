import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

const SITE_ORIGIN = "https://www.thebytelite.com";

export const DISCOVERABLE_ROUTES = [
  '/',
  '/research',
  '/research/machine-cognition',
  '/research/data-representation',
  '/research/visual-and-audio',
  '/research/milestones',
  '/research/approaches-to-ai',
  '/validation',
  '/products',
  '/compatibility-app',
  '/cordel-play',
  '/founder-access',
  '/support',
  '/licensing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

function routePathOf(absoluteUrl) {
  return absoluteUrl.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
}

export default defineConfig({
  site: SITE_ORIGIN,
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (page) => DISCOVERABLE_ROUTES.includes(routePathOf(page)),
      serialize: (item) => {
        const routePath = routePathOf(item.url);
        return { ...item, url: routePath === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${routePath}` };
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true
  },
});
