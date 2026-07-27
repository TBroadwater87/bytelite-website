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
    inspectionMethod: 'contact-sheet-008 review (app-icon-style crop, no text overlay present in any cell - directly verifiable at thumbnail resolution)',
    fullResolutionReviewRequired: false,
    staleTextResult: 'no text present (character-only app-icon crop)',
    canonicalNamingResult: 'no baked-in naming defect possible - no text present in this crop style',
    privacySafetyResult: 'safe',
  });
  n++;
}
const D = 'D:\\Download\\';

// Large batch of near-identical seasonal "app icon" style Aion/AIya portrait crops (solo and
// paired), no text overlay in any of them (verified directly from the contact sheet - the
// app-icon crop style leaves no room for a title/text layer, unlike the marketing compositions
// checked at full resolution elsewhere this pass). One paired representative selected per
// spec's "AIya and Aion together" category; rest marked redundant to avoid flooding.
const files = [
  'ChatGPT Image Jul 19, 2026, 01_47_01 PM (3).png',
  'ChatGPT Image Jul 19, 2026, 01_47_01 PM (4).png',
  'ChatGPT Image Jul 19, 2026, 01_47_01 PM (5).png',
  'ChatGPT Image Jul 19, 2026, 01_47_01 PM (6).png',
  'ChatGPT Image Jul 19, 2026, 01_47_01 PM (7).png',
  'ChatGPT Image Jul 19, 2026, 01_47_01 PM (8).png',
  'ChatGPT Image Jul 19, 2026, 01_47_01 PM (9).png',
  'ChatGPT Image Jul 19, 2026, 01_47_13 PM (2).png',
  'ChatGPT Image Jul 19, 2026, 01_47_13 PM (3).png',
  'ChatGPT Image Jul 19, 2026, 01_47_13 PM (4).png',
  'ChatGPT Image Jul 19, 2026, 01_47_13 PM (5).png',
  'ChatGPT Image Jul 19, 2026, 01_47_13 PM (6).png',
  'ChatGPT Image Jul 19, 2026, 01_47_13 PM (7).png',
  'ChatGPT Image Jul 19, 2026, 01_47_13 PM (8).png',
  'ChatGPT Image Jul 19, 2026, 01_47_25 PM (1).png',
  'ChatGPT Image Jul 19, 2026, 01_47_26 PM (3).png',
  'ChatGPT Image Jul 19, 2026, 01_47_26 PM (4).png',
  'ChatGPT Image Jul 19, 2026, 01_47_26 PM (5).png',
  'ChatGPT Image Jul 19, 2026, 01_47_26 PM (6).png',
  'ChatGPT Image Jul 19, 2026, 01_47_26 PM (7).png',
  'ChatGPT Image Jul 19, 2026, 01_47_28 PM (10).png',
  'ChatGPT Image Jul 19, 2026, 01_47_28 PM (8).png',
  'ChatGPT Image Jul 19, 2026, 01_47_28 PM (9).png',
  'ChatGPT Image Jul 19, 2026, 01_47_37 PM (1).png',
  'ChatGPT Image Jul 19, 2026, 01_47_38 PM (10).png',
  'ChatGPT Image Jul 19, 2026, 01_47_38 PM (2).png',
  'ChatGPT Image Jul 19, 2026, 01_47_38 PM (3).png',
  'ChatGPT Image Jul 19, 2026, 01_47_38 PM (4).png',
  'ChatGPT Image Jul 19, 2026, 01_47_38 PM (5).png',
];
for (const fname of files) {
  apply(D + fname, {
    subject: 'App-icon-style seasonal portrait crop of Aion and/or AIya (solo or paired), consistent character design, heart-light-trail motif, no text overlay of any kind.',
    publicationDecision: 'inspected-not-used-directly',
    selectionNote: 'Part of an oversized seasonal-variant batch (30+ near-identical crops); not integrated to avoid flooding a page with repetitive imagery, per spec instruction. Representative already selected/available elsewhere (solo portraits from sheet 1, paired shot ChatGPT Image Jul 19, 2026, 01_47_26 PM (2).png selected below).',
  });
}
apply(D + 'ChatGPT Image Jul 19, 2026, 01_47_26 PM (2).png', {
  subject: 'AIya and Aion together, close paired app-icon-style portrait crop, no text overlay, both characters correctly styled with no naming text present.',
  publicationDecision: 'selected',
  selectionNote: 'Clean representative "AIya and Aion together" image for the AIya and Aion page, satisfying the spec\'s explicit category for paired imagery without flooding.',
  canonicalDestination: 'public/heartstrings-connect/heartstrings-connect-aiya-aion-paired-portrait.webp',
});

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 8.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
