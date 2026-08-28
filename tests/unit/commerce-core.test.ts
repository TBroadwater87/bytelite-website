import { describe, test, expect } from 'vitest';
import {
  PLANS,
  findPlan,
  readPhase,
  readFounderOfferPhase,
  resolveCheckout,
  buildMetadata,
  type CommerceEnv,
} from '../../api/_lib/commerce-core.js';

// The commerce allowlist is the boundary between "a visitor clicked something" and "ByteLite LLC
// took money". Every test here is about that boundary failing CLOSED.

const env = (over: Partial<CommerceEnv> = {}): CommerceEnv => ({
  phase: 'test',
  founderOffer: 'prelaunch',
  priceIdFor: () => 'price_test_123',
  ...over,
});

describe('phase parsing fails closed', () => {
  test('unset means disabled', () => {
    expect(readPhase(undefined)).toBe('disabled');
  });

  // The realistic accident is a typo or a stale value in a dashboard, not a hostile edit.
  // "Live", "LIVE", "production" must never resolve to live commerce.
  test.each(['Live', 'LIVE', 'production', 'enabled', '', 'true'])(
    '%j is not a recognised phase and resolves to disabled',
    (raw) => {
      expect(readPhase(raw)).toBe('disabled');
    }
  );

  test('only the four exact spellings are honoured', () => {
    expect(readPhase('disabled')).toBe('disabled');
    expect(readPhase('test')).toBe('test');
    expect(readPhase('reservation')).toBe('reservation');
    expect(readPhase('live')).toBe('live');
  });

  test('the founder offer is closed unless explicitly prelaunch', () => {
    expect(readFounderOfferPhase(undefined)).toBe('closed');
    expect(readFounderOfferPhase('open')).toBe('closed');
    expect(readFounderOfferPhase('prelaunch')).toBe('prelaunch');
  });
});

describe('the browser cannot choose anything but a known key', () => {
  test.each([null, undefined, 42, {}, [], '', 'bytelite-monthly', '../../etc/passwd'])(
    '%j is rejected',
    (key) => {
      expect(findPlan(key)).toBeNull();
      expect(resolveCheckout(key, env())).toMatchObject({ ok: false, status: 400 });
    }
  );

  test('an absurdly long key is rejected before any lookup', () => {
    expect(findPlan('a'.repeat(5000))).toBeNull();
  });

  test('every advertised plan key resolves', () => {
    for (const plan of PLANS) {
      expect(findPlan(plan.key)?.key).toBe(plan.key);
    }
  });
});

describe('disabled means disabled', () => {
  test('no plan can be checked out while the phase is disabled', () => {
    for (const plan of PLANS) {
      const r = resolveCheckout(plan.key, env({ phase: 'disabled' }));
      expect(r, `${plan.key} must be refused`).toMatchObject({ ok: false, status: 503 });
    }
  });

  test('a closed founder offer blocks every founder plan', () => {
    for (const plan of PLANS.filter((p) => p.kind !== 'one-time')) {
      const r = resolveCheckout(plan.key, env({ founderOffer: 'closed' }));
      expect(r, `${plan.key} must be refused`).toMatchObject({ ok: false, status: 503 });
    }
  });
});

describe('a missing Stripe Price disables the plan rather than guessing one', () => {
  const noPrices = env({ priceIdFor: () => undefined });

  test('a subscription with no Price is refused, not defaulted', () => {
    const r = resolveCheckout('bytelite-monthly-founder', { ...noPrices, phase: 'live' });
    expect(r).toMatchObject({ ok: false, status: 503 });
  });

  test('the Supporter Pack with no Price is refused', () => {
    expect(resolveCheckout('founder-supporter-pack', noPrices)).toMatchObject({
      ok: false,
      status: 503,
    });
  });

  test('an empty-string Price is treated as missing, not as a valid id', () => {
    const r = resolveCheckout('founder-supporter-pack', {
      ...env(),
      priceIdFor: () => '',
    });
    expect(r).toMatchObject({ ok: false });
  });
});

