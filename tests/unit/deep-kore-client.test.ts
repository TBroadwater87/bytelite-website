import { describe, test, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createDeepKoreClient,
  readResult,
  type DeepKoreResult,
} from '../../src/components/deep-kore/deepKoreClient';
import { RESULT_KINDS } from '../../api/_lib/deep-kore-codes';

/**
 * THE WEBSITE'S ONE DEEP KORE BOUNDARY, tested as a contract.
 *
 * What is under test here is this site's reading of a response - not the engine, not the
 * gateway, and not the route handlers, which have their own suite. The `fetch` these
 * tests supply stands in for the site's own `/api/deep-kore/*` endpoints, so every
 * assertion is about the adapter's behaviour when the server says a particular thing.
 *
 * The load-bearing assertion, repeated deliberately: NOTHING that arrives over the wire
 * becomes text, a state, or an assumption. An unrecognised discriminant, an unrecognised
 * code and a half-formed payload all become typed faults, because a response this site
 * cannot read is not one it may guess at.
 */

/** A fetch stub. Each entry answers one path fragment, in order of first match. */
function stubFetch(routes: Array<[RegExp, { status: number; body?: unknown; throws?: boolean }]>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    calls.push({ url: u, init: init ?? {} });
    for (const [pattern, answer] of routes) {
      if (!pattern.test(u)) continue;
      if (answer.throws) throw new TypeError('Failed to fetch');
      return new Response(JSON.stringify(answer.body ?? {}), {
        status: answer.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } });
  });
  return { impl: impl as unknown as typeof fetch, calls };
}

const SESSION_OK = {
  ok: true,
  persona: 'AIYA',
  canon_version: null,
  csrf_token: 'csrf-token-for-test',
  max_message_bytes: 8192,
};

const TURN = {
  text: 'A governed answer.',
  persona: 'AIYA',
  governance: { passed: true, stamp: 'GOV_STAMP|gk=pass|persona=AIYA' },
};

async function openedClient(extra: Array<[RegExp, { status: number; body?: unknown; throws?: boolean }]> = []) {
  const { impl, calls } = stubFetch([
    [/\/api\/deep-kore\/session$/, { status: 201, body: SESSION_OK }],
    ...extra,
  ]);
  const client = createDeepKoreClient(impl);
  const opened = await client.createSession();
  expect(opened.ok).toBe(true);
  return { client, calls, impl };
}

// ---------------------------------------------------------------------------
// Addressing and credentials
// ---------------------------------------------------------------------------

describe('the browser addresses this site and nothing else', () => {
  test('every path is same-origin and relative', async () => {
    const { calls } = await openedClient();
    for (const c of calls) {
      expect(c.url.startsWith('/api/deep-kore/')).toBe(true);
    }
  });

  test('the adapter source names no origin, credential or protected host', () => {
    // Read as text rather than reasoned about: the guarantee is that the browser bundle
    // contains no way to reach the protected origin, and the file is the bundle's source.
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/deep-kore/deepKoreClient.ts'),
      'utf8'
    );
    for (const forbidden of [
      'DEEP_KORE_ORIGIN_URL',
      'DEEP_KORE_GATEWAY_TOKEN',
      'DEEP_KORE_SESSION_SECRET',
      'CF-Access-Client-Id',
      'CF-Access-Client-Secret',
      'Authorization',
      'process.env',
    ]) {
      expect(src, `the client must not reference ${forbidden}`).not.toContain(forbidden);
    }
    // And it addresses nothing absolute.
    expect(src).not.toMatch(/https?:\/\/(?!\S*example)/);
  });

  test('the CSRF token is held by the client, never read back from the document', async () => {
    const { client, calls } = await openedClient([
      [/\/messages?$/, { status: 202, body: { job_id: 'job-1' } }],
    ]);
    await client.submitTurn('hello');
    const message = calls.find((c) => c.url.endsWith('/message'))!;
    expect((message.init.headers as Record<string, string>)['X-DK-CSRF']).toBe('csrf-token-for-test');
  });

  test('a session with no CSRF token is refused rather than half-opened', async () => {
    const { impl } = stubFetch([
      [/\/session$/, { status: 201, body: { ok: true, persona: 'AIYA' } }],
    ]);
    const client = createDeepKoreClient(impl);
    const opened = await client.createSession();
    // An interface that looks open and cannot send is worse than one that says it failed.
    expect(opened.ok).toBe(false);
    if (!opened.ok) expect(opened.failure.code).toBe('origin_error');
  });
});

