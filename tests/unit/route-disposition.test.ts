import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadDisclosureDenylist, disclosureFindings } from '../disclosure-denylist';

const repositoryRoot = resolve(__dirname, '../..');
const vercelConfiguration = JSON.parse(readFileSync(resolve(repositoryRoot, 'vercel.json'), 'utf8')) as {
  trailingSlash?: boolean;
  redirects: Array<{ source: string; destination: string; statusCode?: number; has?: unknown }>;
  rewrites: Array<{ source: string; destination: string }>;
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};

const CANONICAL_ROUTES = [
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
  '/billing',
  '/responsible-disclosure',
  '/checkout/success',
  '/checkout/cancel',
];

const RETIRED_ROUTE_FAMILIES = ['/how-it-works', '/architecture', '/progress', '/technologies', '/company', '/preorder', '/marketing'];

const HISTORICAL_URLS_REQUIRING_A_DISPOSITION = [
  '/how-it-works',
  '/architecture',
  '/architecture/integration-map',
  '/progress',
  '/progress/changelog',
  '/company',
  '/company/founder',
  '/company/investors',
  '/technologies',
  '/technologies/bytelite',
  '/technologies/bytesight',
  '/technologies/deep-kore',
  '/technologies/deep-kore/aiya',
  '/technologies/byteoracle',
  '/technologies/byteflow',
  '/technologies/bytecost',
  '/research/deterministic-structural-cognition',
  '/research/plain-english',
  '/deepkore',
  '/deepkore-lab',
  '/ai-safety',
  '/preorder',
  '/preorder/status',
  '/cordel-connect',
  '/products/cordel-connect',
  '/products/cordel-connect/safety',
  '/products/cordel-play/preorder',
  '/products/heartstrings-play',
  '/products/heartstrings-connect/date-planning/restaurants/partner-program',
  '/heartstrings',
  '/heartstrings-app',
  '/marketing',
  '/marketing/thank-you',
  '/status',
  '/proof',
  '/news',
  '/technology',
  '/demo',
  '/ethics',
  '/pricing',
  '/subscribe',
  '/support-us',
];

