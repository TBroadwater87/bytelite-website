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
  '/deep-kore',
  '/support',
  '/cordel-connect',
  '/cordel-play',
  '/privacy',
  '/terms',
];

// THE ONE ROUTE on which Deep Kore vocabulary is permitted. Added 2026-09-01 by owner
// instruction; the record is CLAUDE.md section 19.
const DEEP_KORE_ROUTE = '/deep-kore';

// Sibling systems and retired brands. None of these is ByteLite, Cordel or Deep Kore, so none
// belongs on ANY public page - /deep-kore included. The misspellings are here because they have
// appeared in drafts.
const FORBIDDEN_NAMES = [
  'DeepKore',
  'KoreLattice',
  'ByteSight',
  'ByteOracle',
  'ByteFlow',
  'ByteCost',
  'HeartStrings',
  'Heartstrings',
  'Codrel',
  'Cordea',
  'Cordia',
];

// ROUTE-SCOPED, not lifted.
//
// These were unconditionally banned until 2026-09-01. They are now scoped rather than deleted
// from the guard, and the assertion moved from "never" to "not here" - which is the whole point,
// because a deleted assertion stops noticing when Deep Kore leaks onto /about, and leaking onto
// /about is the failure this list exists to catch.
//
// TWO TIERS, because they carry different weight.
//
// The PRODUCT NAME is what the site must be able to say when it has to identify what it is
// talking about: the navigation link that points at the page, and the legal pages that describe
// what happens to a visitor's data. A privacy policy that will not name the service it is
// describing is a worse privacy policy.
//
// The DEEP VOCABULARY - the conversational identities and the governance layers - has no such
// need. It appears in the content of /deep-kore and nowhere else at all, not even in the chrome
// or the legal pages.
//
// 'DeepKore' (no space) stays banned EVERYWHERE, /deep-kore included: it is the retired
// portfolio spelling, and the public page uses the two-word name.
const DEEP_KORE_PRODUCT_NAME = 'Deep Kore';
const DEEP_KORE_DEEP_VOCABULARY = ['AIya', 'AIon', 'Aion', 'Genesis Goalkeeper', 'Revelation Vanguard'];

