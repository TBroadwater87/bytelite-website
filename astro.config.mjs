import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://www.thebytelite.com",
  integrations: [
    tailwind(),
    sitemap({
      // Public scope reset (2026-08-22): thebytelite.com is a ByteLite-only site.
      // The sitemap is an explicit allowlist rather than a denylist, so a retired
      // portfolio route can never re-enter search discovery by being added back to
      // src/pages. Retired routes still build and still resolve - they are served
      // noindex and are simply absent from every discovery surface.
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
          '/privacy',
          '/terms',
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