function escapeForRegex(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourcePatternToRegex(source: string): RegExp {
  if (source === '/') return /^\/$/;
  const segmentPatterns = source
    .split('/')
    .slice(1)
    .map((segment) => {
      if (/^:[a-zA-Z]+\*$/.test(segment) || /^:[a-zA-Z]+\(\.\*\)$/.test(segment)) return '(?:/.*)?';
      if (/^:[a-zA-Z]+$/.test(segment)) return '/[^/]+';
      return `/${escapeForRegex(segment)}`;
    });
  return new RegExp(`^${segmentPatterns.join('')}$`);
}

const contentRedirects = vercelConfiguration.redirects.filter((redirect) => !redirect.has);

function firstMatchingDisposition(url: string): { kind: 'redirect' | 'rewrite'; destination: string } | null {
  const redirect = contentRedirects.find((candidate) => sourcePatternToRegex(candidate.source).test(url));
  if (redirect) return { kind: 'redirect', destination: redirect.destination };
  const rewrite = vercelConfiguration.rewrites.find((candidate) => sourcePatternToRegex(candidate.source).test(url));
  if (rewrite) return { kind: 'rewrite', destination: rewrite.destination };
  return null;
}

describe('canonical routes', () => {
  test('every canonical route has a page source', () => {
    for (const route of CANONICAL_ROUTES) {
      const pageBase = route === '/' ? 'src/pages/index' : `src/pages${route}`;
      const hasSource = existsSync(resolve(repositoryRoot, `${pageBase}.astro`)) || existsSync(resolve(repositoryRoot, pageBase, 'index.astro'));
      expect(hasSource, `${route} has no page source`).toBe(true);
    }
  });

  test('no redirect or rewrite shadows a canonical route', () => {
    for (const route of CANONICAL_ROUTES) {
      expect(firstMatchingDisposition(route), `${route} is captured by a redirect or rewrite`).toBeNull();
    }
  });

  test('no retired family has a page source', () => {
    for (const family of RETIRED_ROUTE_FAMILIES) {
      const pageBase = resolve(repositoryRoot, 'src/pages', family.slice(1));
      expect(existsSync(pageBase) || existsSync(`${pageBase}.astro`), `src/pages${family} must not exist`).toBe(false);
    }
  });
});

describe('historical URLs', () => {
  test('every known historical URL is redirected to a canonical route or answered 410', () => {
    for (const url of HISTORICAL_URLS_REQUIRING_A_DISPOSITION) {
      const disposition = firstMatchingDisposition(url);
      expect(disposition, `${url} has no disposition`).not.toBeNull();
      if (disposition!.kind === 'redirect') {
        const destinationPath = disposition!.destination.split('#')[0]!.replace(/\/$/, '') || '/';
        expect(CANONICAL_ROUTES, `${url} redirects to non-canonical ${disposition!.destination}`).toContain(destinationPath);
      } else {
        expect(disposition!.destination).toBe('/api/gone');
      }
    }
  });

  test('retired and unpublished names answer 410 instead of linking to current pages', () => {
    for (const url of [
      '/technologies/byteoracle',
      '/technologies/byteflow',
      '/technologies/bytecost',
      '/technologies/bytesight',
      '/technologies/deep-kore',
      '/technologies/deep-kore/aiya',
      '/deepkore',
      '/deepkore-lab',
      '/ai-safety',
    ]) {
      expect(firstMatchingDisposition(url)?.destination).toBe('/api/gone');
    }
  });

  test('content redirects are permanent, the host redirects are 308, and none loops', () => {
    for (const redirect of vercelConfiguration.redirects) {
      expect(redirect.source).not.toBe(redirect.destination);
      expect(redirect.statusCode).toBe(redirect.has ? 308 : 301);
    }
  });

  test('the apex host redirect matches every path, including trailing slashes', () => {
    const apexRedirects = vercelConfiguration.redirects.filter((redirect) => redirect.has);
    const catchAll = apexRedirects.find((redirect) => redirect.source !== '/');
    expect(catchAll).toBeDefined();
    for (const path of ['/about', '/about/', '/research/milestones/', '/a/b/c']) {
      expect(sourcePatternToRegex(catchAll!.source).test(path), `${path} must match the apex redirect`).toBe(true);
    }
    expect(vercelConfiguration.trailingSlash).toBe(false);
  });

  test('the gone handler returns 410 and names nothing', () => {
    const goneSource = readFileSync(resolve(repositoryRoot, 'api/gone.ts'), 'utf8');
    expect(goneSource).toContain('statusCode = 410');
    expect(goneSource).toContain('noindex');
    expect(disclosureFindings(goneSource, loadDisclosureDenylist()).filter((finding) => finding.startsWith('name'))).toEqual([]);
  });
});

describe('security headers', () => {
  const headerList = vercelConfiguration.headers[0]!.headers;
  const contentSecurityPolicy = headerList.find((header) => header.key === 'Content-Security-Policy')!.value;

  test('every security header is served and the legacy routes array is absent', () => {
    for (const key of ['Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy', 'Cross-Origin-Opener-Policy']) {
      expect(headerList.map((header) => header.key)).toContain(key);
    }
    expect((vercelConfiguration as Record<string, unknown>).routes).toBeUndefined();
  });

  test('the content security policy allows no third-party origin and no eval', () => {
    expect(contentSecurityPolicy).not.toMatch(/https?:\/\//);
    expect(contentSecurityPolicy).not.toContain('unsafe-eval');
    expect(contentSecurityPolicy).not.toContain('*');
    expect(contentSecurityPolicy).toContain("form-action 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
  });
});

describe('built output', () => {
  const distributionDirectory = resolve(repositoryRoot, 'dist');
  const built = existsSync(distributionDirectory);

  test.skipIf(!built)('the sitemap lists exactly the discoverable routes, without trailing slashes', () => {
    const sitemapFiles = readdirSync(distributionDirectory).filter((file) => file.startsWith('sitemap') && file.endsWith('.xml'));
    const urls = sitemapFiles
      .flatMap((file) => readFileSync(resolve(distributionDirectory, file), 'utf8').match(/<loc>([^<]+)<\/loc>/g) ?? [])
      .map((match) => match.replace(/<\/?loc>/g, ''))
      .filter((url) => !url.includes('sitemap'));
    const paths = urls.map((url) => url.replace(/^https:\/\/www\.thebytelite\.com/, '') || '/');
    for (const url of urls) {
      expect(url.startsWith('https://www.thebytelite.com/')).toBe(true);
      if (url !== 'https://www.thebytelite.com/') expect(url.endsWith('/'), `${url} has a trailing slash`).toBe(false);
    }
    for (const undiscoverable of ['/checkout/success', '/checkout/cancel', '/billing', '/responsible-disclosure', '/404']) {
      expect(paths).not.toContain(undiscoverable);
    }
    for (const path of paths) expect(CANONICAL_ROUTES).toContain(path);
    expect(paths.length).toBe(18);
  });

  test.skipIf(!built)('robots.txt points at the sitemap', () => {
    const robots = readFileSync(resolve(repositoryRoot, 'public/robots.txt'), 'utf8');
    expect(robots).toContain('Sitemap: https://www.thebytelite.com/sitemap-index.xml');
  });
});
