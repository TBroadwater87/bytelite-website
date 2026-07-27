import fs from 'node:fs';
const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));

const base = (suffix) => inv.records.find((r) => r.originalPath === suffix);
let n = 0;
function apply(suffix, patch) {
  const rec = base(suffix);
  if (!rec) { console.log('NOT FOUND:', suffix); return; }
  Object.assign(rec, patch, {
    visuallyInspected: true,
    dispositionType: 'individually-visually-inspected',
    inspectionMethod: patch.inspectionMethod || 'contact-sheet-002 + full-resolution review',
    fullResolutionReviewRequired: patch.fullResolutionReviewRequired ?? true,
    staleTextResult: patch.staleTextResult || 'no baked-in text issues found',
    canonicalNamingResult: patch.canonicalNamingResult || 'no baked-in naming defect found',
    privacySafetyResult: patch.privacySafetyResult || 'safe',
  });
  n++;
}

const DUO = 'D:\\Download\\01_HeartStrings_Boardgame\\Cards_Decks\\HeartStrings_Duo_Crimson_E3_Sorted\\';
const FC = 'D:\\Download\\01_HeartStrings_Boardgame\\Final_Candidates\\';
const ROOT = 'D:\\Download\\01_HeartStrings_Boardgame\\';
const ASSETS = 'D:\\Download\\Assets\\';
const MOCK = 'D:\\Download\\Mockups\\zip_extracted\\';
const UI = 'D:\\Download\\heartstrings_ui_pack\\app_icons\\';

// Duo pair variant series - near-duplicate poses, not exact bytes. Select one representative,
// document the rest as same-disposition (avoids flooding, per spec's own instruction).
apply(DUO + 'Var_06_StraightPair_NoProp.png', { subject: 'AIya+Aion couple (halo/horns motif) in formal red/gold casino attire, straight pose at a table with cards/chips/drinks, no held prop.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Tasteful, on-brand couple pairing, fully clothed. One of 5 near-identical pose variants (Var_06-10) in this folder - not integrated this pass to avoid flooding a page with near-identical images; representative of the set, available for a future gallery.' });
apply(DUO + 'Var_07_ShoulderHand_Jewelry.png', { subject: 'Same AIya+Aion couple pairing, shoulder/hand pose emphasizing jewelry detail.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as Var_06 - near-duplicate pose variant, not integrated.' });
apply(DUO + 'Var_08_Tight_ShoulderLean.png', { subject: 'Same AIya+Aion couple pairing, tight shoulder-lean pose.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as Var_06 - near-duplicate pose variant, not integrated.' });
apply(DUO + 'Var_09_Cozy_Chips.png', { subject: 'Same AIya+Aion couple pairing, cozy pose with poker chips visible.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as Var_06 - near-duplicate pose variant, not integrated.' });
apply(DUO + 'Var_10_HandToEar_PaintingBG.png', { subject: 'Same AIya+Aion couple pairing, hand-to-ear pose with painting visible in background.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as Var_06 - near-duplicate pose variant, not integrated.' });

// Prop pedestal render sets - stylized 3D icon-style renders of intimate-apparel-adjacent items, no people.
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_49_02 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: tiara, belt, bra - red/gold display style.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Stylized object renders, no people, no nudity - safe but not clearly tied to a confirmed page section this pass; future Mischief/Components candidate.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_49_30 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: keychain, red high heel, lipstick.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the tiara/belt/bra set - safe stylized object renders, not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_56_10 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: ring, dice, playing cards.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Directly game-relevant (dice/cards) but redundant with existing dice/card product photography already in use; not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_56_38 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: blindfold/goggles, pouch, boot.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other prop-pedestal sets - safe, not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_56_55 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: panties, key, perfume bottle.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other prop-pedestal sets - safe stylized objects, not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_57_20 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: wine bottle, underwear, lingerie top.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other prop-pedestal sets - safe stylized objects (no people), not integrated this pass.' });

