import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ServerResponse } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sessionRoute from '../../api/deep-kore/session.js';
import messageRoute from '../../api/deep-kore/message.js';
import resultRoute from '../../api/deep-kore/result/[jobId].js';
import consentRoute from '../../api/deep-kore/consent.js';
import {
  readPhase,
  toPublicTurn,
  publicStamp,
  signSession,
  verifySession,
  invalidConfig,
  readConfig,
  MIN_SESSION_SECRET_LENGTH,
  CODE_SESSION_CAPACITY,
  CODE_UNAVAILABLE,
  ERROR_CODES,
  isErrorCode,
} from '../../api/_lib/deep-kore-core.js';
import {
  RESULT_KINDS,
  isResultKind,
  MAX_DEVICE_BYTES,
} from '../../api/_lib/deep-kore-codes.js';
import { ERROR_COPY } from '../../src/data/deep-kore.js';

// Endpoint-level tests for the public Deep Kore chat gateway.
//
// These exercise the half that must be right without a live engine: every refusal, the
// governance passthrough, and the boundary that keeps private state out of the browser.
// The origin is stubbed, so what is under test is THIS site's behaviour - never the
// engine's, whose results are only ever passed through.
//
// The load-bearing assertion, repeated deliberately on every failure path, is that a
// refusal carries no prose. There is no mock answer, no cached turn, no scripted FAQ
// and no second engine, so a failure must be structurally unrenderable as something
// Deep Kore said.

// LOCAL TEST VALUES ONLY. These are not defaults and are not real: every one of these
// variables is unset in this repository, has no default anywhere in the code, and the
// gateway refuses to run without it.
const TEST_ORIGIN = 'https://dk-origin.invalid';
const TEST_GATEWAY_TOKEN = 'test-gateway-token-not-a-secret-0123456789';
const TEST_SESSION_SECRET = 'test-session-secret-not-a-secret-0123456789';
const TEST_ACCESS_ID = 'test-access-id-not-a-secret';
const TEST_ACCESS_SECRET = 'test-access-secret-not-a-secret';
const TEST_TURNSTILE_SECRET = 'test-turnstile-secret-not-a-secret';

interface Captured {
  status: number;
  body: Record<string, unknown>;
  headers: Record<string, string | string[]>;
  raw: string;
}

function mockRes(): { res: ServerResponse; captured: Captured } {
  const captured: Captured = { status: 0, body: {}, headers: {}, raw: '' };
  const res = {
    statusCode: 0,
    setHeader(k: string, v: string | string[]) {
      captured.headers[k.toLowerCase()] = v;
    },
    end(payload?: string) {
      captured.status = (this as { statusCode: number }).statusCode;
      captured.raw = payload ?? '';
      try {
        captured.body = payload ? JSON.parse(payload) : {};
      } catch {
        captured.body = {};
      }
    },
  } as unknown as ServerResponse;
  return { res, captured };
}

function mockReq(over: Record<string, unknown> = {}) {
  const headers = {
    'content-type': 'application/json',
    'x-forwarded-proto': 'https',
    ...((over.headers as Record<string, string>) ?? {}),
  };
  return {
    method: 'POST',
    url: '/api/deep-kore/session',
    socket: { remoteAddress: '203.0.113.10' },
    async *[Symbol.asyncIterator]() {
      // No streamed body; tests supply `body` directly, as Vercel's runtime does.
    },
    ...over,
    headers,
  } as never;
}

function setCookies(captured: Captured): string[] {
  const v = captured.headers['set-cookie'];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function cookieHeaderFrom(captured: Captured): string {
  return setCookies(captured)
    .map((c) => c.split(';')[0])
    .join('; ');
}

/**
 * Reads a Set-Cookie value by BASE name, preferring the `__Host-` prefixed form - the
 * same preference the server applies when reading them back.
 */
function cookieValue(captured: Captured, base: string): string | undefined {
  const byName = new Map<string, string>();
  for (const c of setCookies(captured)) {
    const pair = c.split(';')[0] ?? '';
    const eq = pair.indexOf('=');
    if (eq > 0) byName.set(pair.slice(0, eq), decodeURIComponent(pair.slice(eq + 1)));
  }
  return byName.get(`__Host-${base}`) || byName.get(base) || undefined;
}

/** A stub origin. Each entry answers one path prefix. */
function stubFetch(routes: Array<[RegExp, { status: number; body: unknown }]>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const impl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    calls.push({ url: u, init: init ?? {} });
    for (const [pattern, answer] of routes) {
      if (pattern.test(u)) {
        return new Response(JSON.stringify(answer.body), {
          status: answer.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } });
  });
  return { impl, calls };
}

/**
 * A complete, governed engine result exactly as the origin returns it.
 *
 * The stamp is the REAL shape, measured against the live engine on 2026-09-01 rather
 * than invented. That matters: an invented stamp would not have carried `state_hash=`
 * inside it, and the leak these tests now cover would have stayed invisible.
 */
const REAL_STAMP =
  'GOV_STAMP|gk=pass|iters=0|state_hash=c0056f8303e08d66|policy=text_only|caps=emit_text|dm_stamp=|persona=AIYA';
const REDACTED_STAMP = 'GOV_STAMP|gk=pass|persona=AIYA';

function engineResult(over: Record<string, unknown> = {}) {
  return {
    text: 'I am AIya.',
    persona: 'AIYA',
    gk_passed: true,
    gk1_decision: 'ALLOW',
    gk2_decision: 'ALLOW',
    gov_stamp: REAL_STAMP,
    transform_count: 0,
    state_hash: 'c0056f8303e08d66',
    warmed_text: '',
    vanguard_enabled: false,
    ...over,
  };
}

const ORIGINAL_ENV = { ...process.env };

function configure(phase: string, over: Record<string, string | undefined> = {}) {
  process.env.DEEP_KORE_CHAT_PHASE = phase;
  process.env.DEEP_KORE_ORIGIN_URL = TEST_ORIGIN;
  process.env.DEEP_KORE_ACCESS_CLIENT_ID = TEST_ACCESS_ID;
  process.env.DEEP_KORE_ACCESS_CLIENT_SECRET = TEST_ACCESS_SECRET;
  process.env.DEEP_KORE_GATEWAY_TOKEN = TEST_GATEWAY_TOKEN;
  process.env.DEEP_KORE_SESSION_SECRET = TEST_SESSION_SECRET;
  process.env.TURNSTILE_SECRET_KEY = TEST_TURNSTILE_SECRET;
  for (const [k, v] of Object.entries(over)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  // Start every test with chat OFF and nothing configured, which is production's state.
  for (const k of [
    'DEEP_KORE_CHAT_PHASE',
    'DEEP_KORE_ORIGIN_URL',
    'DEEP_KORE_ACCESS_CLIENT_ID',
    'DEEP_KORE_ACCESS_CLIENT_SECRET',
    'DEEP_KORE_GATEWAY_TOKEN',
    'DEEP_KORE_SESSION_SECRET',
    'DEEP_KORE_PUBLIC_CANON_VERSION',
    'TURNSTILE_SECRET_KEY',
  ]) {
    delete process.env[k];
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  process.env = { ...ORIGINAL_ENV };
});

// ---------------------------------------------------------------------------
// Fail closed
// ---------------------------------------------------------------------------

describe('phase resolution fails closed', () => {
  test('unset, empty and misspelled all resolve to disabled', () => {
    expect(readPhase(undefined)).toBe('disabled');
    expect(readPhase('')).toBe('disabled');
    expect(readPhase('  ')).toBe('disabled');
    expect(readPhase('pubic')).toBe('disabled');
    expect(readPhase('PUBLIC_')).toBe('disabled');
    expect(readPhase('enabled')).toBe('disabled');
    expect(readPhase('true')).toBe('disabled');
  });

  test('only the two exact spellings turn it on', () => {
    expect(readPhase('public')).toBe('public');
    expect(readPhase(' PUBLIC ')).toBe('public');
    expect(readPhase('private_alpha')).toBe('private_alpha');
  });

  test('with nothing configured, the route is off and reaches no network', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'chat_disabled' });
    expect(impl).not.toHaveBeenCalled();
    expect(setCookies(captured)).toHaveLength(0);
  });

  test('phase on but incompletely configured is a 503 that names nothing publicly', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    configure('public', { DEEP_KORE_GATEWAY_TOKEN: undefined, DEEP_KORE_SESSION_SECRET: undefined });

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'not_configured' });
    // Section 8: no public endpoint reports deployment configuration.
    expect(captured.raw).not.toContain('DEEP_KORE_GATEWAY_TOKEN');
    expect(captured.raw).not.toContain('DEEP_KORE_SESSION_SECRET');
    expect(impl).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// The session signing secret
// ---------------------------------------------------------------------------

