// Generates the local-only owner-review QA package (qa/owner-review/) from:
//   - the canonical route list in qa/qa-sweep.mjs (kept as the single source of truth for
//     route -> slug, mirrored here rather than imported, since qa-sweep.mjs also drives the
//     live sweep and this generator must stay a pure read-only reporter)
//   - the screenshots actually present in qa/screenshots/
//   - the last qa-sweep-results.json (per-route/breakpoint issues, if any)
//   - built page titles read from dist/ (must run `npm run build` first)
//   - the canonical project status table mirrored from src/data/projects.ts
//
// Output is local QA tooling only - never emitted into public/ or dist/, never linked from
// any production page.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCREENSHOT_DIR = path.join(ROOT, 'qa', 'screenshots');
const DIST_DIR = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, 'qa', 'owner-review');
const SWEEP_RESULTS = path.join(ROOT, 'qa', 'qa-sweep-results.json');

const BREAKPOINTS = [
  { width: 375, height: 812, label: 'mobile-sm' },
  { width: 430, height: 932, label: 'mobile-lg' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 1280, height: 900, label: 'laptop' },
  { width: 1536, height: 960, label: 'desktop' },
  { width: 1920, height: 1080, label: 'wide' },
];

// [route, slug, pageName, section, routeType]
// Section order matches the owner's required grouping exactly.
const ROUTE_META = [
  ['/', 'home', 'Homepage', 'Homepage', 'public'],
  ['/technologies', 'technologies', 'Technologies Overview', 'Technologies', 'public'],
  ['/architecture', 'architecture', 'Complete Architecture', 'Architecture', 'public'],
  ['/architecture/deterministic-design-principles', 'arch-principles', 'Deterministic Design Principles', 'Architecture', 'nested'],
  ['/architecture/governance-and-intrinsic-halting', 'arch-governance', 'Governance and Intrinsic Halting', 'Architecture', 'nested'],
  ['/architecture/proof-and-claim-posture', 'arch-proof-posture', 'Proof and Claim Posture', 'Architecture', 'nested'],
  ['/architecture/integration-map', 'arch-integration-map', 'Integration Map', 'Architecture', 'nested'],
  ['/technologies/bytelite', 'tech-bytelite', 'ByteLite', 'ByteLite', 'nested'],
  ['/technologies/bytesight', 'tech-bytesight', 'ByteSight', 'ByteSight', 'nested'],
  ['/technologies/deep-kore', 'tech-deep-kore', 'Deep Kore', 'Deep Kore', 'nested'],
  ['/technologies/deep-kore/aiya', 'tech-aiya', 'AIya', 'AIya', 'nested'],
  ['/technologies/deep-kore/genesis-goalkeeper', 'tech-genesis-goalkeeper', 'Genesis Goalkeeper', 'Genesis Goalkeeper', 'nested'],
  ['/technologies/byteoracle', 'tech-byteoracle', 'ByteOracle', 'ByteOracle', 'nested'],
  ['/technologies/byteflow', 'tech-byteflow', 'ByteFlow', 'ByteFlow', 'nested'],
  ['/technologies/bytecost', 'tech-bytecost', 'ByteCost', 'ByteCost', 'nested'],
  ['/products/heartstrings-play', 'hsp-overview', 'HeartStrings Play Overview', 'HeartStrings Play', 'public'],
  ['/products/heartstrings-play/how-it-plays', 'hsp-how-it-plays', 'How It Plays', 'HeartStrings Play', 'nested'],
  ['/products/heartstrings-play/editions', 'hsp-editions', 'Editions', 'HeartStrings Play', 'nested'],
  ['/products/heartstrings-play/components', 'hsp-components', 'Components', 'HeartStrings Play', 'nested'],
  ['/products/heartstrings-play/consent-architecture', 'hsp-consent', 'Consent Architecture', 'HeartStrings Play', 'nested'],
  ['/products/heartstrings-play/development-status', 'hsp-dev-status', 'Development Status', 'HeartStrings Play', 'nested'],
  ['/products/heartstrings-play/preorder', 'hsp-preorder', 'HeartStrings Play Preorder', 'HeartStrings Play', 'preorder'],
  ['/products/heartstrings-connect', 'hsc-overview', 'HeartStrings Connect Overview', 'HeartStrings Connect', 'public'],
  ['/products/heartstrings-connect/compatibility-and-matching', 'hsc-compatibility', 'Compatibility and Matching', 'HeartStrings Connect', 'nested'],
  ['/products/heartstrings-connect/privacy-architecture', 'hsc-privacy', 'Privacy Architecture', 'HeartStrings Connect', 'nested'],
  ['/products/heartstrings-connect/safety', 'hsc-safety', 'Safety', 'HeartStrings Connect', 'nested'],
  ['/products/heartstrings-connect/games-and-shared-activities', 'hsc-games', 'Games and Shared Activities', 'HeartStrings Connect', 'nested'],
  ['/products/heartstrings-connect/date-planning', 'hsc-date-planning', 'Date Planning', 'HeartStrings Connect', 'nested'],
  ['/products/heartstrings-connect/cartoonized-profiles', 'hsc-cartoonized', 'Cartoonized Profiles', 'Cartoonized Profiles', 'nested'],
  ['/products/heartstrings-connect/aiya-and-aion', 'hsc-aiya-aion', 'AIya and Aion', 'AIya and Aion', 'nested'],
  ['/products/heartstrings-connect/byteoracle-horoscopes', 'hsc-byteoracle', 'ByteOracle Horoscopes', 'ByteOracle Horoscopes', 'nested'],
  ['/products/heartstrings-connect/date-planning/blind-date-roulette', 'hsc-blind-date', 'Blind Date Roulette', 'Blind Date Roulette', 'nested'],
  ['/products/heartstrings-connect/date-planning/restaurants', 'hsc-restaurants', 'Restaurants', 'Restaurants', 'nested'],
  ['/products/heartstrings-connect/date-planning/restaurants/partner-program', 'hsc-partner-program', 'Restaurant Partner Program', 'Restaurant Partner Program', 'partner'],
  ['/progress', 'progress', 'Progress & Status', 'Progress and Status', 'public'],
  ['/progress/validation-evidence', 'progress-validation', 'Validation Evidence', 'Progress and Status', 'nested'],
  ['/progress/development-timeline', 'progress-timeline', 'Development Timeline', 'Progress and Status', 'nested'],
  ['/progress/changelog', 'progress-changelog', 'Changelog', 'Progress and Status', 'nested'],
  ['/preorder', 'preorder', 'Preorder', 'Preorder', 'preorder'],
  ['/preorder/founder-benefits', 'preorder-founder-benefits', 'Founder Benefits', 'Preorder', 'preorder'],
  ['/preorder/status', 'preorder-status', 'Preorder / Order Status', 'Preorder', 'preorder'],
  ['/company', 'company', 'About ByteLite LLC', 'Company', 'public'],
  ['/company/founder', 'company-founder', 'Founder', 'Company', 'nested'],
  ['/company/partnerships', 'company-partnerships', 'Partnerships', 'Company', 'nested'],
  ['/company/investors', 'company-investors', 'Investors', 'Company', 'nested'],
  ['/contact', 'contact', 'Contact', 'Contact', 'public'],
  ['/company/legal', 'company-legal', 'Legal Index', 'Legal', 'legal'],
  ['/preorder/terms', 'preorder-terms', 'Preorder Terms', 'Legal', 'legal'],
  ['/terms', 'terms', 'Terms of Use', 'Legal', 'legal'],
  ['/privacy', 'privacy', 'Privacy Policy', 'Legal', 'legal'],
];

