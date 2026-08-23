import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Always 1 worker: with 5 browser-engine projects sharing one machine, concurrent
  // cold starts compete for CPU and produce transient navigation timeouts (reproduced
  // and diagnosed 2026-07-26 - isolated single-worker Firefox runs were consistently
  // clean; the failures only appeared when all 5 engines launched at once). Sequential
  // execution is slower but deterministic - not solved by retries or longer timeouts.
  workers: 1,
  // open: 'never' - an unattended/automated run must exit naturally after writing the report,
  // not block indefinitely serving it over HTTP waiting for a human to press Ctrl+C.
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    // Production preview, not `astro dev` - the dev toolbar overlay intercepts pointer events
    // and blocks real click interactions in tests (e.g. the cookie banner's Accept button).
    command: 'npm run build && npm run preview',
    port: 4321,
    // Never reuse a server this run did not start, locally or in CI.
    //
    // The hazard is NOT that a lingering server pins an old dist - measured, `astro preview`
    // serves from disk per request, so mutating dist under a running server is reflected on the
    // very next request. The hazard is that `reuseExistingServer: true` makes Playwright skip
    // `command` altogether when the port is already listening, so `npm run build` never runs and
    // the suite silently tests whatever dist an earlier build left behind. Measured both ways:
    // with reuse ON and the port occupied, a marker file planted in dist survived the run (build
    // skipped, tests green against a dist the run did not produce); with reuse OFF, Playwright
    // aborts with "http://localhost:4321 is already used".
    //
    // So this setting buys a guarantee: either the run builds and serves its own build, or it
    // fails loudly with a legible port collision. It never silently tests stale output.
    // `npm run test:e2e:clean` (scripts/e2e-clean.ps1) clears a stale server of our own first.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});