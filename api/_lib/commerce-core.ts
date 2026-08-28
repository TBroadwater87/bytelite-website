/**
 * Commerce core: every decision about WHAT a visitor is allowed to buy, and in which mode.
 *
 * This module imports nothing - not Stripe, not node built-ins - so the whole allowlist is
 * unit-testable without credentials and without a network. `api/checkout.ts` is the only place
 * that turns a resolved plan into a real Stripe call.
 *
 * The one rule this file exists to enforce: the browser chooses a PLAN KEY and nothing else.
 * Never a price, an amount, a currency, a Stripe Price ID, a mode, a discount, a success URL or a
 * product description. Everything the visitor sends is a lookup key into the table below; if the
 * key is not in the table, the request dies here.
 */

/** What kind of commercial object a plan is. Drives which Stripe Checkout mode is legal. */
export type PlanKind = 'subscription' | 'reservation' | 'one-time';

/**
 * Commerce phases, most restrictive first. Set by COMMERCE_PHASE.
 *
 * `disabled`  - no payment or payment-method control is active anywhere.
 * `test`      - Stripe test-mode flows are active so they can be verified end to end.
 * `reservation` - only no-charge reservations (Checkout `setup` mode) are active.
 * `live`      - live paid commerce. Owner-gated; never reachable by editing this file alone.
 */
export type CommercePhase = 'disabled' | 'test' | 'reservation' | 'live';

/** Founder-offer window. Closes on general release of the product, never on a countdown. */
export type FounderOfferPhase = 'prelaunch' | 'closed';

export type CheckoutMode = 'subscription' | 'setup' | 'payment';

export interface PlanDefinition {
  /** Stable public key. This is the ONLY value a browser may send. */
  key: string;
  /** Product family, used for metadata and for the fulfilment branch in the webhook. */
  product: 'bytelite' | 'cordel-connect' | 'cordel-play' | 'supporter-pack';
  label: string;
  kind: PlanKind;
  /** Environment variable holding the Stripe Price ID. Absent for pure contact reservations. */
  priceEnvVar: string | null;
  /** Billing interval, for subscriptions only. Shown to the visitor before any charge. */
  interval: 'month' | 'year' | null;
  /** True when Stripe should let the customer choose what to pay (Supporter Pack). */
  customerChosenAmount: boolean;
}

/**
 * The allowlist.
 *
 * Founder pricing is deliberately NOT computed here. The public ByteLite prices are $9.99/month
 * and $99.99/year and the founder benefit is "10% lower price", but 10% off $9.99 is $8.991 and
 * Stripe prices are integer minor units. Rounding that is a commercial decision with a legal
 * consequence, so the rounded founder price lives in an owner-approved Stripe Price object and
 * reaches this code only as an ID. Nothing in this repository multiplies a price by 0.9.
 */
export const PLANS: readonly PlanDefinition[] = [
  {
    key: 'bytelite-monthly-founder',
    product: 'bytelite',
    label: 'ByteLite Personal - founder monthly',
    kind: 'subscription',
    priceEnvVar: 'STRIPE_PRICE_BYTELITE_MONTHLY_FOUNDER',
    interval: 'month',
    customerChosenAmount: false,
  },
  {
    key: 'bytelite-annual-founder',
    product: 'bytelite',
    label: 'ByteLite Personal - founder annual',
    kind: 'subscription',
    priceEnvVar: 'STRIPE_PRICE_BYTELITE_ANNUAL_FOUNDER',
    interval: 'year',
    customerChosenAmount: false,
  },
  {
    key: 'cordel-connect-monthly-founder',
    product: 'cordel-connect',
    label: 'Cordel Connect - founder monthly',
    kind: 'subscription',
    priceEnvVar: 'STRIPE_PRICE_CORDEL_CONNECT_MONTHLY_FOUNDER',
    interval: 'month',
    customerChosenAmount: false,
  },
  {
    key: 'cordel-connect-annual-founder',
    product: 'cordel-connect',
    label: 'Cordel Connect - founder annual',
    kind: 'subscription',
    priceEnvVar: 'STRIPE_PRICE_CORDEL_CONNECT_ANNUAL_FOUNDER',
    interval: 'year',
    customerChosenAmount: false,
  },
  {
    // Physical, 18+, and explicitly NOT a subscription. No charge is taken here under any phase:
    // the FTC Mail, Internet, or Telephone Order Merchandise Rule requires a shipment window and
    // a delay-consent/refund process before money changes hands, and neither exists yet.
    key: 'cordel-play-reservation',
    product: 'cordel-play',
    label: 'Cordel Play - founder reservation',
    kind: 'reservation',
    priceEnvVar: null,
    interval: null,
    customerChosenAmount: false,
  },
  {
    key: 'founder-supporter-pack',
    product: 'supporter-pack',
    label: 'ByteLite Founder Supporter Pack',
    kind: 'one-time',
    priceEnvVar: 'STRIPE_PRICE_FOUNDER_SUPPORTER_PACK',
    interval: null,
    customerChosenAmount: true,
  },
] as const;

