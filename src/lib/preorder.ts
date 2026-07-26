// Canonical preorder/entitlement calculation engine.
// Single source of truth for the "10% lower price plus 10% more entitlement" founder offer
// (see CLAUDE.md section 20). Used by every preorder page and, when a real checkout exists,
// must be re-run server-side rather than trusting a client-submitted price.

export type ReservationMode = 'reservation' | 'deposit' | 'full-payment';
export type ProductClassification = 'physical' | 'digital' | 'service';

export interface PreorderProductConfig {
  productId: string;
  productName: string;
  productType: string;
  /** Cents. null = launch price not yet decided -> reservation mode is required. */
  standardLaunchPriceCents: number | null;
  currency: string;
  /** Base subscription/service duration in days, if this product has a duration-based entitlement. */
  baseEntitlementDays: number | null;
  /** Base usage-unit entitlement, if this product has a usage-based entitlement. */
  baseUsageUnits: number | null;
  usageUnitLabel: string | null;
  reservationMode: ReservationMode;
  activationTrigger: string;
  shipmentTrigger: string | null;
  expectedAvailabilityWindow: string;
  refundEligibility: string;
  transferability: string;
  classification: ProductClassification;
  associatedRoute: string;
  checkoutAvailable: boolean;
  legalDisclosureVersion: string;
  physicalBonusBenefit: string | null;
}

export interface PreorderCalculation {
  standardPriceCents: number | null;
  preorderPriceCents: number | null;
  bonusEntitlementDays: number | null;
  totalEntitlementDays: number | null;
  bonusUsageUnits: number | null;
  totalUsageUnits: number | null;
}

/** preorder_price = standard_public_launch_price * 0.90, rounded to the nearest cent. */
export function calculatePreorderPriceCents(standardPriceCents: number): number {
  return Math.round(standardPriceCents * 0.9);
}

/** bonus_days = ceiling(base_service_days / 10) */
export function calculateBonusDays(baseServiceDays: number): number {
  return Math.ceil(baseServiceDays / 10);
}

/** bonus_usage_units = ceiling(base_usage_units / 10) */
export function calculateBonusUsageUnits(baseUsageUnits: number): number {
  return Math.ceil(baseUsageUnits / 10);
}

export function calculatePreorder(config: PreorderProductConfig): PreorderCalculation {
  const standardPriceCents = config.standardLaunchPriceCents;
  const preorderPriceCents = standardPriceCents !== null ? calculatePreorderPriceCents(standardPriceCents) : null;

  const bonusEntitlementDays = config.baseEntitlementDays !== null ? calculateBonusDays(config.baseEntitlementDays) : null;
  const totalEntitlementDays =
    config.baseEntitlementDays !== null && bonusEntitlementDays !== null
      ? config.baseEntitlementDays + bonusEntitlementDays
      : null;

  const bonusUsageUnits = config.baseUsageUnits !== null ? calculateBonusUsageUnits(config.baseUsageUnits) : null;
  const totalUsageUnits =
    config.baseUsageUnits !== null && bonusUsageUnits !== null ? config.baseUsageUnits + bonusUsageUnits : null;

  return { standardPriceCents, preorderPriceCents, bonusEntitlementDays, totalEntitlementDays, bonusUsageUnits, totalUsageUnits };
}

export function formatCents(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function formatDaysAsMonths(days: number): string {
  const months = days / 30;
  const rounded = Math.round(months * 10) / 10;
  return `${rounded} month${rounded === 1 ? '' : 's'}`;
}
