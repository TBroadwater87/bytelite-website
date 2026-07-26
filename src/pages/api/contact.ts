import type { APIRoute } from 'astro';

// Contact form intake. No email-provider credentials are configured in this environment, so
// submissions are validated and logged server-side rather than silently dropped or faked as sent.
// Swap the `deliver` function for a real provider (e.g. Resend, Cloudflare Email Routing) once
// credentials exist — the validation and rate-limit logic ahead of it does not need to change.

const RATE_LIMIT_MAP = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_FIELD_LEN = 200;
const MAX_MESSAGE_LEN = 5000;

const INQUIRY_TYPES = new Set([
  'general',
  'technology-partnership',
  'licensing',
  'validation-partnership',
  'investor',
  'manufacturing',
  'distribution',
  'restaurant-partnership',
  'heartstrings-play',
  'heartstrings-connect',
  'byteoracle',
  'preorder-support',
  'privacy-request',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getIp(req: Request): string {
  return (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0]?.trim() ?? 'unknown';
}

function checkRate(ip: string): boolean {
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

function stripControlChars(value: string): string {
  // Defends against header-injection style payloads (CRLF, null bytes) in any field that could
  // ever be reflected into an email header once a real provider is wired in.
  return value.replace(/[\r\n\0]/g, ' ').trim();
}

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  inquiryType?: unknown;
  message?: unknown;
}

async function deliver(record: { name: string; email: string; inquiryType: string; message: string; ip: string }) {
  // No email provider configured. Log server-side so the submission is not silently lost.
  console.log('[contact] submission received', { ...record, message: record.message.slice(0, 120) });
}

export const POST: APIRoute = async ({ request }) => {
  const ip = getIp(request);

  if (!checkRate(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const name = typeof body.name === 'string' ? stripControlChars(body.name) : '';
  const email = typeof body.email === 'string' ? stripControlChars(body.email) : '';
  const inquiryType = typeof body.inquiryType === 'string' ? body.inquiryType : '';
  const message = typeof body.message === 'string' ? stripControlChars(body.message) : '';

  if (!name || name.length > MAX_FIELD_LEN) {
    return new Response(JSON.stringify({ error: 'Name is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (!EMAIL_RE.test(email) || email.length > MAX_FIELD_LEN) {
    return new Response(JSON.stringify({ error: 'A valid email address is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (!INQUIRY_TYPES.has(inquiryType)) {
    return new Response(JSON.stringify({ error: 'Please select a valid inquiry type.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (!message || message.length > MAX_MESSAGE_LEN) {
    return new Response(JSON.stringify({ error: 'A message between 1 and 5000 characters is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  await deliver({ name, email, inquiryType, message, ip });

  return new Response(JSON.stringify({ status: 'received' }), {
    status: 202,
    headers: { 'Content-Type': 'application/json' },
  });
};