describe('the session signing secret fails closed', () => {
  test('an absent secret is a 503 that reaches no network', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha', { DEEP_KORE_SESSION_SECRET: undefined });

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'not_configured' });
    expect(impl).not.toHaveBeenCalled();
    expect(setCookies(captured)).toHaveLength(0);
  });

  // PRESENT BUT UNUSABLE IS THE SAME OUTCOME AS ABSENT. A short secret would otherwise
  // start a service that signs session cookies with something guessable, which looks
  // exactly like a working service.
  test('a secret below the length floor refuses to serve', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha', { DEEP_KORE_SESSION_SECRET: 'x'.repeat(MIN_SESSION_SECRET_LENGTH - 1) });

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'not_configured' });
    expect(impl).not.toHaveBeenCalled();
  });

  test('exactly the floor is accepted; the floor is a floor, not a strength claim', () => {
    const at = readConfig({
      DEEP_KORE_CHAT_PHASE: 'private_alpha',
      DEEP_KORE_SESSION_SECRET: 'y'.repeat(MIN_SESSION_SECRET_LENGTH),
      DEEP_KORE_GATEWAY_TOKEN: TEST_GATEWAY_TOKEN,
    } as NodeJS.ProcessEnv);
    expect(invalidConfig(at)).toEqual([]);
  });

  // A secret copied from another field means one leak crosses two boundaries. It is the
  // exact mistake a hurried copy-paste between Vercel environment fields produces, and
  // nothing else would ever notice it.
  test('a secret reused from another credential refuses to serve', async () => {
    for (const shared of ['DEEP_KORE_GATEWAY_TOKEN', 'DEEP_KORE_ACCESS_CLIENT_SECRET'] as const) {
      const { impl } = stubFetch([]);
      vi.stubGlobal('fetch', impl);
      configure('private_alpha');
      process.env.DEEP_KORE_SESSION_SECRET = process.env[shared];

      const { res, captured } = mockRes();
      await sessionRoute(mockReq({ body: {} }), res);

      expect(captured.status, `reusing ${shared} must refuse`).toBe(503);
      expect(impl).not.toHaveBeenCalled();
    }
  });

  test('the refusal names no variable and no value to the browser', async () => {
    vi.stubGlobal('fetch', stubFetch([]).impl);
    configure('private_alpha', { DEEP_KORE_SESSION_SECRET: 'short' });

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.raw).not.toContain('DEEP_KORE_SESSION_SECRET');
    expect(captured.raw).not.toContain('short');
    expect(Object.keys(captured.body)).toEqual(['error_code']);
  });

  test('a disabled phase never evaluates the secret at all', () => {
    const off = readConfig({ DEEP_KORE_SESSION_SECRET: 'short' } as NodeJS.ProcessEnv);
    expect(off.phase).toBe('disabled');
    expect(invalidConfig(off)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Request boundary
// ---------------------------------------------------------------------------

describe('request boundary', () => {
  test('a non-JSON content type is refused before any body is read', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha');

    const { res, captured } = mockRes();
    await sessionRoute(
      mockReq({ headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: {} }),
      res
    );

    expect(captured.status).toBe(415);
    expect(captured.body).toEqual({ error_code: 'unsupported_media_type' });
    expect(impl).not.toHaveBeenCalled();
  });

  // GET was an unsupported verb until protocol DKW1.2, when it became the session's
  // initialization-status read. It is a METHOD on this route rather than a fifth Deep
  // Kore endpoint, because canon section 8 closes the route list and a status read is
  // another question about the session the caller already holds. PUT never had a meaning
  // here and still does not, so it is what proves the refusal path.
  test('the wrong verb is 405 with an Allow header, not a silent 404', async () => {
    configure('private_alpha');
    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ method: 'PUT' }), res);

    expect(captured.status).toBe(405);
    expect(captured.headers['allow']).toBe('POST, GET, DELETE');
  });

  // ---------------------------------------------------------------------------
  // protocol DKW1.2 - ASYNCHRONOUS IDEMPOTENT SESSION CREATION
  //
  // The origin answers 202 with `initializing` and finishes the expensive worker start
  // afterwards, because waiting inside one HTTP request meant a measured 14.2s against a
  // 10s transport bound - which timed out the caller while the origin went on to build a
  // session nobody held a reference to. These assert the website half of the fix.
  // ---------------------------------------------------------------------------

  test('session creation forwards a derived creation identity, never the browser key', async () => {
    configure('private_alpha');
    const { impl, calls } = stubFetch([
      [
        /\/v1\/sessions$/,
        { status: 202, body: { session_id: 'dks-abc', state: 'initializing', duplicate: false } },
      ],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: { creation_key: 'visitor-chosen-key' } }), res);

    expect(captured.status).toBe(201);
    const sent = JSON.parse(String(calls[0]?.init?.body ?? '{}')) as Record<string, unknown>;
    // The upstream identity is an HMAC of the key under the server secret, exactly as a
    // turn key becomes a message id. The visitor can make a retry idempotent; they cannot
    // choose, guess, or collide with an upstream identifier.
    expect(typeof sent['creation_id']).toBe('string');
    expect(sent['creation_id']).not.toBe('visitor-chosen-key');
    expect(String(sent['creation_id'])).toMatch(/^[0-9a-f]{32}$/);
  });

  test('the same creation key always derives the same creation identity', async () => {
    configure('private_alpha');
    const idFor = async (key: string) => {
      const { impl, calls } = stubFetch([
        [/\/v1\/sessions$/, { status: 202, body: { session_id: 'dks-abc', state: 'initializing' } }],
      ]);
      vi.stubGlobal('fetch', impl);
      const { res } = mockRes();
      await sessionRoute(mockReq({ body: { creation_key: key } }), res);
      return (JSON.parse(String(calls[0]?.init?.body ?? '{}')) as Record<string, unknown>)[
        'creation_id'
      ];
    };

    // THIS IS THE WHOLE POINT. A retry after an uncertain response must resolve to the
    // same session rather than allocate a second worker and a second capacity slot.
    expect(await idFor('same-key')).toBe(await idFor('same-key'));
    expect(await idFor('same-key')).not.toBe(await idFor('different-key'));
  });

  test('an accepted session reports initializing and does not claim to be ready', async () => {
    configure('private_alpha');
    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/sessions$/,
          { status: 202, body: { session_id: 'dks-abc', state: 'initializing', duplicate: false } },
        ],
      ]).impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: { creation_key: 'k1' } }), res);

    expect(captured.status).toBe(201);
    expect(captured.body['state']).toBe('initializing');
    expect(captured.body['ok']).toBe(true);
  });

  test('a DKW1 origin answering 201 is reported ready, so either protocol works', async () => {
    configure('private_alpha');
    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc' } }]]).impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: { creation_key: 'k1' } }), res);

    // A DKW1 gateway only answers once the worker is READY, so 201 IS readiness there.
    // Accepting both is what lets this site work against either origin without guessing.
    expect(captured.status).toBe(201);
    expect(captured.body['state']).toBe('ready');
  });

  test('the status read reports the origin state and never invents one', async () => {
    configure('private_alpha');
    const s = await openSession();

    for (const [originState, expected] of [
      ['initializing', 'initializing'],
      ['ready', 'ready'],
    ] as const) {
      vi.stubGlobal(
        'fetch',
        stubFetch([[/\/v1\/sessions\//, { status: 200, body: { state: originState } }]]).impl
      );
      const { res, captured } = mockRes();
      await sessionRoute(mockReq({ method: 'GET', headers: { cookie: s.cookie } }), res);
      expect(captured.status).toBe(200);
      expect(captured.body['state']).toBe(expected);
    }
  });

  test('a failed initialization carries a closed public code, never the origin string', async () => {
    configure('private_alpha');
    const s = await openSession();

    for (const [originCode, expected] of [
      ['provenance_mismatch', 'DEEP_KORE_PROVENANCE_MISMATCH'],
      ['engine_unavailable', 'DEEP_KORE_UNAVAILABLE'],
      // Anything the origin adds later lands on the honest closed default rather than
      // becoming a new public string this site never approved.
      ['some_future_origin_code', 'DEEP_KORE_UNAVAILABLE'],
    ] as const) {
      vi.stubGlobal(
        'fetch',
        stubFetch([
          [/\/v1\/sessions\//, { status: 200, body: { state: 'failed', failure_code: originCode } }],
        ]).impl
      );
      const { res, captured } = mockRes();
      await sessionRoute(mockReq({ method: 'GET', headers: { cookie: s.cookie } }), res);
      expect(captured.body['state']).toBe('failed');
      expect(captured.body['error_code']).toBe(expected);
      expect(captured.raw).not.toContain(originCode === 'engine_unavailable' ? 'zzz' : originCode);
    }
  });

  test('an unrecognised origin state is a fault, not a new public state', async () => {
    configure('private_alpha');
    const s = await openSession();
    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions\//, { status: 200, body: { state: 'warming_up' } }]]).impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ method: 'GET', headers: { cookie: s.cookie } }), res);
    expect(captured.status).toBe(502);
    expect(captured.body['error_code']).toBe('origin_error');
  });

  test('a status read without a session never reaches the origin', async () => {
    configure('private_alpha');
    const { impl, calls } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ method: 'GET' }), res);

    expect(captured.status).toBe(401);
    expect(captured.body['error_code']).toBe('no_session');
    expect(calls.length, 'an unauthenticated status read must not touch the origin').toBe(0);
  });

  test('an unrecognised session body key is still refused after creation_key was added', async () => {
    configure('private_alpha');
    const { impl, calls } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: { creation_key: 'k1', session_id: 'dks-theirs' } }), res);

    expect(captured.status).toBe(400);
    expect(calls.length).toBe(0);
  });

  test('an unrecognised persona is refused, never reassigned to a default', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha');

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: { persona: 'AIYA_ADMIN' } }), res);

    expect(captured.status).toBe(400);
    expect(captured.body).toEqual({ error_code: 'unsupported_persona' });
    expect(impl).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Turnstile
// ---------------------------------------------------------------------------

describe('anonymous public access is gated by a real verification', () => {
  test('a failed siteverify creates no session and never reaches the origin', async () => {
    const { impl, calls } = stubFetch([
      [/turnstile\/v0\/siteverify/, { status: 200, body: { success: false } }],
    ]);
    vi.stubGlobal('fetch', impl);
    configure('public');

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: { turnstile_token: 'looks-solved-but-is-not' } }), res);

    expect(captured.status).toBe(403);
    expect(captured.body).toEqual({ error_code: 'verification_failed' });
    expect(calls.every((c) => c.url.includes('siteverify'))).toBe(true);
    expect(setCookies(captured)).toHaveLength(0);
  });

  test('a missing token is refused without calling Cloudflare at all', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    configure('public');

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.status).toBe(403);
    expect(impl).not.toHaveBeenCalled();
  });

  test('private_alpha does not require a Turnstile secret', async () => {
    const { impl } = stubFetch([
      [/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc', persona: 'AIYA' } }],
    ]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha', { TURNSTILE_SECRET_KEY: undefined });

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// Session binding
// ---------------------------------------------------------------------------

describe('session binding', () => {
  // THE __Host- CONTRACT. A browser refuses to store a `__Host-` cookie unless it is
  // Secure, has Path=/, and carries NO Domain. Asserting all four together is the point:
  // dropping any one of them silently downgrades the cookie from host-only to something
  // a sibling host could shadow, and the name would still look right.
  test('the production cookies are __Host- prefixed, host-only, and correctly scoped', async () => {
    const { impl } = stubFetch([
      [/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc', persona: 'AIYA' } }],
    ]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha');

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    const cookies = setCookies(captured);
    const dkSession = cookies.find((c) => c.startsWith('__Host-dk_session='))!;
    const dkCsrf = cookies.find((c) => c.startsWith('__Host-dk_csrf='))!;
    expect(dkSession, 'the session cookie must use the __Host- prefix').toBeDefined();
    expect(dkCsrf, 'the CSRF cookie must use the __Host- prefix').toBeDefined();

    for (const c of [dkSession, dkCsrf]) {
      expect(c).toContain('Secure');
      expect(c).toContain('Path=/');
      expect(c).toContain('SameSite=Strict');
      expect(c, 'a Domain attribute makes __Host- invalid and the cookie host-wide').not.toMatch(
        /;\s*Domain=/i
      );
    }

    expect(dkSession).toContain('HttpOnly');
    // Deliberately readable. The page does not in fact read it - the token is returned
    // in the response body and held in memory - but the double-submit comparison is
    // against this cookie, so it must not be HttpOnly.
    expect(dkCsrf).not.toContain('HttpOnly');
  });

  // No Max-Age and no Expires: these are browser-session cookies. A lifetime here would
  // be a second, absolute expiry that could contradict the upstream terminal-idle
  // policy - a visitor still chatting past it would lose their session for no reason.
  test('the cookies carry no invented lifetime of their own', async () => {
    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc' } }]]).impl
    );
    configure('private_alpha');

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    for (const c of setCookies(captured)) {
      expect(c, 'a set cookie must not carry Max-Age').not.toMatch(/;\s*Max-Age=/i);
      expect(c, 'a set cookie must not carry Expires').not.toMatch(/;\s*Expires=/i);
    }
  });

  // Local development is served over plain http, where a Secure cookie - and therefore
  // `__Host-` - is unreliable across engines. The unprefixed fallback exists so the
  // production policy is exercisable locally instead of being untestable.
  test('an insecure connection falls back to the unprefixed names', async () => {
    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc' } }]]).impl
    );
    configure('private_alpha');

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ headers: { 'x-forwarded-proto': 'http' }, body: {} }), res);

    const cookies = setCookies(captured);
    expect(cookies.some((c) => c.startsWith('dk_session='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('__Host-'))).toBe(false);
    expect(cookies.every((c) => !c.includes('Secure'))).toBe(true);
  });

  test('a session presented under either cookie name is accepted', async () => {
    configure('private_alpha');
    const signed = signSession('dks-abc', TEST_SESSION_SECRET);

    for (const name of ['__Host-dk_session', 'dk_session']) {
      vi.stubGlobal(
        'fetch',
        stubFetch([[/\/messages$/, { status: 202, body: { job_id: 'dkj-1' } }]]).impl
      );
      const { res, captured } = mockRes();
      await messageRoute(
        mockReq({
          url: '/api/deep-kore/message',
          headers: { cookie: `${name}=${signed}; __Host-dk_csrf=t; dk_csrf=t`, 'x-dk-csrf': 't' },
          body: { text: 'hello' },
        }),
        res
      );
      expect(captured.status, `${name} must be accepted`).toBe(202);
    }
  });

  test('the raw upstream session id is never handed to the browser unauthenticated', async () => {
    const { impl } = stubFetch([
      [/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc', persona: 'AIYA' } }],
    ]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha');

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    // It rides in the cookie, but MAC'd, so it cannot be substituted or minted.
    const cookie = cookieValue(captured, 'dk_session')!;
    expect(cookie.startsWith('dks-abc.')).toBe(true);
    expect(verifySession(cookie, TEST_SESSION_SECRET)).toBe('dks-abc');
    // And it is not loose in the response body.
    expect(captured.body['session_id']).toBeUndefined();
  });

  test('a forged or tampered session cookie is rejected', () => {
    const good = signSession('dks-abc', TEST_SESSION_SECRET);
    expect(verifySession(good, TEST_SESSION_SECRET)).toBe('dks-abc');

    // Minted from nothing.
    expect(verifySession('dks-victim.AAAA', TEST_SESSION_SECRET)).toBeNull();
    // Another session's id under this session's MAC.
    const dot = good.lastIndexOf('.');
    expect(verifySession(`dks-victim${good.slice(dot)}`, TEST_SESSION_SECRET)).toBeNull();
    // Right id, wrong secret.
    expect(verifySession(good, 'a-different-secret-entirely')).toBeNull();
    expect(verifySession(undefined, TEST_SESSION_SECRET)).toBeNull();
  });

  test('a message with no valid session is 401 and reaches no origin', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha');

    const { res, captured } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: 'dk_session=dks-victim.AAAA; dk_csrf=t', 'x-dk-csrf': 't' },
        body: { text: 'hello' },
      }),
      res
    );

    expect(captured.status).toBe(401);
    expect(captured.body).toEqual({ error_code: 'no_session' });
    expect(impl).not.toHaveBeenCalled();
  });

  test('a message with no CSRF header is refused even with a valid session cookie', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    configure('private_alpha');

    const { res, captured } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: `dk_session=${signSession('dks-abc', TEST_SESSION_SECRET)}; dk_csrf=t` },
        body: { text: 'hello' },
      }),
      res
    );

    expect(captured.status).toBe(403);
    expect(captured.body).toEqual({ error_code: 'csrf_failed' });
    expect(impl).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Message submission
