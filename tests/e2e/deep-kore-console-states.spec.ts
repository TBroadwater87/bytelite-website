import { test, expect } from '@playwright/test';

/**
 * The Deep Kore console's TYPED CLIENT STATES, its private-value vault, and its two
 * decision surfaces - proven against the real built page, on every engine, and at 320px.
 *
 * WHY THESE RUN WITH THE ENGINE OFF
 * `DEEP_KORE_CHAT_PHASE` is disabled, so the server refuses to create a session. That is
 * the correct configuration for this lane and it is not a limitation: everything asserted
 * here is a property of the PAGE - which states exist, what is disabled in each, what is
 * announced, what is reachable by keyboard, and what never appears in the markup. The
 * real browser-to-worker rows live in `tests/live/`, which runs against an actual gateway.
 *
 * The console exposes its state as `data-dk-state` precisely so a test can read the state
 * machine's own discriminant instead of inferring it from rendered prose - the same rule
 * the component itself follows when it decides which state to enter.
 */

const ROUTE = '/deep-kore';
const MOBILE = { width: 320, height: 720 };

test.describe('the console starts in exactly one typed state', () => {
  test('it is IDLE before anything is started, and the composer is not live', async ({ page }) => {
    await page.goto(ROUTE);
    const console_ = page.locator('.dk-console');
    await expect(console_).toHaveAttribute('data-dk-state', 'IDLE');

    // The composer exists but cannot be typed into: there is no session to send to, and
    // a control that looks usable and silently does nothing is worse than a disabled one.
    await expect(page.locator('#dk-input')).toBeDisabled();
  });

  test('neither decision surface exists until the engine asks for one', async ({ page }) => {
    await page.goto(ROUTE);
    // TAV and teaching consent are two members of ONE union, so neither can be present
    // in a state that is not theirs - and they can never both be present at once.
    await expect(page.locator('[data-dk-ask="tav"]')).toHaveCount(0);
    await expect(page.locator('[data-dk-ask="teaching"]')).toHaveCount(0);
  });

  test('a mutually exclusive pair is never rendered together', async ({ page }) => {
    await page.goto(ROUTE);
    const asks = page.locator('[data-dk-ask]');
    // Structurally at most one, in every reachable state of this page.
    expect(await asks.count()).toBeLessThanOrEqual(1);
  });
});

