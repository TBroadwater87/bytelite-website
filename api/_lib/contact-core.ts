/**
 * The contact-submission logic. This is the ONLY contact core.
 *
 * Production runs on Vercel through the thin adapter in api/contact.ts, which is the only
 * adapter. A Cloudflare Pages adapter used to sit beside it; it was never deployed and was
 * removed on 2026-08-24 (see OWNER_README.md section 16). Do not add a second adapter without
 * a live platform to run it on - an inert one only makes the hosting question ambiguous again.
 *
 * Keeping every rule that matters here - validation, size limits, header-injection defence,
 * provider-error handling, secret hygiene - is still the point: the adapter stays trivial and
 * one test suite covers the behaviour that actually protects anything.
 *
 * SECRET HANDLING
 * ---------------
 * The SendGrid key is used in exactly one place: the Authorization header. It is never returned
 * in a response and never logged - including on the error paths, where logging a caught fetch
 * error wholesale is the usual way a bearer token escapes, so the catch records `err.name` only.
 *
 * NO INVENTED ADDRESSES
 * ---------------------
 * The recipient and the verified sender are configuration with no defaults. If either is missing
 * the request is refused with 503 and nothing is sent - it never guesses a recipient and never
 * reports a success that did not happen.
 */

export const MAX_FIELD_LEN = 200;
export const MAX_MESSAGE_LEN = 5000;
export const RATE_LIMIT_WINDOW = 60_000;
export const MAX_PER_WINDOW = 5;

/**
 * How long to wait on the mail provider before giving up.
 *
 * Without this the request inherits the platform's function ceiling, so a provider that accepts
 * the connection and then stalls holds a compute slot for minutes per request - a cheap way for
 * someone else's outage (or a deliberate slowloris) to become our resource exhaustion. Ten seconds
 * is far above SendGrid's normal response time, so a timeout here means something is actually
 * wrong. The abort surfaces as a thrown fetch, which the existing catch already turns into an
 * honest 502 that logs `err.name` only.
 */
export const PROVIDER_TIMEOUT_MS = 10_000;

/**
 * Best-effort throttle, per server instance. Serverless platforms run many instances, so this is
 * NOT a distributed rate limit and must not be described as one - it only blunts a single client
 * hammering a single instance. A real control would need a shared store.
 */
const RATE_LIMIT_MAP = new Map<string, { count: number; reset: number }>();

/** Test seam: the limiter is module state, so suites need a way back to a known baseline. */
export function __resetRateLimit(): void {
  RATE_LIMIT_MAP.clear();
}

/**
 * Inquiry types the live /contact form offers, plus retired values that older bookmarked
 * ?type= links may still submit, so a previously-valid link does not start failing.
 */
