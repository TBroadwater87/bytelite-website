import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ServerResponse } from 'node:http';
import checkout from '../../api/checkout.js';
import webhook from '../../api/stripe-webhook.js';
import gone from '../../api/gone.js';

// Endpoint-level tests for the paths that must work WITHOUT Stripe credentials: every refusal.
//
// The happy paths need a real STRIPE_SECRET_KEY and are the owner's to run in Stripe test mode.
// The refusals are the security-relevant half, and they are fully testable here - which matters,
// because a checkout endpoint that fails open is worse than one that does not exist.

interface Captured {
  status: number;
  body: Record<string, unknown>;
  headers: Record<string, string>;
  raw: string;
}

function mockRes(): { res: ServerResponse; captured: Captured } {
  const captured: Captured = { status: 0, body: {}, headers: {}, raw: '' };
  const res = {
    statusCode: 0,
    setHeader(k: string, v: string) {
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

/** A request object shaped like the one Vercel's Node runtime hands a function. */
function mockReq(over: Record<string, unknown> = {}) {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    url: '/api/checkout',
    socket: { remoteAddress: '203.0.113.10' },
    async *[Symbol.asyncIterator]() {
      // No body unless a test supplies one via `body`.
    },
    ...over,
  } as never;
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  // Start every test with commerce OFF and no credentials, which is production's default.
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.COMMERCE_PHASE;
  delete process.env.FOUNDER_OFFER_PHASE;
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe('POST /api/checkout refuses everything it should', () => {
  test('a GET is refused with 405 and an Allow header', async () => {
    const { res, captured } = mockRes();
    await checkout(mockReq({ method: 'GET' }), res);
    expect(captured.status).toBe(405);
    expect(captured.headers.allow).toBe('POST');
  });

  // The CSRF boundary. urlencoded / multipart / text-plain are "simple" request types a hostile
  // cross-origin form can POST with no preflight and no consent.
  test.each([
    'application/x-www-form-urlencoded',
    'multipart/form-data; boundary=x',
    'text/plain',
    '',
  ])('content-type %j is refused with 415 before the body is read', async (type) => {
    const { res, captured } = mockRes();
    await checkout(mockReq({ headers: { 'content-type': type } }), res);
    expect(captured.status).toBe(415);
  });

  test('commerce disabled refuses a valid plan with 503', async () => {
    process.env.COMMERCE_PHASE = 'disabled';
    process.env.FOUNDER_OFFER_PHASE = 'prelaunch';
    const { res, captured } = mockRes();
    await checkout(mockReq({ body: { planKey: 'cordel-play-reservation' } }), res);
    expect(captured.status).toBe(503);
  });

  test('an unset COMMERCE_PHASE behaves as disabled, not as enabled', async () => {
    process.env.FOUNDER_OFFER_PHASE = 'prelaunch';
    const { res, captured } = mockRes();
    await checkout(mockReq({ body: { planKey: 'cordel-play-reservation' } }), res);
    expect(captured.status).toBe(503);
  });

  test('an unknown plan key is refused with 400 even when commerce is on', async () => {
    process.env.COMMERCE_PHASE = 'test';
    process.env.FOUNDER_OFFER_PHASE = 'prelaunch';
    const { res, captured } = mockRes();
    await checkout(mockReq({ body: { planKey: 'free-everything' } }), res);
    expect(captured.status).toBe(400);
  });

  // The core injection guard: a client that sends a price, amount or success URL must not be able
  // to influence anything. The handler reads ONLY planKey.
  test('client-supplied price, amount and URLs are ignored, not honoured', async () => {
    process.env.COMMERCE_PHASE = 'test';
    process.env.FOUNDER_OFFER_PHASE = 'prelaunch';
    const { res, captured } = mockRes();
    await checkout(
      mockReq({
        body: {
          planKey: 'not-a-real-plan',
          price: 'price_attacker_controlled',
          amount: 1,
          currency: 'usd',
          success_url: 'https://evil.example/win',
          mode: 'payment',
        },
      }),
      res
    );
    // Refused on the unknown key alone; nothing else was consulted.
    expect(captured.status).toBe(400);
    expect(captured.raw).not.toContain('evil.example');
  });

  test('a valid plan with no Stripe credentials reports 503, not a fake success', async () => {
    process.env.COMMERCE_PHASE = 'test';
    process.env.FOUNDER_OFFER_PHASE = 'prelaunch';
    const { res, captured } = mockRes();
    await checkout(mockReq({ body: { planKey: 'cordel-play-reservation' } }), res);
    expect(captured.status).toBe(503);
    expect(captured.body.url).toBeUndefined();
  });

  test('no response ever echoes a secret-shaped value', async () => {
    process.env.COMMERCE_PHASE = 'test';
    process.env.FOUNDER_OFFER_PHASE = 'prelaunch';
    process.env.STRIPE_SECRET_KEY = 'sk_test_thisisnotarealkey000000';
    const { res, captured } = mockRes();
    await checkout(mockReq({ body: { planKey: 'cordel-play-reservation' } }), res);
    expect(captured.raw).not.toContain('sk_test_');
    expect(captured.raw).not.toContain('thisisnotarealkey');
  });

  test('responses are never cached', async () => {
    const { res, captured } = mockRes();
    await checkout(mockReq({ method: 'GET' }), res);
    expect(captured.headers['cache-control']).toBe('no-store');
  });
});

describe('POST /api/stripe-webhook refuses everything it should', () => {
  test('a GET is refused with 405', async () => {
    const { res, captured } = mockRes();
    await webhook(mockReq({ method: 'GET' }) as never, res);
    expect(captured.status).toBe(405);
  });

  test('no signing secret configured means 503, never silent acceptance', async () => {
    const { res, captured } = mockRes();
    await webhook(mockReq({ headers: {} }) as never, res);
    expect(captured.status).toBe(503);
    expect(captured.body.received).toBeUndefined();
  });

  test('a missing signature header is refused with 400', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_notarealsecret000000';
    const { res, captured } = mockRes();
    await webhook(mockReq({ headers: {} }) as never, res);
    expect(captured.status).toBe(400);
  });

  test('a forged signature over a real-looking payload is rejected', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_notarealsecret000000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_thisisnotarealkey000000';
    const payload = JSON.stringify({
      id: 'evt_forged',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_forged', mode: 'payment', payment_status: 'paid' } },
    });
    const { res, captured } = mockRes();
    await webhook(
      mockReq({
        headers: { 'stripe-signature': 't=1,v1=deadbeef' },
        async *[Symbol.asyncIterator]() {
          yield Buffer.from(payload);
        },
      }) as never,
      res
    );
    // Verification happens before ANY field of the payload is read, so a forged "paid" event
    // never reaches fulfilment.
    expect(captured.status).toBe(400);
    expect(captured.body.received).toBeUndefined();
  });

  test('the body-parser is disabled so the raw bytes survive for signature checking', async () => {
    const mod = (await import('../../api/stripe-webhook.js')) as unknown as {
      config?: { api?: { bodyParser?: boolean } };
    };
    expect(mod.config?.api?.bodyParser).toBe(false);
  });
});

describe('/api/gone returns a real 410', () => {
  test('it answers 410 with noindex', () => {
    const { res, captured } = mockRes();
    gone(mockReq({ method: 'GET' }) as never, res);
    expect(captured.status).toBe(410);
    expect(captured.headers['x-robots-tag']).toBe('noindex');
  });

  test('the body names no retired system', () => {
    const { res, captured } = mockRes();
    gone(mockReq({ method: 'GET' }) as never, res);
    for (const name of ['ByteSight', 'Deep Kore', 'ByteOracle', 'HeartStrings', 'ByteFlow']) {
      expect(captured.raw).not.toContain(name);
    }
  });

  test('a HEAD request gets the status without the body', () => {
    const { res, captured } = mockRes();
    gone(mockReq({ method: 'HEAD' }) as never, res);
    expect(captured.status).toBe(410);
    expect(captured.raw).toBe('');
  });
});
