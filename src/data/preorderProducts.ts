import type { PreorderProductConfig } from '../lib/preorder';

// Both currently-eligible products have no announced launch price, so both use reservation
// mode (CLAUDE.md section 20.5): a no-charge founder reservation that locks in the benefit
// formula rather than collecting payment against an unknown price.

export const HEARTSTRINGS_PLAY_PREORDER: PreorderProductConfig = {
  productId: 'heartstrings-play',
  productName: 'HeartStrings Play',
  productType: 'Physical board game',
  standardLaunchPriceCents: null,
  currency: 'USD',
  baseEntitlementDays: null,
  baseUsageUnits: null,
  usageUnitLabel: null,
  reservationMode: 'reservation',
  activationTrigger: 'Retail launch of HeartStrings Play (not yet scheduled)',
  shipmentTrigger: 'Manufacturing completion and retail release (not yet scheduled)',
  expectedAvailabilityWindow: 'Not yet announced',
  refundEligibility: 'Full refund/cancellation at any time before charge — reservations are not charged.',
  transferability: 'Reservation is tied to the founder’s contact record; transfer terms will be set at launch.',
  classification: 'physical',
  associatedRoute: '/products/heartstrings-play/preorder',
  checkoutAvailable: false,
  legalDisclosureVersion: '2026-07-26',
  physicalBonusBenefit: 'HeartStrings Connect service-day credit or equivalent digital benefit, to be configured at launch',
};

export const HEARTSTRINGS_CONNECT_PREORDER: PreorderProductConfig = {
  productId: 'heartstrings-connect',
  productName: 'HeartStrings Connect',
  productType: 'Digital subscription service',
  standardLaunchPriceCents: null,
  currency: 'USD',
  baseEntitlementDays: null,
  baseUsageUnits: null,
  usageUnitLabel: null,
  reservationMode: 'reservation',
  activationTrigger: 'Public launch or broader beta release of HeartStrings Connect (not yet scheduled)',
  shipmentTrigger: null,
  expectedAvailabilityWindow: 'Not yet announced',
  refundEligibility: 'Full refund/cancellation at any time before charge — reservations are not charged.',
  transferability: 'Reservation is tied to the founder’s contact record; transfer terms will be set at launch.',
  classification: 'service',
  associatedRoute: '/preorder',
  checkoutAvailable: false,
  legalDisclosureVersion: '2026-07-26',
  physicalBonusBenefit: null,
};

export const ALL_PREORDER_PRODUCTS: PreorderProductConfig[] = [
  HEARTSTRINGS_PLAY_PREORDER,
  HEARTSTRINGS_CONNECT_PREORDER,
];
