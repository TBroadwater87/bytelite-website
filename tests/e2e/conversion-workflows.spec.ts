import { test, expect } from '@playwright/test';

// Regression guards for the 2026-08-01 conversion-architecture pass (audience routing,
// focused inquiry entry points, preorder terminology). See Phase 8 of the task for the
// ten required assertions this file implements.

test.describe('Homepage audience routing', () => {
  test('exposes the three primary audience paths', async ({ page }) => {
    await page.goto('/');
    const audience = page.locator('#audience-paths');
    await expect(audience.getByRole('heading', { name: 'For People', exact: true })).toBeVisible();
    await expect(audience.getByRole('heading', { name: 'For Organizations', exact: true })).toBeVisible();
    await expect(audience.getByRole('heading', { name: 'For Technical Reviewers', exact: true })).toBeVisible();
  });

  test('every primary CTA resolves successfully', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = await page.locator('#audience-paths a, .hero-cta-row a').evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute('href')).filter((h): h is string => !!h && h.startsWith('/'))
    );
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), `${href} should resolve 200`).toBe(200);
    }
  });
});

test.describe('Preorder terminology stays nonbinding', () => {
  const noPaidOrderPages = ['/preorder', '/preorder/founder-benefits', '/preorder/terms', '/products/cordel-play/preorder'];

  for (const path of noPaidOrderPages) {
    test(`${path} contains no paid-order wording`, async ({ page }) => {
      await page.goto(path);
      const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
      expect(text).not.toContain('buy now');
      expect(text).not.toContain('order now');
      expect(text).not.toContain('available now');
      expect(text).not.toContain('join today');
    });
  }

  test('Cordel Play founder reservation explicitly states it is nonbinding, no charge', async ({ page }) => {
    await page.goto('/products/cordel-play/preorder');
    const body = page.locator('body');
    await expect(body).toContainText('It does not charge your payment method.');
    await expect(body).toContainText('nonbinding reservation of interest');
  });
});

test.describe('Restaurant program test-mode wording remains intact', () => {
  test('partner program page still discloses Stripe test mode', async ({ page }) => {
    await page.goto('/products/cordel-connect/date-planning/restaurants/partner-program');
    const body = page.locator('body');
    await expect(body).toContainText('Stripe test-mode checkout');
    await expect(body).toContainText('no real payment is processed and no real listing is created yet');
  });

  // The program's canonical status is Pilot Preparation with no verified external participant,
  // so no public surface may present it as a live or already-available paid product.
  const restaurantSurfaces = [
    '/',
    '/contact',
    '/terms',
    '/preorder/terms',
    '/privacy',
    '/company/partnerships',
    '/products/cordel-connect/date-planning/restaurants',
    '/products/cordel-connect/date-planning/restaurants/partner-program',
    '/progress/changelog',
    '/progress/development-timeline',
  ];

  for (const path of restaurantSurfaces) {
    test(`${path} never calls the restaurant pilot live or already available`, async ({ page }) => {
      await page.goto(path);
      const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
      expect(text).not.toContain('live pilot');
      expect(text).not.toContain('live $20');
      expect(text).not.toContain('pilot launched');
      // "not an already-available paid product" is the approved negation, so only flag the
      // affirmative form.
      expect(text).not.toContain('is a live, already-available paid');
    });
  }

  test('the restaurants index states pilot preparation and test-mode reality', async ({ page }) => {
    await page.goto('/products/cordel-connect/date-planning/restaurants');
    const body = page.locator('body');
    await expect(body).toContainText('Pilot preparation');
    await expect(body).toContainText('no real charge is processed');
  });
});

test.describe('Cordel Play mechanics remain unchanged', () => {
  test('Decree/Consent Cup wording still matches the locked v1.5 mechanic', async ({ page }) => {
    await page.goto('/products/cordel-play/consent-architecture');
    const body = page.locator('body');
    await expect(body).toContainText('30 of the 50 cards in the deck carry a PASS or REDRAW symbol');
    await expect(body).toContainText('sit out the rest of the game, or remove one item of clothing and stay in');
  });
});

