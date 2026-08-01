import { test, expect } from '@playwright/test';
import fs from 'fs';

// One-off visual verification for the 2026-08-01 shared-hierarchy-diagram replacement pass.
// Captures the four affected pages at the four required viewports so the diagram and status
// grids can be inspected for clipped pills, overlapping labels, and horizontal scroll.

const VIEWPORTS: Record<string, { width: number; height: number }> = {
  desktop_1920x1080: { width: 1920, height: 1080 },
  desktop_1366x768: { width: 1366, height: 768 },
  tablet_1024x768: { width: 1024, height: 768 },
  mobile_390x844: { width: 390, height: 844 },
};

const PAGES: Record<string, string> = {
  homepage: '/',
  technologies: '/technologies',
  architecture: '/architecture',
  progress: '/progress',
};

const OUT_DIR = 'test-results/hierarchy-diagram-visual-check';
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [pageKey, path] of Object.entries(PAGES)) {
  for (const [vpKey, size] of Object.entries(VIEWPORTS)) {
    test(`${pageKey} @ ${vpKey}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: size });
      const page = await context.newPage();
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: `${OUT_DIR}/${pageKey}__${vpKey}.png`,
        fullPage: true,
      });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth, `horizontal overflow on ${pageKey} @ ${vpKey}: scrollWidth=${scrollWidth} clientWidth=${clientWidth}`).toBeLessThanOrEqual(clientWidth);
      if (pageKey === 'architecture') {
        // Bounding-box overlap check instead of a stitched screenshot: Playwright's
        // element.screenshot() re-composites sticky/fixed elements (nav, cookie banner)
        // at each scroll segment when the target is taller than the viewport, which
        // produces a banding artifact that is a capture artifact, not a real layout bug.
        const overlaps = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.arch-stack-layer'));
          const results: string[] = [];
          for (const card of cards) {
            const title = card.querySelector('.arch-layer-name');
            const badge = card.querySelector('.arch-layer-badge');
            if (!title || !badge) continue;
            const t = title.getBoundingClientRect();
            const b = badge.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const badgeClipped = b.right > cardRect.right + 1 || b.left < cardRect.left - 1;
            const titleBadgeOverlap = !(t.right < b.left || t.left > b.right || t.bottom < b.top || t.top > b.bottom);
            if (badgeClipped) results.push(`badge clipped in ${card.className}`);
            if (titleBadgeOverlap) results.push(`title/badge overlap in ${card.className}`);
          }
          return results;
        });
        expect(overlaps, `layer card issues @ ${vpKey}: ${overlaps.join('; ')}`).toEqual([]);
      }
      await context.close();
    });
  }
}
