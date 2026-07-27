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
    inspectionMethod: patch.inspectionMethod || 'contact-sheet-005 review',
    fullResolutionReviewRequired: patch.fullResolutionReviewRequired ?? false,
    staleTextResult: patch.staleTextResult || 'no baked-in text issues found',
    canonicalNamingResult: patch.canonicalNamingResult || 'no baked-in naming defect found',
    privacySafetyResult: patch.privacySafetyResult || 'safe',
  });
  n++;
}

const SIL = 'D:\\Download\\04_AIya_AIon_Characters\\Silhouette_Processing\\';
const ARCH = 'D:\\Download\\11_Archive_Superseded\\PersonalPhotos\\';
const D = 'D:\\Download\\';

apply(SIL + 'HeartStrings_Silhouette_couple_back2back_gold.png', { subject: 'Minimalist gold line-art of a nude embracing couple, back-to-back seated pose.', publicationDecision: 'legal-do-not-publish', rejectionReason: 'Depicts nude figures - same standard already applied to the solo nude silhouette rejected earlier this pass.', fullResolutionReviewRequired: true });
apply(SIL + 'HeartStrings_Silhouette_couple_back2back_yellow.png', { subject: 'Same nude couple silhouette, yellow color variant.', publicationDecision: 'legal-do-not-publish', rejectionReason: 'Depicts nude figures - same standard already applied to the solo nude silhouette rejected earlier this pass.', fullResolutionReviewRequired: true });
apply(SIL + 'mask_det_allow.png', { subject: 'Technical detection-allow mask (mostly black/white binary image), byproduct of silhouette processing.', publicationDecision: 'unused', rejectionReason: 'Binary technical mask output with no standalone visual content.' });
apply(SIL + 'mask_fg.png', { subject: 'Technical foreground mask (mostly white binary image), byproduct of silhouette processing.', publicationDecision: 'unused', rejectionReason: 'Binary technical mask output with no standalone visual content.' });
apply(SIL + 'Silhouette.png', { subject: 'Same nude couple/solo silhouette line-art on white background.', publicationDecision: 'legal-do-not-publish', rejectionReason: 'Depicts a nude figure - same standard already applied elsewhere this pass.', fullResolutionReviewRequired: true });
apply(SIL + 'Silhouette_Trans_BG.png', { subject: 'Same nude silhouette line-art, transparent background variant.', publicationDecision: 'legal-do-not-publish', rejectionReason: 'Depicts a nude figure - same standard already applied elsewhere this pass.', fullResolutionReviewRequired: true });

apply('D:\\Download\\05_Kickstarter\\Graphics\\ChatGPT Image Apr 1, 2026, 12_48_02 PM.png', { subject: 'Technical diagram: "Stage N Residual Set", "Direct Covered/Uncovered Residual", "Composite Candidate Generation" - internal ByteLite algorithm terminology.', publicationDecision: 'legal-do-not-publish', rejectionReason: 'Discloses internal ByteLite mechanism/algorithm vocabulary, consistent with the established trade-secret exclusion for similar diagrams (e.g. the "Cascade Closure" diagram rejected in the first pass).', fullResolutionReviewRequired: true });
apply('D:\\Download\\05_Kickstarter\\Graphics\\ChatGPT Image Mar 22, 2026, 10_16_46 AM.png', { subject: 'Pixel-art icon: gear + stacked colored squares with a checkmark - generic tech/progress icon.', publicationDecision: 'unused', rejectionReason: 'Generic icon with no specific ByteLite/HeartStrings project tie-in.' });
apply('D:\\Download\\06_Website_and_Marketing\\Marketing_Images\\ChatGPT Image May 15, 2025, 03_48_35 PM.png', { subject: '"SMART START ENGAGE" graphic with apple and bar-chart icons - generic business-growth marketing icon.', publicationDecision: 'unused', rejectionReason: 'Generic stock-style marketing icon with no specific ByteLite/HeartStrings project tie-in.' });

