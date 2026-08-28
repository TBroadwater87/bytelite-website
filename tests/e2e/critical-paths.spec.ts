import { test, expect } from '@playwright/test';

// Critical paths, rewritten 2026-08-26. Two jobs:
//   1. every internal link on a public page reaches a page that still exists;
//   2. the commerce surface is honest - no working checkout for an unapproved product, and no
//      page that calls a reservation a subscription.

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/validation',
  '/licensing',
  '/about',
  '/contact',
  '/founder-access',
  '/support',
  '/cordel-connect',
  '/cordel-play',
  '/privacy',
  '/terms',
  '/preorder-terms',
  '/supporter-terms',
];

// Routes that resolve but are deliberately absent from discovery.
const UNDISCOVERABLE_BUT_VALID = ['/checkout/success', '/checkout/cancel', '/billing', '/responsible-disclosure'];

// The route families deleted in the rebuild. A link to any of them is a dead link, even though
// production rewrites them - a redirect is for inbound traffic, not for our own navigation.
const DELETED_PREFIXES = [
  '/architecture',
  '/research',
  '/progress',
  '/technologies',
  '/company',
  '/preorder/',
  '/products',
  '/marketing',
];

test.describe('Every internal link goes somewhere that exists', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} links only to live routes`, async ({ page }) => {
      await page.goto(route);
      const hrefs = await page
        .locator('a[href^="/"]')
        .evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));

      const known = new Set([...PUBLIC_ROUTES, ...UNDISCOVERABLE_BUT_VALID]);
      const dead: string[] = [];

      for (const href of hrefs) {
        const path = href.split('#')[0]!.split('?')[0]!.replace(/\/$/, '') || '/';
        if (DELETED_PREFIXES.some((p) => path === p.replace(/\/$/, '') || path.startsWith(p))) {
          dead.push(href);
          continue;
        }
        if (!known.has(path)) dead.push(href);
      }

      expect(dead, `${route} links to routes that no longer exist`).toEqual([]);
    });
  }

  test('the header and footer carry no link into a deleted family', async ({ page }) => {
    await page.goto('/');
    const chrome = await page
      .locator('header a[href^="/"], footer a[href^="/"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
    const leaks = chrome.filter((h) => DELETED_PREFIXES.some((p) => h.startsWith(p)));
    expect(leaks, 'navigation still points at a deleted family').toEqual([]);
  });
});

test.describe('The commerce surface tells the truth', () => {
  test('no product claims a price that has not been approved', async ({ page }) => {
    await page.goto('/founder-access');
    const text = (await page.locator('body').innerText()) ?? '';
    // The ONLY prices allowed anywhere are the decided public ByteLite ones, and they live on
    // /licensing. Founder access must not print a computed founder price.
    expect(text).not.toMatch(/\$8\.99/);
    expect(text).not.toMatch(/\$89\.99/);
    expect(text).not.toMatch(/\$8\.991/);
  });

  test('the two founder benefits are never collapsed into one number', async ({ page }) => {
    for (const route of ['/founder-access', '/preorder-terms']) {
      await page.goto(route);
      const body = page.locator('body');
      // Both benefits stated separately, in their canonical wording.
      await expect(body).toContainText('10% lower founder price');
      await expect(body).toContainText('10% additional qualifying entitlement');

      // "20% off" cannot be tested by absence: the approved DENIAL contains the same substring.
      // (Same trap the 50%-savings rule hit on /licensing.) So assert the denial is present, and
      // separately ban the affirmative framings that would actually mislead someone.
      const text = ((await body.innerText()) ?? '').toLowerCase();
      expect(text, `${route} must deny the 20% reading explicitly`).toContain('do not add up to 20% off');
      for (const affirmative of ['get 20% off', 'save 20%', 'you get 20%', '20% discount']) {
        expect(text, `${route} must not offer "${affirmative}"`).not.toContain(affirmative);
      }
    }
  });

  test('Cordel Play is never sold as a subscription', async ({ page }) => {
    await page.goto('/cordel-play');
    const body = page.locator('body');
    await expect(body).toContainText('It is not a subscription');
    const text = ((await body.innerText()) ?? '').toLowerCase();
    expect(text).not.toContain('subscribe to cordel play');
    expect(text).not.toContain('monthly plan');
  });

  test('Cordel Play states the shipping rule that stops a paid preorder', async ({ page }) => {
    await page.goto('/cordel-play');
    const body = page.locator('body');
    await expect(body).toContainText('I am not taking paid preorders');
    await expect(body).toContainText('within 30 days if no time is stated');
  });

  test('the Supporter Pack is never called a donation', async ({ page }) => {
    for (const route of ['/support', '/supporter-terms']) {
      await page.goto(route);
      const body = page.locator('body');
      const text = ((await body.innerText()) ?? '').toLowerCase();

      // The requirement is that the page never SOLICITS a donation or implies deductibility.
      // Counting the word does not work: the pages legitimately deny it more than once, in
      // different wordings, and a denial is the opposite of the problem.
      for (const solicitation of [
        'donate',
        'make a donation',
        'your donation',
        'donation helps',
        'tax deductible donation',
        'tax-deductible',
      ]) {
        expect(text, `${route} must not solicit or imply "${solicitation}"`).not.toContain(solicitation);
      }

      // And the denial must actually be on the page.
      await expect(body).toContainText('not a charitable donation');
      await expect(body).toContainText('not tax deductible');
    }
  });

  test('the Supporter Pack disclosure sits next to the purchase control', async ({ page }) => {
    await page.goto('/support');
    await expect(page.locator('.disclosure')).toContainText('is not a charitable donation and is not tax deductible');
    // The disclosure must PRECEDE the button in document order.
    const ok = await page.evaluate(() => {
      const d = document.querySelector('.disclosure');
      const b = document.querySelector('.buy-btn');
      if (!d || !b) return false;
      return !!(d.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(ok, 'the disclosure must appear before the purchase control').toBe(true);
  });

  test('the Supporter Pack denies equity, access and repayment explicitly', async ({ page }) => {
    await page.goto('/supporter-terms');
    const body = page.locator('body');
    for (const phrase of ['equity', 'repayment', 'ownership', 'product access']) {
      await expect(body).toContainText(phrase);
    }
  });

  test('a reservation is never described as an active subscription', async ({ page }) => {
    await page.goto('/founder-access');
    const body = page.locator('body');
    await expect(body).toContainText('It is not a subscription, not an account, and not product access.');
    await expect(body).toContainText('you will be shown the exact amount');
  });

  test('the cancel page states plainly that nothing was created', async ({ page }) => {
    await page.goto('/checkout/cancel');
    await expect(page.locator('body')).toContainText('No payment was taken');
    await expect(page.locator('body')).toContainText('no subscription was created');
  });

  // The success page must claim nothing before the server answers. Opening it with a junk
  // reference must not produce a confirmation.
  test('the success page confirms nothing without server verification', async ({ page }) => {
    await page.goto('/checkout/success?session_id=cs_test_obviously_not_real_reference');
    const body = page.locator('body');
    await expect(body).not.toContainText('Payment received.');
    await expect(body).not.toContainText('Reservation recorded.');
  });

  test('the success page confirms nothing when opened with no reference at all', async ({ page }) => {
    await page.goto('/checkout/success');
    await expect(page.locator('#sx-fail')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Payment received.');
  });
});

test.describe('Contact still works and still refuses to overpromise', () => {
  test('the contact form neither advertises a false outage nor overpromises', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('.ct-outage')).toHaveCount(0);
    const body = page.locator('body');
    await expect(body).not.toContainText('temporarily unavailable');
    await expect(body).toContainText('does not guarantee acceptance');
  });
});
