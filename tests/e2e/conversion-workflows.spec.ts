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

  test('/contact preselects and relabels the form when a type is specified', async ({ page }) => {
    await page.goto('/contact?type=investor');
    await expect(page.locator('#ct-subject')).toHaveValue('investor');
    await expect(page.locator('#ct-heading')).toContainText('Investor inquiry');
    await expect(page.locator('#ct-field-organization')).toBeVisible();
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
