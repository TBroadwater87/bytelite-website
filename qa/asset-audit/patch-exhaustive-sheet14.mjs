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

apply(D + 'Floor_Layer.png', { subject: 'Abstract gold shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'HeartStrings_Board_Spaces.png', { subject: 'Strip of six Mischief-dice category icons (Social/confetti, Strip/zipper, Hearts, Hands, Drink, Halo) - same icons already individually selected this pass.', publicationDecision: 'duplicate', duplicateGroup: 'mischief-icon-strip', selectionNote: 'Preview strip of the already-individually-selected Mischief icons; the individual icon files are used instead of this composite strip.' });
apply(D + 'independence_day.png', { subject: 'AIya+Aion couple, "Happy 4th of July" fireworks scene, no title text overlay.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same theme as the already-selected assets_seasonal_duo_independence_day.png; redundant, not integrated to avoid flooding.' });
apply(D + 'lunar_new_year.png', { subject: 'AIya+Aion couple, Lunar New Year scene, Chinese-language banner text, no English character-name text.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same theme as the already-selected assets_seasonal_duo_lunar_new_year.png; redundant, not integrated to avoid flooding.' });
apply(D + 'newyear_02.png', { subject: 'AIya+Aion couple, New Year\'s Eve countdown clock scene, no title text overlay.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Redundant with already-reviewed New Year duo imagery; not integrated to avoid flooding.' });
apply(D + 'Pajamas.png', { subject: 'Blank/near-empty design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'scoped_action_envelope.svg', {
  subject: 'Clean systems-engineering diagram titled "Scoped Action Envelope": 10 generic required-field questions (What action is requested? Who is affected? What authority allows it? etc.), a Governance Gate with three outcomes (Authorized/Request Clarification/Restrain or Halt), and the rule "No external action may leave the envelope until every required field is represented and the governance gate permits it." Fully generic/conceptual notation - no proprietary algorithm or implementation details disclosed.',
  publicationDecision: 'selected',
  selectionNote: 'Safe, accurate, directly matches Genesis Goalkeeper\'s already-published concept description (intrinsic-halting rules, scoped action-envelope requirements) without disclosing any internal mechanism. Strong candidate for the Genesis Goalkeeper technology page.',
  canonicalDestination: 'public/technologies/genesis-goalkeeper-scoped-action-envelope-diagram.svg',
  fullResolutionReviewRequired: true,
});
apply(D + 'spring.png', { subject: 'AIya+Aion couple, spring floral scene, no title text overlay.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Redundant with already-selected spring/Easter imagery; not integrated to avoid flooding.' });
apply(D + 'StoneFloor_Layer.png', { subject: 'Abstract purple shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'st_patricks.png', { subject: 'AIya+Aion couple, St. Patrick\'s Day scene, no character-name title text overlay.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Redundant with the already-selected assets_seasonal_duo_st_patricks.png; not integrated to avoid flooding.' });

const stockPeople3 = [
  ['fw3U4xJgIb4n57LICbALl.jpg', 'Stock photo: office meeting/conference discussion.'],
  ['HYyCM_3iqas2_1jfjhOSY.jpg', 'Stock photo: woman working at a computer in an office.'],
  ['I1GdaAXOzho3rya5veena.jpg', 'Stock photo: two coworkers at a whiteboard.'],
  ['j5XOSwZ9lGLZp9hlPB0jf.jpg', 'Stock photo: black-and-white portrait of a woman reading.'],
  ['KlZ_CecalfWCT_i2VQnB5.jpg', 'Stock photo: woman standing in front of a whiteboard.'],
  ['K_HF7htJUu_2JlJ3sPocz.jpg', 'Stock photo: group meeting around a conference table.'],
  ['oI8XECOdlsuIrt8XoXXRH.jpg', 'Stock photo: black-and-white portrait of a woman by a window with a laptop.'],
  ['osa1KjVzR7Ml0-mNnD0E5.jpg', 'Stock photo: group of women in an office meeting.'],
  ['pkUuvquW_iFitmIEnmtY6.jpg', 'Stock photo: group meeting around a conference table.'],
  ['PLuGorUZMXUhXW6VGFePZ.jpg', 'Stock photo: woman with headphones working at a laptop by a window.'],
  ['qdHVsTiJ90FY_UH6qzuTX.jpg', 'Stock photo: group of coworkers around a conference table with laptops.'],
  ['s3zjp94JlnXXF8rLPx8D9.jpg', 'Stock photo: black-and-white group meeting around a conference table.'],
  ['sAWPcRWmFNI4HQWLfOjfr.jpg', 'Stock photo: man working at a laptop in a conference room.'],
];
for (const [fname, subject] of stockPeople3) {
  apply(D + fname, {
    subject,
    publicationDecision: 'unused',
    rejectionReason: 'Generic stock photography of unrelated real people (matches the previously-identified hash-named stock-photo cluster) - not ByteLite/HeartStrings-specific content.',
    privacySafetyResult: 'unsafe - unrelated real people (generic stock)',
  });
}

const tacoDelSol = [
  'TacoDelSol_badge_circular_tacos_limes.png', 'TacoDelSol_badge_framed_burrito_nachos.png',
  'TacoDelSol_banner_bold_flavor_brighter.png', 'TacoDelSol_banner_capitol_bridge.png',
  'TacoDelSol_banner_downtown_header.png', 'TacoDelSol_banner_helena_marquee.png',
  'TacoDelSol_banner_helena_streetscape.png',
];
for (const fname of tacoDelSol) {
  apply(D + 'TacoDelSol_Branding\\Logos_and_Banners\\' + fname, {
    subject: 'Taco Del Sol Helena restaurant branding asset (logo badge or banner) - unrelated third-party client project.',
    publicationDecision: 'unused',
    rejectionReason: 'Confirmed pre-existing, unrelated Taco Del Sol client-branding project (already known to this session as a separate client preview at /preview/tacodelsol/, explicitly not part of ByteLite LLC or HeartStrings). Not a ByteLite/HeartStrings asset under any circumstance.',
  });
}

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 14.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
