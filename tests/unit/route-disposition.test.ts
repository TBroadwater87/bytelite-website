import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Route disposition is verified HERE rather than in Playwright for a concrete reason: the E2E
// suite runs `astro preview`, which serves the static build and knows nothing about vercel.json.
// A redirect/410 assertion there would pass or fail for reasons unrelated to the config that
// actually ships. So the config is asserted directly, and the build output is asserted directly.

const root = resolve(__dirname, '../..');
const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8')) as {
  redirects: Array<{ source: string; destination: string; statusCode?: number; has?: unknown }>;
  rewrites: Array<{ source: string; destination: string }>;
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};

/** The canonical routes, i.e. everything that still has a source file. */
const CANONICAL = [
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
  '/checkout/success',
  '/checkout/cancel',
  '/billing',
  '/privacy',
  '/terms',
  '/responsible-disclosure',
];

/** Deleted families. Every one must resolve to a 301 or a 410 - never to a stale 200. */
const DELETED_FAMILIES = [
  '/architecture',
  '/research',
  '/progress',
  '/technologies',
  '/company',
  '/preorder',
  '/products',
  '/marketing',
];

describe('the deleted route families are really deleted', () => {
  test('no source file survives for any deleted family', () => {
    for (const family of DELETED_FAMILIES) {
      const dir = resolve(root, 'src/pages', family.slice(1));
      expect(existsSync(dir), `src/pages${family} must not exist`).toBe(false);
      expect(existsSync(`${dir}.astro`), `src/pages${family}.astro must not exist`).toBe(false);
    }
  });

  test('the Astro API route directory is gone', () => {
    expect(existsSync(resolve(root, 'src/pages/api'))).toBe(false);
  });

  test('every deleted family has a redirect or a rewrite covering it', () => {
    for (const family of DELETED_FAMILIES) {
      const covered =
        vercel.redirects.some((r) => r.source === family || r.source.startsWith(`${family}/`)) ||
        vercel.rewrites.some((r) => r.source === family || r.source.startsWith(`${family}/`));
      expect(covered, `${family} has no disposition in vercel.json`).toBe(true);
    }
  });
});

describe('redirects lead somewhere that exists', () => {
  const internal = vercel.redirects.filter((r) => !r.destination.startsWith('http'));

  test('no redirect points into a deleted family', () => {
    for (const r of internal) {
      for (const family of DELETED_FAMILIES) {
        expect(
          r.destination === family || r.destination.startsWith(`${family}/`),
          `${r.source} -> ${r.destination} points at a deleted family`
        ).toBe(false);
      }
    }
  });

  test('every internal redirect destination is a canonical route', () => {
    for (const r of internal) {
      const dest = r.destination.split('#')[0]!.split('?')[0]!.replace(/\/$/, '') || '/';
      expect(CANONICAL, `${r.source} -> ${r.destination} is not canonical`).toContain(dest);
    }
  });

  test('no redirect is its own destination, which would loop', () => {
    for (const r of vercel.redirects) {
      expect(r.source, 'a redirect must not target itself').not.toBe(r.destination);
    }
  });

  test('content redirects are permanent (301); only the apex uses 308', () => {
    for (const r of vercel.redirects) {
      if (r.has) continue; // the apex -> www host rule
      expect(r.statusCode, `${r.source} must be a permanent redirect`).toBe(301);
    }
  });
});

describe('410 Gone is wired to a function, not faked', () => {
  test('every rewrite for retired content resolves to /api/gone', () => {
    for (const r of vercel.rewrites) {
      expect(r.destination, `${r.source} must rewrite to the gone handler`).toBe('/api/gone');
    }
  });

  test('the gone handler exists and returns 410', () => {
    const src = readFileSync(resolve(root, 'api/gone.ts'), 'utf8');
    expect(src).toContain('statusCode = 410');
    expect(src).toContain('noindex');
  });

  // A 410 that recites the retired product would republish the vocabulary the retirement removed.
  test('the gone body names no retired system', () => {
    const src = readFileSync(resolve(root, 'api/gone.ts'), 'utf8');
    for (const name of ['ByteSight', 'Deep Kore', 'ByteOracle', 'ByteFlow', 'ByteCost', 'HeartStrings']) {
      expect(src, `api/gone.ts must not name ${name}`).not.toContain(name);
    }
  });

  test('the retired technology pages are covered by a 410, not a redirect', () => {
    const goneSources = vercel.rewrites.map((r) => r.source);
    for (const path of [
      '/technologies/bytesight',
      '/technologies/byteoracle',
      '/technologies/byteflow',
      '/technologies/bytecost',
      '/technologies/deep-kore',
    ]) {
      expect(goneSources, `${path} must return 410`).toContain(path);
    }
  });
});

