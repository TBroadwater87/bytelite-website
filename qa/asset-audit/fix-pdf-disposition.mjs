import fs from 'node:fs';
const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));
const openedPdfs = [
  'D:\\Download\\01_HeartStrings_Boardgame\\Print_Specs\\HeartStrings_Box_Dieline_530x280x75mm.pdf',
  'D:\\Download\\HeartStrings_Play_Manufacturing_RFQ_Specs.pdf',
  'D:\\Download\\04_AIya_AIon_Characters\\AIYA_Docs\\AIYA_White_Paper_Deterministic_Intelligence.pdf',
  'D:\\Download\\ByteLite\\Pitch_Decks\\ByteLite_Investor_Deck_Deterministic_Structure.pdf',
  'D:\\Download\\01_HeartStrings_Boardgame\\Board_Design\\HeartStrings_Board_40x20_Silhouette.pdf',
  'D:\\Download\\ByteLite_Grant_Kit_v3_Complete\\02_ByteLite_Grant_Kit_v3_Company_Facts_Narratives_and_Guardrails.pdf',
];
let fixed = 0;
for (const p of openedPdfs) {
  const r = inv.records.find((x) => x.originalPath === p);
  if (r) { r.dispositionType = 'visually-inspected-pdf'; fixed++; } else { console.log('missing', p); }
}
fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log('fixed', fixed);
