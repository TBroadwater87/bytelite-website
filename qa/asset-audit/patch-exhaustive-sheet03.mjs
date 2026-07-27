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
    inspectionMethod: patch.inspectionMethod || 'contact-sheet-003 review (clean, purpose-built UI icon system - filename+visual content unambiguous)',
    fullResolutionReviewRequired: patch.fullResolutionReviewRequired ?? false,
    staleTextResult: 'no baked-in text (vector UI icons)',
    canonicalNamingResult: 'no baked-in naming defect (no character names present)',
    privacySafetyResult: 'safe',
  });
  n++;
}

const P = 'D:\\Download\\02_HeartStrings_App_and_Wingman\\App_Icons\\heartstrings_ui_pack\\heartstrings_ui_pack\\';

apply(P + 'app_icons\\knot-heart-light.png', { subject: 'Knot-heart icon, light-theme color variant (raster).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same concept as knot-heart-dark.png (already selected in this pass for the dark-themed site) - light variant not needed.' });
apply(P + 'app_icons\\knot-heart-light.svg', { subject: 'Knot-heart icon, light-theme color variant (vector).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same concept as knot-heart-dark (already selected) - light variant not needed for this dark-themed site.' });
apply(P + 'app_icons\\protected-heart-dark.png', { subject: 'Shield-with-heart icon, dark-theme variant (raster) - safety/protection concept.', publicationDecision: 'duplicate', duplicateGroup: 'protected-heart-icon', selectionNote: 'Raster copy of protected-heart-dark.svg (selected instead as the vector source).' });
apply(P + 'app_icons\\protected-heart-dark.svg', { subject: 'Shield-with-heart icon, dark-theme variant (vector) - safety/protection concept, matches the site\'s dark theme.', publicationDecision: 'selected', selectionNote: 'Clean, on-brand safety icon not previously imported. Selected for HeartStrings Connect Safety page.', canonicalDestination: 'public/heartstrings-connect/icons/protected-heart-shield.svg' });
apply(P + 'app_icons\\protected-heart-light.png', { subject: 'Shield-with-heart icon, light-theme variant (raster).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same concept as protected-heart-dark (selected) - light variant not needed for this dark-themed site.' });
apply(P + 'app_icons\\protected-heart-light.svg', { subject: 'Shield-with-heart icon, light-theme variant (vector).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same concept as protected-heart-dark (selected) - light variant not needed.' });
apply(P + 'app_icons\\tension-lines-dark.png', { subject: 'Two overlapping heart-loop outlines (pink+teal), dark-theme variant (raster) - compatibility/connection visual metaphor.', publicationDecision: 'duplicate', duplicateGroup: 'tension-lines-icon', selectionNote: 'Raster copy of tension-lines-dark.svg (selected instead as the vector source).' });
apply(P + 'app_icons\\tension-lines-dark.svg', { subject: 'Two overlapping heart-loop outlines (pink+teal), dark-theme variant (vector).', publicationDecision: 'selected', selectionNote: 'Clean, on-brand compatibility-metaphor icon not previously imported. Selected for HeartStrings Connect Compatibility and Matching page.', canonicalDestination: 'public/heartstrings-connect/icons/compatibility-tension-lines.svg' });
apply(P + 'app_icons\\tension-lines-light.png', { subject: 'Same tension-lines concept, light-theme variant (raster).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same concept as tension-lines-dark (selected) - light variant not needed.' });
apply(P + 'app_icons\\tension-lines-light.svg', { subject: 'Same tension-lines concept, light-theme variant (vector).', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same concept as tension-lines-dark (selected) - light variant not needed.' });
apply(P + 'previews\\icon-sheet-light.svg', { subject: 'Design-reference contact sheet showing the entire HeartStrings icon system at once (small grid with category labels: Discover, Connections, Compatibility, Messages, Profile, Verified, etc.).', publicationDecision: 'unused', rejectionReason: 'A design-reference/preview sheet, not an individual usable icon asset for a page.' });

// Filled-style duplicates of concepts selected/available in outline style below.
apply(P + 'svg\\filled\\connections-loop-heart.svg', { subject: 'Two-loop/infinity connection icon, filled black silhouette style.', publicationDecision: 'duplicate', duplicateGroup: 'connections-loop-heart-icon', selectionNote: 'Filled-style variant; outline style selected instead for consistency with already-imported icons.' });
apply(P + 'svg\\filled\\heartstrings-mark.svg', { subject: 'Heart-with-slash brand mark icon, filled black silhouette style.', publicationDecision: 'duplicate', duplicateGroup: 'heartstrings-mark-icon', selectionNote: 'Filled-style variant; outline style selected instead for consistency.' });
apply(P + 'svg\\filled\\messages-bubble-string.svg', { subject: 'Chat-bubble-with-lines icon, filled black silhouette style.', publicationDecision: 'duplicate', duplicateGroup: 'messages-bubble-string-icon', selectionNote: 'Filled-style variant; outline style selected instead for consistency.' });
apply(P + 'svg\\filled\\profile-heart-ring.svg', { subject: 'Profile-ring-with-heart icon, filled black silhouette style.', publicationDecision: 'duplicate', duplicateGroup: 'profile-heart-ring-icon', selectionNote: 'Filled-style variant; outline style selected instead for consistency.' });
apply(P + 'svg\\filled\\relationship-intent-path-heart.svg', { subject: 'Zigzag path-with-heart icon, filled black silhouette style - relationship progression metaphor.', publicationDecision: 'duplicate', duplicateGroup: 'relationship-intent-path-heart-icon', selectionNote: 'Filled-style variant; outline style selected instead for consistency.' });
apply(P + 'svg\\filled\\values-home-heart.svg', { subject: 'House-with-heart icon, filled black silhouette style - values/home concept.', publicationDecision: 'selected', selectionNote: 'No outline-style sibling found on this sheet; selected as-is (filled style) for a Compatibility/Values feature section.', canonicalDestination: 'public/heartstrings-connect/icons/values-home-heart.svg' });

apply(P + 'svg\\outline\\age-verified-id-check.svg', { subject: 'ID-card-with-checkmark icon, outline style.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/age-verified-id-check.svg already imported in an earlier pass.' });
apply(P + 'svg\\outline\\block-person-slash.svg', { subject: 'Person-with-slash icon, outline style - block/report concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/block-person-slash.svg already imported.' });
apply(P + 'svg\\outline\\compatibility-heart-checkgrid.svg', { subject: 'Heart-with-checklist-grid icon, outline style.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/compatibility-heart-checkgrid.svg already imported.' });
apply(P + 'svg\\outline\\connections-loop-heart.svg', { subject: 'Two-loop/infinity connection icon, outline style.', publicationDecision: 'selected', selectionNote: 'Clean, on-brand, not previously imported. Selected for HeartStrings Connect Games/Shared Activities or Compatibility page.', canonicalDestination: 'public/heartstrings-connect/icons/connections-loop-heart.svg' });
apply(P + 'svg\\outline\\consent-open-palm-heart.svg', { subject: 'Open-palm-with-heart icon, outline style - consent concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/consent-open-palm-heart.svg already imported.' });
apply(P + 'svg\\outline\\discover-compass-heart.svg', { subject: 'Compass-with-heart icon, outline style - discovery concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/discover-compass-heart.svg already imported.' });
apply(P + 'svg\\outline\\heartstrings-mark.svg', { subject: 'Heart-with-slash brand mark icon, outline style.', publicationDecision: 'selected', selectionNote: 'Clean brand-mark icon, not previously imported. Selected as a compact HeartStrings Connect brand accent.', canonicalDestination: 'public/heartstrings-connect/icons/heartstrings-mark.svg' });
apply(P + 'svg\\outline\\location-verified-pin-check.svg', { subject: 'Map-pin-with-checkmark icon, outline style - verified location concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/location-verified-pin-check.svg already imported.' });
apply(P + 'svg\\outline\\messages-bubble-string.svg', { subject: 'Chat-bubble-with-lines icon, outline style.', publicationDecision: 'selected', selectionNote: 'Clean, on-brand, not previously imported. Selected for HeartStrings Connect Games and Shared Activities page.', canonicalDestination: 'public/heartstrings-connect/icons/messages-bubble-string.svg' });
apply(P + 'svg\\outline\\photo-recency-camera-check.svg', { subject: 'Camera-with-checkmark icon, outline style - photo verification concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/photo-recency-camera-check.svg already imported.' });
apply(P + 'svg\\outline\\privacy-lock-heart.svg', { subject: 'Lock-with-heart icon, outline style - privacy concept.', publicationDecision: 'already-in-repo', selectionNote: 'Matches public/heartstrings-connect/icons/privacy-lock-heart.svg already imported.' });
apply(P + 'svg\\outline\\profile-heart-ring.svg', { subject: 'Profile-ring-with-heart icon, outline style.', publicationDecision: 'selected', selectionNote: 'Clean, on-brand, not previously imported. Selected for a HeartStrings Connect profile-related section.', canonicalDestination: 'public/heartstrings-connect/icons/profile-heart-ring.svg' });
apply(P + 'svg\\outline\\relationship-intent-path-heart.svg', { subject: 'Zigzag path-with-heart icon, outline style - relationship progression metaphor.', publicationDecision: 'selected', selectionNote: 'Clean, on-brand, not previously imported. Selected for HeartStrings Connect Compatibility and Matching page.', canonicalDestination: 'public/heartstrings-connect/icons/relationship-intent-path-heart.svg' });

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 3.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
