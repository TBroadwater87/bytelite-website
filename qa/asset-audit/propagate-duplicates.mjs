// Propagates a grounded disposition from one individually-inspected representative to every
// other record sharing its exact SHA-256 hash. Run after compute-hashes.mjs and after any
// batch of new individual inspections, so exact duplicates never need separate inspection
// (section 2's explicit exception) while everything else stays inference-free.
import fs from 'node:fs';

const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));

const byHash = new Map();
for (const r of inv.records) {
  if (!r.fileHash) continue;
  if (!byHash.has(r.fileHash)) byHash.set(r.fileHash, []);
  byHash.get(r.fileHash).push(r);
}

let propagated = 0;
for (const [hash, group] of byHash.entries()) {
  if (group.length < 2) continue;
  const rep = group.find((r) => r.visuallyInspected === true && r.dispositionType !== 'exact-byte-duplicate-of-visually-inspected-file');
  if (!rep) continue;
  for (const r of group) {
    if (r === rep) { if (!r.dispositionType) r.dispositionType = 'individually-visually-inspected'; continue; }
    if (r.dispositionType === 'exact-byte-duplicate-of-visually-inspected-file' && r.exactDuplicateOf === rep.originalPath) continue;
    r.visuallyInspected = true;
    r.dispositionType = 'exact-byte-duplicate-of-visually-inspected-file';
    r.exactDuplicateOf = rep.originalPath;
    r.inspectionMethod = 'exact-byte-hash-match';
    r.subject = rep.subject;
    r.publicationDecision = rep.publicationDecision;
    r.rejectionReason = rep.rejectionReason ? `${rep.rejectionReason} (exact-byte duplicate of ${rep.originalFilename}, hash ${hash.slice(0, 12)}...)` : null;
    r.selectionNote = rep.selectionNote ? `${rep.selectionNote} (exact-byte duplicate of ${rep.originalFilename})` : null;
    r.privacySafetyResult = rep.privacySafetyResult;
    r.staleTextResult = rep.staleTextResult;
    r.canonicalNamingResult = rep.canonicalNamingResult;
    r.suggestedPages = rep.suggestedPages;
    r.suggestedVisualRole = rep.suggestedVisualRole;
    r.qualityAssessment = rep.qualityAssessment;
    r.mobileCropSuitability = rep.mobileCropSuitability;
    r.desktopSuitability = rep.desktopSuitability;
    r.fullResolutionReviewRequired = false;
    propagated++;
  }
}

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));

const stillUninspected = inv.records.filter((r) => !r.visuallyInspected);
console.log(`Propagated to ${propagated} exact-duplicate records this run.`);
console.log(`Remaining not-yet-inspected records: ${stillUninspected.length}`);
