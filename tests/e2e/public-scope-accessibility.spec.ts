import { test, expect } from '@playwright/test';

// Accessibility and layout guards, rewritten 2026-08-26.
//
// THE IMAGE RULE CHANGED, AND ITS REASON DID NOT.
//
// This suite used to assert that `main img` was EMPTY on the four core routes - teaching diagrams
// had to be CSS/HTML so they survived zoom, reflow and a screen reader. The owner has since
// approved nine IP-safe brand graphics in primary content, so a blanket ban is wrong.
//
// The ban is therefore NARROWED, not deleted. Images are allowed; an image being the ONLY carrier
// of its meaning is not. Measured reason: these renders are 1672px wide and their sub-labels land
// at roughly 5px inside a 320px viewport, where the text is simply gone. So every content image
// must have real alt text, real intrinsic dimensions, and real semantic HTML beside it.

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
];

// Browser zoom shrinks the CSS viewport: at a 1280px window, 200% zoom is ~640 CSS px and 400%
// zoom is ~320 CSS px. Emulating the resulting widths is the reliable cross-engine way to assert
// the WCAG 1.4.10 reflow requirement.
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
        expect(
          overflow.scrollWidth - overflow.clientWidth,
          `${route} at ${width}px: scrollWidth ${overflow.scrollWidth} vs clientWidth ${overflow.clientWidth}`
        ).toBeLessThanOrEqual(1);
      });
    }
  });
}