const personalArchive = [
  ['14237556_10208118245966552_1003311473077835116_n.jpg', 'Personal photo: man asleep with a baby.'],
  ['14237556_10208118245966552_1003311473077835116_n_layer0\\edge_sil.png', 'Technical edge-silhouette mask derived from the personal sleeping photo.'],
  ['14237556_10208118245966552_1003311473077835116_n_layer0\\mask_det_allow.png', 'Technical detection mask derived from the personal sleeping photo.'],
  ['14237556_10208118245966552_1003311473077835116_n_layer0\\mask_fg.png', 'Technical foreground mask derived from the personal sleeping photo.'],
  ['14333173_10208118311568192_237789229251391796_n.jpg', 'Personal photo: man reading to a child on a tablet.'],
  ['307855_3949351404866_321334659_n.jpg', 'Personal photo: man on horseback in a field.'],
  ['307855_3949351404866_321334659_n_layer0\\edge_sil.png', 'Technical edge-silhouette mask derived from the personal horseback photo.'],
  ['307855_3949351404866_321334659_n_layer0\\mask_det_allow.png', 'Technical detection mask derived from the personal horseback photo.'],
  ['307855_3949351404866_321334659_n_layer0\\mask_fg.png', 'Technical foreground mask derived from the personal horseback photo.'],
  ['Man_Horse_Original.jpg', 'Personal photo: man standing with a horse (original source of the painted illustration series seen on sheet 4).'],
  ['portrait_bearded_man_gray.png', 'Personal portrait photo of a bearded man, desaturated.'],
  ['portrait_bearded_man_stylized.png', 'Personal portrait photo of the same bearded man, stylized/illustrated treatment.'],
];
for (const [fname, subject] of personalArchive) {
  apply(ARCH + fname, {
    subject,
    publicationDecision: 'legal-do-not-publish',
    rejectionReason: 'Personal photo/derived technical byproduct explicitly located in an "Archive_Superseded/PersonalPhotos" folder - confirmed personal content, not a ByteLite LLC or HeartStrings marketing asset.',
    fullResolutionReviewRequired: fname.endsWith('.jpg') || fname.endsWith('.png') && !fname.includes('mask') && !fname.includes('edge_sil'),
    privacySafetyResult: 'unsafe - real identifiable person, personal content, explicitly archived',
  });
}

apply(D + '20x20_Board_No_Silhouette.png', {
  subject: 'Complete HeartStrings Play board render (20-space heart-shaped path): correct "HeartStrings PLAY" logo, full six-tier deck strip (Initiate/Connect/Seduce/Stimulate/Edge/Climax) matching the canonical tier cards found earlier, purple "Decree" card, AIya and Aion character portraits, Mischief-dice-category space icons along the path, a heart-shaped "GO" space. No nude silhouette (explicitly the "No_Silhouette" variant).',
  publicationDecision: 'selected',
  selectionNote: 'The most complete, correctly-branded, safe board render found in the archive - shows the full component system together. Selected to replace/supplement the current HeartStrings Play board imagery.',
  canonicalDestination: 'public/heartstrings/heartstrings-play-board-20-space-complete.webp',
  fullResolutionReviewRequired: true,
});
apply(D + '20x40_Board_No_Silhouette.png', {
  subject: 'Same complete board system as the 20-space version, wide 40-space layout variant - same logo, tier deck, Decree card, character portraits, Mischief icons, GO space, no nude silhouette.',
  publicationDecision: 'selected',
  selectionNote: 'Companion board-size variant to the 20-space render, same quality and safety profile. Selected for HeartStrings Play Editions/Components pages (the product supports multiple board configurations).',
  canonicalDestination: 'public/heartstrings/heartstrings-play-board-40-space-complete.webp',
  fullResolutionReviewRequired: true,
});
apply(D + '20x20_Path.png', { subject: 'Bare bead/loop board path outline, no branding/color (raw design layer).', publicationDecision: 'unused', rejectionReason: 'Raw production template layer, superseded by the complete No_Silhouette board renders.' });
apply(D + '49_Pills_Path.svg', { subject: 'Near-blank vector path/pill-shape layer, no distinct subject.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'aL-GNE1cFqZWK8IUZkcNA.jpg', { subject: 'Stock photo of an unrelated real woman working on a laptop by a window.', publicationDecision: 'unused', rejectionReason: 'Generic stock photography of an unrelated real person - matches the previously-identified hash-named stock-photo cluster from the first pass.', privacySafetyResult: 'unsafe - unrelated real person (generic stock)' });
apply(D + 'All_Layers.png', { subject: 'Flat illustrative graphic of a silhouetted adult holding a baby, teal/purple color blocks.', publicationDecision: 'unused', rejectionReason: 'Generic flat illustration with no clear ByteLite LLC or HeartStrings project tie-in; appears to be an unrelated design-layer preview.' });

apply(D + 'Assets\\HeartStrings_BG_Drink.png', { subject: 'Mischief-dice "Drink" icon (Assets folder copy).', publicationDecision: 'duplicate', duplicateGroup: 'mischief-icon-drink', selectionNote: 'Same design as the already-selected root/Final_Candidates copy.' });
apply(D + 'Assets\\HeartStrings_BG_Halo.png', { subject: 'Mischief-dice "Halo" icon (Assets folder copy).', publicationDecision: 'duplicate', duplicateGroup: 'mischief-icon-halo', selectionNote: 'Same design as the already-selected root/Final_Candidates copy.' });
apply(D + 'Assets\\HeartStrings_BG_Hands.png', { subject: 'Mischief-dice "Hands" icon (Assets folder copy).', publicationDecision: 'duplicate', duplicateGroup: 'mischief-icon-hands', selectionNote: 'Same design as the already-selected root/Final_Candidates copy.' });

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 5.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
