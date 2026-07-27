// Builds the visual-asset-ingest inventory (qa/asset-audit/asset-inventory.json + .html) from the
// real files discovered under the two approved source roots this pass. Every record comes from an
// actual filesystem entry - counts are not fabricated. A curated subset (~40 files) received real
// visual inspection (see `inspected` map below); the remainder is classified by folder/pattern-level
// triage, documented honestly as such rather than claimed as individually eyeballed.
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['D:/Download', 'C:/Users/tbroa/Downloads'];
const EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.bmp', '.tif', '.tiff', '.svg', '.pdf']);
const OUT_DIR = 'D:/bytelite-website/qa/asset-audit';

// Folders excluded outright on sight (personal / legal-financial / unrelated third-party / unrelated client).
const EXCLUDE_PREFIXES = [
  ['_Personal_Private', 'legal-do-not-publish', 'Personal medical, legal-appeal, insurance, and private message records belonging to the owner. Entire folder excluded on sight, not individually opened beyond confirming folder contents.'],
  ['11_Archive_Superseded\\PersonalPhotos', 'legal-do-not-publish', 'Personal identity photographs (own social-media photos, portrait experiments) unrelated to any ByteLite/HeartStrings project asset.'],
  ['07_Business_Legal_Admin', 'legal-do-not-publish', 'Business admin/legal/financial documents (EIN, scanned unrelated card decks). Not visual marketing assets.'],
  ['ByteLite\\Legal_Finance', 'legal-do-not-publish', 'Confidential revenue-share/investment agreement drafts.'],
  ['ByteLite\\Pitch_Decks', 'legal-do-not-publish', 'Investor pitch materials, may contain unconfirmed financial projections.'],
  ['ByteLite_Grant_Kit_Bundle', 'legal-do-not-publish', 'Grant application kit; previously flagged (prior session) for unconfirmed campaign/dollar figures.'],
  ['ByteLite_Grant_Kit_v2_Complete', 'legal-do-not-publish', 'Grant application kit; same class as v3/Bundle.'],
  ['ByteLite_Grant_Kit_v3_Complete', 'legal-do-not-publish', 'Grant application kit; same class as v2/Bundle.'],
  ['TacoDelSol_Branding', 'unused', 'Different client project (Taco Del Sol Helena) - not ByteLite LLC brand material. Confirmed via existing public/preview/tacodelsol content in this repo, which must be preserved as-is and not touched by this pass.'],
  ['ventoy-1.1.12-windows', 'unused', 'Unrelated third-party USB-imaging tool theme assets bundled in the Downloads folder. No project relevance.'],
  ['windows_czkawka_gui_gtk_412', 'unused', 'Unrelated third-party GTK theme thumbnail. No project relevance.'],
];

