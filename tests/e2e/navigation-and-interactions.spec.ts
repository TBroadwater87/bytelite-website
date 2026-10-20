import { test, expect } from '@playwright/test';

test.describe('Desktop navigation', () => {
  test.use({ viewport: { width: 1366, height: 900 } });

  test('the research menu opens, lists every research page and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const groupToggle = page.locator('[data-group-toggle]');
    const groupMenu = page.locator('#research-menu');
    await expect(groupToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(groupMenu).toBeHidden();
    await groupToggle.click();
    await expect(groupToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(groupMenu).toBeVisible();
    await expect(groupMenu.locator('a')).toHaveCount(6);
    await page.keyboard.press('Escape');
    await expect(groupToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(groupMenu).toBeHidden();
    await expect(groupToggle).toBeFocused();
  });

  test('a research menu link navigates to its page', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-group-toggle]').click();
    await page.locator('#research-menu a', { hasText: 'Machine Cognition' }).click();
    await expect(page).toHaveURL(/\/research\/machine-cognition$/);
    await expect(page.locator('h1')).toHaveText('Governed machine cognition.');
  });

  test('clicking outside closes the research menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-group-toggle]').click();
    await page.locator('h1').click();
    await expect(page.locator('[data-group-toggle]')).toHaveAttribute('aria-expanded', 'false');
  });

  test('the current section is marked', async ({ page }) => {
    await page.goto('/research/milestones');
    await expect(page.locator('.navigation-link.is-current')).toHaveText('Research');
    await page.goto('/products');
    await expect(page.locator('.navigation-link[aria-current="page"]')).toHaveText('Products');
  });
});

test.describe('Mobile navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('the menu toggle reveals the navigation and Escape closes it', async ({ page }) => {
    await page.goto('/');
    const menuToggle = page.locator('[data-menu-toggle]');
    const navigation = page.locator('#site-navigation');
    await expect(menuToggle).toBeVisible();
    await expect(navigation).toBeHidden();
    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(navigation).toBeVisible();
    await expect(navigation.locator('a', { hasText: 'Products' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation).toBeHidden();
  });

  test('the research pages are reachable from the mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-menu-toggle]').click();
    await page.locator('[data-group-toggle]').click();
    await page.locator('#research-menu a', { hasText: 'Research Milestones' }).click();
    await expect(page).toHaveURL(/\/research\/milestones$/);
  });
});

test.describe('Milestone filter', () => {
  test('filtering shows one program at a time and announces the change', async ({ page }) => {
    await page.goto('/research/milestones');
    const filter = page.locator('[data-milestone-filter]');
    await expect(filter).toBeVisible();
    await filter.locator('button', { hasText: 'Data Representation' }).click();
    await expect(filter.locator('button', { hasText: 'Data Representation' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-program-section="data-representation"]')).toBeVisible();
    await expect(page.locator('[data-program-section="machine-cognition"]')).toBeHidden();
    await expect(page.locator('[data-filter-status]')).toHaveText('Showing Data Representation.');
    await filter.locator('button', { hasText: 'All programs' }).click();
    await expect(page.locator('[data-program-section="machine-cognition"]')).toBeVisible();
  });

  test('every milestone shows what is and is not demonstrated', async ({ page }) => {
    await page.goto('/research/milestones');
    const milestones = page.locator('article.milestone');
    const milestoneCount = await milestones.count();
    expect(milestoneCount).toBeGreaterThan(10);
    for (let index = 0; index < milestoneCount; index++) {
      await expect(milestones.nth(index).locator('.milestone-columns > div:first-child li').first()).toBeVisible();
      await expect(milestones.nth(index).locator('.milestone-columns > div:last-child li').first()).toBeVisible();
      await expect(milestones.nth(index).locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

test.describe('Contact form', () => {
  test('a type link preselects the inquiry and reveals the organization field', async ({ page }) => {
    await page.goto('/contact?type=validation-partnership');
    await expect(page.locator('#contact-inquiry-type')).toHaveValue('validation-partnership');
    await expect(page.locator('#contact-organization')).toBeVisible();
    await page.locator('#contact-inquiry-type').selectOption('general');
    await expect(page.locator('#contact-organization-field')).toBeHidden();
  });

  test('an incomplete form is not submitted', async ({ page }) => {
    let contactRequests = 0;
    await page.route('**/api/contact', (route) => {
      contactRequests += 1;
      return route.fulfill({ status: 500 });
    });
    await page.goto('/contact');
    await page.locator('button[type="submit"]').click();
    expect(contactRequests).toBe(0);
  });

  test('a valid submission sends only the server contract fields and reports success honestly', async ({ page }) => {
    let submittedBody: Record<string, unknown> = {};
    await page.route('**/api/contact', async (route) => {
      submittedBody = JSON.parse(route.request().postData() ?? '{}');
      expect(route.request().headers()['content-type']).toBe('application/json');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/contact?type=licensing');
    await page.locator('#contact-name').fill('Test Reviewer');
    await page.locator('#contact-email').fill('reviewer@example.com');
    await page.locator('#contact-organization').fill('Example Organization');
    await page.locator('#contact-message').fill('A message used only by the automated interface test.');
    await page.locator('#contact-consent').check();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#contact-status')).toHaveText('Message sent. This confirms it was sent, not that any request has been accepted.');
    expect(Object.keys(submittedBody).sort()).toEqual(['email', 'inquiryType', 'message', 'name', 'organization']);
    expect(submittedBody.inquiryType).toBe('licensing');
  });

  test('a server refusal is reported as not sent', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Contact delivery is not configured."}' }),
    );
    await page.goto('/contact');
    await page.locator('#contact-name').fill('Test Reviewer');
    await page.locator('#contact-email').fill('reviewer@example.com');
    await page.locator('#contact-inquiry-type').selectOption('general');
    await page.locator('#contact-message').fill('A message used only by the automated interface test.');
    await page.locator('#contact-consent').check();
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#contact-status')).toHaveText('Contact delivery is not configured.');
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});
