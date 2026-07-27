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
    inspectionMethod: patch.inspectionMethod || 'contact-sheet-004 review',
    fullResolutionReviewRequired: patch.fullResolutionReviewRequired ?? false,
    staleTextResult: patch.staleTextResult || 'no baked-in text issues found',
    canonicalNamingResult: patch.canonicalNamingResult || 'no baked-in naming defect found',
    privacySafetyResult: patch.privacySafetyResult || 'safe',
  });
  n++;
}

const UI = 'D:\\Download\\02_HeartStrings_App_and_Wingman\\App_Icons\\heartstrings_ui_pack\\heartstrings_ui_pack\\svg\\outline\\';
const APPUI = 'D:\\Download\\02_HeartStrings_App_and_Wingman\\App_UI_Screens\\';
const CHAR = 'D:\\Download\\04_AIya_AIon_Characters\\';
const SIL = 'D:\\Download\\04_AIya_AIon_Characters\\Silhouette_Processing\\';
const BOOT = SIL + 'Bootstrap_Tests\\';

apply(UI + 'report-flag-alert.svg', { subject: 'Flag icon with a paint-drip accent, outline style - report/alert concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/report-flag-alert.svg already imported.' });
apply(UI + 'safety-center-shield-knot.svg', { subject: 'Shield-with-checkmark icon, outline style - safety center concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/safety-center-shield-knot.svg already imported.' });
apply(UI + 'schedule-calendar-heart.svg', { subject: 'Calendar-with-heart icon, outline style - scheduling concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/schedule-calendar-heart.svg already imported.' });
apply(UI + 'values-home-heart.svg', { subject: 'House-with-heart icon, outline style - values/home concept.', publicationDecision: 'selected-corrected', selectionNote: 'Outline-style sibling found on this sheet, more consistent with the other already-imported outline icons than the filled variant tentatively picked from sheet 3. Supersedes that filled pick.', canonicalDestination: 'public/heartstrings-connect/icons/values-home-heart.svg' });
apply(UI + 'verified-shield-heart.svg', { subject: 'Shield-with-heart-checkmark icon, outline style - verification concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/verified-shield-heart.svg already imported.' });

apply(APPUI + 'ChatGPT Image Feb 19, 2026, 08_36_46 PM.png', { subject: 'Tattoo design mockup (tree with roots/branches) on a male torso.', publicationDecision: 'unused', rejectionReason: 'Tattoo design mockup, unrelated to any ByteLite LLC or HeartStrings project subject.' });
apply(APPUI + 'ChatGPT Image Feb 19, 2026, 08_46_35 PM.png', { subject: 'Tattoo design mockup (tree with lightning) on a male torso, alternate composition.', publicationDecision: 'unused', rejectionReason: 'Tattoo design mockup, unrelated to any ByteLite LLC or HeartStrings project subject.' });

const personal = [
  ['ChatGPT Image Feb 2, 2026, 08_56_31 AM.png', 'Candid personal photo of a real, identifiable man in a cap/hoodie with a chicken on his shoulder.'],
  ['ChatGPT Image Feb 2, 2026, 08_56_37 AM.png', 'Painted-style illustration of the same identifiable man with a horse in a field.'],
  ['ChatGPT Image Feb 2, 2026, 08_56_47 AM.png', 'Same painted illustration series, alternate crop/variant.'],
  ['ChatGPT Image Feb 2, 2026, 08_56_55 AM.png', 'Same painted illustration series, alternate crop/variant.'],
  ['ChatGPT Image Feb 2, 2026, 08_57_00 AM.png', 'Same painted illustration series, alternate crop/variant.'],
  ['ChatGPT Image Feb 2, 2026, 08_57_11 AM.png', 'Same painted illustration series, alternate crop/variant.'],
  ['ChatGPT Image Feb 4, 2026, 12_43_18 AM.png', 'Photo/painted image of the same identifiable man reading a book to a child.'],
  ['ChatGPT Image Feb 4, 2026, 12_43_25 AM.png', 'Painted illustration of the same identifiable man standing with a horse.'],
  ['ChatGPT Image Feb 4, 2026, 12_43_47 AM.png', 'Painted illustration of the same identifiable man riding a horse.'],
];
for (const [fname, subject] of personal) {
  apply(APPUI + fname, {
    subject,
    publicationDecision: 'legal-do-not-publish',
    rejectionReason: 'Personal/family photo or commissioned artwork of a real, identifiable person, unrelated to any ByteLite LLC or HeartStrings product subject - not a marketing asset.',
    fullResolutionReviewRequired: true,
    privacySafetyResult: 'unsafe - real identifiable person, personal content',
  });
}