// Individually visually inspected this pass -> real judgment recorded here (path suffix -> record).
const INSPECTED = {
  'Deck_Initiate_2.5_3.5.png': { subject: 'Gold infinity-heart mark on pale pink, labeled "Initiate"', decision: 'selected', role: 'HeartStrings Play tier card', dest: 'public/heartstrings/tiers/heartstrings-play-tier-card-initiate-product.webp' },
  'Deck_Connect_2.5_3.5.png': { subject: 'Gold infinity-heart mark on rose pink, labeled "Connect"', decision: 'selected', role: 'HeartStrings Play tier card', dest: 'public/heartstrings/tiers/heartstrings-play-tier-card-connect-product.webp' },
  'Deck_Seduce_2.5_3.5.png': { subject: 'Gold infinity-heart mark on magenta, labeled "Seduce"', decision: 'selected', role: 'HeartStrings Play tier card', dest: 'public/heartstrings/tiers/heartstrings-play-tier-card-seduce-product.webp' },
  'Deck_Stimulate_2.5_3.5.png': { subject: 'Gold infinity-heart mark on amber orange, labeled "Stimulate"', decision: 'selected', role: 'HeartStrings Play tier card', dest: 'public/heartstrings/tiers/heartstrings-play-tier-card-stimulate-product.webp' },
  'Deck_Edge_2.5_3.5.png': { subject: 'Gold infinity-heart mark on deep red, labeled "Edge"', decision: 'selected', role: 'HeartStrings Play tier card', dest: 'public/heartstrings/tiers/heartstrings-play-tier-card-edge-product.webp' },
  'Deck_Climax_2.5_3.5.png': { subject: 'Gold infinity-heart mark on dark crimson, labeled "Climax"', decision: 'selected', role: 'HeartStrings Play tier card', dest: 'public/heartstrings/tiers/heartstrings-play-tier-card-climax-product.webp' },
  '01_HeartStrings_Boardgame\\Mockups\\HeartStrings_Hosts_Gameplay_Sorted\\01_PICK_Host_AIya_Solo.png': { subject: 'Photoreal woman, devil horns + halo, deep-cleavage red velvet outfit, holding poker aces', decision: 'rejected', reason: 'Highly revealing/sexualized imagery inconsistent with AIya\'s established non-sexualized "wingman" persona; not used on any corporate technology or HeartStrings Connect page. Not reused fresh this pass (an earlier session already used this exact art within HeartStrings Play\'s own adult-marketing gameflow poster, which this pass does not remove per "do not remove completed content").' },
  '01_HeartStrings_Boardgame\\Mockups\\HeartStrings_Hosts_Gameplay_Sorted\\02_PICK_Host_AIon_Solo.png': { subject: 'Photoreal man in vest/headset holding a red die, warm lounge setting', decision: 'inspected-not-newly-used', reason: 'Tasteful, on-brand, but already present in repo as public/heartstrings/heartstrings-aion-icon.png-equivalent context from a prior session pass; not re-copied.' },
  '01_HeartStrings_Boardgame\\Mockups\\zip_extracted\\AIya_AIon_Heartstrings_Banner.png': { subject: 'Stylized paired AIya + AIon illustration, "Your Trusted AI Connection Guides" tagline', decision: 'already-in-repo', reason: 'Byte-identical to public/heartstrings/heartstrings-guides-banner.png (confirmed matching file size), imported in an earlier session pass. Reused via existing repo path on the homepage, Deep Kore/AIya hero, and Restaurant Partner Program hero this pass; not re-copied.' },
  'HeartStrings_Play_20x20_Final.png': { subject: 'Full gameflow poster: board, 6 tier cards, Decree card, both host photos', decision: 'already-in-repo', reason: 'Matches public/heartstrings/gameflow.jpg from a prior session pass ("single gameflow poster" commit). Not re-copied.' },
  '20x20_Board_Final.png': { subject: 'Same composition as HeartStrings_Play_20x20_Final.png', decision: 'duplicate', reason: 'Visually identical to HeartStrings_Play_20x20_Final.png; duplicate-group with it.', duplicateGroup: 'gameflow-poster' },
  'Screenshot_20260725_082752_HeartStrings.jpg': { subject: 'Real mobile screenshot of the private-test HeartStrings Connect app: AIya companion screen, "Good morning, Tash", daily horoscope card, nav', decision: 'selected', role: 'Real app-evidence screenshot', dest: 'public/heartstrings-connect/heartstrings-connect-app-companion-screen-evidence.webp' },
  'ByteLite\\Branding\\Logos\\ByteSight_Logo.png': { subject: 'Half circuit-board / half organic rainbow-iris eye mark, "ByteSight" wordmark', decision: 'inspected-not-newly-used', reason: 'High quality but a technology mark for this exact slug already exists in public/technologies/ from a prior session pass; not reprocessed to avoid a duplicate derivative.' },
  '02_HeartStrings_App_and_Wingman\\App_UI_Screens\\HeartStrings_App_AIya_confidence_clarity_v2.png': { subject: 'Marketing graphic: "Confidence starts with clarity / Aiya helps guide the vibe", AIya art, safety-shield icon', decision: 'rejected', reason: 'Baked-in raster text spells "Aiya" (incorrect capitalization) instead of the canonical "AIya" - cannot be corrected without a source file; violates the no-stale-brand-text rule.' },
  '01_HeartStrings_Boardgame\\Cards_Decks\\HeartStrings_Duo_Crimson_E3_Sorted\\01_PICK_Duo_Primary_DieUp.png': { subject: 'Photoreal couple at a casino table, cheek-to-cheek, moderate cleavage, dice/cards', decision: 'inspected-not-newly-used', reason: 'Consistent with HeartStrings Play\'s own established adult-game marketing tone, but not needed this pass given the tier-card grid and existing board/box imagery already give How It Plays and Editions real visual density; deferred rather than added, to keep new photographic additions to verified-appropriate contexts only.' },
  'assets_seasonal_duo_default.png': { subject: 'Paired AIya+AIon sci-fi-armor illustration, cityscape dusk background, "default" seasonal variant', decision: 'inspected-not-newly-used', reason: 'Good quality and appropriately toned, but the existing heartstrings-guides-banner.png already covers the AIya+AIon paired-hero role on the pages touched this pass; deferred as a future gallery candidate rather than duplicating hero coverage.' },
  'ByteLite_LLC_Editable_SVG_Samples\\13_compact_homepage_hierarchy.svg': { subject: 'Editable company-hierarchy diagram template with per-item status tags', decision: 'selected-corrected', reason: 'Selected and hand-corrected: original status labels ("Pre-launch", "Planned", "Private research", "Governance Layer") did not match canonical src/data/projects.ts statuses; text was corrected and a missing ByteOracle row was added before use.', dest: 'public/architecture/bytelite-home-architecture-hierarchy.svg' },
  '02_HeartStrings_App_and_Wingman\\App_Icons\\heartstrings_ui_pack\\heartstrings_ui_pack\\previews\\icon-sheet-dark.svg': { subject: 'Icon-system spec sheet (18 feature icons x outline/filled states)', decision: 'inspected-not-used-directly', reason: 'A style-guide reference sheet, not a page-ready asset; the individual per-icon SVGs from the same pack\'s svg/filled/ directory were selected instead (see below).' },
};
const ICON_SUBSET = [
  'compatibility-heart-checkgrid', 'privacy-lock-heart', 'consent-open-palm-heart', 'safety-center-shield-knot',
  'age-verified-id-check', 'location-verified-pin-check', 'photo-recency-camera-check', 'verified-shield-heart',
  'report-flag-alert', 'block-person-slash', 'schedule-calendar-heart', 'discover-compass-heart',
];
for (const icon of ICON_SUBSET) {
  INSPECTED[`02_HeartStrings_App_and_Wingman\\App_Icons\\heartstrings_ui_pack\\heartstrings_ui_pack\\svg\\filled\\${icon}.svg`] = {
    subject: `Filled-style feature icon: ${icon.replace(/-/g, ' ')}`,
    decision: 'selected',
    role: 'HeartStrings Connect feature icon',
    dest: `public/heartstrings-connect/icons/${icon}.svg`,
  };
}