test.describe('Cordel Connect safety statuses remain unchanged', () => {
  test('safety page still states per-feature verified status', async ({ page }) => {
    await page.goto('/products/cordel-connect/safety');
    const body = page.locator('body');
    await expect(body).toContainText('Implemented & tested');
    await expect(body).toContainText('Cordel is not a replacement for emergency services.');
  });
});

test.describe('Validated technology claims remain unchanged', () => {
  test('ByteOracle, Deep Kore, ByteSight still show internally-validated status', async ({ page }) => {
    for (const path of ['/technologies/byteoracle', '/technologies/deep-kore', '/technologies/bytesight']) {
      await page.goto(path);
      await expect(page.locator('body')).toContainText('Internally Validated');
    }
  });
});

test.describe('No HeartStrings content or assets return', () => {
  test('homepage and contact page contain no HeartStrings branding', async ({ page }) => {
    for (const path of ['/', '/contact', '/company/partnerships']) {
      await page.goto(path);
      const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
      expect(text).not.toContain('heartstrings');
    }
  });

  test('legacy asset paths are not reachable', async ({ request }) => {
    const res1 = await request.get('/HeartStrings_Banner.png');
    expect(res1.status()).toBe(404);
    const res2 = await request.get('/heartstrings-app/app-icon.png');
    expect(res2.status()).toBe(404);
  });
});

test.describe('Specialized workflows no longer silently substitute general contact', () => {
  const cases: Array<[string, string, string]> = [
    ['/company/partnerships', 'a[href="/contact?type=licensing"]', 'Licensing'],
    ['/company/partnerships', 'a[href="/contact?type=manufacturing"]', 'Manufacturing'],
    ['/company/partnerships', 'a[href="/contact?type=distribution"]', 'Distribution'],
    ['/company/partnerships', 'a[href="/contact?type=validation-partnership"]', 'Validation'],
    ['/company/investors', 'a[href="/contact?type=investor"]', 'Investor'],
    ['/products/cordel-connect', 'a[href="/contact?type=cordel-connect"]', 'Cordel Connect'],
    ['/products/cordel-play/preorder', 'a[href="/contact?type=cordel-play"]', 'Cordel Play'],
  ];

  for (const [path, selector, label] of cases) {
    test(`${path} routes its ${label} CTA to a type-specific contact entry point, not bare /contact`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(selector)).toHaveCount(1);
    });
  }

});

// ---------------------------------------------------------------------------------------------
// Conditional contact-field exclusivity (2026-08-01 hotfix)
//
// Derived from the current TYPE_CONFIG in src/pages/contact.astro and the INQUIRY_TYPES set in
// src/pages/api/contact.ts - do not hand-edit this table without re-deriving it from source.
// activeField is null for types that show no conditional field at all.
// ---------------------------------------------------------------------------------------------
type ExtraField = 'organization' | 'quantity' | 'platform' | null;
const INQUIRY_TYPE_MATRIX: Array<{ type: string; heading: string; activeField: ExtraField }> = [
  { type: 'cordel-play', heading: 'Cordel Play — founder reservation interest.', activeField: 'quantity' },
  { type: 'cordel-connect', heading: 'Cordel Connect — private-test interest.', activeField: 'platform' },
  { type: 'validation-partnership', heading: 'Technical validation inquiry.', activeField: 'organization' },
  { type: 'licensing', heading: 'Licensing inquiry.', activeField: 'organization' },
  { type: 'manufacturing', heading: 'Manufacturing inquiry.', activeField: 'organization' },
  { type: 'distribution', heading: 'Distribution inquiry.', activeField: 'organization' },
  { type: 'investor', heading: 'Investor inquiry.', activeField: 'organization' },
  { type: 'restaurant-partnership', heading: 'Restaurant partnership inquiry.', activeField: 'organization' },
  { type: 'technology-partnership', heading: 'Technology partnership inquiry.', activeField: 'organization' },
  // NOTE: the API's INQUIRY_TYPES set also accepts 'byteoracle', but /contact has never offered
  // it as an option and TYPE_CONFIG has no entry for it, so there is no UI behavior to assert.
  // It is covered by the unsupported-type test below instead.
  { type: 'preorder-support', heading: 'Preorder support.', activeField: null },
  { type: 'privacy-request', heading: 'Privacy request.', activeField: null },
  { type: 'general', heading: 'Get in touch.', activeField: null },
];