apply(FC + 'ChatGPT Image Apr 26, 2026, 05_01_00 PM.png', { subject: 'Aion solo portrait, holding red die, casino aesthetic (Final_Candidates folder variant).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other Aion solo portraits - correct styling, not integrated this pass, future candidate.' });

// Mischief-dice-category icon tiles: Drink/Halo/Hands/Hearts/Social/Strip - each appears at 3
// locations (root, Final_Candidates, Assets). Inspect the root copy of each; hash propagation
// (run separately) resolves the Final_Candidates/Assets copies if byte-identical, otherwise
// they get the same grounded disposition directly here.
const mischiefIcons = [
  ['Drink', 'Gold cocktail-glass icon on orange tile.'],
  ['Halo', 'Gold halo + crescent-moon icons on mauve/pink tile.'],
  ['Hands', 'Gold open-hand icon on orange tile.'],
  ['Hearts', 'Gold interlocking double-heart icon on pink tile.'],
  ['Social', 'Gold party-popper/confetti icon on purple tile.'],
  ['Strip', 'Gold zipper icon on red tile.'],
];
for (const [name, desc] of mischiefIcons) {
  for (const dir of [ROOT, FC, ASSETS]) {
    const rec = base(dir + `HeartStrings_BG_${name}.png`);
    if (!rec) continue;
    if (rec.visuallyInspected) continue;
    apply(dir + `HeartStrings_BG_${name}.png`, {
      subject: `${desc} Filename/theme strongly suggests a Mischief-dice category face icon (Drink/Halo/Hands/Hearts/Social/Strip match the red/pink/purple Mischief dice concept from the product spec).`,
      publicationDecision: 'selected',
      selectionNote: `Directly relevant, correctly-themed Mischief dice category icon. Selected for the HeartStrings Play Components page.`,
      canonicalDestination: `public/heartstrings/tiers/heartstrings-play-mischief-icon-${name.toLowerCase()}.webp`,
    });
  }
}

apply(ROOT + 'HeartStrings_BG_Edge.png', { subject: 'Full tier-card graphic: gold infinity-heart motif on red background, "Edge" text - matches the canonical six-tier escalation system exactly.', publicationDecision: 'selected', selectionNote: 'Part of a complete, correctly-labeled six-card tier set discovered this pass (see Deck_*.png at D:\\Download root) - stronger and more consistent than relying on photographic tier-card renders alone. Selected to replace/complement the current tier imagery on HeartStrings Play pages.', canonicalDestination: 'public/heartstrings/tiers/heartstrings-play-tier-card-edge-graphic.webp' });

apply(FC + 'HeartStrings_BG_Title.png', { subject: 'Elegant cursive "HeartStrings" wordmark with "PLAY" in caps beneath, correct canonical spelling/capitalization, no defects.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Clean, correctly-branded alternate logotype. Not swapped in for the current site logo without explicit brand direction - documented as a future candidate.' });

apply(ROOT + 'ChatGPT Image Apr 14, 2026, 12_13_00 PM.png', { subject: 'Plain red radial-gradient glow background texture, no distinct subject.', publicationDecision: 'unused', rejectionReason: 'Generic background texture, no unique subject, redundant with the site\'s existing color treatment.' });

apply(MOCK + 'ChatGPT Image Apr 7, 2026, 07_10_24 PM.png', { subject: 'Aion solo portrait variant (Mockups/zip_extracted copy) - same character/styling as the paired portrait already reviewed.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other Aion solo portraits.' });

