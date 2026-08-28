/**
 * HTTP 410 Gone for retired content that has no successor.
 *
 * Why this exists as a function rather than a line in `vercel.json`: `redirects` can only emit
 * 3xx, and the legacy `routes` array - the only part of the config that accepts `"status": 410` -
 * cannot coexist with `headers`/`redirects`/`rewrites`. Using it would silently drop all seven
 * security headers to gain one status code. A rewrite onto this function keeps the headers and
 * still returns the correct status.
 *
 * 410 rather than 404 is the point: 404 means "not found, try again later", and search engines
 * re-crawl it for months. 410 means "this is gone deliberately", and it is dropped from the index
 * far faster. These pages named retired systems, so getting them out of the index is the job.
 *
 * The body names nothing. A 410 that recites the retired product it replaced would republish the
 * exact vocabulary the retirement was meant to remove.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

const BODY = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Page removed</title>
<style>
:root{color-scheme:dark}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
background:#080b14;color:#e4e7f2;font:16px/1.7 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:2rem}
main{max-width:34rem}
h1{font-size:1.5rem;margin:0 0 1rem}
p{color:#a0a8c0;margin:0 0 1rem}
a{color:#818cf8}
</style>
</head>
<body>
<main>
<h1>This page has been removed.</h1>
<p>It described work that is no longer part of what ByteLite LLC publishes, so it was taken down
rather than left up to go stale. There is no direct replacement for it.</p>
<p><a href="/">Go to the ByteLite home page</a></p>
</main>
</body>
</html>`;

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  res.statusCode = 410;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');
  // Let caches hold the 410 briefly, but never so long that restoring a URL becomes hard.
  res.setHeader('Cache-Control', 'public, max-age=300');
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end(BODY);
}
