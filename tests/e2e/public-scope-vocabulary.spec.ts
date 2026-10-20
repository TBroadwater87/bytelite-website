import { test, expect } from '@playwright/test';
import { ALL_PAGE_ROUTES, DISCOVERABLE_ROUTES } from './public-routes';
import { loadDisclosureDenylist, disclosureFindings } from '../disclosure-denylist';

const OVERCLAIMS = [
  'universal compression',
  'universal shrink',
  'every file shrinks',
  'smaller representation for every source file',
  'compresses every file',
  'independently verified result',
  'third-party verified',
  'peer reviewed',
  'production ready',
  'production-ready',
  'shannon does not apply',
  'defeated information theory',
  'artificial general intelligence has been',
  'achieved agi',
  'superintelligent',
  'solved alignment',
  'patent pending',
  'patented',
  'trademark',
  '®',
  '™',
  '1tb to',
  'one-terabyte',
  'four hundred kilobytes',
];

const HYPE = ['revolutionary', 'disruptive', 'breakthrough', 'world-changing', 'next-generation', 'industry-leading', 'game-changing'];

const disclosureDenylist = loadDisclosureDenylist();

for (const route of ALL_PAGE_ROUTES) {
  test(`${route} carries no denylisted name, term or pattern in text or markup`, async ({ page }) => {
    await page.goto(route);
    const html = await page.content();
    const text = (await page.locator('body').innerText()) ?? '';
    expect(disclosureFindings(html, disclosureDenylist), `${route} markup`).toEqual([]);
    expect(disclosureFindings(text, disclosureDenylist), `${route} text`).toEqual([]);
  });

  test(`${route} makes no overclaim and uses no hype`, async ({ page }) => {
    await page.goto(route);
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    for (const phrase of [...OVERCLAIMS, ...HYPE]) {
      expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
    }
  });
}

test.describe('Required honesty statements', () => {
  test('validation states that nothing is independently verified', async ({ page }) => {
    await page.goto('/validation');
    await expect(page.locator('body')).toContainText('None of it has been independently verified.');
  });

  test('the homepage hero states the evidence position', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-status')).toContainText('Nothing has been independently verified.');
    await expect(page.locator('.hero-status')).toContainText('checkout is switched off');
  });

  test('data representation states the counting limit and the absence of net reduction', async ({ page }) => {
    await page.goto('/research/data-representation');
    const body = page.locator('body');
    await expect(body).toContainText('No lossless method can make every possible input smaller.');
    await expect(body).toContainText('Net size reduction has not been demonstrated.');
    await expect(body).toContainText('does not rely on probabilistic inference or confidence scores');
  });

  test('machine cognition states that the full chain is not demonstrated end to end', async ({ page }) => {
    await page.goto('/research/machine-cognition');
    const body = page.locator('body');
    await expect(body).toContainText('Not demonstrated end to end.');
    await expect(body).toContainText('Complete governance has not been demonstrated');
    await expect(body).toContainText('There is no public demonstration on this site, and none is simulated.');
  });

  test('the approaches page claims no superiority and cites its sources', async ({ page }) => {
    await page.goto('/research/approaches-to-ai');
    const body = page.locator('body');
    await expect(body).toContainText('That the ByteLite LLC approach is better. There is no comparable evidence.');
    const sourceLinks = page.locator('ol.sources a[href^="https://"]');
    expect(await sourceLinks.count()).toBeGreaterThanOrEqual(10);
    const rowsWithoutSource = await page.locator('table.comparison tbody tr').evaluateAll((rows) =>
      rows.filter((row) => !row.querySelector('.source-references a')).map((row) => row.querySelector('th')?.textContent?.trim() ?? ''),
    );
    expect(rowsWithoutSource.length, `rows without a source: ${rowsWithoutSource.join(', ')}`).toBeLessThanOrEqual(1);
  });

  test('every conceptual diagram is labelled as a conceptual illustration', async ({ page }) => {
    for (const route of ['/', '/research', '/research/machine-cognition', '/research/data-representation']) {
      await page.goto(route);
      const classifications = await page.locator('figure').evaluateAll((figures) => figures.map((figure) => figure.getAttribute('data-figure-classification')));
      expect(classifications.length, `${route} should carry at least one labelled figure`).toBeGreaterThan(0);
      for (const classification of classifications) {
        expect(['Conceptual illustration', 'Product concept rendering']).toContain(classification);
      }
    }
  });

  test('no milestone is shown with a percentage', async ({ page }) => {
    for (const route of ['/', '/research/milestones', '/validation', '/research/machine-cognition']) {
      await page.goto(route);
      const text = (await page.locator('main').innerText()) ?? '';
      expect(text, `${route} shows a percentage`).not.toMatch(/\d\s?%/);
    }
  });
});

test.describe('Discoverable pages carry complete metadata', () => {
  for (const route of DISCOVERABLE_ROUTES) {
    test(`${route} has a title, description, canonical and social image`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveTitle(/ByteLite LLC/);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect((description ?? '').length).toBeGreaterThan(50);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(route === '/' ? 'https://www.thebytelite.com/' : `https://www.thebytelite.com${route}`);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://www.thebytelite.com/og-default.jpg');
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    });
  }
});
