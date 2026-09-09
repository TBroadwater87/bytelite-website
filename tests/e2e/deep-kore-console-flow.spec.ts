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

/**
 * Marks a request the scripted transport was never told how to answer.
 *
 * Checked after every test rather than inside the route handler: a handler that throws
 * is reported by Playwright as a route error and does NOT fail the test, so enforcing it
 * there would have produced a warning nobody reads. The four public routes are the whole
 * surface this glob can match, so a request reaching the fallthrough is always a defect
 * in the script or in the page - never an ordinary case that needs tolerating.
 */
const UNSCRIPTED = 'harness-unscripted-request';

// Playwright parses this signature to decide which fixtures the hook needs, and rejects
// anything but a destructuring pattern in the first position. The empty pattern is the
// documented way to say "no fixtures, just the test info" - naming a fixture instead
// would set one up for every test in the file to satisfy a linter.
// eslint-disable-next-line no-empty-pattern
test.afterEach(({}, testInfo) => {
  const stray = testInfo.annotations
    .filter((a) => a.type === UNSCRIPTED)
    .map((a) => a.description);
  expect(stray, 'the page made a request the scripted transport does not describe').toEqual([]);
});

const OK_SESSION: Answer = {
  status: 201,
  body: { ok: true, persona: 'AIYA', canon_version: null, csrf_token: 'csrf-token-for-test', max_message_bytes: 8192 },
};
const OK_MESSAGE: Answer = { status: 202, body: { job_id: 'job-test-1', duplicate: false } };
const OK_DELETE: Answer = { status: 200, body: { deleted: true } };

const governedTurn = (text: string, anchors: string[] = []) => ({
  state: 'succeeded',
  result: {
    kind: 'GOVERNED_TEXT',
    turn: {
      text,
      persona: 'AIYA',
      governance: { passed: true, stamp: 'GOV_STAMP|gk=pass|persona=AIYA' },
      // Defaults to empty because that is the ordinary turn. A test that wants anchors
      // asks for them, so no test accidentally asserts against a list it did not intend.
      anchors,
    },
  },
});

/** Two well-formed anchor handles: lowercase hex, 64 characters, exactly as the engine sends. */
const ANCHOR_ONE = 'b'.repeat(64);
const ANCHOR_TWO = '0123456789abcdef'.repeat(4);

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

  // Recorded against the TEST rather than a module-level list, deliberately. A shared
  // array would be scenario state living longer than the scenario, which is the defect
  // this pass went looking for - and with one worker it would still be wrong, just
  // harder to see. The annotation belongs to the test that provoked it and dies with it.
  const unscripted = {
    push(what: string) {
      test.info().annotations.push({ type: UNSCRIPTED, description: what });
    },
  };

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
      // The last entry repeats deliberately, so a script need not count polls. That is
      // safe ONLY while the repeating entry is terminal: a script whose final answer is
      // `running` would be answered `running` for ever, and the console - which has no
      // attempt cap by design - would poll until the test timed out with nothing to say
      // about why. Naming it here turns a silent 30-second hang into a script defect
      // reported at the request that caused it.
      const exhausted = pollIndex >= polls.length;
      const a = polls[Math.min(pollIndex, polls.length - 1)]!;
      if (exhausted && (a.body as { state?: string })?.state === 'running') {
        unscripted.push(`${method} ${path} - poll script exhausted on a non-terminal answer`);
      }
      pollIndex += 1;
      return answer(a);
    }

    // NEVER A SILENT FALLTHROUGH. An unmatched request means the page called something
    // this script does not describe. Answering it with an empty 500 hid that: the console
    // reported an ordinary origin failure and the test failed several steps later, on a
    // state assertion that was never the defect. The request is named instead, so the
    // report points at what actually happened.
    unscripted.push(`${method} ${path}`);
    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error_code: 'harness_unscripted_request' }),
    });
  });

  return recorded;
}

