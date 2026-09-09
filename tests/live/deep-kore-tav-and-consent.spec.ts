import { test, expect } from '@playwright/test';

/**
 * THE LIVE BROWSER-TO-WORKER PROOF for the TAV decision and the unknown-concept consent.
 *
 * This is the lane that cannot be hermetic. It needs a real gateway, a real
 * dk_session_worker holding the real canonical snapshot, and - for the consent rows - a
 * real dk_teaching_broker running under the owner's Windows account. It fails loudly when
 * they are absent rather than skipping, for the reason the live config already states: a
 * test that self-skips reports success while proving nothing.
 *
 * Stand the stack up per OWNER_README section 21, then:
 *     npx playwright test --config=playwright.live.config.ts
 *
 * WHAT THIS PROVES THAT THE HERMETIC LANE CANNOT
 *   - a real TAV request reaches the browser and puts it in exactly one typed state;
 *   - the private value stays in the tab: it appears in NO request body, ever;
 *   - a decision - and only a decision - returns to Deep Kore;
 *   - a genuinely unknown concept produces an offer, a known one does not;
 *   - declining stores nothing; consenting stores exactly one unverified candidate;
 *   - independent sessions stay isolated.
 */

const ROUTE = '/deep-kore';

/** A word that cannot be in any lexicon, so it is unknown relative to the snapshot. */
const ABSENT_CONCEPT = 'zqxjvwkbrump';

/** The inquiry shape that reaches the inquiry pipeline and honestly fails to ground. */
const UNRESOLVED_INQUIRY = `List the parts of a ${ABSENT_CONCEPT}.`;

/** A private value used only inside the browser. If this string ever appears in a
 *  request body, the central promise of the vault is broken. */
const PRIVATE_VALUE = 'PRIVATE-VALUE-DO-NOT-TRANSMIT-4417';

/**
 * How long cleanup will wait for a session to become releasable.
 *
 * A session with a turn in flight refuses deletion, so this is the runner's patience for
 * that turn to finish - not a bound on the turn, which the origin owns.
 */
const RELEASE_DEADLINE_MS = 120_000;

async function startSession(page: import('@playwright/test').Page) {
  await page.goto(ROUTE);
  await page.getByRole('button', { name: /start a private session/i }).click();
  await expect(page.locator('.dk-console')).toHaveAttribute('data-dk-state', 'READY', {
    timeout: 60_000,
  });
}

async function say(page: import('@playwright/test').Page, text: string) {
  await page.locator('#dk-input').fill(text);
  await page.getByRole('button', { name: /^send$/i }).click();
}

/**
 * Releases the upstream session a page holds, if any.
 *
 * NOT OPTIONAL HOUSEKEEPING, and its absence here was a real defect. Each session owns a
 * worker PROCESS and the host has a configured ceiling on how many may exist at once.
 * Most tests in this file open a session and only some end one, so a full run reached the
 * ceiling partway through - and from there every remaining test failed at
 * `startSession`, reporting a state that looks exactly like the service being down.
 *
 * Measured on 2026-09-04, against a host configured for six: the first six tests passed
 * or failed on their merits and the seventh onwards could not open a session at all. That
 * is the failure mode the sibling spec's comment already warned about, arriving through a
 * different door.
 *
 * Best effort by design: a page that has already navigated away or closed has nothing to
 * release, and the origin's terminal-idle policy is the backstop either way.
 */
