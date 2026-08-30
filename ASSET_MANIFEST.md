# Asset Manifest — ByteLite LLC Technology Rebuild (2026-07-26)

> Historical record: "HeartStrings" below is the legacy brand name in effect on 2026-07-26. The product line was renamed to Cordel (Cordel Play / Cordel Connect) on 2026-07-27; see `qa/cordel-migration/`. Folder and file names are preserved verbatim as they existed at the time for audit accuracy.

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

---

# Website Graphics Refresh Pass (2026-08-26)

Two packages were supplied in sequence on the same day:

1. `ByteLite_Website_Refresh_Package` - the first cut. **Superseded.**
2. `ByteLite_Website_IP_Safe_Refresh_Package` - **canonical.** Same ten filenames, redrawn
   artwork. Where a filename exists in both, the IP-safe file wins.

Ten 1672x941 PNGs. All ten confirmed present and readable in both packages, and **every image was
opened and read before any placement decision** - the verdicts below describe what each file
actually renders, not what its manifest says. That mattered: the two packages differ substantially
in content, and one asset's rung wording changed between them.

Destination convention: the repository's existing `public/<section>/<file>` layout. No parallel
asset structure was invented, and no page references the Downloads path.

## What the IP-safe redraw fixed

The first package's hero and ecosystem graphics rendered "ByteSight", "Deep Kore", "Alya"
(a misspelling of AIya), "Genesis Goalkeeper", "Revelation Vanguard", "Cordel Connect" and
"Cordel Play" as their subject. CLAUDE.md section 1 forbids naming a sibling ByteLite LLC system
on any public route, and `public-scope-vocabulary.spec.ts` lists all of them. The IP-safe redraw
removes every one: the hero is now ByteLite alone, and the ecosystem graphic became an
inward-pointing engagement map ("One Core. Multiple Ways In."). The flow diagram also stopped
depicting a false processing pipeline and became a "Public Review Framework".

That resolves the content blocker for six of the ten. It does **not** resolve the accessibility
blocker below, which is independent of artwork.

> **Superseded 2026-08-26 by the canon rebuild.** The section below records the first pass, when
> the image ban was still in force and only one graphic could be placed. The owner then approved
> images in primary content, Cordel as public scope, and the founder-voice rebuild. **Nine of the
> ten graphics are now placed** and all ten live at `public/bytelite/`. See "Final placement"
> at the end of this document; where the two disagree, the final table wins.

## Placed (first pass, superseded)

| Asset | Destination | Page and section | Alt text |
|---|---|---|---|
| `proof-before-claim-ladder.png` (IP-safe version, 1.45 MB) | `public/about/proof-before-claim-ladder.png` | `/about`, inside "The proof philosophy", after the two existing paragraphs | "Proof-before-claim progression from concept through prototype, proof artifact, validation, and product." |

The IP-safe redraw relabels rung 2 from "Mechanism built" to "System explored". The semantic list
in `about.astro` was updated to match, so the image and the HTML never state different things.

Accessibility rules applied:

- Intrinsic `width="1672" height="941"` on the tag, so the 16:9 box is reserved before the bytes
  arrive. Measured: 0px layout shift.
- `width:100%; height:auto` - responsive, aspect ratio intact, never stretched, never upscaled
  past its intrinsic width inside the 780px `.narrow` column.
- `loading="lazy" decoding="async"`. `/about` is not the LCP-critical route and the figure sits
  below two paragraphs of prose.
- **The image is not the carrier of meaning.** All five rungs are restated beneath it as a real
  `<ol>`, one label and one note per rung. Measured reason: the image renders 716px wide at a
  1280px viewport and 272px wide at 320px, where its embedded sub-labels fall to roughly 5px -
  unreadable. The list is what survives reflow, zoom and a screen reader; it collapses to a single
  legible column below 700px.
- No heading level introduced, so `/about` keeps one h1 and no skipped level.
- No CTA behaviour is baked into the image; the paragraph after it carries a real HTML link.

Claim-discipline rules applied:

- The ladder is introduced as **the standard applied to claims**, explicitly "not a progress
  report". Nothing marks a position on it.
