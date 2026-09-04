import { defineConfig, devices } from '@playwright/test';

/**
 * The LIVE Deep Kore proof, deliberately separate from the standard suite.
 *
 * `playwright.config.ts` covers `tests/e2e` and must stay hermetic: it builds the site,
 * serves it, and proves things that are true of the build alone. This config covers
 * `tests/live`, which proves something the build cannot - that a real browser, running
 * the real page against the real route handlers, reaches real cognition and gets a real
 * governed answer back.
 *
 * It is NOT part of `npm run test:e2e` and never will be. It needs a running Deep Kore
 * gateway and worker, so wiring it into the default matrix would give the suite a
 * dependency on a Windows service - and a test that self-skips when its dependency is
 * missing reports success while proving nothing, which is the exact hazard the CMake
 * zero-test guards exist to prevent. It fails loudly instead.
 *
 * Run it deliberately, after standing the stack up per OWNER_README section 21:
 *
 *     npx playwright test --config=playwright.live.config.ts
 *
 * DEEP_KORE_LIVE_BASE_URL points it at whatever is serving the site with the functions
 * attached - a local harness, `vercel dev`, or a preview deployment.
 */
export default defineConfig({
  testDir: './tests/live',
  fullyParallel: false,
  // No retries. A live conversational path that only passes on the second attempt has a
  // defect worth finding, and rerun-until-green is forbidden by CLAUDE.md section 9.
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.DEEP_KORE_LIVE_BASE_URL ?? 'http://127.0.0.1:4399',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  // Deliberately no `webServer`. The stack is the owner's to start: it spans two
  // processes in another repository plus, in production, a tunnel and Cloudflare Access.
});
