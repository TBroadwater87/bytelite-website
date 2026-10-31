import { readdirSync, existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const ARTWORK_BY_ROUTE: Record<string, { aboveTheFold: string; belowTheFold: string[] }> = {
  '/': { aboveTheFold: '/art/home-information-flow.webp', belowTheFold: [] },
  '/research': { aboveTheFold: '/art/research-three-programs.webp', belowTheFold: [] },
  '/research/machine-cognition': { aboveTheFold: '/art/cognition-structure.webp', belowTheFold: ['/art/cognition-sources.webp'] },
  '/research/data-representation': { aboveTheFold: '/art/data-flow.webp', belowTheFold: ['/art/data-exact-rebuild.webp', '/art/data-whole-artifact.webp'] },
  '/research/visual-and-audio': { aboveTheFold: '/art/vision-pixel-structure.webp', belowTheFold: [] },
  '/research/approaches-to-ai': { aboveTheFold: '/art/ai-approaches-comparison.webp', belowTheFold: [] },
  '/licensing': { aboveTheFold: '/art/licensing-possible-setting.webp', belowTheFold: [] },
  '/contact': { aboveTheFold: '/art/partnerships.webp', belowTheFold: [] },
  '/about': { aboveTheFold: '/art/about-workstation-illustration.webp', belowTheFold: [] },
};

test.describe('Artwork placement', () => {
  for (const [route, artwork] of Object.entries(ARTWORK_BY_ROUTE)) {
    test(`${route} shows its assigned artwork with dimensions, alt text and a visible disclosure`, async ({ page }) => {
      await page.goto(route);
      const expectedSources = [artwork.aboveTheFold, ...artwork.belowTheFold];
      const placedSources = await page.locator('figure.art-figure img').evaluateAll((images) => images.map((image) => image.getAttribute('src')));
      expect(placedSources).toEqual(expectedSources);

      for (const source of expectedSources) {
        const image = page.locator(`figure.art-figure img[src="${source}"]`);
        expect(Number(await image.getAttribute('width'))).toBeGreaterThan(0);
        expect(Number(await image.getAttribute('height'))).toBeGreaterThan(0);
        expect(((await image.getAttribute('alt')) ?? '').length).toBeGreaterThan(20);
        await expect(image).toHaveAttribute('loading', source === artwork.aboveTheFold ? 'eager' : 'lazy');

        const figure = page.locator('figure.art-figure', { has: page.locator(`img[src="${source}"]`) });
        await expect(figure.locator('.figure-classification')).toHaveText('Conceptual illustration');
        await expect(figure.locator('figcaption')).toBeVisible();

        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element) => (element as HTMLImageElement).decode());
        const size = await image.evaluate((element) => {
          const picture = element as HTMLImageElement;
          const box = picture.getBoundingClientRect();
          return { naturalRatio: picture.naturalWidth / picture.naturalHeight, renderedRatio: box.width / box.height };
        });
        expect(Math.abs(size.naturalRatio - size.renderedRatio) / size.naturalRatio).toBeLessThan(0.02);
      }
    });
  }

  test('the Cordel Play board is labelled as a rendering, not a photograph', async ({ page }) => {
    await page.goto('/cordel-play');
    const figure = page.locator('figure.art-figure', { has: page.locator('img[src="/cordel/cordel-play-board-landscape.webp"]') });
    await expect(figure.locator('.figure-classification')).toHaveText('Product concept rendering');
    await expect(figure.locator('figcaption')).toContainText('not a photograph of a manufactured board');
  });

  test('no review-only product concept is published', () => {
    const publishedFiles = ['public/art', 'public/cordel'].flatMap((directory) => (existsSync(directory) ? readdirSync(directory) : []));
    expect(publishedFiles.filter((fileName) => /invented|placeholder|mockup|exploratory|blank-screen/i.test(fileName))).toEqual([]);
  });
});
