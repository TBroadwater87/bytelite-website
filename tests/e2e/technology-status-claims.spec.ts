import { test, expect } from '@playwright/test';

// Regression guards for the 2026-07-31 evidence-based technology-status synchronization pass.
// These assert the specific stale claims that were corrected do not silently return, and that
// the specific prohibited claim categories are never introduced on these pages.

test.describe('ByteOracle status reflects current evidence', () => {
  test('is not described as merely a concept with no built engine', async ({ page }) => {
    await page.goto('/technologies/byteoracle');
    const body = page.locator('body');
    await expect(body).not.toContainText('ByteOracle is presented here as a concept');
    await expect(body).not.toContainText('has not been built yet and should be read as a target');
    await expect(body).toContainText('9-stage deterministic');
    await expect(body).toContainText('Internally Validated');
  });
});

test.describe('Deep Kore status reflects current evidence', () => {
  test('is not described as submission intake only', async ({ page }) => {
    await page.goto('/technologies/deep-kore');
    const body = page.locator('body');
    await expect(body).not.toContainText('Structured submission intake with rate-limited logging');
    await expect(body).toContainText('32 inquiry types');
    await expect(body).toContainText('governance gate');
  });
});

test.describe('ByteSight status reflects current evidence', () => {
  test('is not described as having no working prototype', async ({ page }) => {
    await page.goto('/technologies/bytesight');
    const body = page.locator('body');
    await expect(body).not.toContainText('No public demonstration or benchmark exists yet');
    await expect(body).not.toContainText('This is early research, not a working prototype');
    await expect(body).toContainText('workbench');
    await expect(body).toContainText('Internally Validated');
  });
});

test.describe('Internal validation is never overstated as independent verification', () => {
  const pages = ['/technologies/byteoracle', '/technologies/deep-kore', '/technologies/bytesight', '/technologies/deep-kore/genesis-goalkeeper'];

  for (const path of pages) {
    test(`${path} never claims independent (third-party) validation`, async ({ page }) => {
      await page.goto(path);
      const body = page.locator('body');
      // The honest disclaimer form is "Not independently verified by a party outside ByteLite LLC" -
      // assert that disclaimer is present, and that the affirmative phrase "independently validated"
      // (which would claim third-party verification) never appears.
      await expect(body).toContainText('Not independently verified');
      const text = (await body.textContent()) ?? '';
      expect(text.toLowerCase()).not.toContain('independently validated');
    });
  }
});

test.describe('No prohibited claim categories are introduced', () => {
  const pages = ['/technologies/byteoracle', '/technologies/deep-kore', '/technologies/bytesight', '/technologies/deep-kore/aiya', '/technologies/deep-kore/genesis-goalkeeper'];

  for (const path of pages) {
    test(`${path} makes no AGI, consciousness, biometric, or scientific-prediction claim`, async ({ page }) => {
      await page.goto(path);
      const body = page.locator('body');
      const text = ((await body.textContent()) ?? '').toLowerCase();

      // Affirmative phrasings that would constitute a prohibited claim - none of these appear
      // anywhere in the corrected copy, only negations of them.
      const prohibited = [
        'achieves agi',
        'true agi',
        'is conscious',
        'is sentient',
        'self-aware',
        'biometric identity recognition',
        'can identify who this is',
        'face identification capability',
        'scientifically proven',
        'medically certified',
        'guaranteed prediction',
      ];
      for (const phrase of prohibited) {
        expect(text, `${path} should not contain "${phrase}"`).not.toContain(phrase);
      }
    });
  }

  test('ByteSight page explicitly denies biometric/identity capability', async ({ page }) => {
    await page.goto('/technologies/bytesight');
    await expect(page.locator('body')).toContainText('Not biometric face recognition or identity matching');
  });

  test('Deep Kore page explicitly denies AGI/consciousness claims', async ({ page }) => {
    await page.goto('/technologies/deep-kore');
    await expect(page.locator('body')).toContainText('Not a claim of human-equivalent reasoning, consciousness, sentience, or finished AGI');
  });
});

test.describe('No HeartStrings-branded content on synchronized pages', () => {
  const pages = [
    '/technologies/byteoracle',
    '/technologies/deep-kore',
    '/technologies/bytesight',
    '/technologies/deep-kore/aiya',
    '/technologies/deep-kore/genesis-goalkeeper',
    '/products/cordel-connect/byteoracle-horoscopes',
    '/progress',
    '/progress/validation-evidence',
    '/progress/development-timeline',
  ];

  for (const path of pages) {
    test(`${path} contains no HeartStrings branding`, async ({ page }) => {
      await page.goto(path);
      const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
      expect(text).not.toContain('heartstrings');
    });
  }
});
