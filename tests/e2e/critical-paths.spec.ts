import { test, expect } from '@playwright/test';

test.describe('ByteLite Critical User Paths', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads with patent information', async ({ page }) => {
    await expect(page).toHaveTitle(/ByteLite/);
    await expect(page.locator('text=Patent US 63/807,027')).toBeVisible();
    await expect(page.locator('text=1TB → 18 bytes')).toBeVisible();
  });

  test('compression demo is interactive', async ({ page }) => {
    await page.goto('/demo');
    
    // Check demo exists
    await expect(page.locator('text=Try ByteLite Compression')).toBeVisible();
    
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('ByteLite compression test')
    });
    
    // Verify file appears
    await expect(page.locator('text=test.txt')).toBeVisible();
    
    // Click compress
    await page.click('text=Compress with ByteLite');
    
    // Wait for results
    await expect(page.locator('text=Compression Complete!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=8 bytes')).toBeVisible(); // Small files compress to 8 bytes
  });

  test('early access modal functionality', async ({ page }) => {
    // Click any CTA button
    await page.click('text=Get Early Access').first();
    
    // Modal should appear
    await expect(page.locator('.modal.active')).toBeVisible();
    await expect(page.locator('text=Join the ByteLite Revolution')).toBeVisible();
    
    // Close modal
    await page.click('.modal-close');
    await expect(page.locator('.modal.active')).not.toBeVisible();
  });

  test('responsive design works', async ({ page, viewport }) => {
    // Test mobile menu
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu should be hidden initially
    await expect(page.locator('.mobile-menu')).not.toBeVisible();
    
    // Click hamburger
    await page.click('.mobile-menu-toggle');
    
    // Mobile menu should appear
    await expect(page.locator('.mobile-menu')).toBeVisible();
    
    // Navigate via mobile menu
    await page.click('.mobile-menu >> text=Technology');
    await expect(page).toHaveURL('/technology');
  });

  test('security headers are present', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
  });

  test('cookie consent banner', async ({ page }) => {
    // Clear cookies to ensure banner appears
    await page.context().clearCookies();
    await page.reload();
    
    // Cookie banner should be visible
    await expect(page.locator('text=This site uses cookies')).toBeVisible();
    
    // Accept cookies
    await page.click('text=Accept');
    
    // Banner should disappear
    await expect(page.locator('text=This site uses cookies')).not.toBeVisible();
    
    // Reload and verify banner doesn't reappear
    await page.reload();
    await expect(page.locator('text=This site uses cookies')).not.toBeVisible();
  });
});

test.describe('Performance Critical Metrics', () => {
  test('page load performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for render-blocking resources
    const metrics = await page.evaluate(() => ({
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      fullyLoaded: performance.timing.loadEventEnd - performance.timing.navigationStart
    }));
    
    expect(metrics.domContentLoaded).toBeLessThan(1500);
    expect(metrics.fullyLoaded).toBeLessThan(3000);
  });

  test('image optimization', async ({ page }) => {
    await page.goto('/');
    
    // Check that images have proper attributes
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      
      // Should have alt text
      await expect(img).toHaveAttribute('alt', /.+/);
      
      // Should have dimensions to prevent layout shift
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      
      if (width && height) {
        expect(parseInt(width)).toBeGreaterThan(0);
        expect(parseInt(height)).toBeGreaterThan(0);
      }
    }
  });
});