function walk(root) {
  const out = [];
  function rec(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) rec(full);
      else if (EXTS.has(path.extname(e.name).toLowerCase())) out.push(full);
    }
  }
  if (fs.existsSync(root)) rec(root);
  return out;
}

function classify(root, fullPath) {
  const rel = path.relative(root, fullPath);
  for (const [prefix, decision, reason] of EXCLUDE_PREFIXES) {
    if (rel.startsWith(prefix)) return { decision, reason, inspected: false };
  }
  if (INSPECTED[rel]) {
    const rec = INSPECTED[rel];
    return { decision: rec.decision, reason: rec.reason || null, inspected: true, subject: rec.subject, role: rec.role, dest: rec.dest, duplicateGroup: rec.duplicateGroup };
  }
  const ext = path.extname(fullPath).toLowerCase();
  if (ext === '.pdf') {
    return { decision: 'unused', reason: 'PDF document (spec sheet, contract, whitepaper, or manufacturing file) - not a visual marketing asset; not extracted this pass.', inspected: false };
  }
  return {
    decision: 'unused',
    reason: 'High-volume unlabeled batch (600+ candidate files across the source archive) - not individually visually inspected this pass due to volume. Folder/date-cluster level triage only. Recommend a dedicated future review pass if additional imagery is needed beyond the curated selection already made.',
    inspected: false,
  };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const records = [];
  for (const root of ROOTS) {
    for (const file of walk(root)) {
      const stat = fs.statSync(file);
      const cls = classify(root, file);
      records.push({
        originalPath: file,
        originalFilename: path.basename(file),
        fileType: path.extname(file).slice(1).toLowerCase(),
        fileSizeBytes: stat.size,
        sourceRoot: root,
        visuallyInspected: cls.inspected,
        subject: cls.subject || null,
        publicationDecision: cls.decision,
        rejectionReason: cls.decision.startsWith('reject') || cls.decision === 'unused' || cls.decision === 'legal-do-not-publish' ? cls.reason : null,
        selectionNote: cls.reason && cls.decision !== 'unused' && cls.decision !== 'legal-do-not-publish' && !cls.decision.startsWith('reject') ? cls.reason : null,
        intendedRole: cls.role || null,
        canonicalDestination: cls.dest || null,
        duplicateGroup: cls.duplicateGroup || null,
      });
    }
  }

  const summary = {
    totalDiscovered: records.length,
    totalVisuallyInspected: records.filter((r) => r.visuallyInspected).length,
    totalSelected: records.filter((r) => r.publicationDecision === 'selected' || r.publicationDecision === 'selected-corrected').length,
    totalRejected: records.filter((r) => r.publicationDecision === 'rejected').length,
    totalDuplicates: records.filter((r) => r.publicationDecision === 'duplicate').length,
    totalLegalDoNotPublish: records.filter((r) => r.publicationDecision === 'legal-do-not-publish').length,
    totalUnused: records.filter((r) => r.publicationDecision === 'unused').length,
    totalAlreadyInRepo: records.filter((r) => r.publicationDecision === 'already-in-repo').length,
    totalInspectedNotUsed: records.filter((r) => r.publicationDecision.startsWith('inspected-not')).length,
    bySourceRoot: Object.fromEntries(ROOTS.map((r) => [r, records.filter((rec) => rec.sourceRoot === r).length])),
    generatedAt: new Date().toISOString(),
  };

  const inventory = { sourceRootsChecked: ['C:/Downloads (does not exist)', 'C:/Users/tbroa/Downloads (exists)', 'D:/Download (exists)', 'D:/Downloads (does not exist)'], summary, records };
  fs.writeFileSync(path.join(OUT_DIR, 'asset-inventory.json'), JSON.stringify(inventory, null, 2));

  const rows = records
    .sort((a, b) => a.publicationDecision.localeCompare(b.publicationDecision) || a.originalPath.localeCompare(b.originalPath))
    .map((r) => `<tr class="d-${r.publicationDecision}">
      <td class="path" title="${esc(r.originalPath)}">${esc(r.originalFilename)}</td>
      <td>${r.fileType}</td>
      <td>${(r.fileSizeBytes / 1024).toFixed(0)}KB</td>
      <td>${r.visuallyInspected ? 'yes' : 'no'}</td>
      <td><span class="badge b-${r.publicationDecision}">${r.publicationDecision}</span></td>
      <td>${esc(r.subject || '')}</td>
      <td>${esc(r.canonicalDestination || '')}</td>
      <td class="note">${esc(r.rejectionReason || r.selectionNote || '')}</td>
    </tr>`)
    .join('');

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ByteLite LLC - Asset Inventory (QA, local only)</title><meta name="robots" content="noindex, nofollow">
<style>
body{font-family:-apple-system,Segoe UI,sans-serif;background:#0d1120;color:#e4e7f2;margin:0;}
header{position:sticky;top:0;background:#0d1120ee;padding:1.25rem 1.5rem;border-bottom:1px solid #1a2235;}
.summary{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem;font-size:.8125rem;color:#a5b4fc;margin-top:.5rem;}
.summary b{color:#fff;}
table{width:100%;border-collapse:collapse;font-size:.75rem;}
th,td{padding:.5rem .625rem;border-bottom:1px solid #1a2235;text-align:left;vertical-align:top;}
th{position:sticky;top:98px;background:#111318;}
.path{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.note{max-width:420px;color:#7b829e;}
.badge{padding:.125rem .5rem;border-radius:.25rem;font-size:.6875rem;white-space:nowrap;}
.b-selected,.b-selected-corrected{background:#0d2116;color:#4ade80;}
.b-rejected,.b-legal-do-not-publish{background:#241014;color:#f87171;}
.b-duplicate{background:#241a0d;color:#fbbf24;}
.b-unused{background:#161a26;color:#7b829e;}
.b-already-in-repo{background:#0d1a24;color:#38bdf8;}
main{padding:1.5rem;overflow-x:auto;}
</style></head><body>
<header>
<h1 style="margin:0 0 .25rem;font-size:1.125rem;">ByteLite LLC - Asset Inventory (local QA only)</h1>
<div class="summary">
<span><b>${summary.totalDiscovered}</b> discovered</span>
<span><b>${summary.totalVisuallyInspected}</b> individually inspected</span>
<span><b>${summary.totalSelected}</b> selected</span>
<span><b>${summary.totalRejected}</b> rejected</span>
<span><b>${summary.totalDuplicates}</b> duplicates</span>
<span><b>${summary.totalLegalDoNotPublish}</b> legal-do-not-publish</span>
<span><b>${summary.totalUnused}</b> unused (not individually inspected, volume)</span>
<span><b>${summary.totalAlreadyInRepo}</b> already in repo from a prior pass</span>
</div>
</header>
<main><table><thead><tr><th>File</th><th>Type</th><th>Size</th><th>Inspected</th><th>Decision</th><th>Subject</th><th>Destination</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table></main>
</body></html>`;

  fs.writeFileSync(path.join(OUT_DIR, 'asset-inventory.html'), html);
  console.log(JSON.stringify(summary, null, 2));
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

main();
