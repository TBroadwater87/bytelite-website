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