export function findPlan(key: unknown): PlanDefinition | null {
  if (typeof key !== 'string' || key.length === 0 || key.length > 64) return null;
  return PLANS.find((p) => p.key === key) ?? null;
}

export function readPhase(raw: string | undefined): CommercePhase {
  // Anything unrecognised - including unset - means disabled. A typo in an environment variable
  // must never fail open into live commerce.
  return raw === 'test' || raw === 'reservation' || raw === 'live' ? raw : 'disabled';
}

export function readFounderOfferPhase(raw: string | undefined): FounderOfferPhase {
  return raw === 'prelaunch' ? 'prelaunch' : 'closed';
}

export type Resolution =
  | { ok: true; plan: PlanDefinition; mode: CheckoutMode; priceId: string | null }
  | { ok: false; status: number; reason: string };

export interface CommerceEnv {
  phase: CommercePhase;
  founderOffer: FounderOfferPhase;
  /** Lookup of the plan's price environment variable. Injected so tests need no real env. */
  priceIdFor: (envVar: string) => string | undefined;
}

/**
 * Decide whether a plan key may proceed, and in which Checkout mode.
 *
 * A subscription does NOT become a subscription Checkout automatically. While the product is not
 * generally available, a founder subscription resolves to `setup` mode: no charge, no recurring
 * object created, payment method stored only after the page has said so. The recurring charge is
 * a separate later act that requires the customer to see the final price and confirm.
 */
export function resolveCheckout(planKey: unknown, env: CommerceEnv): Resolution {
  const plan = findPlan(planKey);
  if (!plan) return { ok: false, status: 400, reason: 'Unknown plan.' };

  if (env.phase === 'disabled') {
    return { ok: false, status: 503, reason: 'Checkout is not enabled.' };
  }

  if (plan.kind !== 'one-time' && env.founderOffer === 'closed') {
    return { ok: false, status: 503, reason: 'The founder offer is closed.' };
  }

  // A pure reservation never touches a Price and never charges.
  if (plan.kind === 'reservation') {
    return { ok: true, plan, mode: 'setup', priceId: null };
  }

  const priceId = plan.priceEnvVar ? env.priceIdFor(plan.priceEnvVar) : undefined;

  if (plan.kind === 'one-time') {
    // The Supporter Pack is a real purchase, so it needs a real Price even in test mode.
    if (!priceId) {
      return { ok: false, status: 503, reason: 'This purchase is not configured yet.' };
    }
    if (env.phase === 'reservation') {
      return { ok: false, status: 503, reason: 'This purchase is not enabled in the current phase.' };
    }
    return { ok: true, plan, mode: 'payment', priceId };
  }

  // Subscriptions from here down.
  if (env.phase === 'reservation') {
    // No price needed: we are only storing a payment method against a future, approved price.
    return { ok: true, plan, mode: 'setup', priceId: null };
  }

  if (!priceId) {
    return { ok: false, status: 503, reason: 'This plan is not configured yet.' };
  }

  if (env.phase === 'live') {
    return { ok: true, plan, mode: 'subscription', priceId };
  }

  // `test`: exercise the real subscription path against Stripe test-mode prices.
  return { ok: true, plan, mode: 'subscription', priceId };
}

/**
 * Whether the public page should render a working control for this plan.
 *
 * Used by the pages so a plan whose Price ID is missing shows an honest "being configured" state
 * instead of a button that 503s when clicked.
 */
export function planIsPurchasable(plan: PlanDefinition, env: CommerceEnv): boolean {
  return resolveCheckout(plan.key, env).ok;
}

/** Metadata written onto every Checkout Session and SetupIntent, for later fulfilment. */
export function buildMetadata(
  plan: PlanDefinition,
  versions: { founderOfferVersion: string; termsVersion: string }
): Record<string, string> {
  return {
    plan_key: plan.key,
    product: plan.product,
    plan_kind: plan.kind,
    billing_interval: plan.interval ?? 'none',
    founder_offer_version: versions.founderOfferVersion,
    terms_version: versions.termsVersion,
  };
}
