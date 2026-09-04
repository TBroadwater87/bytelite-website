/**
 * The local stand-in for "the site, with its functions attached".
 *
 * WHY THIS EXISTS
 * `tests/live/deep-kore-live.spec.ts` and `deep-kore-tav-and-consent.spec.ts` need a
 * server that answers BOTH halves of what a visitor touches: the built `/deep-kore` page,
 * and the real `/api/deep-kore/*` handlers. In production Vercel does both. `astro
 * preview` serves only the first, so the live specs had nothing to run against locally
 * and the whole live lane was unreachable without a deployment.
 *
 * WHAT IT IS NOT
 * It is not a second architecture and it is not a mock. It loads the SAME handler modules
 * `api/deep-kore/*.ts` that Vercel loads, gives them a real Node request and response,
 * and reads configuration from the same environment-variable names. Nothing about the
 * request path, the cookie rules, the CSRF check or the origin call is different here -
 * if any of that were reimplemented, a pass would prove nothing about production.
 *
 * It is deliberately NOT wired into `playwright.live.config.ts` as a `webServer`. The
 * stack a live run needs spans two processes in another repository; starting one of them
 * automatically would make it easy to run this suite against a gateway that is not there
 * and read the resulting failures as product defects. See OWNER_README section 21.8a.
 *
 * Usage (PowerShell):
 *
 *   npm run build
 *   $env:DEEP_KORE_CHAT_PHASE       = "private_alpha"
 *   $env:DEEP_KORE_ORIGIN_URL       = "http://127.0.0.1:<gateway port>"
 *   $env:DEEP_KORE_GATEWAY_TOKEN    = "<the gateway's token>"
 *   $env:DEEP_KORE_SESSION_SECRET   = "<32+ random bytes, generated for this>"
 *   $env:DEEP_KORE_ACCESS_CLIENT_ID = "local"        # Access is not in front of loopback
 *   $env:DEEP_KORE_ACCESS_CLIENT_SECRET = "local"    # the gateway ignores both headers
 *   node scripts/deep-kore-live-harness.mjs
 *
 * The Access values are required by `missingConfig`, which is correct: the route must
 * refuse to run without them in production. Loopback has no Access in front of it, so
 * they are placeholders here and the gateway ignores the headers they produce. That is
 * the ONLY difference between this harness and production, and it is a difference in the
 * environment rather than in any code path.
 */

import { createServer as createHttpServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createServer as createViteServer } from 'vite';

const ROOT = resolve(process.cwd());
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.DEEP_KORE_HARNESS_PORT ?? 4399);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

/**
 * The four handlers, by path. The list is closed here for the same reason it is closed
 * in the canon: this harness must never be able to expose a route production does not.
 */
const API_ROUTES = new Map([
  ['/api/deep-kore/session', 'api/deep-kore/session.ts'],
  ['/api/deep-kore/message', 'api/deep-kore/message.ts'],
  ['/api/deep-kore/consent', 'api/deep-kore/consent.ts'],
]);

const RESULT_PREFIX = '/api/deep-kore/result/';
const RESULT_MODULE = 'api/deep-kore/result/[jobId].ts';

async function resolveStatic(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/index.html';
  const candidates =
    extname(clean) === ''
      ? [join(DIST, clean, 'index.html'), join(DIST, `${clean}.html`)]
      : [join(DIST, clean)];

  for (const candidate of candidates) {
    // Never serve outside dist, whatever the request path claims.
    if (!candidate.startsWith(DIST)) continue;
    try {
      const s = await stat(candidate);
      if (s.isFile()) return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

async function main() {
  const vite = await createViteServer({
    root: ROOT,
    appType: 'custom',
    server: { middlewareMode: true },
    logLevel: 'warn',
  });

  const server = createHttpServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
    const pathname = url.pathname;

    try {
      const modulePath = API_ROUTES.get(pathname)
        ? API_ROUTES.get(pathname)
        : pathname.startsWith(RESULT_PREFIX)
          ? RESULT_MODULE
          : null;

      if (modulePath) {
        // The REAL handler module, loaded from source exactly as the unit tests load it.
        const mod = await vite.ssrLoadModule(`/${modulePath}`);
        await mod.default(req, res);
        return;
      }

      const file = await resolveStatic(pathname);
      if (!file) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('not found');
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
      res.end(await readFile(file));
    } catch (err) {
      // Type only. A thrown error on this path can carry a request that carries a
      // credential, and this harness observes the same logging rule the routes do.
      console.error('[dk-harness] request failed:', err?.name ?? 'Error');
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end('{"error_code":"origin_error"}');
      }
    }
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[dk-harness] serving dist + api/deep-kore on http://127.0.0.1:${PORT}`);
    // Names, never values. The same rule the routes follow.
    const names = [
      'DEEP_KORE_CHAT_PHASE',
      'DEEP_KORE_ORIGIN_URL',
      'DEEP_KORE_GATEWAY_TOKEN',
      'DEEP_KORE_SESSION_SECRET',
      'DEEP_KORE_ACCESS_CLIENT_ID',
      'DEEP_KORE_ACCESS_CLIENT_SECRET',
    ];
    for (const n of names) {
      console.log(`[dk-harness] ${n}: ${process.env[n] ? 'set' : 'NOT SET'}`);
    }
  });
}

main().catch((err) => {
  console.error('[dk-harness] failed to start:', err?.name ?? 'Error');
  process.exitCode = 1;
});