- ByteLite's current rung stays stated in exactly one place, `/validation`, and is linked rather
  than duplicated - a second copy could drift out of step with the evidence.

## Not placed (with reason)

Nine of the ten. Two independent blockers.

**Blocker A - the image ban, and it is the one that matters now.** CLAUDE.md section 11 and
`public-scope-accessibility.spec.ts` ("Teaching diagrams are text, not images") assert that
`main img` is **empty** on `/`, `/how-it-works`, `/validation` and `/licensing` - "no diagram is
delivered as an image that would be lost to a screen reader". Every asset in both packages is a
text-bearing teaching diagram. Placing any of them on those four routes fails an existing test
that encodes a deliberate, measured accessibility decision. `/about` and `/contact` are not in
that route list, which is why the one placement above was possible.

**Blocker B - content.** Now limited to four assets.

| Asset | Intended page | Blocker | Detail |
|---|---|---|---|
| `bytelite-stack-hero.png` | `/` hero | A only | IP-safe redraw is ByteLite-only: "ByteLite / Deterministic Compression / Evidence Before Claims / Built for Individuals - Organizations - Technical Review". Content is clean. Blocked solely by the image ban. |
| `deterministic-flow-diagram.png` | `/how-it-works` | A only | Redrawn as "Public Review Framework - what can be examined without exposing protected implementation details" (Source, Result, Evidence, Status, Limitations, Review). No longer depicts a false pipeline. Blocked solely by the image ban. |
| `byte-vs-blackbox-comparison.png` | `/how-it-works` differentiator | A only | "Common Probabilistic Approach" against "ByteLite Priorities" (deterministic operation, explicit constraints, evidence tracked, auditable artifacts). Aligns with `WhatItIsNot`. Blocked solely by the image ban. |
| `validation-evidence-visual.png` | `/validation` | A only | "Structured Evidence" - Validation, Evidence, Status, Limitations, Review. Clean and on-message. Blocked solely by the image ban. |
| `product-ecosystem-overview.png` | `/` engagement section | A + B | Redrawn as an engagement map, resolving the owner's objection that the first version's dependency lines were structurally inaccurate. Still names "Founder Preorder" as one of four ways in, and `preorder/` is retired from discovery with no public surface. |
| `audience-entry-cards.png` | `/` Where to Start | A + B | Still routes "For People" to "Products / Everyday Use / Experiences". thebytelite.com is ByteLite-only, so there is no public products surface and that card points at nothing. The homepage also has no Where to Start section. |
| `contact-cta-banner.png` | `/contact` final CTA | B only | `/contact` is **not** image-banned, so blocker A does not apply. Blocked on content alone: the subhead still reads "General inquiries, licensing, technical review, and founder preorder interest." There is no founder-preorder inquiry type in the contact form and no public preorder surface, so the banner promises a route that dead-ends. **Placeable as-is the moment that one line leaves the artwork.** |
| `milestone-timeline.png` | About / progress | B | Unchanged between packages. Renders "Research -> Architecture -> **Validation** -> **Product Build** -> Website Launch -> Ongoing Development" as passed stations. The IP-safe brief says to use it "only if all six named phases accurately describe the company"; they do not. Section 2 holds INDEPENDENT VALIDATION and PRODUCTION QUALIFICATION as open gates, and `/validation` states "None of it has been independently verified." |
| `founder-preorder-highlight.png` | Preorder section | B | Unchanged between packages: "10% Lower Price", "10% More Entitlement", "Reserved Before General Release". The IP-safe brief conditions its use on those terms being verifiably current. **Verified against `src/data/bytelite.ts`: it contains no founder, preorder, 10% or entitlement terms at all.** Withheld and flagged for owner review, exactly as the brief directs. Section 5 also forbids hardcoding a price into a page. |

## Intentionally left unchanged

- The CSS/HTML teaching diagrams on `/`, `/how-it-works`, `/validation` and `/licensing`. Nothing
  was replaced or deleted.
- Hosting, Vercel configuration, domains, DNS, SendGrid, environment variables, the contact route,
  analytics, security headers, dependencies and `vercel.json`. None was touched.
- `public-scope-accessibility.spec.ts` and `public-scope-vocabulary.spec.ts`. Weakening either to
  admit the artwork would be a policy reversal - the owner's call, not an implementation detail
  (change law, section 12).