const SECTION_ORDER = [
  'Homepage', 'Technologies', 'Architecture', 'ByteLite', 'ByteSight', 'Deep Kore', 'AIya',
  'Genesis Goalkeeper', 'ByteOracle', 'ByteFlow', 'ByteCost', 'HeartStrings Play',
  'HeartStrings Connect', 'Cartoonized Profiles', 'AIya and Aion', 'ByteOracle Horoscopes',
  'Blind Date Roulette', 'Restaurants', 'Restaurant Partner Program', 'Progress and Status',
  'Preorder', 'Company', 'Legal', 'Contact', 'Remaining canonical routes',
];

// Mirrors src/data/projects.ts (kept in sync by hand - see CLAUDE.md "Canonical Project
// Status System"; this generator reads static data only, it does not execute TypeScript).
const ROUTE_CANONICAL_STATUS = {
  '/technologies/bytelite': 'Internal Validation',
  '/technologies/bytesight': 'Concept',
  '/technologies/deep-kore': 'Internal Validation',
  '/technologies/deep-kore/aiya': 'Prototype',
  '/technologies/deep-kore/genesis-goalkeeper': 'Concept',
  '/technologies/byteoracle': 'Concept',
  '/technologies/byteflow': 'Concept',
  '/technologies/bytecost': 'Concept',
  '/products/heartstrings-play': 'Prototype',
  '/products/heartstrings-play/how-it-plays': 'Prototype',
  '/products/heartstrings-play/editions': 'Prototype',
  '/products/heartstrings-play/components': 'Prototype',
  '/products/heartstrings-play/consent-architecture': 'Prototype',
  '/products/heartstrings-play/development-status': 'Prototype',
  '/products/heartstrings-play/preorder': 'Prototype',
  '/products/heartstrings-connect': 'Private Test',
  '/products/heartstrings-connect/compatibility-and-matching': 'Private Test',
  '/products/heartstrings-connect/privacy-architecture': 'Private Test',
  '/products/heartstrings-connect/safety': 'Private Test',
  '/products/heartstrings-connect/cartoonized-profiles': 'Private Test',
  '/products/heartstrings-connect/aiya-and-aion': 'Private Test',
  '/products/heartstrings-connect/games-and-shared-activities': 'Private Test',
  '/products/heartstrings-connect/byteoracle-horoscopes': 'Private Test',
  '/products/heartstrings-connect/date-planning': 'Private Test',
  '/products/heartstrings-connect/date-planning/blind-date-roulette': 'Private Test',
  '/products/heartstrings-connect/date-planning/restaurants': 'Private Test',
  // Restaurant Partner Program has its own, more specific canonical record that overrides
  // the parent HeartStrings Connect status for this exact route.
  '/products/heartstrings-connect/date-planning/restaurants/partner-program': 'Public Beta',
};

