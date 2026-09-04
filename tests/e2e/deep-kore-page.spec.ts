import { test, expect } from '@playwright/test';

// The /deep-kore page, added 2026-09-01 by owner instruction (CLAUDE.md section 19).
//
// This suite asserts the two things that are easy to get wrong later:
//
//   1. The page publishes exactly the vocabulary the amendment permitted and nothing more.
//      `public-scope-vocabulary.spec.ts` owns the other half - that this vocabulary appears on
//      NO other public route - so between them the ban has a boundary rather than a hole.
//
//   2. When the engine cannot be reached, the page says so and produces no conversation. This
//      suite runs against a static preview with no functions, so every API call fails. That is
//      not a limitation of the test - it is the strongest available proof that nothing on this
//      page can manufacture a response, because there is nothing behind it that could.

const ROUTE = '/deep-kore';

test.describe('the page is published and reachable', () => {
  test('it renders, and it leads with the claim', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('h1')).toContainText('Talk with deterministic structural cognition.');
  });

  test('it is linked from the primary navigation and the footer', async ({ page }) => {
    await page.goto('/');
    // The nav collapses below 960px, so assert the link exists in the document rather than
    // that it is visible at whatever width this project happens to use.
    await expect(page.locator(`header a[href="${ROUTE}"]`)).toHaveCount(1);
    await expect(page.locator(`footer a[href="${ROUTE}"]`)).toHaveCount(1);
  });

  test('it is in the sitemap', async ({ request }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.ok()).toBe(true);
    const body = await (await request.get('/sitemap-0.xml')).text();
    expect(body).toContain('/deep-kore');
  });
});

test.describe('what the page may say', () => {
  test('it names the system and its governance layers', async ({ page }) => {
    await page.goto(ROUTE);
    const text = (await page.locator('body').innerText()) ?? '';
    for (const name of ['Deep Kore', 'AIya', 'Genesis Goalkeeper', 'Revelation Vanguard']) {
      expect(text, `${ROUTE} is the one route that may name ${name}`).toContain(name);
    }
  });

  // Naming a governance boundary is not permission to describe it. These are the shapes a page
  // drifts into when someone tries to make it sound more impressive.
  test('it does not describe what either governance layer evaluates', async ({ page }) => {
    await page.goto(ROUTE);
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    for (const leak of [
      'gk-1',
      'gk-2',
      'gk1',
      'gk2',
      'kernelverdict',
      'conversationact',
      'state_hash',
      'transform_count',
      'process_governed_turn',
      'aiyachildengine',
      'warmed_text',
      'vanguard_diag',
      'the rules it applies are',
      'threshold',
    ]) {
      expect(text, `${ROUTE} must not expose "${leak}"`).not.toContain(leak);
    }
  });

  test('its markup carries no engine internals either', async ({ page }) => {
    await page.goto(ROUTE);
    const html = (await page.content()).toLowerCase();
    for (const leak of [
      'process_governed_turn',
      'aiyachildengine',
      'dk_session_worker',
      'deep_kore_gateway',
      'state_hash',
      'vanguard_diag',
      'x-dk-session',
      'localhost',
      '127.0.0.1',
      'd:\\',
    ]) {
      expect(html, `${ROUTE} markup must not carry "${leak}"`).not.toContain(leak);
    }
  });

  // The private origin is addressed only from the server. If its address ever appears in the
  // delivered page, the whole protected-origin arrangement is void.
  test('the browser is given no origin to call but this site', async ({ page }) => {
    await page.goto(ROUTE);
    const html = await page.content();
    expect(html).not.toMatch(/DEEP_KORE_ORIGIN_URL|CF-Access-Client-Secret|Bearer\s+[A-Za-z0-9._-]{16,}/);
  });

  test('it states the claim gates that are still open', async ({ page }) => {
    await page.goto(ROUTE);
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    expect(text).toContain('not independently validated');
    expect(text).toContain('not production-qualified');
  });

  test('it says the conversation is not kept, and says why', async ({ page }) => {
    await page.goto(ROUTE);
    const text = (await page.locator('body').innerText()) ?? '';
    expect(text).toContain('This conversation is not kept.');
    expect(text).toContain('not a setting');
  });
});

