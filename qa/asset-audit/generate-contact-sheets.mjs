// Builds deterministic grid contact sheets (section 4) for every remaining not-yet-inspected
// raster/vector candidate. Each cell: aspect-preserved thumbnail (letterboxed, never cropped),
// sequence number, filename, and enough relative source path to disambiguate. Writes a JSON
// manifest mapping sheet -> sequence -> exact source path -> record index.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const OUT_DIR = 'qa/asset-audit/contact-sheets';
fs.mkdirSync(OUT_DIR, { recursive: true });

const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));

const COLS = 5;
const ROWS = 6;
const PER_SHEET = COLS * ROWS;
const CELL_W = 240;
const CELL_H = 240;
const LABEL_H = 46;
const PAD = 8;
const TILE_W = CELL_W + PAD * 2;
const TILE_H = CELL_H + LABEL_H + PAD * 2;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function relDisambig(originalPath) {
  const parts = originalPath.split(/[\\/]/);
  return parts.slice(-3, -1).join('/');
}

async function makeThumb(originalPath) {
  try {
    const buf = await sharp(originalPath, { limitInputPixels: false })
      .resize(CELL_W, CELL_H, { fit: 'contain', background: { r: 20, g: 22, b: 34, alpha: 1 } })
      .png()
      .toBuffer();
    return buf;
  } catch (e) {
    return null;
  }
}

async function main() {
  const remaining = inv.records
    .map((r, idx) => ({ r, idx }))
    .filter(({ r }) => !r.visuallyInspected && ['png', 'jpg', 'svg'].includes(r.fileType));

  console.log(`Building contact sheets for ${remaining.length} remaining candidates...`);

  const manifest = { generatedAt: new Date().toISOString(), perSheet: PER_SHEET, sheets: [] };
  const failedThumbs = [];

  const sheetCount = Math.ceil(remaining.length / PER_SHEET);
  for (let s = 0; s < sheetCount; s++) {
    const items = remaining.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
    const sheetW = TILE_W * COLS;
    const sheetH = TILE_H * Math.ceil(items.length / COLS);

    const composites = [];
    const sheetEntries = [];

    for (let i = 0; i < items.length; i++) {
      const { r, idx } = items[i];
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = col * TILE_W + PAD;
      const y = row * TILE_H + PAD;
      const seq = s * PER_SHEET + i + 1;

      const thumb = await makeThumb(r.originalPath);
      if (thumb) {
        composites.push({ input: thumb, left: x, top: y });
      } else {
        failedThumbs.push({ seq, path: r.originalPath });
      }

      const label = `#${seq}  ${esc(r.originalFilename)}\n${esc(relDisambig(r.originalPath))}`;
      const labelSvg = Buffer.from(`
        <svg width="${CELL_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#0d1120"/>
          <text x="4" y="16" font-family="monospace" font-size="11" fill="#e4e7f2">#${seq} ${esc(r.originalFilename).slice(0, 34)}</text>
          <text x="4" y="32" font-family="monospace" font-size="10" fill="#7b829e">${esc(relDisambig(r.originalPath)).slice(0, 40)}</text>
        </svg>`);
      composites.push({ input: labelSvg, left: x, top: y + CELL_H });

      sheetEntries.push({ sequence: seq, originalPath: r.originalPath, originalFilename: r.originalFilename, recordIndex: idx, thumbFailed: !thumb });
    }

    const sheetPath = path.join(OUT_DIR, `sheet-${String(s + 1).padStart(3, '0')}.png`);
    await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: { r: 13, g: 17, b: 32 } } })
      .composite(composites)
      .png()
      .toFile(sheetPath);

    manifest.sheets.push({ sheetFile: sheetPath, sheetIndex: s + 1, entries: sheetEntries });
    console.log(`  wrote ${sheetPath} (${items.length} cells)`);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'failed-thumbnails.json'), JSON.stringify(failedThumbs, null, 2));

  console.log(`\nSheets generated: ${sheetCount}`);
  console.log(`Thumbnail failures (need direct open, e.g. unrenderable SVG): ${failedThumbs.length}`);
}

main();
