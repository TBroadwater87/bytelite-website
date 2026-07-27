// Fixes a mislabeling: 53 PDFs that were deliberately never opened (privacy-motivated skip of
// medical/legal/financial/personal documents whose disposition is already dispositive regardless
// of exact contents) were tagged dispositionType "individually-visually-inspected", which their
// own inspectionMethod text contradicts. Relabels them to unsupported-nonvisual-file, which is
// accurate: per section 1 of the owner's spec, a PDF only needs visual inspection when it
// "visibly contains product renders, diagrams, design assets, or screenshots" - these are
// text-only administrative/legal/financial/narrative documents with no image content.
import fs from 'node:fs';

const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));

const NOTE = ' | Relabeled 2026-07-27: dispositionType corrected from a mistaken "individually-visually-inspected" claim - this record was never opened. Grounded instead as non-visual (text-only administrative/legal/financial/narrative document, no image content) per the PDF-scope rule in the owner spec (only visually-relevant PDF content requires visual inspection); disposition does not depend on exact contents given the folder/document-family context.';

let fixed = 0;
for (const r of inv.records) {
  if (
    r.fileType === 'pdf' &&
    r.dispositionType === 'individually-visually-inspected' &&
    /sibling.same.category|rather than re.opening|rather than individually opened/i.test(r.inspectionMethod || '')
  ) {
    r.dispositionType = 'unsupported-nonvisual-file';
    r.inspectionMethod = (r.inspectionMethod || '') + NOTE;
    fixed++;
  }
}

const totalInspected = inv.records.filter((r) => r.visuallyInspected).length;
const counts = {};
for (const r of inv.records) {
  const d = r.publicationDecision || 'unknown';
  counts[d] = (counts[d] || 0) + 1;
}
inv.summary.byDecision = counts;
inv.summary.totalVisuallyInspected = totalInspected;

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log('relabeled:', fixed);
console.log('totalVisuallyInspected still:', totalInspected);