// THE APPROVED DISCLOSURE, IN BOTH PLACES, WORD FOR WORD.
//
// Owner-approved operational disclosure language, 2026-09-01. The page making the
// promise and the policy recording it must say the same thing: a privacy statement that
// differs between the two is worse than one place saying nothing, because a reader who
// checks finds a contradiction and cannot tell which one binds.
//
// Asserted against RENDERED text on both routes, so a paraphrase typed into either page
// fails here rather than being noticed by a visitor.
test.describe('the chat privacy disclosure is identical wherever it appears', () => {
  const DISCLOSURE =
    'Conversation state is temporary by default. ByteLite LLC uses an essential, secure ' +
    'session cookie to connect this browser to its active Deep Kore session. Chat content ' +
    'is processed in temporary service memory and is not retained as a central conversation ' +
    "history. The session is removed when you select 'End and delete session,' after 30 " +
    'minutes of completed inactivity, or when the temporary service restarts. Active Deep ' +
    'Kore cognition is not terminated by the inactivity policy. ByteLite LLC does not sell ' +
    'chat content or use it for advertising. Hosting and security providers may process ' +
    'limited data as necessary to operate and protect the service. Do not submit secrets, ' +
    'regulated information, or information you do not have authority to share.';

  for (const route of [ROUTE, '/privacy']) {
    test(`${route} carries the approved wording verbatim`, async ({ page }) => {
      await page.goto(route);
      // Whitespace is normalised because innerText collapses wrapped lines; the WORDS
      // are what is being asserted, and every one of them must be present in order.
      const text = ((await page.locator('body').innerText()) ?? '').replace(/\s+/g, ' ');
      expect(text, `${route} must state the approved disclosure exactly`).toContain(DISCLOSURE);
    });
  }

  // The claims inside it are commitments about how the system behaves. A page that keeps
  // the sentence but contradicts it nearby is the failure this guards against.
  test('no page contradicts the inactivity commitment', async ({ page }) => {
    for (const route of [ROUTE, '/privacy']) {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const contradiction of [
        'sessions time out after',
        'responses may be truncated',
        'cognition times out',
        'we may keep a transcript',
        'conversations are stored',
        'closing the tab discards',
      ]) {
        expect(text, `${route} must not say "${contradiction}"`).not.toContain(contradiction);
      }
    }
  });

  test('the privacy policy dates its own revision', async ({ page }) => {
    await page.goto('/privacy');
    // The page promises that material changes are dated. This change was material.
    await expect(page.locator('.legal-sub')).toContainText('September 2026');
  });
});

test.describe('the console is honest before anything is connected', () => {
  test('no session is open, and the composer cannot be used', async ({ page }) => {
    await page.goto(ROUTE);
    await expect(page.locator('.dk-console')).toHaveCount(1);
    await expect(page.locator('#dk-input')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Start a private session' })).toBeVisible();
  });

  test('the transcript is an accessible live region and starts empty', async ({ page }) => {
    await page.goto(ROUTE);
    const log = page.locator('.dk-transcript');
    await expect(log).toHaveAttribute('role', 'log');
    await expect(log).toHaveAttribute('aria-live', 'polite');
    await expect(log).toHaveAttribute('aria-label', 'Conversation');
    await expect(log.locator('.dk-turn')).toHaveCount(0);
  });

  // THE LOAD-BEARING TEST. With no function behind it, starting a session must fail, and the
  // failure must appear OUTSIDE the transcript with nothing added to the conversation. A page
  // that filled the gap here - with a canned greeting, a cached line, or website copy - would be
  // fabricating cognition, which is the one thing this feature may never do.
  test('a failed start produces an error, never a conversation', async ({ page }) => {
    await page.goto(ROUTE);
    await page.getByRole('button', { name: 'Start a private session' }).click();

    const failure = page.locator('.dk-failure');
    await expect(failure).toBeVisible();
    await expect(failure).toHaveAttribute('role', 'alert');

    // Nothing was said, by anyone.
    await expect(page.locator('.dk-transcript .dk-turn')).toHaveCount(0);
    // And the failure is not inside the transcript, so it cannot be read as a turn.
    await expect(page.locator('.dk-transcript .dk-failure')).toHaveCount(0);
    // The composer stays disabled: there is no session to type into.
    await expect(page.locator('#dk-input')).toBeDisabled();
  });

  test('the failure text is site copy, never a machine code', async ({ page }) => {
    await page.goto(ROUTE);
    await page.getByRole('button', { name: 'Start a private session' }).click();
    const text = (await page.locator('.dk-failure').innerText()) ?? '';
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toMatch(/error_code|DEEP_KORE_UNAVAILABLE|DEEP_KORE_SESSION_CAPACITY|not_configured|chat_disabled/);
  });
});

test.describe('accessibility and layout', () => {
  test('the page does not scroll horizontally at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(ROUTE);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `${ROUTE} overflows by ${overflow}px at 320 wide`).toBeLessThanOrEqual(0);
  });

  test('the console is reachable and operable by keyboard', async ({ page }) => {
    await page.goto(ROUTE);
    const start = page.getByRole('button', { name: 'Start a private session' });
    await start.focus();
    await expect(start).toBeFocused();
    // The transcript is a scrollable region, so it must be focusable to be readable by keyboard.
    await expect(page.locator('.dk-transcript')).toHaveAttribute('tabindex', '0');
  });

  test('the composer has a real label, not a placeholder standing in for one', async ({ page }) => {
    await page.goto(ROUTE);
    const label = page.locator('label[for="dk-input"]');
    await expect(label).toHaveCount(1);
    await expect(label).toContainText('Your message');
  });
});