// ---------------------------------------------------------------------------

/** Creates a session and returns the cookie header and CSRF token a browser would hold. */
async function openSession(sessionId = 'dks-abc') {
  const { impl } = stubFetch([
    [/\/v1\/sessions$/, { status: 201, body: { session_id: sessionId, persona: 'AIYA' } }],
  ]);
  vi.stubGlobal('fetch', impl);
  const { res, captured } = mockRes();
  await sessionRoute(mockReq({ body: {} }), res);
  return {
    cookie: cookieHeaderFrom(captured),
    csrf: cookieValue(captured, 'dk_csrf')!,
  };
}

describe('message submission', () => {
  test('accepted turns answer 202 with a job id, never a response', async () => {
    configure('private_alpha');
    const s = await openSession();

    const { impl, calls } = stubFetch([
      [/\/messages$/, { status: 202, body: { job_id: 'dkj-1', message_id: 'm1', duplicate: false } }],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { text: 'What are you?' },
      }),
      res
    );

    expect(captured.status).toBe(202);
    expect(captured.body['job_id']).toBe('dkj-1');
    // The acceptance carries no prose of any kind.
    expect(captured.raw).not.toContain('"text"');
    expect(calls[0]!.url).toBe(`${TEST_ORIGIN}/v1/sessions/dks-abc/messages`);
  });

  test('the browser cannot choose the upstream message id', async () => {
    configure('private_alpha');
    const s = await openSession();

    const { impl, calls } = stubFetch([
      [/\/messages$/, { status: 202, body: { job_id: 'dkj-1', duplicate: false } }],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { text: 'hi', message_id: 'collide-with-someone-elses-job' },
      }),
      res
    );

    // REFUSED, not ignored. An unknown key on this body is a 400 that never reaches the
    // origin. Silently dropping it would let a caller believe it had chosen an upstream
    // identifier, and would make the absence of that field a habit rather than a rule.
    expect(captured.status).toBe(400);
    expect(captured.body).toEqual({ error_code: 'bad_request' });
    expect(calls).toHaveLength(0);
  });

  test('a lawful turn sends the origin exactly two fields, with a server-generated id', async () => {
    configure('private_alpha');
    const s = await openSession();

    const { impl, calls } = stubFetch([
      [/\/messages$/, { status: 202, body: { job_id: 'dkj-1', duplicate: false } }],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { text: 'hi' },
      }),
      res
    );

    const sent = JSON.parse(String(calls[0]!.init.body)) as Record<string, unknown>;
    expect(String(sent['message_id'])).toMatch(/^[0-9a-f]{32}$/);
    expect(Object.keys(sent).sort()).toEqual(['message_id', 'text']);
  });

  test('a turn_key makes a retry idempotent without letting the visitor pick the id', async () => {
    configure('private_alpha');
    const a = await openSession('dks-A');

    const capture = async (cookie: string, csrf: string, turnKey: string) => {
      const { impl, calls } = stubFetch([
        [/\/messages$/, { status: 202, body: { job_id: 'dkj-1', duplicate: false } }],
      ]);
      vi.stubGlobal('fetch', impl);
      const { res } = mockRes();
      await messageRoute(
        mockReq({
          url: '/api/deep-kore/message',
          headers: { cookie, 'x-dk-csrf': csrf },
          body: { text: 'hi', turn_key: turnKey },
        }),
        res
      );
      return (JSON.parse(String(calls[0]!.init.body)) as Record<string, unknown>)['message_id'];
    };

    const first = await capture(a.cookie, a.csrf, 'turn-7');
    const retry = await capture(a.cookie, a.csrf, 'turn-7');
    const other = await capture(a.cookie, a.csrf, 'turn-8');
    expect(retry).toBe(first);
    expect(other).not.toBe(first);

    // The same key in a different session is a different id: the session is inside the
    // MAC, so one visitor cannot aim a turn key at another visitor's job.
    const b = await openSession('dks-B');
    expect(await capture(b.cookie, b.csrf, 'turn-7')).not.toBe(first);
  });

  test('an oversized message is refused here rather than proxied', async () => {
    configure('private_alpha');
    const s = await openSession();

    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { text: 'x'.repeat(8193) },
      }),
      res
    );

    expect(captured.status).toBe(413);
    expect(impl).not.toHaveBeenCalled();
  });

  test('an empty message is refused', async () => {
    configure('private_alpha');
    const s = await openSession();
    vi.stubGlobal('fetch', stubFetch([]).impl);

    const { res, captured } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { text: '   ' },
      }),
      res
    );
    expect(captured.status).toBe(400);
    expect(captured.body).toEqual({ error_code: 'empty_text' });
  });

  test('a busy session is refused, never queued behind a running turn', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/messages$/, { status: 409, body: { error_code: 'session_busy' } }]]).impl
    );

    const { res, captured } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { text: 'second question' },
      }),
      res
    );
    expect(captured.status).toBe(409);
    expect(captured.body).toEqual({ error_code: 'session_busy' });
  });
});

// ---------------------------------------------------------------------------
// Result polling
// ---------------------------------------------------------------------------

async function poll(cookie: string, jobId: string) {
  const { res, captured } = mockRes();
  await resultRoute(
    mockReq({
      method: 'GET',
      url: `/api/deep-kore/result/${jobId}`,
      headers: { cookie },
      query: { jobId },
    }),
    res
  );
  return captured;
}