describe('a reservation never becomes a charge', () => {
  test('Cordel Play resolves to setup mode with no price, in every enabled phase', () => {
    for (const phase of ['test', 'reservation', 'live'] as const) {
      const r = resolveCheckout('cordel-play-reservation', env({ phase }));
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.mode, `phase ${phase}`).toBe('setup');
        expect(r.priceId, `phase ${phase}`).toBeNull();
      }
    }
  });

  test('Cordel Play carries no Price environment variable at all', () => {
    expect(findPlan('cordel-play-reservation')?.priceEnvVar).toBeNull();
  });

  // The whole point of the reservation phase: a subscription plan must NOT create a recurring
  // object while the product is unavailable. It degrades to storing a payment method.
  test('a subscription in the reservation phase degrades to setup, not subscription', () => {
    const r = resolveCheckout('bytelite-annual-founder', env({ phase: 'reservation' }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.mode).toBe('setup');
      expect(r.priceId).toBeNull();
    }
  });

  test('the Supporter Pack is not sellable during the reservation phase', () => {
    expect(resolveCheckout('founder-supporter-pack', env({ phase: 'reservation' }))).toMatchObject({
      ok: false,
    });
  });
});

describe('modes match the kind of thing being sold', () => {
  test('subscriptions use subscription mode once live', () => {
    const r = resolveCheckout('cordel-connect-monthly-founder', env({ phase: 'live' }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mode).toBe('subscription');
  });

  test('the Supporter Pack is a one-time payment and never recurring', () => {
    const r = resolveCheckout('founder-supporter-pack', env({ phase: 'live' }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mode).toBe('payment');
    expect(findPlan('founder-supporter-pack')?.interval).toBeNull();
  });

  test('no plan is simultaneously a subscription and a physical product', () => {
    for (const plan of PLANS) {
      if (plan.kind === 'reservation') expect(plan.interval).toBeNull();
      if (plan.kind === 'subscription') expect(plan.interval).not.toBeNull();
    }
  });

  test('Cordel Play is never typed as a subscription', () => {
    expect(findPlan('cordel-play-reservation')?.kind).toBe('reservation');
  });
});

describe('metadata records which offer was accepted', () => {
  test('every checkout carries plan, product, offer version and terms version', () => {
    const plan = findPlan('bytelite-monthly-founder');
    expect(plan).not.toBeNull();
    const meta = buildMetadata(plan!, {
      founderOfferVersion: '2026-08-26',
      termsVersion: '2026-08-26',
    });
    expect(meta).toMatchObject({
      plan_key: 'bytelite-monthly-founder',
      product: 'bytelite',
      plan_kind: 'subscription',
      billing_interval: 'month',
      founder_offer_version: '2026-08-26',
      terms_version: '2026-08-26',
    });
  });

  test('metadata values are all strings, as Stripe requires', () => {
    for (const plan of PLANS) {
      const meta = buildMetadata(plan, { founderOfferVersion: 'v', termsVersion: 'v' });
      for (const [k, v] of Object.entries(meta)) {
        expect(typeof v, `${plan.key}.${k}`).toBe('string');
      }
    }
  });
});

describe('no founder price is ever computed in code', () => {
  // The benefit is "10% lower price", but 10% off $9.99 is $8.991 and Stripe wants integer minor
  // units. Rounding that is a commercial decision, so it must live in an owner-approved Price
  // object - never in a multiplication here.
  test('no plan definition carries an amount, currency or discount', () => {
    for (const plan of PLANS) {
      const keys = Object.keys(plan);
      for (const forbidden of ['amount', 'price', 'currency', 'discount', 'percentOff']) {
        expect(keys, `${plan.key} must not define ${forbidden}`).not.toContain(forbidden);
      }
    }
  });
});
