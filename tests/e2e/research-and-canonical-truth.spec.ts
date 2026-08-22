import { test, expect } from '@playwright/test';

// Regression guards for the research-section launch and the site-wide coherence pass that shipped
// with it. Each block asserts a specific contradiction that was corrected and must not return.

const RESEARCH_LANDING = '/research';
const RESEARCH_THESIS = '/research/deterministic-structural-cognition';
const RESEARCH_PLAIN_ENGLISH = '/research/plain-english';

test.describe('The research section is a real destination', () => {
  const researchRoutes = [RESEARCH_LANDING, RESEARCH_THESIS, RESEARCH_PLAIN_ENGLISH];

  for (const path of researchRoutes) {
    test(`${path} resolves and has exactly one H1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should resolve 200`).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }

  test('/research no longer redirects to /technologies', async ({ page }) => {
    await page.goto(RESEARCH_LANDING);
    expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(RESEARCH_LANDING);
    await expect(page.locator('h1')).toContainText('Deterministic structure, from information to reasoning.');
  });

  test('the landing page routes to both the thesis and the plain-English page', async ({ page }) => {
    await page.goto(RESEARCH_LANDING);
    // Scoped to <main>: the shared header carries the same links but is collapsed behind the
    // mobile menu on narrow viewports.
    await expect(page.locator(`main a[href="${RESEARCH_THESIS}"]`).first()).toBeVisible();
    await expect(page.locator(`main a[href="${RESEARCH_PLAIN_ENGLISH}"]`).first()).toBeVisible();
  });

  // The 2026-08-22 public scope reset removed Research from the primary navigation and the
  // footer: the section still builds and still resolves, but it is off every discovery surface
  // and is served noindex. That retirement is asserted in critical-paths.spec.ts.
  test('Research is absent from the primary navigation and the footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`.nav-links a[href^="${RESEARCH_LANDING}"]`)).toHaveCount(0);
    await expect(page.locator(`.site-footer a[href^="${RESEARCH_LANDING}"]`)).toHaveCount(0);
  });

  test('the thesis carries its publication metadata and does not claim review', async ({ page }) => {
    await page.goto(RESEARCH_THESIS);
    const body = page.locator('body');
    await expect(body).toContainText('Public Research Thesis');
    await expect(body).toContainText('Not peer reviewed');
    await expect(body).toContainText('Not yet independently verified');
    await expect(body).toContainText('Proprietary implementation mechanisms intentionally omitted');
    await expect(body).toContainText('Nothing in this publication grants a license');
  });

  test('the thesis table of contents anchors all resolve to real sections', async ({ page }) => {
    await page.goto(RESEARCH_THESIS);
    const anchors = await page.locator('.pp-toc a').evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).getAttribute('href') ?? '')
    );
    expect(anchors.length).toBeGreaterThan(15);
    for (const anchor of anchors) {
      expect(anchor.startsWith('#')).toBe(true);
      await expect(page.locator(anchor), `${anchor} should exist on the page`).toHaveCount(1);
    }
  });

  test('the thesis separates implemented work from research hypothesis', async ({ page }) => {
    await page.goto(RESEARCH_THESIS);
    const body = page.locator('body');
    await expect(body).toContainText('Implemented / under validation');
    await expect(body).toContainText('Experimental');
    await expect(body).toContainText('Research hypothesis');
  });

  test('the thesis states the Kolmogorov uncomputability limitation wherever it invokes the term', async ({ page }) => {
    await page.goto(RESEARCH_THESIS);
    const text = (await page.locator('body').textContent()) ?? '';
    expect(text).toContain('Kolmogorov');
    expect(text).toContain('uncomputable in general');
  });

  test('the plain-English page uses the real public product names', async ({ page }) => {
    await page.goto(RESEARCH_PLAIN_ENGLISH);
    const body = page.locator('body');
    for (const name of ['ByteLite', 'ByteSight', 'Deep Kore', '.root']) {
      await expect(body).toContainText(name);
    }
  });
});

