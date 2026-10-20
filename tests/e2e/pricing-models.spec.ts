import { test, expect } from '@playwright/test';

test.describe('Proposed commercial models', () => {
  test('licensing presents both models as proposals with nothing available', async ({ page }) => {
    await page.goto('/licensing');
    const body = page.locator('body');
    await expect(body).toContainText('Nothing is available to license or buy today.');
    await expect(body).toContainText('They are proposals, not offers');
    await expect(body).toContainText('no percentage-of-savings fee');
    await expect(body).toContainText('50% of verified qualifying savings');
    await expect(body).toContainText('It is not a promise that costs fall by half.');
    await expect(body).toContainText('No verified saving would mean no fee for that saving.');
  });

  test('licensing makes no achieved-saving claim', async ({ page }) => {
    await page.goto('/licensing');
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    for (const phrase of ['guarantees a', 'achieves a', 'proven savings', 'reduces your costs by', 'unlimited']) {
      expect(text).not.toContain(phrase);
    }
  });

  test('the personal model never charges a percentage', async ({ page }) => {
    await page.goto('/licensing');
    const personalModel = page.locator('.model').first();
    await expect(personalModel).toContainText('Personal use');
    const text = ((await personalModel.innerText()) ?? '').toLowerCase();
    expect(text).not.toMatch(/\d+%/);
  });

  for (const width of [390, 320]) {
    test(`the licensing layout holds at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/licensing');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
