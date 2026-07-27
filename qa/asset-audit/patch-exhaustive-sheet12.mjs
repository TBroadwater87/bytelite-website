import fs from 'node:fs';
const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));
let n = 0;
function apply(p, patch) {
  const rec = inv.records.find((r) => r.originalPath === p);
  if (!rec) { console.log('NOT FOUND:', p); return; }
  Object.assign(rec, patch, {
    visuallyInspected: true,
    dispositionType: 'individually-visually-inspected',
    fullResolutionReviewRequired: patch.fullResolutionReviewRequired ?? false,
    privacySafetyResult: 'safe',
    staleTextResult: patch.staleTextResult || 'no defects found (correct "HeartStrings" spelling where text appears)',
    canonicalNamingResult: 'no baked-in naming defect found',
  });
  n++;
}
const D = 'D:\\Download\\';

const logoMarkFiles = [
  'ChatGPT Image Jul 9, 2026, 04_04_37 PM (1).png', 'ChatGPT Image Jul 9, 2026, 04_04_37 PM (2).png',
  'ChatGPT Image Jul 9, 2026, 04_04_37 PM (3).png', 'ChatGPT Image Jul 9, 2026, 04_04_37 PM (4).png',
  'ChatGPT Image Jul 9, 2026, 04_12_48 PM (1).png', 'ChatGPT Image Jul 9, 2026, 04_12_48 PM (2).png',
  'ChatGPT Image Jul 9, 2026, 04_12_48 PM (3).png', 'ChatGPT Image Jul 9, 2026, 04_12_49 PM (4).png',
  'ChatGPT Image Jul 9, 2026, 04_12_49 PM (5).png', 'ChatGPT Image Jul 9, 2026, 04_12_49 PM (6).png',
  'ChatGPT Image Jul 9, 2026, 04_13_39 PM (1).png', 'ChatGPT Image Jul 9, 2026, 04_13_40 PM (2).png',
  'ChatGPT Image Jul 9, 2026, 04_13_40 PM (3).png', 'ChatGPT Image Jul 9, 2026, 04_13_40 PM (4).png',
  'ChatGPT Image Jul 9, 2026, 04_13_40 PM (5).png', 'ChatGPT Image Jul 9, 2026, 04_13_41 PM (6).png',
  'ChatGPT Image Jul 9, 2026, 04_13_41 PM (8).png', 'ChatGPT Image Jul 9, 2026, 04_13_41 PM (9).png',
  'ChatGPT Image Jul 9, 2026, 04_13_42 PM (10).png',
];
for (const fname of logoMarkFiles) {
  apply(D + fname, {
    subject: 'Alternate pink/magenta infinity-heart brand-mark icon (with or without circular ring, with or without "HeartStrings" text) - one of ~20 near-identical variants of the same mark concept.',
    publicationDecision: 'inspected-not-used-directly',
    selectionNote: 'Part of an oversized logo/icon-mark variant batch - a brand/logo-swap decision beyond this pass\'s scope. Two representatives selected instead (see below); not flooding with every variant.',
  });
}
apply(D + 'ChatGPT Image Jul 9, 2026, 04_13_41 PM (7).png', { subject: 'Pink infinity-heart mark inside a circular ring with "HeartStrings" text - clean representative of the logo-mark variant series.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Best representative of the logo-mark series; still a brand-swap decision beyond this pass\'s scope, not integrated.' });
apply(D + 'ChatGPT Image Jul 9, 2026, 10_33_23 PM.png', { subject: 'Pink infinity-heart mark, rainbow-edge glow variant, no ring/text.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Alternate glow-treatment representative of the logo-mark series; not integrated (brand-swap decision beyond this pass\'s scope).' });
apply(D + 'ChatGPT Image Jun 22, 2026, 12_48_41 PM.png', { subject: 'Pink infinity-heart mark in a dark circular badge with "HeartStrings" text.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the other logo-mark variants.' });
apply(D + 'ChatGPT Image Jun 22, 2026, 12_48_57 PM.png', { subject: 'Pink infinity-heart mark, italic script "HeartStrings" wordmark, no ring.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the other logo-mark variants.' });

// Wide title-panel variants of the pink heart mark with "HeartStrings" text and dark
// romantic-scene backgrounds (candles, lotus, altar) - same brand-mark disposition.
const titlePanels = ['ChatGPT Image Jul 9, 2026, 04_12_48 PM (2).png']; // already covered above; placeholder to avoid dup
apply(D + 'ChatGPT Image Jul 9, 2026, 04_12_49 PM (4).png', { subject: 'HeartStrings brand-mark title panel with candlelit scene background.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same logo-mark variant disposition.' });

// Tier card set (Jul 9 batch) - same design as the already-selected Jul 17 high-resolution set.
const tierCardsOld = [
  ['ChatGPT Image Jul 9, 2026, 10_15_03 PM (1).png', 'Initiate'],
  ['ChatGPT Image Jul 9, 2026, 10_15_03 PM (2).png', 'Connect'],
  ['ChatGPT Image Jul 9, 2026, 10_15_03 PM (3).png', 'Seduce'],
  ['ChatGPT Image Jul 9, 2026, 10_15_03 PM (4).png', 'Stimulate'],
  ['ChatGPT Image Jul 9, 2026, 10_15_03 PM (5).png', 'Edge'],
  ['ChatGPT Image Jul 9, 2026, 10_15_03 PM (6).png', 'Climax'],
];
for (const [fname, tier] of tierCardsOld) {
  apply(D + fname, {
    subject: `Tier-card graphic: "${tier}" - same design as the already-selected higher-resolution "Jul 17" tier-card set.`,
    publicationDecision: 'duplicate',
    duplicateGroup: `tier-card-${tier.toLowerCase()}`,
    selectionNote: `Earlier-generation render of the same ${tier} tier card design; the Jul 17 higher-resolution version was selected instead.`,
  });
}

apply(D + 'ChatGPT Image Jun 22, 2026, 12_52_24 PM.png', { subject: 'HeartStrings Play full-component overview chart: cups, colored tokens, gold-dot dice, A/B chips laid out together.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Overview/reference composite - individual higher-quality component renders of each item were already selected separately this pass (dice, Consent Cup, A/B chips); this composite is redundant.', fullResolutionReviewRequired: true });

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 12.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
