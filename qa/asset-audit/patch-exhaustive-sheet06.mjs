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
    inspectionMethod: patch.inspectionMethod || 'contact-sheet-006 review',
    fullResolutionReviewRequired: patch.fullResolutionReviewRequired ?? false,
    staleTextResult: patch.staleTextResult || 'no baked-in text issues found',
    canonicalNamingResult: patch.canonicalNamingResult || 'no baked-in naming defect found',
    privacySafetyResult: patch.privacySafetyResult || 'safe',
  });
  n++;
}
const D = 'D:\\Download\\';

apply(D + 'Assets\\HeartStrings_BG_Hearts.png', { subject: 'Mischief-dice "Hearts" icon (Assets folder copy).', publicationDecision: 'duplicate', duplicateGroup: 'mischief-icon-hearts', selectionNote: 'Same design as the already-selected root/Final_Candidates copy.' });
apply(D + 'Assets\\HeartStrings_BG_Social.png', { subject: 'Mischief-dice "Social" icon (Assets folder copy).', publicationDecision: 'duplicate', duplicateGroup: 'mischief-icon-social', selectionNote: 'Same design as the already-selected root/Final_Candidates copy.' });
apply(D + 'Assets\\HeartStrings_BG_Strip.png', { subject: 'Mischief-dice "Strip" icon (Assets folder copy).', publicationDecision: 'duplicate', duplicateGroup: 'mischief-icon-strip', selectionNote: 'Same design as the already-selected root/Final_Candidates copy.' });

