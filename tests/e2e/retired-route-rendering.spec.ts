import { test, expect } from '@playwright/test';

// Replaces hierarchy-diagram-visual-check.spec.ts (2026-08-22).
//
// WHY THAT SPEC WAS REPLACED
// --------------------------
// It was written as a "one-off visual verification for the 2026-08-01 shared-hierarchy-diagram
// replacement pass" - a human review aid. Its own comment recorded that the fullPage screenshots
// were "a review aid, not an assertion". That review concluded, and the public scope reset since
// changed what the routes are for:
//
//   * "/" was rebuilt and carries no hierarchy diagram at all, and its overflow is covered at
//     four widths (320/640/768/1280) by public-scope-accessibility.spec.ts - strictly better
//     coverage than this file gave it.
//   * /technologies, /architecture and /progress are retired from discovery: still built, still
//     200, served noindex, linked from nowhere. Zero pages in dist link to them.
//
// The surviving contract for those three routes is that they still RENDER correctly - no
// horizontal overflow - and that /architecture's layer cards, the only real hierarchy diagram
// left in the codebase, do not clip or overlap. That is what this file tests.
//
// WHY IT IS SHAPED THIS WAY (the Firefox flake)
// ---------------------------------------------
// The old spec intermittently blew its 90s budget in Firefox during full-project runs, on an
// arbitrary one of its 16 tests. Measured, per phase, in a controlled 224-context stress run:
// browser.newContext() stayed flat at ~1.7s worst case and goto+networkidle stayed flat at ~4s,
// while worst-case fullPage screenshot time grew monotonically from 576ms to 2577ms as the
// Firefox process accumulated contexts. The screenshots were the only degrading component, and
// they asserted nothing. The real assertions are synchronous DOM reads costing milliseconds.
//
// So this file removes the nondeterministic surface instead of tuning around it:
//   * no screenshots - the degrading, non-asserting work is gone;
//   * 4 tests using Playwright's managed `page` fixture instead of 16 hand-rolled contexts, so
//     the spec no longer piles extra contexts onto a long-lived browser process;
//   * viewports applied with setViewportSize rather than a fresh context each time;
//   * readiness is `load` + document.fonts.ready + a paint, not networkidle - fonts decide the
//     text metrics this test measures, and fonts.ready is bounded whereas networkidle waits on
//     whatever the network happens to be doing;
//   * no test.slow(): determinism has to hold inside the default timeout, which is the proof.

const VIEWPORTS: Record<string, { width: number; height: number }> = {
  desktop_1920x1080: { width: 1920, height: 1080 },
  desktop_1366x768: { width: 1366, height: 768 },
  tablet_1024x768: { width: 1024, height: 768 },
  mobile_390x844: { width: 390, height: 844 },
};

// Retired from discovery, not deleted. Kept resolvable so existing links and bookmarks do not
// 404; each is served noindex and appears in no sitemap, header, or footer.
const RETIRED_ROUTES: Record<string, string> = {
  technologies: '/technologies',
  architecture: '/architecture',
  progress: '/progress',
};

/**
 * Deterministic readiness for a layout measurement: the document has loaded, webfont loading has
 * settled (fonts change text metrics, which change wrap points, which change overflow), and one
 * frame has been painted so layout is flushed.
 */
async function settled(page: import('@playwright/test').Page) {
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

for (const [routeKey, path] of Object.entries(RETIRED_ROUTES)) {
  test(`${routeKey} renders without horizontal overflow at every viewport`, async ({ page }) => {
    for (const [vpKey, size] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(size);
      await page.goto(path);
      await settled(page);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        scrollWidth,
        `horizontal overflow on ${routeKey} @ ${vpKey}: scrollWidth=${scrollWidth} clientWidth=${clientWidth}`
      ).toBeLessThanOrEqual(clientWidth);
    }
  });
}

test('architecture layer cards neither clip nor overlap at any viewport', async ({ page }) => {
  for (const [vpKey, size] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(size);
    await page.goto(RETIRED_ROUTES.architecture as string);
    await settled(page);

    // Bounding-box geometry rather than a stitched screenshot: element.screenshot() re-composites
    // sticky/fixed elements at each scroll segment when the target is taller than the viewport,
    // which produces a banding artifact that is a capture artifact, not a real layout bug.
    const issues = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.arch-stack-layer'));
      const results: string[] = [];
      for (const card of cards) {
        const title = card.querySelector('.arch-layer-name');
        const badge = card.querySelector('.arch-layer-badge');
        if (!title || !badge) continue;
        const t = title.getBoundingClientRect();
        const b = badge.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        if (b.right > cardRect.right + 1 || b.left < cardRect.left - 1) {
          results.push(`badge clipped in ${card.className}`);
        }
        const overlap = !(t.right < b.left || t.left > b.right || t.bottom < b.top || t.top > b.bottom);
        if (overlap) results.push(`title/badge overlap in ${card.className}`);
      }
      return results;
    });
    expect(issues, `layer card issues @ ${vpKey}: ${issues.join('; ')}`).toEqual([]);
  }
});

test('the hierarchy diagram this file guards still exists to be guarded', async ({ page }) => {
  // Guards against the opposite failure mode: if /architecture ever stops rendering layer cards,
  // the overlap test above would vacuously pass against an empty list. It must fail loudly
  // instead, so that a future reader re-audits whether this contract is still wanted rather than
  // inheriting a test that checks nothing.
  await page.goto(RETIRED_ROUTES.architecture as string);
  await settled(page);
  await expect(page.locator('.arch-stack-layer')).not.toHaveCount(0);
});

test('the retired routes stay retired: resolvable, noindex, and linked from nowhere', async ({ page, request }) => {
  for (const [routeKey, path] of Object.entries(RETIRED_ROUTES)) {
    const response = await request.get(path);
    expect(response.status(), `${routeKey} must still resolve`).toBe(200);
    expect(await response.text(), `${routeKey} must be noindex`).toContain('noindex, nofollow');
  }

  // No public page may link into a retired section - the reason these routes are allowed to
  // keep existing at all.
  for (const publicRoute of ['/', '/how-it-works', '/validation', '/licensing', '/about', '/contact']) {
    await page.goto(publicRoute);
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href') || ''));
    for (const retired of Object.values(RETIRED_ROUTES)) {
      const leaks = hrefs.filter((h) => h === retired || h.startsWith(`${retired}/`));
      expect(leaks, `${publicRoute} links into retired ${retired}`).toEqual([]);
    }
  }
});