test.describe('Research pages make no prohibited claim', () => {
  const researchRoutes = [RESEARCH_LANDING, RESEARCH_THESIS, RESEARCH_PLAIN_ENGLISH];

  // Affirmative phrasings only. Every one of these appears on these pages solely as a negation,
  // so an affirmative occurrence would be a real regression.
  const prohibited = [
    'solves agi',
    'achieves agi',
    'solved artificial general intelligence.',
    'universal compression.',
    'we have solved',
    'proven to be optimal',
    'ready for autonomous driving',
    'simulates reality',
    'patent pending',
    'patent protected',
    "world's first",
    'first ever',
  ];

  for (const path of researchRoutes) {
    test(`${path} contains no prohibited affirmative claim`, async ({ page }) => {
      await page.goto(path);
      const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
      for (const phrase of prohibited) {
        expect(text, `${path} should not contain "${phrase}"`).not.toContain(phrase);
      }
    });
  }

  test('the thesis discloses no proprietary mechanism vocabulary', async ({ page }) => {
    await page.goto(RESEARCH_THESIS);
    const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
    // Word-bounded: "ogram" is a substring of "program", which the paper uses constantly.
    const mechanismTerms = [
      /\bsigma[- ]9\b/,
      /\bmotionprogram\b/,
      /\bogram\b/,
      /\bopcode/,
      /\bszudzik\b/,
      /\bcarrier format/,
      /\bselector\b/,
    ];
    for (const term of mechanismTerms) {
      expect(text, `the thesis should not disclose ${term}`).not.toMatch(term);
    }
  });
});

test.describe('One canonical architecture count', () => {
  const countSurfaces = ['/', '/architecture', '/technologies'];

  for (const path of countSurfaces) {
    test(`${path} never describes a seven-layer stack`, async ({ page }) => {
      await page.goto(path);
      const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
      expect(text).not.toContain('seven-layer');
      expect(text).not.toContain('seven layer');
      expect(text).not.toContain('seven technologies');
    });
  }

  test('the technology grid renders exactly the six canonical technologies', async ({ page }) => {
    await page.goto('/technologies');
    await expect(page.locator('.th-grid .th-card')).toHaveCount(6);
    const body = page.locator('body');
    await expect(body).toContainText('Six core technologies');
  });

  test('the Architecture page states the same count', async ({ page }) => {
    await page.goto('/architecture');
    await expect(page.locator('body')).toContainText('Six technologies.');
  });
});

test.describe('Company formation date is never conflated with the research start', () => {
  const companySurfaces = [
    '/',
    '/company',
    '/company/founder',
    '/company/investors',
    '/company/partnerships',
    '/progress',
    '/progress/changelog',
    '/progress/development-timeline',
  ];

  for (const path of companySurfaces) {
    test(`${path} never says ByteLite LLC was founded in 2024`, async ({ page }) => {
      await page.goto(path);
      const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
      expect(text).not.toContain('bytelite llc was founded in 2024');
      expect(text).not.toContain('bytelite llc was formed in 2024');
      expect(text).not.toContain('founded bytelite llc in 2024');
      expect(text).not.toMatch(/founded[^.]{0,30}\b2024\b/);
    });
  }

  test('the company page states both dates distinctly', async ({ page }) => {
    await page.goto('/company');
    const body = page.locator('body');
    await expect(body).toContainText('The research work began in 2024');
    await expect(body).toContainText('formed in 2025');
  });

  test('the founder page states both dates distinctly', async ({ page }) => {
    await page.goto('/company/founder');
    const body = page.locator('body');
    await expect(body).toContainText('research work began in 2024');
    await expect(body).toContainText('was formed in 2025');
  });

  test('organization structured data uses the legal formation year', async ({ page }) => {
    await page.goto('/');
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd ?? '{}');
    expect(parsed['@type']).toBe('Organization');
    expect(parsed.foundingDate).toBe('2025');
  });
});

