import { test, expect } from '@playwright/test';

// Accessibility and layout guards for the ByteLite public surface (2026-08-22 scope reset).
// The teaching diagrams are pure CSS/HTML, so they are subject to the same overflow, zoom,
// keyboard and reduced-motion rules as the prose around them.

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/validation',
  '/licensing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

// Browser zoom shrinks the CSS viewport: at a 1280px window, 200% zoom is ~640 CSS px and
// 400% zoom is ~320 CSS px. Emulating the resulting widths is the reliable cross-engine way
// to assert the WCAG 1.4.10 reflow requirement.
const WIDTHS = [
  { label: '320px (400% zoom)', width: 320 },
  { label: '640px (200% zoom)', width: 640 },
  { label: '768px tablet', width: 768 },
  { label: '1280px desktop', width: 1280 },
];

for (const { label, width } of WIDTHS) {
  test.describe(`No horizontal overflow at ${label}`, () => {
    for (const route of PUBLIC_ROUTES) {
      test(`${route} does not scroll horizontally`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        // A 1px rounding tolerance; anything wider is a real overflow.
        expect(
          overflow.scrollWidth - overflow.clientWidth,
          `${route} at ${width}px: scrollWidth ${overflow.scrollWidth} vs clientWidth ${overflow.clientWidth}`
        ).toBeLessThanOrEqual(1);
      });
    }
  });
}

test.describe('Document structure', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has exactly one H1 and no skipped heading level`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);

      const levels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((els) => els.map((e) => Number(e.tagName.slice(1))));
      let prev = 0;
      for (const level of levels) {
        if (prev !== 0) {
          expect(level, `${route} skips from h${prev} to h${level}`).toBeLessThanOrEqual(prev + 1);
        }
        prev = level;
      }
    });
  }

  test('every public page declares a language and a canonical URL', async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    }
  });
});

test.describe('Keyboard operability', () => {
  test('the header is reachable by keyboard and the nav toggle is labelled', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#navToggle');
    await expect(toggle).toHaveAttribute('aria-label', /toggle navigation/i);
    await expect(toggle).toHaveAttribute('aria-controls', 'navLinks');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('the mobile nav toggle reports its expanded state', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const toggle = page.locator('#navToggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('the collapsible technical drawers open with the keyboard alone', async ({ page }) => {
    await page.goto('/how-it-works');
    const summary = page.locator('details summary').first();
    await summary.focus();
    await expect(summary).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('details').first()).toHaveAttribute('open', '');
  });

  test('every focusable control on the contact form has a visible focus indicator', async ({ page }) => {
    await page.goto('/contact?type=licensing');
    for (const id of ['#ct-name', '#ct-email', '#ct-subject', '#ct-organization', '#ct-message', '#ct-consent']) {
      await page.locator(id).focus();
      const outline = await page.locator(id).evaluate((el) => {
        const s = getComputedStyle(el);
        return { outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
      });
      const hasIndicator =
        (outline.outlineStyle !== 'none' && outline.outlineWidth !== '0px') ||
        (outline.boxShadow !== 'none' && outline.boxShadow !== '');
      expect(hasIndicator, `${id} must show a focus indicator`).toBe(true);
    }
  });
});

test.describe('Reduced motion', () => {
  test('the homepage renders and stays operable with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    // Content must not depend on an animation having run.
    await expect(page.locator('main')).toBeVisible();
    const hidden = await page
      .locator('main h2')
      .evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity === '0').length);
    expect(hidden, 'no heading may be left at opacity 0 when motion is reduced').toBe(0);
  });
});

test.describe('Teaching diagrams are text, not images', () => {
  test('no diagram is delivered as an image that would be lost to a screen reader', async ({ page }) => {
    for (const route of ['/', '/how-it-works', '/validation', '/licensing']) {
      await page.goto(route);
      // The only <img> on a public page is the header logo, which is decorative (alt="").
      const imgs = await page
        .locator('main img')
        .evaluateAll((els) => els.map((e) => e.getAttribute('src') || ''));
      expect(imgs, `${route} should render its diagrams as markup, not images`).toEqual([]);
    }
  });

  test('the roundtrip and accounting diagrams expose their content as text', async ({ page }) => {
    await page.goto('/how-it-works');
    const body = page.locator('body');
    await expect(body).toContainText('hash(original)');
    await expect(body).toContainText('Complete ByteLite artifact');
    await expect(body).toContainText('All required reconstruction information');
  });

  test('the current-vs-final diagram is markup, and its state is written in words', async ({ page }) => {
    await page.goto('/how-it-works');
    const fig = page.locator('.cf').first();
    await expect(fig.locator('img')).toHaveCount(0);
    // Both column states are readable as text, not conveyed by the border colour alone.
    await expect(fig).toContainText('Current development');
    await expect(fig).toContainText('Final target');
  });

  test('the roadmap states every gate in words, not by colour alone', async ({ page }) => {
    await page.goto('/validation');
    const rows = page.locator('.rm-item');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('.rm-state')).not.toBeEmpty();
    }
  });
});
