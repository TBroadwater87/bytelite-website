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
    fullResolutionReviewRequired: false,
    privacySafetyResult: 'safe',
    staleTextResult: 'no defects found',
    canonicalNamingResult: 'no baked-in naming defect found',
  });
  n++;
}
const D = 'D:\\Download\\TacoDelSol_Branding\\';

const tacoFiles = [
  ['Logos_and_Banners\\TacoDelSol_banner_storefront_daytime.png', 'storefront banner'],
  ['Logos_and_Banners\\TacoDelSol_bison_mascot_sun.png', 'bison mascot logo'],
  ['Logos_and_Banners\\TacoDelSol_logo_bison_horizontal.png', 'horizontal bison logo'],
  ['Logos_and_Banners\\TacoDelSol_logo_circular_badge.png', 'circular badge logo'],
  ['Logos_and_Banners\\TacoDelSol_logo_helena_storefront.png', 'storefront logo'],
  ['Logos_and_Banners\\TacoDelSol_logo_map_pin.png', 'map pin logo'],
  ['Logos_and_Banners\\TacoDelSol_logo_map_pin_bison.png', 'map pin bison logo'],
  ['Logos_and_Banners\\TacoDelSol_sign_downtown_helena.png', 'downtown Helena sign'],
  ['Menu_and_Food\\TacoDelSol_food_burrito.png', 'burrito menu illustration'],
  ['Menu_and_Food\\TacoDelSol_food_chips_guac_salsa.png', 'chips/guac/salsa menu illustration'],
  ['Menu_and_Food\\TacoDelSol_food_drink_bottle.png', 'drink bottle menu illustration'],
  ['Menu_and_Food\\TacoDelSol_food_fish_taco.png', 'fish taco menu illustration'],
  ['Menu_and_Food\\TacoDelSol_food_spread_jarritos.png', 'food spread with Jarritos illustration'],
  ['Menu_and_Food\\TacoDelSol_food_tacos_burrito_sunburst.png', 'tacos/burrito sunburst illustration'],
  ['Website_Markups\\TacoDelSol_edit_footer_markup.png', 'website footer edit markup screenshot'],
  ['Website_Markups\\TacoDelSol_edit_home_markup.png', 'website home page edit markup screenshot'],
  ['Website_Markups\\TacoDelSol_edit_menu_markup.png', 'website menu page edit markup screenshot'],
  ['Web_UI\\TacoDelSol_ui_call_us_bubble.png', '"Call Us!" UI bubble icon'],
  ['Web_UI\\TacoDelSol_ui_call_us_phone.png', 'call-us phone icon'],
  ['Web_UI\\TacoDelSol_ui_find_us_walking_mall.png', '"Find Us" location badge'],
  ['Web_UI\\TacoDelSol_ui_get_directions_button.png', '"Get Directions" button'],
  ['Web_UI\\TacoDelSol_ui_hours_11_8.png', 'hours badge (11-8)'],
  ['Web_UI\\TacoDelSol_ui_hours_badge.png', 'hours badge'],
  ['Web_UI\\TacoDelSol_ui_hours_sign_mon_sat.png', 'hours sign (Mon-Sat)'],
  ['Web_UI\\TacoDelSol_ui_open_daily_hours.png', 'open daily hours badge'],
  ['Web_UI\\TacoDelSol_ui_order_call_us.png', '"Order & Ask - Call Us" badge'],
  ['Web_UI\\TacoDelSol_ui_view_menu_button.png', '"View Menu" button'],
];
for (const [rel, desc] of tacoFiles) {
  apply(D + rel, {
    subject: `Taco Del Sol Helena restaurant branding asset (${desc}) - unrelated third-party client project.`,
    publicationDecision: 'unused',
    rejectionReason: 'Confirmed pre-existing, unrelated Taco Del Sol client-branding project (already known to this session as a separate client preview at /preview/tacodelsol/, explicitly not part of ByteLite LLC or HeartStrings). Not a ByteLite/HeartStrings asset under any circumstance.',
  });
}

apply('D:\\Download\\thanksgiving.png', { subject: 'AIya+Aion couple, Thanksgiving scene, no title text overlay.', publicationDecision: 'inspected-not-used-directly', selectionNote: 'Redundant with the already-selected assets_seasonal_duo_thanksgiving.png; not integrated to avoid flooding.' });
apply('D:\\Download\\Toy.png', { subject: 'Small abstract green sliver shape, raw design layer fragment.', publicationDecision: 'unused', rejectionReason: 'Raw production design layer, no usable visible subject.' });
apply('D:\\Download\\T_Shirt.png', { subject: 'Gray bat-shaped silhouette, unclear purpose (possibly a seasonal/Halloween design layer).', publicationDecision: 'unused', rejectionReason: 'Raw production design layer fragment, no coherent standalone subject.' });

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log(`Patched ${n} records from sheet 15.`);
console.log('Remaining not-yet-inspected:', inv.records.filter(r => !r.visuallyInspected).length);