describe('result polling', () => {
  test('queued and running are reported as transport states carrying no text', async () => {
    configure('private_alpha');
    const s = await openSession();

    for (const state of ['queued', 'running']) {
      vi.stubGlobal(
        'fetch',
        stubFetch([[/\/v1\/jobs\//, { status: 200, body: { job_id: 'dkj-1', transport_state: state } }]])
          .impl
      );
      const captured = await poll(s.cookie, 'dkj-1');
      expect(captured.status).toBe(200);
      expect(captured.body).toEqual({ state });
      expect(captured.raw).not.toContain('"text"');
    }
  });

  test('a succeeded turn returns governed text, persona and the stamp - and nothing else', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal(
      'fetch',
      stubFetch([
        [/\/v1\/jobs\//, { status: 200, body: { transport_state: 'succeeded', engine: engineResult() } }],
      ]).impl
    );

    const captured = await poll(s.cookie, 'dkj-1');
    expect(captured.status).toBe(200);
    expect(captured.body['state']).toBe('succeeded');
    expect(captured.body['turn']).toEqual({
      text: 'I am AIya.',
      persona: 'AIYA',
      governance: { passed: true, stamp: REDACTED_STAMP },
      // An ordinary turn establishes nothing. The empty array is the honest answer and
      // is NOT an omission - the field is always present so the interface never has to
      // distinguish "no anchors" from "an older engine that did not send the field".
      anchors: [],
    });
  });

  // ---------------------------------------------------------------------------
  // PUBLIC TESSERACT ANCHORS
  //
  // Added 2026-09-09 with the corrected release d3a4f5af, which introduced
  // `anchors_established_this_turn` on the governed core. These assert the two halves
  // that matter: the handles cross, and NOTHING ELSE about them does.
  // ---------------------------------------------------------------------------

  const ANCHOR_A = 'a'.repeat(64);
  const ANCHOR_B = '0123456789abcdef'.repeat(4);

  test('anchor handles cross to the browser, and nothing else about them does', async () => {
    configure('private_alpha');
    const s = await openSession();
    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/jobs\//,
          {
            status: 200,
            body: {
              transport_state: 'succeeded',
              engine: {
                ...engineResult(),
                anchors_established_this_turn: [{ handle: ANCHOR_A }, { handle: ANCHOR_B }],
              },
            },
          },
        ],
      ]).impl
    );

    const captured = await poll(s.cookie, 'dkj-1');
    expect(captured.status).toBe(200);
    expect((captured.body['turn'] as Record<string, unknown>)['anchors']).toEqual([
      ANCHOR_A,
      ANCHOR_B,
    ]);
  });

  test('a malformed anchor array fails the whole turn rather than being repaired', async () => {
    // Each of these is a different way the origin could be wrong. NONE of them may be
    // silently dropped, filtered, or partially salvaged: showing a visitor a subset of
    // the anchors the engine sent would be this site inventing the list.
    const malformed: unknown[] = [
      'not-an-array',
      [{ handle: 'too-short' }],
      [{ handle: ANCHOR_A.toUpperCase() }],
      [{ handle: ANCHOR_A, coordinate: '3,7' }],
      [{ concept_id: 'weather' }],
      [ANCHOR_A],
      [null],
    ];

    // ONE session, reused across the cases. Opening a session inside the loop would need
    // the session route stubbed as well as the job route, and the mixed stub is what a
    // reader would then have to untangle to see what this test is actually about.
    configure('private_alpha');
    const s = await openSession();

    for (const anchors of malformed) {
      vi.stubGlobal(
        'fetch',
        stubFetch([
          [
            /\/v1\/jobs\//,
            {
              status: 200,
              body: {
                transport_state: 'succeeded',
                engine: { ...engineResult(), anchors_established_this_turn: anchors },
              },
            },
          ],
        ]).impl
      );

      const captured = await poll(s.cookie, 'dkj-1');
      expect(
        captured.body['error_code'],
        `a malformed anchor array was accepted: ${JSON.stringify(anchors)}`
      ).toBe('malformed_engine_result');
      expect(captured.body['turn']).toBeUndefined();
    }
  });

  test('an anchor refusal never echoes what the origin sent', async () => {
    configure('private_alpha');
    const s = await openSession();
    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/jobs\//,
          {
            status: 200,
            body: {
              transport_state: 'succeeded',
              engine: {
                ...engineResult(),
                // An origin that started sending internals alongside the handle. The
                // refusal must not carry any of it back out.
                anchors_established_this_turn: [
                  { handle: ANCHOR_A, concept_id: 'weather', coordinate: '3,7,11' },
                ],
              },
            },
          },
        ],
      ]).impl
    );

    const captured = await poll(s.cookie, 'dkj-1');
    for (const leak of ['weather', 'concept_id', 'coordinate', '3,7,11', ANCHOR_A]) {
      expect(captured.raw, `an anchor refusal leaked ${leak}`).not.toContain(leak);
    }
  });

  // THE STAMP IS REDACTED, NOT REWRITTEN.
  //
  // Found by the live proof, not by reading the source: withholding the `state_hash`
  // FIELD was not enough, because the stamp is a pipe-delimited string that carries the
  // state fingerprint - and the policy and capability vocabulary - inside it. A response
  // that showed the stamp verbatim published exactly what the projection beside it was
  // removing.
  test('the governance stamp is redacted to its publishable segments', () => {
    expect(publicStamp(REAL_STAMP)).toBe(REDACTED_STAMP);
    // Every surviving segment is the engine's own bytes, in the engine's own order.
    for (const segment of REDACTED_STAMP.split('|')) {
      expect(REAL_STAMP).toContain(segment);
    }
  });

  test('an unrecognised stamp segment is withheld by default, not published by default', () => {
    // The allowlist direction is the point. If a future engine change adds a segment,
    // it must not reach the browser because nobody remembered to ban it.
    const future = 'GOV_STAMP|gk=pass|new_internal_field=whatever|persona=AIYA';
    expect(publicStamp(future)).toBe(REDACTED_STAMP);
  });

  test('private engine diagnostics never cross to the browser', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/jobs\//,
          {
            status: 200,
            body: {
              transport_state: 'succeeded',
              engine: engineResult({
                act: 'ANSWER',
                safety: 'SAFE',
                resolution: 'RESOLVED',
                content_class: 'GENERAL',
                adult_consent_invariant_violated: false,
                vanguard_diag: 'registry=established;hits=3',
              }),
            },
          },
        ],
      ]).impl
    );

    const captured = await poll(s.cookie, 'dkj-1');
    for (const forbidden of [
      'state_hash',
      'transform_count',
      'gk1_decision',
      'gk2_decision',
      'vanguard_diag',
      'adult_consent_invariant_violated',
      'content_class',
      'resolution',
      'safety',
      'warmed_text',
      'vanguard_enabled',
    ]) {
      expect(captured.raw).not.toContain(forbidden);
    }
  });

  test('Vanguard is reported, never imitated: off uses the governed text, on uses the warmed text', async () => {
    configure('private_alpha');
    const s = await openSession();

    // Off (the default, byte-identical certified path): warmed_text is empty and unused.
    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/jobs\//,
          {
            status: 200,
            body: {
              transport_state: 'succeeded',
              engine: engineResult({ warmed_text: '', vanguard_enabled: false }),
            },
          },
        ],
      ]).impl
    );
    expect(((await poll(s.cookie, 'dkj-1')).body['turn'] as { text: string }).text).toBe('I am AIya.');

    // On: the engine populated warmed_text, so that is what was actually emitted.
    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/jobs\//,
          {
            status: 200,
            body: {
              transport_state: 'succeeded',
              engine: engineResult({ warmed_text: 'I am AIya, and I am glad you asked.', vanguard_enabled: true }),
            },
          },
        ],
      ]).impl
    );
    expect(((await poll(s.cookie, 'dkj-1')).body['turn'] as { text: string }).text).toBe(
      'I am AIya, and I am glad you asked.'
    );
  });

  test('the site never warms text on its own: a warmed_text with Vanguard off is ignored', () => {
    const turn = toPublicTurn(engineResult({ warmed_text: 'invented warmth', vanguard_enabled: false }));
    expect(turn?.text).toBe('I am AIya.');
  });

  test('a failed job is reported as failed and carries no answer', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/jobs\//,
          { status: 200, body: { transport_state: 'failed', error_code: 'engine_transport_failed' } },
        ],
      ]).impl
    );

    const captured = await poll(s.cookie, 'dkj-1');
    expect(captured.status).toBe(200);
    // The upstream diagnostic ('engine_transport_failed') is deliberately not forwarded:
    // it collapses to the one closed public code.
    expect(captured.body).toEqual({ state: 'failed', error_code: 'turn_failed' });
    expect(captured.raw).not.toContain('engine_transport_failed');
    expect(captured.body['turn']).toBeUndefined();
    expect(captured.raw).not.toContain('"text"');
  });

  test('a succeeded job with an unreadable engine result is a fault, not an answer', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/jobs\//, { status: 200, body: { transport_state: 'succeeded', engine: { text: 'hi' } } }]])
        .impl
    );

    const captured = await poll(s.cookie, 'dkj-1');
    expect(captured.status).toBe(502);
    expect(captured.body).toEqual({ error_code: 'malformed_engine_result' });
  });

  test('the job is addressed with the verified session, never a browser-supplied one', async () => {
    configure('private_alpha');
    const s = await openSession('dks-mine');

    const { impl, calls } = stubFetch([
      [/\/v1\/jobs\//, { status: 200, body: { transport_state: 'queued' } }],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res } = mockRes();
    await resultRoute(
      mockReq({
        method: 'GET',
        url: '/api/deep-kore/result/dkj-1',
        headers: { cookie: s.cookie, 'x-dk-session': 'dks-someone-else' },
        query: { jobId: 'dkj-1' },
      }),
      res
    );

    const sentHeaders = calls[0]!.init.headers as Record<string, string>;
    expect(sentHeaders['X-DK-Session']).toBe('dks-mine');
  });

  test('a job id that is not a plain token is refused before the origin is called', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await resultRoute(
      mockReq({
        method: 'GET',
        url: '/api/deep-kore/result/..%2F..%2Fv1%2Fsessions',
        headers: { cookie: s.cookie },
        query: { jobId: '../../v1/sessions' },
      }),
      res
    );
    expect(captured.status).toBe(400);
    expect(impl).not.toHaveBeenCalled();
  });

  test('a vanished upstream session clears the cookies so the page starts over', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/jobs\//, { status: 404, body: { error_code: 'no_such_session' } }]]).impl
    );

    const captured = await poll(s.cookie, 'dkj-1');
    expect(captured.status).toBe(404);
    expect(captured.body).toEqual({ error_code: 'session_expired' });
    expect(setCookies(captured).join(' ')).toContain('Max-Age=0');
  });
});

// ---------------------------------------------------------------------------
// No fallback, ever
// ---------------------------------------------------------------------------

describe('there is no fallback', () => {
  test('an unreachable origin is reported as a transport failure with no prose', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      })
    );

    const { res, captured } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { text: 'hello' },
      }),
      res
    );

    // 503, not 502: the service is unavailable, not misbehaving. Same status as a
    // capacity refusal, distinguished only by the code - which is the point.
    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'DEEP_KORE_UNAVAILABLE' });
    expect(captured.raw).not.toContain('"text"');
    expect(captured.raw).not.toContain('"turn"');
  });

  test('every refusal path returns a bare machine code and nothing renderable', async () => {
    configure('private_alpha');
    const s = await openSession();

    const refusals: Captured[] = [];

    // Origin 500.
    vi.stubGlobal('fetch', stubFetch([[/\/messages$/, { status: 500, body: {} }]]).impl);
    {
      const { res, captured } = mockRes();
      await messageRoute(
        mockReq({
          url: '/api/deep-kore/message',
          headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
          body: { text: 'hi' },
        }),
        res
      );
      refusals.push(captured);
    }

    // Engine host down at session creation.
    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions$/, { status: 503, body: { error_code: 'engine_unavailable' } }]]).impl
    );
    {
      const { res, captured } = mockRes();
      await sessionRoute(mockReq({ body: {} }), res);
      refusals.push(captured);
    }

    for (const r of refusals) {
      expect(Object.keys(r.body)).toEqual(['error_code']);
      expect(typeof r.body['error_code']).toBe('string');
      expect(r.status).toBeGreaterThanOrEqual(400);
    }
    expect(refusals[1]!.status).toBe(503);
    expect(refusals[1]!.body['error_code']).toBe('DEEP_KORE_UNAVAILABLE');
  });
});

// ---------------------------------------------------------------------------
// Capacity and outage are different facts
// ---------------------------------------------------------------------------