// ---------------------------------------------------------------------------
// Failure typing
// ---------------------------------------------------------------------------

describe('a failure is typed, and never becomes prose', () => {
  test('a request that never completed is status 0 and reported as unavailable', async () => {
    const { impl } = stubFetch([[/\/session$/, { status: 0, throws: true }]]);
    const client = createDeepKoreClient(impl);
    const opened = await client.createSession();

    expect(opened.ok).toBe(false);
    if (opened.ok) return;
    expect(opened.failure.status).toBe(0);
    expect(opened.failure.code).toBe('DEEP_KORE_UNAVAILABLE');
    expect(opened.failure.fatal).toBe(false);
  });

  test('a refusal the server sent keeps its own code and its own status', async () => {
    const { impl } = stubFetch([
      [/\/session$/, { status: 503, body: { error_code: 'DEEP_KORE_SESSION_CAPACITY' } }],
    ]);
    const opened = await createDeepKoreClient(impl).createSession();
    expect(opened.ok).toBe(false);
    if (opened.ok) return;
    // Capacity and outage are different facts. Only the code distinguishes them, and it
    // must survive the boundary intact.
    expect(opened.failure.code).toBe('DEEP_KORE_SESSION_CAPACITY');
    expect(opened.failure.status).toBe(503);
  });

  test('an unrecognised code is never carried forward', async () => {
    const { impl } = stubFetch([
      [/\/session$/, { status: 503, body: { error_code: '<script>alert(1)</script>' } }],
    ]);
    const opened = await createDeepKoreClient(impl).createSession();
    expect(opened.ok).toBe(false);
    if (opened.ok) return;
    // It collapses to a code this site defined, whose approved sentence is true of any
    // refusal the site cannot name.
    expect(opened.failure.code).toBe('origin_error');
  });

  test('only a vanished session is fatal', async () => {
    const gone = stubFetch([
      [/\/session$/, { status: 201, body: SESSION_OK }],
      [/\/message$/, { status: 404, body: { error_code: 'session_expired' } }],
    ]);
    const a = createDeepKoreClient(gone.impl);
    await a.createSession();
    const expired = await a.submitTurn('hi');
    expect(expired.ok).toBe(false);
    if (!expired.ok) expect(expired.failure.fatal).toBe(true);

    const busy = stubFetch([
      [/\/session$/, { status: 201, body: SESSION_OK }],
      [/\/message$/, { status: 409, body: { error_code: 'session_busy' } }],
    ]);
    const b = createDeepKoreClient(busy.impl);
    await b.createSession();
    const refused = await b.submitTurn('hi');
    expect(refused.ok).toBe(false);
    // One request was refused. The conversation is still there.
    if (!refused.ok) expect(refused.failure.fatal).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// The typed result union
// ---------------------------------------------------------------------------

describe('a wire result becomes a typed result, or a typed fault', () => {
  const kinds = (r: DeepKoreResult) => r.kind;

  test('every kind the server can send has a reading', () => {
    const read = [
      readResult({ kind: 'GOVERNED_TEXT', turn: TURN }),
      readResult({ kind: 'GOVERNED_REFUSAL', turn: TURN }),
      readResult({
        kind: 'TAV_REQUEST',
        turn: TURN,
        tav: { tav_id: 't', entity_ref: 'e', field: 'EMAIL', purpose: 'RESPONSE_REQUIRES_LITERAL_VALUE' },
      }),
      readResult({
        kind: 'UNKNOWN_CONCEPT_OFFER',
        turn: TURN,
        offer: { reference: 'ab', description: 'one term' },
      }),
      readResult({ kind: 'TERMINAL_FAILURE', error_code: 'turn_failed' }),
    ].map(kinds);

    expect([...read].sort()).toEqual([...RESULT_KINDS].sort());
  });

  test('an unrecognised discriminant is a fault, never a new state', () => {
    const r = readResult({ kind: 'SOMETHING_ADDED_LATER', turn: TURN });
    expect(r).toEqual({ kind: 'TERMINAL_FAILURE', code: 'malformed_engine_result' });
  });

  test('a TAV request without its question is a fault, not a bare answer', () => {
    // Showing the text alone would silently drop the question the engine needed answered.
    expect(readResult({ kind: 'TAV_REQUEST', turn: TURN }).kind).toBe('TERMINAL_FAILURE');
    expect(readResult({ kind: 'TAV_REQUEST', turn: TURN, tav: { tav_id: 't' } }).kind).toBe(
      'TERMINAL_FAILURE'
    );
  });

  test('an offer without its reference is a fault: consent could name nothing', () => {
    expect(readResult({ kind: 'UNKNOWN_CONCEPT_OFFER', turn: TURN }).kind).toBe('TERMINAL_FAILURE');
  });

  test('a turn with no text is a fault, not an empty message', () => {
    expect(readResult({ kind: 'GOVERNED_TEXT', turn: { persona: 'AIYA' } }).kind).toBe(
      'TERMINAL_FAILURE'
    );
  });

  test('nothing beyond the projected fields survives the reading', () => {
    const r = readResult({
      kind: 'GOVERNED_TEXT',
      turn: {
        ...TURN,
        state_hash: 'c0056f8303e08d66',
        gk1_decision: 'ALLOW',
        transform_count: 3,
        vanguard_diag: 'in=0 corr=0',
      },
    });
    expect(r.kind).toBe('GOVERNED_TEXT');
    if (r.kind !== 'GOVERNED_TEXT') return;
    // The application model has nowhere to put a diagnostic, so one cannot ride along
    // into the interface even if the server ever started sending it.
    expect(Object.keys(r.turn).sort()).toEqual(['governance', 'persona', 'text']);
    expect(Object.keys(r.turn.governance).sort()).toEqual(['passed', 'stamp']);
    expect(JSON.stringify(r)).not.toContain('c0056f8303e08d66');
  });

  test('a null, a string and an array are all faults rather than throwing', () => {
    for (const bad of [null, undefined, 'GOVERNED_TEXT', [], 42]) {
      expect(readResult(bad).kind).toBe('TERMINAL_FAILURE');
    }
  });
});

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

describe('a job read reports transport state without inventing engine state', () => {
  test('queued and running both collapse to one waiting state', async () => {
    for (const state of ['queued', 'running']) {
      const { impl } = stubFetch([
        [/\/session$/, { status: 201, body: SESSION_OK }],
        [/\/result\//, { status: 200, body: { state } }],
      ]);
      const client = createDeepKoreClient(impl);
      await client.createSession();
      const read = await client.readJob('job-1');
      expect(read.ok).toBe(true);
      if (read.ok) expect(read.value.kind).toBe('RUNNING');
    }
  });

  test('a failed job is a terminal result, not a transport failure', async () => {
    const { impl } = stubFetch([
      [/\/session$/, { status: 201, body: SESSION_OK }],
      [/\/result\//, { status: 200, body: { state: 'failed', error_code: 'turn_failed' } }],
    ]);
    const client = createDeepKoreClient(impl);
    await client.createSession();
    const read = await client.readJob('job-1');

    // The POLL succeeded; the TURN produced nothing. The distinction the visitor needs is
    // the second one, and this path carries no text at all.
    expect(read.ok).toBe(true);
    if (!read.ok || read.value.kind !== 'DONE') return;
    expect(read.value.result).toEqual({ kind: 'TERMINAL_FAILURE', code: 'turn_failed' });
  });

  test('an unrecognised transport state is a fault', async () => {
    const { impl } = stubFetch([
      [/\/session$/, { status: 201, body: SESSION_OK }],
      [/\/result\//, { status: 200, body: { state: 'thinking' } }],
    ]);
    const client = createDeepKoreClient(impl);
    await client.createSession();
    const read = await client.readJob('job-1');
    expect(read.ok).toBe(false);
    if (!read.ok) expect(read.failure.code).toBe('malformed_engine_result');
  });

  test('the browser sends no session with a job read', async () => {
    const { impl, calls } = stubFetch([
      [/\/session$/, { status: 201, body: SESSION_OK }],
      [/\/result\//, { status: 200, body: { state: 'running' } }],
    ]);
    const client = createDeepKoreClient(impl);
    await client.createSession();
    await client.readJob('job-1');

    const poll = calls.find((c) => c.url.includes('/result/'))!;
    expect(poll.init.method).toBe('GET');
    expect(poll.init.body).toBeUndefined();
    // The server addresses the job with the session it verified. A browser-supplied one
    // would be a value the visitor could choose.
    expect(JSON.stringify(poll.init.headers ?? {})).not.toContain('Session');
  });
});

// ---------------------------------------------------------------------------
// What the browser is allowed to say
// ---------------------------------------------------------------------------

describe('the browser sends a key-shaped thing and nothing else', () => {
  test('a turn carries text, an idempotency key, and at most a typed decision', async () => {
    const { client, calls } = await openedClient([
      [/\/message$/, { status: 202, body: { job_id: 'job-1' } }],
    ]);
    await client.submitTurn('hello', { turnKey: 'turn-7' });
    const body = JSON.parse(String(calls.find((c) => c.url.endsWith('/message'))!.init.body));
    expect(Object.keys(body).sort()).toEqual(['text', 'turn_key']);
  });

  test('a TAV answer crosses as a decision with no field that could carry a value', async () => {
    const { client, calls } = await openedClient([
      [/\/message$/, { status: 202, body: { job_id: 'job-1' } }],
    ]);
    await client.submitTurn('Continue.', {
      turnKey: 'turn-8',
      disclosure: {
        tav_id: 'tav-1',
        target_entity_id: 'e1',
        field: 'PHONE_NUMBER',
        decision: 'DENIED_BY_POLICY',
      },
    });

    const raw = String(calls.find((c) => c.url.endsWith('/message'))!.init.body);
    expect(raw).not.toContain('"value"');
    const body = JSON.parse(raw) as { device: { tav_disclosures: Array<Record<string, unknown>> } };
    expect(Object.keys(body.device.tav_disclosures[0]!).sort()).toEqual([
      'decision',
      'field',
      'target_entity_id',
      'tav_id',
    ]);
  });

  test('a consent decision names the reference and takes a position, and authors nothing', async () => {
    const { client, calls } = await openedClient([
      [/\/consent$/, { status: 200, body: { submitted: true } }],
    ]);
    const decided = await client.decideCandidate('ab12'.repeat(8), true);
    expect(decided.ok).toBe(true);
    if (decided.ok) expect(decided.value.kind).toBe('SUBMITTED');

    const body = JSON.parse(String(calls.find((c) => c.url.endsWith('/consent'))!.init.body));
    expect(Object.keys(body).sort()).toEqual(['consent', 'reference']);
  });

  test('a 200 that does not confirm the write is not a submission', async () => {
    const { client } = await openedClient([[/\/consent$/, { status: 200, body: {} }]]);
    const decided = await client.decideCandidate('ab12'.repeat(8), true);

    // Success is the SERVER'S word, not the absence of an error. Reporting one here
    // would be a false success about the only thing that control promises.
    expect(decided.ok).toBe(false);
    if (!decided.ok) expect(decided.failure.code).toBe('teaching_broker_unavailable');
  });

  test('declining is a decline whatever the body says about submission', async () => {
    const { client } = await openedClient([
      [/\/consent$/, { status: 200, body: { discarded: true, submitted: true } }],
    ]);
    const decided = await client.decideCandidate('ab12'.repeat(8), false);
    expect(decided.ok).toBe(true);
    if (decided.ok) expect(decided.value.kind).toBe('DISCARDED');
  });
});

// ---------------------------------------------------------------------------
// Cancellation
// ---------------------------------------------------------------------------

describe('cancellation stops this browser waiting, and nothing else', () => {
  test('abort ends the in-flight request without producing an answer', async () => {
    let seen: AbortSignal | undefined;
    const impl = (async (_url: string, init?: RequestInit) => {
      seen = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    }) as unknown as typeof fetch;

    const client = createDeepKoreClient(impl);
    const pending = client.createSession();
    // Let the call reach fetch before aborting it.
    await Promise.resolve();
    client.abort();

    const result = await pending;
    expect(seen).toBeInstanceOf(AbortSignal);
    // An aborted request produced no response, so it is reported as one that never
    // completed - never as something Deep Kore said.
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.status).toBe(0);
  });
});
