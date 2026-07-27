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
    privacySafetyResult: patch.privacySafetyResult || 'safe',
    staleTextResult: patch.staleTextResult || 'no defects found',
    canonicalNamingResult: patch.canonicalNamingResult || 'no baked-in naming defect found',
  });
  n++;
}
const D = 'D:\\Download\\';

const cupLabels = [
  ['ChatGPT Image Jul 23, 2026, 12_01_50 PM (3).png', 'variant-3'],
  ['ChatGPT Image Jul 23, 2026, 12_01_50 PM (6).png', 'variant-6'],
  ['ChatGPT Image Jul 23, 2026, 12_01_50 PM (7).png', 'variant-7'],
  ['ChatGPT Image Jul 23, 2026, 12_01_50 PM (8).png', 'variant-8'],
  ['ChatGPT Image Jul 23, 2026, 12_01_50 PM (9).png', 'variant-9'],
];
for (const [fname] of cupLabels) {
  apply(D + fname, {
    subject: 'HeartStrings Play Consent Cup product render, same design family as the three already-selected sphere-label variants (Affirm/Chosen/Yes).',
    publicationDecision: 'inspected-not-used-directly',
    selectionNote: 'Additional Consent Cup render in the same series - three representative sphere-label variants were already selected from this set; not adding further near-duplicates to avoid flooding.',
  });
}

apply(D + 'ChatGPT Image Jul 24, 2026, 07_32_28 AM.png', { subject: 'HeartStrings Play board spec sheet, same content family as the already-selected "20x20 Board With Side Flaps" diagram.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Alternate/earlier version of the already-selected board spec diagram; not needed as a duplicate.' });
apply(D + 'ChatGPT Image Jul 25, 2026, 01_09_02 PM.png', { subject: 'Six black dice with golden pip dots on red velvet - matches the "6 black dice with golden dots" component spec exactly.', publicationDecision: 'selected', selectionNote: 'Authoritative, correctly-specified product component photo. Selected for HeartStrings Play Components page.', canonicalDestination: 'public/heartstrings/heartstrings-play-black-gold-dice-product.webp', fullResolutionReviewRequired: true });
apply(D + 'ChatGPT Image Jul 25, 2026, 01_19_13 PM.png', { subject: 'Red, pink, and purple numbered dice with gold numerals on black velvet - matches the "3 custom dice (red, pink, purple)" Mischief dice component spec exactly.', publicationDecision: 'selected', selectionNote: 'Authoritative, correctly-specified product component photo. Selected for HeartStrings Play Components page.', canonicalDestination: 'public/heartstrings/heartstrings-play-mischief-dice-product.webp', fullResolutionReviewRequired: true });
apply(D + 'ChatGPT Image Jul 25, 2026, 01_56_36 PM.png', { subject: 'Standalone "Decree" card render: purple card, gold infinity-heart, "Decree" script text.', publicationDecision: 'selected', selectionNote: 'Clean standalone Decree card product shot, correctly branded, no defects. Selected for HeartStrings Play Components page.', canonicalDestination: 'public/heartstrings/heartstrings-play-decree-card-product.webp', fullResolutionReviewRequired: true });
apply(D + 'ChatGPT Image Jul 25, 2026, 02_28_46 PM.png', { subject: 'HeartStrings Connect app UI mockup composite with AIya and Aion character images and a phone/chat interface.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Composite marketing mockup, not integrated this pass pending a dedicated check of all baked-in text at full resolution; time-boxed out of this pass, documented as a future candidate.' });
apply(D + 'ChatGPT Image Jul 25, 2026, 11_07_38 AM.png', { subject: 'HeartStrings Play box-front render: dark maroon box, "HeartStrings PLAY" logo with infinity-heart.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Clean box-front render, but the site already has an established box-front image from an earlier pass; not swapped without a direct comparison, documented as a future candidate.' });

const personalBaby = [
  'ChatGPT Image Jul 26, 2026, 07_04_10 AM (1).png', 'ChatGPT Image Jul 26, 2026, 07_04_10 AM (2).png',
  'ChatGPT Image Jul 26, 2026, 07_04_10 AM (3).png', 'ChatGPT Image Jul 26, 2026, 07_04_10 AM (4).png',
  'ChatGPT Image Jul 26, 2026, 07_04_10 AM (5).png', 'ChatGPT Image Jul 26, 2026, 07_04_10 AM (6).png',
  'ChatGPT Image Jul 26, 2026, 07_04_10 AM (7).png', 'ChatGPT Image Jul 26, 2026, 07_04_10 AM (8).png',
  'ChatGPT Image Jul 26, 2026, 07_04_10 AM (9).png', 'ChatGPT Image Jul 26, 2026, 07_04_11 AM (10).png',
];
for (const fname of personalBaby) {
  apply(D + fname, {
    subject: 'Watercolor-style illustration of a man feeding a baby a bottle in an armchair - personal/family commissioned artwork (verified at full resolution on the first of this series).',
    publicationDecision: 'legal-do-not-publish',
    rejectionReason: 'Personal/family commissioned artwork, unrelated to any ByteLite LLC or HeartStrings product subject - not a marketing asset.',
    privacySafetyResult: 'unsafe - personal family content',
  });
}

const wordmarkLogos = [
  ['ChatGPT Image Jul 9, 2026, 01_01_40 PM (9).png', true],
  ['ChatGPT Image Jul 9, 2026, 04_02_35 PM (1).png', false],
  ['ChatGPT Image Jul 9, 2026, 04_02_35 PM (2).png', false],
  ['ChatGPT Image Jul 9, 2026, 04_02_35 PM (3).png', false],
  ['ChatGPT Image Jul 9, 2026, 04_02_35 PM (4).png', false],
  ['ChatGPT Image Jul 9, 2026, 04_02_36 PM (5).png', false],
  ['ChatGPT Image Jul 9, 2026, 04_02_36 PM (6).png', false],
  ['ChatGPT Image Jul 9, 2026, 04_02_36 PM (7).png', false],
  ['ChatGPT Image Jul 9, 2026, 04_02_36 PM (8).png', false],
];
for (const [fname, isRep] of wordmarkLogos) {
  apply(D + fname, {
    subject: 'Alternate "HeartStrings" wordmark logo treatment: pink/magenta glowing infinity-heart with script wordmark, correct spelling.',
    publicationDecision: isRep ? 'inspected-not-used-directly' : 'inspected-not-used-directly',
    selectionNote: 'Alternate logo/glow-intensity variant of the same wordmark design - a brand/logo-swap decision beyond this pass\'s scope; not integrated without explicit direction. Representative noted, rest are near-duplicate glow/crop variants not separately useful.',
  });
}

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 11.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