const brainStock = [
  'ChatGPT Image Feb 4, 2026, 01_22_59 PM.png',
  'ChatGPT Image Feb 4, 2026, 01_36_28 PM.png',
  'ChatGPT Image Feb 4, 2026, 01_37_14 PM.png',
];
for (const fname of brainStock) {
  apply(APPUI + fname, {
    subject: 'Generic glowing neural-network/constellation "AI brain" stock-style image.',
    publicationDecision: 'unused',
    rejectionReason: 'Generic "AI brain" neural-network/constellation stock-style imagery - the site\'s design principles explicitly avoid generic AI-brain graphics in favor of deterministic/structural visual language.',
  });
}

apply(APPUI + 'HeartStrings_App_AIon_keep_it_moving.png', {
  subject: 'HeartStrings marketing composition: Aion character portrait + chat-coaching UI mockup, headline "Keep it moving.", correct "Aion" text rendering throughout (filename says "AIon" but the rendered image text is correctly "Aion").',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Baked-in tagline "HeartStrings - Find your forever match" overclaims certainty inconsistent with the site\'s established proof-gated posture (HeartStrings Connect is Private Test status, not a guaranteed-match product). Cannot be corrected without the source file.',
  fullResolutionReviewRequired: true,
  canonicalNamingResult: 'rendered text correctly says "Aion" despite the misleading filename',
});
apply(APPUI + 'HeartStrings_App_AIya_turn_sparks_match_v2.png', {
  subject: 'HeartStrings marketing composition: AIya character portrait + match-card UI mockup, headline "Turn sparks into something real / Aiya keeps connection moving".',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Baked-in incorrect capitalization ("Aiya" instead of canonical "AIya"), same defect as v1 (already rejected in the first pass), not corrected in this v2 variant.',
  fullResolutionReviewRequired: true,
  canonicalNamingResult: 'confirmed defect: renders "Aiya" (lowercase i)',
});
apply(CHAR + 'HeartStrings_AIya_Logo.png', {
  subject: 'Standalone AIya logo: green/blue glowing infinity-leaf-chatbubble mark, "Aiya" wordmark, tagline "Endless dialogue. Living intelligence."',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Standalone logo wordmark renders "Aiya" (lowercase i) instead of canonical "AIya" - baked-in naming defect, cannot be corrected without the source file.',
  fullResolutionReviewRequired: true,
  canonicalNamingResult: 'confirmed defect: renders "Aiya" (lowercase i)',
});
apply(CHAR + 'Image_Normalization_Visual_Concept.png', {
  subject: 'Black-and-white photo of the same identifiable man with a horse, overlaid with a technical feature-point/normalization grid visualization.',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Uses a real identifiable person\'s photo for a technical visualization concept with no confirmed rights/consent to publish this person\'s likeness, even in a technical-demo context.',
  fullResolutionReviewRequired: true,
  privacySafetyResult: 'unsafe - real identifiable person',
});

apply(BOOT + 'Bootstrap_beachball_edge_mask.png', { subject: 'Simple beach-ball line-drawing edge-detection mask (technical test fixture), no people.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Safe abstract test-object mask; candidate for a future ByteSight edge/region-detection evidence example, not integrated this pass.' });
apply(BOOT + 'Bootstrap_beachball_shadow_mask.png', { subject: 'Simple gray 3D beach-ball render with shadow (technical test fixture), no people.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the edge-mask sibling - safe test object, future ByteSight evidence candidate.' });
apply(BOOT + 'Bootstrap_source_beachball.png', { subject: 'Photographic beach ball (red/yellow/blue), technical test source image, no people.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Safe test-source photo; future ByteSight evidence candidate.' });
apply(BOOT + 'Bootstrap_source_couple_embracing.png', { subject: 'Stock photo of an unrelated real couple embracing - technical test source image.', publicationDecision: 'legal-do-not-publish', rejectionReason: 'Shows unrelated real people (stock photo used as a technical test fixture) - not appropriate to publish as a marketing or evidence image without rights confirmation.', fullResolutionReviewRequired: true, privacySafetyResult: 'unsafe - unrelated real people' });
apply(BOOT + 'Bootstrap_source_milk_crate.png', { subject: 'Photographic blue plastic milk crate, technical test source image, no people.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Safe test-source photo; future ByteSight evidence candidate.' });
apply(BOOT + 'Bootstrap_source_rubiks_cube.png', { subject: 'Photographic Rubik\'s cube, technical test source image, no people.', publicationDecision: 'legal-do-not-publish', rejectionReason: 'Depicts a third-party trademarked product (Rubik\'s Cube) - not appropriate for publication regardless of its role as an internal test fixture.', fullResolutionReviewRequired: true });
apply(SIL + 'edge_sil.png', { subject: 'Mostly-black technical edge-silhouette output image (thin white outline on black), paired with the Bootstrap_Tests object masks.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Low standalone visual value without its paired source image; same future-ByteSight-evidence disposition as the Bootstrap_Tests masks.' });

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 4.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
