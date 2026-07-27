import fs from 'node:fs';
const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));
const rec = inv.records.find((r) => r.originalPath === 'D:\\Download\\01_HeartStrings_Boardgame\\HeartStrings_BG_Title.png');
if (!rec) { console.log('still missing'); process.exit(1); }
Object.assign(rec, {
  visuallyInspected: true,
  dispositionType: 'individually-visually-inspected',
  inspectionMethod: 'contact-sheet-002 + full-resolution review',
  fullResolutionReviewRequired: true,
  subject: 'Elegant cursive HeartStrings wordmark with PLAY in caps beneath, correct canonical spelling/capitalization, no defects.',
  publicationDecision: 'inspected-not-used-directly',
  selectionNote: 'Clean, correctly-branded alternate logotype. Not swapped in for the current site logo without explicit brand direction - documented as a future candidate.',
  staleTextResult: 'no baked-in text issues found',
  canonicalNamingResult: 'no baked-in naming defect found',
  privacySafetyResult: 'safe',
});
fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log('fixed Title.png record');
console.log('Remaining not-yet-inspected:', inv.records.filter((r) => !r.visuallyInspected).length);
