import { test, expect } from '@playwright/test';

// Owner Law guard. The eight discoverable routes must:
//   * keep ByteLite's ARCHITECTURAL TARGET and its CURRENT PROOF STATUS distinct in both
//     directions - never narrowing the target, never completing the proof;
//   * never name a sibling ByteLite LLC system;
//   * never expose internal implementation vocabulary or development plumbing.
// Everything is checked against rendered text, not source, so a phrase that reaches the page
// through src/data/ is caught the same as one typed into a page.

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/validation',
  '/licensing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

// Sibling systems and products. None of these is ByteLite, so none belongs on a ByteLite page.
const PORTFOLIO_NAMES = [
  'Deep Kore',
  'DeepKore',
  'KoreLattice',
  'ByteSight',
  'ByteOracle',
  'ByteFlow',
  'ByteCost',
  'AIya',
  'Aion',
  'Genesis Goalkeeper',
  'Revelation Vanguard',
  'Cordel Connect',
  'Cordel Play',
  'HeartStrings',
  'Heartstrings',
];

// Internal implementation vocabulary and development plumbing. `.root` is deliberately absent:
// naming the target artifact is owner-approved public wording, and says nothing about how the
// representation inside it is built.
//
// Terms that are a substring of an ordinary English word need a word boundary, not a substring
// match: "Ogram" lowercased is inside "program", which appears legitimately in the legal pages.
const INTERNAL_TERM_PATTERNS = [/\bograms?\b/i, /\bbnr\b/i];

const INTERNAL_TERMS = [
  'opcode',
  'motion program',
  'single-motion reset',
  'switch law',
  'RAW law',
  'Foundation implementation',
  'Sigma-9',
  'Szudzik',
  'library generator',
  'library selection',
  'library of libraries',
  'root-of-roots',
  'root of roots',
  'sidecar compaction',
  'recursive metadata integration',
  'generator table',
  'carrier format',
  'workbench',
  'node_modules',
  'localhost',
  'D:\\',
  'C:\\',
];

for (const route of PUBLIC_ROUTES) {
  test(`${route} names no sibling ByteLite LLC system`, async ({ page }) => {
    await page.goto(route);
    const text = (await page.locator('body').innerText()) ?? '';
    for (const name of PORTFOLIO_NAMES) {
      expect(text, `${route} must not name ${name}`).not.toContain(name);
    }
  });

  test(`${route} exposes no internal vocabulary or build plumbing`, async ({ page }) => {
    await page.goto(route);
    const raw = (await page.locator('body').innerText()) ?? '';
    const text = raw.toLowerCase();
    for (const term of INTERNAL_TERMS) {
      expect(text, `${route} must not contain "${term}"`).not.toContain(term.toLowerCase());
    }
    for (const pattern of INTERNAL_TERM_PATTERNS) {
      expect(raw, `${route} must not match ${pattern}`).not.toMatch(pattern);
    }
  });
}

test.describe('The architectural target is never narrowed', () => {
  // These are the sentences that would understate what ByteLite is being built to do. The owner
  // law forbids all of them: the target is every eligible source file.
  const NARROWING = [
    'only expects structured files to shrink',
    'only structured files',
    'structured files only',
    'random files are inherently expected not to shrink',
    'random data cannot be compressed',
    'only intended to find savings in some classes',
    'does not promise that every file shrinks',
    'no such structure',
    'has no lawful reusable structure',
  ];

  for (const route of PUBLIC_ROUTES) {
    test(`${route} does not narrow the target to structured data`, async ({ page }) => {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of NARROWING) {
        expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
      }
    });
  }

  test('the target is stated as every eligible source file', async ({ page }) => {
    for (const route of ['/', '/validation']) {
      await page.goto(route);
      await expect(page.locator('body')).toContainText('for every eligible source file');
    }
  });
});

test.describe('The proof is never overstated', () => {
  const OVERCLAIM = [
    'has proven universal compression',
    'universal shrink is complete',
    'proven that every file shrinks',
    'all random data has been proven smaller',
    'universally compresses every file',
    'independently verified result',
    'third-party verified',
    'peer reviewed',
    'production qualified',
    'shannon does not apply',
    'defeated information theory',
    'disproven all compression limits',
  ];

  for (const route of PUBLIC_ROUTES) {
    test(`${route} makes no completed-proof or information-theory claim`, async ({ page }) => {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of OVERCLAIM) {
        expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
      }
    });
  }

  test('universal shrink is labelled a target, not a proof', async ({ page }) => {
    for (const route of ['/', '/validation']) {
      await page.goto(route);
      await expect(page.locator('body')).toContainText(
        'Universal shrink is a research target, not a completed public proof.'
      );
    }
  });

  test('the validation page states that nothing is independently verified', async ({ page }) => {
    await page.goto('/validation');
    await expect(page.locator('body')).toContainText('None of it has been independently verified.');
  });
});

