import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleContact, __resetRateLimit, INQUIRY_TYPES } from '../../src/lib/contact-core';
import vercelHandler from '../../api/contact';

// Fully mocked: no network, and the key below is a fabricated placeholder, never a real
// credential. What these tests protect is that the route cannot (a) claim a success it did not
// have, (b) invent a recipient, or (c) leak the bearer token into a response or a log line.
//
// They target the SHARED CORE, so they cover the Vercel production route and the Cloudflare
// adapter at once - the two cannot drift apart without failing here.

const FAKE_KEY = 'SG.test-not-a-real-key';
const CONFIG = {
  sendgridApiKey: FAKE_KEY,
  toEmail: 'inbox@example.test',
  fromEmail: 'sender@example.test',
};

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.test',
  inquiryType: 'licensing',
  message: 'I would like to discuss licensing.',
  organization: 'Analytical Engines Ltd',
};

let logged: string[];
let clientCounter = 0;

/** The limiter is module state keyed by an opaque client id; a counter keeps tests independent. */
function client(): string {
  clientCounter++;
  return `test-client-${clientCounter}`;
}

function deps(fetchImpl: ReturnType<typeof vi.fn>) {
  return { fetch: fetchImpl as unknown as typeof fetch, logError: (m: string) => logged.push(m) };
}

function sendgridOk() {
  return vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
}

beforeEach(() => {
  logged = [];
  __resetRateLimit();
});

describe('configuration gating', () => {
  it('refuses to send, and says so, when the API key is absent', async () => {
    const f = sendgridOk();
    const res = await handleContact(VALID, { toEmail: CONFIG.toEmail, fromEmail: CONFIG.fromEmail }, client(), deps(f));
    expect(res.status).toBe(503);
    expect(String(res.body.error)).toContain('was not sent');
    expect(f, 'must not contact the provider without a key').not.toHaveBeenCalled();
  });

  it('refuses to send when the destination mailbox is unset - it never invents a recipient', async () => {
    const f = sendgridOk();
    const res = await handleContact(VALID, { sendgridApiKey: FAKE_KEY, fromEmail: CONFIG.fromEmail }, client(), deps(f));
    expect(res.status).toBe(503);
    expect(f).not.toHaveBeenCalled();
  });

  it('refuses to send when the verified sender is unset', async () => {
    const f = sendgridOk();
    const res = await handleContact(VALID, { sendgridApiKey: FAKE_KEY, toEmail: CONFIG.toEmail }, client(), deps(f));
    expect(res.status).toBe(503);
    expect(f).not.toHaveBeenCalled();
  });

  it('names the missing variables in logs but never their values', async () => {
    await handleContact(VALID, {}, client(), deps(sendgridOk()));
    const all = logged.join('\n');
    expect(all).toContain('SENDGRID_API_KEY');
    expect(all).toContain('CONTACT_TO_EMAIL');
    expect(all).not.toContain(FAKE_KEY);
  });
});

describe('validation', () => {
  const cases: Array<[string, Record<string, unknown>]> = [
    ['missing name', { ...VALID, name: '' }],
    ['oversized name', { ...VALID, name: 'x'.repeat(201) }],
    ['malformed email', { ...VALID, email: 'not-an-email' }],
    ['unknown inquiry type', { ...VALID, inquiryType: 'not-a-type' }],
    ['missing message', { ...VALID, message: '' }],
    ['oversized message', { ...VALID, message: 'x'.repeat(5001) }],
  ];

  for (const [label, payload] of cases) {
    it(`rejects ${label} without contacting the provider`, async () => {
      const f = sendgridOk();
      const res = await handleContact(payload, CONFIG, client(), deps(f));
      expect(res.status).toBe(400);
      expect(f).not.toHaveBeenCalled();
    });
  }

  it('rejects a body that is not an object', async () => {
    for (const bad of [null, 'a string', 42, undefined]) {
      const res = await handleContact(bad, CONFIG, client(), deps(sendgridOk()));
      expect(res.status).toBe(400);
    }
  });

  it('accepts every inquiry type the live form offers', async () => {
    for (const inquiryType of [
      'general',
      'validation-partnership',
      'licensing',
      'technology-partnership',
      'investor',
      'privacy-request',
    ]) {
      const res = await handleContact({ ...VALID, inquiryType }, CONFIG, client(), deps(sendgridOk()));
      expect(res.status, `${inquiryType} should be accepted`).toBe(202);
    }
  });

  it('still accepts retired inquiry types so old deep links do not break', async () => {
    for (const inquiryType of ['manufacturing', 'cordel-play', 'byteoracle']) {
      expect(INQUIRY_TYPES.has(inquiryType)).toBe(true);
      const res = await handleContact({ ...VALID, inquiryType }, CONFIG, client(), deps(sendgridOk()));
      expect(res.status).toBe(202);
    }
  });
});

