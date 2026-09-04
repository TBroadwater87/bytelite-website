import { test, expect } from '@playwright/test';

/**
 * THE LIVE PROOF. A real browser, the real /deep-kore page, the real route handlers, the
 * real gateway, a real dk_session_worker process, and real cognition.
 *
 * Run only with `--config=playwright.live.config.ts`, against a stack you started
 * yourself (OWNER_README section 21). It is not in the default matrix, and it does not
 * skip when the stack is down - it fails, because a live proof that quietly passes
 * without the thing it is proving is worse than no proof.
 *
 * Everything asserted here is a property the static suite cannot reach: that a governed
 * response actually arrives, that it carries a real stamp, that the same question
 * answers identically twice, and - the important one - that when the engine is taken
 * away, the page produces an error and no conversation.
 */

const ROUTE = '/deep-kore';

// No attempt ceiling on the conversation itself: a turn runs to intrinsic completion and
// this suite must not impose a stopping rule on it. What IS bounded is Playwright's own
// patience for an assertion, which is a property of the test runner and not of the
// engine. It is generous on purpose.
const ANSWER_TIMEOUT_MS = 120_000;

/**
 * How long cleanup will wait for a session to become releasable.
 *
 * A session with a turn in flight refuses deletion, so this is the runner's patience for
 * that turn to finish - not a bound on the turn, which the origin owns.
 */
const RELEASE_DEADLINE_MS = 120_000;

async function startSession(page: import('@playwright/test').Page) {
  await page.goto(ROUTE);
  await page.getByRole('button', { name: 'Start a private session' }).click();
  // The composer becoming usable IS the signal that a session exists. There is no
  // separate "connected" claim to trust.
  await expect(page.locator('#dk-input')).toBeEnabled({ timeout: 30_000 });
}

/**
 * Releases the upstream session a page holds, if any.
 *
 * NOT OPTIONAL HOUSEKEEPING. Each session owns a worker PROCESS. A suite that leaves
 * them behind starves the machine it is testing on, and the first symptom is not a
 * clear "too many sessions" - it is an unrelated later test failing with "the system
 * could not be reached", which reads like a product defect and is not one. Measured on
 * 2026-09-01: a full three-engine run left 46 live workers and the next test failed for
 * exactly that reason.
 *
 * Best effort by design: a page that has already navigated away or closed has nothing
 * to release, and the origin's terminal-idle policy is the backstop either way.
 */
async function releaseSession(page: import('@playwright/test').Page): Promise<void> {
  try {
    // Two tests deliberately sabotage the delete and message routes to prove the page
    // reports failures honestly. Those routes are still installed when cleanup runs, so
    // the cleanup would be sabotaged too and leak the very session it came to release.
    // Measured: exactly one leaked worker per engine, from that one test.
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.evaluate(async (deadlineMs: number) => {
      const csrf = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('__Host-dk_csrf=') || c.startsWith('dk_csrf='))
        ?.split('=')[1];
      if (!csrf) return;

      // A SESSION WITH A TURN IN FLIGHT REFUSES TO BE DELETED, and rightly so - the
      // origin will not abandon cognition midway. Cleanup therefore has to wait for the
      // turn to finish rather than give up on the first 409, or the session it came to
      // release is exactly the one it leaks. Two tests submit a turn and do not wait for
      // it, so this is not a rare case: it was one leaked worker per engine, per file.
      //
      // The bound is the runner's patience, not a limit on the turn. When it elapses the
      // session is left to the origin's terminal-idle policy, which is the backstop.
      const started = Date.now();
      for (;;) {
        const res = await fetch('/api/deep-kore/session', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'X-DK-CSRF': decodeURIComponent(csrf) },
          credentials: 'same-origin',
        }).catch(() => null);
        if (!res || res.status !== 409) return;
        if (Date.now() - started > deadlineMs) return;
        await new Promise((r) => setTimeout(r, 500));
      }
    }, RELEASE_DEADLINE_MS);
  } catch {
    // The page is gone. Nothing to release from here.
  }
}

test.afterEach(async ({ page }) => {
  await releaseSession(page);
});