test.describe('Content images are reinforcement, never the only copy', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} gives every content image alt text and reserved space`, async ({ page }) => {
      await page.goto(route);
      const imgs = await page.locator('main img').evaluateAll((els) =>
        els.map((e) => ({
          src: e.getAttribute('src') ?? '',
          alt: e.getAttribute('alt'),
          width: e.getAttribute('width'),
          height: e.getAttribute('height'),
          loading: e.getAttribute('loading'),
        }))
      );

      for (const img of imgs) {
        // A decorative image declares itself with alt="". Anything else must describe itself.
        expect(img.alt, `${route}: ${img.src} needs an alt attribute`).not.toBeNull();
        if (img.alt !== '') {
          expect(img.alt!.length, `${route}: ${img.src} needs meaningful alt text`).toBeGreaterThan(10);
        }
        // Intrinsic dimensions reserve the box before the bytes land: no layout shift.
        expect(img.width, `${route}: ${img.src} needs an intrinsic width`).toBeTruthy();
        expect(img.height, `${route}: ${img.src} needs an intrinsic height`).toBeTruthy();
      }
    });
  }

  test('no content image is stretched away from its intrinsic aspect ratio', async ({ page }) => {
    for (const route of ['/', '/how-it-works', '/validation', '/founder-access', '/about']) {
      await page.goto(route);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const bad = await page.locator('main img').evaluateAll((els) =>
        els
          .filter((e) => {
            const img = e as HTMLImageElement;
            if (!img.naturalWidth || !img.naturalHeight) return false;
            const r = img.getBoundingClientRect();
            if (!r.width || !r.height) return false;
            const intrinsic = img.naturalWidth / img.naturalHeight;
            const rendered = r.width / r.height;
            // 2% tolerance absorbs sub-pixel rounding of an auto height.
            return Math.abs(intrinsic - rendered) / intrinsic > 0.02;
          })
          .map((e) => e.getAttribute('src') ?? '')
      );
      expect(bad, `${route} renders a distorted image`).toEqual([]);
    }
  });

  // The narrowed ban. Each graphic's meaning must also exist as text on the same page, so a
  // screen reader, a 320px viewport and a search engine all still get it.
  const TEXT_EQUIVALENTS: Array<{ route: string; image: string; mustAlsoSay: string[] }> = [
    {
      route: '/',
      image: 'proof-before-claim-ladder.webp',
      mustAlsoSay: ['Proven internally', 'Not proven'],
    },
    {
      route: '/',
      image: 'audience-entry-cards.webp',
      mustAlsoSay: ['For people', 'For organizations', 'For technical reviewers'],
    },
    {
      route: '/how-it-works',
      image: 'deterministic-flow-diagram.webp',
      mustAlsoSay: ['Source', 'Result', 'Evidence', 'Status', 'Limitations', 'Review'],
    },
    {
      route: '/how-it-works',
      image: 'byte-vs-blackbox-comparison.webp',
      mustAlsoSay: ['Deterministic operation', 'Explicit constraints', 'Auditable artifacts'],
    },
    {
      route: '/founder-access',
      image: 'founder-preorder-highlight.webp',
      mustAlsoSay: ['10% lower founder price', '10% additional qualifying entitlement'],
    },
  ];

  for (const { route, image, mustAlsoSay } of TEXT_EQUIVALENTS) {
    test(`${route}: ${image} has a real text equivalent`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator(`main img[src*="${image}"]`)).toHaveCount(1);
      const body = page.locator('body');
      for (const phrase of mustAlsoSay) {
        await expect(body, `${route} must state "${phrase}" as text, not only inside ${image}`).toContainText(phrase);
      }
    });
  }

  // Lazy-loading the largest element on the first screen delays the LCP rather than helping it.
  test('the homepage hero graphic is eager; everything below the fold is lazy', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('main img[src*="bytelite-stack-hero.webp"]');
    await expect(hero).toHaveAttribute('loading', 'eager');
    await expect(hero).toHaveAttribute('fetchpriority', 'high');

    const belowFold = await page
      .locator('main img:not([src*="bytelite-stack-hero.webp"])')
      .evaluateAll((els) => els.map((e) => e.getAttribute('loading')));
    for (const loading of belowFold) {
      expect(loading).toBe('lazy');
    }
  });

  test('the withheld milestone graphic is published nowhere', async ({ page }) => {
    // It renders Validation and Product Build as passed stations, which contradicts
    // "None of it has been independently verified." CLAUDE.md section 16.
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await expect(
        page.locator('img[src*="milestone-timeline"]'),
        `${route} must not publish milestone-timeline.webp`
      ).toHaveCount(0);
    }
  });
});

// The two legal drafts were WITHDRAWN on 2026-08-29, not merely de-indexed.
//
// Owner decision: an unreviewed legal document should not be publicly reachable at all. `noindex`
// keeps a page out of a search index; it does not stop anyone who has the URL from reading it and
// treating it as ByteLite LLC's position. The pages are deleted from the build; their content
// survives in git history. Nothing on the site may link to them, and no checkout that would
// depend on them is enabled.
test.describe('Unreviewed legal drafts are gone, not hidden', () => {
  for (const route of ['/preorder-terms', '/supporter-terms']) {
    test(`${route} returns 404`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status(), `${route} must not be reachable`).toBe(404);
    });
  }

  test('no page links to a withdrawn draft', async ({ page }) => {
    for (const route of ['/', '/support', '/founder-access', '/terms', '/cordel-play', '/cordel-connect']) {
      await page.goto(route);
      const hrefs = await page
        .locator('a[href]')
        .evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
      const leaks = hrefs.filter((h) => h.includes('preorder-terms') || h.includes('supporter-terms'));
      expect(leaks, `${route} still links to a withdrawn draft`).toEqual([]);
    }
  });
});

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

  // Commerce actions must be real controls, never a clickable image or a styled div.
  test('every founder action is a real button or link', async ({ page }) => {
    await page.goto('/founder-access');
    const controls = page.locator('.fa-actions button, .fa-actions a');
    expect(await controls.count()).toBeGreaterThan(0);
    const tags = await controls.evaluateAll((els) => els.map((e) => e.tagName));
    for (const tag of tags) {
      expect(['BUTTON', 'A']).toContain(tag);
    }
  });
});

test.describe('Reduced motion', () => {
  test('the homepage renders and stays operable with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    const hidden = await page
      .locator('main h2')
      .evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity === '0').length);
    expect(hidden, 'no heading may be left at opacity 0 when motion is reduced').toBe(0);
  });
});

test.describe('Teaching diagrams stay text', () => {
  // The CSS/HTML teaching diagrams were NOT replaced by the brand graphics. They remain markup.
  test('the roundtrip and accounting diagrams expose their content as text', async ({ page }) => {
    await page.goto('/how-it-works');
    const body = page.locator('body');
    await expect(body).toContainText('hash(original)');
    await expect(body).toContainText('Complete ByteLite artifact');
  });

  test('the current-vs-final diagram is markup, and its state is written in words', async ({ page }) => {
    await page.goto('/how-it-works');
    const fig = page.locator('.cf').first();
    await expect(fig.locator('img')).toHaveCount(0);
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