describe('a full service and a broken service are never confused', () => {
  test('capacity is its own stable code and status', async () => {
    configure('private_alpha');
    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions$/, { status: 503, body: { error_code: 'session_capacity' } }]]).impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'DEEP_KORE_SESSION_CAPACITY' });
    // No session was created, so nothing is issued to carry one.
    expect(setCookies(captured)).toHaveLength(0);
  });

  test('an unavailable engine is its own stable code, distinct from capacity', async () => {
    configure('private_alpha');
    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions$/, { status: 503, body: { error_code: 'engine_unavailable' } }]]).impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'DEEP_KORE_UNAVAILABLE' });
  });

  // PROVENANCE MISMATCH IS A THIRD SERVICE STATE, NOT A FAILED REQUEST.
  //
  // The certified gateway compares the commit its worker reports in READY against its own
  // and answers `503 provenance_mismatch` when they disagree. Before this mapping existed
  // that fell through to `502 origin_error`, which reported a mismatched DEPLOYMENT as a
  // failed REQUEST - the same class of mistake as reporting a full service as an outage,
  // one step further along, because no retry and no waiting can clear it.
  test('a provenance mismatch is its own stable code, distinct from capacity and outage', async () => {
    configure('private_alpha');
    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions$/, { status: 503, body: { error_code: 'provenance_mismatch' } }]])
        .impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    // 503 and not 502: the origin refused, it did not malfunction.
    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'DEEP_KORE_PROVENANCE_MISMATCH' });
    expect(captured.body).not.toEqual({ error_code: 'origin_error' });
  });

  test('a provenance refusal names no commit, binary, component or machine', async () => {
    configure('private_alpha');
    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/sessions$/,
          {
            status: 503,
            // Everything an origin might volunteer about WHY the builds disagree. None of
            // it is the visitor's business and none of it may be echoed.
            body: {
              error_code: 'provenance_mismatch',
              gateway_commit: '026ee6162df9d49ca8462e15f5714ace9dfcdb58',
              worker_commit: '00020af4f622962b5e21663a8529cb055a4a217e',
              worker_path: 'C:\\DeepKore\\Release\\dk_session_worker.exe',
              host: 'dk-01',
            },
          },
        ],
      ]).impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(captured.body).toEqual({ error_code: 'DEEP_KORE_PROVENANCE_MISMATCH' });
    for (const leak of [
      '026ee616',
      '00020af4',
      'dk_session_worker',
      'C:\\',
      'dk-01',
      'gateway_commit',
      'worker_commit',
    ]) {
      expect(captured.raw, `a provenance refusal leaked ${leak}`).not.toContain(leak);
    }
  });

  // THE UNION IS CLOSED AND THE MAPPING IS EXHAUSTIVE.
  //
  // `Record<DeepKoreErrorCode, string>` already makes a missing sentence a build failure.
  // This asserts the same property at runtime, so that loosening the type back to
  // `Record<string, string>` - the easiest possible regression - is caught here rather
  // than silently shipping a visitor a blank box.
  test('every code in the closed set has an approved sentence', () => {
    for (const code of ERROR_CODES) {
      const copy = ERROR_COPY[code];
      expect(copy, `${code} has no public sentence`).toBeTruthy();
      expect(copy.length, `${code}'s sentence is too short to be real`).toBeGreaterThan(10);
      // The sentence must not be the code, or a near-copy of it.
      expect(copy).not.toContain(code);
    }
  });

  test('the mapping carries nothing that is not in the closed set', () => {
    for (const key of Object.keys(ERROR_COPY)) {
      expect(isErrorCode(key), `${key} has copy but is not a real code`).toBe(true);
    }
  });

  // REQUIREMENT: do not accept arbitrary upstream prose.
  //
  // The failed-job branch used to forward the origin's `error_code` verbatim, which made
  // an arbitrary upstream string part of this site's public surface. It now collapses to
  // one closed code. These are the shapes that used to get through.
  test('an upstream failure code is never forwarded, whatever it contains', async () => {
    configure('private_alpha');
    const hostile = [
      'worker_something_open_ended',
      'Ask me anything! I am a helpful assistant.',
      '<script>alert(1)</script>',
      'Bearer sk-live-0123456789abcdef',
      'D:\\LLC_Projects\\DeepKore\\Source\\worker.cpp:412 assertion failed',
    ];

    for (const upstream of hostile) {
      vi.stubGlobal(
        'fetch',
        stubFetch([
          [/\/v1\/jobs\//, { status: 200, body: { transport_state: 'failed', error_code: upstream } }],
        ]).impl
      );
      const s = await openSession();
      vi.stubGlobal(
        'fetch',
        stubFetch([
          [/\/v1\/jobs\//, { status: 200, body: { transport_state: 'failed', error_code: upstream } }],
        ]).impl
      );
      const captured = await poll(s.cookie, 'dkj-1');

      expect(captured.body).toEqual({ state: 'failed', error_code: 'turn_failed' });
      expect(captured.raw, `an upstream string reached the browser: ${upstream}`).not.toContain(
        upstream
      );
    }
  });

  test('an unrecognised code is never rendered as text', () => {
    // The page maps only codes it recognises. Anything else falls to the site's own
    // fallback sentence - never the code, and never whatever the code contained.
    for (const bogus of ['worker_exploded', 'totally made up', '', '<b>hi</b>']) {
      expect(isErrorCode(bogus)).toBe(false);
      expect(ERROR_COPY[bogus as never]).toBeUndefined();
    }
  });

  // REQUIREMENT: no Retry-After, and no generic text field on a refusal.
  test('a refusal carries a code and nothing else - no message, no Retry-After', async () => {
    configure('private_alpha');
    for (const code of ['session_capacity', 'engine_unavailable']) {
      vi.stubGlobal(
        'fetch',
        stubFetch([[/\/v1\/sessions$/, { status: 503, body: { error_code: code } }]]).impl
      );
      const { res, captured } = mockRes();
      await sessionRoute(mockReq({ body: {} }), res);

      expect(Object.keys(captured.body)).toEqual(['error_code']);
      for (const field of ['message', 'detail', 'text', 'reason', 'hint']) {
        expect(captured.raw, `a refusal carried a ${field} field`).not.toContain(`"${field}"`);
      }
      // A retry hint would be an instruction to come back automatically. There is no
      // queue and no automatic retry, so there is nothing to schedule.
      expect(captured.headers['retry-after'], 'a refusal set Retry-After').toBeUndefined();
    }
  });

  // The whole point of two codes is that they are two codes. A page cannot tell a
  // visitor "come back later, we are full" if the server said the same thing for a
  // broken tunnel.
  test('the two codes are distinct, and so is the wording behind each', () => {
    expect(CODE_SESSION_CAPACITY).not.toBe(CODE_UNAVAILABLE);
    const capacity = ERROR_COPY[CODE_SESSION_CAPACITY];
    const unavailable = ERROR_COPY[CODE_UNAVAILABLE];
    expect(capacity, 'the capacity code has no public wording').toBeTruthy();
    expect(unavailable, 'the unavailable code has no public wording').toBeTruthy();
    expect(capacity).not.toBe(unavailable);

    // The owner-approved wording, verbatim.
    expect(capacity).toBe(
      'Deep Kore is currently serving all available live sessions. No session was created ' +
        'and no message was submitted. Please return later.'
    );
    expect(unavailable).toBe('Deep Kore is temporarily unavailable. No message was submitted.');
  });

  // A refused visitor learns that the service is full. Not how full, not how big, and
  // nothing about the machine.
  test('a capacity refusal discloses no count, capacity, or machine detail', async () => {
    configure('private_alpha');
    vi.stubGlobal(
      'fetch',
      stubFetch([
        [
          /\/v1\/sessions$/,
          {
            status: 503,
            // Even if the origin ever became chatty, none of it crosses.
            body: { error_code: 'session_capacity', owned: 12, max_sessions: 12, host: 'dk-01' },
          },
        ],
      ]).impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    expect(Object.keys(captured.body)).toEqual(['error_code']);
    for (const leak of ['owned', 'max_sessions', 'host', '12', 'dk-01']) {
      expect(captured.raw, `a capacity refusal leaked ${leak}`).not.toContain(leak);
    }
  });

  // Neither refusal may trigger a retry, a fallback, or a fabricated turn. The route
  // returns once and returns nothing renderable.
  test('neither refusal retries the origin or produces a conversation', async () => {
    configure('private_alpha');
    for (const code of ['session_capacity', 'engine_unavailable']) {
      const { impl } = stubFetch([[/\/v1\/sessions$/, { status: 503, body: { error_code: code } }]]);
      vi.stubGlobal('fetch', impl);

      const { res, captured } = mockRes();
      await sessionRoute(mockReq({ body: {} }), res);

      expect(impl, `${code} must not be retried`).toHaveBeenCalledTimes(1);
      expect(captured.raw).not.toContain('"turn"');
      expect(captured.raw).not.toContain('"text"');
    }
  });
});

// ---------------------------------------------------------------------------
// There is no second engine anywhere in the repository
// ---------------------------------------------------------------------------

describe('no conventional-model or canned-response fallback exists', () => {
  const root = resolve(__dirname, '../..');

  test('the project depends on no AI or model provider', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const names = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ].map((n) => n.toLowerCase());

    // A dependency is the cheapest possible way for a fallback to appear: one install
    // and three lines in a catch block. Refusing the dependency refuses the shortcut.
    for (const banned of [
      'openai',
      '@anthropic-ai/sdk',
      '@ai-sdk/openai',
      '@ai-sdk/anthropic',
      'ai',
      'langchain',
      '@langchain/core',
      '@google/generative-ai',
      'cohere-ai',
      'replicate',
      'ollama',
      '@huggingface/inference',
      'node-llama-cpp',
      '@xenova/transformers',
    ]) {
      expect(names, `${banned} must not be a dependency of this site`).not.toContain(banned);
    }
  });

  // The other cheap fallback needs no dependency at all: a hardcoded reply in the
  // failure path. This walks the chat feature's own source rather than trusting review.
  test('the chat source contains no canned answer and calls no model endpoint', () => {
    const files = [
      'api/_lib/deep-kore-core.ts',
      'api/_lib/deep-kore-http.ts',
      'api/deep-kore/session.ts',
      'api/deep-kore/message.ts',
      'api/deep-kore/result/[jobId].ts',
      'src/components/deep-kore/ChatConsole.tsx',
      'src/data/deep-kore.ts',
    ];
    for (const rel of files) {
      const src = readFileSync(resolve(root, rel), 'utf8').toLowerCase();
      for (const banned of [
        'api.openai.com',
        'api.anthropic.com',
        'generativelanguage.googleapis.com',
        'api.cohere.ai',
        'chat/completions',
        'gpt-',
        'claude-',
      ]) {
        expect(src, `${rel} must not reference ${banned}`).not.toContain(banned);
      }
    }
  });

  // The strongest form: the only origin the site ever addresses is the configured one.
  test('the origin address has exactly one source and no default', () => {
    const core = readFileSync(resolve(root, 'api/_lib/deep-kore-core.ts'), 'utf8');
    // Exactly one place builds an origin URL, and it reads it from configuration.
    const fetchCalls = core.match(/fetchImpl\(/g) ?? [];
    expect(fetchCalls.length, 'more than two outbound call sites is a second engine risk')
      .toBeLessThanOrEqual(2);   // callOrigin, and Turnstile siteverify
    // No fallback origin literal.
    expect(core).not.toMatch(/originUrl\s*\?\?\s*['"]http/);
  });
});

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------

describe('credentials stay server-side', () => {
  test('both origin credentials are attached to the origin call and to nothing else', async () => {
    configure('private_alpha');
    const { impl, calls } = stubFetch([
      [/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc' } }],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: {} }), res);

    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe(`Bearer ${TEST_GATEWAY_TOKEN}`);
    expect(headers['CF-Access-Client-Id']).toBe(TEST_ACCESS_ID);
    expect(headers['CF-Access-Client-Secret']).toBe(TEST_ACCESS_SECRET);

    // Nothing that authenticates to the origin appears in the browser's response, and
    // the origin address itself is never disclosed either.
    const visible = captured.raw + JSON.stringify(setCookies(captured));
    for (const secret of [
      TEST_GATEWAY_TOKEN,
      TEST_ACCESS_ID,
      TEST_ACCESS_SECRET,
      TEST_SESSION_SECRET,
      TEST_TURNSTILE_SECRET,
      TEST_ORIGIN,
    ]) {
      expect(visible).not.toContain(secret);
    }
  });

  // LOG HYGIENE, ASSERTED RATHER THAN INTENDED.
  //
  // Owner requirement before the privacy language could be published: no log may carry
  // prompts, responses, cookies, session identifiers, bearer credentials, GOV_STAMP,
  // state_hash, or private engine output. This drives a complete successful turn and
  // then reads back everything the console was asked to write.
  test('a complete successful turn writes nothing sensitive to any log', async () => {
    configure('private_alpha');
    const logged: string[] = [];
    for (const level of ['error', 'warn', 'log', 'info', 'debug'] as const) {
      vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
        logged.push(args.map((a) => String(a)).join(' '));
      });
    }

    const s = await openSession('dks-secret-session');
    const prompt = 'a-visitor-prompt-that-must-never-be-logged';

    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/messages$/, { status: 202, body: { job_id: 'dkj-1' } }]]).impl
    );
    {
      const { res } = mockRes();
      await messageRoute(
        mockReq({
          url: '/api/deep-kore/message',
          headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
          body: { text: prompt },
        }),
        res
      );
    }

    vi.stubGlobal(
      'fetch',
      stubFetch([
        [/\/v1\/jobs\//, { status: 200, body: { transport_state: 'succeeded', engine: engineResult() } }],
      ]).impl
    );
    await poll(s.cookie, 'dkj-1');

    const all = logged.join('\n');
    for (const forbidden of [
      prompt,                        // the visitor's words
      'I am AIya.',                  // the engine's words
      'dks-secret-session',          // a session identifier
      s.csrf,                        // a cookie value
      TEST_GATEWAY_TOKEN,            // a bearer credential
      TEST_ACCESS_SECRET,
      TEST_SESSION_SECRET,
      'GOV_STAMP',
      'state_hash',
      'c0056f8303e08d66',
    ]) {
      expect(all, `a log carried "${forbidden}"`).not.toContain(forbidden);
    }
  });

  test('a thrown origin error is logged by name only', async () => {
    configure('private_alpha');
    const s = await openSession();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        // A real fetch rejection can carry the request, and the request carries both
        // credentials. Only the error's name may be logged.
        const err = new TypeError('fetch failed');
        (err as unknown as { request: unknown }).request = {
          headers: { Authorization: `Bearer ${TEST_GATEWAY_TOKEN}` },
        };
        throw err;
      })
    );

    const { res } = mockRes();
    await messageRoute(
      mockReq({
        url: '/api/deep-kore/message',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { text: 'hi' },
      }),
      res
    );

    const logged = spy.mock.calls.map((c) => c.map(String).join(' ')).join('\n');
    expect(logged).toContain('TypeError');
    expect(logged).not.toContain(TEST_GATEWAY_TOKEN);
    expect(logged).not.toContain('fetch failed');
  });
});