test.describe('Retired canonical names stay off public surfaces', () => {
  const publicSurfaces = [
    '/',
    '/technologies',
    '/architecture',
    '/progress',
    '/progress/validation-evidence',
    '/products/cordel-connect',
    '/products/cordel-connect/horoscopes',
    '/research',
  ];

  for (const path of publicSurfaces) {
    test(`${path} contains no ByteOracle reference and no ByteOracle URL`, async ({ page }) => {
      await page.goto(path);
      const text = ((await page.locator('body').textContent()) ?? '').toLowerCase();
      expect(text).not.toContain('byteoracle');
      const hrefs = await page.locator('a[href]').evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute('href') ?? '')
      );
      for (const href of hrefs) {
        expect(href.toLowerCase(), `${path} should not link to a byteoracle URL`).not.toContain('byteoracle');
      }
    });
  }

  test('the horoscope feature lives on a neutral canonical route', async ({ page }) => {
    const response = await page.goto('/products/cordel-connect/horoscopes');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Your sign, your daily reading.');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/products/cordel-connect/horoscopes');
    expect(canonical).not.toContain('byteoracle');
  });

  test('the retired technology routes are excluded from indexing', async ({ page }) => {
    for (const path of ['/technologies/byteoracle', '/technologies/byteflow', '/technologies/bytecost']) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]'), `${path} should be noindex`).toHaveAttribute(
        'content',
        'noindex, nofollow'
      );
    }
  });
});

test.describe('Public evidence pages carry no development-environment plumbing', () => {
  const evidenceSurfaces = [
    '/progress/validation-evidence',
    '/technologies/bytelite',
    '/technologies/bytesight',
    '/technologies/deep-kore',
    '/technologies/deep-kore/aiya',
    '/technologies/deep-kore/genesis-goalkeeper',
    '/technologies/deep-kore/revelation-vanguard',
  ];

  for (const path of evidenceSurfaces) {
    test(`${path} exposes no local path or build-location detail`, async ({ page }) => {
      await page.goto(path);
      const text = (await page.locator('body').textContent()) ?? '';
      expect(text).not.toMatch(/[A-Za-z]:\\{1,2}[A-Za-z_]/);
      expect(text).not.toContain('LLC_Projects');
      expect(text).not.toContain('CMake');
      expect(text.toLowerCase()).not.toContain('build location');
      expect(text.toLowerCase()).not.toContain('development checkout');
    });
  }

  test('the evidence ledger keeps commit anchors and negative findings', async ({ page }) => {
    await page.goto('/progress/validation-evidence');
    const body = page.locator('body');
    // Commit ids are evidence anchors and must survive the plumbing cleanup.
    await expect(body).toContainText('commit 00e9c6a');
    await expect(body).toContainText('Known limitations');
    await expect(body).toContainText('Independent verification status');
    // The documented ByteSight failure is a negative finding that must never be sanitized away.
    await expect(body).toContainText('zero facial features detected');
  });
});

test.describe('Deep Kore disclosure wording matches the public Architecture page', () => {
  test('does not claim that no architecture details are public', async ({ page }) => {
    await page.goto('/technologies/deep-kore');
    const body = page.locator('body');
    await expect(body).not.toContainText('No architecture details are public');
    await expect(body).toContainText('No proprietary reasoning mechanisms');
    await expect(page.locator('main a[href="/architecture"]').first()).toBeVisible();
  });
});

test.describe('Technology pages connect to the research thesis', () => {
  const linkedPages = ['/technologies', '/technologies/bytelite', '/technologies/bytesight', '/technologies/deep-kore', '/architecture'];

  for (const path of linkedPages) {
    test(`${path} links to the research thesis`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(`main a[href="${RESEARCH_THESIS}"]`).first()).toBeVisible();
    });
  }

  test('research-direction sections are labeled as hypotheses, not capability', async ({ page }) => {
    await page.goto('/technologies/bytesight');
    await expect(page.locator('body')).toContainText('Research hypothesis');
    await page.goto('/technologies/deep-kore');
    await expect(page.locator('body')).toContainText('Research hypothesis');
  });
});
