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
    inspectionMethod: patch.inspectionMethod || 'contact-sheet-007 review',
    fullResolutionReviewRequired: patch.fullResolutionReviewRequired ?? false,
    staleTextResult: patch.staleTextResult || 'no baked-in text issues found',
    canonicalNamingResult: patch.canonicalNamingResult || 'no baked-in naming defect found',
    privacySafetyResult: patch.privacySafetyResult || 'safe',
  });
  n++;
}
const D = 'D:\\Download\\';
const SAMP = D + 'ByteLite_LLC_Editable_SVG_Samples\\';

const orgChartVariants2 = ['08_layered_bands.svg', '09_modular_grid.svg', '10_precision_flowline.svg', '11_dual_pillars.svg', '12_contained_node_map.svg', '14_framed_section_headers.svg'];
for (const fname of orgChartVariants2) {
  apply(SAMP + fname, { subject: `Org-chart diagram template variant (${fname.replace('.svg','').replace(/^\d+_/,'').replace(/_/g,' ')} layout), same content family as the already-selected/corrected 06_executive_architecture.svg.`, publicationDecision: 'inspected-not-used-directly', selectionNote: 'Alternate layout variant of the org-chart template already selected in a prior pass; not needed.' });
}

apply(D + 'cb905fcd-0a4d-4998-9382-b6e4e49ec46c.png', { subject: 'Tattoo design concept sheet "CONCEPT 10: Broken World Seed" - front/back torso tattoo mockups.', publicationDecision: 'unused', rejectionReason: 'Tattoo design concept art, unrelated to any ByteLite LLC or HeartStrings project subject.' });
apply(D + 'Chair_Layer.png', { subject: 'Abstract teal shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'ChatGPT Image Apr 7, 2026, 07_10_14 PM.png', { subject: 'AIya card-game portrait (duplicate timestamp collision with an already-reviewed sheet-1 file at a different path - same composition: white hair, halo, holding four aces).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the sheet-1 AIya card-game portrait - correct styling, no defect, not integrated this pass.' });
apply(D + 'ChatGPT Image Apr 7, 2026, 07_13_26 PM.png', { subject: 'Two-panel comparison: infinity-heart logo + AIya bust portrait (left), AIya with playing cards (right), casino aesthetic.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Comparison/pairing composition of already-reviewed AIya portrait elements; not integrated this pass, future gallery candidate.' });

apply(D + 'ChatGPT Image Jul 12, 2026, 01_57_29 PM.png', {
  subject: 'Elegant couple at a candlelit restaurant table, wine and plated dinner, upscale ambient lighting - tasteful date-night scene.',
  publicationDecision: 'selected',
  selectionNote: 'Directly relevant, professional-quality lifestyle imagery for HeartStrings Connect Date Planning/Restaurants content.',
  canonicalDestination: 'public/heartstrings-connect/heartstrings-connect-restaurant-date-scene.webp',
  fullResolutionReviewRequired: true,
});
apply(D + 'ChatGPT Image Jul 12, 2026, 02_46_24 PM.png', {
  subject: 'ByteLite LLC "Signup-to-Live Approval Flow" diagram: 6-step restaurant partner onboarding process (Create Account -> Build Restaurant Profile -> Choose Promotion Deal -> Stripe Payment -> ByteLite Review -> Go Live), with explicit "Payment does not mean instant auto-publish" and "Quality over quantity" callouts.',
  publicationDecision: 'selected',
  selectionNote: 'Directly relevant, correctly-branded, accurate process diagram matching the actual Restaurant Partner Program manual-review flow already described in site copy. Selected for the Restaurant Partner Program page.',
  canonicalDestination: 'public/heartstrings-connect/restaurant-partner-signup-flow-diagram.webp',
  fullResolutionReviewRequired: true,
});
apply(D + 'ChatGPT Image Jul 17, 2026, 03_53_06 PM.png', {
  subject: 'Three HeartStrings Play component technical renders: masquerade-mask "Tier Tracker Slider" (1-6 scale), "Cutaway With Consent Sphere" (crown/mask with numbered sphere), "Bottom View With A/B Player Chip and Sphere Retainer". Contains two minor spelling typos baked into the labels ("Teir" instead of "Tier", "Buttom" instead of "Bottom").',
  publicationDecision: 'inspected-not-used-directly',
  selectionNote: 'Valuable, directly relevant component documentation, but baked-in spelling typos ("Teir", "Buttom") should be corrected before public use. Documented as a future candidate pending a corrected source file.',
  fullResolutionReviewRequired: true,
  staleTextResult: 'baked-in typos found: "Teir" (should be "Tier"), "Buttom" (should be "Bottom")',
});
apply(D + 'ChatGPT Image Jul 17, 2026, 04_00_42 PM.png', {
  subject: 'HeartStrings Play box-back render: full "GAME CONTENTS" list (6 tier decks, 1 Decree deck, 1 Consent Cup holding up to 18 consent spheres, 3 custom dice red/pink/purple, 6 black dice with golden dots, 20x20 board extends to 20x40), Ages 18+, Players 2-18, SKU HSP-1001, tagline "Consent. Connection. Elevated."',
  publicationDecision: 'selected',
  selectionNote: 'Authoritative, correctly-specified product box-back render confirming exact component counts already used in site copy (matches established 2-18 players, red/pink/purple dice, Consent Cup spec exactly). Strong candidate for HeartStrings Play Components/Editions pages.',
  canonicalDestination: 'public/heartstrings/heartstrings-play-box-back-full-contents.webp',
  fullResolutionReviewRequired: true,
});

const partyScenes = [
  ['ChatGPT Image Jul 17, 2026, 04_37_41 AM (10).png', true],
  ['ChatGPT Image Jul 17, 2026, 04_37_41 AM (2).png', false],
  ['ChatGPT Image Jul 17, 2026, 04_37_41 AM (3).png', false],
  ['ChatGPT Image Jul 17, 2026, 04_37_41 AM (4).png', false],
  ['ChatGPT Image Jul 17, 2026, 04_37_41 AM (6).png', false],
  ['ChatGPT Image Jul 17, 2026, 04_37_41 AM (8).png', false],
];
for (const [fname, isRep] of partyScenes) {
  apply(D + fname, {
    subject: 'Diverse group of six adults socializing around a HeartStrings-branded game table (infinity-heart motif, black component boxes, pink dice visible), upscale lounge setting.',
    publicationDecision: isRep ? 'selected' : 'inspected-not-used-directly',
    selectionNote: isRep
      ? 'Professional-quality lifestyle photography directly showing the product in a group social setting matching the "2-18 players" party format. Selected for HeartStrings Play marketing.'
      : 'Same series as the selected representative group-lifestyle image - not integrated to avoid flooding a page with near-identical scenes.',
    canonicalDestination: isRep ? 'public/heartstrings/heartstrings-play-group-lifestyle-scene.webp' : undefined,
    fullResolutionReviewRequired: isRep,
  });
}

apply(D + 'ChatGPT Image Jul 17, 2026, 08_08_11 AM (10).png', {
  subject: 'Composite marketing image: HeartStrings board mockup with character cards labeled "Aion" (correct) and "Aiya" (INCORRECT lowercase i), three phone app UI mockups (profile/compatibility/location screens), and a BYTELITE leaf+infinity logo graphic.',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Baked-in incorrect capitalization ("Aiya" instead of canonical "AIya") on the character card label - confirmed at full resolution. Cannot be corrected without the source file, and the defect cannot be cropped out without losing the rest of the composite\'s value.',
  fullResolutionReviewRequired: true,
  canonicalNamingResult: 'confirmed defect: character card reads "Aiya" (lowercase i); paired "Aion" card is correctly capitalized',
});

// Higher-resolution source renders of the six tier cards (supersede the smaller Deck_*.png print exports selected in sheet 2).
const tierHiRes = [
  ['ChatGPT Image Jul 17, 2026, 11_35_27 AM (1).png', 'Initiate', 'pink'],
  ['ChatGPT Image Jul 17, 2026, 11_35_27 AM (2).png', 'Connect', 'magenta'],
  ['ChatGPT Image Jul 17, 2026, 11_35_27 AM (3).png', 'Seduce', 'hot-pink'],
  ['ChatGPT Image Jul 17, 2026, 11_35_27 AM (4).png', 'Stimulate', 'orange'],
  ['ChatGPT Image Jul 17, 2026, 11_35_27 AM (5).png', 'Edge', 'red'],
  ['ChatGPT Image Jul 17, 2026, 11_35_27 AM (6).png', 'Climax', 'dark-red'],
];
for (const [fname, tier, color] of tierHiRes) {
  apply(D + fname, {
    subject: `Tier-card graphic: gold infinity-heart on ${color} background, "${tier}" text - same design as the Deck_${tier}_2.5_3.5.png print export already selected in sheet 2, but ~30x larger file size (higher source resolution).`,
    publicationDecision: 'selected',
    selectionNote: `Higher-resolution source for the ${tier} tier card - supersedes the smaller Deck_${tier}_2.5_3.5.png print-size export as the web-derivative source, avoiding any upscaling.`,
    canonicalDestination: `public/heartstrings/tiers/heartstrings-play-tier-card-${tier.toLowerCase()}-graphic.webp`,
    fullResolutionReviewRequired: true,
  });
}
// Downgrade the sheet-2 lower-resolution picks now that a higher-res source is confirmed.
for (const tier of ['Initiate', 'Connect', 'Seduce', 'Stimulate', 'Edge', 'Climax']) {
  const rec = inv.records.find((r) => r.originalPath === `D:\\Download\\Deck_${tier}_2.5_3.5.png`);
  if (rec) {
    rec.publicationDecision = 'duplicate';
    rec.duplicateGroup = `tier-card-${tier.toLowerCase()}`;
    rec.selectionNote = `Superseded by the higher-resolution "ChatGPT Image Jul 17, 2026, 11_35_27 AM" source of the same design, selected instead to avoid using a smaller/lower-quality source than necessary.`;
    delete rec.canonicalDestination;
    n++;
  }
}
const edgeSmall = inv.records.find((r) => r.originalPath === 'D:\\Download\\01_HeartStrings_Boardgame\\HeartStrings_BG_Edge.png');
if (edgeSmall) {
  edgeSmall.publicationDecision = 'duplicate';
  edgeSmall.duplicateGroup = 'tier-card-edge';
  edgeSmall.selectionNote = 'Superseded by the higher-resolution Edge tier-card source selected this pass.';
  delete edgeSmall.canonicalDestination;
  n++;
}

const aionPortraits = ['ChatGPT Image Jul 19, 2026, 01_47_01 PM (1).png', 'ChatGPT Image Jul 19, 2026, 01_47_01 PM (10).png', 'ChatGPT Image Jul 19, 2026, 01_47_01 PM (2).png'];
for (const fname of aionPortraits) {
  apply(D + fname, { subject: 'Aion solo portrait, casino/city-lights aesthetic, same established styling as other Aion portraits.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other Aion solo portraits - correct styling, not integrated this pass, future gallery candidate.' });
}

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 7.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
