/**
 * GET /api/checkout-session?session_id=... - server-side verification for the success page.
 *
 * The success page is a static file, so it cannot know anything about a payment on its own. It
 * calls this endpoint, which asks Stripe what actually happened. The `session_id` in the URL is
 * treated as a LOOKUP KEY ONLY - never as proof of anything. If Stripe says the session is unpaid,
 * expired or absent, this returns that, and the page shows no reward.
 *
 * The response is deliberately thin: what was bought, whether it is paid, and nothing else. No
 * email address, no customer id, no payment method, no amount. A page that does not receive
 * personal data cannot leak it to anyone who guesses a session id.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { findPlan } from './_lib/commerce-core.js';
import { getStripe, StripeNotConfiguredError } from './_lib/stripe-client.js';

function send(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    send(res, 405, { error: 'Method not allowed. Use GET.' });
    return;
  }

  const url = new URL(req.url ?? '/', 'http://localhost');
  const sessionId = url.searchParams.get('session_id') ?? '';

  // Stripe Checkout Session ids look like `cs_test_...` / `cs_live_...`. Reject anything else
  // before spending a network call on it.
  if (!/^cs_[A-Za-z0-9_]{10,255}$/.test(sessionId)) {
    send(res, 400, { error: 'Invalid session reference.' });
    return;
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    const planKey = session.metadata?.plan_key ?? null;
    const plan = planKey ? findPlan(planKey) : null;

    // For a `setup` session there is no payment at all; "complete" is the success state.
    const isReservation = session.mode === 'setup';
    const confirmed = isReservation
      ? session.status === 'complete'
      : session.payment_status === 'paid';

    send(res, 200, {
      confirmed,
      kind: isReservation ? 'reservation' : 'purchase',
      planKey,
      planLabel: plan?.label ?? null,
      product: plan?.product ?? null,
      /** Only ever true for a genuinely paid Supporter Pack. Gates the download on the page. */
      supporterPackUnlocked: confirmed && plan?.product === 'supporter-pack',
    });
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      console.error('[checkout-session] ' + err.message);
      send(res, 503, { error: 'Checkout is not configured.' });
      return;
    }
    console.error(
      '[checkout-session] lookup failed:',
      err instanceof Error ? err.name : 'UnknownError'
    );
    send(res, 404, { error: 'That checkout session could not be found.' });
  }
}