apply(D + 'assets_seasonal_duo_easter.png', { subject: 'AIya+Aion couple, Easter/spring floral scene with a plush rabbit, no character-name title text overlay.', publicationDecision: 'selected', selectionNote: 'Clean, no baked-in naming defect. Candidate for a future AIya-and-Aion holiday gallery (per spec, use only one representative in an intentional gallery, not flooding).' });
apply(D + 'assets_seasonal_duo_independence_day.png', { subject: 'AIya+Aion couple, "Happy 4th of July" fireworks scene, no character-name title text overlay.', publicationDecision: 'selected', selectionNote: 'Clean, no baked-in naming defect. Holiday gallery candidate.' });
apply(D + 'assets_seasonal_duo_lunar_new_year.png', { subject: 'AIya+Aion couple, Lunar New Year scene with Chinese-language text banner, no English character-name title overlay.', publicationDecision: 'selected', selectionNote: 'Clean, no baked-in naming defect (Chinese text is generic New Year greeting, not a character name). Holiday gallery candidate.' });
apply(D + 'assets_seasonal_duo_newyear_02.png', { subject: 'AIya+Aion couple, New Year\'s Eve countdown clock scene, no character-name title text overlay.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Clean, no defect, but redundant with the already-selected NYE-themed Aion solo portrait from sheet 1; not integrated to avoid flooding.' });
apply(D + 'assets_seasonal_duo_spring.png', { subject: 'AIya+Aion couple, spring floral scene, no character-name title text overlay.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Clean, no defect, but redundant with the selected Easter image (same spring/floral theme); not integrated to avoid flooding.' });
apply(D + 'assets_seasonal_duo_st_patricks.png', { subject: 'AIya+Aion couple, "Happy St. Patrick\'s Day!" scene with drinks, no character-name title text overlay (verified at full resolution).', publicationDecision: 'selected', selectionNote: 'Clean, no baked-in naming defect. Holiday gallery candidate.', fullResolutionReviewRequired: true });
apply(D + 'assets_seasonal_duo_thanksgiving.png', { subject: 'AIya+Aion couple, "Happy Thanksgiving" scene, no character-name title text overlay.', publicationDecision: 'selected', selectionNote: 'Clean, no baked-in naming defect. Holiday gallery candidate.' });
apply(D + 'assets_seasonal_duo_winter.png', {
  subject: 'AIya+Aion couple, winter/snow scene with prominent "AIya + AIon / HeartStrings / Your Trusted AI Connection Guides" title text overlay.',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Baked-in incorrect capitalization ("AIon" instead of canonical "Aion") in the title text - confirmed at full resolution.',
  fullResolutionReviewRequired: true,
  canonicalNamingResult: 'confirmed defect: renders "AIon" (capital I between A and o)',
});
apply(D + 'b18b2ab8-3b70-4d53-9f58-3042e177219a.png', { subject: '"1% better, every day. That\'s 37 times better in a year." - generic motivational/growth graphic, gold arrow chart on black.', publicationDecision: 'unused', rejectionReason: 'Generic motivational-business graphic with no specific ByteLite/HeartStrings project tie-in and an unverified/unsourced "37 times" claim.' });
apply(D + 'Baby_Face_Layer.png', { subject: 'Small abstract pink blob shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'Background_2_Layer.png', { subject: 'Abstract purple shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'Background_Layer.png', { subject: 'Abstract gray shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'Blanket.png', { subject: 'Abstract light-blue shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'Board_20_x_40.png', { subject: 'Board render draft, same composition family as the selected 20x40_Board_No_Silhouette.png.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Earlier/draft board render; the No_Silhouette final version was selected instead.' });
apply(D + 'Board_20_x_40_Final.png', { subject: 'Board render, "Final" label, same composition family as the selected board renders.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Draft/alternate export; the explicitly-named No_Silhouette version was selected instead as the confirmed-safe final.' });
apply(D + 'Board_20_x_40_Silo.png', {
  subject: 'Nude couple silhouette line-art graphic (the "Silo"/silhouette layer for the board composite) - confirmed at full resolution to be the same nude imagery already rejected elsewhere.',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Depicts nude figures - the silhouette overlay layer excluded from the board renders by using the No_Silhouette versions instead.',
  fullResolutionReviewRequired: true,
});
apply(D + 'Bottle.png', { subject: 'Abstract cream/white shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });

const stockPeople = [
  ['bwuy9W2cRODLRnQkVoD7w.jpg', 'Stock photo: woman at a laptop with decorative stickers on the lid.'],
  ['BxCCEctTj-WftUYWZ9wfb.jpg', 'Stock photo: two women looking at a laptop together on a couch.'],
  ['bXLs9h5tunSODa2IOp1MG.jpg', 'Stock photo: two women working together at a desk with a monitor.'],
];
for (const [fname, subject] of stockPeople) {
  apply(D + fname, {
    subject,
    publicationDecision: 'unused',
    rejectionReason: 'Generic stock photography of unrelated real people (matches the previously-identified hash-named stock-photo cluster from the first pass) - not ByteLite/HeartStrings-specific content.',
    privacySafetyResult: 'unsafe - unrelated real people (generic stock)',
  });
}

apply(D + 'ByteLite\\Branding\\Diagrams\\ByteLite_Stretch_Goals.png', { subject: '"Stretch Goals" campaign graphic with dollar figures ($100k Open Source Core, $150k Plugin Release, $250k Deep Kore Paper).', publicationDecision: 'legal-do-not-publish', rejectionReason: 'Unconfirmed campaign/dollar figures - consistent with this exact file\'s rejection in the first pass.' });
apply(D + 'bytelite-structure.svg', { subject: 'Org-chart diagram: ByteLite LLC branching structure (same template family as the ByteLite_LLC_Editable_SVG_Samples series).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Alternate layout variant of the org-chart already selected and corrected via 06_executive_architecture.svg in the prior pass; not needed as a second org-chart on the same pages.' });

const orgChartVariants = [
  ['01_symmetric_branch_tree.svg', 'symmetric branch-tree layout'],
  ['03_central_spine.svg', 'central-spine layout'],
  ['04_nested_company_envelope.svg', 'nested-envelope layout'],
  ['05_blueprint_rails.svg', 'blueprint-rails layout'],
  ['07_minimal_brackets.svg', 'minimal-brackets layout'],
];
for (const [fname, style] of orgChartVariants) {
  apply(D + 'ByteLite_LLC_Editable_SVG_Samples\\' + fname, {
    subject: `Org-chart diagram template: ByteLite LLC branching into Consumer Products / Private Deterministic Research, ${style} - same content family as the already-selected/corrected 06_executive_architecture.svg.`,
    publicationDecision: 'inspected-not-used-directly',
    selectionNote: 'Alternate visual-layout variant of the org-chart template already selected and corrected in a prior pass (06_executive_architecture.svg); one representative is sufficient, this sibling is not needed.',
  });
}

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 6.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