- The repository-wide Prettier state. `npx prettier --check` reports 159 pre-existing unformatted
  files including `src/pages/about.astro`, so the repo is not Prettier-governed. Running `--write`
  on the changed file reformatted all 100 lines of it and buried a 49-line addition in whole-file
  churn; that was reverted and the edit re-applied in the file's own compact style.
- The nine unplaced PNGs were **not** copied into `public/`. Adding roughly 12.9 MB of unreferenced
  binaries to a public repository, and to every deployment, has a real cost and no consumer. They
  stay in the source package and can be copied the moment a placement is authorised.
- No file from either package's `prompts/` or `notes/` was copied into the repository.

## Open items - not part of the completed work above

1. **Blocker A is one owner decision and it unlocks four assets immediately.** If images are
   accepted inside `main` on the four core routes - keeping the semantic-HTML-carries-the-meaning
   rule demonstrated on `/about` - then `bytelite-stack-hero.png`, `deterministic-flow-diagram.png`,
   `byte-vs-blackbox-comparison.png` and `validation-evidence-visual.png` can be placed, and
   `public-scope-accessibility.spec.ts` needs its assertion narrowed (image permitted only when an
   adjacent text equivalent exists), not deleted.
2. **Three assets need artwork edits, not a policy change.** Remove "founder preorder interest"
   from `contact-cta-banner.png`; remove the "Founder Preorder" node from
   `product-ecosystem-overview.png`; repoint the "For People" card in `audience-entry-cards.png`
   away from a products surface that does not exist publicly.
3. **Two assets need owner-supplied facts before they can ever be published.**
   `milestone-timeline.png` needs phases that match the real claim state; `founder-preorder-
   highlight.png` needs the 10% terms to become real, canonical values in `src/data/bytelite.ts`.
4. **The 1.45 MB PNG.** `proof-before-claim-ladder.png` is a gradient-heavy render in a format
   badly suited to it. It is lazy-loaded and off the critical path, but a WebP at ~1000w would
   likely land under 100 KB. Not done here: both briefs fixed the filenames, and re-encoding under
   a new name is an owner decision. Compare handoff blocker 2 (`bytelite-logo.png`, 473 KB).

---

# Final placement (2026-08-26 canon rebuild)

All ten IP-safe PNGs live at **`public/bytelite/`** (14.62 MB total). One canonical location, one
filename each, referenced as `/bytelite/<name>.png`. No page references the Downloads directory.

The first-pass copy at `public/about/proof-before-claim-ladder.png` was consolidated into this
folder and deleted, so there is exactly one copy of every asset.

## Published: nine of ten

| Asset | Page | Section | Loading |
|---|---|---|---|
| `bytelite-stack-hero.png` | `/` | Immediately below the hero | `eager` + `fetchpriority="high"` |
| `proof-before-claim-ladder.png` | `/` | "What is actually proven", above the proven / not-proven columns | lazy |
| `audience-entry-cards.png` | `/` | "Where to start", above the three real links | lazy |
| `contact-cta-banner.png` | `/` | Final contact section | lazy |
| `deterministic-flow-diagram.png` | `/how-it-works` | "What can be reviewed from outside" | lazy |
| `byte-vs-blackbox-comparison.png` | `/how-it-works` | "Different by design", after `WhatItIsNot` | lazy |
| `validation-evidence-visual.png` | `/validation` | Above the category dashboard | lazy |
| `product-ecosystem-overview.png` | `/founder-access` | Engagement map, above the benefit block | lazy |
| `founder-preorder-highlight.png` | `/founder-access` | Above the two-part founder benefit | lazy |

**The hero is the only eager image.** It is the largest element on the first screen, so lazy
loading it would delay the Largest Contentful Paint rather than help it. Everything else is below
the fold and lazy.

## Withheld: one

`milestone-timeline.png` is **not published**, and `public-scope-accessibility.spec.ts` asserts its
absence from every route.

