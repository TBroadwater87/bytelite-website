import { test, expect } from '@playwright/test';

test.describe('ByteLite LLC critical user paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads with the ByteLite LLC technology-first identity', async ({ page }) => {
    await expect(page).toHaveTitle(/ByteLite LLC/);
    await expect(page.locator('h1')).toContainText('Deterministic structure');
    await expect(page.locator('a[href="/technologies"]').first()).toBeVisible();
  });

  test('homepage never shows retired overclaiming language', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).not.toContainText('Patent US');
    await expect(body).not.toContainText('1GB into 15 bytes');
    await expect(body).not.toContainText('finished AGI');
  });

  test('primary navigation reaches the Technologies section', async ({ page }) => {
    await page.click('a[href="/technologies"]');
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

  test('security headers are present', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};

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
