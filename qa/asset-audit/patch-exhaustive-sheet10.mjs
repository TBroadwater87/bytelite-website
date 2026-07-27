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
  });
  n++;
}
const D = 'D:\\Download\\';

const iconCrops = [
  'ChatGPT Image Jul 20, 2026, 07_21_31 AM.png', 'ChatGPT Image Jul 20, 2026, 07_21_37 AM (1).png',
  'ChatGPT Image Jul 20, 2026, 07_21_38 AM (2).png', 'ChatGPT Image Jul 20, 2026, 07_21_38 AM (3).png',
  'ChatGPT Image Jul 20, 2026, 07_21_39 AM (4).png', 'ChatGPT Image Jul 20, 2026, 07_21_39 AM (5).png',
  'ChatGPT Image Jul 20, 2026, 07_21_39 AM (6).png', 'ChatGPT Image Jul 20, 2026, 07_21_40 AM (10).png',
  'ChatGPT Image Jul 20, 2026, 07_21_40 AM (7).png', 'ChatGPT Image Jul 20, 2026, 07_21_40 AM (8).png',
  'ChatGPT Image Jul 20, 2026, 07_21_40 AM (9).png', 'ChatGPT Image Jul 20, 2026, 07_21_45 AM (1).png',
  'ChatGPT Image Jul 20, 2026, 07_21_45 AM (2).png', 'ChatGPT Image Jul 20, 2026, 07_21_46 AM (3).png',
  'ChatGPT Image Jul 20, 2026, 07_21_46 AM (4).png', 'ChatGPT Image Jul 20, 2026, 07_21_46 AM (5).png',
  'ChatGPT Image Jul 20, 2026, 07_21_46 AM (6).png', 'ChatGPT Image Jul 20, 2026, 07_21_47 AM (10).png',
  'ChatGPT Image Jul 20, 2026, 07_21_47 AM (7).png', 'ChatGPT Image Jul 20, 2026, 07_21_47 AM (8).png',
  'ChatGPT Image Jul 20, 2026, 07_21_47 AM (9).png',
];
for (const fname of iconCrops) {
  apply(D + fname, {
    subject: 'App-icon-style seasonal/portrait crop of Aion and/or AIya, no text overlay.',
    publicationDecision: 'inspected-not-used-directly',
    selectionNote: 'Part of the same oversized seasonal-variant batch as sheets 8-9 - not integrated to avoid flooding; representatives already selected elsewhere.',
    inspectionMethod: 'contact-sheet-010 review (app-icon crop, no text overlay present)',
    staleTextResult: 'no text present (character-only app-icon crop)',
    canonicalNamingResult: 'no baked-in naming defect possible - no text present in this crop style',
  });
}

