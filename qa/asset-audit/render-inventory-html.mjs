// Renders qa/asset-audit/asset-inventory.html from the current asset-inventory.json.
// Standalone from generate-inventory.mjs so re-rendering after a patch never re-runs discovery.
import fs from 'node:fs';

const inv = JSON.parse(fs.readFileSync('qa/asset-audit/asset-inventory.json', 'utf8'));

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const decisionColor = {
  selected: '#4ade80', 'selected-corrected': '#4ade80', 'already-in-repo': '#818cf8',
  'inspected-not-used-directly': '#a78bfa', 'inspected-not-newly-used': '#a78bfa',
  unused: '#555e7a', duplicate: '#fbbf24', rejected: '#f87171', 'legal-do-not-publish': '#f87171',
};

const rows = inv.records
  .slice()
  .sort((a, b) => (a.publicationDecision || '').localeCompare(b.publicationDecision || ''))
  .map((r) => `
    <tr>
      <td class="mono">${esc(r.originalFilename)}</td>
      <td>${esc(r.sourceRoot)}</td>
      <td>${r.visuallyInspected ? '<span class="yes">yes</span>' : '<span class="no">no</span>'}</td>
      <td><span class="badge" style="color:${decisionColor[r.publicationDecision] || '#a0a8c0'};border-color:${decisionColor[r.publicationDecision] || '#2a3352'}">${esc(r.publicationDecision)}</span></td>
      <td>${esc(r.subject || '')}</td>
      <td>${esc(r.selectionNote || r.rejectionReason || '')}</td>
      <td class="mono">${esc(r.canonicalDestination || '')}</td>
    </tr>`)
  .join('');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>ByteLite LLC Asset Inventory (QA, local only)</title>
<meta name="robots" content="noindex, nofollow" />
<style>
body { font-family: -apple-system, Segoe UI, sans-serif; margin: 0; background: #0d1120; color: #e4e7f2; }
header { padding: 1.5rem; border-bottom: 1px solid #1a2235; }
header p { color: #7b829e; font-size: .875rem; }
.summary { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; font-size: .8125rem; color: #a5b4fc; margin-top: .75rem; }
main { padding: 1.5rem; overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: .8125rem; }
th, td { border-bottom: 1px solid #1a2235; padding: .5rem .75rem; text-align: left; vertical-align: top; }
th { position: sticky; top: 0; background: #0d1120; color: #7b829e; font-size: .6875rem; text-transform: uppercase; letter-spacing: .05em; }
.mono { font-family: monospace; font-size: .75rem; color: #7b829e; }
.badge { border: 1px solid; border-radius: .25rem; padding: .125rem .4375rem; font-size: .6875rem; white-space: nowrap; }
.yes { color: #4ade80; } .no { color: #555e7a; }
</style></head><body>
<header>
  <h1>ByteLite LLC Asset Inventory</h1>
  <p>Local QA record only. Generated from qa/asset-audit/asset-inventory.json.</p>
  <div class="summary">
    <span><b>${inv.summary.totalDiscovered}</b> discovered</span>
    <span><b>${inv.summary.totalVisuallyInspected}</b> visually inspected</span>
    <span><b>${inv.records.filter((r) => (r.publicationDecision || '').startsWith('selected')).length}</b> selected</span>
    <span><b>${inv.records.filter((r) => r.publicationDecision === 'legal-do-not-publish').length}</b> legal-do-not-publish</span>
    <span><b>${inv.records.filter((r) => r.publicationDecision === 'duplicate').length}</b> duplicate</span>
    <span><b>${inv.records.filter((r) => r.publicationDecision === 'unused').length}</b> unused</span>
  </div>
  ${inv.summary.correctivePassNote ? `<p style="margin-top:1rem;color:#a5b4fc;">${esc(inv.summary.correctivePassNote)}</p>` : ''}
</header>
<main>
<table>
  <thead><tr><th>File</th><th>Source</th><th>Inspected</th><th>Decision</th><th>Subject</th><th>Note / Reason</th><th>Repo destination</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
</main>
</body></html>`;

fs.writeFileSync('qa/asset-audit/asset-inventory.html', html);
console.log('Rendered asset-inventory.html:', inv.records.length, 'rows');