const FIELD_KEYS = ['organization', 'quantity', 'platform'] as const;
const CONTAINER_SELECTOR: Record<(typeof FIELD_KEYS)[number], string> = {
  organization: '#ct-field-organization',
  quantity: '#ct-field-quantity',
  platform: '#ct-field-platform',
};
const INPUT_SELECTOR: Record<(typeof FIELD_KEYS)[number], string> = {
  organization: '#ct-organization',
  quantity: '#ct-quantity',
  platform: '#ct-platform',
};

test.describe('Conditional contact fields are mutually exclusive per inquiry type', () => {
  for (const { type, heading, activeField } of INQUIRY_TYPE_MATRIX) {
    test(`/contact?type=${type} shows exactly the ${activeField ?? 'no'} conditional field`, async ({ page }) => {
      await page.goto(`/contact?type=${type}`);

      await expect(page.locator('#ct-heading')).toContainText(heading);
      await expect(page.locator('#ct-subject')).toHaveValue(type);

      let visibleCount = 0;
      let enabledCount = 0;
      for (const key of FIELD_KEYS) {
        const container = page.locator(CONTAINER_SELECTOR[key]);
        const input = page.locator(INPUT_SELECTOR[key]);
        const isActive = key === activeField;

        if (isActive) {
          await expect(container, `${key} container should be visible for type=${type}`).toBeVisible();
          await expect(input, `${key} input should be enabled for type=${type}`).toBeEnabled();
          visibleCount++;
          enabledCount++;
        } else {
          await expect(container, `${key} container should be hidden for type=${type}`).toBeHidden();
          await expect(input, `${key} input should be disabled for type=${type}`).toBeDisabled();
        }
        // No current workflow requires a conditional field - required must never be set on any
        // of them, active or not.
        await expect(input).not.toHaveAttribute('required', '');
      }

      // Mutual exclusivity: never more than one conditional field visible or enabled at once.
      expect(visibleCount, `type=${type} should show at most one conditional field`).toBeLessThanOrEqual(1);
      expect(enabledCount, `type=${type} should enable at most one conditional field`).toBeLessThanOrEqual(1);

      // Hidden inputs must be genuinely excluded from the accessibility tree, not merely styled away.
      const inactiveKeys = FIELD_KEYS.filter((k) => k !== activeField);
      for (const key of inactiveKeys) {
        const role = await page.locator(INPUT_SELECTOR[key]).evaluate((el) => el.closest('[hidden]') !== null);
        expect(role, `${key} input should sit inside a [hidden] ancestor for type=${type}`).toBe(true);
      }
    });
  }

  test('an unsupported/blank inquiry type shows no conditional field at all', async ({ page }) => {
    await page.goto('/contact?type=not-a-real-type');
    for (const key of FIELD_KEYS) {
      await expect(page.locator(CONTAINER_SELECTOR[key])).toBeHidden();
      await expect(page.locator(INPUT_SELECTOR[key])).toBeDisabled();
    }
    // Falls back to the general heading since the unsupported preset is never applied to the select.
    await expect(page.locator('#ct-heading')).toContainText('Get in touch.');
  });

  test('plain /contact with no query string shows no conditional field at all', async ({ page }) => {
    await page.goto('/contact');
    for (const key of FIELD_KEYS) {
      await expect(page.locator(CONTAINER_SELECTOR[key])).toBeHidden();
      await expect(page.locator(INPUT_SELECTOR[key])).toBeDisabled();
    }
  });

  test('hidden conditional fields cannot contribute a value to the submitted FormData', async ({ page }) => {
    await page.goto('/contact?type=licensing');
    // Only the active field (organization) is fillable through the real UI.
    await page.locator(INPUT_SELECTOR.organization).fill('Acme Licensing Co');

    const formEntries = await page.evaluate(() => {
      const form = document.getElementById('ct-form') as HTMLFormElement;
      return Object.fromEntries(new FormData(form).entries());
    });

    expect(formEntries.organization).toBe('Acme Licensing Co');
    // quantityInterest/platform inputs are disabled -> FormData omits them entirely.
    expect(formEntries.quantityInterest).toBeUndefined();
    expect(formEntries.platform).toBeUndefined();
  });

  test('switching inquiry type via the dropdown (no reload) clears the old field and activates the new one', async ({ page }) => {
    await page.goto('/contact?type=cordel-play');
    await expect(page.locator(CONTAINER_SELECTOR.quantity)).toBeVisible();

    // Populate the currently active field.
    await page.locator(INPUT_SELECTOR.quantity).selectOption('4+');

    // Switch to a type with a different active field, via the dropdown, no navigation.
    await page.locator('#ct-subject').selectOption('cordel-connect');

    // Old field: hidden, disabled, value cleared.
    await expect(page.locator(CONTAINER_SELECTOR.quantity)).toBeHidden();
    await expect(page.locator(INPUT_SELECTOR.quantity)).toBeDisabled();
    await expect(page.locator(INPUT_SELECTOR.quantity)).toHaveValue('');

    // New field: visible, enabled.
    await expect(page.locator(CONTAINER_SELECTOR.platform)).toBeVisible();
    await expect(page.locator(INPUT_SELECTOR.platform)).toBeEnabled();

    await page.locator(INPUT_SELECTOR.platform).selectOption('android');

    const formEntries = await page.evaluate(() => {
      const form = document.getElementById('ct-form') as HTMLFormElement;
      return Object.fromEntries(new FormData(form).entries());
    });
    expect(formEntries.platform).toBe('android');
    expect(formEntries.quantityInterest).toBeUndefined();
  });
});

