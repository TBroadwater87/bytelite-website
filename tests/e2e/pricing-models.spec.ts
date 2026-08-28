import { test, expect } from '@playwright/test';

// Pricing guards, rewritten 2026-08-26.
//
// The old suite protected a worked "target economic example" ($1,000 -> $100 -> a 50/50 split of
// $900) and a simulated prepaid balance ($42.18, a $25.00 minimum, a $100.00 auto-reload, an
// $18.40 settlement). Those were removed from the site and from src/data/bytelite.ts because
// every number in them was invented.
//
// So the assertions invert: this file now proves those figures are GONE and that the model is
// still fully stated in words. Deleting the suite would have left nothing stopping their return.

const PUBLIC_ROUTES = [
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
  '/privacy',
  '/terms',
  '/preorder-terms',
  '/supporter-terms',
];

// Every figure from the deleted simulations. If any reappears, something restored a fabrication.
const FABRICATED_FIGURES = [
  '$1,000',
  '$1000',
  '$42.18',
  '$18.40',
  '$25.00',
  '$100.00',
  '$550',
  '$450',
  '$900',
];

test.describe('The invented commercial figures stay deleted', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} shows no fabricated account or savings figure`, async ({ page }) => {
      await page.goto(route);
      const text = (await page.locator('body').innerText()) ?? '';
      for (const figure of FABRICATED_FIGURES) {
        expect(text, `${route} must not display the invented figure ${figure}`).not.toContain(figure);
      }
    });
  }

  test('the licensing page carries no simulated balance or auto-reload widget', async ({ page }) => {
    await page.goto('/licensing');
    await expect(page.locator('.bal')).toHaveCount(0);
    await expect(page.locator('.ss-half')).toHaveCount(0);
    await expect(page.locator('.ss-illustrative')).toHaveCount(0);
  });

  test('the licensing page says why the worked example was removed', async ({ page }) => {
    await page.goto('/licensing');
    await expect(page.locator('body')).toContainText('Every number in it was invented');
  });
});

test.describe('The model is still fully stated, in words', () => {
  test('the 50/50 split is explained as a share of savings, not of costs', async ({ page }) => {
    await page.goto('/licensing');
    const body = page.locator('body');
    await expect(body).toContainText('50% of verified qualifying savings');
    await expect(body).toContainText('The split is of the savings, not of your costs.');
  });

  test('no verified saving means no fee', async ({ page }) => {
    await page.goto('/licensing');
    await expect(page.locator('body')).toContainText('No verified saving means no savings-share fee');
  });

  test('the savings share is never presented as a cost cut', async ({ page }) => {
    await page.goto('/licensing');
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    expect(text).not.toContain('cut your costs by half');
    expect(text).not.toContain('halve your costs');
    expect(text).not.toContain('50% cost reduction');
  });

  test('the decided personal prices are still shown, because they are real', async ({ page }) => {
    await page.goto('/licensing');
    const body = page.locator('body');
    await expect(body).toContainText('$9.99');
    await expect(body).toContainText('$99.99');
  });

  test('personal use is never billed on a percentage of savings', async ({ page }) => {
    await page.goto('/licensing');
    await expect(page.locator('body')).toContainText('no savings-share fee on a personal subscription');
  });

  test('licensing is labelled planned, not operational', async ({ page }) => {
    await page.goto('/licensing');
    const body = page.locator('body');
    await expect(body).toContainText('Planned commercial model');
    await expect(body).toContainText('available to license today');
  });
});

test.describe('No achieved-performance claim anywhere', () => {
  const ACHIEVED_RESULT_PHRASES = [
    'guarantees a 90%',
    'achieves a 90%',
    'delivers a 90%',
    'proven 90%',
    'measured 90%',
    '90% reduction achieved',
  ];

  for (const route of PUBLIC_ROUTES) {
    test(`${route} never states a reduction figure as an achieved result`, async ({ page }) => {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of ACHIEVED_RESULT_PHRASES) {
        expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
      }
    });
  }

  test('the homepage explains why there is no percentage on it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('I am not going to put a percentage here.');
  });
});

test.describe('Pricing layout survives a narrow screen', () => {
  test('the two models stack and stay readable at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/licensing');
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth - overflow.clientWidth).toBeLessThanOrEqual(1);
    await expect(page.locator('.pm')).toBeVisible();
  });

  test('prices stay legible rather than truncated at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/licensing');
    await expect(page.locator('body')).toContainText('$9.99');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
