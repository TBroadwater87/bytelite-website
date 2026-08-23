import { test, expect } from '@playwright/test';

// Two billing models, two different economic contexts. The contract these tests protect is that a
// PERSONAL visitor can never reasonably conclude they owe a percentage of savings, and a BUSINESS
// visitor can never mistake the target example for a demonstrated result.

const PRICING_ROUTES = ['/', '/licensing'];
const ALL_PUBLIC = [
  '/',
  '/how-it-works',
  '/validation',
  '/licensing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

test.describe('Personal plan', () => {
  for (const route of PRICING_ROUTES) {
    test(`${route} shows the monthly and annual price`, async ({ page }) => {
      await page.goto(route);
      const card = page.locator('.pm-personal');
      await expect(card).toBeVisible();
      await expect(card).toContainText('$9.99');
      await expect(card).toContainText('/ month');
      await expect(card).toContainText('$99.99');
      await expect(card).toContainText('/ year');
    });

    test(`${route} shows the annual saving and its arithmetic`, async ({ page }) => {
      await page.goto(route);
      const card = page.locator('.pm-personal');
      // 12 x 9.99 = 119.88; 119.88 - 99.99 = 19.89. All three numbers must be on the page so the
      // claim is checkable by the reader, not just asserted.
      await expect(card).toContainText('$119.88');
      await expect(card).toContainText('$19.89');
    });

    test(`${route} states the personal plan carries no savings-share fee`, async ({ page }) => {
      await page.goto(route);
      const card = page.locator('.pm-personal');
      await expect(card).toContainText('No percentage-of-savings fee.');
      await expect(card).toContainText('does not change with the size of a file');
      // The personal card must never carry the 50/50 language.
      const cardText = ((await card.innerText()) ?? '').toLowerCase();
      expect(cardText).not.toContain('50/50');
      expect(cardText).not.toContain('50% of verified');
    });

    test(`${route} qualifies usage without promising unlimited`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('.pm-personal')).toContainText(
        'Subject to reasonable personal-use and service-capacity limits.'
      );
    });
  }

  test('no public page promises unlimited processing', async ({ page }) => {
    for (const route of ALL_PUBLIC) {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      expect(text, `${route} must not promise unlimited`).not.toContain('unlimited');
    }
  });

  test('no public page invents a specific size or byte cap', async ({ page }) => {
    for (const route of PRICING_ROUTES) {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of ['gb per month', 'tb per month', 'gb/month', 'max file size', 'up to 100 gb']) {
        expect(text, `${route} must not invent "${phrase}"`).not.toContain(phrase);
      }
    }
  });
});

test.describe('Business model', () => {
  for (const route of PRICING_ROUTES) {
    test(`${route} shows the 50% verified-savings model and the customer's other half`, async ({ page }) => {
      await page.goto(route);
      const card = page.locator('.pm-business');
      await expect(card).toBeVisible();
      await expect(card).toContainText('50%');
      await expect(card).toContainText('of verified qualifying savings');
      await expect(card).toContainText('The customer retains the other');
      await expect(card).toContainText('No verified qualifying saving means no savings-share fee');
    });
  }

  test('the two models are presented as billing models, not feature tiers', async ({ page }) => {
    await page.goto('/licensing');
    await expect(page.locator('.pm-kind-personal')).toContainText('Flat subscription');
    await expect(page.locator('.pm-kind-business')).toContainText('Value-based licensing');
    // Tier vocabulary would frame these as better/worse rather than different.
    const text = ((await page.locator('.pm').innerText()) ?? '').toLowerCase();
    for (const tierWord of ['basic', 'premium', 'pro plan', 'most popular', 'best value', 'upgrade to']) {
      expect(text, `pricing must not use tier framing "${tierWord}"`).not.toContain(tierWord);
    }
  });
});

