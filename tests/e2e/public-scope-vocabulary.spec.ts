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

// Checked against the rendered MARKUP, not just the visible text, so a class name, id, data
// attribute or HTML comment cannot smuggle internal vocabulary onto a public page. Every entry
// is lowercase (the markup is lowercased before comparison) and every entry is a substring match,
// so nothing here may be a substring of an ordinary English word - that is why "ogram" is absent
// and stays in INTERNAL_TERM_PATTERNS above, where it gets a word boundary.
const MECHANISM_TERMS_IN_MARKUP = [
  'sidecar',
  'opcode',
  'motion-program',
  'motion program',
  'library-of-libraries',
  'library of libraries',
  'root-of-roots',
  'root of roots',
  'carrier construction',
  'recursive metadata integration',
  'foundation construction',
  'szudzik',
  'dictionary cascade',
  'sigma-9',
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

  // The test above reads innerText, which is only what a visitor SEES. Markup is published too:
  // a class name, an id, a data attribute and a comment are all world-readable in view-source.
  // That gap was real, not hypothetical - the current-vs-final diagram shipped a step styled
  // `cf-step-sidecar` on every rendered page while its visible label correctly read "Explicit
  // reconstruction evidence". The label was public vocabulary; the class name was not. Found and
  // removed 2026-08-25. This guards the source so the next one cannot hide in an attribute.
  test(`${route} carries no internal vocabulary in its markup either`, async ({ page }) => {
    await page.goto(route);
    const html = (await page.content()).toLowerCase();
    for (const term of MECHANISM_TERMS_IN_MARKUP) {
      expect(html, `${route} must not carry "${term}" anywhere in its markup`).not.toContain(term);
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

// Per-page acceptance checklist. Each block is one line of the owner's page-by-page brief, so a
// later edit cannot quietly drop a required element or bury it below the fold.
test.describe('Page acceptance checklist', () => {
  test('HOME: hero, first diagram, current status and 50/50 economics are all present', async ({ page }) => {
    await page.goto('/');
    // Hero comprehension: the law, what it is, and the target - all above the diagram.
    const hero = page.locator('section.hero');
    await expect(hero.locator('h1')).toContainText('Exact reconstruction.');
    await expect(hero).toContainText('deterministic lossless representation architecture');
    await expect(hero).toContainText('for every eligible source file');
    await expect(hero.locator('a.btn')).toHaveCount(3);
    // The first diagram on the page is the ByteLite target flow, and it precedes the status box.
    const order = await page.evaluate(() => {
      const flow = document.querySelector('.bf');
      const status = document.querySelector('.cs');
      // The homepage carries the two pricing MODELS, not the business target example - that
      // figure only makes sense inside the business section on /licensing.
      const pricing = document.querySelector('.pm');
      if (!flow || !status || !pricing) return null;
      return {
        flowBeforeStatus: !!(flow.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING),
        statusBeforePricing: !!(status.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING),
      };
    });
    expect(order, 'homepage must carry the flow, status and pricing figures').not.toBeNull();
    expect(order?.flowBeforeStatus, 'the target diagram must come before the status box').toBe(true);
    expect(order?.statusBeforePricing, 'the status box must come before the economics').toBe(true);
  });

  test('HOW IT WORKS: exactness, current-vs-final, accounting and the boundary all appear', async ({ page }) => {
    await page.goto('/how-it-works');
    for (const selector of ['.rt', '.cf', '.ba', '.isnot']) {
      await expect(page.locator(selector).first(), `${selector} must be on /how-it-works`).toBeVisible();
    }
    // In that order: exact reconstruction -> current vs final -> accounting -> what it is not.
    const inOrder = await page.evaluate(() => {
      const sel = ['.rt', '.cf', '.ba', '.isnot'].map((s) => document.querySelector(s));
      if (sel.some((e) => !e)) return false;
      for (let i = 0; i < sel.length - 1; i++) {
        const a = sel[i] as Element;
        const b = sel[i + 1] as Element;
        if (!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
      }
      return true;
    });
    expect(inOrder, '/how-it-works sections must run exactness -> current vs final -> accounting -> boundary').toBe(true);
  });

  test('VALIDATION: the current position is stated before any category detail', async ({ page }) => {
    await page.goto('/validation');
    const here = page.locator('.here');
    await expect(here).toBeVisible();
    await expect(here).toContainText('You are here');
    await expect(here).toContainText('Mechanism clarification');

    // It must sit in the first screenful, not below an eleven-row table.
    const top = await here.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    expect(top, '"You are here" must be within the first fold').toBeLessThan(700);

    // And it must precede both the roadmap and the dashboard.
    const precedes = await page.evaluate(() => {
      const here = document.querySelector('.here');
      const roadmap = document.querySelector('.rm');
      const dash = document.querySelector('.vd');
      if (!here || !roadmap || !dash) return null;
      return {
        beforeRoadmap: !!(here.compareDocumentPosition(roadmap) & Node.DOCUMENT_POSITION_FOLLOWING),
        roadmapBeforeDash: !!(roadmap.compareDocumentPosition(dash) & Node.DOCUMENT_POSITION_FOLLOWING),
      };
    });
    expect(precedes?.beforeRoadmap).toBe(true);
    expect(precedes?.roadmapBeforeDash, 'the ladder must come before the category breakdown').toBe(true);
  });

  test('VALIDATION: the dashboard is not a wall of evidence text', async ({ page }) => {
    await page.goto('/validation');
    // Each row shows a state and one sentence; the evidence lines live in a drawer instead.
    await expect(page.locator('.vd-row')).toHaveCount(11);
    await expect(page.locator('.vd-evidence')).toHaveCount(0);
    // Nothing is lost: every category's evidence is still reachable, in one place.
    const drawer = page.locator('details.drawer').first();
    await expect(drawer).toContainText('Evidence behind every dashboard category');
    await expect(drawer.locator('.drawer-cat')).toHaveCount(11);
  });

  test('LICENSING: the split, the billing model and the illustrative framing all read fast', async ({ page }) => {
    await page.goto('/licensing');
    // 50/50 in seconds: two equal halves, labelled, with the totals beside them.
    const halves = page.locator('.ss-half');
    await expect(halves).toHaveCount(2);
    await expect(halves.nth(0)).toContainText('$450');
    await expect(halves.nth(1)).toContainText('$450');
    await expect(page.locator('.ss-half-share').first()).toContainText('half');

    // Planned balance / auto-reload is unmistakably not live.
    await expect(page.locator('.bal-planned')).toContainText('not operational');
    await expect(page.locator('.bal')).toContainText('auto-reload');

    // Illustrative vs proven: the disclaimer is a badge on the figure, not a footnote, and it
    // appears before the first currency figure in the document.
    const badge = page.locator('.ss-illustrative');
    await expect(badge).toContainText('Target economic example — not a current performance claim');
    const badgeFirst = await page.evaluate(() => {
      const b = document.querySelector('.ss-illustrative');
      const firstFigure = document.querySelector('.ss-cost-value');
      if (!b || !firstFigure) return false;
      return !!(b.compareDocumentPosition(firstFigure) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(badgeFirst, 'the illustrative badge must precede the first currency figure').toBe(true);
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

  test('the business example is labelled a target, not a current performance claim', async ({ page }) => {
    for (const route of ['/licensing']) {
      await page.goto(route);
      await expect(page.locator('.ss-illustrative')).toContainText(
        'Target economic example — not a current performance claim'
      );
      await expect(page.locator('body')).toContainText(
        "This example illustrates ByteLite's target economics"
      );
      await expect(page.locator('body')).toContainText(
        'Actual savings will be determined by measured production results.'
      );
    }
  });

  // One test per route, which is this file's convention everywhere else (see the loops above).
  // It was written as a single test walking all eight routes, which made it the only test in the
  // suite performing eight navigations inside one 30s budget. Measured 2026-08-25: 7.5s in an
  // idle Firefox, but the whole eight-route walk shares one timeout, so machine contention takes
  // out all eight assertions at once and the failure names no route. Splitting changes no
  // assertion - the same six phrases are still checked on the same eight routes - and gives each
  // route its own budget and its own name in the report.
  const ACHIEVED_RESULT_PHRASES = [
    'guarantees a 90%',
    'achieves a 90%',
    'delivers a 90%',
    'proven 90%',
    'measured 90%',
    '90% reduction achieved',
  ];

  for (const route of PUBLIC_ROUTES) {
    test(`${route} never states the 90% figure as an achieved result`, async ({ page }) => {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of ACHIEVED_RESULT_PHRASES) {
        expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
      }
    });
  }

  test('the savings split is never presented as a cost cut', async ({ page }) => {
    await page.goto('/licensing');
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    expect(text).not.toContain('cut your costs by half');
    expect(text).not.toContain('50% cost');
    expect(text).not.toContain('halve your costs');
    // "guarantees a 50% reduction" cannot be tested by absence: the approved denial contains
    // the same substring. Assert the denial is present instead - if the affirmative ever
    // replaced it, this fails.
    expect(text).toContain('not a claim that costs fall by half');
  });

  test('the licensing page states the 50/50 business allocation and the no-saving rule', async ({ page }) => {
    await page.goto('/licensing');
    const body = page.locator('body');
    await expect(body).toContainText('50/50 share of verified qualifying savings');
    await expect(body).toContainText('The customer keeps half. ByteLite receives half.');
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

  // Delivery through POST /api/contact was proven end to end on 2026-08-25 - request accepted,
  // provider accepted, and the message confirmed in the destination mailbox (qa/contact-
  // verification-2026-08-25.md). The outage banner that used to stand here was therefore removed.
  // This test now guards both directions of that fact: no page may advertise an outage that is
  // not happening, and no page may promise more than receipt.
  test('the contact form neither advertises a false outage nor overpromises', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('.ct-outage')).toHaveCount(0);
    const body = page.locator('body');
    await expect(body).not.toContainText('temporarily unavailable');
    await expect(body).not.toContainText('cannot send right now');
    await expect(body).toContainText('does not guarantee acceptance');
  });
});