// The routes whose CONTENT may name the product: its own page, and the two legal pages that have
// to describe it to be accurate.
const PRODUCT_NAME_ROUTES = ['/deep-kore', '/privacy', '/terms'];

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

  // The route-scoped half. Every public route except /deep-kore must still be free of Deep Kore
  // vocabulary in its CONTENT, and this runs on all of them - so the 2026-09-01 amendment gave
  // the ban a boundary instead of removing it.
  //
  // The site chrome is excluded, and only the site chrome, because the header and footer carry a
  // navigation link to the page and a link label has to say where it goes. That exclusion is
  // narrow by construction: the second test below asserts that the chrome carries the product
  // name and NOTHING else from this vocabulary - no identity, no governance layer - so a nav
  // link cannot become a back door for the rest of it.
  // The deep vocabulary is confined to one page's content, everywhere and always.
  if (route !== DEEP_KORE_ROUTE) {
    test(`${route} carries none of the Deep Kore identity or governance vocabulary`, async ({ page }) => {
      await page.goto(route);
      const text = (await page.locator('body').innerText()) ?? '';
      for (const name of DEEP_KORE_DEEP_VOCABULARY) {
        expect(text, `${route} must not name ${name}; that vocabulary is scoped to /deep-kore`)
          .not.toContain(name);
      }
    });
  }

  // The product name is confined to its own page, the two legal pages, and the navigation
  // link. Anywhere else in a page's content is a leak.
  if (!PRODUCT_NAME_ROUTES.includes(route)) {
    test(`${route} names the product only in the link that points at it`, async ({ page }) => {
      await page.goto(route);
      const body = await page.evaluate(() => {
        const doc = document.cloneNode(true) as Document;
        doc.querySelectorAll('script, style, noscript, header, footer').forEach((el) => el.remove());
        return doc.body?.textContent ?? '';
      });
      expect(body, `${route} must not name ${DEEP_KORE_PRODUCT_NAME} outside the navigation`)
        .not.toContain(DEEP_KORE_PRODUCT_NAME);
    });
  }

  // The chrome is on every page, so it is the widest surface there is. It may carry the
  // product name and must carry nothing else from this vocabulary.
  test(`${route} chrome carries the product name and nothing deeper`, async ({ page }) => {
    await page.goto(route);
    const chrome = await page.evaluate(() =>
      [...document.querySelectorAll('header, footer')].map((el) => el.textContent ?? '').join(' ')
    );
    for (const name of DEEP_KORE_DEEP_VOCABULARY) {
      expect(chrome, `${route} navigation must not name ${name}`).not.toContain(name);
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

test.describe('Company voice, with exactly one founder note', () => {
  test('the homepage hero leads with the technology, in company voice', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section.hero');
    await expect(hero.locator('h1')).toContainText('Every file builds its own route.');
    await expect(hero).toContainText('deterministic recursive compression built from the structure of the file itself');
    await expect(hero).toContainText('The original returns exactly, or the result does not count.');
    await expect(hero).toContainText('Exact reconstruction. Complete representation. Deterministic operation.');
    // The hero states what ByteLite is. It does not open with a disclaimer, and it is not a
    // personal undertaking: licensing, billing and support obligations belong to the company.
    await expect(hero).not.toContainText(/\bI am\b/);
  });

  test('the status framing is one block, not a warning on every section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Architecture established');
    await expect(page.locator('body')).toContainText('Automatic C++ encoder in active development');
    await expect(page.locator('.status li')).toHaveCount(5);
  });

  test('the founder note is labelled, signed, and the only first-person passage', async ({ page }) => {
    await page.goto('/');
    const note = page.locator('blockquote.founder');
    await expect(note).toHaveCount(1);
    await expect(note).toContainText('A note from Tash Broadwater');
    await expect(note).toContainText('If a result fails, it stays failed until the code proves otherwise.');
    await expect(note.locator('.founder-sign')).toContainText('founder, ByteLite LLC');
  });

  // FIRST-PERSON-SINGULAR GUARD.
  //
  // Founder-singular copy reads as a personal undertaking. Licensing terms, billing, refunds and
  // support are obligations of ByteLite LLC, so company pages speak as the company. "I"/"me"/"my"
  // survive in exactly two places, both allowed and both checked by exclusion below:
  //
  //   1. the signed founder note on the homepage (blockquote.founder);
  //   2. the contact form's consent checkbox, which is the VISITOR speaking about themselves.
  //   3. the live chat transcript on /deep-kore (.dk-transcript), added 2026-09-01.
  //
  // The third needs its reason stated, because it is the one that could be abused. That region
  // contains only two things: what the visitor typed, and what Deep Kore actually returned. The
  // speaker in it is never ByteLite LLC, so the voice rule - which exists because licensing,
  // billing and support are obligations of a company rather than a person - has nothing to
  // govern there. Rewriting an engine's own utterance into third person would not improve the
  // voice; it would falsify a transcript. The region is empty in a static build, so this
  // exclusion changes no current assertion; it exists so a live session cannot fail the suite
  // for saying "I am AIya".
  //
  // Anything else is a regression to the voice this pass removed.
  const FIRST_PERSON = /(^|[^\w'])(I|I'm|I've|I'll|I'd|me|my|mine)([^\w']|$)/;

  for (const route of PUBLIC_ROUTES) {
    test(`${route} uses company voice, not founder-singular`, async ({ page }) => {
      await page.goto(route);
      // Clone, strip the two sanctioned regions, then read textContent. innerText needs layout
      // and returns empty on a detached clone, and textContent would otherwise sweep up the
      // contents of <style>/<script> - so those are removed first, or CSS would match "my" in a
      // property value and fail the page for a reason that has nothing to do with its prose.
      const text = await page.evaluate(() => {
        const doc = document.cloneNode(true) as Document;
        doc
          .querySelectorAll('script, style, noscript, blockquote.founder, .ct-consent, .dk-transcript')
          .forEach((el) => el.remove());
        return doc.body?.textContent ?? '';
      });
      expect(text, `${route} must not use first-person singular outside the founder note`).not.toMatch(
        FIRST_PERSON
      );
    });
  }

  // This asserts the RENDERED heading, not the served HTML, and that distinction is the whole
  // point. /contact ships a script that rewrites the h1 and sub-heading from TYPE_CONFIG on load,
  // before the visitor touches anything. When the hero was rewritten and TYPE_CONFIG.general was
  // not, view-source showed "Talk with ByteLite LLC." and every real visitor saw "Get in touch."
  // A static grep of the build passes that bug; loading the page does not.
  test('the corporate call to action is not a personal one', async ({ page }) => {
    for (const route of ['/', '/contact']) {
      await page.goto(route);
      const text = (await page.locator('body').innerText()) ?? '';
      expect(text, `${route} must not use the old personal CTA`).not.toContain('Ask me something hard');
      expect(text, `${route} must not use the old personal CTA`).not.toContain('Talk to Tash');
    }
    await page.goto('/contact');
    await expect(page.locator('h1')).toContainText('Talk with ByteLite LLC.');
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

// ------------------------------------------------------------------------------------------
// THE HISTORICAL PYTHON PROTOTYPE RESULT
//
// Owner-approved in writing on 2026-08-31 as an explicit amendment to the no-ratio rule in
// CLAUDE.md section 2. Before that decision this claim was refused and withheld; the record is
// CLAUDE.md section 18.
//
// These tests exist because an approved claim is the easiest kind to get wrong later. The
// sentence is strong, and the three ways it degrades are all quiet ones: it drifts into
// describing the CURRENT encoder, it acquires invented supporting detail that makes it sound
// better sourced than it is, or it gets softened by someone nervous about it. Each is asserted
// against here.
// ------------------------------------------------------------------------------------------
test.describe('The historical prototype result is stated exactly, and never mislabeled', () => {
  const RESULT =
    'An earlier internal Python prototype demonstrated exact lossless reconstruction after reducing a one-terabyte test input to approximately four hundred kilobytes.';

  // The two approved placements, and only these two.
  const PLACEMENTS = ['/', '/validation'];

  for (const route of PLACEMENTS) {
    test(`${route} states the approved sentence verbatim`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('body')).toContainText(RESULT);
    });

    // The result and its scope are one unit. A page carrying the claim without the qualifier
    // would be quotable as "ByteLite's current engine does 1TB to 400KB", which it does not.
    test(`${route} carries the scope qualifier alongside it`, async ({ page }) => {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      expect(text, `${route} must say this is not a current-implementation benchmark`).toContain(
        'not a benchmark of the current c++ implementation'
      );
      expect(text, `${route} must say this is not independent validation`).toContain(
        'not independent validation'
      );
    });

    test(`${route} never attributes the result to the current C++ implementation`, async ({ page }) => {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of [
        'the c++ encoder reduced',
        'the c++ implementation reduced',
        'the current implementation reduced',
        'the current encoder reduced',
        'bytelite reduces a one-terabyte',
        'bytelite reduces one terabyte',
        'c++ prototype demonstrated',
      ]) {
        expect(text, `${route} must not say "${phrase}"`).not.toContain(phrase);
      }
    });

    // The owner's instruction was explicit: do not invent the input identity, test date,
    // runtime, hardware, throughput, comparison ratio, reviewer, or supporting artifact. None of
    // those exists, so none may appear. These are the shapes such an invention would take.
    test(`${route} adds no invented supporting detail to the result`, async ({ page }) => {
      await page.goto(route);
      const raw = (await page.locator('body').innerText()) ?? '';
      const text = raw.toLowerCase();
      for (const phrase of [
        'mb/s',
        'gb/s',
        'gib/s',
        'terabytes per',
        'compression ratio of',
        'ratio of 2,6',
        'times smaller',
        'audited by',
        'reviewed by',
        'verified by an independent',
        'benchmark suite',
        'test harness log',
      ]) {
        expect(text, `${route} must not add "${phrase}" to the prototype result`).not.toContain(phrase);
      }
      // A bare "N:1" ratio, or a wall-clock runtime, would both be invented detail.
      expect(raw, `${route} must not state a numeric compression ratio`).not.toMatch(/\d[\d,.]*\s*:\s*1\b/);
      expect(raw, `${route} must not state a runtime for the prototype run`).not.toMatch(
        /\b\d+(\.\d+)?\s*(ms|milliseconds|seconds|minutes|hours)\b/i
      );
    });

    // The opposite failure mode: softening an approved, owner-stated company result into a
    // hypothesis. "Demonstrated" is the approved verb and it stays.
    test(`${route} does not weaken the result into a hypothesis`, async ({ page }) => {
      await page.goto(route);
      const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
      for (const phrase of [
        'may have demonstrated',
        'appears to have reduced',
        'suggested that it could',
        'explored reducing',
        'a research objective of reducing',
        'hoped to reduce',
        'is believed to have',
      ]) {
        expect(text, `${route} must not hedge the result with "${phrase}"`).not.toContain(phrase);
      }
    });
  }

  test('/validation keeps the historical and the current work in separate columns', async ({ page }) => {
    await page.goto('/validation');
    const past = page.locator('.hc-past');
    const now = page.locator('.hc-now');
    await expect(past).toHaveCount(1);
    await expect(now).toHaveCount(1);
    await expect(past).toContainText('Python prototype');
    await expect(past).toContainText(RESULT);
    // The current column describes the work, and must never claim the prototype's result.
    await expect(now).toContainText('automating');
    await expect(now).not.toContainText('four hundred kilobytes');
  });

  test('the claim ladder no longer contradicts the published result', async ({ page }) => {
    await page.goto('/validation');
    const text = ((await page.locator('body').innerText()) ?? '').toLowerCase();
    // This line was true until the owner approved publication; leaving it would have made the
    // evidence page contradict the homepage.
    expect(text).not.toContain('no public ratio is claimed');
  });

  test('the result appears on the two approved pages and nowhere else', async ({ page }) => {
    for (const route of PUBLIC_ROUTES.filter((r) => !PLACEMENTS.includes(r))) {
      await page.goto(route);
      const text = (await page.locator('body').innerText()) ?? '';
      expect(text, `${route} is not an approved placement for the prototype result`).not.toContain(
        'four hundred kilobytes'
      );
    }
  });
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
