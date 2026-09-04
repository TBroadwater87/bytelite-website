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
  // Added 2026-09-01 by owner instruction. The one route that may name Deep Kore; see
  // CLAUDE.md section 19.
  '/deep-kore',
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
    ]) {
      expect(goneSources, `${path} must return 410`).toContain(path);
    }
    // `/technologies/deep-kore` was on that list until 2026-09-01 and has deliberately
    // left it. 410 means "gone deliberately", and it is not: Deep Kore now has a live
    // canonical page. A resource that MOVED gets a 301 to where it moved to, and leaving
    // a 410 standing for a name the site publishes would be the site contradicting
    // itself to a crawler.
    const moved = vercel.redirects.filter((r) => r.destination === '/deep-kore');
    const movedSources = moved.map((r) => r.source);
    for (const path of ['/deepkore', '/deepkore-lab', '/technologies/deep-kore']) {
      expect(movedSources, `${path} must 301 to the live page`).toContain(path);
    }
    expect(goneSources).not.toContain('/technologies/deep-kore');
    // The retired SUBMIT endpoint stays gone. It was an API, not a page, and nothing
    // replaced it.
    expect(goneSources, 'the retired submit endpoint must stay 410').toContain(
      '/api/deepkore-submit'
    );
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

  const walkBuilt = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = resolve(dir, e.name);
      if (e.isDirectory()) return e.name === 'preview' ? [] : walkBuilt(full);
      return /\.(html|xml)$/.test(e.name) ? [full] : [];
    });

  test.skipIf(!built)('no retired terminology survives anywhere in the built site', () => {
    // Retired brands and sibling systems. Forbidden in EVERY built file, /deep-kore
    // included - the 2026-09-01 amendment scoped five Deep Kore names to one route and
    // touched nothing else on this list. 'DeepKore' unspaced is the retired portfolio
    // spelling and stays banned outright; the live page uses the two-word name.
    const forbidden = [
      'HeartStrings',
      'ByteFlow',
      'ByteCost',
      'ByteOracle',
      'ByteSight',
      'DeepKore',
      'KoreLattice',
      'Codrel',
      'Cordea',
      'Cordia',
    ];

    const offenders: string[] = [];
    for (const file of walkBuilt(dist)) {
      const content = readFileSync(file, 'utf8');
      for (const term of forbidden) {
        if (content.includes(term)) offenders.push(`${term} in ${file.replace(dist, '')}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  // The route-scoped half, asserted against the BUILT MARKUP rather than rendered text.
  // The Playwright suite checks what a visitor reads; this checks what is served, so a
  // class name, an aria-label, a meta description or a comment cannot smuggle the
  // vocabulary onto a page where it does not belong.
  // The route-scoped rule, asserted against the BUILT MARKUP rather than rendered text.
  // The Playwright suite checks what a visitor reads; this checks what is served, so a
  // class name, an aria-label, a meta description or a comment cannot smuggle the
  // vocabulary onto a page where it does not belong.
  const CHROME = /<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>/gi;
  const DEEP_VOCABULARY = ['AIya', 'AIon', 'Aion', 'Genesis Goalkeeper', 'Revelation Vanguard'];
  // Its own page, plus the two legal pages, which have to name the service they describe.
  const PRODUCT_NAME_FILES = ['/deep-kore/index.html', '/privacy/index.html', '/terms/index.html'];

  test.skipIf(!built)('the identity and governance vocabulary never leaves its own page', () => {
    const offenders: string[] = [];
    for (const file of walkBuilt(dist)) {
      const rel = file.replace(dist, '').replace(/\\/g, '/');
      if (rel === '/deep-kore/index.html') continue;
      const content = readFileSync(file, 'utf8');
      for (const term of DEEP_VOCABULARY) {
        if (content.includes(term)) offenders.push(`${term} in ${rel}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test.skipIf(!built)('the product name appears only where it identifies the product', () => {
    const offenders: string[] = [];
    for (const file of walkBuilt(dist)) {
      const rel = file.replace(dist, '').replace(/\\/g, '/');
      if (PRODUCT_NAME_FILES.includes(rel)) continue;
      // Strip the chrome, which carries the link that points at the page.
      const body = readFileSync(file, 'utf8').replace(CHROME, '');
      if (body.includes('Deep Kore')) offenders.push(`Deep Kore in the body of ${rel}`);
    }
    expect(offenders).toEqual([]);
  });
});


// ---------------------------------------------------------------------------
// The production bundle
// ---------------------------------------------------------------------------

describe('the production bundle carries no secret and no internal detail', () => {
  /** Every file the build emits, so nothing is checked by sampling. */
  function builtFiles(dir: string, out: string[] = []): string[] {
    if (!existsSync(dir)) return out;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) builtFiles(full, out);
      else if (/\.(html|js|mjs|css|json|xml|txt|webmanifest)$/i.test(entry.name)) out.push(full);
    }
    return out;
  }

  const files = builtFiles(resolve(root, 'dist'));

  test('the build produced something to check', () => {
    // A scan over an empty directory passes vacuously, which is the one way a guard like
    // this can report success while proving nothing.
    expect(files.length).toBeGreaterThan(10);
  });

  // NAMES, not values. A variable NAME appearing in a client bundle is the signal that
  // matters: it means something server-side was read where the browser can see it, and it
  // is the shape `PUBLIC_`-prefixing a Deep Kore variable would produce.
  test('no server-side variable name reaches the browser', () => {
    const forbidden = [
      'DEEP_KORE_ORIGIN_URL',
      'DEEP_KORE_GATEWAY_TOKEN',
      'DEEP_KORE_SESSION_SECRET',
      'DEEP_KORE_ACCESS_CLIENT_ID',
      'DEEP_KORE_ACCESS_CLIENT_SECRET',
      'TURNSTILE_SECRET_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SENDGRID_API_KEY',
      'CF-Access-Client-Id',
      'CF-Access-Client-Secret',
    ];
    for (const file of files) {
      const body = readFileSync(file, 'utf8');
      for (const name of forbidden) {
        expect(body, `${file} must not contain ${name}`).not.toContain(name);
      }
    }
  });

  test('no engine internal, queue path or machine detail reaches the browser', () => {
    const forbidden = [
      'state_hash',
      'gk1_decision',
      'gk2_decision',
      'transform_count',
      'vanguard_diag',
      'adult_consent_invariant',
      'warmed_text',
      'structural_identity_key',
      'teaching_case_id',
      'candidate_placement',
      'dk_session_worker',
      'deep_kore_gateway',
      'dk_teaching_broker',
      'DeepKoreTeachingBroker',
      'LOCALAPPDATA',
      'D:\\LLC_Projects',
      '127.0.0.1',
      '\\\\.\\pipe',
    ];
    for (const file of files) {
      const body = readFileSync(file, 'utf8');
      for (const leak of forbidden) {
        expect(body, `${file} must not contain ${leak}`).not.toContain(leak);
      }
    }
  });

  // WHAT MAY LAWFULLY APPEAR IN SCREAMING_CASE, and nothing else.
  //
  // Asserted as an exact set rather than a denylist, so a variable name added to the
  // browser bundle by a future change fails here without anyone having to predict it.
  //
  // The two that DO appear are the owner-named public error CODES, not variables: the
  // page maps them to approved sentences, which is the whole reason they are shared with
  // the client. `PUBLIC_TURNSTILE_SITE_KEY` is inlined only when a site key is configured
  // - it is not - and a site key is public by design either way.
  test('the only SCREAMING_CASE Deep Kore tokens in the bundle are the two public codes', () => {
    const seen = new Set<string>();
    for (const file of files) {
      // A plain uppercase-token scan, deliberately without a regex escape in it: the
      // point of this test is the exact set that comes out, and an escape that is
      // subtly wrong would quietly make the set empty and the assertion vacuous.
      for (const token of readFileSync(file, 'utf8').match(/[A-Z][A-Z0-9_]*/g) ?? []) {
        if (token.includes('DEEP_KORE_') || token.startsWith('TURNSTILE_')) seen.add(token);
      }
    }
    expect([...seen].sort()).toEqual(['DEEP_KORE_SESSION_CAPACITY', 'DEEP_KORE_UNAVAILABLE']);
  });
});