export const INQUIRY_TYPES = new Set([
  'general',
  'validation-partnership',
  'licensing',
  'technology-partnership',
  'investor',
  'privacy-request',
  // Retired from the UI, still accepted so old deep links keep working.
  'manufacturing',
  'distribution',
  'restaurant-partnership',
  'cordel-play',
  'cordel-connect',
  'byteoracle',
  'preorder-support',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactConfig {
  sendgridApiKey?: string | undefined;
  toEmail?: string | undefined;
  fromEmail?: string | undefined;
}

export interface ContactResult {
  status: number;
  body: Record<string, unknown>;
}

export interface ContactDeps {
  /** Injected so tests never touch the network. */
  fetch?: typeof fetch;
  /** Injected so tests can assert what is logged without a real console. */
  logError?: (message: string) => void;
  now?: () => number;
}

interface RawPayload {
  name?: unknown;
  email?: unknown;
  inquiryType?: unknown;
  message?: unknown;
  organization?: unknown;
}

/**
 * Strips CR, LF and NUL from anything that reaches an email header. Without this a name of
 * "x\r\nBcc: someone@else" could inject a header into the outgoing message.
 */
export function stripControlChars(value: string): string {
  return value.replace(/[\r\n\0]/g, ' ').trim();
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function withinRate(clientId: string, now: number): boolean {
  const rec = RATE_LIMIT_MAP.get(clientId);
  if (!rec || now > rec.reset) {
    RATE_LIMIT_MAP.set(clientId, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (rec.count >= MAX_PER_WINDOW) return false;
  rec.count++;
  return true;
}

export async function handleContact(
  raw: unknown,
  config: ContactConfig,
  clientId: string,
  deps: ContactDeps = {}
): Promise<ContactResult> {
  const doFetch = deps.fetch ?? globalThis.fetch;
  const logError = deps.logError ?? ((m: string) => console.error(m));
  const now = (deps.now ?? Date.now)();

  // Configuration is checked first: a missing secret or address must surface as an honest
  // "not configured", never as a silent drop or a fake success.
  const missing = [
    !config.sendgridApiKey && 'SENDGRID_API_KEY',
    !config.toEmail && 'CONTACT_TO_EMAIL',
    !config.fromEmail && 'CONTACT_FROM_EMAIL',
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    // Names only - never values.
    logError(`[contact] not configured; missing: ${missing.join(', ')}`);
    return {
      status: 503,
      body: {
        error:
          'Message delivery is not configured on this deployment, so this message was not sent. Nothing was stored.',
      },
    };
  }

  if (!withinRate(clientId, now)) {
    return { status: 429, body: { error: 'Rate limit exceeded. Please try again in a minute.' } };
  }

  if (raw === null || typeof raw !== 'object') {
    return { status: 400, body: { error: 'Invalid request body.' } };
  }
  const payload = raw as RawPayload;

  const name = stripControlChars(asString(payload.name));
  const email = stripControlChars(asString(payload.email));
  const inquiryType = asString(payload.inquiryType);
  const message = stripControlChars(asString(payload.message));
  const organization = stripControlChars(asString(payload.organization)).slice(0, MAX_FIELD_LEN);

  if (!name || name.length > MAX_FIELD_LEN) {
    return { status: 400, body: { error: 'Name is required.' } };
  }
  if (!EMAIL_RE.test(email) || email.length > MAX_FIELD_LEN) {
    return { status: 400, body: { error: 'A valid email address is required.' } };
  }
  if (!INQUIRY_TYPES.has(inquiryType)) {
    return { status: 400, body: { error: 'Please select a valid inquiry type.' } };
  }
  if (!message || message.length > MAX_MESSAGE_LEN) {
    return { status: 400, body: { error: 'A message between 1 and 5000 characters is required.' } };
  }

  const subject = `ByteLite inquiry: ${inquiryType} - ${name}`;
  const lines = [
    `Inquiry type : ${inquiryType}`,
    `Name         : ${name}`,
    `Email        : ${email}`,
    organization ? `Organization : ${organization}` : null,
    `Received     : ${new Date(now).toISOString()}`,
    '',
    message,
  ].filter((l): l is string => l !== null);

  let providerResponse: Response;
  try {
    providerResponse = await doFetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        // The only place the key is ever used.
        Authorization: `Bearer ${config.sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: config.toEmail }], subject }],
        from: { email: config.fromEmail, name: 'ByteLite website' },
        // So a reply reaches the person who wrote in, not the sending identity.
        reply_to: { email, name },
        content: [{ type: 'text/plain', value: lines.join('\n') }],
      }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
  } catch (err) {
    // Deliberately does not log `err` wholesale: a thrown fetch error can carry the request,
    // and with it the Authorization header.
    logError(
      `[contact] transport error reaching the mail provider: ${err instanceof Error ? err.name : 'unknown'}`
    );
    return {
      status: 502,
      body: {
        error:
          'This message was not sent - the mail provider could not be reached. Please try again shortly.',
      },
    };
  }

  if (!providerResponse.ok) {
    // SendGrid returns a JSON error body. Log the status and the provider's own messages (which
    // never contain the key) so a misconfiguration is diagnosable from the runtime logs.
    let detail = '';
    try {
      const parsed = (await providerResponse.json()) as {
        errors?: Array<{ message?: string; field?: string }>;
      };
      detail = (parsed.errors ?? [])
        .map((e) => `${e.field ?? '-'}: ${e.message ?? '-'}`)
        .join('; ');
    } catch {
      detail = '(unparseable error body)';
    }
    logError(`[contact] provider rejected the message; status=${providerResponse.status}; ${detail}`);
    return {
      status: 502,
      body: {
        error:
          'This message was not sent - the mail provider rejected it. Please try again shortly.',
      },
    };
  }

  // SendGrid answers 202 Accepted, meaning queued for delivery. That is the strongest thing that
  // can honestly be claimed here - it is not proof the mail reached an inbox.
  return { status: 202, body: { status: 'sent' } };
}