It renders "Research -> Architecture -> **Validation** -> **Product Build** -> Website Launch ->
Ongoing Development" as passed stations. CLAUDE.md section 2 holds INDEPENDENT VALIDATION and
PRODUCTION QUALIFICATION as open gates, and `/validation` states "None of it has been independently
verified." A timeline showing validation as a completed milestone collapses target into completed
proof. The brief's own condition was "use only if every named phase is accurate"; two are not.

It becomes publishable when the artwork changes or the claim state does. Not before.

## Two graphics changed meaning between packages, and the pages follow the new one

- `bytelite-stack-hero.png` was a six-box stack naming ByteSight, Deep Kore, "Alya", Genesis
  Goalkeeper, Revelation Vanguard and Cordel. The IP-safe redraw is ByteLite alone. Only the
  redraw is in the repository.
- `deterministic-flow-diagram.png` was Input -> Structure -> Validation -> Governance -> Output ->
  Audit, which is not ByteLite's flow and would have described a system ByteLite is not. The
  redraw is a **Public Review Framework**, and `/how-it-works` labels it exactly that.
  `public-scope-vocabulary.spec.ts` fails the build if that section is ever called the algorithm,
  the processing pipeline, the encoding flow or the internal architecture.
- `product-ecosystem-overview.png` was a product dependency map with lines the owner identified as
  structurally inaccurate. The redraw is an inward-pointing **engagement map**, and
  `/founder-access` describes it as "a map of how people engage with ByteLite - not a diagram of
  how anything is built."

## Accessibility rules applied to every published graphic

- Intrinsic `width="1672" height="941"` on the tag, so the 16:9 box is reserved before the bytes
  arrive. Measured: 0px layout shift.
- `width: 100%; height: auto` - responsive, aspect ratio intact, never stretched, never upscaled
  past intrinsic width. A test compares rendered against intrinsic ratio with a 2% tolerance.
- Alt text on every one, checked for presence and length by test.
- **No image is the only carrier of its meaning.** Five of them have an explicit text-equivalent
  test naming the phrases that must exist as HTML on the same page. Measured reason: these renders
  are 1672px wide and their sub-labels land at roughly 5px inside a 320px viewport, where the text
  is simply gone.
- No CTA behaviour is baked into any image. `/founder-access` actions are real `<button>` elements
  and real `<a>` links, asserted by test.

## Public assets deleted with their routes

7.7 MB removed: `public/architecture/`, `public/company/`, `public/home/`, `public/marketing/`,
`public/research/`, `public/status/`, `public/technologies/`, `public/about/`,
`Deep_Kore_Banner.png`, `ByteLite_Banner.png`. Every one belonged to a deleted route family and
was unreferenced by the built site.

**Kept:** `public/cordel/` and `public/cordel-connect/`. Cordel is now a public product family, so
its photography and brand marks are current assets rather than retired ones, even though the new
product pages do not use them yet. `public/preview/tacodelsol/` is unrelated owner work and was
not touched.

## Open item carried forward

The published PNGs total 14.62 MB and every one is a gradient-heavy render in a format badly
suited to it. They are lazy except the hero, so this is not a correctness problem, but a WebP set
at ~1000w would very likely cut it by an order of magnitude. Not done here because both briefs
fixed the filenames, and re-encoding under new names is an owner decision.

---

# Optimization and Cordel imagery pass (2026-08-29)

## PNG -> WebP

The nine published graphics were 1672px PNG masters totalling **14.07 MB**. They are now 1400px
WebP totalling **928 KB** - a **93% reduction** - re-encoded with sharp at `quality: 90,
effort: 6`. Base filenames are unchanged; only the extension moved.

