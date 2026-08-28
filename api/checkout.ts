/**
 * POST /api/checkout - create a Stripe-hosted Checkout Session.
 *
 * The browser sends exactly one field: `planKey`. Everything else - price, mode, currency,
 * success and cancel URLs, metadata - is decided on this side from the server allowlist in
 * `_lib/commerce-core.ts`. A client that sends a price, an amount or a URL is ignored, not
 * honoured, because none of those fields is ever read.
 *
 * The response is `{ url }` and the page then does `window.location.assign(url)`. Deliberately
 * NOT an HTML form POST to Stripe: the site's CSP sets `form-action 'self'`, which would block a
 * cross-origin form submission. A JSON response plus a script-driven navigation needs no CSP
 * change at all, and widening a CSP to make a payment path work is exactly what section 14 of the
 * canon forbids.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  resolveCheckout,
  readPhase,
  readFounderOfferPhase,
  buildMetadata,
} from './_lib/commerce-core.js';
import { getStripe, StripeNotConfiguredError, siteOrigin } from './_lib/stripe-client.js';

type VercelLikeRequest = IncomingMessage & { body?: unknown };

/** Bumped when the founder benefit itself changes, so a stored reservation records which offer it accepted. */
const FOUNDER_OFFER_VERSION = '2026-08-26';
const TERMS_VERSION = '2026-08-26';

function send(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: VercelLikeRequest): Promise<unknown> {
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer);
    total += buf.length;
    if (total > 16_000) return null;
    chunks.push(buf);
  }
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

export default async function handler(
  req: VercelLikeRequest,
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    send(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  // Same CSRF boundary as /api/contact: JSON only, so a cross-origin HTML form cannot reach this
  // route without a preflight it will never get an answer to.
  const rawType = req.headers['content-type'];
  const contentType = (Array.isArray(rawType) ? rawType[0] : rawType) ?? '';
  if (contentType.toLowerCase().split(';')[0]?.trim() !== 'application/json') {
    send(res, 415, { error: 'Unsupported content type. Send application/json.' });
    return;
  }

  const body = (await readJsonBody(req)) as { planKey?: unknown } | null;

  const resolution = resolveCheckout(body?.planKey, {
    phase: readPhase(process.env.COMMERCE_PHASE),
    founderOffer: readFounderOfferPhase(process.env.FOUNDER_OFFER_PHASE),
    priceIdFor: (envVar) => process.env[envVar],
  });

  if (!resolution.ok) {
    send(res, resolution.status, { error: resolution.reason });
    return;
  }

  const { plan, mode, priceId } = resolution;
  const origin = siteOrigin();
  const metadata = buildMetadata(plan, {
    founderOfferVersion: FOUNDER_OFFER_VERSION,
    termsVersion: TERMS_VERSION,
  });

  try {
    const stripe = getStripe();

    const common = {
      // `{CHECKOUT_SESSION_ID}` is a Stripe template, not a value we interpolate. The success page
      // re-reads the session server-side; the query parameter alone is never treated as proof.
      success_url: `${origin}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel/`,
      metadata,
      automatic_tax:
        process.env.STRIPE_AUTOMATIC_TAX_ENABLED === 'true' ? { enabled: true } : { enabled: false },
    };

    const session =
      mode === 'setup'
        ? await stripe.checkout.sessions.create({
            ...common,
            mode: 'setup',
            currency: 'usd',
            // The SetupIntent carries the same metadata as the Session, because the webhook for a
            // completed setup reads the intent, not the session.
            setup_intent_data: { metadata },
          })
        : mode === 'payment'
          ? await stripe.checkout.sessions.create({
              ...common,
              mode: 'payment',
              line_items: [
                // `adjustable_quantity` is NOT how a pay-what-you-want price works; the Price
                // object itself is created with custom_unit_amount in the Stripe Dashboard.
                { price: priceId as string, quantity: 1 },
              ],
              payment_intent_data: { metadata },
            })
          : await stripe.checkout.sessions.create({
              ...common,
              mode: 'subscription',
              line_items: [{ price: priceId as string, quantity: 1 }],
              subscription_data: { metadata },
            });

    if (!session.url) {
      send(res, 502, { error: 'Checkout could not be started.' });
      return;
    }

    send(res, 200, { url: session.url });
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      // Names only. The message this class builds never contains a value.
      console.error('[checkout] ' + err.message);
      send(res, 503, { error: 'Checkout is not configured.' });
      return;
    }
    // A thrown Stripe error can carry the request, and the request carries the Authorization
    // header. Log the error NAME only - never the object, never the message.
    console.error('[checkout] failed:', err instanceof Error ? err.name : 'UnknownError');
    send(res, 502, { error: 'Checkout could not be started.' });
  }
}
