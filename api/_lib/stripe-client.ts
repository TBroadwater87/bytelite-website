/**
 * The single place a Stripe client is constructed.
 *
 * Two rules live here:
 *
 * 1. The API version is PINNED. Stripe's SDK defaults to the version it shipped with, which means
 *    a routine `npm update` can silently change request and response shapes on a payment path.
 *    Pinning makes that an explicit, reviewable edit instead of a dependency side effect.
 *
 * 2. The secret is read at REQUEST time, not module load. A newly-set environment variable then
 *    takes effect without depending on a cold start, and a missing one is reported honestly
 *    instead of being captured as `undefined` and failing later with a confusing error.
 */

import Stripe from 'stripe';
import {
  readPhase,
  classifyStripeSecretKey,
  stripeKeyPermittedForPhase,
  LIVE_FINANCIAL_TRANSACTIONS_OWNER_AUTHORIZED,
} from './commerce-core.js';

/**
 * Pinned deliberately. Matches the version `stripe@22.5.0` was built against, so the installed
 * types describe exactly what the API returns. Change this only as its own reviewed commit, after
 * reading Stripe's upgrade notes - never to silence a type error.
 */
export const STRIPE_API_VERSION = '2026-07-29.dahlia' as const;

export class StripeUnavailableError extends Error {}

export class StripeNotConfiguredError extends StripeUnavailableError {
  constructor(missing: string[]) {
    super(`Stripe is not configured; missing: ${missing.join(', ')}`);
    this.name = 'StripeNotConfiguredError';
  }
}

export class StripeKeyRefusedError extends StripeUnavailableError {
  constructor(reason: string) {
    super(`Stripe use refused: ${reason}`);
    this.name = 'StripeKeyRefusedError';
  }
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeNotConfiguredError(['STRIPE_SECRET_KEY']);
  const keyDecision = stripeKeyPermittedForPhase(
    readPhase(process.env.COMMERCE_PHASE),
    classifyStripeSecretKey(key),
    LIVE_FINANCIAL_TRANSACTIONS_OWNER_AUTHORIZED
  );
  if (!keyDecision.permitted) throw new StripeKeyRefusedError(keyDecision.reason);

  return new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    // Identifies this integration in Stripe's logs, which makes support requests answerable.
    appInfo: { name: 'bytelite-website', url: 'https://www.thebytelite.com' },
    // Stripe's own retry logic for network-level failures. This is not a custom recovery layer:
    // it is the SDK's documented idempotent-retry behaviour for requests that never landed.
    maxNetworkRetries: 1,
  });
}

/** The canonical site origin, used to build return URLs. Never taken from the request. */
export function siteOrigin(): string {
  const raw = process.env.PUBLIC_SITE_URL ?? 'https://www.thebytelite.com';
  return raw.replace(/\/+$/, '');
}
