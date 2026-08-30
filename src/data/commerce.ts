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

export const CUSTOMER_PORTAL_URL: string = import.meta.env.STRIPE_CUSTOMER_PORTAL_URL ?? '';

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
    title: 'ByteLite Personal - monthly',
    what: 'A flat personal subscription to ByteLite. No percentage-of-savings fee, ever.',
    state:
      'ByteLite is not finished and is not available. Nothing is charged. A founder reservation records interest and locks the benefit, and nothing else.',
    kind: 'subscription',
    interval: 'month',
    priceEnvVar: 'STRIPE_PRICE_BYTELITE_MONTHLY_FOUNDER',
    href: '/licensing',
  },
  {
    planKey: 'bytelite-annual-founder',
    product: 'bytelite',
    title: 'ByteLite Personal - annual',
    what: 'The same subscription billed once a year instead of monthly.',
    state:
      'Same state as the monthly plan: not available, not charged, reservation only.',
    kind: 'subscription',
    interval: 'year',
    priceEnvVar: 'STRIPE_PRICE_BYTELITE_ANNUAL_FOUNDER',
    href: '/licensing',
  },
  {
    planKey: 'cordel-connect-monthly-founder',
    product: 'cordel-connect',
    title: 'Cordel Connect - monthly',
    what: 'A subscription to Cordel Connect, a privacy-focused compatibility application.',
    state:
      'No public price has been set for Cordel Connect. Until one is approved there is nothing to charge, so this is a reservation only.',
    kind: 'subscription',
    interval: 'month',
    priceEnvVar: 'STRIPE_PRICE_CORDEL_CONNECT_MONTHLY_FOUNDER',
    href: '/cordel-connect',
  },
  {
    planKey: 'cordel-connect-annual-founder',
    product: 'cordel-connect',
    title: 'Cordel Connect - annual',
    what: 'The same subscription billed once a year instead of monthly.',
    state:
      'No public price has been set for Cordel Connect. Reservation only.',
    kind: 'subscription',
    interval: 'year',
    priceEnvVar: 'STRIPE_PRICE_CORDEL_CONNECT_ANNUAL_FOUNDER',
    href: '/cordel-connect',
  },
  {
    planKey: 'cordel-play-reservation',
    product: 'cordel-play',
    title: 'Cordel Play - founder reservation',
    what: 'A physical adult party game. 18+. A product in a box, not a subscription.',
    state:
      'No price, no shipping estimate and no refund process are approved, so no money is taken and no payment method is stored. This registers interest.',
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
  'A high-resolution wallpaper pack built from the ByteLite brand graphics on this site.',
  'A digital Founder Supporter certificate.',
  'Optional inclusion on a public supporter wall, under a name you choose, only if you tick that box.',
] as const;