async function ask(page: import('@playwright/test').Page, question: string) {
  const before = await page.locator('.dk-turn-engine').count();
  await page.locator('#dk-input').fill(question);
  await page.getByRole('button', { name: 'Send' }).click();

  // Wait for EITHER outcome, not just the good one.
  //
  // Waiting only for the answer means a turn that failed spends the full timeout
  // resolving to zero elements and then reports "expected 1, received 0" - which says
  // nothing about why. The page had the reason on screen the whole time. Racing the two
  // makes a failure immediate and self-explaining, and it does not weaken the
  // assertion: a failure still fails the test, it just says what happened.
  const answer = page.locator('.dk-turn-engine').nth(before);
  const failure = page.locator('.dk-failure');
  await Promise.race([
    answer.waitFor({ state: 'attached', timeout: ANSWER_TIMEOUT_MS }),
    failure.waitFor({ state: 'visible', timeout: ANSWER_TIMEOUT_MS }),
  ]);

  if ((await failure.count()) > 0 && (await answer.count()) === 0) {
    throw new Error(`the turn did not produce an answer; the page reported: ${await failure.innerText()}`);
  }
  await expect(page.locator('.dk-turn-engine')).toHaveCount(before + 1, {
    timeout: ANSWER_TIMEOUT_MS,
  });
  return answer;
}

