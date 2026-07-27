import { describe, it, expect } from 'vitest';
import {
  calculatePreorderPriceCents,
  calculateBonusDays,
  calculateBonusUsageUnits,
  calculatePreorder,
  formatCents,
  type PreorderProductConfig,
} from '../../src/lib/preorder';

describe('preorder calculation engine', () => {
  it('applies exactly a 10% price reduction, rounded to the nearest cent', () => {
    expect(calculatePreorderPriceCents(10000)).toBe(9000); // $100.00 -> $90.00
    expect(calculatePreorderPriceCents(9999)).toBe(8999); // rounding check
  });

  it('computes bonus entitlement days as ceil(base / 10)', () => {
    expect(calculateBonusDays(300)).toBe(30); // 10 months (300 days) -> +30 days = 11 months
    expect(calculateBonusDays(305)).toBe(31); // ceiling, not floor
  });

  it('computes bonus usage units as ceil(base / 10)', () => {
    expect(calculateBonusUsageUnits(100)).toBe(10);
    expect(calculateBonusUsageUnits(101)).toBe(11);
  });

  it('matches the canonical worked example: $100 for 10 months -> $90 for 11 months', () => {
    const config: PreorderProductConfig = {
      productId: 'example',
      productName: 'Example Subscription',
      productType: 'Digital subscription service',
      standardLaunchPriceCents: 10000,
      currency: 'USD',
      baseEntitlementDays: 300,
      baseUsageUnits: null,
      usageUnitLabel: null,
      reservationMode: 'full-payment',
      activationTrigger: 'Launch',
      shipmentTrigger: null,
      expectedAvailabilityWindow: 'Launch window',
      refundEligibility: 'Standard',
      transferability: 'Not transferable',
      classification: 'service',
      associatedRoute: '/preorder',
      checkoutAvailable: true,
      legalDisclosureVersion: '2026-07-26',
      physicalBonusBenefit: null,
    };
    const result = calculatePreorder(config);
    expect(result.standardPriceCents).toBe(10000);
    expect(result.preorderPriceCents).toBe(9000);
    expect(result.bonusEntitlementDays).toBe(30);
    expect(result.totalEntitlementDays).toBe(330);
    expect(formatCents(result.preorderPriceCents!)).toBe('$90.00');
  });

  it('never fabricates a price or entitlement for a reservation-mode (unpriced) product', () => {
    const config: PreorderProductConfig = {
      productId: 'unpriced',
      productName: 'Unpriced Product',
      productType: 'Physical board game',
      standardLaunchPriceCents: null,
      currency: 'USD',
      baseEntitlementDays: null,
      baseUsageUnits: null,
      usageUnitLabel: null,
      reservationMode: 'reservation',
      activationTrigger: 'Launch (not yet scheduled)',
      shipmentTrigger: null,
      expectedAvailabilityWindow: 'Not yet announced',
      refundEligibility: 'Full refund at any time before charge',
      transferability: 'Not yet set',
      classification: 'physical',
      associatedRoute: '/products/cordel-play/preorder',
      checkoutAvailable: false,
      legalDisclosureVersion: '2026-07-26',
      physicalBonusBenefit: null,
    };
    const result = calculatePreorder(config);
    expect(result.preorderPriceCents).toBeNull();
    expect(result.totalEntitlementDays).toBeNull();
    expect(result.totalUsageUnits).toBeNull();
  });
});
