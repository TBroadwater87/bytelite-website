# Asset Manifest — ByteLite LLC Technology Rebuild (2026-07-26)

Non-destructive asset pass: originals in `D:\Download` were **copied and transformed**, never
moved or deleted. Only project-facing folders were inspected (`01_HeartStrings_Boardgame`,
`02_HeartStrings_App_and_Wingman`, `03_HeartStrings_Branding`, `04_AIya_AIon_Characters`,
`05_Kickstarter`, `06_Website_and_Marketing`, `ByteLite`, `Deep Kore Documents`, `Final_ByteLite`,
`Assets`, `Logo Generations`). Personal/legal/admin/archive folders (`_Personal_Private`,
`07_Business_Legal_Admin`, `12_REVIEW_REQUIRED`, recovery/redacted folders, etc.) were not opened.

## Imported

| Source | Destination | Transform | Used on |
|---|---|---|---|
| `D:\Download\ByteLite\Branding\Logos\ByteLite_Logo_alt.png` (1536x1024, 462KB) | `public/technologies/bytelite-technology-mark.webp` | resized to 640w, WebP q88 (18KB) | `/technologies/bytelite` |
| `D:\Download\ByteLite\Branding\Logos\ByteSight_Logo.png` (1254x1254, 1541KB) | `public/technologies/bytesight-technology-mark.webp` | resized to 640w, WebP q88 (68KB) | `/technologies/bytesight` |
| `D:\Download\ByteLite\Branding\Logos\ByteFlow_Logo.png` (1254x1254, 1686KB) | `public/technologies/byteflow-technology-mark.webp` | resized to 640w, WebP q88 (53KB) | `/technologies/byteflow` |
| `D:\Download\ByteLite\Branding\Logos\ByteCost_Logo.png` (1254x1254, 1680KB) | `public/technologies/bytecost-technology-mark.webp` | resized to 640w, WebP q88 (26KB) | `/technologies/bytecost` |

Additionally wired in an **already-present repo asset** (no new import needed):
`public/heartstrings/heartstrings-aion-icon.png` onto `/products/heartstrings-connect/aiya-and-aion`
(previously that page had no Aion image at all).

## Rejected (with reason)

| Source | Category | Reason |
|---|---|---|
| `ByteLite\Branding\Diagrams\ByteLite_Cascade_Closure_Visual_Aid.png` | legal-or-do-not-publish | Discloses internal mechanism vocabulary (cascade frontier stages, DIRECT_PRIMITIVE / COMPOSITE_CONSTRUCTED / REDUNDANT_ALIAS / OPEN_GAP classification, closure-condition logic) that the site's own Architecture page explicitly commits not to disclose publicly. |
| `ByteLite\Branding\Diagrams\ByteLite_Stretch_Goals.png` | legal-or-do-not-publish | Displays specific unconfirmed campaign funding tiers ($100k/$150k/$250k) with no corresponding live crowdfunding campaign or confirmed commitment on the current site. Would fabricate a claim. |
| `ByteLite\Branding\Logos\NanoViva_Logo.png` | unused | Not part of the ByteLite LLC canonical taxonomy (Section 4); no description found tying it to a current project. |
| `ByteLite\Branding\Logos\ByteLite_Tash_voice_avatar.png` | unused | Personal/experimental-looking asset (named "voice avatar"); no confirmed public-facing purpose. |
| `01_HeartStrings_Boardgame\Cards_Decks\*`, `Mockups\*`, `Final_Candidates\HeartStrings_BG_20x20.png` (153MB) | unused (this pass) | Card-art and mockup source material; the site already has finished, photographed production assets (`public/heartstrings/box-front.jpg`, `board-20x20.jpg`, etc.) that supersede these design-stage files. Not reviewed further in this pass — flagged for a future dedicated card-art pass if the tier-deck imagery ever needs a refresh. |
| `02_HeartStrings_App_and_Wingman\App_UI_Screens\*` (AIya/AIon concept screens) | unused (this pass) | Concept/marketing renders, not actual product screenshots; the site already uses real private-test-build screenshots (`public/heartstrings/screenshots/*`) which are more accurate "current UI" evidence. |
| `Deep Kore Documents`, `Final_ByteLite`, `Logo Generations` | unused | No image files found in these folders during this pass (documents/empty at time of scan). |

No file in this pass referenced or copied anything from `D:\Download\07_Business_Legal_Admin`,
`_Personal_Private`, `12_REVIEW_REQUIRED`, `08_Source_Documents_and_Blueprints`,
`09_Reference_and_Inspiration`, `10_Exports_and_Print_Ready`, `11_Archive_Superseded`,
`99_PROJECT_AUDITS`, `ByteLite_Grant_Kit*`, `notepad_recovered_readable_redacted`, `Quick Share`,
`TacoDelSol_Branding`, `ventoy*`, `_Misc_Scratch`, or `New folder` — those were out of scope per
owner direction.