test.describe('Current development state is stated honestly', () => {
  test('the homepage carries a current-status box with both columns', async ({ page }) => {
    await page.goto('/');
    const box = page.locator('.cs');
    await expect(box).toBeVisible();
    await expect(box).toContainText('Currently');
    await expect(box).toContainText('Still required');
    await expect(box).toContainText('Compact required reconstruction state');
    await expect(box).toContainText('A fully self-contained final artifact');
  });

  test('the proof scaffold is described as a scaffold, not the final artifact', async ({ page }) => {
    for (const route of ['/', '/how-it-works']) {
      await page.goto(route);
      const body = page.locator('body');
      await expect(body).toContainText('explicit reconstruction evidence');
      await expect(body).toContainText('research scaffold, not the intended final artifact');
    }
  });

  test('the self-contained final target is stated', async ({ page }) => {
    for (const route of ['/', '/how-it-works']) {
      await page.goto(route);
      await expect(page.locator('body')).toContainText(
        'include all information required for exact reconstruction inside the self-contained counted representation'
      );
    }
  });

  test('the current-vs-final graphic shows both columns and no bridging mechanism', async ({ page }) => {
    await page.goto('/how-it-works');
    const fig = page.locator('.cf').first();
    await expect(fig).toContainText('Development proof scaffold');
    await expect(fig).toContainText('All required reconstruction information included');
    await expect(fig).toContainText('Self-contained artifact (.root)');
    // Exactly two columns and nothing drawn between them: the transition is the private part.
    await expect(fig.locator('.cf-col')).toHaveCount(2);
  });

  test('the development roadmap marks exactly one current position and no future gate as done', async ({ page }) => {
    await page.goto('/validation');
    await expect(page.locator('.rm-current')).toHaveCount(1);
    const states = await page
      .locator('.rm-item')
      .evaluateAll((items) =>
        items.map((el) => ({
          done: el.classList.contains('rm-done'),
          current: el.classList.contains('rm-current'),
        }))
      );
    // Every "done" gate must precede the current position; nothing after it may be done.
    const currentIndex = states.findIndex((s) => s.current);
    expect(currentIndex).toBeGreaterThan(-1);
    for (let i = currentIndex + 1; i < states.length; i++) {
      expect(states[i]?.done, `roadmap gate ${i} is after the current position and must not be done`).toBe(false);
    }
  });
});

test.describe('Determinism and boundary wording', () => {
  test('the determinism statement is present and does not invoke probability', async ({ page }) => {
    await page.goto('/how-it-works');
    await expect(page.locator('body')).toContainText(
      'does not rely on probabilistic inference or confidence scores'
    );
  });

  test('the entropy statement uses the approved framing', async ({ page }) => {
    for (const route of ['/', '/how-it-works']) {
      await page.goto(route);
      await expect(page.locator('body')).toContainText(
        'not built around probabilistic entropy coding'
      );
    }
  });

  test('"What ByteLite is not" is present and states a boundary, not a replacement', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.isnot-card');
    await expect(cards).toHaveCount(5);
    const body = page.locator('body');
    await expect(body).toContainText('Not a generative AI system');
    await expect(body).toContainText('Not lossy compression');
    await expect(body).toContainText('Not independently validated or production-qualified');
    // A card must never explain what is used instead of the excluded technique.
    const text = ((await page.locator('.isnot').innerText()) ?? '').toLowerCase();
    expect(text).not.toContain('because it instead uses');
    expect(text).not.toContain('because it uses');
  });
});

test.describe('Claim discipline on figures and economics', () => {
  test('the conceptual target figure is labelled as such', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText(
      'Conceptual target. Not a claimed universal ratio.'
    );
  });

  test('the economic example is labelled illustrative and not a guarantee', async ({ page }) => {
    for (const route of ['/', '/licensing']) {
      await page.goto(route);
      await expect(page.locator('body')).toContainText(
        'Illustrative economic example. Not a performance guarantee.'
      );
    }
  });

  test('the savings split is never presented as a cost cut', async ({ page }) => {
    for (const route of ['/', '/licensing']) {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      expect(text, `${route}`).not.toContain('cut your costs by half');
      expect(text, `${route}`).not.toContain('50% cost');
      expect(text, `${route}`).not.toContain('halve your costs');
      // "guarantees a 50% reduction" cannot be tested by absence: the approved denial contains
      // the same substring. Assert the denial is present instead - if the affirmative ever
      // replaced it, this fails.
      expect(text).toContain('not a claim that costs fall by half');
    }
  });

  test('the licensing page states the 50/50 verified-savings allocation and the no-saving rule', async ({ page }) => {
    await page.goto('/licensing');
    const body = page.locator('body');
    await expect(body).toContainText('50/50 share of verified qualifying savings');
    await expect(body).toContainText('The customer retains half.');
    await expect(body).toContainText('ByteLite receives half');
    await expect(body).toContainText('does not mean ByteLite guarantees a 50% reduction in total costs');
    await expect(body).toContainText('No verified saving means no savings-share fee');
  });

  test('licensing and billing are labelled as planned, not operational', async ({ page }) => {
    await page.goto('/licensing');
    const body = page.locator('body');
    await expect(body).toContainText('Planned commercial model');
    await expect(body).toContainText('available to license today');
    await expect(body).toContainText('Planned billing model');
  });

  test('complete-artifact accounting is what any compression claim rests on', async ({ page }) => {
    await page.goto('/how-it-works');
    const body = page.locator('body');
    await expect(body).toContainText('Complete ByteLite artifact');
    await expect(body).toContainText('Any compression claim is based on the complete artifact.');
  });

  test('the contact form does not claim delivery it cannot perform', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('.ct-outage')).toBeVisible();
    await expect(page.locator('.ct-outage')).toContainText('cannot send right now');
  });
});
