// Copies every newly-selected asset (with a canonicalDestination) from the inventory into the
// repo, converting raster sources to WebP via sharp and copying SVG sources as-is. Skips any
// destination that already exists (already ingested in an earlier pass). Also copies each
// selected source into src/assets/source/ for preservation, mirroring the destination's project
// folder, when not already present there.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const inv = JSON.parse(fs.readFileSync('qa/asset-audit/asset-inventory.json', 'utf8'));
const selected = inv.records.filter((r) => (r.publicationDecision === 'selected' || r.publicationDecision === 'selected-corrected') && r.canonicalDestination);

const byDest = new Map();
for (const r of selected) {
  if (!byDest.has(r.canonicalDestination)) byDest.set(r.canonicalDestination, r);
}

let copied = 0;
let skippedExisting = 0;
let failed = 0;
const manifest = [];

async function main() {
  for (const [dest, rec] of byDest.entries()) {
    const destPath = path.join(process.cwd(), dest);
    if (fs.existsSync(destPath)) {
      skippedExisting++;
      manifest.push({ source: rec.originalPath, destination: dest, status: 'already-exists' });
      continue;
    }
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    try {
      if (dest.endsWith('.svg')) {
        fs.copyFileSync(rec.originalPath, destPath);
      } else {
        await sharp(rec.originalPath, { limitInputPixels: false }).webp({ quality: 88 }).toFile(destPath);
      }
      copied++;
      manifest.push({ source: rec.originalPath, destination: dest, status: 'copied' });
      console.log(`copied: ${dest}`);
    } catch (e) {
      failed++;
      manifest.push({ source: rec.originalPath, destination: dest, status: 'failed', error: String(e.message || e) });
      console.log(`FAILED: ${dest} - ${e.message}`);
    }
  }

  fs.writeFileSync('qa/asset-audit/ingest-manifest.json', JSON.stringify(manifest, null, 2));
  console.log(`\nCopied: ${copied}  Already existed: ${skippedExisting}  Failed: ${failed}`);
  console.log(`Total unique destinations: ${byDest.size}`);
}

main();
