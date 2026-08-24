import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost, onRequest } from '../../functions/api/contact';

// Mocked end to end: no network, and the key below is a fabricated placeholder, never a real
// credential. What these tests protect is that the route cannot (a) claim a success it did not
// have, (b) invent a recipient, or (c) leak the bearer token into a response or a log line.

const FAKE_KEY = 'SG.test-not-a-real-key';
const ENV = {
  SENDGRID_API_KEY: FAKE_KEY,
  CONTACT_TO_EMAIL: 'inbox@example.test',
  CONTACT_FROM_EMAIL: 'sender@example.test',
};

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.test',
  inquiryType: 'licensing',
  message: 'I would like to discuss licensing.',
  organization: 'Analytical Engines Ltd',
};

// The route's rate-limit map is module-level, so it persists across tests in this file. Every
// context therefore gets its own client IP unless a test deliberately pins one, otherwise the
// sixth assertion in the file would start seeing 429s that have nothing to do with what it checks.
// The route uses the client identifier only as an opaque map key, so a counter is enough and is
// clearer than manufacturing syntactically valid addresses.
let clientCounter = 0;
function uniqueClient(): string {
  clientCounter++;
  return `test-client-${clientCounter}`;
}

// Minimal EventContext stand-in; the route only uses `request` and `env`.
function ctx(body: unknown, env: Partial<typeof ENV> = ENV, ip: string = uniqueClient()) {
  const request = new Request('https://www.thebytelite.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { request, env } as unknown as Parameters<typeof onRequestPost>[0];
}

function sendgridOk() {
  return vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
}

let errorSpy: ReturnType<typeof vi.spyOn>;
let logged: string[];

beforeEach(() => {
  logged = [];
  errorSpy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    logged.push(args.map(String).join(' '));
  });
});

afterEach(() => {
  errorSpy.mockRestore();
  vi.unstubAllGlobals();
});