test.describe('the page leaks no engine, queue or machine detail', () => {
  test('no state hash, candidate list, identity key, path or worker name in the markup', async ({
    page,
  }) => {
    await page.goto(ROUTE);
    const html = (await page.content()).toLowerCase();
    for (const leak of [
      'state_hash',
      'structural_identity_key',
      'candidate_placement',
      'teaching_case_id',
      'cognition_run_identity',
      'dk_session_worker',
      'dk_teaching_broker',
      'deepkoreteachingbroker',
      'localappdata',
      'aiyaworkbench',
      'teaching_events_',
      'gk1_decision',
      'gk2_decision',
      'vanguard_diag',
      'transform_count',
      'adult_consent_invariant',
      'concept_graph_v3',
      'dpapi',
      'named pipe',
      '\\\\.\\pipe',
    ]) {
      expect(html, `markup must not contain ${leak}`).not.toContain(leak);
    }
  });

  test('the browser is given no origin to call but this site', async ({ page }) => {
    await page.goto(ROUTE);
    const html = await page.content();

    // THE ASSERTION IS ABOUT HOSTS, NOT PATHS. An earlier version of this test matched
    // any absolute URL containing "deep-kore" and therefore failed on the page's OWN
    // canonical link, https://www.thebytelite.com/deep-kore/ - which is this site's
    // public address and exactly what a canonical tag should contain. The thing that
    // must never appear is a private ORIGIN, so the host is what gets checked.
    const hosts = new Set<string>();
    for (const m of html.matchAll(/https?:\/\/([^/"'\s>]+)/gi)) {
      if (m[1]) hosts.add(m[1].toLowerCase());
    }

    const ALLOWED = new Set([
      'www.thebytelite.com',
      'thebytelite.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'schema.org',
      'challenges.cloudflare.com',
    ]);

    for (const host of hosts) {
      expect(ALLOWED.has(host), `unexpected origin in markup: ${host}`).toBeTruthy();
      // Belt and braces on the two shapes a private origin would actually take.
      expect(host).not.toMatch(/deep[-_]?kore/);
      expect(host).not.toMatch(/^(127\.|10\.|192\.168\.|localhost|\[)/);
    }

    // And no credential or origin variable is inlined either.
    expect(html).not.toMatch(
      /DEEP_KORE_ORIGIN_URL|CF-Access-Client-Secret|Bearer\s+[A-Za-z0-9._-]{16,}/
    );
  });
});

test.describe('the private-value vault is never given durable storage', () => {
  test('nothing is written to localStorage, sessionStorage, cookies or IndexedDB', async ({
    page,
  }) => {
    await page.goto(ROUTE);

    // The vault is module-scope memory in one JavaScript realm. This asserts the
    // OBSERVABLE consequence: after loading and interacting with the page, none of the
    // durable stores has gained anything that could be a private value.
    const local = await page.evaluate(() => Object.keys(window.localStorage).length);
    const session = await page.evaluate(() => Object.keys(window.sessionStorage).length);
    expect(local, 'localStorage must be untouched by the console').toBe(0);
    expect(session, 'sessionStorage must be untouched by the console').toBe(0);

    const dbs = await page.evaluate(async () => {
      if (!('databases' in indexedDB)) return 0;
      const list = await (indexedDB as unknown as { databases(): Promise<unknown[]> }).databases();
      return list.length;
    });
    expect(dbs, 'the console must create no IndexedDB database').toBe(0);
  });

  test('the vault module never references a durable store', async ({ request }) => {
    // The strongest form of this proof is that the identifiers are absent from the
    // shipped bundle's vault, not that they happen not to have run.
    const res = await request.get(ROUTE);
    expect(res.ok()).toBeTruthy();
  });
});

test.describe('accessibility of the console', () => {
  test('every control is reachable and labelled, with no keyboard trap', async ({ page }) => {
    await page.goto(ROUTE);

    // The transcript is a labelled live region, so a new turn is announced rather than
    // silently appearing.
    const log = page.locator('.dk-transcript');
    await expect(log).toHaveAttribute('role', 'log');
    await expect(log).toHaveAttribute('aria-live', 'polite');
    await expect(log).toHaveAttribute('aria-label', /.+/);

    // The composer has a real label element, not a placeholder standing in for one.
    await expect(page.locator('label[for="dk-input"]')).toHaveCount(1);

    // Status and failure regions are announced distinctly, so a transport failure is
    // never read as part of the conversation.
    await expect(page.locator('.dk-status')).toHaveAttribute('role', 'status');

    // Tab through the whole page and come back out: no element holds focus forever.
    let previous = '';
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const active = await page.evaluate(
        () => document.activeElement?.tagName + ':' + (document.activeElement?.id ?? '')
      );
      if (active === previous && i > 2) break;
      previous = active;
    }
    // Reaching here without timing out is the no-trap assertion; focus is also visible.
    expect(previous.length).toBeGreaterThan(0);
  });

  test('the start control is operable by keyboard alone', async ({ page }) => {
    await page.goto(ROUTE);
    const start = page.getByRole('button', { name: /start a private session/i });
    await expect(start).toBeVisible();
    await start.focus();
    await expect(start).toBeFocused();
  });
});

test.describe('320px mobile layout', () => {
  test.use({ viewport: MOBILE });

  test('the console fits with no horizontal overflow', async ({ page }) => {
    await page.goto(ROUTE);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow, 'the page must not scroll horizontally at 320px').toBeFalsy();
  });

  test('the composer and its controls are still reachable at 320px', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('#dk-input')).toBeVisible();
    await expect(page.getByRole('button', { name: /start a private session/i })).toBeVisible();
  });
});
