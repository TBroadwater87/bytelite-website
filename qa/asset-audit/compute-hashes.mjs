// Computes a real SHA-256 for every discovered file in the asset inventory and groups
// records by exact hash. Only records sharing an identical hash are true exact-byte
// duplicates - naming-pattern/style similarity is NOT sufficient (see CLAUDE.md corrective
// spec section 2/3). Writes qa/asset-audit/hash-groups.json and annotates each record in
// asset-inventory.json with fileHash + exactDuplicateGroup.
import fs from 'node:fs';
import crypto from 'node:crypto';

const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));

function hashFile(p) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(p);
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function main() {
  let missing = 0;
  let hashed = 0;
  const byHash = new Map();

  for (const r of inv.records) {
    const p = r.originalPath;
    if (!fs.existsSync(p)) {
      r.fileHash = null;
      r.fileMissing = true;
      missing++;
      continue;
    }
    try {
      const h = await hashFile(p);
      r.fileHash = h;
      r.fileMissing = false;
      hashed++;
      if (!byHash.has(h)) byHash.set(h, []);
      byHash.get(h).push(r.id || r.originalPath);
    } catch (e) {
      r.fileHash = null;
      r.fileReadError = String(e.message || e);
    }
  }

  const groups = {};
  let exactDupRecords = 0;
  for (const [hash, ids] of byHash.entries()) {
    if (ids.length > 1) {
      groups[hash] = ids;
      exactDupRecords += ids.length - 1; // all but one representative
    }
  }

  for (const r of inv.records) {
    if (r.fileHash && groups[r.fileHash]) {
      r.exactDuplicateGroup = r.fileHash;
      r.exactDuplicateGroupSize = groups[r.fileHash].length;
    }
  }

  fs.writeFileSync('qa/asset-audit/hash-groups.json', JSON.stringify({ generatedAt: new Date().toISOString(), totalHashed: hashed, totalMissing: missing, exactDuplicateGroups: Object.keys(groups).length, exactDuplicateRecordsBeyondRepresentative: exactDupRecords, groups }, null, 2));
  fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));

  console.log(`Hashed: ${hashed}  Missing: ${missing}`);
  console.log(`Exact-duplicate groups (size>1): ${Object.keys(groups).length}`);
  console.log(`Records that are exact duplicates of another record: ${exactDupRecords}`);
}

main();
