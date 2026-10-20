import { COMPATIBILITY_APP_NAME, PARTY_GAME_NAME, PERSONAL_REPRESENTATION_SERVICE_NAME } from './products';
import { LIVE_FINANCIAL_TRANSACTIONS_OWNER_AUTHORIZED } from '../../api/_lib/commerce-core';

/**
 * The public face of the commerce surface.
 *
 * This module decides what each founder card SAYS. The matching server allowlist in
 * `api/_lib/commerce-core.ts` decides what each card may DO. They are separate on purpose: a page
 * that renders an enabled-looking button is a cosmetic bug, whereas a server that accepts an
 * unapproved plan is a commercial one. The server refuses regardless of what this file claims.
 *
 * Read at BUILD time. The site is a static build, so changing COMMERCE_PHASE requires a redeploy -
 * which is the safer direction: commerce cannot switch itself on between builds.
 */

/** Mirrors CommercePhase in api/_lib/commerce-core.ts. Anything unrecognised means disabled. */
export type CommercePhase = 'disabled' | 'test' | 'reservation' | 'live';

const rawPhase = import.meta.env.COMMERCE_PHASE;
export const COMMERCE_PHASE: CommercePhase =
  rawPhase === 'test' || rawPhase === 'reservation' || rawPhase === 'live' ? rawPhase : 'disabled';

export const FOUNDER_OFFER_OPEN = import.meta.env.FOUNDER_OFFER_PHASE === 'prelaunch';

const configuredCustomerPortalUrl: string = import.meta.env.STRIPE_CUSTOMER_PORTAL_URL ?? '';
export const CUSTOMER_PORTAL_URL: string = configuredCustomerPortalUrl.startsWith('https://billing.stripe.com/') ? configuredCustomerPortalUrl : '';

/** A plan is only offerable if its Stripe Price exists. Absent price -> honest disabled state. */
const hasPrice = (envVar: string): boolean => Boolean(import.meta.env[envVar]);

export interface FounderCard {
  planKey: string;
  product: 'bytelite' | 'cordel-connect' | 'cordel-play';
  title: string;
  /** One line on what the thing is. Never a capability claim. */
  what: string;
  /** The truthful commercial state, in words. */
  state: string;
  kind: 'subscription' | 'reservation';
  interval: 'month' | 'year' | null;
  priceEnvVar: string | null;
  /** Route to the product page that explains it properly. */
  href: string;
}

/**
 * The two founder benefits. Kept as two separate strings in two separate fields, because the one
 * mistake that matters here is collapsing them into "20% off". They are not the same kind of
 * thing: one is a discount on price, the other is more of whatever the product meters. Adding
 * them together would be arithmetic on two different units.
 */
export const FOUNDER_BENEFIT_PRICE = '10% lower founder price';
export const FOUNDER_BENEFIT_ENTITLEMENT = '10% additional qualifying entitlement';

/**
 * What "10% additional qualifying entitlement" means per product is NOT decided. It is not
 * guessed here, and no page states a meaning for it. Until the owner defines it, the founder
 * cards say the benefit exists and say plainly that its unit is still being set.
 */
export const FOUNDER_ENTITLEMENT_UNDEFINED_NOTE =
  'What the additional 10% is measured in has not been set for this product yet. It will be written down before anything is charged, not after.';

