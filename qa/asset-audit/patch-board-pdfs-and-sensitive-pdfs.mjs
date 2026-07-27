// Closes the last 14 mislabeled PDF records: 6 board-render PDFs individually opened and viewed
// by the main thread (2026-07-27), plus 8 genuinely sensitive personal/medical/legal/financial
// PDFs relabeled honestly (never opened, deliberately - disposition is invariant regardless of
// exact contents, and opening a medical treatment intake packet or personal SMS log for a named
// family member would be a real, unnecessary privacy intrusion with zero possible upside).
import fs from 'node:fs';

const INV_PATH = 'qa/asset-audit/asset-inventory.json';
const inv = JSON.parse(fs.readFileSync(INV_PATH, 'utf8'));

const BOARD_FINDINGS = {
  'HeartStrings_Play_20x20_Final_No_Background.pdf': 'Transparent-background HeartStrings Play board render: full tier path with die-icon spaces, "Decree" card, six tier cards (Initiate/Connect/Seduce/Stimulate/Edge/Climax), host character photo top-left, female character photo bottom-right. Correct branding, no defects.',
  '20x20_Board.pdf': 'Line-art/outline-only board illustration (embracing couple silhouette in gold linework), no color fill, no card/component overlay - a design-stage asset, not the finished board.',
  'Board_20_x_40.pdf': 'Full-color red-background board render, same couple-silhouette artwork as 20x20_Board.pdf but finished with color, tier path, Decree card, and character photos - tri-fold 20x40 layout variant.',
  'Board_20x40_Final.pdf': 'HeartStrings PLAY title card, full tier path with die-icon spaces, "Decree" card (infinity-heart mark), six tier cards (Initiate/Connect/Seduce/Stimulate/Edge/Climax), host character photo top-left, female character photo bottom-right holding cards. Matches the established product design exactly, no defects. High-resolution 20x40 tri-fold final.',
  'Board_20x40_Final_No_Background.pdf': 'Same content as Board_20x40_Final.pdf, transparent-background variant.',
  'HeartStrings_Play_20x20_Final.pdf': 'Same finished board design (HeartStrings PLAY title, tier path, Decree card, six tier cards, host + female character photos) as Board_20x40_Final.pdf, 20x20 single-panel layout.',
};

let boardPatched = 0;
for (const rec of inv.records) {
  if (BOARD_FINDINGS[rec.originalFilename]) {
    Object.assign(rec, {
      visuallyInspected: true,
      dispositionType: 'visually-inspected-pdf',
      inspectionMethod: 'Individually opened and viewed in full resolution (main-thread completion pass, 2026-07-27).',
      subject: BOARD_FINDINGS[rec.originalFilename],
      publicationDecision: 'already-in-repo',
      selectionNote: 'Content family already represented on the live site via previously-selected board render images (board-20x20.jpg / board-ultimate.jpg); this PDF source confirms those renders accurately, no swap needed.',
      rejectionReason: null,
      privacySafetyResult: 'safe',
      staleTextResult: 'no defects found',
      canonicalNamingResult: 'no baked-in naming defect found',
      fullResolutionReviewRequired: false,
    });
    boardPatched++;
  }
}

const SENSITIVE_PDFS = ['Insurance.pdf', 'Sarah_Insurance.pdf', 'Jimmy_Appeal_1of2.pdf', 'Jimmy_Appeal_2of2.pdf', 'TWR_Appeal_Request_Form.pdf', 'Helena_Fentanyl_to_Injection_Treatment_Intake_Packet.pdf', 'SMS_Conversation_2025-06-07.pdf', 'Text_Messages.pdf'];

let sensitivePatched = 0;
for (const rec of inv.records) {
  if (SENSITIVE_PDFS.includes(rec.originalFilename)) {
    rec.dispositionType = 'unsupported-nonvisual-file';
    rec.inspectionMethod = (rec.inspectionMethod || '') + ' | Relabeled 2026-07-27: dispositionType corrected from a mistaken "individually-visually-inspected" claim. Deliberately never opened - these are personal medical/legal/financial/communication records (insurance appeals, a substance-use treatment intake packet, personal text-message logs) for named individuals. The disposition (legal-do-not-publish, permanently) is invariant regardless of exact contents, so opening them would be a real, unnecessary privacy intrusion with no possible change in outcome. Grounded by unambiguous folder/filename context (_Personal_Private/Insurance, /Legal, /Medical, /Messages), which is itself sufficient and dispositive evidence here.';
    sensitivePatched++;
  }
}

const totalInspected = inv.records.filter((r) => r.visuallyInspected).length;
const counts = {};
for (const r of inv.records) { const d = r.publicationDecision || 'unknown'; counts[d] = (counts[d] || 0) + 1; }
const dispCounts = {};
for (const r of inv.records) { const d = r.dispositionType || 'MISSING'; dispCounts[d] = (dispCounts[d] || 0) + 1; }

inv.summary.totalVisuallyInspected = totalInspected;
inv.summary.byDecision = counts;
inv.summary.byDispositionType = dispCounts;

fs.writeFileSync(INV_PATH, JSON.stringify(inv, null, 2));
console.log('board PDFs patched:', boardPatched, '| sensitive PDFs relabeled:', sensitivePatched);
console.log('dispositionType breakdown:', JSON.stringify(dispCounts));
console.log('sum:', Object.values(dispCounts).reduce((a,b)=>a+b,0), '/', inv.records.length);
