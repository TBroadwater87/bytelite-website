/**
 * Contact intake for the Cloudflare Pages deployment of thebytelite.com.
 *
 * File-based routing puts this at POST /api/contact, which is exactly where the form on
 * /contact already posts, so the client needs no change.
 *
 * SECRET HANDLING
 * ---------------
 * The SendGrid key is read from `context.env.SENDGRID_API_KEY`, an encrypted Pages secret. It is
 * never bundled, never returned in a response, and never logged - not even truncated, and not on
 * the error paths, where a careless `console.log(err)` around a fetch is the usual way a bearer
 * token escapes. Nothing in this file interpolates the key into anything but the Authorization
 * header.
 *
 * NO INVENTED ADDRESSES
 * ---------------------
 * The destination mailbox and the SendGrid-verified sender are configuration, not constants. The
 * only addresses in this repository are `info@thebytelite.com` (present solely in a dead,
 * unimported component) and `security@thebytelite.com` (the disclosure mailbox, not general
 * intake). Neither is evidence of a monitored inquiry mailbox, so neither is hard-coded here.
 * If either variable is unset the route reports 503 and delivers nothing - it never invents a
 * recipient and never reports a success that did not happen.
 */

interface Env {
  /** Encrypted Pages secret. Never logged, never returned. */
  SENDGRID_API_KEY?: string;
  /** Mailbox that receives inquiries. Owner-supplied; no default. */
  CONTACT_TO_EMAIL?: string;
  /** A SendGrid-verified sender identity. Owner-supplied; no default. */
  CONTACT_FROM_EMAIL?: string;
}

const MAX_FIELD_LEN = 200;
const MAX_MESSAGE_LEN = 5000;
const RATE_LIMIT_WINDOW = 60_000;
const MAX_PER_WINDOW = 5;

/**
 * Best-effort, per-isolate throttle. Cloudflare runs many isolates, so this is NOT a distributed
 * rate limit and must not be described as one - it only blunts a single client hammering a single
 * isolate. A real control would need KV or Durable Objects.
 */
const RATE_LIMIT_MAP = new Map<string, { count: number; reset: number }>();

/** Mirrors the inquiry types the current /contact form offers, plus retired values that older
 *  bookmarked links may still submit, so a previously-valid link does not start failing. */
const INQUIRY_TYPES = new Set([
  'general',
  'validation-partnership',
  'licensing',
  'technology-partnership',
  'investor',
  'privacy-request',
  // Retired from the UI but still accepted so old deep links keep working.
  'manufacturing',
  'distribution',
  'restaurant-partnership',
  'cordel-play',
  'cordel-connect',
  'byteoracle',
  'preorder-support',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

function withinRate(ip: string): boolean {
  const now = Date.now();
  const rec = RATE_LIMIT_MAP.get(ip);
  if (!rec || now > rec.reset) {
    RATE_LIMIT_MAP.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (rec.count >= MAX_PER_WINDOW) return false;
  rec.count++;
  return true;
}

/**
 * Strips CR, LF and NUL from anything that reaches an email header. Without this, a name of
 * "x\r\nBcc: someone@else" would let a submitter inject headers into the outgoing message.
 */
function stripControlChars(value: string): string {
  return value.replace(/[\r\n\0]/g, ' ').trim();
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  inquiryType?: unknown;
  message?: unknown;
  organization?: unknown;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Configuration is checked before any work: a missing secret or address must surface as an
  // honest "not configured", never as a silent drop or a fake success.
  const apiKey = env.SENDGRID_API_KEY;
  const toEmail = env.CONTACT_TO_EMAIL;
  const fromEmail = env.CONTACT_FROM_EMAIL;
  const missing = [
    !apiKey && 'SENDGRID_API_KEY',
    !toEmail && 'CONTACT_TO_EMAIL',
    !fromEmail && 'CONTACT_FROM_EMAIL',
  ].filter(Boolean);

  if (missing.length > 0) {
    // Names only - never values.
    console.error(`[contact] not configured; missing: ${missing.join(', ')}`);
    return json(
      {
        error:
          'Message delivery is not configured on this deployment, so this message was not sent. Nothing was stored.',
      },
      503
    );
  }

  const ip = clientIp(request);
  if (!withinRate(ip)) {
    return json({ error: 'Rate limit exceeded. Please try again in a minute.' }, 429);
  }

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const name = stripControlChars(asString(body.name));
  const email = stripControlChars(asString(body.email));
  const inquiryType = asString(body.inquiryType);
  const message = stripControlChars(asString(body.message));
  const organization = stripControlChars(asString(body.organization)).slice(0, MAX_FIELD_LEN);

  if (!name || name.length > MAX_FIELD_LEN) {
    return json({ error: 'Name is required.' }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > MAX_FIELD_LEN) {
    return json({ error: 'A valid email address is required.' }, 400);
  }
  if (!INQUIRY_TYPES.has(inquiryType)) {
    return json({ error: 'Please select a valid inquiry type.' }, 400);
  }
  if (!message || message.length > MAX_MESSAGE_LEN) {
    return json({ error: 'A message between 1 and 5000 characters is required.' }, 400);
  }

  const subject = `ByteLite inquiry: ${inquiryType} - ${name}`;
  const lines = [
    `Inquiry type : ${inquiryType}`,
    `Name         : ${name}`,
    `Email        : ${email}`,
    organization ? `Organization : ${organization}` : null,
    `Received     : ${new Date().toISOString()}`,
    '',
    message,
  ].filter((l): l is string => l !== null);

  let sendgrid: Response;
  try {
    sendgrid = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        // The only place the key is ever used.
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }], subject }],
        from: { email: fromEmail, name: 'ByteLite website' },
        // So a reply goes to the person who wrote in, not to the sending identity.
        reply_to: { email, name },
        content: [{ type: 'text/plain', value: lines.join('\n') }],
      }),
    });
  } catch (err) {
    // Deliberately does not log `err` wholesale: the request object it may carry includes the
    // Authorization header.
    console.error(
      `[contact] transport error reaching the mail provider: ${
        err instanceof Error ? err.name : 'unknown'
      }`
    );
    return json(
      { error: 'This message was not sent - the mail provider could not be reached. Please try again shortly.' },
      502
    );
  }

  if (!sendgrid.ok) {
    // SendGrid returns a JSON error body. Log the status and the provider's own error messages
    // (which never contain the key) so a misconfiguration is diagnosable from `wrangler tail`.
    let detail = '';
    try {
      const parsed = (await sendgrid.json()) as { errors?: Array<{ message?: string; field?: string }> };
      detail = (parsed.errors ?? []).map((e) => `${e.field ?? '-'}: ${e.message ?? '-'}`).join('; ');
    } catch {
      detail = '(unparseable error body)';
    }
    console.error(`[contact] provider rejected the message; status=${sendgrid.status}; ${detail}`);
    return json(
      { error: 'This message was not sent - the mail provider rejected it. Please try again shortly.' },
      502
    );
  }

  // SendGrid answers 202 Accepted on success. Accepted means queued for delivery, which is the
  // strongest thing that can honestly be claimed here - it is not proof the mail reached an inbox.
  return json({ status: 'sent' }, 202);
};

/** Any other method on this path is a client error, not a 404 against a static asset. */
export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'POST') {
    return onRequestPost(context as Parameters<typeof onRequestPost>[0]);
  }
  return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST', 'Cache-Control': 'no-store' },
  });
};
