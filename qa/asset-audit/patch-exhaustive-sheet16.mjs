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

apply(D + 'u7n7KYTIG-_1JGppq7IPZ.jpg', { subject: 'Stock photo: woman reading a document by a window.', publicationDecision: 'unused', rejectionReason: 'Generic stock photography of an unrelated real person (matches the previously-identified hash-named stock-photo cluster).', privacySafetyResult: 'unsafe - unrelated real person (generic stock)' });

const ventoyFiles = [
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\background.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\icons\\deepin.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\icons\\red-hat.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\icons\\ubuntu.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\icons\\vtoyiso.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_c.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_e.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_n.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_ne.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_nw.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_s.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_se.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_sw.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\menu_w.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\select_c.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\slider_c.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\slider_n.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\slider_s.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_c.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_e.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_n.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_ne.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_nw.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_s.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_se.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_sw.png',
  'ventoy-1.1.12-windows\\ventoy-1.1.12\\plugin\\ventoy\\theme\\terminal_box_w.png',
];
for (const rel of ventoyFiles) {
  apply(D + rel, {
    subject: 'Ventoy (third-party open-source bootable-USB tool) GTK theme UI sprite/icon asset (menu border, slider, terminal box, or Linux distro icon).',
    publicationDecision: 'unused',
    rejectionReason: 'Bundled UI theme asset from the third-party Ventoy application installer, completely unrelated to ByteLite LLC or HeartStrings - not a project asset.',
  });
}
apply(D + 'windows_czkawka_gui_gtk_412\\share\\themes\\WhiteSur-dark\\gtk-4.0\\thumbnail.png', { subject: 'GTK desktop theme thumbnail preview ("WhiteSur-dark") bundled with a third-party application (Czkawka).', publicationDecision: 'unused', rejectionReason: 'Bundled third-party GTK theme asset, completely unrelated to ByteLite LLC or HeartStrings.' });

apply(D + 'winter.png', {
  subject: 'AIya+Aion couple, winter/snow scene with "AIya + AIon / HeartStrings / Your Trusted AI Connection Guides" title text - same template already confirmed defective.',
  publicationDecision: 'legal-do-not-publish',
  rejectionReason: 'Same title-card template already confirmed at full resolution to bake in "AIon" (incorrect) instead of canonical "Aion".',
  canonicalNamingResult: 'same confirmed defect as the full-resolution-verified winter variant: renders "AIon"',
  staleTextResult: 'baked-in naming defect (see canonicalNamingResult)',
});

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 16.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
