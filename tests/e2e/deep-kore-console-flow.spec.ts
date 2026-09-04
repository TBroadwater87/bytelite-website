import { test, expect, type Page, type Route } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * THE CONSOLE'S COMPLETE STATE MACHINE, DRIVEN IN A REAL BROWSER, ON EVERY ENGINE.
 *
 * WHAT THIS PROVES, AND - MORE IMPORTANTLY - WHAT IT DOES NOT.
 *
 * The TRANSPORT is mocked here. Every `/api/deep-kore/*` response in this file is
 * written by this file, so nothing in it is evidence that Deep Kore works, that the
 * gateway works, that a worker starts, or that any governed cognition happened. It is
 * evidence about ONE thing: that this website, given each response the server contract
 * permits, enters the right state and shows the right thing.
 *
 * That distinction is the reason this suite exists separately from `tests/live/`, which
 * runs the same page against a real gateway and a real worker and proves the other half.
 * Neither substitutes for the other, and a mocked pass must never be reported as a live
 * one.
 *
 * WHY MOCK AT ALL, THEN. Because several of these states cannot be produced on demand
 * from a real engine - a full host, an unreachable origin, a malformed result - and a
 * state that is only ever reached by accident is a state nobody has ever looked at. The
 * capacity message, the unavailable message and the terminal failure are exactly the
 * screens a visitor sees on the worst day, and they are checked here on all five engines
 * because that is the only way to check them at all.
 *
 * The console exposes `data-dk-state`, so these tests read the state machine's own
 * discriminant rather than inferring a state from rendered prose - the same rule the
 * component follows when it decides which state to enter.
 */

const ROUTE = '/deep-kore';
const MOBILE = { width: 320, height: 720 };

// A synthetic value, never a real one. It exists to be looked for in places it must
// never appear, so it is deliberately distinctive.
const PRIVATE_VALUE = 'SYNTHETIC-VAULT-VALUE-8931';

// DELIBERATELY NOT UNDER `test-results/`. That is Playwright's own output directory and
// it is emptied at the start of every run - including the live run, which would silently
// delete the evidence the hermetic run had just produced. Measured: the screenshots from
// a clean five-engine run were gone half a minute after it finished.
const SHOT_ROOT = join('screenshots', 'deep-kore');

/**
 * Captures one named state, in one representative engine per form factor.
 *
 * Not captured on every project: five copies of the same screen is not five times the
 * evidence, and the functional assertions - which DO run everywhere - are what proves
 * the engines agree. `desktop` shots come from Chromium, `mobile` from the Pixel 5
 * profile, because those are the two viewports the layout is actually different in.
 */