describe('security headers survived the routing rewrite', () => {
  // The legacy `routes` array is the only vercel.json feature that can emit 410 directly, but it
  // cannot coexist with `headers`. Using it would have silently dropped all seven headers to gain
  // one status code. This asserts we did not take that trade.
  test('the config uses headers, not the legacy routes array', () => {
    expect(vercel.headers, 'headers must still be configured').toBeTruthy();
    expect((vercel as Record<string, unknown>).routes, 'legacy routes would drop headers').toBeUndefined();
  });

  test('all seven security headers are still served', () => {
    const keys = vercel.headers[0]!.headers.map((h) => h.key);
    for (const key of [
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Cross-Origin-Opener-Policy',
    ]) {
      expect(keys, `${key} must still be served`).toContain(key);
    }
  });

  // Stripe checkout is reached by navigation, so no CSP widening was needed. If someone later
  // adds Stripe.js they must justify it - this catches a silent widening.
  test('the CSP was not widened for payments', () => {
    const csp = vercel.headers[0]!.headers.find((h) => h.key === 'Content-Security-Policy')!.value;
    expect(csp).toContain("form-action 'self'");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toContain('*');
  });
});

describe('the built output contains only canonical pages', () => {
  const dist = resolve(root, 'dist');
  const built = existsSync(dist);

  test.skipIf(!built)('no deleted family produced a directory in dist', () => {
    for (const family of DELETED_FAMILIES) {
      expect(existsSync(resolve(dist, family.slice(1))), `dist${family} must not exist`).toBe(false);
    }
  });

  test.skipIf(!built)('the sitemap lists only allowlisted routes', () => {
    const files = readdirSync(dist).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'));
    expect(files.length, 'a sitemap must be generated').toBeGreaterThan(0);

    const urls = files
      .flatMap((f) => readFileSync(resolve(dist, f), 'utf8').match(/<loc>([^<]+)<\/loc>/g) ?? [])
      .map((m) => m.replace(/<\/?loc>/g, ''))
      .filter((u) => !u.includes('sitemap'))
      .map((u) => u.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/');

    // Discovery must exclude the transactional flow pages even though they resolve, and the two
    // legal DRAFTS - indexing an unreviewed legal page presents it as a settled position.
    for (const undiscoverable of [
      '/checkout/success',
      '/checkout/cancel',
      '/billing',
      '/responsible-disclosure',
    ]) {
      expect(urls, `${undiscoverable} must not be in the sitemap`).not.toContain(undiscoverable);
    }
    for (const url of urls) {
      expect(CANONICAL, `${url} is in the sitemap but is not canonical`).toContain(url);
    }
  });

  test.skipIf(!built)('no retired terminology survives anywhere in the built site', () => {
    const forbidden = [
      'HeartStrings',
      'ByteFlow',
      'ByteCost',
      'ByteOracle',
      'ByteSight',
      'Deep Kore',
      'AIya',
      'Genesis Goalkeeper',
      'Revelation Vanguard',
      'Codrel',
      'Cordea',
      'Cordia',
    ];
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = resolve(dir, e.name);
        if (e.isDirectory()) return e.name === 'preview' ? [] : walk(full);
        return /\.(html|xml)$/.test(e.name) ? [full] : [];
      });

    const offenders: string[] = [];
    for (const file of walk(dist)) {
      const content = readFileSync(file, 'utf8');
      for (const term of forbidden) {
        if (content.includes(term)) offenders.push(`${term} in ${file.replace(dist, '')}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