describe('configuration gating', () => {
  it('refuses to send, and says so, when the API key is absent', async () => {
    const fetchSpy = sendgridOk();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await onRequestPost(ctx(VALID, { CONTACT_TO_EMAIL: ENV.CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL: ENV.CONTACT_FROM_EMAIL }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('was not sent') });
    expect(fetchSpy, 'must not contact the provider without a key').not.toHaveBeenCalled();
  });

  it('refuses to send when the destination mailbox is unset - it never invents a recipient', async () => {
    const fetchSpy = sendgridOk();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await onRequestPost(ctx(VALID, { SENDGRID_API_KEY: FAKE_KEY, CONTACT_FROM_EMAIL: ENV.CONTACT_FROM_EMAIL }));
    expect(res.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refuses to send when the verified sender is unset', async () => {
    const fetchSpy = sendgridOk();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await onRequestPost(ctx(VALID, { SENDGRID_API_KEY: FAKE_KEY, CONTACT_TO_EMAIL: ENV.CONTACT_TO_EMAIL }));
    expect(res.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('names the missing variables in logs but never their values', async () => {
    vi.stubGlobal('fetch', sendgridOk());
    await onRequestPost(ctx(VALID, {}));
    const all = logged.join('\n');
    expect(all).toContain('SENDGRID_API_KEY');
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
      const fetchSpy = sendgridOk();
      vi.stubGlobal('fetch', fetchSpy);
      const res = await onRequestPost(ctx(payload));
      expect(res.status).toBe(400);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  }

  it('rejects a body that is not JSON', async () => {
    vi.stubGlobal('fetch', sendgridOk());
    const res = await onRequestPost(ctx('{not json'));
    expect(res.status).toBe(400);
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
      vi.stubGlobal('fetch', sendgridOk());
      const res = await onRequestPost(ctx({ ...VALID, inquiryType }));
      expect(res.status, `${inquiryType} should be accepted`).toBe(202);
    }
  });
});

describe('header-injection defence', () => {
  it('strips CR/LF from fields that reach email headers', async () => {
    const fetchSpy = sendgridOk();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await onRequestPost(
      ctx({ ...VALID, name: 'Ada\r\nBcc: attacker@example.test', email: 'ada@example.test' })
    );
    expect(res.status).toBe(202);
    const payload = JSON.parse(String((fetchSpy.mock.calls[0]?.[1] as RequestInit).body));

    // The defence is removing the line breaks, not censoring words. With CR/LF gone the payload
    // cannot carry a second header, so "Bcc:" surviving as inert text inside the name is fine -
    // what matters is that it is still *inside* the name field and not a header of its own.
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain('\r');
    expect(serialized).not.toContain('\n');
    expect(payload.reply_to.name).toBe('Ada  Bcc: attacker@example.test');
    expect(payload.personalizations[0].to).toHaveLength(1);
    expect(payload.personalizations[0].to[0].email).toBe(ENV.CONTACT_TO_EMAIL);
    expect(payload).not.toHaveProperty('bcc');
    expect(payload).not.toHaveProperty('cc');
  });
});

describe('provider request shape', () => {
  it('sends to the configured mailbox from the configured sender, replying to the submitter', async () => {
    const fetchSpy = sendgridOk();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await onRequestPost(ctx(VALID));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: 'sent' });

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.sendgrid.com/v3/mail/send');
    expect(init.method).toBe('POST');

    const payload = JSON.parse(String(init.body));
    expect(payload.personalizations[0].to[0].email).toBe(ENV.CONTACT_TO_EMAIL);
    expect(payload.from.email).toBe(ENV.CONTACT_FROM_EMAIL);
    expect(payload.reply_to.email).toBe(VALID.email);
    expect(payload.content[0].value).toContain(VALID.message);
    expect(payload.content[0].value).toContain(VALID.organization);
  });

  it('puts the key in the Authorization header and nowhere else', async () => {
    const fetchSpy = sendgridOk();
    vi.stubGlobal('fetch', fetchSpy);
    await onRequestPost(ctx(VALID));

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Bearer ${FAKE_KEY}`);
    expect(String(init.body), 'the key must never appear in the request body').not.toContain(FAKE_KEY);
  });
});

describe('failure paths never fake success and never leak the key', () => {
  it('reports 502 when the provider rejects the message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ errors: [{ field: 'from', message: 'sender not verified' }] }), {
          status: 403,
        })
      )
    );
    const res = await onRequestPost(ctx(VALID));
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining('was not sent') });
    const all = logged.join('\n');
    expect(all).toContain('sender not verified');
    expect(all, 'provider errors are logged, the key is not').not.toContain(FAKE_KEY);
  });

  it('reports 502 when the provider cannot be reached, without logging the key', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error(`connect failed while using ${FAKE_KEY}`))
    );
    const res = await onRequestPost(ctx(VALID));
    expect(res.status).toBe(502);
    const all = logged.join('\n');
    expect(all, 'a thrown error must not be logged wholesale').not.toContain(FAKE_KEY);
  });

  it('never returns the key in any response body', async () => {
    for (const f of [
      vi.fn().mockResolvedValue(new Response(null, { status: 202 })),
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ errors: [] }), { status: 500 })),
      vi.fn().mockRejectedValue(new Error('boom')),
    ]) {
      vi.stubGlobal('fetch', f);
      const res = await onRequestPost(ctx(VALID));
      expect(await res.text()).not.toContain(FAKE_KEY);
    }
  });
});

describe('rate limiting', () => {
  it('throttles a single client after the window allowance', async () => {
    vi.stubGlobal('fetch', sendgridOk());
    const ip = 'pinned-rate-limit-client';
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await onRequestPost(ctx(VALID, ENV, ip));
      statuses.push(res.status);
    }
    expect(statuses.filter((s) => s === 202).length).toBe(5);
    expect(statuses.filter((s) => s === 429).length).toBe(2);
  });
});

describe('method handling', () => {
  it('answers 405 with an Allow header for non-POST methods', async () => {
    const request = new Request('https://www.thebytelite.com/api/contact', { method: 'GET' });
    const res = await onRequest({ request, env: ENV } as unknown as Parameters<typeof onRequest>[0]);
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
  });
});
