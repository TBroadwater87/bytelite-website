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

/**
 * Pinned deliberately. Matches the version `stripe@22.5.0` was built against, so the installed
 * types describe exactly what the API returns. Change this only as its own reviewed commit, after
 * reading Stripe's upgrade notes - never to silence a type error.
 */
export const STRIPE_API_VERSION = '2026-07-29.dahlia' as const;

export class StripeNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(`Stripe is not configured; missing: ${missing.join(', ')}`);
    this.name = 'StripeNotConfiguredError';
  }
}

/**
 * Build a client, or throw StripeNotConfiguredError naming the MISSING VARIABLE NAMES only.
 * Never the values - a thrown error can be logged, and a logged secret is a leaked secret.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeNotConfiguredError(['STRIPE_SECRET_KEY']);

  return new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    // Identifies this integration in Stripe's logs, which makes support requests answerable.
    appInfo: { name: 'bytelite-website', url: 'https://www.thebytelite.com' },
    // Stripe's own retry logic for network-level failures. This is not a custom recovery layer:
    // it is the SDK's documented idempotent-retry behaviour for requests that never landed.
    maxNetworkRetries: 1,
  });
}

/**
 * Guard against pointing production at a live key while the site is still being verified.
 * Test keys start `sk_test_`; live keys start `sk_live_`. We never log either.
 */
export function secretKeyIsLiveMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_live_');
}

/** The canonical site origin, used to build return URLs. Never taken from the request. */
export function siteOrigin(): string {
  const raw = process.env.PUBLIC_SITE_URL ?? 'https://www.thebytelite.com';
  return raw.replace(/\/+$/, '');
}