test.describe('a real governed turn reaches the browser', () => {
  test('a session opens, a question is answered, and the answer is stamped', async ({ page }) => {
    await startSession(page);

    const answer = await ask(page, 'What are you?');
    const text = (await answer.locator('.dk-text').innerText()).trim();
    expect(text.length, 'the engine returned an empty response').toBeGreaterThan(0);

    // The stamp is the record that the response passed the emission gate. A response
    // shown without one would be a claim of governance with nothing behind it. It lives
    // behind the "Why this response?" disclosure, so it has to be opened to be read -
    // which is itself part of what is being proved: the record is available to any
    // visitor who wants it, and is not imposed on one who does not.
    await answer.locator('.dk-why summary').click();
    const stamp = (await answer.locator('.dk-stamp code').innerText()).trim();
    expect(stamp.length, 'the response carried no governance stamp').toBeGreaterThan(0);
    // REDACTED, and the redaction is what makes it publishable. The engine's real stamp
    // carries the state fingerprint and the policy and capability vocabulary inside it.
    expect(stamp, 'the stamp must record the gate').toContain('GOV_STAMP');
    expect(stamp, 'the state fingerprint must not be published').not.toContain('state_hash');
    expect(stamp).not.toContain('policy=');
    expect(stamp).not.toContain('caps=');

    // Nothing failed while that happened.
    await expect(page.locator('.dk-failure')).toHaveCount(0);
  });

  test('the visitor turn and the engine turn are both in the transcript, in order', async ({ page }) => {
    await startSession(page);
    await ask(page, 'What are you?');

    // textContent, not innerText: the speaker label is styled `text-transform:
    // uppercase`, so innerText returns what the CSS renders rather than what the markup
    // says, and the assertion would be about a stylesheet instead of about the DOM.
    const whos = await page.locator('.dk-turn .dk-who').allTextContents();
    expect(whos[0]).toBe('You');
    expect(whos[1]).toBe('AIya');
  });

  // The determinism the public page claims, measured through the whole chain rather than
  // at the facade. Two independent sessions, same question, identical answer.
  test('two independent sessions answer the same question identically', async ({ browser }) => {
    const a = await browser.newContext();
    const b = await browser.newContext();
    try {
      const pa = await a.newPage();
      const pb = await b.newPage();
      await startSession(pa);
      await startSession(pb);

      const ta = (await (await ask(pa, 'What are you?')).locator('.dk-text').innerText()).trim();
      const tb = (await (await ask(pb, 'What are you?')).locator('.dk-text').innerText()).trim();
      expect(tb, 'the same question produced two different answers').toBe(ta);

      // These contexts are outside the afterEach's reach, so they release their own.
      await releaseSession(pa);
      await releaseSession(pb);
    } finally {
      await a.close();
      await b.close();
    }
  });

  // ONE BROWSER CANNOT REACH ANOTHER BROWSER'S SESSION.
  //
  // Two independent contexts, so two independent cookie jars and two upstream sessions.
  // The second browser is handed the first's job id - the thing an attacker would most
  // plausibly obtain - and must not be able to read it. Both barriers are exercised at
  // once: the website sends the session it VERIFIED from the cookie rather than anything
  // the caller supplied, and the origin binds the job to its own session as well.
  test('one browser cannot read another browser session job', async ({ browser }) => {
    const a = await browser.newContext();
    const b = await browser.newContext();
    try {
      const pa = await a.newPage();
      const pb = await b.newPage();
      await startSession(pa);
      await startSession(pb);

      // Capture a real job id belonging to the first browser.
      const jobId = await pa.evaluate(async () => {
        const csrf = document.cookie
          .split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('__Host-dk_csrf=') || c.startsWith('dk_csrf='))
          ?.split('=')[1];
        const res = await fetch('/api/deep-kore/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-DK-CSRF': decodeURIComponent(csrf ?? '') },
          credentials: 'same-origin',
          body: JSON.stringify({ text: 'What are you?' }),
        });
        return ((await res.json()) as { job_id?: string }).job_id ?? '';
      });
      expect(jobId, 'the first browser did not get a job id').not.toBe('');

      // The second browser asks for it, with its own valid session, and is refused.
      const stolen = await pb.evaluate(async (id: string) => {
        const res = await fetch(`/api/deep-kore/result/${encodeURIComponent(id)}`, {
          credentials: 'same-origin',
        });
        return { status: res.status, body: await res.text() };
      }, jobId);

      expect(stolen.status, "another browser's job was readable").toBe(404);
      expect(stolen.body).not.toContain('"turn"');
      expect(stolen.body).not.toContain('"text"');

      await releaseSession(pa);
      await releaseSession(pb);
    } finally {
      await a.close();
      await b.close();
    }
  });

  test('nothing private crosses to the browser with the answer', async ({ page }) => {
    const bodies: string[] = [];
    page.on('response', async (res) => {
      if (!res.url().includes('/api/deep-kore/result/')) return;
      bodies.push(await res.text().catch(() => ''));
    });

    await startSession(page);
    await ask(page, 'What are you?');

    expect(bodies.length, 'no result response was observed').toBeGreaterThan(0);
    const seen = bodies.join('\n');
    // These are governance internals. The site canon forbids publishing them, and the
    // projection in deep-kore-core.ts is what keeps them out - measured here on the wire
    // rather than trusted from the source.
    for (const withheld of [
      'state_hash',
      'transform_count',
      'gk1_decision',
      'gk2_decision',
      'vanguard_diag',
      'warmed_text',
      'vanguard_enabled',
      'adult_consent_invariant_violated',
      'content_class',
      'resolution',
    ]) {
      expect(seen, `${withheld} reached the browser`).not.toContain(withheld);
    }
  });

  // CLAUDE.md section 14: a CSP must be validated in a REAL BROWSER against the real
  // build, because the violations that matter come from runtime fetch calls that no
  // static reading of the source reveals. A live chat turn is exactly such a call, and
  // this is the only place in the suite that makes one. Point the runner at a server
  // that serves the production CSP from vercel.json.
  test('a full turn produces no console errors and no CSP violation', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.push(msg.text());
    });
    page.on('pageerror', (err) => problems.push(`${err.name}: ${err.message}`));

    await startSession(page);
    await ask(page, 'What are you?');

    expect(problems.join('\n')).not.toMatch(/Content Security Policy|Refused to/i);
    expect(problems, `console errors during a live turn:\n${problems.join('\n')}`).toEqual([]);
  });

  // A RELOAD IS NOT A DELETION.
  //
  // An earlier version sent a DELETE on `pagehide`, which fires on ordinary navigation
  // and on a reload. Removed by owner decision. This asserts the consequence: after a
  // reload the upstream session is still there and still usable. The page's own
  // transcript is gone - it lived in the React island - but the SESSION is not, so a
  // reload costs a visitor their scrollback and nothing else.
  test('a reload does not silently destroy the upstream session', async ({ page }) => {
    await startSession(page);
    await ask(page, 'What are you?');

    await page.reload();

    // The upstream session is proven alive by using it, not by inspecting a cookie.
    const jobId = await page.evaluate(async () => {
      const csrf = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('__Host-dk_csrf=') || c.startsWith('dk_csrf='))
        ?.split('=')[1];
      const res = await fetch('/api/deep-kore/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-DK-CSRF': decodeURIComponent(csrf ?? '') },
        credentials: 'same-origin',
        body: JSON.stringify({ text: 'still there?' }),
      });
      const body = (await res.json()) as { job_id?: string; error_code?: string };
      return res.status === 202 ? (body.job_id ?? null) : `REFUSED:${res.status}:${body.error_code}`;
    });

    expect(
      jobId,
      'the session did not survive a reload; something is still treating navigation as deletion'
    ).not.toMatch(/^REFUSED/);
    expect(typeof jobId).toBe('string');
  });

  test('navigating away and back does not destroy the upstream session', async ({ page }) => {
    await startSession(page);
    await ask(page, 'What are you?');

    await page.goto('/about');
    await page.goto(ROUTE);

    // The console starts idle after a navigation - the island is new - but the cookie
    // and the upstream session are intact, so starting again is a fresh session and the
    // old one is left to the terminal-idle policy rather than destroyed by the browser.
    await expect(page.getByRole('button', { name: 'Start a private session' })).toBeVisible();
    const cookies = await page.context().cookies();
    expect(
      cookies.some((c) => c.name === '__Host-dk_session' || c.name === 'dk_session'),
      'the session cookie was cleared by navigation'
    ).toBe(true);
  });

  test('ending the session clears it', async ({ page }) => {
    await startSession(page);
    await ask(page, 'What are you?');
    await page.getByRole('button', { name: 'End and delete session' }).click();
    await expect(page.getByRole('button', { name: 'Start a private session' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('.dk-turn')).toHaveCount(0);
    await expect(page.locator('#dk-input')).toBeDisabled();
  });
});