/**
 * Waits until a request the page was expected to make has actually been recorded, and
 * returns that one by position.
 *
 * A click resolves when the click is DISPATCHED, not when the request it causes has been
 * issued and observed by the route handler. Reading the recording straight after one
 * therefore reads the PREVIOUS request - which is exactly how the Firefox run of
 * "a granted value is sent exactly once" read turn 3 (a plain message, no device
 * envelope) while asserting about turn 4, and died on `device` being undefined.
 *
 * Waiting for the request ITSELF is the fix. An arbitrary pause would be the same race
 * with a longer fuse, and section 9 forbids one for precisely this reason. Position is
 * used rather than `.at(-1)` so the assertion names the turn it means: with four message
 * requests in this conversation, "the last one" is only the right one by luck.
 */
async function nthRequest(recorded: Recorded[], suffix: string, n: number): Promise<Recorded> {
  const matching = () => recorded.filter((r) => r.path.endsWith(suffix));
  await expect
    .poll(matching, { message: `waiting for ${n} ${suffix} request(s) to have been made` })
    .toHaveLength(n);
  return matching()[n - 1]!;
}

const consoleState = (page: Page) => page.locator('.dk-console');
const startButton = (page: Page) => page.getByRole('button', { name: 'Start a private session' });
const sendButton = (page: Page) => page.getByRole('button', { name: 'Send', exact: true });
const composer = (page: Page) => page.locator('#dk-input');

async function startSession(page: Page) {
  await startButton(page).click();
  await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'READY');
}

/**
 * Type a private value and hand it to the vault, waiting for the one precondition that
 * makes the handler capable of doing anything.
 *
 * WHY THIS IS NOT JUST `fill` THEN `click`. `#dk-private` is a controlled input and
 * "Keep locally" is `disabled` until React has processed the change, so the click depends
 * on a state transition that `fill()` only STARTS. Firefox failed here on a real run: the
 * trace shows the click dispatched 52ms after the fill, and the failure snapshot shows the
 * input still holding the text with the button focused and the vault still empty - the
 * click landed on a handler that could not yet see the draft, so `keepPrivate` returned at
 * its empty-value guard and nothing happened. Every later assertion then failed for a
 * reason that had nothing to do with what it was testing.
 *
 * Awaiting `toBeEnabled()` states that dependency instead of hoping the two land in order.
 * It is the same correction, and the same reasoning, as waiting for a request to be
 * OBSERVED rather than reading whichever one happens to be last: a click resolves when it
 * is dispatched, never when its effect has happened.
 */