apply(D + 'ChatGPT Image Jul 23, 2026, 09_38_05 PM.png', {
  subject: '"HeartStrings Play - 20x20 Board With Side Flaps" technical spec sheet: 40"x20" open dimensions (10" left flap + 20"x20" main play surface + 10" right flap), correct logo, full tier-deck strip, Decree card, AIya and Aion character images, double-sided board callout ("Flip to play the Party-Face side - 20x40").',
  publicationDecision: 'selected',
  selectionNote: 'Authoritative, correctly-specified, clean technical board diagram matching the site\'s established tri-fold board description exactly. Strong candidate for HeartStrings Play Components/Editions pages.',
  canonicalDestination: 'public/heartstrings/heartstrings-play-board-spec-diagram.webp',
  fullResolutionReviewRequired: true,
  staleTextResult: 'no defects found',
  canonicalNamingResult: 'no baked-in naming defect found',
});
apply(D + 'ChatGPT Image Jul 23, 2026, 10_29_45 AM (4).png', {
  subject: '"HeartStrings Play - 18 Figural Token Tops" render: grid of small gold decorative token-top icons (crown, shoe, ring, dice, book, flame, feather, bow, etc.).',
  publicationDecision: 'selected',
  selectionNote: 'Directly relevant player-token component reference, correctly branded. Selected for HeartStrings Play Components page.',
  canonicalDestination: 'public/heartstrings/heartstrings-play-figural-token-tops.webp',
  fullResolutionReviewRequired: true,
  staleTextResult: 'no defects found',
  canonicalNamingResult: 'no baked-in naming defect found',
});
apply(D + 'ChatGPT Image Jul 23, 2026, 10_29_45 AM (6).png', {
  subject: '"Play A/B Player Chips" render: 18 pairs of colored snap-fit chips numbered 1-18, each pair labeled A/B, tagline "Flip. Choose. Connect." - "18 PLAYERS. 2 SIDES. ENDLESS CONNECTIONS."',
  publicationDecision: 'selected',
  selectionNote: 'Authoritative, correctly-specified (matches the confirmed 2-18 player range) product component render. Strong candidate for HeartStrings Play Components page.',
  canonicalDestination: 'public/heartstrings/heartstrings-play-ab-player-chips.webp',
  fullResolutionReviewRequired: true,
  staleTextResult: 'no defects found',
  canonicalNamingResult: 'no baked-in naming defect found',
});
apply(D + 'ChatGPT Image Jul 23, 2026, 10_29_47 AM (9).png', {
  subject: 'Multi-panel marketing composite: Rulebook cover ("2 PLAYERS", 18+, 30-90 MIN), Mischief Handbook cover, Consent Level Gauge reference card, Sample Sheet, "HeartStrings Play Ecosystem" diagram, and a HeartStrings Connect promo panel ("20% OFF your first month", code "HSPLAY20", "Expires 12/31/2025").',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Multiple baked-in stale/incorrect claims: (1) promo code panel is already expired (12/31/2025, before the current site date) and cannot be corrected without the source file; (2) "20% OFF" flat-discount framing directly conflicts with the site\'s established 10%-price-plus-10%-entitlement preorder structure, which explicitly must not be presented as a flat 20% off; (3) Rulebook cover states "2 PLAYERS" which conflicts with the confirmed 2-18 player range used everywhere else on the site.',
  fullResolutionReviewRequired: true,
  staleTextResult: 'expired promo code, incorrect flat-discount framing, incorrect player count',
  canonicalNamingResult: 'no character-naming defect, but see rejectionReason for other baked-in claim defects',
});
apply(D + 'ChatGPT Image Jul 23, 2026, 11_08_43 AM.png', { subject: 'Alternate ByteLite logo concept: green/blue leaf-infinity mark with a terminal cursor ">_" icon, "BYTELITE" wordmark.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Brand decision beyond this pass\'s scope - not swapped in for the current site logo without explicit direction, consistent with the disposition of other alternate-logo candidates.', staleTextResult: 'no defects found', canonicalNamingResult: 'correctly capitalized "BYTELITE" (stylized logotype, all-caps is an acceptable logo treatment)' });
apply(D + 'ChatGPT Image Jul 23, 2026, 11_22_41 AM.png', { subject: 'Alternate ByteLite logo concept: orange/purple leaf-infinity mark with a robot/speaker icon element.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the other alternate-logo concept - brand decision beyond this pass\'s scope.', staleTextResult: 'no defects found', canonicalNamingResult: 'no baked-in naming defect found' });

const consentCups = [
  ['ChatGPT Image Jul 23, 2026, 12_01_50 PM (1).png', 'Affirm', 'heartstrings-play-consent-cup-affirm.webp'],
  ['ChatGPT Image Jul 23, 2026, 12_01_50 PM (10).png', 'Chosen', 'heartstrings-play-consent-cup-chosen.webp'],
  ['ChatGPT Image Jul 23, 2026, 12_01_50 PM (2).png', 'Yes', 'heartstrings-play-consent-cup-yes.webp'],
];
for (const [fname, label, dest] of consentCups) {
  apply(D + fname, {
    subject: `HeartStrings Play Consent Cup product render: black cylindrical cup with clear dome lid, pink consent sphere labeled "${label}" visible inside, "18 CONSENT SPHERES" text, correct branding.`,
    publicationDecision: 'selected',
    selectionNote: `Authoritative, correctly-specified Consent Cup product render (matches "holds up to 18 consent spheres" spec exactly), showing the "${label}" sphere-label variant. Selected as part of a small gallery for the Consent Architecture page showing different consent-sphere labels.`,
    canonicalDestination: `public/heartstrings/${dest}`,
    fullResolutionReviewRequired: true,
    staleTextResult: 'no defects found',
    canonicalNamingResult: 'no baked-in naming defect found',
  });
}

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 10.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
