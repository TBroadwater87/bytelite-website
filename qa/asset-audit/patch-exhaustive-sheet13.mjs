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

const goSpaces = [
  'ChatGPT Image Jun 28, 2026, 09_45_19 PM (2).png', 'ChatGPT Image Jun 28, 2026, 09_45_21 PM (4).png',
  'ChatGPT Image Jun 28, 2026, 09_45_21 PM (5).png', 'ChatGPT Image Jun 28, 2026, 09_45_21 PM (6).png',
  'ChatGPT Image Jun 28, 2026, 09_45_21 PM (7).png', 'ChatGPT Image Jun 28, 2026, 09_45_22 PM (9).png',
  'ChatGPT Image Jun 28, 2026, 09_45_24 PM (10).png', 'ChatGPT Image Jun 28, 2026, 09_45_22 PM (8).png',
];
for (const fname of goSpaces) {
  apply(D + fname, {
    subject: 'HeartStrings Play "GO" board-space icon: red gem badge with silver heart, "GO" text - matches the GO space seen in the selected board renders.',
    publicationDecision: 'inspected-not-used-directly',
    selectionNote: 'One of several near-identical GO-icon variants; already visible as part of the selected complete board renders, a standalone icon crop is redundant.',
  });
}
apply(D + 'ChatGPT Image Jun 28, 2026, 09_45_19 PM (2)_placeholder', {});

apply(D + 'ChatGPT Image Jun 28, 2026, 11_05_13 PM.png', { subject: 'Grid of small intimate-apparel/accessory prop icons (masks, heels, corset, lipstick, wine bottle) on pedestal displays.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the earlier prop-pedestal render sets - safe stylized objects, not integrated this pass.' });
apply(D + 'ChatGPT Image Jun 28, 2026, 11_07_26 PM.png', { subject: 'Larger grid of the same prop/accessory icon set (masks, heels, lipstick, collar, etc.), more items.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same disposition as the prop-pedestal render sets.' });

const internalDiagrams = [
  ['ChatGPT Image Jun 29, 2026, 06_56_02 PM (1).png', 'token/player-chip mechanism overview'],
  ['ChatGPT Image Jun 29, 2026, 06_56_02 PM (2).png', 'internal sphere mechanism cutaway'],
  ['ChatGPT Image Jun 29, 2026, 06_56_03 PM (3).png', '"Shared Internal Sphere Mechanism" labeled diagram'],
  ['ChatGPT Image Jun 29, 2026, 06_56_03 PM (5).png', 'token component labeled reference sheet'],
  ['ChatGPT Image Jun 29, 2026, 06_56_03 PM (6).png', '"Token Mechanics - Unified Internal System" diagram'],
  ['ChatGPT Image Jun 29, 2026, 06_56_04 PM (10).png', '"18 Designs, One Secret" token variant reference'],
  ['ChatGPT Image Jun 29, 2026, 06_56_04 PM (8).png', '"Universal Token Architecture" cutaway diagram'],
  ['ChatGPT Image Jun 29, 2026, 06_56_04 PM (9).png', '"Assembly and Use" manufacturing/assembly diagram'],
];
for (const [fname, desc] of internalDiagrams) {
  apply(D + fname, {
    subject: `Internal engineering/manufacturing reference diagram: ${desc} - shows prop-token internal mechanism and assembly details.`,
    publicationDecision: 'inspected-not-used-directly',
    selectionNote: 'Internal design/manufacturing reference material, not confirmed appropriate for public marketing pages without business review - these are production/assembly references rather than finished marketing graphics. Not integrated this pass.',
    fullResolutionReviewRequired: true,
  });
}

apply(D + 'ChatGPT Image Jun 30, 2026, 09_50_00 PM (2).png', { subject: 'HeartStrings Play tier-progress tracker chart: numbered columns 1-18, rows for each of the six tiers (Initiate/Connect/Seduce/Stimulate/Edge/Climax).', publicationDecision: 'selected', selectionNote: 'Correctly-specified, useful gameplay-tracking reference matching the canonical tier system. Candidate for the How It Plays page.', canonicalDestination: 'public/heartstrings/heartstrings-play-tier-tracker-chart.webp', fullResolutionReviewRequired: true });
apply(D + 'ChatGPT Image Jun 30, 2026, 09_50_01 PM (5).png', { subject: 'Same tier-progress tracker concept, dark-theme color variant.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same content as the selected light-theme tracker chart; not needed as a duplicate.' });
apply(D + 'ChatGPT Image Jun 30, 2026, 09_50_02 PM (9).png', { subject: 'Same tier-progress tracker concept, light-theme variant.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same content as the selected tracker chart; not needed as a duplicate.' });

apply(D + 'Collision\\collision_map.png', { subject: 'Abstract glitch/noise technical image, unclear purpose.', publicationDecision: 'unused', rejectionReason: 'Technical dev artifact with no coherent visible subject.' });
apply(D + 'Dad_Skin.png', { subject: 'Abstract brown/tan shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply(D + 'e47cf1fe-dfe9-424a-b854-637c719f803a.png', { subject: '"Stack the 1%." pink/purple gradient growth-chart graphic with unverified multiplier figures (37.8x etc.).', publicationDecision: 'unused', rejectionReason: 'Generic motivational-business graphic with unverified/unsourced statistical claims, no specific ByteLite/HeartStrings project tie-in - same category as the earlier-rejected "1% better every day" graphic.' });
apply(D + 'easter.png', { subject: 'AIya+Aion couple, Easter/bunny scene, no character-name title text overlay.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Same theme as the already-selected assets_seasonal_duo_easter.png; redundant, not integrated to avoid flooding.' });

const stockPeople2 = [
  ['d20XYQx3q1YpTCbxWxIQg.jpg', 'Stock photo: two people in a modern office lounge on laptops.'],
  ['DCGtYaA0S9AikT3lvYlaB.jpg', 'Stock photo: two women working together at a computer.'],
  ['dgdqBLp29QCzbo-SU1Q3s.jpg', 'Stock photo: woman working at a laptop wearing pearls.'],
  ['DRkuByj-itTg3E1G6MYHG.jpg', 'Stock photo: diverse group of coworkers standing together in an office.'],
  ['eCg-BNpl5wD87uCRmw6Q2-4016x6016 (1).jpg', 'Stock photo: woman working at a laptop.'],
];
for (const [fname, subject] of stockPeople2) {
  apply(D + fname, {
    subject,
    publicationDecision: 'unused',
    rejectionReason: 'Generic stock photography of unrelated real people (matches the previously-identified hash-named stock-photo cluster) - not ByteLite/HeartStrings-specific content.',
    privacySafetyResult: 'unsafe - unrelated real people (generic stock)',
  });
}

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 13.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