async function shot(
  page: Page,
  name: string,
  form: 'desktop' | 'mobile' = 'desktop',
  scope: 'console' | 'page' = 'console'
) {
  const project = test.info().project.name;
  const wanted = form === 'desktop' ? 'chromium' : 'Mobile Chrome';
  if (project !== wanted) return;
  const dir = join(SHOT_ROOT, form);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${name}.png`);

  if (scope === 'page') {
    await page.screenshot({ path, fullPage: false });
    return;
  }
  // Scoped to the console, because the state being recorded is the console's. A viewport
  // capture of a tall page shows whatever happens to be scrolled into it, which is not
  // the same thing as showing the state.
  const el = page.locator('.dk-console');
  await el.scrollIntoViewIfNeeded();
  // The site header is `position: sticky`, and the console is taller than the viewport,
  // so a stitched element capture ends up with the header painted across the middle of
  // it. Hiding it for the capture only affects the picture, never the page under test.
  await el.screenshot({ path, style: 'header { visibility: hidden !important; }' });
}

/**
 * Takes the consent banner off the screen before a state is recorded.
 *
 * It is fixed to the bottom of the viewport, so it covers the decision controls in every
 * capture that includes them - and a screenshot of a control that cannot be seen proves
 * nothing about the control. `Decline analytics` is used rather than `Accept all` because
 * refusing is the choice that changes least about the page.
 */
async function settleBanner(page: Page) {
  const decline = page.getByRole('button', { name: 'Decline analytics' });
  if (await decline.isVisible().catch(() => false)) {
    await decline.click();
    await expect(decline).toBeHidden();
  }
}

interface Answer {
  status: number;
  body: unknown;
}

interface Script {
  session?: Answer;
  message?: Answer;
  /** Consumed in order. The last entry repeats, so a script need not count polls. */
  polls?: Answer[];
  del?: Answer;
  consent?: Answer;
}

interface Recorded {
  method: string;
  path: string;
  body: string | null;
}

const OK_SESSION: Answer = {
  status: 201,
  body: { ok: true, persona: 'AIYA', canon_version: null, csrf_token: 'csrf-token-for-test', max_message_bytes: 8192 },
};
const OK_MESSAGE: Answer = { status: 202, body: { job_id: 'job-test-1', duplicate: false } };
const OK_DELETE: Answer = { status: 200, body: { deleted: true } };

const governedTurn = (text: string) => ({
  state: 'succeeded',
  result: {
    kind: 'GOVERNED_TEXT',
    turn: {
      text,
      persona: 'AIYA',
      governance: { passed: true, stamp: 'GOV_STAMP|gk=pass|persona=AIYA' },
    },
  },
});

const RUNNING: Answer = { status: 200, body: { state: 'running' } };

const TAV_REQUEST: Answer = {
  status: 200,
  body: {
    state: 'succeeded',
    result: {
      kind: 'TAV_REQUEST',
      turn: {
        text: 'I need one fact to answer that.',
        persona: 'AIYA',
        governance: { passed: true, stamp: 'GOV_STAMP|gk=pass|persona=AIYA' },
      },
      tav: {
        tav_id: 'tav-test-1',
        entity_ref: 'e1',
        field: 'PHONE_NUMBER',
        purpose: 'RESPONSE_REQUIRES_LITERAL_VALUE',
      },
    },
  },
};

const TEACHING_OFFER: Answer = {
  status: 200,
  body: {
    state: 'succeeded',
    result: {
      kind: 'UNKNOWN_CONCEPT_OFFER',
      turn: {
        text: 'One term in that message is not one I hold.',
        persona: 'AIYA',
        governance: { passed: true, stamp: 'GOV_STAMP|gk=pass|persona=AIYA' },
      },
      offer: { reference: 'ab12'.repeat(8), description: 'One unrecognised term.' },
    },
  },
};

/**
 * Installs the scripted transport and returns the recorded requests.
 *
 * Every request the page makes is recorded, body included, because several assertions
 * here are about what the page did NOT send - and "it never appears in any request" is
 * only checkable against the complete list.
 */
async function installTransport(page: Page, script: Script): Promise<Recorded[]> {
  const recorded: Recorded[] = [];
  let pollIndex = 0;

  await page.route('**/api/deep-kore/**', async (route: Route) => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const method = req.method();
    recorded.push({ method, path, body: req.postData() });

    const answer = (a: Answer) =>
      route.fulfill({
        status: a.status,
        contentType: 'application/json',
        body: JSON.stringify(a.body),
      });

    if (path.endsWith('/api/deep-kore/session')) {
      return answer(method === 'DELETE' ? (script.del ?? OK_DELETE) : (script.session ?? OK_SESSION));
    }
    if (path.endsWith('/api/deep-kore/message')) {
      return answer(script.message ?? OK_MESSAGE);
    }
    if (path.endsWith('/api/deep-kore/consent')) {
      return answer(script.consent ?? { status: 200, body: { submitted: true } });
    }
    if (path.includes('/api/deep-kore/result/')) {
      const polls = script.polls ?? [governedTurn('A governed answer.')].map((body) => ({ status: 200, body }));
      const a = polls[Math.min(pollIndex, polls.length - 1)]!;
      pollIndex += 1;
      return answer(a);
    }
    return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });

  return recorded;
}

const consoleState = (page: Page) => page.locator('.dk-console');
const startButton = (page: Page) => page.getByRole('button', { name: 'Start a private session' });
const sendButton = (page: Page) => page.getByRole('button', { name: 'Send', exact: true });
const composer = (page: Page) => page.locator('#dk-input');

async function startSession(page: Page) {
  await startButton(page).click();
  await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');
}

async function say(page: Page, text: string) {
  await composer(page).fill(text);
  await sendButton(page).click();
}

// ---------------------------------------------------------------------------
// The ordinary path
// ---------------------------------------------------------------------------

test.describe('a session opens, a turn is answered, and the session is ended', () => {
  test('the whole ordinary path, state by state', async ({ page }) => {
    const recorded = await installTransport(page, {
      polls: [RUNNING, { status: 200, body: governedTurn('Deterministic, and resolved from structure.') }],
    });
    await page.goto(ROUTE);

    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'IDLE');
    // The one capture that is deliberately of the whole viewport: this is the page a
    // first-time visitor meets, consent banner included.
    await shot(page, '01-idle', 'desktop', 'page');
    await settleBanner(page);
    await settleBanner(page);
    await shot(page, '01b-idle-console');

    await startSession(page);
    await expect(composer(page)).toBeEnabled();
    await expect(page.locator('.dk-empty')).toBeVisible();
    await settleBanner(page);
    await shot(page, '02-session-open');

    await say(page, 'What are you?');

    // The visitor's own turn is in the transcript immediately, and the status region -
    // which is NOT the transcript - says a turn is running.
    await expect(page.locator('.dk-turn-visitor .dk-text')).toHaveText('What are you?');
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TURN_IN_PROGRESS');
    await expect(page.locator('.dk-status')).toContainText('Working');
    await settleBanner(page);
    await shot(page, '03-visitor-message-submitted');
    await settleBanner(page);
    await shot(page, '05-processing');

    await expect(page.locator('.dk-turn-engine .dk-text')).toHaveText(
      'Deterministic, and resolved from structure.'
    );
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');
    await settleBanner(page);
    await shot(page, '04-governed-response');

    // THE GOVERNANCE RECORD IS AVAILABLE, NOT IMPOSED. It lives behind a disclosure, so a
    // visitor reading a conversation is not given a stamp under every sentence and one
    // who wants it does not have to ask anyone.
    const why = page.locator('.dk-why');
    await expect(why).toHaveCount(1);
    await expect(page.locator('.dk-stamp code')).toBeHidden();
    await why.locator('summary').click();
    await expect(page.locator('.dk-stamp code')).toHaveText('GOV_STAMP|gk=pass|persona=AIYA');
    await expect(page.locator('.dk-why-gate')).toHaveAttribute('data-dk-gate', 'passed');
    // And it says plainly that there is no provenance to show, rather than leaving the
    // absence of one to be read as an oversight.
    await expect(why).toContainText('no source list, no confidence score and no reasoning trace');
    await shot(page, '04b-governed-response-why');

    await page.getByRole('button', { name: 'End and delete session' }).click();
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TERMINATED');
    // The transcript is gone, and the page says so rather than leaving it on screen.
    await expect(page.locator('.dk-turn')).toHaveCount(0);
    await settleBanner(page);
    await shot(page, '15-session-ended');

    // The browser addressed this site and nothing else, and chose no identifier.
    for (const r of recorded) {
      expect(r.path.startsWith('/api/deep-kore/')).toBe(true);
      if (r.body) {
        const body = JSON.parse(r.body) as Record<string, unknown>;
        expect(Object.keys(body)).not.toContain('session_id');
        expect(Object.keys(body)).not.toContain('job_id');
      }
    }
  });

  test('a second turn cannot be started while one is running', async ({ page }) => {
    await installTransport(page, { polls: [RUNNING] });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'A question that keeps running.');

    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TURN_IN_PROGRESS');
    // Structural, not advisory: the composer is live in READY and in no other state.
    await expect(composer(page)).toBeDisabled();
    await expect(sendButton(page)).toBeDisabled();
    await expect(page.getByRole('button', { name: 'End and delete session' })).toBeDisabled();
    // And it says WHY, rather than leaving a greyed box to be interpreted.
    await expect(page.locator('#dk-composer-why')).toContainText('One message is handled at a time');
  });

  test('the wait can be stopped without stopping the turn, and the page says so', async ({ page }) => {
    await installTransport(page, { polls: [RUNNING] });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'A long one.');

    await page.getByRole('button', { name: 'Stop waiting' }).click();
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');
    // Deliberately honest. Stopping the wait is a decision about the visitor's own
    // attention; it is not a stopping rule imposed on cognition.
    await expect(page.locator('.dk-failure')).toContainText('still running on the server');
  });

  test('a reload starts the page over: the transcript lived in the page', async ({ page }) => {
    await installTransport(page, {
      polls: [{ status: 200, body: governedTurn('An answer.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Hello.');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);

    await page.reload();
    // Nothing was persisted, so nothing comes back. A reload is not a deletion either -
    // that is the server's business and this page makes no claim about it.
    await expect(page.locator('.dk-turn')).toHaveCount(0);
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'IDLE');
  });
});

// ---------------------------------------------------------------------------
// TAV
// ---------------------------------------------------------------------------

test.describe('a value the visitor keeps on their own device', () => {
  test('a TAV request is rendered as a typed question, with nothing preselected', async ({ page }) => {
    await installTransport(page, { polls: [TAV_REQUEST] });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'List the parts of a zqxjvwkbrump.');

    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TAV_DECISION_REQUIRED');
    const ask = page.locator('[data-dk-ask="tav"]');
    await expect(ask).toBeVisible();
    await expect(ask.locator('code')).toHaveText('PHONE_NUMBER');
    // The request is a PREDICATE. There is no value in it and nothing for the page to
    // evaluate, which is why a TAV request can never be a script-delivery channel.
    await expect(ask).toContainText('never the value itself');
    // No checked input anywhere, and no autofocus onto the permitting control.
    await expect(ask.locator('input:checked')).toHaveCount(0);

    // Focus moved to the question, because the conversation cannot continue until it is
    // answered - and a region that appears silently under a disabled composer is one a
    // keyboard or screen-reader user has no reason to look for.
    //
    // Asserted BEFORE the consent banner is dismissed: dismissing it is a click, and a
    // click moves focus. Recording the screenshot must not disturb what is being tested.
    await expect(ask).toBeFocused();
    // The composer is not usable past it. A stray Enter must not stand in for an answer.
    await expect(composer(page)).toBeDisabled();
    await expect(page.locator('#dk-composer-why')).toContainText('Answer the question above first');

    await settleBanner(page);
    await shot(page, '06-tav-request');
  });

  test('declining evaluates nothing and sends only a typed refusal', async ({ page }) => {
    const recorded = await installTransport(page, {
      polls: [TAV_REQUEST, { status: 200, body: governedTurn('Understood. I will work without it.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'List the parts of a zqxjvwkbrump.');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeVisible();

    await page.getByRole('button', { name: 'Decline', exact: true }).click();
    await expect(page.locator('.dk-notice')).toContainText('Nothing was evaluated and nothing was sent');
    await settleBanner(page);
    await shot(page, '07-tav-denial');

    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');

    const continuation = recorded.filter((r) => r.path.endsWith('/message')).at(-1)!;
    const body = JSON.parse(continuation.body!) as {
      device: { tav_disclosures: Array<Record<string, unknown>> };
    };
    expect(body.device.tav_disclosures[0]!['decision']).toBe('DENIED_BY_USER');
    expect(Object.keys(body.device.tav_disclosures[0]!).sort()).toEqual([
      'decision',
      'field',
      'target_entity_id',
      'tav_id',
    ]);
  });

  test('a permitted turn still transmits no value, and the grant is consumed once', async ({ page }) => {
    const recorded = await installTransport(page, {
      polls: [
        TAV_REQUEST,
        { status: 200, body: governedTurn('Answered without the literal.') },
        TAV_REQUEST,
        { status: 200, body: governedTurn('Answered again.') },
      ],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'List the parts of a zqxjvwkbrump.');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeVisible();

    await page.locator('#dk-private').fill(PRIVATE_VALUE);
    await page.getByRole('button', { name: 'Keep locally' }).click();
    await expect(page.locator('.dk-private-held')).toContainText('Held in this tab only');

    await page.getByRole('button', { name: 'Continue without sending the value' }).click();
    // PERMISSION IS NOT DISCLOSURE. The visitor said yes; this device still does not
    // transmit a literal, so the engine is told disclosure was withheld.
    await expect(page.locator('.dk-notice')).toContainText('The value stayed on this device');
    await settleBanner(page);
    await shot(page, '08-tav-grant-confirmation');

    await expect(page.locator('.dk-turn-engine').last()).toContainText('Answered without the literal.');

    // THE VALUE APPEARS IN NO REQUEST THIS PAGE EVER MADE.
    for (const r of recorded) {
      expect(r.body ?? '', `${r.method} ${r.path} must not carry the private value`).not.toContain(
        PRIVATE_VALUE
      );
    }
    const lastMessage = recorded.filter((r) => r.path.endsWith('/message')).at(-1)!;
    expect(lastMessage.body!).not.toContain('"value"');
    const body = JSON.parse(lastMessage.body!) as {
      device: { tav_disclosures: Array<Record<string, unknown>> };
    };
    expect(body.device.tav_disclosures[0]!['decision']).toBe('DENIED_BY_POLICY');

    // A SECOND REQUEST FINDS NOTHING HELD. The grant was consumed and the value with it,
    // so the same question asked again cannot silently reuse the earlier permission.
    await say(page, 'Ask me again.');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeVisible();
    await expect(page.locator('.dk-private-held')).toHaveCount(0);
    await page.getByRole('button', { name: 'Continue without sending the value' }).click();

    const second = recorded.filter((r) => r.path.endsWith('/message')).at(-1)!;
    const secondBody = JSON.parse(second.body!) as {
      device: { tav_disclosures: Array<Record<string, unknown>> };
    };
    // Nothing is held any more, so the honest answer is a possession state, not a policy
    // refusal. Collapsing the two would tell the engine the wrong thing.
    expect(secondBody.device.tav_disclosures[0]!['decision']).toBe('UNAVAILABLE');
  });

  test('a value can be revoked before any decision is taken', async ({ page }) => {
    await installTransport(page, { polls: [TAV_REQUEST] });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'List the parts of a zqxjvwkbrump.');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeVisible();

    // Revocation does not exist until there is something to revoke.
    await expect(page.locator('[data-dk-action="revoke"]')).toHaveCount(0);

    await page.locator('#dk-private').fill(PRIVATE_VALUE);
    await page.getByRole('button', { name: 'Keep locally' }).click();
    await expect(page.locator('[data-dk-action="revoke"]')).toBeVisible();

    await page.getByRole('button', { name: 'Remove it from this tab' }).click();
    await expect(page.locator('.dk-notice')).toContainText('Nothing was sent, and nothing is held');
    await expect(page.locator('[data-dk-action="revoke"]')).toHaveCount(0);
    await expect(page.locator('.dk-private-held')).toHaveCount(0);
    // Still in the same state: revoking a value is not answering the question.
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TAV_DECISION_REQUIRED');
  });

  test('focus returns to a lawful control once the question is answered', async ({ page }) => {
    await installTransport(page, {
      polls: [TAV_REQUEST, { status: 200, body: governedTurn('Done.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Ask me something.');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeFocused();

    await page.getByRole('button', { name: 'Decline', exact: true }).click();
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');
    // The control that disappeared cannot hold focus, and focus must not be left on the
    // document body. It comes back to the composer, which is where the visitor now acts.
    await expect(composer(page)).toBeFocused();
  });

  test('a private value never enters the transcript or the browser stores', async ({ page }) => {
    await installTransport(page, {
      polls: [TAV_REQUEST, { status: 200, body: governedTurn('Done.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Ask me something.');
    await page.locator('#dk-private').fill(PRIVATE_VALUE);
    await page.getByRole('button', { name: 'Keep locally' }).click();
    await page.getByRole('button', { name: 'Continue without sending the value' }).click();
    await expect(page.locator('.dk-turn-engine').last()).toContainText('Done.');

    await expect(page.locator('.dk-transcript')).not.toContainText(PRIVATE_VALUE);

    const stores = await page.evaluate(async (needle) => {
      const dbs = 'databases' in indexedDB ? await indexedDB.databases() : [];
      return {
        local: JSON.stringify(Object.entries(localStorage)),
        session: JSON.stringify(Object.entries(sessionStorage)),
        cookies: document.cookie,
        idb: dbs.length,
        needle,
      };
    }, PRIVATE_VALUE);

    expect(stores.local).not.toContain(PRIVATE_VALUE);
    expect(stores.session).not.toContain(PRIVATE_VALUE);
    expect(stores.cookies).not.toContain(PRIVATE_VALUE);
    // The chat creates no database. The vault is a Map in one JavaScript realm and dies
    // with the tab, which is the strongest lifetime a browser can offer.
    expect(stores.idb).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// The teaching offer
// ---------------------------------------------------------------------------

test.describe('a concept Deep Kore did not recognise', () => {
  test('the offer says what it is, and never that anything was learned', async ({ page }) => {
    await installTransport(page, { polls: [TEACHING_OFFER] });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'A zqxjvwkbrump has three parts.');

    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TEACHING_CONSENT_REQUIRED');
    const ask = page.locator('[data-dk-ask="teaching"]');
    await expect(ask).toBeVisible();
    await expect(ask).toContainText('One unrecognised term.');
    await expect(ask).toContainText('does not teach');
    await expect(ask).toContainText('Your message text and the conversation are not stored with it');
    await expect(ask).toBeFocused();
    await settleBanner(page);
    await shot(page, '09-teaching-offer');

    // The opaque reference is what consent may name, and it is the ONLY thing about the
    // candidate this page holds. Nothing structural is rendered anywhere.
    const html = await page.content();
    for (const leak of ['structural_identity_key', 'teaching_case_id', 'candidate_ids', 'concept_id']) {
      expect(html).not.toContain(leak);
    }
  });

  test('declining writes nothing and says exactly that', async ({ page }) => {
    const recorded = await installTransport(page, {
      polls: [TEACHING_OFFER],
      consent: { status: 200, body: { discarded: true } },
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'A zqxjvwkbrump has three parts.');
    await expect(page.locator('[data-dk-ask="teaching"]')).toBeVisible();

    await page.getByRole('button', { name: 'Decline', exact: true }).click();
    await expect(page.locator('.dk-notice')).toHaveText('Declined. Nothing was stored.');
    await settleBanner(page);
    await shot(page, '10-teaching-decline');

    const consent = recorded.filter((r) => r.path.endsWith('/consent'));
    expect(consent).toHaveLength(1);
    expect(JSON.parse(consent[0]!.body!)).toEqual({
      reference: 'ab12'.repeat(8),
      consent: false,
    });
  });

  test('consenting submits exactly once, and claims only that it was submitted', async ({ page }) => {
    const recorded = await installTransport(page, {
      polls: [TEACHING_OFFER],
      consent: { status: 200, body: { submitted: true } },
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'A zqxjvwkbrump has three parts.');
    await expect(page.locator('[data-dk-ask="teaching"]')).toBeVisible();

    await page.getByRole('button', { name: 'Submit for review' }).click();
    // THE ONLY SUCCESS WORDING. It does not say learned, accepted, understood or added.
    await expect(page.locator('.dk-notice')).toHaveText('Submitted for review.');
    await settleBanner(page);
    await shot(page, '11-teaching-submitted');

    const consent = recorded.filter((r) => r.path.endsWith('/consent'));
    expect(consent, 'consent is submitted once, never retried').toHaveLength(1);
    const body = JSON.parse(consent[0]!.body!) as Record<string, unknown>;
    // The browser names the reference and takes a position. It authors nothing.
    expect(Object.keys(body).sort()).toEqual(['consent', 'reference']);
    expect(body['consent']).toBe(true);
  });

  test('a submission that did not land is never shown as accepted', async ({ page }) => {
    await installTransport(page, {
      polls: [TEACHING_OFFER],
      consent: { status: 503, body: { error_code: 'teaching_broker_unavailable' } },
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'A zqxjvwkbrump has three parts.');
    await expect(page.locator('[data-dk-ask="teaching"]')).toBeVisible();

    await page.getByRole('button', { name: 'Submit for review' }).click();
    await expect(page.locator('.dk-failure')).toContainText('was not submitted');
    await expect(page.locator('.dk-failure')).toContainText('Nothing was saved');
    // And no success notice anywhere on the page.
    await expect(page.locator('.dk-notice')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('Submitted for review.');
  });
});

// ---------------------------------------------------------------------------
// Refusal and failure
// ---------------------------------------------------------------------------

test.describe('a refusal is never a conversation', () => {
  test('a full service and a broken service say different things', async ({ page }) => {
    await installTransport(page, {
      session: { status: 503, body: { error_code: 'DEEP_KORE_SESSION_CAPACITY' } },
    });
    await page.goto(ROUTE);
    await startButton(page).click();

    await expect(page.locator('.dk-failure')).toContainText('serving all available live sessions');
    await expect(page.locator('.dk-failure')).toContainText('No session was created');
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'IDLE');
    await expect(page.locator('.dk-turn')).toHaveCount(0);
    // A refused visitor learns the service is full, and nothing else about the host.
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\b\d+\s*(sessions?|workers?|slots?)\b/i);
    expect(text.toLowerCase()).not.toContain('capacity is');
    await settleBanner(page);
    await shot(page, '12-capacity-unavailable');

    const capacityText = await page.locator('.dk-failure').innerText();

    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await installTransport(page, {
      session: { status: 503, body: { error_code: 'DEEP_KORE_UNAVAILABLE' } },
    });
    await page.reload();
    await startButton(page).click();
    await expect(page.locator('.dk-failure')).toContainText('temporarily unavailable');
    await settleBanner(page);
    await shot(page, '13-origin-unavailable');

    // The two are 503 for the same reason - both mean "not now" - and only the wording
    // distinguishes them. A full service described as an outage sends an operator
    // hunting a fault that does not exist.
    expect(await page.locator('.dk-failure').innerText()).not.toBe(capacityText);
  });

  test('a failed turn is reported as a failure, outside the transcript', async ({ page }) => {
    await installTransport(page, {
      polls: [RUNNING, { status: 200, body: { state: 'failed', error_code: 'turn_failed' } }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Something that will not complete.');

    await expect(page.locator('.dk-failure')).toContainText('The turn did not complete');
    await expect(page.locator('.dk-failure')).toContainText('Nothing is shown rather than a guess');
    // The failure is an alert region, structurally outside the transcript, so it can
    // never be read as something the system said.
    await expect(page.locator('.dk-transcript .dk-failure')).toHaveCount(0);
    await expect(page.locator('.dk-turn-engine')).toHaveCount(0);
    // The session survives one failed turn. It is the TURN that failed, not the session.
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');
    await settleBanner(page);
    await shot(page, '14-terminal-engine-failure');
  });

  test('a session that ended at the server is distinct from one the visitor ended', async ({ page }) => {
    await installTransport(page, {
      message: { status: 404, body: { error_code: 'session_expired' } },
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Anything.');

    // TERMINAL_FAILURE, not TERMINATED. "You ended it" and "it broke" are different
    // facts and are different members of the union, so they can never be confused - by
    // a visitor, by a test, or by a future edit reading only the discriminant.
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TERMINAL_FAILURE');
    await expect(page.locator('.dk-bar-state')).toContainText('could not continue');
    await expect(page.locator('.dk-failure')).toContainText('The session ended on the server');
    await settleBanner(page);
    await shot(page, '14b-session-terminal-failure');

    // And it cannot be used further: the only control offered is to start over.
    await expect(page.getByRole('button', { name: 'End and delete session' })).toHaveCount(0);
    await expect(startButton(page)).toBeVisible();
    await expect(composer(page)).toBeDisabled();
  });

  test('a delete that did not reach the server never claims the session was discarded', async ({ page }) => {
    await installTransport(page, {
      del: { status: 502, body: { error_code: 'origin_error' } },
      polls: [{ status: 200, body: governedTurn('An answer worth keeping on screen.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Hello.');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);

    await page.getByRole('button', { name: 'End and delete session' }).click();
    await expect(page.locator('.dk-failure')).toContainText('did not complete');
    // The session is still open and the transcript is still there. Claiming a
    // conversation was discarded when it was not is a false success about the one thing
    // this page promises hardest.
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);
  });

  test('a session cannot be ended twice', async ({ page }) => {
    await installTransport(page, {});
    await page.goto(ROUTE);
    await startSession(page);
    await page.getByRole('button', { name: 'End and delete session' }).click();
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TERMINATED');
    // The control is not disabled, it is GONE, and the one in its place starts a new
    // session. There is nothing to press twice.
    await expect(page.getByRole('button', { name: 'End and delete session' })).toHaveCount(0);
    await expect(startButton(page)).toBeVisible();
  });

  test('a result this site does not recognise is a fault, never rendered', async ({ page }) => {
    await installTransport(page, {
      polls: [
        {
          status: 200,
          body: {
            state: 'succeeded',
            result: { kind: 'SOMETHING_ADDED_LATER', turn: { text: 'do not show me' } },
          },
        },
      ],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Anything.');

    await expect(page.locator('.dk-failure')).toContainText('could not be read');
    await expect(page.locator('body')).not.toContainText('do not show me');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(0);
  });

  test('an unrecognised error code is never echoed as text', async ({ page }) => {
    await installTransport(page, {
      session: { status: 503, body: { error_code: '<script>alert(1)</script>' } },
    });
    await page.goto(ROUTE);
    await startButton(page).click();

    // An unrecognised code is not looked up, not echoed, and not guessed at. The visitor
    // is shown a sentence this site wrote, which is true of every refusal it cannot name.
    await expect(page.locator('.dk-failure')).toContainText('The request did not complete');
    const html = await page.content();
    expect(html).not.toContain('alert(1)');
    expect(html).not.toContain('<script>alert');
  });
});

// ---------------------------------------------------------------------------
// Accessibility and layout, in the states that only exist mid-conversation
// ---------------------------------------------------------------------------

test.describe('the states reached mid-conversation are usable', () => {
  test('a new response is announced without taking focus', async ({ page }) => {
    await installTransport(page, {
      polls: [RUNNING, { status: 200, body: governedTurn('An announced answer.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await composer(page).fill('Hello.');
    await composer(page).press('Enter');

    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);
    // The transcript is a polite live region, so the addition is announced. Focus stays
    // where the visitor put it: an answer is not a question and must not interrupt.
    await expect(page.locator('.dk-transcript')).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('.dk-transcript')).toHaveAttribute('role', 'log');
    await expect(composer(page)).toBeFocused();
  });

  test('the whole flow is operable by keyboard alone', async ({ page }) => {
    await installTransport(page, {
      polls: [TAV_REQUEST, { status: 200, body: governedTurn('Keyboard-only answer.') }],
    });
    await page.goto(ROUTE);

    await startButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');

    await composer(page).fill('Ask me something.');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeFocused();

    // From the region, Tab reaches its controls in order and every one is operable.
    await page.keyboard.press('Tab');
    await expect(page.locator('#dk-private')).toBeFocused();

    await page.getByRole('button', { name: 'Decline', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(composer(page)).toBeFocused();
  });

  test('every decision surface fits at 320px with no horizontal overflow', async ({ page }) => {
    await installTransport(page, { polls: [TAV_REQUEST, TEACHING_OFFER] });
    await page.setViewportSize(MOBILE);
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Ask me something.');

    await expect(page.locator('[data-dk-ask="tav"]')).toBeVisible();
    let overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, 'the TAV panel must not widen the page').toBeLessThanOrEqual(0);
    await settleBanner(page);
    await shot(page, '17-mobile-tav', 'mobile');

    await page.getByRole('button', { name: 'Decline', exact: true }).click();
    await expect(page.locator('[data-dk-ask="teaching"]')).toBeVisible();
    overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, 'the teaching offer must not widen the page').toBeLessThanOrEqual(0);
    await settleBanner(page);
    await shot(page, '18-mobile-teaching', 'mobile');
  });

  test('a long unbroken response wraps instead of widening the page', async ({ page }) => {
    const wall = 'z'.repeat(400);
    await installTransport(page, { polls: [{ status: 200, body: governedTurn(wall) }] });
    await page.setViewportSize(MOBILE);
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'w'.repeat(300));

    await expect(page.locator('.dk-turn-engine .dk-text')).toContainText('zzz');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await settleBanner(page);
    await shot(page, '16-mobile-conversation', 'mobile');
  });

  test('an open conversation writes nothing to any browser store', async ({ page }) => {
    await installTransport(page, {
      polls: [{ status: 200, body: governedTurn('An answer.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Hello.');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);

    const stores = await page.evaluate(async () => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      idb: 'databases' in indexedDB ? (await indexedDB.databases()).length : 0,
    }));

    // The cookie-consent choice is the only thing this site stores locally, and it is
    // written by the banner rather than the chat. Nothing here is a transcript.
    expect(stores.local.filter((k) => !k.toLowerCase().includes('cookie'))).toEqual([]);
    expect(stores.session).toEqual([]);
    expect(stores.idb).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Rendering safety, and the one thing a retry may be
// ---------------------------------------------------------------------------

test.describe('nothing a response contains becomes part of this document', () => {
  // React escapes a JSX expression, and every response reaches the transcript as one.
  // There is no `dangerouslySetInnerHTML` anywhere in the console. This proves the
  // consequence rather than the mechanism: markup in a response is shown as the
  // characters it is, and the document does not gain an element from it.
  test('markup in a response is shown as text, never parsed', async ({ page }) => {
    const hostile =
      '<img src=x onerror="window.__dkXss=1"> <script>window.__dkXss=1</script> <b>bold?</b>';
    await installTransport(page, { polls: [{ status: 200, body: governedTurn(hostile) }] });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Anything.');

    const turn = page.locator('.dk-turn-engine .dk-text');
    await expect(turn).toContainText('<b>bold?</b>');
    // Not one element of it entered the document.
    expect(await turn.locator('img, script, b').count()).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __dkXss?: number }).__dkXss)).toBeUndefined();
  });

  test('a hostile description on a teaching offer is text too', async ({ page }) => {
    await installTransport(page, {
      polls: [
        {
          status: 200,
          body: {
            state: 'succeeded',
            result: {
              kind: 'UNKNOWN_CONCEPT_OFFER',
              turn: {
                text: 'One term is not one I hold.',
                persona: 'AIYA',
                governance: { passed: true, stamp: 'GOV_STAMP|gk=pass|persona=AIYA' },
              },
              offer: {
                reference: 'ab12'.repeat(8),
                description: '<img src=x onerror="window.__dkXss=1">',
              },
            },
          },
        },
      ],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Anything.');

    const ask = page.locator('[data-dk-ask="teaching"]');
    await expect(ask).toBeVisible();
    expect(await ask.locator('img, script').count()).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __dkXss?: number }).__dkXss)).toBeUndefined();
  });
});

test.describe('a retry is offered only where one could work, and only on request', () => {
  test('a request that never completed can be sent again, by the visitor', async ({ page }) => {
    // `abort` produces the case the adapter reports with status 0: no response at all.
    let fail = true;
    await page.route('**/api/deep-kore/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      const json = (status: number, body: unknown) =>
        route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

      if (path.endsWith('/session')) return json(201, OK_SESSION.body);
      if (path.endsWith('/message')) {
        if (fail) {
          fail = false;
          return route.abort('connectionfailed');
        }
        return json(202, { job_id: 'job-retry-1', duplicate: false });
      }
      if (path.includes('/result/')) return json(200, governedTurn('The retry got through.'));
      return json(500, {});
    });

    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'A message that will not get through the first time.');

    await expect(page.locator('.dk-failure')).toContainText('temporarily unavailable');
    // The visitor's own turn is on screen once, and stays there: the message was not
    // lost, it just did not arrive.
    await expect(page.locator('.dk-turn-visitor')).toHaveCount(1);

    const retryControl = page.locator('[data-dk-action="retry"]');
    await expect(retryControl).toBeVisible();
    await retryControl.click();

    await expect(page.locator('.dk-turn-engine .dk-text')).toHaveText('The retry got through.');
    // Sent again, not echoed again. The turn is already in the transcript.
    await expect(page.locator('.dk-turn-visitor')).toHaveCount(1);
    await expect(retryControl).toHaveCount(0);
  });

  test('a refusal the server chose to send offers no retry', async ({ page }) => {
    await installTransport(page, {
      session: { status: 503, body: { error_code: 'DEEP_KORE_SESSION_CAPACITY' } },
    });
    await page.goto(ROUTE);
    await startButton(page).click();

    await expect(page.locator('.dk-failure')).toContainText('serving all available live sessions');
    // A full service would refuse identically on a second press. A retry control beside
    // it would be an invitation to press a button that cannot work.
    await expect(page.locator('[data-dk-action="retry"]')).toHaveCount(0);
  });

  test('nothing retries on its own', async ({ page }) => {
    const recorded: string[] = [];
    await page.route('**/api/deep-kore/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      recorded.push(path);
      if (path.endsWith('/session')) {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(OK_SESSION.body),
        });
      }
      return route.abort('connectionfailed');
    });

    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'This will not get through.');
    await expect(page.locator('.dk-failure')).toBeVisible();

    const afterFailure = recorded.filter((p) => p.endsWith('/message')).length;
    await page.waitForTimeout(2500);
    // Still exactly one attempt. The message was sent once and stayed sent once.
    expect(recorded.filter((p) => p.endsWith('/message')).length).toBe(afterFailure);
    expect(afterFailure).toBe(1);
  });
});

test.describe('the phone layout is real, not a desktop layout that fits', () => {
  test('the composer stays reachable after a long conversation at 320px', async ({ page }) => {
    // Twelve turns of substantial text: the case where a naive chat layout traps the
    // composer below a region that has taken the whole viewport.
    const long = 'A governed answer that runs on for a while and wraps several times. '.repeat(6);
    await installTransport(page, { polls: [{ status: 200, body: governedTurn(long) }] });
    await page.setViewportSize(MOBILE);
    await page.goto(ROUTE);
    await startSession(page);
    for (let i = 0; i < 6; i += 1) {
      await say(page, `Question ${i}, asked at a phone width.`);
      await expect(page.locator('.dk-turn-engine')).toHaveCount(i + 1);
    }

    // THE DOCUMENT SCROLLS. A console that swallowed the viewport would leave the page
    // unable to scroll and the composer permanently below the fold.
    const doc = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      consolePosition: getComputedStyle(document.querySelector('.dk-console')!).position,
      composerPosition: getComputedStyle(document.querySelector('.dk-composer')!).position,
    }));
    expect(doc.scrollHeight).toBeGreaterThan(doc.clientHeight);
    // Nothing here is pinned to the viewport, so a soft keyboard shrinking the visual
    // viewport cannot leave a control stranded off-screen.
    expect(doc.consolePosition).toBe('static');
    expect(doc.composerPosition).toBe('static');

    // And it is genuinely usable: scrolled to, visible, and it accepts input.
    await composer(page).scrollIntoViewIfNeeded();
    await expect(composer(page)).toBeInViewport();
    await expect(sendButton(page)).toBeInViewport();
    await composer(page).fill('Still typeable at the bottom of a long conversation.');
    await expect(composer(page)).toHaveValue('Still typeable at the bottom of a long conversation.');

    // Still no horizontal overflow, with six long turns on screen.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('the transcript scrolls inside itself rather than growing without bound', async ({ page }) => {
    const long = 'A long governed answer. '.repeat(40);
    await installTransport(page, { polls: [{ status: 200, body: governedTurn(long) }] });
    await page.setViewportSize(MOBILE);
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Tell me something long.');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);

    // A bounded, focusable, scrollable region - so a keyboard user can reach and read it,
    // and a long answer does not push the composer arbitrarily far down the page.
    const transcript = page.locator('.dk-transcript');
    await expect(transcript).toHaveAttribute('tabindex', '0');
    const box = await transcript.boundingBox();
    expect(box!.height).toBeLessThan(MOBILE.height);
  });
});
