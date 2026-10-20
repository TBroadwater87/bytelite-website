import { describe, test, expect } from 'vitest';
import {
  PLANS,
  findPlan,
  readPhase,
  readFounderOfferPhase,
  resolveCheckout,
  buildMetadata,
  classifyStripeSecretKey,
  stripeKeyPermittedForPhase,
  LIVE_FINANCIAL_TRANSACTIONS_OWNER_AUTHORIZED,
  type CommerceEnv,
} from '../../api/_lib/commerce-core.js';

// The commerce allowlist is the boundary between "a visitor clicked something" and "ByteLite LLC
// took money". Every test here is about that boundary failing CLOSED.

const env = (over: Partial<CommerceEnv> = {}): CommerceEnv => ({
  phase: 'test',
  founderOffer: 'prelaunch',
  priceIdFor: () => 'price_test_123',
  liveFinancialTransactionsOwnerAuthorized: false,
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

// Some blockers are not configuration. The Supporter Pack promises specific digital files that do
// not exist yet, and no Stripe Price or COMMERCE_PHASE value makes them exist. `ownerEnabled` is
// the gate for that class of blocker, and it must beat every environment variable.
describe('the owner gate cannot be lifted by configuration', () => {
  test('the Supporter Pack is refused in every phase, even live with a valid Price', () => {
    for (const phase of ['test', 'reservation', 'live'] as const) {
      const r = resolveCheckout('founder-supporter-pack', env({ phase }));
      expect(r, `phase ${phase} must still refuse`).toMatchObject({ ok: false, status: 503 });
    }
  });

  test('it is refused even with the founder offer open and a Price configured', () => {
    const r = resolveCheckout('founder-supporter-pack', {
      phase: 'live',
      founderOffer: 'prelaunch',
      priceIdFor: () => 'price_live_definitely_set',
      liveFinancialTransactionsOwnerAuthorized: true,
    });
    expect(r).toMatchObject({ ok: false, status: 503 });
  });

  test('the gate is recorded on the plan itself, not inferred', () => {
    expect(findPlan('founder-supporter-pack')?.ownerEnabled).toBe(false);
  });

  test('every other plan is owner-enabled, so the gate is not blanket-off', () => {
    for (const plan of PLANS.filter((p) => p.key !== 'founder-supporter-pack')) {
      expect(plan.ownerEnabled, `${plan.key} should be owner-enabled`).toBe(true);
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
    const r = resolveCheckout('bytelite-monthly-founder', { ...noPrices, phase: 'test' });
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
      const r = resolveCheckout('cordel-play-reservation', env({ phase, liveFinancialTransactionsOwnerAuthorized: true }));
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
    const r = resolveCheckout('cordel-connect-monthly-founder', env({ phase: 'live', liveFinancialTransactionsOwnerAuthorized: true }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mode).toBe('subscription');
  });

  test('the Supporter Pack is typed as a one-time purchase, never recurring', () => {
    const plan = findPlan('founder-supporter-pack');
    expect(plan?.kind).toBe('one-time');
    expect(plan?.interval).toBeNull();
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
  // The benefit is "10% lower price", and a discounted price must be rounded to whole cents, which Stripe wants as integer minor
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

describe('live financial transactions require owner authorization in code', () => {
  test('the authorization constant is false', () => {
    expect(LIVE_FINANCIAL_TRANSACTIONS_OWNER_AUTHORIZED).toBe(false);
  });

  test('the live phase refuses every plan while unauthorized, even with prices and an open offer', () => {
    for (const plan of PLANS) {
      const r = resolveCheckout(plan.key, env({ phase: 'live' }));
      expect(r, `${plan.key} must be refused in an unauthorized live phase`).toMatchObject({ ok: false, status: 503 });
    }
  });
});

describe('Stripe secret keys are classified by prefix only', () => {
  test.each([
    ['sk_test_abc', 'test'],
    ['rk_test_abc', 'test'],
    ['sk_live_abc', 'live'],
    ['rk_live_abc', 'live'],
    ['pk_live_abc', 'unrecognised'],
    ['live', 'unrecognised'],
    ['', 'unrecognised'],
    [undefined, 'unrecognised'],
  ] as const)('%j is %s', (secretKey, expectedMode) => {
    expect(classifyStripeSecretKey(secretKey)).toBe(expectedMode);
  });
});

describe('a live key is never accepted because of phase configuration alone', () => {
  test('the disabled phase refuses every key', () => {
    for (const keyMode of ['test', 'live', 'unrecognised'] as const) {
      for (const authorized of [false, true]) {
        expect(stripeKeyPermittedForPhase('disabled', keyMode, authorized).permitted).toBe(false);
      }
    }
  });

  test('without owner authorization a live key is refused in every phase', () => {
    for (const phase of ['disabled', 'test', 'reservation', 'live'] as const) {
      expect(stripeKeyPermittedForPhase(phase, 'live', false).permitted, `phase ${phase}`).toBe(false);
    }
  });

  test('the test phase refuses a live key even with owner authorization', () => {
    expect(stripeKeyPermittedForPhase('test', 'live', true).permitted).toBe(false);
  });

  test('the live phase refuses a test key', () => {
    expect(stripeKeyPermittedForPhase('live', 'test', true).permitted).toBe(false);
    expect(stripeKeyPermittedForPhase('live', 'test', false).permitted).toBe(false);
  });

  test('an unrecognised key is refused in every phase', () => {
    for (const phase of ['disabled', 'test', 'reservation', 'live'] as const) {
      expect(stripeKeyPermittedForPhase(phase, 'unrecognised', true).permitted).toBe(false);
    }
  });

  test('a test key is permitted only in the test and reservation phases', () => {
    expect(stripeKeyPermittedForPhase('test', 'test', false).permitted).toBe(true);
    expect(stripeKeyPermittedForPhase('reservation', 'test', false).permitted).toBe(true);
  });

  test('a live key is permitted only with owner authorization in the reservation or live phase', () => {
    expect(stripeKeyPermittedForPhase('reservation', 'live', true).permitted).toBe(true);
    expect(stripeKeyPermittedForPhase('live', 'live', true).permitted).toBe(true);
  });
});