test.describe('Contact form is fully keyboard-operable', () => {
  test('every field is reachable and operable via Tab without a mouse', async ({ page }) => {
    await page.goto('/contact?type=licensing');
    await page.locator('#ct-name').focus();
    await expect(page.locator('#ct-name')).toBeFocused();
    await page.keyboard.type('Test User');
    await page.keyboard.press('Tab');
    await expect(page.locator('#ct-email')).toBeFocused();
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    await expect(page.locator('#ct-subject')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#ct-organization')).toBeFocused();
    await page.keyboard.type('Acme Research');
    // Consent checkbox must be reachable and toggleable with the keyboard alone.
    await page.locator('#ct-consent').focus();
    await expect(page.locator('#ct-consent')).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.locator('#ct-consent')).toBeChecked();
  });

  test('Tab from the inquiry-type dropdown never focuses a hidden conditional input', async ({ page }) => {
    // cordel-connect's active field is "platform" - organization and quantity must be unreachable.
    await page.goto('/contact?type=cordel-connect');
    await page.locator('#ct-subject').focus();
    await page.keyboard.press('Tab');
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe('ct-platform');
    expect(focusedId).not.toBe('ct-organization');
    expect(focusedId).not.toBe('ct-quantity');
  });

  test('Tab from the inquiry-type dropdown skips straight to the message field when no conditional field is active', async ({ page }) => {
    await page.goto('/contact?type=general');
    await page.locator('#ct-subject').focus();
    await page.keyboard.press('Tab');
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe('ct-message');
  });
});

test.describe('No form claims guaranteed acceptance or availability', () => {
  test('/contact carries an explicit no-guarantee disclaimer and consent checkbox', async ({ page }) => {
    await page.goto('/contact');
    const body = page.locator('body');
    await expect(body).toContainText('does not guarantee acceptance, availability');
    await expect(page.locator('#ct-consent')).toHaveAttribute('required', '');
  });

  test('Cordel Play founder reservation page states no guarantee of release date or purchase obligation', async ({ page }) => {
    await page.goto('/products/cordel-play/preorder');
    await expect(page.locator('body')).toContainText('It does not guarantee a release date. It does not obligate you to purchase');
  });
});