test.describe('the page never answers from anywhere but the engine', () => {
  // THE ONE THAT MATTERS MOST. Route the message call to a hard failure - the same thing
  // the browser would see if the gateway were down or the tunnel were broken - and prove
  // the page reports it and produces NO conversation entry. Anything appearing here
  // would have come from the website, which is the single thing this feature may never
  // do.
  test('an unreachable engine produces an error and no conversation', async ({ page }) => {
    await startSession(page);
    await page.route('**/api/deep-kore/message', (route) => route.abort('failed'));

    const before = await page.locator('.dk-turn-engine').count();
    await page.locator('#dk-input').fill('What are you?');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('.dk-failure')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.dk-turn-engine')).toHaveCount(before);
    // The failure is outside the transcript, so it cannot be read as a turn.
    await expect(page.locator('.dk-transcript .dk-failure')).toHaveCount(0);
  });

  // A DELETE that never reaches the server leaves the session open THERE. Claiming it
  // was discarded would be a false success about the one thing this page promises
  // hardest - that the conversation is not kept.
  test('a failed end does not claim the session was discarded', async ({ page }) => {
    await startSession(page);
    await ask(page, 'What are you?');
    await page.route('**/api/deep-kore/session', (route) => route.abort('failed'));

    await page.getByRole('button', { name: 'End and delete session' }).click();
    await expect(page.locator('.dk-failure')).toBeVisible({ timeout: 30_000 });
    // Still open, and the transcript is intact, because nothing was actually ended.
    await expect(page.getByRole('button', { name: 'End and delete session' })).toBeVisible();
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);
  });

  test('a failed turn is reported as a failure, not as an answer', async ({ page }) => {
    await startSession(page);
    await page.route('**/api/deep-kore/result/*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ state: 'failed', error_code: 'engine_transport_failed' }),
      })
    );

    const before = await page.locator('.dk-turn-engine').count();
    await page.locator('#dk-input').fill('What are you?');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.locator('.dk-failure')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.dk-turn-engine')).toHaveCount(before);
  });
});
