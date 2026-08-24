/**
 * THIS FILE DOES NOT SERVE THESE HEADERS IN PRODUCTION. Read before trusting it.
 *
 * The build is fully static: no adapter, no `output: 'server'`. Astro middleware therefore runs
 * at BUILD time, during prerendering, and the headers it sets on that build-time response are
 * discarded. What ships is plain HTML in dist/, served by the host - so the host, not this file,
 * decides what headers a visitor receives.
 *
 * Measured 2026-08-24 against both www.thebytelite.com and bytelite-website.vercel.app:
 * Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and
 * Permissions-Policy were ALL ABSENT. Only HSTS was present, and that is Vercel's own default,
 * not this file's doing.
 *
 * This file is deliberately kept as the authored record of the intended policy, and it would
 * become live if an adapter were ever added. Do not cite it as evidence that security headers
 * are operational - that claim was in CLAUDE.md for months and was false.
 *
 * To actually serve these headers on Vercel, port the policy below into a `headers` block in
 * vercel.json. That is a real behaviour change with real breakage risk (the CSP has never been
 * enforced against the live site), and it cannot be validated locally because the E2E suite runs
 * against `astro preview`, which does not read vercel.json at all. Deploy it to a preview URL
 * and check every public page with the console open first.
 *
 * Tracked as Blocker 2 in OWNER_README.md section 17.
 */

import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();

  // Add security headers to all responses
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https://www.google-analytics.com https://api.thebytelite.com; " +
      "connect-src 'self' https://www.google-analytics.com https://api.thebytelite.com; " +
      "frame-ancestors 'none';"
  );

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Only add HSTS in production
  if (import.meta.env.PROD) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
});
