import { test, expect } from '@playwright/test';

// Owner Law guard, rewritten 2026-08-26 for the Cordel-public canon.
//
// What changed: Cordel Connect and Cordel Play are now current public products, so they left the
// forbidden-names list. What did NOT change: every other sibling ByteLite LLC system, the retired
// brand names, and the internal mechanism vocabulary all stay off every public surface.
//
// Checks run against RENDERED text and, separately, against rendered MARKUP - so a phrase that
// arrives through src/data/ is caught the same as one typed into a page, and a class name or
// comment cannot smuggle vocabulary past a text-only assertion.

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

// Sibling systems and retired brands. None of these is ByteLite or Cordel, so none belongs on a
// public page. The misspellings are included because they have appeared in drafts.
const FORBIDDEN_NAMES = [
  'Deep Kore',
  'DeepKore',
  'KoreLattice',
  'ByteSight',
  'ByteOracle',
  'ByteFlow',
  'ByteCost',
  'AIya',
  'Genesis Goalkeeper',
  'Revelation Vanguard',
  'HeartStrings',
  'Heartstrings',
  'Codrel',
  'Cordea',
  'Cordia',
];

// Internal implementation vocabulary. `.root` is deliberately absent: naming the target artifact
// is owner-approved public wording and says nothing about how the representation is built.
//
// Terms that are a substring of an ordinary English word need a word boundary, not a substring
// match: "Ogram" lowercased sits inside "program", which appears legitimately in legal pages.
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
  test(`${route} names no retired system or brand`, async ({ page }) => {
    await page.goto(route);
    const text = (await page.locator('body').innerText()) ?? '';
    for (const name of FORBIDDEN_NAMES) {
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

  // innerText is only what a visitor SEES. Markup is published too: a class name, an id, a data
  // attribute and a comment are all world-readable in view-source. That gap was real - the
  // current-vs-final diagram once shipped a step styled `cf-step-sidecar` while its visible label
  // correctly read "explicit reconstruction evidence".
  test(`${route} carries no internal vocabulary in its markup either`, async ({ page }) => {
    await page.goto(route);
    const html = (await page.content()).toLowerCase();
    for (const term of MECHANISM_TERMS_IN_MARKUP) {
      expect(html, `${route} must not carry "${term}" anywhere in its markup`).not.toContain(term);
    }
  });
}

test.describe('The architectural target is never narrowed', () => {
  const NARROWING = [
    'only expects structured files to shrink',
    'only structured files',
    'structured files only',
    'random files are inherently expected not to shrink',
    'random data cannot be compressed',
    'only intended to find savings in some classes',
    'does not promise that every file shrinks',
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

  test('the validation page still states that nothing is independently verified', async ({ page }) => {
    await page.goto('/validation');
    await expect(page.locator('body')).toContainText('None of it has been independently verified.');
  });
});

test.describe('Founder voice replaced the committee voice', () => {
  test('the homepage leads with the rule, in the first person', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section.hero');
    await expect(hero.locator('h1')).toContainText('The file comes back exactly. Or it failed.');
    await expect(hero).toContainText('I am building ByteLite');
    // Both halves of the state, together, in the hero - not one without the other.
    await expect(hero).toContainText('Internal tests prove exact reconstruction');
    await expect(hero).toContainText('do not yet prove the complete self-contained target');
    await expect(hero).toContainText('No hand-waving. No uncounted reconstruction state. No partial credit.');
  });

  test('the founder takes personal responsibility by name', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toContainText('I am Tash Broadwater.');
    await expect(body).toContainText('If a result fails, it stays failed until the code proves otherwise.');
  });

  // The phrases the brief singled out as committee language. Each one described a state without
  // ever saying what the state was.
  const COMMITTEE_PHRASES = [
    'canonical project status',
    'mechanism clarification',
    'current scaffold-assisted proof',
    'eligible source file',
  ];

  // Startup filler. These carry no information and were never true of anything on this site.
  const HYPE_PHRASES = [
    'revolutionary',
    'disruptive',
    'breakthrough',
    'world-changing',
    'next-generation',
    'industry-leading',
    'game-changing',
  ];

  for (const route of PUBLIC_ROUTES) {
    test(`${route} avoids committee language and startup filler`, async ({ page }) => {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of [...COMMITTEE_PHRASES, ...HYPE_PHRASES]) {
        expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
      }
    });
  }
});

test.describe('Current development state is stated honestly', () => {
  test('the homepage separates what is proven from what is not', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toContainText('Proven internally');
    await expect(body).toContainText('Not proven');
  });

  test('the current-vs-final graphic shows both columns and no bridging mechanism', async ({ page }) => {
    await page.goto('/how-it-works');
    const fig = page.locator('.cf').first();
    await expect(fig).toContainText('Development proof scaffold');
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
      await expect(page.locator('body')).toContainText('not built around probabilistic entropy coding');
    }
  });

  test('"What ByteLite is not" states a boundary, not a replacement', async ({ page }) => {
    await page.goto('/how-it-works');
    const cards = page.locator('.isnot-card');
    await expect(cards).toHaveCount(5);
    // A card must never explain what is used INSTEAD of the excluded technique.
    const text = ((await page.locator('.isnot').innerText()) ?? '').toLowerCase();
    expect(text).not.toContain('because it instead uses');
    expect(text).not.toContain('because it uses');
  });

  test('the public review framework is never called the algorithm or the pipeline', async ({ page }) => {
    await page.goto('/how-it-works');
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    for (const phrase of [
      'the bytelite algorithm',
      'processing pipeline',
      'encoding flow',
      'internal architecture',
    ]) {
      expect(text, `/how-it-works must not call the review framework "${phrase}"`).not.toContain(phrase);
    }
    await expect(page.locator('body')).toContainText('review framework, not a description');
  });
});