function distPathFor(route) {
  const clean = route === '/' ? '' : route.replace(/^\/|\/$/g, '');
  return path.join(DIST_DIR, clean, 'index.html');
}

function extractTitle(route) {
  const file = distPathFor(route);
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function loadSweepIssues() {
  if (!fs.existsSync(SWEEP_RESULTS)) return [];
  try {
    return JSON.parse(fs.readFileSync(SWEEP_RESULTS, 'utf8'));
  } catch {
    return [];
  }
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Uniqueness check on slugs - a collision would silently overwrite screenshots.
  const slugCounts = new Map();
  for (const [, slug] of ROUTE_META) slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
  const slugCollisions = [...slugCounts.entries()].filter(([, n]) => n > 1).map(([s]) => s);
  if (slugCollisions.length) {
    throw new Error(`Duplicate slugs in ROUTE_META, would collide in screenshot filenames: ${slugCollisions.join(', ')}`);
  }

  const actualFiles = new Set(fs.readdirSync(SCREENSHOT_DIR).filter((f) => f.endsWith('.png')));
  const issues = loadSweepIssues();

  const expectedFiles = new Set();
  const routes = [];

  for (const [route, slug, pageName, section, routeType] of ROUTE_META) {
    const title = extractTitle(route);
    const screenshots = BREAKPOINTS.map((bp) => {
      const file = `${slug}-${bp.width}.png`;
      expectedFiles.add(file);
      const exists = actualFiles.has(file);
      const issue = issues.find((i) => i.route === route && i.breakpoint === bp.label);
      return {
        viewport: bp.label,
        width: bp.width,
        height: bp.height,
        file,
        relPath: `../screenshots/${file}`,
        exists,
        status: !exists ? 'missing' : issue ? 'fail' : 'pass',
        note: issue ? issue.msg : '',
      };
    });

    routes.push({
      route,
      slug,
      pageName,
      section,
      routeType,
      canonicalStatus: ROUTE_CANONICAL_STATUS[route] || null,
      pageTitle: title,
      previewUrl: `http://localhost:4321${route}`,
      screenshots,
    });
  }

  const orphanFiles = [...actualFiles].filter((f) => !expectedFiles.has(f)).sort();
  const routesWithoutScreenshots = routes.filter((r) => r.screenshots.every((s) => !s.exists)).map((r) => r.route);

  const allShots = routes.flatMap((r) => r.screenshots);
  const summary = {
    totalRoutes: routes.length,
    totalScreenshotsExpected: allShots.length,
    totalScreenshotsFound: allShots.filter((s) => s.exists).length,
    passed: allShots.filter((s) => s.status === 'pass').length,
    failed: allShots.filter((s) => s.status === 'fail').length,
    missing: allShots.filter((s) => s.status === 'missing').length,
    duplicateScreenshotCount: slugCollisions.length,
    orphanScreenshotCount: orphanFiles.length,
    orphanScreenshots: orphanFiles,
    routesWithoutScreenshots,
    generatedAt: new Date().toISOString(),
  };

  const manifest = { sectionOrder: SECTION_ORDER, breakpoints: BREAKPOINTS, routes, summary };

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const html = renderHtml(manifest);
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html);

  console.log('=== Owner review package generated ===');
  console.log(`Routes: ${summary.totalRoutes}`);
  console.log(`Screenshots expected: ${summary.totalScreenshotsExpected}  found: ${summary.totalScreenshotsFound}`);
  console.log(`Passed: ${summary.passed}  Failed: ${summary.failed}  Missing: ${summary.missing}`);
  console.log(`Duplicate slugs: ${summary.duplicateScreenshotCount}  Orphan screenshots: ${summary.orphanScreenshotCount}`);
  if (summary.routesWithoutScreenshots.length) console.log(`Routes without screenshots: ${summary.routesWithoutScreenshots.join(', ')}`);
  if (orphanFiles.length) console.log(`Orphan files: ${orphanFiles.join(', ')}`);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderHtml(manifest) {
  const { routes, summary } = manifest;
  const bySection = new Map();
  for (const r of routes) {
    if (!bySection.has(r.section)) bySection.set(r.section, []);
    bySection.get(r.section).push(r);
  }

  const sectionsHtml = manifest.sectionOrder
    .filter((s) => bySection.has(s))
    .map((section) => {
      const pages = bySection.get(section);
      const pagesHtml = pages
        .map((r) => {
          const shotsHtml = r.screenshots
            .map(
              (s) => `
          <figure class="shot" data-viewport="${esc(s.viewport)}" data-status="${esc(s.status)}">
            <a href="${esc(s.relPath)}" target="_blank" rel="noopener">
              ${s.exists ? `<img src="${esc(s.relPath)}" alt="${esc(r.pageName)} at ${s.width}px (${esc(s.viewport)})" loading="lazy" />` : `<div class="missing-shot">missing</div>`}
            </a>
            <figcaption>
              <span class="vp">${s.width}px &middot; ${esc(s.viewport)}</span>
              <span class="status status-${esc(s.status)}">${esc(s.status)}</span>
              <span class="path">${esc(s.file)}</span>
              ${s.note ? `<span class="note">${esc(s.note)}</span>` : ''}
            </figcaption>
          </figure>`
            )
            .join('');

          return `
      <article class="page-card"
        data-section="${esc(r.section)}"
        data-route-type="${esc(r.routeType)}"
        data-canonical-status="${esc(r.canonicalStatus || '')}"
        data-status="${r.screenshots.some((s) => s.status === 'fail') ? 'fail' : r.screenshots.some((s) => s.status === 'missing') ? 'missing' : 'pass'}">
        <header class="page-card-head">
          <div>
            <h3>${esc(r.pageName)}</h3>
            <code class="route">${esc(r.route)}</code>
          </div>
          <div class="page-meta">
            <span class="badge badge-type">${esc(r.routeType)}</span>
            ${r.canonicalStatus ? `<span class="badge badge-status">${esc(r.canonicalStatus)}</span>` : ''}
          </div>
        </header>
        <p class="page-title">${r.pageTitle ? esc(r.pageTitle) : '<em>title not found in dist/</em>'}</p>
        <p class="page-link"><a href="${esc(r.previewUrl)}" target="_blank" rel="noopener">Open in local preview &rarr;</a> <span class="hint">(requires <code>npm run preview</code> running)</span></p>
        <div class="shots">${shotsHtml}</div>
      </article>`;
        })
        .join('');

      return `
    <section class="section-group" data-section-name="${esc(section)}">
      <h2>${esc(section)} <span class="count">${pages.length} page${pages.length === 1 ? '' : 's'}</span></h2>
      <div class="page-grid">${pagesHtml}</div>
    </section>`;
    })
    .join('');

  const sectionOptions = manifest.sectionOrder.filter((s) => bySection.has(s));
  const viewportOptions = manifest.breakpoints.map((b) => b.label);
  const statusOptions = ['pass', 'fail', 'missing'];
  const routeTypeOptions = [...new Set(routes.map((r) => r.routeType))];
  const canonicalStatusOptions = [...new Set(routes.map((r) => r.canonicalStatus).filter(Boolean))];

  const opt = (values) => values.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>ByteLite LLC - Owner Review (QA, local only)</title>
<meta name="robots" content="noindex, nofollow" />
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, Segoe UI, sans-serif; margin: 0; background: #0d1120; color: #e4e7f2; }
  header.top { position: sticky; top: 0; z-index: 10; background: #0d1120ee; backdrop-filter: blur(8px); border-bottom: 1px solid #1a2235; padding: 1rem 1.5rem; }
  header.top h1 { margin: 0 0 .25rem; font-size: 1.25rem; }
  .subtitle { color: #7b829e; font-size: .8125rem; margin: 0 0 .75rem; }
  .summary { display: flex; flex-wrap: wrap; gap: .5rem 1.25rem; font-size: .8125rem; color: #a5b4fc; margin-bottom: .75rem; }
  .summary b { color: #e4e7f2; }
  .filters { display: flex; flex-wrap: wrap; gap: .5rem; }
  .filters select { background: #171b2e; color: #e4e7f2; border: 1px solid #2a3352; border-radius: .375rem; padding: .375rem .5rem; font-size: .8125rem; }
  main { padding: 1.5rem; max-width: 1600px; margin: 0 auto; }
  .section-group { margin-bottom: 2.5rem; }
  .section-group h2 { font-size: 1.0625rem; border-bottom: 1px solid #1a2235; padding-bottom: .5rem; }
  .section-group h2 .count { color: #555e7a; font-weight: 400; font-size: .8125rem; }
  .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 1rem; margin-top: 1rem; }
  .page-card { border: 1px solid #1a2235; border-radius: .5rem; padding: 1rem; background: #10142280; }
  .page-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: .5rem; }
  .page-card-head h3 { margin: 0 0 .25rem; font-size: .9375rem; }
  code.route { font-size: .75rem; color: #7b829e; }
  .page-meta { display: flex; gap: .375rem; flex-wrap: wrap; justify-content: flex-end; }
  .badge { font-size: .6875rem; border-radius: .25rem; padding: .125rem .4375rem; white-space: nowrap; }
  .badge-type { background: #1a2235; color: #a5b4fc; }
  .badge-status { background: #2a1f3d; color: #d8b4fe; }
  .page-title { font-size: .8125rem; color: #7b829e; margin: .5rem 0; }
  .page-link { font-size: .75rem; margin: 0 0 .75rem; }
  .page-link a { color: #818cf8; }
  .page-link .hint { color: #555e7a; }
  .shots { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .5rem; }
  .shot { margin: 0; }
  .shot img { width: 100%; border-radius: .25rem; border: 1px solid #1a2235; display: block; background: #0a0c14; }
  .missing-shot { width: 100%; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; background: #2a1414; color: #f87171; font-size: .75rem; border-radius: .25rem; }
  .shot figcaption { display: flex; flex-direction: column; gap: .125rem; font-size: .6875rem; color: #555e7a; margin-top: .25rem; }
  .status { font-weight: 600; }
  .status-pass { color: #4ade80; }
  .status-fail { color: #f87171; }
  .status-missing { color: #fbbf24; }
  .note { color: #f87171; }
  [hidden] { display: none !important; }
  @media (prefers-color-scheme: light) {
    body { background: #f7f8fc; color: #1a1f36; }
    header.top { background: #f7f8fceE; border-bottom-color: #dfe3ee; }
    .page-card { background: #fff; border-color: #dfe3ee; }
  }
</style>
</head>
<body>
<header class="top">
  <h1>ByteLite LLC - Owner Review Package</h1>
  <p class="subtitle">Local QA evidence only. Generated ${esc(summary.generatedAt)}. Not part of the production site.</p>
  <div class="summary">
    <span><b>${summary.totalRoutes}</b> routes</span>
    <span><b>${summary.totalScreenshotsFound}</b>/<b>${summary.totalScreenshotsExpected}</b> screenshots</span>
    <span class="status-pass"><b>${summary.passed}</b> passed</span>
    <span class="status-fail"><b>${summary.failed}</b> failed</span>
    <span class="status-missing"><b>${summary.missing}</b> missing</span>
    <span><b>${summary.duplicateScreenshotCount}</b> duplicate slugs</span>
    <span><b>${summary.orphanScreenshotCount}</b> orphan screenshots</span>
  </div>
  <div class="filters">
    <select id="f-section"><option value="">All sections</option>${opt(sectionOptions)}</select>
    <select id="f-viewport"><option value="">All viewports</option>${opt(viewportOptions)}</select>
    <select id="f-status"><option value="">All statuses</option>${opt(statusOptions)}</select>
    <select id="f-routetype"><option value="">All route types</option>${opt(routeTypeOptions)}</select>
    <select id="f-canonical"><option value="">All canonical statuses</option>${opt(canonicalStatusOptions)}</select>
  </div>
</header>
<main>${sectionsHtml}</main>
<script id="manifest-data" type="application/json">${JSON.stringify(manifest)}</script>
<script>
(function () {
  var manifest = JSON.parse(document.getElementById('manifest-data').textContent);

  function val(id) { return document.getElementById(id).value; }

  function applyFilters() {
    var section = val('f-section'), viewport = val('f-viewport'), status = val('f-status'),
        routeType = val('f-routetype'), canonical = val('f-canonical');

    document.querySelectorAll('.page-card').forEach(function (card) {
      var matches =
        (!section || card.dataset.section === section) &&
        (!routeType || card.dataset.routeType === routeType) &&
        (!canonical || card.dataset.canonicalStatus === canonical) &&
        (!status || card.dataset.status === status || card.querySelector('.shot[data-status="' + status + '"]'));
      card.hidden = !matches;

      card.querySelectorAll('.shot').forEach(function (shot) {
        var shotMatches =
          (!viewport || shot.dataset.viewport === viewport) &&
          (!status || shot.dataset.status === status);
        shot.hidden = !shotMatches;
      });
    });

    document.querySelectorAll('.section-group').forEach(function (group) {
      var anyVisible = Array.prototype.some.call(group.querySelectorAll('.page-card'), function (c) { return !c.hidden; });
      group.hidden = !anyVisible;
    });
  }

  ['f-section', 'f-viewport', 'f-status', 'f-routetype', 'f-canonical'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
})();
</script>
</body>
</html>`;
}

main();