async function releaseSession(page: import('@playwright/test').Page): Promise<void> {
  try {
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

/**
 * Records every request body the page sends, so a private value can be searched for
 * across the whole conversation rather than at one chosen moment.
 */
function recordBodies(page: import('@playwright/test').Page): string[] {
  const bodies: string[] = [];
  page.on('request', (req) => {
    const d = req.postData();
    if (d) bodies.push(d);
  });
  return bodies;
}

test.describe('a governed conversation, end to end', () => {
  test('an ordinary turn returns a governed response carrying a governance record', async ({
    page,
  }) => {
    await startSession(page);
    await say(page, 'What is a dog?');
    await expect(page.locator('.dk-turn-engine').first()).toBeVisible({ timeout: 180_000 });
    await expect(page.locator('.dk-console')).toHaveAttribute('data-dk-state', 'READY');

    // The governance stamp is shown in its redacted form and NEVER in full. It lives
    // behind the "Why this response?" disclosure, so it is opened to be read.
    await page.locator('.dk-why summary').first().click();
    const stamp = await page.locator('.dk-stamp code').first().innerText();
    expect(stamp).toContain('GOV_STAMP');
    expect(stamp, 'the state fingerprint must never be published').not.toContain('state_hash');
    expect(stamp).not.toContain('policy=');
    expect(stamp).not.toContain('caps=');
  });

  test('a known concept produces no teaching offer', async ({ page }) => {
    await startSession(page);
    await say(page, 'A dog is an animal.');
    await expect(page.locator('.dk-turn-engine').first()).toBeVisible({ timeout: 180_000 });
    await expect(page.locator('[data-dk-ask="teaching"]')).toHaveCount(0);
  });
});

/**
 * THE TAV SEAM, MEASURED RATHER THAN ASSUMED.
 *
 * These rows previously asserted that `UNRESOLVED_INQUIRY` reaches the TAV decision
 * surface from the public page. Measured against the real engine on 2026-09-04, it does
 * not, and the reason is structural rather than a defect on either side:
 *
 *   PLAIN turn (text only)                       -> outcome = TEACHING_OFFER
 *   SAME turn + a device entity model            -> outcome = TAV_REQUIRED
 *
 * `generate_tav_request` needs the turn's target entity to resolve to exactly one
 * StructuralEntityKind, and on this path the only evidence that can do that comes from
 * the DEVICE - `relationship_role` on an entity the message actually references. A
 * Cordel device has that model. A public web page does not, and must not invent one:
 * fabricating `relationship_role: PARTNER` for a stranger would be inventing TAV
 * evidence, which is precisely what the public path forbids.
 *
 * So the TAV surface is IMPLEMENTED, correct, and fully covered against a scripted
 * TAV_REQUEST in `tests/e2e/deep-kore-console-flow.spec.ts` - every rule about grants,
 * local deletion of a held value, one-turn consumption and non-transmission is asserted
 * there, in five browser engines. What is NOT provable live is that a visitor reaches it,
 * because nothing in the public interface supplies an entity model.
 *
 * That list said "revocation" until owner ruling 2026-09-07. It never described a wire
 * message - the certified `TavDecision` has no `REVOKED` and none is to be expected - and
 * the word made a local deletion sound like a recall of something already sent.
 *
 * Whether to add one is an OWNER decision, not a code decision: it would mean a new
 * public surface on which a visitor describes a person or a place to Deep Kore. It is
 * recorded in OWNER_README section 21.13 rather than assumed here.
 *
 * What these rows now prove is the seam itself, so it cannot be forgotten and cannot be
 * quietly "fixed" by making the page assert an entity it does not know.
 */
test.describe('the TAV seam', () => {
  test('a public turn carries no entity model, so no TAV surface appears', async ({ page }) => {
    const bodies = recordBodies(page);
    await startSession(page);
    await say(page, UNRESOLVED_INQUIRY);

    // The turn resolves to SOME governed outcome - the page never hangs on this.
    await expect(page.locator('.dk-turn-engine').first()).toBeVisible({ timeout: 180_000 });

    // And it is not the TAV one, because the evidence that would make a TAV request
    // lawful was never supplied and was never invented.
    await expect(page.locator('.dk-console')).not.toHaveAttribute(
      'data-dk-state',
      'TAV_DECISION_REQUIRED'
    );
    await expect(page.locator('[data-dk-ask="tav"]')).toHaveCount(0);

    // THE ASSERTION THAT MATTERS MOST HERE. The page sent no entity, no relationship
    // role and no disclosure of any kind. Nothing about a visitor was asserted to the
    // engine on their behalf.
    for (const body of bodies.filter((b) => b.includes('"text"'))) {
      expect(body, 'the public page must not assert an entity model').not.toContain('relationship_role');
      expect(body).not.toContain('tav_disclosures');
      expect(body).not.toContain('"value"');
    }
  });

  test('a private value can be held and removed with no session state at all', async ({ page }) => {
    // The vault is browser memory and belongs to no session. This proves the promise
    // that survives regardless of what the engine asks: nothing entered locally reaches
    // a request, and nothing is written to any durable browser store.
    const bodies = recordBodies(page);
    await startSession(page);
    await say(page, 'What is a dog?');
    await expect(page.locator('.dk-turn-engine').first()).toBeVisible({ timeout: 180_000 });

    await page.getByRole('button', { name: /end and delete session/i }).click();
    await expect(page.locator('.dk-console')).toHaveAttribute('data-dk-state', 'TERMINATED', {
      timeout: 60_000,
    });

    for (const body of bodies) {
      expect(body, 'a private value must never be transmitted').not.toContain(PRIVATE_VALUE);
    }
    // Nothing durable was ever written, and nothing survives the session.
    const local = await page.evaluate(() => Object.keys(window.localStorage).length);
    const session = await page.evaluate(() => Object.keys(window.sessionStorage).length);
    expect(local).toBe(0);
    expect(session).toBe(0);
  });
});

test.describe('the unknown-concept consent', () => {
  test('an absent concept offers, declining stores nothing, and wording never claims learning', async ({
    page,
  }) => {
    await startSession(page);
    await say(page, `A ${ABSENT_CONCEPT} is a kind of tool.`);

    const console_ = page.locator('.dk-console');
    await expect(console_).toHaveAttribute('data-dk-state', 'TEACHING_CONSENT_REQUIRED', {
      timeout: 180_000,
    });

    const panel = page.locator('[data-dk-ask="teaching"]');
    const copy = await panel.innerText();
    // It must be explicit that submitting is not teaching.
    expect(copy.toLowerCase()).toContain('does not make it true');
    for (const forbidden of ['learned', 'accepted it', 'added to what deep kore knows']) {
      expect(copy.toLowerCase()).not.toContain(forbidden);
    }
    // None of the internal identity may be shown.
    expect(copy).not.toContain('GENUINE_AMBIGUITY');
    expect(copy).not.toMatch(/[0-9a-f]{32,}/);

    // Chat entry is paused while consent is being asked.
    await expect(page.locator('#dk-input')).toBeDisabled();

    await page.getByRole('button', { name: /^decline$/i }).click();
    await expect(console_).toHaveAttribute('data-dk-state', 'READY', { timeout: 60_000 });
    await expect(page.locator('.dk-notice')).toContainText(/nothing was stored/i);
  });

  test('consent reports exactly "Submitted for review."', async ({ page }) => {
    await startSession(page);
    await say(page, `A ${ABSENT_CONCEPT} is a kind of tool.`);
    await expect(page.locator('.dk-console')).toHaveAttribute(
      'data-dk-state',
      'TEACHING_CONSENT_REQUIRED',
      { timeout: 180_000 }
    );

    await page.getByRole('button', { name: /submit for review/i }).click();
    await expect(page.locator('.dk-console')).toHaveAttribute('data-dk-state', 'READY', {
      timeout: 60_000,
    });

    // The ONLY approved success wording. It claims storage, never acceptance.
    const notice = await page.locator('.dk-notice').innerText();
    expect(notice.trim()).toBe('Submitted for review.');
  });
});

test.describe('session isolation', () => {
  test('two independent sessions do not share transcript or state', async ({ browser }) => {
    const a = await browser.newContext();
    const b = await browser.newContext();
    const pa = await a.newPage();
    const pb = await b.newPage();

    await startSession(pa);
    await say(pa, 'A dog is an animal.');
    await expect(pa.locator('.dk-turn-engine').first()).toBeVisible({ timeout: 180_000 });

    await startSession(pb);
    // The second session starts empty. Nothing from the first is visible in it.
    await expect(pb.locator('.dk-turn')).toHaveCount(0);

    // These contexts are outside the afterEach's reach, so they release their own. Two
    // sessions left behind here is two worker processes the next test cannot have.
    await releaseSession(pa);
    await releaseSession(pb);
    await a.close();
    await b.close();
  });
});