| Asset | Dimensions | Before | After | Change |
|---|---|---|---|---|
| `bytelite-stack-hero.webp` | 1400x788 | 1502 KB | 85 KB | -94% |
| `proof-before-claim-ladder.webp` | 1400x788 | 1485 KB | 93 KB | -94% |
| `audience-entry-cards.webp` | 1400x788 | 1452 KB | 74 KB | -95% |
| `contact-cta-banner.webp` | 1400x788 | 1461 KB | 63 KB | -96% |
| `deterministic-flow-diagram.webp` | 1400x788 | 1700 KB | 114 KB | -93% |
| `byte-vs-blackbox-comparison.webp` | 1400x788 | 1380 KB | 80 KB | -94% |
| `validation-evidence-visual.webp` | 1400x788 | 1452 KB | 74 KB | -95% |
| `product-ecosystem-overview.webp` | 1400x788 | 1652 KB | 117 KB | -93% |
| `founder-preorder-highlight.webp` | 1400x788 | 1474 KB | 83 KB | -94% |
| `cordel-play-tier-deck-backs-final.webp` | 1400x268 | 76 KB | 42 KB | -45% |
| `cordel-play-consent-cup-final.webp` | 1000x750 | 85 KB | 44 KB | -48% |
| `22_dating_preferences.webp` | 540x1200 | 222 KB | 39 KB | -82% |
| `21_blocked_users.webp` | 540x1200 | 132 KB | 19 KB | -86% |

**1400px, not 1672px**, because the widest any of these renders is 756px on desktop; 1400 is a 2x
buffer for high-density displays and nothing more. The `width`/`height` attributes were updated
from `1672x941` to `1400x788` to match the real intrinsic size - same ratio to four decimal places,
so no layout shift and no distortion.

**Label legibility was checked visually after conversion**, not assumed. `deterministic-flow-diagram`
(the densest) and the two phone screenshots were re-read at full size; all labels are sharp.

18 references were rewritten across 5 pages and 1 spec. The 9 superseded PNGs and the 2 converted
screenshot PNGs were deleted **after** the build proved no page requested them.

## Cordel imagery, and what was rejected

**Every candidate was opened and looked at before selection.** That mattered: most of the
available material could not honestly be published.

**`/cordel-play`** - two component renders:

- `cordel-play-tier-deck-backs-final.webp` - the six escalation tiers plus the Decree deck
- `cordel-play-consent-cup-final.webp` - the Consent Cup

Both are captioned as **renders of finished component designs, not photographs of a manufactured
product**, because nothing has been manufactured. Presenting a render as product photography would
be the fabricated finished-product claim the brief forbids.

**`cordel-play-board-20x20-final.webp` was rejected.** It is a legitimate approved design, but it
carries a nude female line figure and a suggestive character portrait. `/cordel-play` is publicly
indexed and sits on a company site whose other audience is enterprise licensing and investor
conversations. The brief's own instruction was to keep the product clearly 18+ **and avoid explicit
imagery**; the components above convey the game without it.

**`/cordel-connect`** - two real screens from the private Android test build:

- `22_dating_preferences.webp` - preferences and compatibility
- `21_blocked_users.webp` - settings with the safety section

**Most screenshots were rejected, and one category emphatically.** `15_safety_hub` and
`19_emergency_contacts` show a safety hub offering to *"share your location with trusted contacts"*
and a *"Safety Phrase"* - both of which this very page lists as **not built**. Publishing a
screenshot of a non-functional safety feature is the worst available version of fabricating a
capability, because someone might rely on it. `06_discover_home` shows a "Wingman Briefing" (an
unbuilt feature), a real person's face, and synthetic engagement counts.

The two that shipped carry an honest note: real screens, and some entries visible in them are
still unfinished.

## Copy rewritten

`CORDEL_CONNECT` in `src/data/projects.ts` read like an internal status report - "deterministic
intelligence integration", "complete Cordel migration verification", "two-device validation",
"private-data handling". Rewritten in plain customer language: what it helps you do, how the
privacy model works, who it is for, and that it is a private test build with no store listing.
The record renders straight onto the page, so the fix had to live in the data, not the template.

Also removed from that record: `AIya`/`ByteSight` in `integrationReceives` and `claimRestrictions`,
and `routes` arrays still pointing at deleted `/products/...` paths.

## Assets withheld, not deleted

`assets-withheld/` sits outside `public/` and is never copied into `dist`. See its README.

- `milestone-timeline.png` - withheld on claim grounds; moved out of `public/` so a withheld asset
  is not reachable at a guessable URL.
- `public-retired-names/` - **35 files, 8.61 MB**, whose filenames contained `aiya`, `aion`,
  `bytesight`, `deep-kore`, `heartstrings`, `byteflow`, `bytecost` or `byteoracle`. Nothing
  referenced them, but they were still being *served*. The scope rule covers public assets, and a
  URL is public whether or not a page links to it.