// ---------------------------------------------------------------------------
// Ending a session
// ---------------------------------------------------------------------------

describe('ending a session', () => {
  test('a successful delete clears both cookies', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal('fetch', stubFetch([[/\/v1\/sessions\//, { status: 200, body: { deleted: true } }]]).impl);

    const { res, captured } = mockRes();
    await sessionRoute(
      mockReq({ method: 'DELETE', headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf }, body: {} }),
      res
    );

    expect(captured.status).toBe(200);
    expect(captured.body).toEqual({ deleted: true });

    // Both names are cleared, not just the one this response would have set. A visitor
    // whose connection gained TLS since the cookie was issued would otherwise keep a
    // stale unprefixed cookie that nothing ever removes.
    const cookies = setCookies(captured);
    expect(cookies.every((c) => c.includes('Max-Age=0'))).toBe(true);
    for (const name of ['__Host-dk_session', '__Host-dk_csrf', 'dk_session', 'dk_csrf']) {
      expect(
        cookies.some((c) => c.startsWith(`${name}=`)),
        `${name} must be cleared`
      ).toBe(true);
    }
  });

  test('deleting with no session is success and requires no origin call', async () => {
    configure('private_alpha');
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(
      mockReq({ method: 'DELETE', headers: { cookie: 'dk_csrf=t', 'x-dk-csrf': 't' }, body: {} }),
      res
    );

    expect(captured.status).toBe(200);
    expect(captured.body).toEqual({ deleted: true });
    expect(impl).not.toHaveBeenCalled();
  });

  test('a session with a turn still running is not torn down', async () => {
    configure('private_alpha');
    const s = await openSession();

    vi.stubGlobal(
      'fetch',
      stubFetch([[/\/v1\/sessions\//, { status: 409, body: { error_code: 'session_busy' } }]]).impl
    );

    const { res, captured } = mockRes();
    await sessionRoute(
      mockReq({ method: 'DELETE', headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf }, body: {} }),
      res
    );

    expect(captured.status).toBe(409);
    expect(captured.body).toEqual({ error_code: 'session_busy' });
    // Cognition is still running, so the visitor keeps the session that owns it.
    expect(setCookies(captured)).toHaveLength(0);
  });

  test('a delete without the CSRF header is refused', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ method: 'DELETE', headers: { cookie: s.cookie }, body: {} }), res);

    expect(captured.status).toBe(403);
    expect(impl).not.toHaveBeenCalled();
  });
});


// ---------------------------------------------------------------------------
// The request came from this site, or it did not
// ---------------------------------------------------------------------------