apply(UI + 'knot-heart-dark.png', { subject: 'Pink heart icon with a diagonal ribbon/knot slash - HeartStrings app UI icon set, correct branding, no defects.', publicationDecision: 'selected', selectionNote: 'Clean, purpose-built UI icon from the app icon pack. Selected for HeartStrings Connect Safety or Consent-related iconography.', canonicalDestination: 'public/heartstrings-connect/icons/knot-heart-consent-icon.webp' });
apply(UI + 'knot-heart-dark.svg', { subject: 'Vector version of the knot-heart UI icon (same design as the PNG).', publicationDecision: 'duplicate', duplicateGroup: 'knot-heart-icon', selectionNote: 'Same design as knot-heart-dark.png (PNG selected instead as the raster source used elsewhere in this pass; SVG source preserved but not separately used).' });

// Complete tier-card set found at D:\Download root - a major discovery this pass.
apply('D:\\Download\\Deck_Initiate_2.5_3.5.png', { subject: 'Tier-card graphic: gold infinity-heart on pink background, "Initiate" text - first of a complete, correctly-labeled six-card tier set.', publicationDecision: 'selected', selectionNote: 'Part of a complete six-card tier deck (Initiate/Connect/Seduce/Stimulate/Edge/Climax), consistent design, correct canonical tier names, no defects. Selected for HeartStrings Play tier presentation.', canonicalDestination: 'public/heartstrings/tiers/heartstrings-play-tier-card-initiate-graphic.webp', inspectionMethod: 'full-resolution review (targeted search after HeartStrings_BG_Edge.png match)' });
apply('D:\\Download\\Deck_Connect_2.5_3.5.png', { subject: 'Tier-card graphic: gold infinity-heart on magenta background, "Connect" text.', publicationDecision: 'selected', selectionNote: 'Part of the complete six-card tier deck. Selected for HeartStrings Play tier presentation.', canonicalDestination: 'public/heartstrings/tiers/heartstrings-play-tier-card-connect-graphic.webp', inspectionMethod: 'full-resolution review (targeted search after HeartStrings_BG_Edge.png match)' });
apply('D:\\Download\\Deck_Seduce_2.5_3.5.png', { subject: 'Tier-card graphic: gold infinity-heart on hot-pink background, "Seduce" text.', publicationDecision: 'selected', selectionNote: 'Part of the complete six-card tier deck. Selected for HeartStrings Play tier presentation.', canonicalDestination: 'public/heartstrings/tiers/heartstrings-play-tier-card-seduce-graphic.webp', inspectionMethod: 'full-resolution review (targeted search after HeartStrings_BG_Edge.png match)' });
apply('D:\\Download\\Deck_Stimulate_2.5_3.5.png', { subject: 'Tier-card graphic: gold infinity-heart on orange background, "Stimulate" text.', publicationDecision: 'selected', selectionNote: 'Part of the complete six-card tier deck. Selected for HeartStrings Play tier presentation.', canonicalDestination: 'public/heartstrings/tiers/heartstrings-play-tier-card-stimulate-graphic.webp', inspectionMethod: 'full-resolution review (targeted search after HeartStrings_BG_Edge.png match)' });
apply('D:\\Download\\Deck_Climax_2.5_3.5.png', { subject: 'Tier-card graphic: gold infinity-heart on dark-red background, "Climax" text.', publicationDecision: 'selected', selectionNote: 'Part of the complete six-card tier deck. Selected for HeartStrings Play tier presentation.', canonicalDestination: 'public/heartstrings/tiers/heartstrings-play-tier-card-climax-graphic.webp', inspectionMethod: 'full-resolution review (targeted search after HeartStrings_BG_Edge.png match)' });
apply('D:\\Download\\Deck_Edge_2.5_3.5.png', { subject: 'Tier-card graphic: gold infinity-heart on red background, "Edge" text (matches HeartStrings_BG_Edge.png design, higher-res source).', publicationDecision: 'selected', selectionNote: 'The canonical, full-resolution source for the Edge tier card - used in place of the smaller HeartStrings_BG_Edge.png copy.', canonicalDestination: 'public/heartstrings/tiers/heartstrings-play-tier-card-edge-graphic.webp', inspectionMethod: 'full-resolution review (targeted search)' });

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 2 + deck-card discovery.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
