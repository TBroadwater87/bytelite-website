import { test, expect } from '@playwright/test';
import { ALL_PAGE_ROUTES, DISCOVERABLE_ROUTES, RETIRED_ROUTE_PREFIXES, routePathOfInternalHref } from './public-routes';

const KNOWN_ROUTES = new Set<string>(ALL_PAGE_ROUTES);

test.describe('Every internal link goes somewhere that exists', () => {
  for (const route of ALL_PAGE_ROUTES) {
    test(`${route} links only to live routes`, async ({ page }) => {
      await page.goto(route);
      const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
      const deadLinks = hrefs.filter((href) => {
        const linkPath = routePathOfInternalHref(href);
        const pointsAtRetiredRoute = RETIRED_ROUTE_PREFIXES.some((prefix) => linkPath === prefix || linkPath.startsWith(`${prefix}/`));
        return pointsAtRetiredRoute || !KNOWN_ROUTES.has(linkPath);
      });
      expect(deadLinks, `${route} links to routes that do not exist`).toEqual([]);
    });
  }

  test('every in-page fragment link on the milestones page has a target', async ({ page }) => {
    for (const route of ['/', '/validation']) {
      await page.goto(route);
      const fragments = await page
        .locator('a[href^="/research/milestones#"]')
        .evaluateAll((links) => links.map((link) => (link.getAttribute('href') ?? '').split('#')[1] ?? ''));
      await page.goto('/research/milestones');
      for (const fragment of fragments) {
        await expect(page.locator(`[id="${fragment}"]`), `${route} links to a missing milestone #${fragment}`).toHaveCount(1);
      }
    }
  });

  test('the header and footer carry every discoverable section', async ({ page }) => {
    await page.goto('/');
    const chromeHrefs = await page
      .locator('header a[href^="/"], footer a[href^="/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    const chromePaths = new Set(chromeHrefs.map(routePathOfInternalHref));
    for (const route of DISCOVERABLE_ROUTES) {
      expect(chromePaths.has(route), `${route} is not reachable from the header or footer`).toBe(true);
    }
  });
});

test.describe('The commerce surface tells the truth', () => {
  test('no page prints a price', async ({ page }) => {
    for (const route of DISCOVERABLE_ROUTES) {
      await page.goto(route);
      const text = (await page.locator('main').innerText()) ?? '';
      expect(text, `${route} prints a currency amount`).not.toMatch(/\$\s?\d/);
    }
  });

  test('the two founder benefits are never collapsed into one number', async ({ page }) => {
    await page.goto('/founder-access');
    const body = page.locator('body');
    await expect(body).toContainText('10% lower founder price');
    await expect(body).toContainText('10% additional qualifying entitlement');
    const text = ((await body.innerText()) ?? '').toLowerCase();
    expect(text).toContain('do not add up to 20% off');
    for (const affirmative of ['get 20% off', 'save 20%', 'you get 20%', '20% discount']) {
      expect(text).not.toContain(affirmative);
    }
  });

  test('every founder control is disabled and explains why', async ({ page }) => {
    await page.goto('/founder-access');
    const buttons = page.locator('.founder-button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    for (let index = 0; index < buttonCount; index++) {
      const button = buttons.nth(index);
      await expect(button).toBeDisabled();
      const reasonId = await button.getAttribute('aria-describedby');
      expect(reasonId, 'a disabled control must point at its reason').toBeTruthy();
      await expect(page.locator(`[id="${reasonId}"]`)).toContainText('Switched off');
    }
    await expect(page.locator('[data-plan]')).toHaveCount(0);
  });

  test('a reservation is never described as an active subscription', async ({ page }) => {
    await page.goto('/founder-access');
    const body = page.locator('body');
    await expect(body).toContainText('It would not be a subscription, an account or product access');
    await expect(body).toContainText('you would be shown the exact amount');
  });

  test('the party game is never sold as a subscription or by paid preorder', async ({ page }) => {
    await page.goto('/cordel-play');
    const body = page.locator('body');
    await expect(body).toContainText('It is not a subscription');
    await expect(body).toContainText('is not taking paid preorders');
    await expect(body).toContainText('within 30 days if no time is stated');
    await expect(body).toContainText('18 or over');
    const text = ((await body.innerText()) ?? '').toLowerCase();
    expect(text).not.toContain('monthly plan');
  });

  test('product renderings are labelled as concept renderings, never photographs', async ({ page }) => {
    await page.goto('/cordel-play');
    const figures = page.locator('figure:has(img)');
    expect(await figures.count()).toBeGreaterThan(0);
    for (const classification of await figures.evaluateAll((items) => items.map((item) => item.getAttribute('data-figure-classification')))) {
      expect(classification).toBe('Product concept rendering');
    }
  });

  test('the Supporter Pack never solicits a donation and states its limits', async ({ page }) => {
    await page.goto('/support');
    const body = page.locator('body');
    const text = ((await body.innerText()) ?? '').toLowerCase();
    for (const solicitation of ['donate', 'make a donation', 'your donation', 'donation helps', 'tax-deductible']) {
      expect(text).not.toContain(solicitation);
    }
    await expect(body).toContainText('not a charitable donation');
    await expect(body).toContainText('not tax deductible');
    for (const phrase of ['equity', 'repayment', 'Ownership', 'Access to any product']) {
      await expect(body).toContainText(phrase);
    }
  });

  test('the Supporter Pack disclosure precedes its disabled purchase control', async ({ page }) => {
    await page.goto('/support');
    const purchaseButton = page.locator('.purchase-button');
    await expect(purchaseButton).toBeDisabled();
    await expect(purchaseButton).toHaveText('Not on sale');
    const disclosurePrecedesButton = await page.evaluate(() => {
      const disclosure = document.querySelector('.notice-caution');
      const button = document.querySelector('.purchase-button');
      if (!disclosure || !button) return false;
      return Boolean(disclosure.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(disclosurePrecedesButton).toBe(true);
  });

  test('the cancel page states that nothing was created', async ({ page }) => {
    await page.goto('/checkout/cancel');
    await expect(page.locator('body')).toContainText('No payment was taken');
    await expect(page.locator('body')).toContainText('no subscription or reservation was created');
  });

  test('the success page confirms nothing without server verification', async ({ page }) => {
    await page.route('**/api/checkout-session**', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"not configured"}' }));
    await page.goto('/checkout/success?session_id=cs_test_obviously_not_real_reference');
    await expect(page.locator('#checkout-failure')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Payment received.');
    await expect(page.locator('body')).not.toContainText('Reservation recorded.');
  });

  test('the success page confirms nothing when opened without a reference', async ({ page }) => {
    await page.goto('/checkout/success');
    await expect(page.locator('#checkout-failure')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Payment received.');
  });

  test('no page offers an investment', async ({ page }) => {
    for (const route of DISCOVERABLE_ROUTES) {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of ['invest now', 'buy shares', 'purchase equity', 'expected return', 'guaranteed return']) {
        expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
      }
    }
  });
});

test.describe('Layout and presentation regressions', () => {
  test('every cognition stage keeps its text and status inside its card', async ({ page }) => {
    await page.goto('/research/machine-cognition');
    const cardsWithEscapingContent = await page.locator('.process-step').evaluateAll((cards) =>
      cards.filter((card) => {
        const cardRight = card.getBoundingClientRect().right;
        return Array.from(card.children).some((child) => child.getBoundingClientRect().right > cardRight + 0.5);
      }).length,
    );
    expect(cardsWithEscapingContent).toBe(0);
  });

  test('a phone visitor can jump straight to the contact form', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/contact');
    await page.locator('.contact-jump').click();
    await expect(page.locator('#contact-name')).toBeInViewport();
  });

  test('milestone summaries show their status without opening a disclosure', async ({ page }) => {
    await page.goto('/research/data-representation');
    const summary = page.locator('.milestone-summary', { hasText: 'Measured net size reduction' });
    await expect(summary.locator('.status-badge')).toBeVisible();
    await expect(summary.locator('.status-badge')).toContainText('Not yet demonstrated');
  });

  test('a milestone that has not reached testing does not use the tested colour', async ({ page }) => {
    await page.goto('/research/data-representation');
    const untestedTrack = page.locator('.milestone-summary', { hasText: 'Measured net size reduction' }).locator('.stage-track');
    await expect(untestedTrack).toHaveClass(/stage-track-untested/);
    await expect(page.locator('.milestone-summary', { hasText: 'Exact reconstruction' }).locator('.stage-track')).not.toHaveClass(/stage-track-untested/);
  });

  test('the footer offers no billing link while no customer portal is configured', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer a[href="/billing"]')).toHaveCount(0);
  });

  test('milestone details stay reachable through a native disclosure', async ({ page }) => {
    await page.goto('/research/milestones');
    const firstCard = page.locator('article.milestone').first();
    await expect(firstCard.locator('.milestone-facts')).toBeHidden();
    await firstCard.locator('details.more > summary').click();
    await expect(firstCard.locator('.milestone-facts')).toBeVisible();
  });

  test('founder cards for the personal service link to the proposed models, not the top of licensing', async ({ page }) => {
    await page.goto('/founder-access');
    const licensingLinks = page.locator('a[href^="/licensing"]', { hasText: 'What this is' });
    await expect(licensingLinks).not.toHaveCount(0);
    for (const href of await licensingLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
      expect(href).toBe('/licensing#models-heading');
    }
  });

  test('the four partnership routes never leave one card alone on a row', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/licensing');
    const routeRowTops = await page.locator('article.route').evaluateAll((routes) =>
      routes.map((route) => Math.round(route.getBoundingClientRect().top)),
    );
    expect(routeRowTops).toHaveLength(4);
    const cardsPerRow = [...new Set(routeRowTops)].map((top) => routeRowTops.filter((rowTop) => rowTop === top).length);
    expect(cardsPerRow.every((count) => count !== 1)).toBe(true);
  });
});

test.describe('Every page runs without browser errors', () => {
  for (const route of ALL_PAGE_ROUTES) {
    test(`${route} loads with no console error and no uncaught exception`, async ({ page }) => {
      const browserErrors: string[] = [];
      page.on('pageerror', (uncaughtException) => browserErrors.push(`uncaught: ${uncaughtException.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
      });
      await page.goto(route, { waitUntil: 'networkidle' });
      expect(browserErrors, `${route} reported browser errors`).toEqual([]);
    });
  }
});

test.describe('Contact refuses to overpromise', () => {
  test('the form states it creates no agreement and offers no securities for investor inquiries', async ({ page }) => {
    await page.goto('/contact?type=investor');
    const body = page.locator('body');
    await expect(body).toContainText('does not create any agreement');
    await expect(page.locator('[data-inquiry-hint]')).toContainText('does not offer or sell securities');
    await expect(body).not.toContainText('temporarily unavailable');
  });
});