describe('the origin check compares the request against itself', () => {
  // Deliberately NOT against a configured hostname. This site is served on its
  // production domain, on project aliases and on localhost, and a check keyed to a
  // variable somebody has to remember to set is one that silently fails open on the
  // day they forget. Two headers the platform populated cannot drift apart.
  const routes: Array<[string, (req: never, res: ServerResponse) => Promise<void>]> = [
    ['session', sessionRoute],
    ['message', messageRoute],
    ['consent', consentRoute],
  ];

  for (const [name, route] of routes) {
    test(`${name}: a foreign Origin is refused before the origin is called`, async () => {
      configure('private_alpha');
      const s = await openSession();
      const { impl } = stubFetch([]);
      vi.stubGlobal('fetch', impl);

      const { res, captured } = mockRes();
      await route(
        mockReq({
          url: `/api/deep-kore/${name}`,
          headers: {
            cookie: s.cookie,
            'x-dk-csrf': s.csrf,
            host: 'www.thebytelite.com',
            origin: 'https://attacker.example',
          },
          body: { text: 'hi', reference: 'a'.repeat(32), consent: true },
        }),
        res
      );

      expect(captured.status).toBe(403);
      expect(captured.body).toEqual({ error_code: 'csrf_failed' });
      expect(impl, 'a cross-site request must never reach the engine').not.toHaveBeenCalled();
    });
  }

  test('an opaque null Origin is refused', async () => {
    configure('private_alpha');
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(
      mockReq({ headers: { host: 'www.thebytelite.com', origin: 'null' }, body: {} }),
      res
    );
    expect(captured.status).toBe(403);
    expect(impl).not.toHaveBeenCalled();
  });

  test('an unparseable Origin is refused rather than ignored', async () => {
    configure('private_alpha');
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(
      mockReq({ headers: { host: 'www.thebytelite.com', origin: 'not a url' }, body: {} }),
      res
    );
    expect(captured.status).toBe(403);
    expect(impl).not.toHaveBeenCalled();
  });

  test('a matching Origin passes, and the proxied host is what it is compared against', async () => {
    configure('private_alpha');
    const { impl } = stubFetch([
      [/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc', persona: 'AIYA' } }],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(
      mockReq({
        headers: {
          // Behind a proxy `host` can be the internal address while the browser's Origin
          // names the public one. Comparing those two directly would refuse every
          // legitimate request, so the forwarded host wins where the platform sets it.
          host: 'internal-1.vercel.internal',
          'x-forwarded-host': 'www.thebytelite.com',
          origin: 'https://www.thebytelite.com',
        },
        body: {},
      }),
      res
    );
    expect(captured.status).toBe(201);
  });

  test('an absent Origin is not a failure - the other three barriers still stand', async () => {
    configure('private_alpha');
    const { impl } = stubFetch([
      [/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc', persona: 'AIYA' } }],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ headers: { host: 'www.thebytelite.com' }, body: {} }), res);
    expect(captured.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// The body schema is an allowlist
// ---------------------------------------------------------------------------

describe('an unknown field is refused, never quietly dropped', () => {
  // Ignoring an unexpected field lets a caller believe it transmitted something it did
  // not, and makes the absence of a field a habit rather than a guarantee. Refusing also
  // means a future field cannot be added to the browser without being added to the
  // server allowlist, which is where anyone reviewing this boundary will look.
  test('session: only persona and the human-check token', async () => {
    configure('private_alpha');
    const { impl } = stubFetch([
      [/\/v1\/sessions$/, { status: 201, body: { session_id: 'dks-abc', persona: 'AIYA' } }],
    ]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await sessionRoute(mockReq({ body: { persona: 'AIYA', knowledge_path: 'D:\\anything' } }), res);

    expect(captured.status).toBe(400);
    expect(captured.body).toEqual({ error_code: 'bad_request' });
    expect(impl).not.toHaveBeenCalled();
  });

  test('message: only text, turn_key and device', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    for (const extra of [
      { session_id: 'dks-other' },
      { job_id: 'dkj-someone-elses' },
      { persona: 'AION' },
      { vanguard: true },
      { origin: 'https://elsewhere.invalid' },
    ]) {
      const { res, captured } = mockRes();
      await messageRoute(
        mockReq({
          url: '/api/deep-kore/message',
          headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
          body: { text: 'hi', ...extra },
        }),
        res
      );
      expect(captured.status, `${Object.keys(extra)[0]} must be refused`).toBe(400);
      expect(captured.body).toEqual({ error_code: 'bad_request' });
    }
    expect(impl).not.toHaveBeenCalled();
  });

  test('consent: only the opaque reference and the boolean', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    const { res, captured } = mockRes();
    await consentRoute(
      mockReq({
        url: '/api/deep-kore/consent',
        headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
        body: { reference: 'a'.repeat(32), consent: true, candidate: { text: 'invented' } },
      }),
      res
    );

    expect(captured.status).toBe(400);
    expect(
      impl,
      'a browser must not be able to author a candidate at consent time'
    ).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// The device envelope
// ---------------------------------------------------------------------------

async function sendDevice(s: { cookie: string; csrf: string }, device: unknown) {
  const { impl, calls } = stubFetch([
    [/\/messages$/, { status: 202, body: { job_id: 'dkj-1', duplicate: false } }],
  ]);
  vi.stubGlobal('fetch', impl);
  const { res, captured } = mockRes();
  await messageRoute(
    mockReq({
      url: '/api/deep-kore/message',
      headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
      body: { text: 'hi', device },
    }),
    res
  );
  const sent =
    calls.length > 0 ? (JSON.parse(String(calls[0]!.init.body)) as Record<string, unknown>) : null;
  return { captured, sent, calls };
}

describe('the device envelope is sanitised at the boundary', () => {
  test('a lawful envelope crosses as opaque ids and closed enum names', async () => {
    configure('private_alpha');
    const s = await openSession();

    const { captured, sent } = await sendDevice(s, {
      entities: [{ entity_id: 'e1', entity_kind: 'UNKNOWN', relationship_role: 'PARTNER' }],
      current_message: { segments: [{ kind: 'ENTITY', entity_id: 'e1' }] },
      events: [{ event_id: 'v1', actor: 'e1', destination: 'e2' }],
      tav_disclosures: [
        { tav_id: 't1', target_entity_id: 'e1', field: 'PHONE_NUMBER', decision: 'DENIED_BY_USER' },
      ],
    });

    expect(captured.status).toBe(202);
    const device = sent!['device'] as Record<string, unknown>;
    expect(device['entities']).toEqual([
      { entity_id: 'e1', entity_kind: 'UNKNOWN', relationship_role: 'PARTNER' },
    ]);
    expect(device['tav_disclosures']).toEqual([
      { tav_id: 't1', target_entity_id: 'e1', field: 'PHONE_NUMBER', decision: 'DENIED_BY_USER' },
    ]);
  });

  // ---------------------------------------------------------------------------
  // THE PRIVATE VALUE. Owner-authorised 2026-09-04, and bounded by the canonical rule.
  //
  // These rows replaced two that asserted a value may NEVER cross. That was the site's
  // rule before the authorisation, and it is superseded - but only in one direction:
  // GRANTED may carry a literal, and every other decision still may not, which is the
  // canonical strict parser's own rule rather than a softening of it.
  // ---------------------------------------------------------------------------
  test('a GRANTED disclosure may carry the literal, and it reaches the origin intact', async () => {
    configure('private_alpha');
    const s = await openSession();

    const { captured, sent } = await sendDevice(s, {
      tav_disclosures: [
        {
          tav_id: 't1',
          target_entity_id: 'e1',
          field: 'PHONE_NUMBER',
          decision: 'GRANTED',
          value: 'SYNTHETIC-0000',
        },
      ],
    });

    expect(captured.status).toBe(202);
    const device = sent!['device'] as Record<string, unknown>;
    expect(device['tav_disclosures']).toEqual([
      {
        tav_id: 't1',
        target_entity_id: 'e1',
        field: 'PHONE_NUMBER',
        decision: 'GRANTED',
        value: 'SYNTHETIC-0000',
      },
    ]);
  });

  test('a NON-GRANTED decision carrying a non-empty value is refused outright', async () => {
    configure('private_alpha');
    const s = await openSession();

    for (const decision of ['DENIED_BY_USER', 'DENIED_BY_POLICY', 'UNAVAILABLE']) {
      const { captured, calls } = await sendDevice(s, {
        tav_disclosures: [
          {
            tav_id: 't1',
            target_entity_id: 'e1',
            field: 'PHONE_NUMBER',
            decision,
            value: '555-0100',
          },
        ],
      });
      // Illegal state unrepresentable, not "should be empty by convention". A literal
      // leaving a browser under a REFUSAL is the worst thing this feature could do.
      expect(captured.status, `${decision} must not carry a value`).toBe(400);
      expect(captured.body).toEqual({ error_code: 'bad_request' });
      expect(calls, 'a refused literal must not reach the origin either').toHaveLength(0);
    }
  });

  test('an empty value is lawful on any decision and discloses nothing', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { captured, sent } = await sendDevice(s, {
      tav_disclosures: [
        { tav_id: 't1', target_entity_id: 'e1', field: 'EMAIL', decision: 'UNAVAILABLE', value: '' },
      ],
    });
    expect(captured.status).toBe(202);
    const device = sent!['device'] as Record<string, unknown>;
    expect((device['tav_disclosures'] as Array<Record<string, unknown>>)[0]!['value']).toBe('');
  });

  test('a value that is not a string is refused', async () => {
    configure('private_alpha');
    const s = await openSession();
    for (const value of [42, true, null, {}, ['a']]) {
      const { captured } = await sendDevice(s, {
        tav_disclosures: [
          { tav_id: 't1', target_entity_id: 'e1', field: 'EMAIL', decision: 'GRANTED', value },
        ],
      });
      expect(captured.status).toBe(400);
    }
  });

  test('a granted literal is never written to any log channel', async () => {
    configure('private_alpha');
    const s = await openSession();
    const seen: string[] = [];
    for (const channel of ['log', 'info', 'warn', 'error', 'debug'] as const) {
      vi.spyOn(console, channel).mockImplementation((...args: unknown[]) => {
        seen.push(args.map((a) => String(a)).join(' '));
      });
    }

    const { captured } = await sendDevice(s, {
      tav_disclosures: [
        {
          tav_id: 't1',
          target_entity_id: 'e1',
          field: 'ADDRESS',
          decision: 'GRANTED',
          value: 'SYNTHETIC-NEVER-LOG-ME-7781',
        },
      ],
    });

    expect(captured.status).toBe(202);
    expect(seen.join(' | ')).not.toContain('SYNTHETIC-NEVER-LOG-ME-7781');
  });

  test('the decision and field vocabularies are the canonical ones, not a shape', async () => {
    configure('private_alpha');
    const s = await openSession();
    for (const bad of [
      { field: 'SOCIAL_SECURITY_NUMBER', decision: 'GRANTED' },
      { field: 'EMAIL', decision: 'ALLOWED' },
      { field: 'EMAIL', decision: 'GRANTED_ONCE' },
    ]) {
      const { captured } = await sendDevice(s, {
        tav_disclosures: [{ tav_id: 't1', target_entity_id: 'e1', ...bad }],
      });
      expect(captured.status, `${JSON.stringify(bad)} must be refused`).toBe(400);
    }
  });

  test('an entity enumerator outside the canonical vocabulary is refused', async () => {
    configure('private_alpha');
    const s = await openSession();
    for (const entity of [
      { entity_id: 'e1', relationship_role: 'SPOUSE' },
      { entity_id: 'e1', relationship_role: 'COLLEAGUE' },
      { entity_id: 'e1', entity_kind: 'ROBOT' },
      // StructuralEntityKind is what Deep Kore RESOLVES TO by elimination. A device
      // sending one would be asserting the conclusion instead of the evidence.
      { entity_id: 'e1', entity_kind: 'BUSINESS' },
      { entity_id: 'e1', entity_kind: 'MEDICATION' },
      { entity_id: 'e1', agreement: 'SECOND_PLURAL' },
    ]) {
      const { captured } = await sendDevice(s, { entities: [entity] });
      expect(captured.status, `${JSON.stringify(entity)} must be refused`).toBe(400);
    }
  });

  test('every canonical enumerator this site offers is accepted', async () => {
    configure('private_alpha');
    const s = await openSession();
    for (const role of ['SELF', 'PARTNER', 'MATCH', 'FRIEND', 'FAMILY', 'OTHER']) {
      const { captured } = await sendDevice(s, {
        entities: [{ entity_id: 'e1', entity_kind: 'UNKNOWN', relationship_role: role }],
      });
      expect(captured.status, `${role} is canonical and must be accepted`).toBe(202);
    }
    for (const kind of ['SELF', 'PERSON', 'PLACE', 'AI_ASSISTANT', 'GROUP', 'UNKNOWN', 'OTHER']) {
      const { captured } = await sendDevice(s, {
        entities: [{ entity_id: 'e1', entity_kind: kind }],
      });
      expect(captured.status, `${kind} is canonical and must be accepted`).toBe(202);
    }
  });

  test('an envelope past the canonical device ceiling is refused here, not proxied', async () => {
    configure('private_alpha');
    const s = await openSession();
    // MAX_DEVICE_BYTES is the worker's own constant. This site restates it so an
    // oversized envelope stops here; the number is not one this site chose.
    const { captured, calls } = await sendDevice(s, {
      tav_disclosures: [
        {
          tav_id: 't1',
          target_entity_id: 'e1',
          field: 'OTHER',
          decision: 'GRANTED',
          value: 'x'.repeat(MAX_DEVICE_BYTES),
        },
      ],
    });
    expect(captured.status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  test('an unknown key is refused at every level of the envelope', async () => {
    configure('private_alpha');
    const s = await openSession();

    const envelopes: Array<[string, unknown]> = [
      ['top level', { entities: [], knowledge_path: 'D:\\anything' }],
      ['entity', { entities: [{ entity_id: 'e1', private_note: 'x' }] }],
      [
        'segment',
        { current_message: { segments: [{ kind: 'ENTITY', entity_id: 'e1', text: 'x' }] } },
      ],
      // `description` and `temporal` are Segment sequences a Cordel device renders
      // locally with the real private value. There is no lawful reason for a browser to
      // send them, so they are refused rather than ignored.
      [
        'message description',
        { current_message: { segments: [], description: [{ kind: 'TEXT' }] } },
      ],
      ['event', { events: [{ event_id: 'v1', when: 'yesterday' }] }],
      [
        'disclosure',
        {
          tav_disclosures: [
            {
              tav_id: 't1',
              target_entity_id: 'e1',
              field: 'EMAIL',
              decision: 'UNAVAILABLE',
              literal: 'x',
            },
          ],
        },
      ],
    ];

    for (const [where, device] of envelopes) {
      const { captured } = await sendDevice(s, device);
      expect(captured.status, `an unknown key in the ${where} must be refused`).toBe(400);
    }
  });

  test('a free-text segment is dropped: text has exactly one lawful channel', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { captured, sent } = await sendDevice(s, {
      current_message: {
        segments: [
          { kind: 'ENTITY', entity_id: 'e1' },
          { kind: 'TEXT' },
        ],
      },
    });
    expect(captured.status).toBe(202);
    const device = sent!['device'] as Record<string, unknown>;
    expect(device['current_message']).toEqual({ segments: [{ kind: 'ENTITY', entity_id: 'e1' }] });
  });

  test('an id that is not a plain token is refused', async () => {
    configure('private_alpha');
    const s = await openSession();
    for (const device of [
      { entities: [{ entity_id: '../../etc/passwd' }] },
      { events: [{ event_id: 'v1', actor: 'a b' }] },
      {
        tav_disclosures: [
          { tav_id: 't 1', target_entity_id: 'e1', field: 'EMAIL', decision: 'UNAVAILABLE' },
        ],
      },
      {
        tav_disclosures: [
          { tav_id: 't1', target_entity_id: 'e1', field: 'lowercase', decision: 'UNAVAILABLE' },
        ],
      },
    ]) {
      const { captured } = await sendDevice(s, device);
      expect(captured.status).toBe(400);
    }
  });

  test('no device at all is the ordinary case and sends no device key', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { captured, sent } = await sendDevice(s, undefined);
    expect(captured.status).toBe(202);
    expect(Object.keys(sent!).sort()).toEqual(['message_id', 'text']);
  });
});

// ---------------------------------------------------------------------------
// The typed result union
// ---------------------------------------------------------------------------

describe('the engine outcome decides the public state, and nothing else does', () => {
  const succeeded = (over: Record<string, unknown>) => ({
    job_id: 'dkj-1',
    transport_state: 'succeeded',
    engine: engineResult(),
    ...over,
  });

  async function pollWith(body: Record<string, unknown>) {
    configure('private_alpha');
    const s = await openSession();
    vi.stubGlobal('fetch', stubFetch([[/\/v1\/jobs\//, { status: 200, body }]]).impl);
    return poll(s.cookie, 'dkj-1');
  }

  test('an absent outcome degrades to the governed answer, offering nothing', async () => {
    const captured = await pollWith(succeeded({}));
    expect((captured.body['result'] as Record<string, unknown>)['kind']).toBe('GOVERNED_TEXT');
  });

  test('a refusal is its own kind, never dressed as an answer', async () => {
    const captured = await pollWith(succeeded({ outcome: 'REFUSAL' }));
    expect((captured.body['result'] as Record<string, unknown>)['kind']).toBe('GOVERNED_REFUSAL');
  });

  test('a TAV request crosses as a typed predicate with no value and no expression', async () => {
    const captured = await pollWith(
      succeeded({
        outcome: 'TAV_REQUIRED',
        tav_request: {
          tav_id: 'tav-1',
          target_entity_id: 'e1',
          field: 'PHONE_NUMBER',
          purpose: 'RESPONSE_REQUIRES_LITERAL_VALUE',
          // Everything below is engine-side detail that must not cross.
          counterfactual_frame: 'internal',
          state_hash: 'c0056f8303e08d66',
          candidate_ids: [1, 2, 3],
        },
      })
    );

    const result = captured.body['result'] as Record<string, unknown>;
    expect(result['kind']).toBe('TAV_REQUEST');
    expect(Object.keys(result['tav'] as object).sort()).toEqual([
      'entity_ref',
      'field',
      'purpose',
      'tav_id',
    ]);
    expect(captured.raw).not.toContain('counterfactual_frame');
    expect(captured.raw).not.toContain('candidate_ids');
    expect(captured.raw).not.toContain('c0056f8303e08d66');
  });

  test('a TAV field outside the closed vocabulary is a fault, not a new question', async () => {
    const captured = await pollWith(
      succeeded({
        outcome: 'TAV_REQUIRED',
        tav_request: {
          tav_id: 'tav-1',
          target_entity_id: 'e1',
          field: 'SOCIAL_SECURITY_NUMBER',
          purpose: 'RESPONSE_REQUIRES_LITERAL_VALUE',
        },
      })
    );
    expect(captured.status).toBe(502);
    expect(captured.body).toEqual({ error_code: 'malformed_engine_result' });
  });

  test('a TAV purpose that is not the one lawful enumerator is refused', async () => {
    const captured = await pollWith(
      succeeded({
        outcome: 'TAV_REQUIRED',
        tav_request: {
          tav_id: 'tav-1',
          target_entity_id: 'e1',
          field: 'EMAIL',
          purpose: 'MARKETING',
        },
      })
    );
    expect(captured.status).toBe(502);
  });

  test('a TAV_REQUIRED outcome with no readable request is a fault, never a bare answer', async () => {
    const captured = await pollWith(succeeded({ outcome: 'TAV_REQUIRED' }));
    // Showing the text alone would silently drop the question the engine needed answered.
    expect(captured.status).toBe(502);
    expect(captured.raw).not.toContain('"text"');
  });

  test('a teaching offer crosses as an opaque reference and a safe description', async () => {
    const captured = await pollWith(
      succeeded({
        outcome: 'TEACHING_OFFER',
        teaching_offer: {
          reference: 'ab12'.repeat(8),
          description: 'One unrecognised term.',
          structural_identity_key: '9'.repeat(64),
          candidate_ids: [1, 2, 3],
          teaching_case_id: 'f'.repeat(64),
        },
      })
    );

    const result = captured.body['result'] as Record<string, unknown>;
    expect(result['kind']).toBe('UNKNOWN_CONCEPT_OFFER');
    expect(Object.keys(result['offer'] as object).sort()).toEqual(['description', 'reference']);
    for (const leak of ['structural_identity_key', 'candidate_ids', 'teaching_case_id']) {
      expect(captured.raw, `an offer must not carry ${leak}`).not.toContain(leak);
    }
  });

  test('an offer reference that is not an opaque server token is refused', async () => {
    const captured = await pollWith(
      succeeded({
        outcome: 'TEACHING_OFFER',
        teaching_offer: { reference: '../../queue/case-1', description: 'x' },
      })
    );
    expect(captured.status).toBe(502);
  });

  test('an engine failure is a terminal failure with no text at all', async () => {
    const captured = await pollWith(succeeded({ outcome: 'ENGINE_FAILURE' }));
    const result = captured.body['result'] as Record<string, unknown>;
    expect(result['kind']).toBe('TERMINAL_FAILURE');
    expect(result['error_code']).toBe('turn_failed');
    expect(captured.body['turn'], 'a terminal failure carries no turn').toBeUndefined();
  });

  test('an outcome this site does not know becomes a fault, never a new public state', async () => {
    const captured = await pollWith(succeeded({ outcome: 'SOMETHING_ADDED_LATER' }));
    expect(captured.status).toBe(502);
    expect(captured.body).toEqual({ error_code: 'malformed_engine_result' });
  });

  test('every kind the union can produce is one the shared closed list declares', () => {
    // The compile-time proof lives in the two modules; this asserts the runtime list
    // still matches the five the page switches on, so a silent edit to the array is
    // caught by a test as well as by the compiler.
    expect([...RESULT_KINDS].sort()).toEqual([
      'GOVERNED_REFUSAL',
      'GOVERNED_TEXT',
      'TAV_REQUEST',
      'TERMINAL_FAILURE',
      'UNKNOWN_CONCEPT_OFFER',
    ]);
    expect(isResultKind('GOVERNED_TEXT')).toBe(true);
    expect(isResultKind('SOMETHING_ADDED_LATER')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Teaching-candidate consent
// ---------------------------------------------------------------------------

async function decide(
  s: { cookie: string; csrf: string },
  body: unknown,
  originAnswer: { status: number; body: unknown }
) {
  const { impl, calls } = stubFetch([[/\/(consent|decline)$/, originAnswer]]);
  vi.stubGlobal('fetch', impl);
  const { res, captured } = mockRes();
  await consentRoute(
    mockReq({
      url: '/api/deep-kore/consent',
      headers: { cookie: s.cookie, 'x-dk-csrf': s.csrf },
      body,
    }),
    res
  );
  return { captured, calls };
}

const REF = 'ab12'.repeat(8);

describe('consent authorises storage, and only storage', () => {
  test('consent submits exactly once and reports success only on the confirmed write', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { captured, calls } = await decide(
      s,
      { reference: REF, consent: true },
      { status: 200, body: { submitted: true } }
    );

    expect(captured.status).toBe(200);
    expect(captured.body).toEqual({ submitted: true });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toMatch(/\/v1\/sessions\/dks-abc\/consent$/);
    // The reference and nothing else. No candidate content is authored here.
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({ reference: REF });
  });

  test('a submission that did not land is reported as a failure, never as accepted', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { captured } = await decide(
      s,
      { reference: REF, consent: true },
      { status: 200, body: { submitted: false } }
    );

    // FAIL CLOSED AND TRUTHFULLY. There is no retry, no queue and no local spool on this
    // path, so nothing is pending and saying otherwise would be false.
    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'teaching_broker_unavailable' });
    expect(ERROR_COPY.teaching_broker_unavailable).toContain('was not submitted');
    expect(ERROR_COPY.teaching_broker_unavailable).toContain('Nothing was saved');
  });

  test('declining reaches the decline path and writes nothing', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { captured, calls } = await decide(
      s,
      { reference: REF, consent: false },
      { status: 200, body: { discarded: true } }
    );

    expect(captured.status).toBe(200);
    expect(captured.body).toEqual({ discarded: true });
    expect(calls[0]!.url).toMatch(/\/decline$/);
    expect(captured.raw).not.toContain('submitted');
  });

  test('consent is never the default: anything but literal true is a decline', async () => {
    configure('private_alpha');
    const s = await openSession();

    for (const consent of [undefined, null, 'true', 1, {}]) {
      const body: Record<string, unknown> = { reference: REF };
      if (consent !== undefined) body['consent'] = consent;
      const { calls } = await decide(s, body, { status: 200, body: { discarded: true } });
      expect(calls[0]!.url, `${JSON.stringify(consent)} must not consent`).toMatch(/\/decline$/);
    }
  });

  test('a reference this session is not holding is its own code', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { captured } = await decide(
      s,
      { reference: REF, consent: true },
      { status: 409, body: { error_code: 'unknown_candidate' } }
    );
    expect(captured.status).toBe(409);
    expect(captured.body).toEqual({ error_code: 'teaching_candidate_unknown' });
  });

  test('a reference that is not an opaque token never reaches the origin', async () => {
    configure('private_alpha');
    const s = await openSession();
    for (const reference of ['../../queue', 'NOTHEX' + 'a'.repeat(20), '', 'ab', 42]) {
      const { captured, calls } = await decide(
        s,
        { reference, consent: true },
        { status: 200, body: { submitted: true } }
      );
      expect(captured.status).toBe(400);
      expect(calls).toHaveLength(0);
    }
  });

  test('a vanished upstream session clears the cookies rather than pretending', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { captured } = await decide(
      s,
      { reference: REF, consent: true },
      { status: 404, body: { error_code: 'no_such_session' } }
    );
    expect(captured.status).toBe(404);
    expect(captured.body).toEqual({ error_code: 'session_expired' });
    expect(setCookies(captured).join(' ')).toContain('Max-Age=0');
  });

  test('consent without a session, and consent without the CSRF header, are both refused', async () => {
    configure('private_alpha');
    const s = await openSession();
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);

    // A caller holding the CSRF pair but no session cookie. The barriers are separate
    // and are checked separately: passing one says nothing about the other.
    const csrfOnly = s.cookie
      .split(';')
      .map((c) => c.trim())
      .filter((c) => c.includes('dk_csrf='))
      .join('; ');

    const noSession = mockRes();
    await consentRoute(
      mockReq({
        url: '/api/deep-kore/consent',
        headers: { cookie: csrfOnly, 'x-dk-csrf': s.csrf },
        body: { reference: REF, consent: true },
      }),
      noSession.res
    );
    expect(noSession.captured.status).toBe(401);
    expect(noSession.captured.body).toEqual({ error_code: 'no_session' });

    const noCsrf = mockRes();
    await consentRoute(
      mockReq({
        url: '/api/deep-kore/consent',
        headers: { cookie: s.cookie },
        body: { reference: REF, consent: true },
      }),
      noCsrf.res
    );
    expect(noCsrf.captured.status).toBe(403);
    expect(impl, 'neither refusal may reach the review queue').not.toHaveBeenCalled();
  });

  test('the consent route is off entirely while the phase is disabled', async () => {
    const { impl } = stubFetch([]);
    vi.stubGlobal('fetch', impl);
    const { res, captured } = mockRes();
    await consentRoute(mockReq({ url: '/api/deep-kore/consent', body: {} }), res);
    expect(captured.status).toBe(503);
    expect(captured.body).toEqual({ error_code: 'chat_disabled' });
    expect(impl).not.toHaveBeenCalled();
  });

  test('the wrong verb on the consent route is 405 with an Allow header', async () => {
    configure('private_alpha');
    const { res, captured } = mockRes();
    await consentRoute(mockReq({ method: 'GET', url: '/api/deep-kore/consent' }), res);
    expect(captured.status).toBe(405);
    expect(captured.headers['allow']).toBe('POST');
  });
});
