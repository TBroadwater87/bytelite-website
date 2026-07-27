// One-off visual/responsive QA sweep. Not a permanent test - run manually against a live
// preview server, produces qa/screenshots/* and a console report of defects found.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:4321';
const SCREENSHOT_DIR = path.join(process.cwd(), 'qa', 'screenshots');

const ROUTES = [
  ['/', 'home'],
  ['/technologies', 'technologies'],
  ['/technologies/bytelite', 'tech-bytelite'],
  ['/technologies/bytesight', 'tech-bytesight'],
  ['/technologies/deep-kore', 'tech-deep-kore'],
  ['/technologies/deep-kore/aiya', 'tech-aiya'],
  ['/technologies/deep-kore/genesis-goalkeeper', 'tech-genesis-goalkeeper'],
  ['/technologies/byteoracle', 'tech-byteoracle'],
  ['/technologies/byteflow', 'tech-byteflow'],
  ['/technologies/bytecost', 'tech-bytecost'],
  ['/architecture', 'architecture'],
  ['/architecture/deterministic-design-principles', 'arch-principles'],
  ['/architecture/governance-and-intrinsic-halting', 'arch-governance'],
  ['/architecture/proof-and-claim-posture', 'arch-proof-posture'],
  ['/architecture/integration-map', 'arch-integration-map'],
  ['/products/heartstrings-play', 'hsp-overview'],
  ['/products/heartstrings-play/how-it-plays', 'hsp-how-it-plays'],
  ['/products/heartstrings-play/editions', 'hsp-editions'],
  ['/products/heartstrings-play/components', 'hsp-components'],
  ['/products/heartstrings-play/consent-architecture', 'hsp-consent'],
  ['/products/heartstrings-play/development-status', 'hsp-dev-status'],
  ['/products/heartstrings-play/preorder', 'hsp-preorder'],
  ['/products/heartstrings-connect', 'hsc-overview'],
  ['/products/heartstrings-connect/compatibility-and-matching', 'hsc-compatibility'],
  ['/products/heartstrings-connect/privacy-architecture', 'hsc-privacy'],
  ['/products/heartstrings-connect/safety', 'hsc-safety'],
  ['/products/heartstrings-connect/cartoonized-profiles', 'hsc-cartoonized'],
  ['/products/heartstrings-connect/aiya-and-aion', 'hsc-aiya-aion'],
  ['/products/heartstrings-connect/games-and-shared-activities', 'hsc-games'],
  ['/products/heartstrings-connect/byteoracle-horoscopes', 'hsc-byteoracle'],
  ['/products/heartstrings-connect/date-planning', 'hsc-date-planning'],
  ['/products/heartstrings-connect/date-planning/blind-date-roulette', 'hsc-blind-date'],
  ['/products/heartstrings-connect/date-planning/restaurants', 'hsc-restaurants'],
  ['/products/heartstrings-connect/date-planning/restaurants/partner-program', 'hsc-partner-program'],
  ['/progress', 'progress'],
  ['/progress/validation-evidence', 'progress-validation'],
  ['/progress/development-timeline', 'progress-timeline'],
  ['/progress/changelog', 'progress-changelog'],
  ['/preorder', 'preorder'],
  ['/preorder/founder-benefits', 'preorder-founder-benefits'],
  ['/preorder/terms', 'preorder-terms'],
  ['/preorder/status', 'preorder-status'],
  ['/company', 'company'],
  ['/company/founder', 'company-founder'],
  ['/company/partnerships', 'company-partnerships'],
  ['/company/investors', 'company-investors'],
  ['/company/legal', 'company-legal'],
  ['/contact', 'contact'],
  ['/terms', 'terms'],
  ['/privacy', 'privacy'],
];

const BREAKPOINTS = [
  { width: 375, height: 812, label: 'mobile-sm' },
  { width: 430, height: 932, label: 'mobile-lg' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 1280, height: 900, label: 'laptop' },
  { width: 1536, height: 960, label: 'desktop' },
  { width: 1920, height: 1080, label: 'wide' },
];

// Release-candidate pass: capture all 6 breakpoints (not just 2) so the evidence set
// matches the full matrix that's actually being checked for defects.
const SCREENSHOT_WIDTHS = new Set(BREAKPOINTS.map((b) => b.width));

const issues = [];

function logIssue(route, breakpoint, msg) {
  issues.push({ route, breakpoint, msg });
  console.log(`ISSUE  ${route}  [${breakpoint}]  ${msg}`);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  for (const [route, slug] of ROUTES) {
    for (const bp of BREAKPOINTS) {
      const page = await context.newPage();
      const consoleErrors = [];
      const failedRequests = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('requestfailed', (req) => {
        failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`);
      });
      page.on('response', (res) => {
        if (res.status() >= 400) failedRequests.push(`${res.url()} :: HTTP ${res.status()}`);
      });

      await page.setViewportSize({ width: bp.width, height: bp.height });
      let navError = null;
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
      } catch (e) {
        navError = e.message;
      }

      if (navError) {
        logIssue(route, bp.label, `navigation failed: ${navError}`);
        await page.close();
        continue;
      }

      // Horizontal overflow check
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
      });
      if (overflow.scrollWidth > overflow.clientWidth + 2) {
        logIssue(route, bp.label, `horizontal overflow: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
      }

      // Images missing alt
      const badImages = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter((img) => !img.hasAttribute('alt'))
          .map((img) => img.getAttribute('src'))
      );
      if (badImages.length) {
        logIssue(route, bp.label, `image(s) missing alt: ${badImages.join(', ')}`);
      }

      // Broken images (naturalWidth 0 after load, for eager/visible images)
      const brokenImages = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img')).filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src'))
      );
      if (brokenImages.length) {
        logIssue(route, bp.label, `broken image(s): ${brokenImages.join(', ')}`);
      }

      if (consoleErrors.length) {
        logIssue(route, bp.label, `console error(s): ${consoleErrors.slice(0, 3).join(' | ')}`);
      }
      if (failedRequests.length) {
        logIssue(route, bp.label, `failed request(s): ${failedRequests.slice(0, 5).join(' | ')}`);
      }

      if (SCREENSHOT_WIDTHS.has(bp.width)) {
        const fname = `${slug}-${bp.width}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, fname), fullPage: true });
      }

      await page.close();
    }
  }

  await browser.close();

  console.log('\n=== SUMMARY ===');
  console.log(`Routes checked: ${ROUTES.length}`);
  console.log(`Breakpoints per route: ${BREAKPOINTS.length}`);
  console.log(`Total issues found: ${issues.length}`);
  fs.writeFileSync(path.join(process.cwd(), 'qa', 'qa-sweep-results.json'), JSON.stringify(issues, null, 2));
  if (issues.length) process.exitCode = 1;
}

main();