## Still shipping unreferenced

`dist` carries **26.97 MB** of images, of which the site references **14 files**. The remainder is
Cordel material kept deliberately - screenshots (9.6 MB), product renders (8.5 MB), tier cards
(1.8 MB), brand marks (0.5 MB) - plus the unrelated `preview/tacodelsol` client site. It is dead
deployment weight, not a correctness problem, and removing it is an owner decision because the
artwork is current.

---

# Final deployment cleanup (2026-08-29)

## `public/` now contains only what the site requests

Determined mechanically: every `src`/`href`/`url()` in the built `dist` was collected, plus the
files a browser fetches by convention (`favicon.svg`, `robots.txt`, `site.webmanifest`,
`bytelite-logo.png`). Everything else was removed.

| | Before | After |
|---|---|---|
| `dist` images | 189 files, 26.97 MB | **13 files, 1.28 MB** |
| `dist` total | — | **42 files, 1.82 MB** |

**Removed, 192 files / ~28.5 MB across two passes:**

- `public/preview/tacodelsol/` - an unrelated client preview site, 58 files, 2.67 MB
- `public/cordel/screenshots/` - all 36 app screenshots (see below)
- unused Cordel product renders, tier cards and brand copies
- `public/fonts/atkinson-*.woff` - verified: no `@font-face` anywhere referenced them
- `public/browserconfig.xml` - an orphan. No page referenced it, and it pointed at
  `/mstile-150x150.png`, which never existed. It was the last broken reference in the build.
- 35 files whose filenames carried a retired system name
- `assets-withheld/` - deleted in full. Parking unpublished artwork beside `public/` still made
  this repository an asset archive, which it is not. Everything is in git history.

`bytelite-logo.png` was resized 1536x1024 -> 1200x800 and recompressed: 462 KB -> 438 KB. Only 5%,
because it is a gradient render that PNG cannot compress. It stays PNG and keeps its filename
because it doubles as the `og:image`, and some social scrapers still refuse WebP. **It is now the
single largest asset on the site at 438 KB of 1.28 MB** - a candidate for a dedicated small icon
plus a separate social image, which is a design decision rather than a cleanup one.

## Cordel Connect screenshots: removed entirely

All 36 deleted, including the two published on 2026-08-29. They are not quarantined anywhere
reachable.

The reason is the same one that limited the original selection, applied all the way: most of these
screens depict features `/cordel-connect` itself lists as **not built** - a safety hub offering to
share your live location, a spoken safety phrase, a "wingman briefing". A screenshot of a
non-functional safety feature is the one kind of fabricated capability someone might actually rely
on in the situation it appears to address.

The page carries no screenshots and says so in a source comment. Screens return only when the
depicted functionality exists and the images are owner-approved.

## Draft legal pages: withdrawn, not hidden

`/preorder-terms` and `/supporter-terms` are **deleted from the build and return 404**. Removed
from the sitemap, the footer, and every in-page link (`/support`, `/founder-access`, `/terms`,
`/cordel-play`, `/cordel-connect` all previously linked to one of them). The pages that used to
link out now explain, in place, that the terms are still being drafted and that nothing can take a
payment until they are published and accepted.

`noindex` was not enough: it keeps a page out of a search index, but anyone with the URL could
still read an unapproved legal document and treat it as settled. Content is in git history.

## Supporter Pack: gated in code, not just in configuration

`PlanDefinition` gained `ownerEnabled`, and `founder-supporter-pack` is the one plan set to
`false`. `resolveCheckout()` refuses it before phase, offer window or Price ID are even consulted.

This matters because the blocker is not configuration. The pack promises specific digital files
that do not exist, and no `STRIPE_PRICE_*` value or `COMMERCE_PHASE=live` can make them exist.
Four unit tests assert it stays refused in every phase, including `live` with a valid Price
configured. Enabling it requires editing the allowlist - a reviewed change, not a dashboard toggle.

The page is now titled "Supporter Pack in preparation", the control reads "Being prepared - not on
sale" and is disabled, and the for-profit / not-a-donation / not-tax-deductible / no-equity
disclosure stays on the page rather than on the withdrawn terms page.
