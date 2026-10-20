import { test, expect } from '@playwright/test';
import { ALL_PAGE_ROUTES } from './public-routes';

const REFLOW_WIDTHS = [320, 375, 640, 768, 1024, 1366, 1920];

for (const width of REFLOW_WIDTHS) {
  test.describe(`No horizontal overflow at ${width}px`, () => {
    for (const route of ALL_PAGE_ROUTES) {
      test(`${route} does not scroll horizontally`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const widths = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(widths.scrollWidth - widths.clientWidth, `${route} at ${width}px overflows`).toBeLessThanOrEqual(1);
      });
    }
  });
}

test.describe('Images', () => {
  for (const route of ALL_PAGE_ROUTES) {
    test(`${route} gives every image alt text and reserved dimensions`, async ({ page }) => {
      await page.goto(route);
      const images = await page.locator('img').evaluateAll((elements) =>
        elements.map((element) => ({
          source: element.getAttribute('src') ?? '',
          alternativeText: element.getAttribute('alt'),
          width: element.getAttribute('width'),
          height: element.getAttribute('height'),
        })),
      );
      for (const image of images) {
        expect(image.alternativeText, `${route}: ${image.source} needs an alt attribute`).not.toBeNull();
        if (image.alternativeText !== '') expect(image.alternativeText!.length).toBeGreaterThan(10);
        expect(image.width, `${route}: ${image.source} needs a width`).toBeTruthy();
        expect(image.height, `${route}: ${image.source} needs a height`).toBeTruthy();
      }
    });
  }

  test('every image loads and keeps its aspect ratio', async ({ page }) => {
    for (const route of ['/', '/cordel-play']) {
      await page.goto(route);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForLoadState('networkidle');
      const problems = await page.locator('img').evaluateAll((elements) =>
        elements
          .map((element) => element as HTMLImageElement)
          .filter((image) => {
            if (!image.complete || image.naturalWidth === 0) return true;
            const box = image.getBoundingClientRect();
            if (!box.width || !box.height) return false;
            const intrinsicRatio = image.naturalWidth / image.naturalHeight;
            return Math.abs(intrinsicRatio - box.width / box.height) / intrinsicRatio > 0.02;
          })
          .map((image) => image.getAttribute('src') ?? ''),
      );
      expect(problems, `${route} has broken or distorted images`).toEqual([]);
    }
  });
});

test.describe('Document structure', () => {
  for (const route of ALL_PAGE_ROUTES) {
    test(`${route} has one H1, no skipped heading level, a language and a canonical URL`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
      let previousLevel = 0;
      for (const level of levels) {
        if (previousLevel !== 0) expect(level, `${route} skips from h${previousLevel} to h${level}`).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      }
    });

    test(`${route} has landmarks and a working skip link`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('header.site-header')).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);
      await expect(page.locator('footer.site-footer')).toHaveCount(1);
      const firstFocusableClass = await page.evaluate(
        () => document.querySelector('a[href], button:not([disabled]), input, select, textarea')?.className ?? '',
      );
      expect(firstFocusableClass).toContain('skip-link');
      await page.locator('.skip-link').focus();
      await expect(page.locator('.skip-link')).toBeInViewport();
    });
  }

  test('transactional and policy pages are excluded from indexing', async ({ page }) => {
    for (const route of ['/checkout/success', '/checkout/cancel', '/billing', '/responsible-disclosure', '/404']) {
      await page.goto(route);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    }
  });
});

test.describe('Contrast and focus', () => {
  test('body text and muted text meet WCAG AA contrast in light and dark schemes', async ({ page }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto('/research/milestones');
      const ratios = await page.evaluate(() => {
        function channel(value: number) {
          const normalized = value / 255;
          return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        }
        function luminance(color: string) {
          const parts = color.match(/\d+(\.\d+)?/g)!.map(Number);
          return 0.2126 * channel(parts[0]!) + 0.7152 * channel(parts[1]!) + 0.0722 * channel(parts[2]!);
        }
        function contrast(foreground: string, background: string) {
          const lighter = Math.max(luminance(foreground), luminance(background));
          const darker = Math.min(luminance(foreground), luminance(background));
          return (lighter + 0.05) / (darker + 0.05);
        }
        const canvas = getComputedStyle(document.body).backgroundColor;
        const selectors = ['p', '.small-print', '.eyebrow', '.status-badge', 'a', '.milestone-label'];
        return selectors.map((selector) => {
          const element = document.querySelector(selector);
          if (!element) return { selector, ratio: 99 };
          const style = getComputedStyle(element);
          const background = style.backgroundColor === 'rgba(0, 0, 0, 0)' ? canvas : style.backgroundColor;
          return { selector, ratio: contrast(style.color, background) };
        });
      });
      for (const { selector, ratio } of ratios) {
        expect(ratio, `${selector} contrast in ${colorScheme} scheme`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('every contact form control shows a visible focus indicator', async ({ page }) => {
    await page.goto('/contact?type=licensing');
    for (const selector of ['#contact-name', '#contact-email', '#contact-inquiry-type', '#contact-organization', '#contact-message', '#contact-consent']) {
      await page.locator(selector).focus();
      const indicator = await page.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element);
        return style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
      });
      expect(indicator, `${selector} must show a focus indicator`).toBe(true);
    }
  });

  test('reduced motion leaves every heading visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const hiddenHeadings = await page.locator('main h2').evaluateAll((headings) => headings.filter((heading) => getComputedStyle(heading).opacity === '0').length);
    expect(hiddenHeadings).toBe(0);
  });
});

test.describe('Withdrawn drafts stay withdrawn', () => {
  for (const route of ['/preorder-terms', '/supporter-terms', '/how-it-works']) {
    test(`${route} has no page in the build`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(404);
    });
  }
});
