import { test, expect } from '@playwright/test';

// Public scope reset (2026-08-22): thebytelite.com is a ByteLite-only site. These tests assert
// the six public destinations behave, and that nothing from the retired portfolio has crept
// back onto a discovery surface.

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/validation',
  '/licensing',
  '/about',
  '/contact',
];

test.describe('ByteLite public site critical paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage leads with the ByteLite law', async ({ page }) => {
    await expect(page).toHaveTitle(/ByteLite/);
    await expect(page.locator('h1')).toContainText('Exact reconstruction.');
    await expect(page.locator('h1')).toContainText('Smaller representation.');
  });

  test('homepage never shows retired overclaiming language', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).not.toContainText('Patent US');
    await expect(body).not.toContainText('1GB into 15 bytes');
    await expect(body).not.toContainText('HeartStrings');
    await expect(body).not.toContainText('Heartstrings');
  });

  test('every public route resolves and every homepage CTA reaches one', async ({ page, request }) => {
    for (const route of PUBLIC_ROUTES) {
      const response = await request.get(route);
      expect(response.status(), `${route} should resolve 200`).toBe(200);
    }

    const hrefs = await page
      .locator('main a[href^="/"]')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href') || ''));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const path = (href.split('?')[0] || '').replace(/\/$/, '') || '/';
      expect(PUBLIC_ROUTES, `homepage links to ${href}, which is not a public route`).toContain(path);
    }
  });

  test('primary navigation is the flat ByteLite set', async ({ page }) => {
    const toggle = page.locator('#navToggle');
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    const nav = page.getByRole('navigation', { name: 'Primary' });
    for (const label of ['How It Works', 'Validation', 'Licensing', 'About']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();

    // No portfolio destination survives in the header.
    const navHrefs = await nav
      .locator('a[href^="/"]')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href') || ''));
    for (const href of navHrefs) {
      expect(PUBLIC_ROUTES, `nav links to ${href}, which is not a public route`).toContain(
        href.replace(/\/$/, '') || '/'
      );
    }
  });

  test('navigation reaches How It Works', async ({ page }) => {
    const toggle = page.locator('#navToggle');
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.getByRole('link', { name: 'How It Works', exact: true }).click();
    await expect(page).toHaveURL(/\/how-it-works\/?$/);
    await expect(page.locator('h1')).toContainText('Principles, not mechanism.');
  });

  test('mobile navigation toggle opens and closes the menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('#navLinks')).not.toHaveClass(/nav-open/);
    await page.click('#navToggle');
    await expect(page.locator('#navLinks')).toHaveClass(/nav-open/);
    await page.click('#navToggle');
    await expect(page.locator('#navLinks')).not.toHaveClass(/nav-open/);
  });

  test('security headers are present', async ({ request }) => {
    // Raw HTTP fetch, not a page navigation - avoids browser-specific caching of the repeat
    // navigation to '/' (Firefox does not always re-expose headers for a cached response).
    const response = await request.get('/');
    const headers = response.headers();

    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('cookie consent banner appears and can be accepted', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.removeItem('bl_cookie_consent'));
    await page.reload();

    await expect(page.locator('#cookieBanner')).not.toHaveClass(/hidden/);
    await page.click('#acceptAllBtn');
    await expect(page.locator('#cookieBanner')).toHaveClass(/hidden/);

    await page.reload();
    await expect(page.locator('#cookieBanner')).toHaveClass(/hidden/);
  });
});

test.describe('Retired portfolio routes are out of discovery, not deleted', () => {
  const RETIRED = [
    '/technologies',
    '/technologies/bytelite',
    '/technologies/deep-kore',
    '/products/cordel-play',
    '/products/cordel-connect',
    '/products/cordel-connect/date-planning/restaurants/partner-program',
    '/progress',
    '/research',
    '/company',
    '/architecture',
    '/preorder',
    '/marketing/signup',
  ];

  for (const route of RETIRED) {
    test(`${route} still resolves but is served noindex`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.status(), `${route} should still resolve`).toBe(200);
      const html = await response.text();
      expect(html, `${route} must carry a noindex robots meta`).toContain('noindex, nofollow');
    });
  }

  test('the sitemap lists only the public ByteLite routes', async ({ request }) => {
    const response = await request.get('/sitemap-0.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
      (m[1] || '').replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/'
    );
    expect(locs.sort()).toEqual(
      ['/', '/about', '/contact', '/how-it-works', '/licensing', '/privacy', '/terms', '/validation'].sort()
    );
  });

  test('/about and /licensing are real pages, not redirects to retired routes', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText('ByteLite LLC');
    await page.goto('/licensing');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('body')).toContainText('verified');
  });
});

test.describe('Performance-critical metrics', () => {
  test('homepage loads within a reasonable time budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);
  });

  test('images declare alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt', /.*/);
    }
  });
});
