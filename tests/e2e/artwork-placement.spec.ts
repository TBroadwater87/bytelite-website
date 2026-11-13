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

const MINIMUM_CONCEPT_ARTWORK_ALT_TEXT_LENGTH = 20;
const MAXIMUM_RELATIVE_ASPECT_RATIO_DISTORTION = 0.02;
const REVIEW_ONLY_ARTWORK_FILENAME_MARKERS = /invented|placeholder|mockup|exploratory|blank-screen/i;

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
        expect(((await image.getAttribute('alt')) ?? '').length).toBeGreaterThan(MINIMUM_CONCEPT_ARTWORK_ALT_TEXT_LENGTH);
        await expect(image).toHaveAttribute('loading', source === artwork.aboveTheFold ? 'eager' : 'lazy');

        const figure = page.locator('figure.art-figure', { has: page.locator(`img[src="${source}"]`) });
        await expect(figure.locator('.figure-classification')).toHaveText('Conceptual illustration');
        await expect(figure.locator('figcaption')).toBeVisible();

        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0), { message: `${source} loads` })
          .toBe(true);
        const aspectRatios = await image.evaluate((element) => {
          const imageElement = element as HTMLImageElement;
          const renderedBox = imageElement.getBoundingClientRect();
          return { naturalRatio: imageElement.naturalWidth / imageElement.naturalHeight, renderedRatio: renderedBox.width / renderedBox.height };
        });
        expect(Math.abs(aspectRatios.naturalRatio - aspectRatios.renderedRatio) / aspectRatios.naturalRatio).toBeLessThan(MAXIMUM_RELATIVE_ASPECT_RATIO_DISTORTION);
      }
    });
  }

  test('the public Cordel Play page never presents an adult-tier product name in any capitalisation, and shows no tier artwork', async ({ page }) => {
    await page.goto('/cordel-play');
    const surfaces = {
      sourceMarkup: await page.content(),
      renderedText: await page.locator('body').innerText(),
    };
    const capitalisationForms = (word: string) => [word.toUpperCase(), word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()];
    const tierWordForms = (word: string) => [word, word.toUpperCase(), word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(), word.toLowerCase()];
    const wholeWord = (form: string) => new RegExp('\\b' + form + '\\b');
    const alwaysForbidden = ['Seduce'];
    const ordinaryEnglishTierNames = ['Stimulate', 'Edge', 'Climax', 'Decree'];
    const ambiguousProductNames = ['Initiate', 'Connect'];
    const tierContextWords = ['tier', 'deck', ...alwaysForbidden, ...ordinaryEnglishTierNames].flatMap(tierWordForms);
    const tierContextAlternation = '(' + tierContextWords.join('|') + ')';
    for (const [surfaceName, surface] of Object.entries(surfaces)) {
      for (const name of alwaysForbidden) {
        expect(surface, surfaceName + ' must not contain ' + name + ' in any case').not.toMatch(new RegExp('\\b' + name + '\\b', 'i'));
      }
      for (const name of ordinaryEnglishTierNames) {
        for (const form of capitalisationForms(name)) {
          expect(surface, surfaceName + ' must not present ' + form + ' as a tier name').not.toMatch(wholeWord(form));
        }
      }
      for (const name of ambiguousProductNames) {
        for (const form of capitalisationForms(name)) {
          expect(surface, surfaceName + ' must not present ' + form + ' before a tier word').not.toMatch(new RegExp('\\b' + form + '\\b[^<]{0,60}\\b' + tierContextAlternation + '\\b'));
          expect(surface, surfaceName + ' must not present ' + form + ' after a tier word').not.toMatch(new RegExp('\\b' + tierContextAlternation + '\\b[^<]{0,60}\\b' + form + '\\b'));
        }
      }
    }
    await expect(page.locator('img[src*="cordel-play-board-landscape"], img[src*="cordel-play-tier-deck-backs"]')).toHaveCount(0);
  });

  for (const route of Object.keys(ARTWORK_BY_ROUTE)) {
    test(`${route} keeps conceptual artwork outside its evidence tiles`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('.proof-tile img, .proof-tile figure, .claim-boundary img')).toHaveCount(0);
    });
  }

  test('no review-only product concept is published', () => {
    const publishedFiles = ['public/art', 'public/cordel'].flatMap((directory) => (existsSync(directory) ? readdirSync(directory) : []));
    expect(publishedFiles.filter((fileName) => REVIEW_ONLY_ARTWORK_FILENAME_MARKERS.test(fileName))).toEqual([]);
  });
});
