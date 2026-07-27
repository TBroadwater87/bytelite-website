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
  });
  n++;
}
const D = 'D:\\Download\\';

// App-icon-style crops, no text overlay (same reasoning as sheet 8).
const iconCrops = [
  'ChatGPT Image Jul 19, 2026, 01_47_38 PM (6).png', 'ChatGPT Image Jul 19, 2026, 01_47_38 PM (7).png',
  'ChatGPT Image Jul 19, 2026, 01_47_38 PM (8).png', 'ChatGPT Image Jul 19, 2026, 01_47_38 PM (9).png',
  'ChatGPT Image Jul 20, 2026, 07_21_10 AM (10).png', 'ChatGPT Image Jul 20, 2026, 07_21_10 AM (3).png',
  'ChatGPT Image Jul 20, 2026, 07_21_10 AM (4).png', 'ChatGPT Image Jul 20, 2026, 07_21_10 AM (5).png',
  'ChatGPT Image Jul 20, 2026, 07_21_10 AM (6).png', 'ChatGPT Image Jul 20, 2026, 07_21_10 AM (7).png',
  'ChatGPT Image Jul 20, 2026, 07_21_10 AM (8).png', 'ChatGPT Image Jul 20, 2026, 07_21_10 AM (9).png',
  'ChatGPT Image Jul 20, 2026, 07_21_19 AM (1).png', 'ChatGPT Image Jul 20, 2026, 07_21_19 AM (2).png',
  'ChatGPT Image Jul 20, 2026, 07_21_20 AM (3).png', 'ChatGPT Image Jul 20, 2026, 07_21_20 AM (4).png',
  'ChatGPT Image Jul 20, 2026, 07_21_21 AM (10).png', 'ChatGPT Image Jul 20, 2026, 07_21_21 AM (5).png',
  'ChatGPT Image Jul 20, 2026, 07_21_21 AM (6).png', 'ChatGPT Image Jul 20, 2026, 07_21_21 AM (7).png',
  'ChatGPT Image Jul 20, 2026, 07_21_21 AM (8).png', 'ChatGPT Image Jul 20, 2026, 07_21_21 AM (9).png',
];
for (const fname of iconCrops) {
  apply(D + fname, {
    subject: 'App-icon-style seasonal portrait crop of Aion and/or AIya, no text overlay.',
    publicationDecision: 'inspected-not-used-directly',
    selectionNote: 'Part of the same oversized seasonal-variant batch as sheet 8 - not integrated to avoid flooding; representatives already selected elsewhere.',
    inspectionMethod: 'contact-sheet-009 review (app-icon crop, no text overlay present)',
    staleTextResult: 'no text present (character-only app-icon crop)',
    canonicalNamingResult: 'no baked-in naming defect possible - no text present in this crop style',
  });
}

// Wide title-card composites using the same "AIya + AIon / HeartStrings / Your Trusted AI
// Connection Guides" template already confirmed defective at full resolution (winter variant,
// sheet 6) - "AIon" incorrectly capitalized. Same template, different holiday background;
// visually confirmed identical text layout/wording across every cell on this sheet.
const titleDefectFiles = [
  ['ChatGPT Image Jul 19, 2026, 01_47_50 PM (1).png', 'spring/easter'],
  ['ChatGPT Image Jul 19, 2026, 01_47_50 PM (2).png', 'Lunar New Year'],
  ['ChatGPT Image Jul 19, 2026, 01_47_51 PM (10).png', 'New Year (\"Happy New Year!\")'],
  ['ChatGPT Image Jul 19, 2026, 01_47_51 PM (4).png', 'Valentine/winter'],
  ['ChatGPT Image Jul 19, 2026, 01_47_51 PM (5).png', 'floral/pink'],
  ['ChatGPT Image Jul 19, 2026, 01_47_51 PM (6).png', 'Easter'],
  ['ChatGPT Image Jul 19, 2026, 01_47_51 PM (8).png', 'Thanksgiving'],
  ['ChatGPT Image Jul 19, 2026, 01_47_51 PM (9).png', 'Christmas'],
];
for (const [fname, theme] of titleDefectFiles) {
  apply(D + fname, {
    subject: `Wide title-card composite: AIya+Aion paired portrait with "AIya + AIon / HeartStrings / Your Trusted AI Connection Guides" title text, ${theme} theme - identical template/wording to the winter variant already confirmed at full resolution to misspell "AIon".`,
    publicationDecision: 'legal-do-not-publish',
    rejectionReason: 'Same title-card template already confirmed at full resolution to bake in "AIon" (incorrect) instead of canonical "Aion" - identical text layout and wording visible across this whole template series, only the background theme differs.',
    canonicalNamingResult: 'same confirmed defect as the full-resolution-verified winter variant: renders "AIon"',
    staleTextResult: 'baked-in naming defect (see canonicalNamingResult)',
  });
}

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 9.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
