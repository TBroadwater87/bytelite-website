import fs from 'node:fs';
const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));
let n = 0;
function apply(p, patch) {
  const rec = inv.records.find((r) => r.originalPath === p);
  if (!rec) { console.log('STILL NOT FOUND:', p); return; }
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

const FC = 'D:\\Download\\01_HeartStrings_Boardgame\\Final_Candidates\\';
const ROOT = 'D:\\Download\\01_HeartStrings_Boardgame\\';
const MOCK = 'D:\\Download\\01_HeartStrings_Boardgame\\Mockups\\zip_extracted\\';
const UI = 'D:\\Download\\02_HeartStrings_App_and_Wingman\\App_Icons\\heartstrings_ui_pack\\heartstrings_ui_pack\\app_icons\\';

apply(FC + 'ChatGPT Image Apr 15, 2026, 12_49_42 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: tiara, belt, bra - red/gold display style.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Stylized object renders, no people, no nudity - safe but not clearly tied to a confirmed page section this pass; future Mischief/Components candidate.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_49_54 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: keychain, red high heel, lipstick.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the tiara/belt/bra set - safe stylized object renders, not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_50_01 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: ring, dice, playing cards.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Directly game-relevant (dice/cards) but redundant with existing dice/card product photography already in use; not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_50_19 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: blindfold/goggles, pouch, boot.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other prop-pedestal sets - safe, not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_50_26 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: panties, key, perfume bottle.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other prop-pedestal sets - safe stylized objects, not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 15, 2026, 12_50_37 PM.png', { subject: 'Three stylized 3D prop icons on pedestals: wine bottle, underwear, lingerie top.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other prop-pedestal sets - safe stylized objects (no people), not integrated this pass.' });
apply(FC + 'ChatGPT Image Apr 26, 2026, 05_01_57 PM.png', { subject: 'Aion solo portrait, holding red die, casino aesthetic (Final_Candidates folder variant).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other Aion solo portraits - correct styling, not integrated this pass, future candidate.' });
apply(FC + 'HeartStrings_BG_Title.png', { subject: 'Elegant cursive "HeartStrings" wordmark with "PLAY" in caps beneath, correct canonical spelling/capitalization, no defects.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Clean, correctly-branded alternate logotype. Not swapped in for the current site logo without explicit brand direction - documented as a future candidate.' });
apply(ROOT + 'ChatGPT Image Apr 14, 2026, 12_13_00 PM.png', { subject: 'Plain red radial-gradient glow background texture, no distinct subject.', publicationDecision: 'unused', rejectionReason: 'Generic background texture, no unique subject, redundant with the site\'s existing color treatment.' });
apply(MOCK + 'ChatGPT Image Apr 14, 2026, 12_13_21 PM.png', { subject: 'Plain red radial-gradient glow background texture (Mockups copy) - same style as the other red-glow texture.', publicationDecision: 'unused', rejectionReason: 'Generic background texture, no unique subject, redundant with the site\'s existing color treatment.' });
apply(MOCK + 'ChatGPT Image Apr 7, 2026, 07_10_24 PM.png', { subject: 'Aion solo portrait variant (Mockups/zip_extracted copy) - same character/styling as the paired portrait already reviewed.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as other Aion solo portraits.' });
apply(UI + 'knot-heart-dark.png', { subject: 'Pink heart icon with a diagonal ribbon/knot slash - HeartStrings app UI icon set, correct branding, no defects.', publicationDecision: 'selected', selectionNote: 'Clean, purpose-built UI icon from the app icon pack. Selected for HeartStrings Connect Safety or Consent-related iconography.', canonicalDestination: 'public/heartstrings-connect/icons/knot-heart-consent-icon.webp' });
apply(UI + 'knot-heart-dark.svg', { subject: 'Vector version of the knot-heart UI icon (same design as the PNG).', publicationDecision: 'duplicate', duplicateGroup: 'knot-heart-icon', selectionNote: 'Same design as knot-heart-dark.png (PNG selected instead as the raster source used elsewhere in this pass; SVG source preserved but not separately used).' });

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records (sheet 2 fix-up).`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
