/**
 * POST /api/stripe-webhook - the only place a payment is treated as real.
 *
 * Nothing on the success page is evidence. A visitor can open
 * `/checkout/success/?session_id=anything` directly, so query parameters prove nothing and are
 * never used to unlock a reward. Fulfilment is driven from events Stripe signed.
 *
 * Body parsing is DISABLED below. Stripe's signature is computed over the exact bytes it sent; if
 * the platform parses the JSON and we re-serialise it, key order and whitespace shift, the
 * computed signature no longer matches, and every event fails verification.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import type Stripe from 'stripe';
import { getStripe, StripeNotConfiguredError } from './_lib/stripe-client.js';

/** Vercel's Node runtime parses bodies by default. Opt out so `req` stays a raw stream. */
export const config = { api: { bodyParser: false } };

/**
 * Events this endpoint acts on. Anything else is acknowledged with 200 and ignored - returning an
 * error for an event we simply do not handle would make Stripe retry it forever.
 */
const HANDLED = new Set<Stripe.Event['type']>([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
]);

/**
 * Best-effort replay guard.
 *
 * Stripe delivers at least once, so the same event id can arrive twice. This Set dedupes within a
 * warm instance. It is NOT durable: a cold start forgets it, and concurrent instances do not share
 * it. That is acceptable only because the current fulfilment actions are idempotent by nature
 * (they log and record; they do not increment a balance or dispatch goods).
 *
 * OWNER DECISION REQUIRED before any fulfilment becomes non-idempotent - granting entitlement,
 * shipping, or issuing a licence key: that needs a durable store keyed on event id.
 */
const seenEvents = new Set<string>();
const SEEN_LIMIT = 500;

function rememberEvent(id: string): boolean {
  if (seenEvents.has(id)) return false;
  if (seenEvents.size >= SEEN_LIMIT) {
    // Bounded so a long-lived instance cannot grow this without limit.
    const oldest = seenEvents.values().next().value;
    if (oldest) seenEvents.delete(oldest);
  }
  seenEvents.add(id);
  return true;
}

async function readRawBody(req: IncomingMessage): Promise<Buffer | null> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer);
    total += buf.length;
    if (total > 1_000_000) return null;
    chunks.push(buf);
  }
  return chunks.length ? Buffer.concat(chunks) : null;
}

function send(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/**
 * Fulfilment. Deliberately conservative: it records what was verified and does nothing that
 * cannot be repeated safely. No entitlement is granted here, because no product is available yet
 * and the meaning of the founder entitlement is still an open owner decision.
 *
 * Nothing in here logs an email address, a payment method, a customer id or an amount.
 */
function fulfil(event: Stripe.Event): void {
  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};
  const planKey = meta.plan_key ?? 'unknown';

  switch (event.type) {
    case 'checkout.session.completed': {
      if (session.mode === 'setup') {
        // A no-charge founder reservation. A stored payment method is NOT a subscription and must
        // never be reported as one. No recurring object is created from here.
        console.log(`[webhook] reservation recorded plan=${planKey} session=${session.id}`);
        return;
      }
      if (session.payment_status !== 'paid') {
        // `completed` can fire before an async payment method settles. Wait for the succeeded event.
        console.log(`[webhook] awaiting payment plan=${planKey} session=${session.id}`);
        return;
      }
      console.log(`[webhook] purchase paid plan=${planKey} session=${session.id}`);
      return;
    }
    case 'checkout.session.async_payment_succeeded':
      console.log(`[webhook] async payment paid plan=${planKey} session=${session.id}`);
      return;
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired':
      // Explicitly no fulfilment. Recorded so a failure is visible rather than silent.
      console.log(`[webhook] no fulfilment (${event.type}) plan=${planKey} session=${session.id}`);
      return;
    default:
      return;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    send(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] not configured; missing: STRIPE_WEBHOOK_SECRET');
    send(res, 503, { error: 'Webhook is not configured.' });
    return;
  }

  const signature = req.headers['stripe-signature'];
  const sig = Array.isArray(signature) ? signature[0] : signature;
  if (!sig) {
    send(res, 400, { error: 'Missing signature.' });
    return;
  }

  const raw = await readRawBody(req);
  if (!raw) {
    send(res, 400, { error: 'Missing body.' });
    return;
  }

  let event: Stripe.Event;
  try {
    // Verification happens BEFORE anything in the payload is read. An unsigned or altered body
    // never reaches fulfilment.
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      console.error('[webhook] ' + err.message);
      send(res, 503, { error: 'Webhook is not configured.' });
      return;
    }
    // Name only: a signature failure object can echo the payload back.
    console.error('[webhook] signature rejected:', err instanceof Error ? err.name : 'UnknownError');
    send(res, 400, { error: 'Signature verification failed.' });
    return;
  }

  if (!rememberEvent(event.id)) {
    // Already handled in this instance. Acknowledge so Stripe stops retrying.
    send(res, 200, { received: true, duplicate: true });
    return;
  }

  if (HANDLED.has(event.type)) {
    try {
      fulfil(event);
    } catch (err) {
      // Let Stripe retry: return non-2xx. Still no payload in the log.
      console.error('[webhook] fulfilment failed:', err instanceof Error ? err.name : 'UnknownError');
      send(res, 500, { error: 'Fulfilment failed.' });
      return;
    }
  }

  send(res, 200, { received: true });
}
