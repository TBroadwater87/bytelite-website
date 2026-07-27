import { test, expect } from '@playwright/test';

test.describe('ByteLite LLC critical user paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads with the ByteLite LLC technology-first identity', async ({ page }) => {
    await expect(page).toHaveTitle(/ByteLite LLC/);
    await expect(page.locator('h1')).toContainText('Deterministic structure');
    await expect(page.getByRole('link', { name: 'Explore the Technologies' })).toBeVisible();
  });

  test('homepage never shows retired overclaiming language', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).not.toContainText('Patent US');
    await expect(body).not.toContainText('1GB into 15 bytes');
    // The proof-posture section explicitly denies finished AGI as a claim - assert the denial
    // is present rather than substring-matching "finished AGI", which also matches the denial itself.
    await expect(body).toContainText('not a claim that finished AGI exists');
  });

  test('primary navigation reaches the Technologies section', async ({ page }) => {
    // Below the 1100px breakpoint, the primary nav is hidden behind the hamburger toggle.
    const toggle = page.locator('#navToggle');
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.getByText('Technologies', { exact: true }).click();
    await nav.getByRole('menuitem', { name: 'Technology Overview' }).click();
    await expect(page).toHaveURL('/technologies');
    await expect(page.locator('h1')).toContainText('Technology Portfolio');
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

test.describe('Cordel brand migration', () => {
  test('homepage uses Cordel branding and never shows the retired HeartStrings name', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toContainText('Cordel Play');
    await expect(body).toContainText('Cordel Connect');
    await expect(body).not.toContainText('HeartStrings');
    await expect(body).not.toContainText('Heartstrings');
  });

  test('primary navigation uses Cordel Play and Cordel Connect', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#navToggle');
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByText('Cordel Play', { exact: true })).toBeVisible();
    await expect(nav.getByText('Cordel Connect', { exact: true })).toBeVisible();
  });

  test('Cordel Play and Cordel Connect canonical routes resolve', async ({ request }) => {
    const routes = [
      '/products/cordel-play',
      '/products/cordel-play/components',
      '/products/cordel-play/consent-architecture',
      '/products/cordel-play/preorder',
      '/products/cordel-connect',
      '/products/cordel-connect/safety',
      '/products/cordel-connect/date-planning/restaurants/partner-program',
    ];
    for (const route of routes) {
      const response = await request.get(route);
      expect(response.status(), `${route} should resolve 200`).toBe(200);
    }
  });

  test('no image alt text on the homepage references HeartStrings', async ({ page }) => {
    await page.goto('/');
    const altTexts = await page.locator('img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('alt') || ''));
    for (const alt of altTexts) {
      expect(alt.toLowerCase()).not.toContain('heartstrings');
    }
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
