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
    staleTextResult: patch.staleTextResult || 'no defects found',
    canonicalNamingResult: patch.canonicalNamingResult || 'no baked-in naming defect found',
  });
  n++;
}

const stockPeople4 = [
  ['D:\\Download\\wrk7HT7ZLurrjEDJCqZWP.jpg', 'Stock photo: two coworkers looking at a laptop screen.'],
  ['D:\\Download\\X5FEIIFkffYSLZekhdGZQ.jpg', 'Stock photo: person in a red hood/mask near computer monitors (ambiguous security/hacker-themed stock image).'],
  ['D:\\Download\\Y8qRRuSmj4Jp9IS8QyG_W.jpg', 'Stock photo: two women writing at a table by a window.'],
  ['D:\\Download\\Z8oo-XUiJKTDXnhrIQIlL.jpg', 'Stock photo: two coworkers talking in an office hallway.'],
  ['D:\\Download\\ZXNQtCSLouZGefe894QXS.jpg', 'Stock photo: group meeting around a conference table with a diverse team.'],
  ['D:\\Download\\_LkkC10yau4QTq2z7IADN.jpg', 'Stock photo: two women collaborating, one at a laptop.'],
];
for (const [p, subject] of stockPeople4) {
  apply(p, {
    subject,
    publicationDecision: 'unused',
    rejectionReason: 'Generic stock photography of unrelated real people (matches the previously-identified hash-named stock-photo cluster) - not ByteLite/HeartStrings-specific content.',
    privacySafetyResult: 'unsafe - unrelated real people (generic stock)',
  });
}

apply('C:\\Users\\tbroa\\Downloads\\Board_20_x_40_Silo.png', {
  subject: 'Nude couple silhouette line-art graphic (the board "Silo"/silhouette overlay layer), same design already confirmed nude elsewhere this pass - found in the C:\\Users\\tbroa\\Downloads directory (the one relevant file located there).',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Depicts nude figures - same standard already applied to the equivalent D:\\Download copy of this silhouette overlay layer.',
  fullResolutionReviewRequired: true,
  privacySafetyResult: 'unsafe - nudity',
});

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 17.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