async function keepPrivateValue(page: Page, value: string) {
  await page.locator('#dk-private').fill(value);
  const keep = page.getByRole('button', { name: 'Keep locally' });
  await expect(keep, 'the composer never enabled, so the vault could not be written').toBeEnabled();
  await keep.click();
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
    // THE REQUEST ITSELF IS STILL A PREDICATE. It names a KIND of fact and carries no
    // value, no lookup key and nothing for the page to evaluate - which is why a TAV
    // request can never be a script-delivery channel, and remains true now that an
    // answer may carry a literal.
    await expect(ask).toContainText('has asked for one fact by name');
    // And the copy states the actual bargain rather than the one that used to apply.
    await expect(ask).toContainText('used for this one answer and then discarded');
    await expect(ask).toContainText('If you decline, nothing is sent');
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

  test('a granted value is sent exactly once and is gone afterwards', async ({ page }) => {
    // SUPERSEDES a row that asserted a permitted turn transmits NO value. That was the
    // site's rule until the owner authorised the literal to cross on an explicit grant,
    // for one turn. The consumption half of the old row is unchanged and still asserted
    // below - it is the transmission half that was decided differently.
    const recorded = await installTransport(page, {
      polls: [
        TAV_REQUEST,
        { status: 200, body: governedTurn('Answered with what you sent.') },
        TAV_REQUEST,
        { status: 200, body: governedTurn('Answered again.') },
      ],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'List the parts of a zqxjvwkbrump.');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeVisible();

    await keepPrivateValue(page, PRIVATE_VALUE);
    await expect(page.locator('.dk-private-held')).toContainText('Held in this tab only');

    // THE CONTROL SAYS IT SENDS, because with a value held that is what it does.
    const permit = page.locator('[data-dk-action="tav-permit"]');
    await expect(permit).toHaveText('Send it for this answer only');
    await permit.click();

    await expect(page.locator('.dk-notice')).toContainText('Sent for that one answer, and cleared');
    await settleBanner(page);
    await shot(page, '08-tav-grant-confirmation');

    await expect(page.locator('.dk-turn-engine').last()).toContainText('Answered with what you sent.');

    // IT CROSSED EXACTLY ONCE, on the one request that carried the grant.
    const carrying = recorded.filter((r) => (r.body ?? '').includes(PRIVATE_VALUE));
    expect(carrying, 'the literal must cross exactly one request').toHaveLength(1);
    expect(carrying[0]!.path).toBe('/api/deep-kore/message');

    const granted = JSON.parse(carrying[0]!.body!) as {
      device: { tav_disclosures: Array<Record<string, unknown>> };
    };
    expect(granted.device.tav_disclosures[0]!['decision']).toBe('GRANTED');
    expect(granted.device.tav_disclosures[0]!['value']).toBe(PRIVATE_VALUE);

    // AND IT IS NOT IN THE CONVERSATION. What was disclosed to the engine was not
    // disclosed to the screen.
    await expect(page.locator('.dk-transcript')).not.toContainText(PRIVATE_VALUE);

    // A SECOND REQUEST FINDS NOTHING HELD. The grant was consumed and the value with it,
    // so the same question asked again cannot silently reuse the earlier permission.
    await say(page, 'Ask me again.');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeVisible();
    await expect(page.locator('.dk-private-held')).toHaveCount(0);
    // AND NOTHING OFFERS TO TAKE THE EARLIER DISCLOSURE BACK. The delete control is
    // rendered only while this tab holds a value, so its absence here is the honest shape
    // of owner ruling 2026-09-07: a completed disclosure cannot be retroactively revoked,
    // and the interface must not imply otherwise by leaving a control standing that looks
    // as though it could.
    await expect(page.locator('[data-dk-action="remove-held-value"]')).toHaveCount(0);
    await expect(permit).toHaveText('Continue without sending it');
    await permit.click();

    // THE FOURTH message request, named by position rather than taken as "the last one".
    // This conversation sends four: the opening question, the granted continuation, the
    // repeat question, and the continuation that finds nothing held. Only the fourth is
    // the one this assertion is about, and only waiting for it makes reading it sound -
    // `.at(-1)` returned the THIRD on a Firefox run, a plain message with no device
    // envelope at all, because a click resolves before the request it causes is observed.
    const second = await nthRequest(recorded, '/message', 4);
    const secondBody = JSON.parse(second.body!) as {
      device: { tav_disclosures: Array<Record<string, unknown>> };
    };
    // Nothing is held any more, so the honest answer is a possession state. It carries
    // no value field at all.
    expect(secondBody.device.tav_disclosures[0]!['decision']).toBe('UNAVAILABLE');
    expect(second.body!).not.toContain(PRIVATE_VALUE);

    // Across the WHOLE conversation the literal appears in one request and nowhere else.
    expect(recorded.filter((r) => (r.body ?? '').includes(PRIVATE_VALUE))).toHaveLength(1);
  });

  // A HELD VALUE CAN BE DELETED FROM THIS TAB. THAT IS NOT REVOCATION.
  //
  // This test and its control were both named for revocation until owner ruling
  // 2026-09-07. Nothing about the behaviour was wrong - it deletes a value the tab is
  // still holding, before any disclosure exists - but the name claimed a protocol
  // capability that does not exist. `TavDecision` is
  // `GRANTED | DENIED_BY_POLICY | DENIED_BY_USER | UNAVAILABLE`; there is no `REVOKED`,
  // and a test asserting "revocation" would be standing evidence for a promise the
  // system cannot keep.
  test('a held value can be deleted from this tab before any decision is taken', async ({
    page,
  }) => {
    await installTransport(page, { polls: [TAV_REQUEST] });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'List the parts of a zqxjvwkbrump.');
    await expect(page.locator('[data-dk-ask="tav"]')).toBeVisible();

    // The control does not exist until this tab is holding something to delete.
    await expect(page.locator('[data-dk-action="remove-held-value"]')).toHaveCount(0);

    await keepPrivateValue(page, PRIVATE_VALUE);
    await expect(page.locator('[data-dk-action="remove-held-value"]')).toBeVisible();

    await page.getByRole('button', { name: 'Remove it from this tab' }).click();
    await expect(page.locator('.dk-notice')).toContainText('Nothing was sent, and nothing is held');
    await expect(page.locator('[data-dk-action="remove-held-value"]')).toHaveCount(0);
    await expect(page.locator('.dk-private-held')).toHaveCount(0);
    // Still in the same state: deleting a value is not answering the question.
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TAV_DECISION_REQUIRED');
  });

  // -------------------------------------------------------------------------
  // PUBLIC TESSERACT ANCHORS IN THE INTERFACE
  //
  // Added 2026-09-09 with corrected release d3a4f5af. An anchor confirms structure
  // settled during a turn. The two things a visitor could most easily be misled about
  // are what it reveals (nothing) and what it means (not learning), so both are asserted
  // rather than described.
  // -------------------------------------------------------------------------

  test('an ordinary turn establishes nothing and shows no anchor section', async ({ page }) => {
    await installTransport(page, { polls: [{ status: 200, body: governedTurn('Done.') }] });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Say something ordinary.');
    await expect(page.locator('.dk-turn-engine').last()).toContainText('Done.');

    // An empty anchor list renders NOTHING. The absence is the ordinary case and must
    // never be dressed up as a warning, a failure, or a missing feature.
    await page.locator('.dk-why').last().locator('summary').click();
    await expect(page.locator('.dk-anchors')).toHaveCount(0);
  });

  test('established anchors are shown as opaque handles and nothing else', async ({ page }) => {
    await installTransport(page, {
      polls: [{ status: 200, body: governedTurn('Settled.', [ANCHOR_ONE, ANCHOR_TWO]) }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Tell me about a zqxjvwkbrump.');
    await expect(page.locator('.dk-turn-engine').last()).toContainText('Settled.');

    // Anchors live INSIDE the governance disclosure, closed by default - a visitor
    // reading a conversation should not have a list of hashes under every sentence.
    // Asserted as NOT VISIBLE rather than absent: a closed <details> still has its
    // content in the DOM, so counting elements would test the wrong thing and would
    // pass for the wrong reason if the disclosure were ever removed entirely.
    await expect(page.locator('.dk-anchors')).not.toBeVisible();

    await page.locator('.dk-why').last().locator('summary').click();
    const anchors = page.locator('.dk-anchors');
    await expect(anchors).toBeVisible();
    await expect(anchors).toHaveAttribute('data-dk-anchors', '2');
    await expect(page.locator('.dk-anchor')).toHaveCount(2);

    // AND IT SAYS WHAT THIS IS NOT. An anchor confirming structure settled is the thing
    // most likely to be mistaken for Deep Kore having been taught something.
    await expect(anchors).toContainText('This is not learning');

    // The handle is the only anchor datum that exists on the wire. Nothing resembling a
    // concept id, coordinate, placement, edge or trace can appear, because none is sent.
    const body = (await page.locator('.dk-anchors').innerText()).toLowerCase();
    for (const forbidden of ['concept', 'coordinate', 'placement', 'edge', 'trace', 'topology']) {
      expect(body, `the anchor panel mentioned ${forbidden}`).not.toContain(forbidden);
    }
  });

  test('anchors do not survive the session that issued them', async ({ page }) => {
    await installTransport(page, {
      polls: [{ status: 200, body: governedTurn('Settled.', [ANCHOR_ONE]) }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await say(page, 'Tell me about a zqxjvwkbrump.');
    await page.locator('.dk-why').last().locator('summary').click();
    await expect(page.locator('.dk-anchors')).toBeVisible();

    // Ending the session clears the transcript, and the anchors go with it. The handle
    // is unverifiable at the origin from this moment too - the session secret that
    // derived it is destroyed - so nothing anywhere can still resolve it.
    // TERMINATED, not ENDED: the console keeps those two structurally distinct so that
    // "you ended it" and "it broke" can never be shown as the same thing.
    await page.getByRole('button', { name: 'End and delete session' }).click();
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TERMINATED');
    await expect(page.locator('.dk-anchors')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(ANCHOR_ONE);
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
    await keepPrivateValue(page, PRIVATE_VALUE);
    await page.locator('[data-dk-action="tav-permit"]').click();
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

// ---------------------------------------------------------------------------
// Private context - the visitor's own structural facts
// ---------------------------------------------------------------------------

/** A label a visitor might plausibly type. It must never appear in a request. */
const ENTITY_LABEL = 'SYNTHETIC-LABEL-Alexandra-4402';

/**
 * Opens the private-context panel, whatever state it is already in.
 *
 * Idempotent on purpose: whether the disclosure is open is COMPONENT state and survives
 * a session ending, so a helper that always clicked would close it half the time. That
 * is also correct behaviour worth keeping - a visitor who opened the panel does not want
 * it to snap shut because a session ended - so the helper adapts rather than the page.
 */
async function openContext(page: Page) {
  if ((await page.locator('#dk-context-body').count()) === 0) {
    await page.locator('[data-dk-action="toggle-context"]').click();
  }
  await expect(page.locator('#dk-context-body')).toBeVisible();
}

async function addEntity(page: Page, label: string, role: string, kind?: string) {
  await page.locator('#dk-entity-label').fill(label);
  await page.locator('#dk-entity-role').selectOption(role);
  if (kind) await page.locator('#dk-entity-kind').selectOption(kind);
  await page.locator('[data-dk-action="add-entity"]').click();
}

test.describe('private context is offered, never required, and never inferred', () => {
  test('the panel is closed by default and the conversation works untouched', async ({ page }) => {
    const recorded = await installTransport(page, {
      polls: [{ status: 200, body: governedTurn('An ordinary answer.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);

    // Closed. A visitor who just wants to talk is never asked about their relationships.
    await expect(page.locator('#dk-context-body')).toHaveCount(0);
    await expect(page.locator('[data-dk-action="toggle-context"]')).toBeVisible();

    await say(page, 'What are you?');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);

    // AND NOTHING WAS ASSERTED ABOUT THEM. Regular chat sends no envelope at all.
    const message = recorded.find((r) => r.path.endsWith('/message'))!;
    const body = JSON.parse(message.body!) as Record<string, unknown>;
    expect(body['device']).toBeUndefined();
    expect(Object.keys(body).sort()).toEqual(['text', 'turn_key']);
  });

  test('it opens, explains itself, and offers only canonical values', async ({ page }) => {
    await installTransport(page, {});
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);

    const panel = page.locator('#dk-context-body');
    await expect(panel).toContainText('Nothing here is worked out from your messages');
    await expect(panel).toContainText('Entirely optional');
    await expect(panel).toContainText('never sent');

    // THE LISTS ARE THE CANONICAL ONES. A control able to offer a value the engine does
    // not define is one that can be wrong in a way only the origin notices.
    const roles = await page.locator('#dk-entity-role option').allTextContents();
    expect(roles).toEqual(['Choose one', 'SELF', 'PARTNER', 'MATCH', 'FRIEND', 'FAMILY', 'OTHER']);
    const kinds = await page.locator('#dk-entity-kind option').allTextContents();
    expect(kinds).toEqual([
      'Prefer not to say',
      'SELF',
      'PERSON',
      'PLACE',
      'AI_ASSISTANT',
      'GROUP',
      'UNKNOWN',
      'OTHER',
    ]);

    // Nothing is preselected. There is no default relationship, because a default here
    // would be the page deciding something about somebody's life.
    await expect(page.locator('#dk-entity-role')).toHaveValue('');
    await expect(page.locator('#dk-entity-kind')).toHaveValue('');
    // And nothing can be added until a role is chosen: the role IS the evidence.
    await expect(page.locator('[data-dk-action="add-entity"]')).toBeDisabled();

    await settleBanner(page);
    await shot(page, '19-private-context-empty');
  });

  test('an entity is added only when the visitor chooses a role', async ({ page }) => {
    await installTransport(page, {});
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);

    await page.locator('#dk-entity-label').fill(ENTITY_LABEL);
    // A label alone adds nothing.
    await expect(page.locator('[data-dk-action="add-entity"]')).toBeDisabled();

    await page.locator('#dk-entity-role').selectOption('PARTNER');
    await expect(page.locator('[data-dk-action="add-entity"]')).toBeEnabled();
    await page.locator('[data-dk-action="add-entity"]').click();

    const item = page.locator('[data-dk-entity]');
    await expect(item).toHaveCount(1);
    await expect(item).toContainText(ENTITY_LABEL);
    await expect(item.locator('code')).toHaveText(['PARTNER']);
    // Not attached to the next message on its own.
    await expect(item.locator('input[type="checkbox"]')).not.toBeChecked();

    await settleBanner(page);
    await shot(page, '20-private-context-filled');
  });

  test('the label never leaves the tab, and the reference that does carries nothing', async ({
    page,
  }) => {
    const recorded = await installTransport(page, {
      polls: [{ status: 200, body: governedTurn('An answer.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);
    await addEntity(page, ENTITY_LABEL, 'PARTNER', 'PERSON');
    await page.locator('[data-dk-action="include-entity"]').check();

    await say(page, 'Tell me about them.');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);

    for (const r of recorded) {
      expect(r.body ?? '', `${r.path} must not carry the label`).not.toContain(ENTITY_LABEL);
      expect(r.body ?? '').not.toContain('Alexandra');
    }

    const message = recorded.filter((r) => r.path.endsWith('/message')).at(-1)!;
    const body = JSON.parse(message.body!) as { device: Record<string, unknown> };
    const entity = (body.device['entities'] as Array<Record<string, string>>)[0]!;
    // The opaque reference and the enumerators they chose. Nothing else.
    expect(Object.keys(entity).sort()).toEqual([
      'entity_id',
      'entity_kind',
      'relationship_role',
    ]);
    expect(entity['relationship_role']).toBe('PARTNER');
    expect(entity['entity_kind']).toBe('PERSON');
    expect(entity['entity_id']).toMatch(/^[A-Za-z0-9_-]+$/);
    // And the reference is not derived from the label.
    expect(entity['entity_id']).not.toContain('Alex');

    // The segment is what says THIS message is about them.
    expect(body.device['current_message']).toEqual({
      segments: [{ kind: 'ENTITY', entity_id: entity['entity_id'] }],
    });
  });

  test('describing someone is not saying the message is about them', async ({ page }) => {
    const recorded = await installTransport(page, {
      polls: [{ status: 200, body: governedTurn('An answer.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);
    await addEntity(page, ENTITY_LABEL, 'FRIEND');
    // The checkbox is deliberately left alone.

    await say(page, 'A question about nothing in particular.');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);

    const message = recorded.filter((r) => r.path.endsWith('/message')).at(-1)!;
    const body = JSON.parse(message.body!) as { device: Record<string, unknown> };
    expect(body.device['entities']).toHaveLength(1);
    expect(body.device['current_message']).toBeUndefined();
  });

  test('removing and clearing are real deletions', async ({ page }) => {
    const recorded = await installTransport(page, {
      polls: [{ status: 200, body: governedTurn('An answer.') }],
    });
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);
    await addEntity(page, ENTITY_LABEL, 'PARTNER');
    await addEntity(page, 'SYNTHETIC-LABEL-Second', 'FAMILY');
    await expect(page.locator('[data-dk-entity]')).toHaveCount(2);

    await page.locator('[data-dk-action="remove-entity"]').first().click();
    await expect(page.locator('[data-dk-entity]')).toHaveCount(1);
    await expect(page.locator('.dk-notice')).toContainText('Nothing about it is held any more');

    await page.locator('[data-dk-action="clear-context"]').click();
    await expect(page.locator('[data-dk-entity]')).toHaveCount(0);

    // And with nothing left, the next turn asserts nothing again.
    await say(page, 'Back to an ordinary question.');
    await expect(page.locator('.dk-turn-engine')).toHaveCount(1);
    const message = recorded.filter((r) => r.path.endsWith('/message')).at(-1)!;
    expect(JSON.parse(message.body!)['device']).toBeUndefined();
  });

  test('ending the session clears the whole private context', async ({ page }) => {
    await installTransport(page, {});
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);
    await addEntity(page, ENTITY_LABEL, 'PARTNER');
    await expect(page.locator('[data-dk-entity]')).toHaveCount(1);

    await page.getByRole('button', { name: 'End and delete session' }).click();
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TERMINATED');

    // A relationship a visitor described is as much theirs as a value they kept, and it
    // does not outlive the conversation it was given for.
    await startSession(page);
    await openContext(page);
    await expect(page.locator('[data-dk-entity]')).toHaveCount(0);
    await expect(page.locator('#dk-context-body')).toContainText('Nothing has been added');
  });

  test('leaving the page clears it too, and nothing durable survives', async ({ page }) => {
    await installTransport(page, {});
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);
    await addEntity(page, ENTITY_LABEL, 'PARTNER', 'PERSON');

    const stores = await page.evaluate(async () => ({
      local: JSON.stringify(Object.entries(localStorage)),
      session: JSON.stringify(Object.entries(sessionStorage)),
      cookies: document.cookie,
      idb: 'databases' in indexedDB ? (await indexedDB.databases()).length : 0,
    }));
    expect(stores.local).not.toContain(ENTITY_LABEL);
    expect(stores.session).not.toContain(ENTITY_LABEL);
    expect(stores.cookies).not.toContain(ENTITY_LABEL);
    expect(stores.idb).toBe(0);

    await page.reload();
    await startSession(page);
    await openContext(page);
    await expect(page.locator('[data-dk-entity]')).toHaveCount(0);
  });

  test('a terminal failure clears it as well', async ({ page }) => {
    await installTransport(page, {
      message: { status: 404, body: { error_code: 'session_expired' } },
    });
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);
    await addEntity(page, ENTITY_LABEL, 'PARTNER');
    await expect(page.locator('[data-dk-entity]')).toHaveCount(1);

    await say(page, 'Anything.');
    await expect(consoleState(page)).toHaveAttribute('data-dk-state', 'TERMINAL_FAILURE');

    await startSession(page);
    await openContext(page);
    await expect(page.locator('[data-dk-entity]')).toHaveCount(0);
  });

  test('the panel is usable at 320px', async ({ page }) => {
    await installTransport(page, {});
    await page.setViewportSize(MOBILE);
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);
    await addEntity(page, ENTITY_LABEL, 'PARTNER', 'PERSON');

    await expect(page.locator('[data-dk-entity]')).toHaveCount(1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, 'the context panel must not widen the page').toBeLessThanOrEqual(0);

    await settleBanner(page);
    await shot(page, '22-mobile-private-context', 'mobile');
  });

  test('every control in the panel is reachable and labelled', async ({ page }) => {
    await installTransport(page, {});
    await page.goto(ROUTE);
    await startSession(page);
    await openContext(page);

    // The toggle states whether the region is open, and names the region it controls.
    const toggle = page.locator('[data-dk-action="toggle-context"]');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-controls', 'dk-context-body');

    // Every input has a real label and a described hint, not a placeholder standing in.
    for (const id of ['#dk-entity-label', '#dk-entity-role', '#dk-entity-kind']) {
      const control = page.locator(id);
      const labelled = await page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return false;
        return Boolean(document.querySelector(`label[for="${el.id}"]`));
      }, id);
      expect(labelled, `${id} needs a real label`).toBe(true);
      await expect(control).toHaveAttribute('aria-describedby', /dk-entity-/);
    }
  });
});
