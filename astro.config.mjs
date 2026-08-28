import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://www.thebytelite.com",
  integrations: [
    tailwind(),
    sitemap({
      // The sitemap is an explicit ALLOWLIST, not a denylist. Adding a file under src/pages can
      // therefore never put a page into search discovery by accident - it has to be named here.
      //
      // Rebuild 2026-08-26: the retired route families (architecture, research, progress,
      // technologies, company, preorder, products, marketing) are no longer merely absent from
      // this list - their source files are deleted. They now 301 to a real successor or return
      // 410 Gone from api/gone.ts. See vercel.json.
      //
      // Deliberately absent from discovery while still resolving: /checkout/success,
      // /checkout/cancel and /billing. They are transactional endpoints of a flow, not
      // destinations, and a search result landing on a bare success page would be meaningless.
      filter: (page) => {
        // `page` is an absolute URL string; take everything from the origin's
        // trailing slash onward and normalise away the trailing slash.
        const path = page.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
        return [
          '/',
          '/how-it-works',
          '/validation',
          '/licensing',
          '/about',
          '/contact',
          '/founder-access',
          '/support',
          '/cordel-connect',
          '/cordel-play',
          '/privacy',
          '/terms',
          '/preorder-terms',
          '/supporter-terms',
        ].includes(path);
      },
    }),
    react()
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
  server: {
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com https://api.thebytelite.com; connect-src 'self' https://www.google-analytics.com https://api.thebytelite.com",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
    }
  }
});