export const FOUNDER_CARDS: readonly FounderCard[] = [
  {
    planKey: 'bytelite-monthly-founder',
    product: 'bytelite',
    title: `${PERSONAL_REPRESENTATION_SERVICE_NAME} - monthly`,
    what: 'A planned flat personal subscription. No percentage-of-savings fee.',
    state:
      'The underlying research has not demonstrated net size reduction, so there is no product to sell and no approved price. Nothing is charged.',
    kind: 'subscription',
    interval: 'month',
    priceEnvVar: 'STRIPE_PRICE_BYTELITE_MONTHLY_FOUNDER',
    href: '/licensing',
  },
  {
    planKey: 'bytelite-annual-founder',
    product: 'bytelite',
    title: `${PERSONAL_REPRESENTATION_SERVICE_NAME} - annual`,
    what: 'The same planned subscription billed once a year instead of monthly.',
    state: 'Same state as the monthly plan: not available and not charged.',
    kind: 'subscription',
    interval: 'year',
    priceEnvVar: 'STRIPE_PRICE_BYTELITE_ANNUAL_FOUNDER',
    href: '/licensing',
  },
  {
    planKey: 'cordel-connect-monthly-founder',
    product: 'cordel-connect',
    title: `${COMPATIBILITY_APP_NAME} - monthly`,
    what: 'A planned subscription to a privacy-focused compatibility application.',
    state:
      'The application is in private development. No public price has been set, so there is nothing to charge.',
    kind: 'subscription',
    interval: 'month',
    priceEnvVar: 'STRIPE_PRICE_CORDEL_CONNECT_MONTHLY_FOUNDER',
    href: '/compatibility-app',
  },
  {
    planKey: 'cordel-connect-annual-founder',
    product: 'cordel-connect',
    title: `${COMPATIBILITY_APP_NAME} - annual`,
    what: 'The same planned subscription billed once a year instead of monthly.',
    state: 'No public price has been set. Nothing is charged.',
    kind: 'subscription',
    interval: 'year',
    priceEnvVar: 'STRIPE_PRICE_CORDEL_CONNECT_ANNUAL_FOUNDER',
    href: '/compatibility-app',
  },
  {
    planKey: 'cordel-play-reservation',
    product: 'cordel-play',
    title: `${PARTY_GAME_NAME} - founder reservation`,
    what: 'A planned physical adult board game. 18+. A product in a box, not a subscription.',
    state:
      'Prototype stage. No price, shipping estimate or refund process is approved. Nothing can be reserved, and no money or payment details are taken.',
    kind: 'reservation',
    interval: null,
    priceEnvVar: null,
    href: '/cordel-play',
  },
] as const;

/**
 * Can this card offer a working control right now?
 *
 * A reservation needs no Price, so it only needs the phase to permit it. Everything else needs an
 * approved Stripe Price to exist. This mirrors resolveCheckout() on the server; when the two
 * disagree the server wins and the visitor gets an honest refusal rather than a broken checkout.
 */
export function cardIsActionable(card: FounderCard): boolean {
  if (COMMERCE_PHASE === 'disabled') return false;
  if (COMMERCE_PHASE === 'live' && !LIVE_FINANCIAL_TRANSACTIONS_OWNER_AUTHORIZED) return false;
  if (!FOUNDER_OFFER_OPEN) return false;
  if (card.kind === 'reservation') return true;
  if (COMMERCE_PHASE === 'reservation') return true;
  return card.priceEnvVar ? hasPrice(card.priceEnvVar) : false;
}

/**
 * Hard false, mirroring `ownerEnabled: false` on the plan in `api/_lib/commerce-core.ts`.
 *
 * The blocker is not configuration. The pack promises specific digital files, those files do not
 * exist in final form, and no Stripe Price or COMMERCE_PHASE value changes that. Selling it now
 * would take money for something undeliverable. The server refuses the plan independently, so
 * this constant only governs whether the page renders a live-looking button.
 */
export const SUPPORTER_PACK_ACTIONABLE = false;

/**
 * The disclosure that must sit next to the Supporter Pack purchase control. Exported so it cannot
 * drift between the product page, the terms page and the success page.
 */
export const SUPPORTER_DISCLOSURE =
  'The Founder Supporter Pack is a purchase from ByteLite LLC, a for-profit company. It is not a charitable donation and is not tax deductible. It does not provide equity, repayment rights, product ownership, product access, or control over development. The digital items listed here are the complete reward for this purchase.';

/** Exactly what a supporter receives. Nothing may be added to this list that is not deliverable. */
export const SUPPORTER_REWARD = [
  'A high-resolution ByteLite LLC wallpaper pack.',
  'A digital Founder Supporter certificate.',
  'Optional inclusion on a public supporter wall, under a name you choose, only if you tick that box.',
] as const;

function cardSavesPaymentMethodOnly(card: FounderCard): boolean {
  return card.kind === 'reservation' || COMMERCE_PHASE === 'reservation';
}

export function actionLabelFor(card: FounderCard): string {
  return cardSavesPaymentMethodOnly(card) ? 'Reserve, no charge now' : 'Continue to subscription checkout';
}

export function actionableStateFor(card: FounderCard): string {
  return cardSavesPaymentMethodOnly(card)
    ? 'A reservation saves a payment method with Stripe for a later, separately confirmed charge. Nothing is charged now.'
    : 'Opens a Stripe checkout for this subscription. The price and billing interval are shown before you confirm.';
}