describe('header-injection defence', () => {
  it('strips CR/LF from fields that reach email headers', async () => {
    const f = sendgridOk();
    const res = await handleContact(
      { ...VALID, name: 'Ada\r\nBcc: attacker@example.test' },
      CONFIG,
      client(),
      deps(f)
    );
    expect(res.status).toBe(202);

    const payload = JSON.parse(String((f.mock.calls[0]?.[1] as RequestInit).body));
    // The defence is removing the line breaks, not censoring words. With CR/LF gone the payload
    // cannot carry a second header, so "Bcc:" surviving as inert text inside the name is fine -
    // what matters is that it stays inside the name and never becomes a header of its own.
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain('\r');
    expect(serialized).not.toContain('\n');
    expect(payload.reply_to.name).toBe('Ada  Bcc: attacker@example.test');
    expect(payload.personalizations[0].to).toHaveLength(1);
    expect(payload.personalizations[0].to[0].email).toBe(CONFIG.toEmail);
    expect(payload).not.toHaveProperty('bcc');
    expect(payload).not.toHaveProperty('cc');
  });
});

describe('provider request shape', () => {
  it('sends to the configured mailbox from the configured sender, replying to the submitter', async () => {
    const f = sendgridOk();
    const res = await handleContact(VALID, CONFIG, client(), deps(f));
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ status: 'sent' });

    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.sendgrid.com/v3/mail/send');
    expect(init.method).toBe('POST');

    const payload = JSON.parse(String(init.body));
    expect(payload.personalizations[0].to[0].email).toBe(CONFIG.toEmail);
    expect(payload.from.email).toBe(CONFIG.fromEmail);
    expect(payload.reply_to.email).toBe(VALID.email);
    expect(payload.content[0].value).toContain(VALID.message);
    expect(payload.content[0].value).toContain(VALID.organization);
  });

  it('puts the key in the Authorization header and nowhere else', async () => {
    const f = sendgridOk();
    await handleContact(VALID, CONFIG, client(), deps(f));

    const [, init] = f.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${FAKE_KEY}`);
    expect(String(init.body), 'the key must never appear in the request body').not.toContain(FAKE_KEY);
  });
});

describe('failure paths never fake success and never leak the key', () => {
  it('reports 502 when the provider rejects the message', async () => {
    const f = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ field: 'from', message: 'sender not verified' }] }), {
        status: 403,
      })
    );
    const res = await handleContact(VALID, CONFIG, client(), deps(f));
    expect(res.status).toBe(502);
    expect(String(res.body.error)).toContain('was not sent');
    const all = logged.join('\n');
    expect(all).toContain('sender not verified');
    expect(all, 'provider errors are logged, the key is not').not.toContain(FAKE_KEY);
  });

  it('reports 502 when the provider cannot be reached, without logging the key', async () => {
    const f = vi.fn().mockRejectedValue(new Error(`connect failed while using ${FAKE_KEY}`));
    const res = await handleContact(VALID, CONFIG, client(), deps(f));
    expect(res.status).toBe(502);
    expect(logged.join('\n'), 'a thrown error must not be logged wholesale').not.toContain(FAKE_KEY);
  });

  it('never returns the key in any response body', async () => {
    for (const f of [
      vi.fn().mockResolvedValue(new Response(null, { status: 202 })),
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ errors: [] }), { status: 500 })),
      vi.fn().mockRejectedValue(new Error('boom')),
    ]) {
      const res = await handleContact(VALID, CONFIG, client(), deps(f));
      expect(JSON.stringify(res.body)).not.toContain(FAKE_KEY);
    }
  });
});

describe('rate limiting', () => {
  it('throttles a single client after the window allowance', async () => {
    const pinned = 'pinned-rate-limit-client';
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await handleContact(VALID, CONFIG, pinned, deps(sendgridOk()));
      statuses.push(res.status);
    }
    expect(statuses.filter((s) => s === 202).length).toBe(5);
    expect(statuses.filter((s) => s === 429).length).toBe(2);
  });

  it('does not throttle a different client', async () => {
    const pinned = 'pinned-client-a';
    for (let i = 0; i < 5; i++) await handleContact(VALID, CONFIG, pinned, deps(sendgridOk()));
    const other = await handleContact(VALID, CONFIG, 'pinned-client-b', deps(sendgridOk()));
    expect(other.status).toBe(202);
  });
});

// ------------------------------------------------------------------------------------------
// Vercel adapter - the production route. Only translation is tested here; the rules above are
// what the core guarantees.
// ------------------------------------------------------------------------------------------

interface CapturedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

function mockRes(): { res: never; captured: CapturedResponse } {
  const captured: CapturedResponse = { statusCode: 0, headers: {}, body: '' };
  const res = {
    set statusCode(v: number) {
      captured.statusCode = v;
    },
    get statusCode() {
      return captured.statusCode;
    },
    setHeader(k: string, v: string) {
      captured.headers[k] = v;
    },
    end(b: string) {
      captured.body = b;
    },
  };
  return { res: res as never, captured };
}

function mockReq(method: string, body: unknown, headers: Record<string, string> = {}): never {
  return {
    method,
    body,
    headers: { 'x-forwarded-for': '203.0.113.9', ...headers },
    socket: { remoteAddress: '203.0.113.9' },
  } as never;
}

describe('Vercel adapter', () => {
  const OLD_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.SENDGRID_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.CONTACT_FROM_EMAIL;
  });

  it('answers 405 with an Allow header for non-POST methods', async () => {
    const { res, captured } = mockRes();
    await vercelHandler(mockReq('GET', undefined), res);
    expect(captured.statusCode).toBe(405);
    expect(captured.headers.Allow).toBe('POST');
  });

  it('reads process.env and refuses when unconfigured, without leaking anything', async () => {
    const { res, captured } = mockRes();
    await vercelHandler(mockReq('POST', VALID), res);
    expect(captured.statusCode).toBe(503);
    expect(captured.headers['Content-Type']).toBe('application/json');
    expect(captured.headers['Cache-Control']).toBe('no-store');
    expect(JSON.parse(captured.body).error).toContain('was not sent');
  });

  it('accepts an already-parsed object body and a raw JSON string body alike', async () => {
    process.env.SENDGRID_API_KEY = FAKE_KEY;
    process.env.CONTACT_TO_EMAIL = CONFIG.toEmail;
    process.env.CONTACT_FROM_EMAIL = CONFIG.fromEmail;
    const f = sendgridOk();
    vi.stubGlobal('fetch', f);

    for (const body of [VALID, JSON.stringify(VALID)]) {
      __resetRateLimit();
      const { res, captured } = mockRes();
      await vercelHandler(mockReq('POST', body), res);
      expect(captured.statusCode, `body as ${typeof body}`).toBe(202);
      expect(JSON.parse(captured.body)).toEqual({ status: 'sent' });
    }
    vi.unstubAllGlobals();
  });

  it('treats an unparseable string body as an invalid request rather than crashing', async () => {
    process.env.SENDGRID_API_KEY = FAKE_KEY;
    process.env.CONTACT_TO_EMAIL = CONFIG.toEmail;
    process.env.CONTACT_FROM_EMAIL = CONFIG.fromEmail;
    const { res, captured } = mockRes();
    await vercelHandler(mockReq('POST', '{not json'), res);
    expect(captured.statusCode).toBe(400);
  });
});