test.describe('Target economic example', () => {
  test('renders the full target chain with both rates', async ({ page }) => {
    await page.goto('/licensing');
    const fig = page.locator('.ss');
    await expect(fig).toContainText('$1,000');
    await expect(fig).toContainText('$100');
    await expect(fig).toContainText('$900');
    await expect(fig).toContainText('90% of baseline');
    await expect(fig).toContainText('$450');
    await expect(fig).toContainText('$550');
    await expect(fig).toContainText('45% of baseline');
  });

  test('is badged as a target and scoped to business before any figure', async ({ page }) => {
    await page.goto('/licensing');
    await expect(page.locator('.ss-illustrative')).toContainText(
      'Target economic example — not a current performance claim'
    );
    await expect(page.locator('.ss-scope')).toContainText(
      'Personal subscriptions are flat-rate and are not billed this way'
    );
    const badgeFirst = await page.evaluate(() => {
      const badge = document.querySelector('.ss-illustrative');
      const firstFigure = document.querySelector('.ss-cost-value');
      if (!badge || !firstFigure) return false;
      return !!(badge.compareDocumentPosition(firstFigure) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(badgeFirst, 'the target badge must precede the first currency figure').toBe(true);
  });

  test('the target example does not appear on the homepage, where it has no business context', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.ss')).toHaveCount(0);
  });
});

test.describe('Consumer surprise-billing risk', () => {
  test('no public page implies every ByteLite user pays a share of savings', async ({ page }) => {
    for (const route of ALL_PUBLIC) {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of [
        'all users pay 50',
        'every user pays 50',
        'every customer pays 50',
        'all customers pay 50',
        'you pay half of your savings',
      ]) {
        expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  test('the balance and auto-reload model is scoped to business accounts only', async ({ page }) => {
    await page.goto('/licensing');
    await expect(page.locator('.bal-scope')).toContainText('Business savings-share accounts only');
    await expect(page.locator('.bal-scope')).toContainText('Personal subscriptions bill monthly or annually');
  });

  test('the licensing page separates the personal and business models into distinct sections', async ({ page }) => {
    await page.goto('/licensing');
    const body = page.locator('body');
    await expect(body).toContainText('Personal use is a flat subscription.');
    await expect(body).toContainText('Business licensing shares verified savings.');
    await expect(body).toContainText('There is no savings-share fee on a personal subscription');
  });
});

test.describe('Pricing layout on mobile', () => {
  test('both models stack and stay readable at 390px with no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of PRICING_ROUTES) {
      await page.goto(route);
      await page.waitForLoadState('load');
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      });

      const m = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.pm-card'));
        const grid = document.querySelector('.pm');
        const gridRect = grid?.getBoundingClientRect();
        return {
          cards: cards.length,
          stacked: cards.length === 2
            ? Math.abs((cards[0] as HTMLElement).getBoundingClientRect().left -
                (cards[1] as HTMLElement).getBoundingClientRect().left) < 1 &&
              (cards[0] as HTMLElement).getBoundingClientRect().bottom <=
                (cards[1] as HTMLElement).getBoundingClientRect().top + 1
            : false,
          withinViewport: gridRect ? gridRect.right <= window.innerWidth + 1 : false,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });
      expect(m.cards, `${route} should render both pricing cards`).toBe(2);
      expect(m.stacked, `${route} pricing cards should stack on mobile`).toBe(true);
      expect(m.withinViewport, `${route} pricing grid should fit the viewport`).toBe(true);
      expect(m.scrollWidth - m.clientWidth, `${route} must not scroll horizontally`).toBeLessThanOrEqual(1);
    }
  });

  test('prices stay legible rather than truncated at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/licensing');
    await page.waitForLoadState('load');
    const amounts = await page.locator('.pm-amount').allInnerTexts();
    expect(amounts).toContain('$9.99');
    expect(amounts).toContain('$99.99');
    expect(amounts).toContain('50%');
    const clipped = await page.locator('.pm-amount').evaluateAll((els) =>
      els.filter((e) => e.scrollWidth > e.clientWidth + 1).length
    );
    expect(clipped, 'no price may be visually clipped').toBe(0);
  });
});
