# BYTE LITE WEBSITE CANONICAL LAW

Read this file before touching this repository. It is law, not a diary. It states what is
true, what may be said, and what must never be done. Historical narrative belongs in
OWNER_README.md; dated evidence belongs in `qa/`.

If this file and any other document in this repository disagree, this file wins.
If this file and observed reality disagree, verify reality with the commands in
OWNER_README.md section 9 and correct this file.

ASCII only in this file. No emoji, no smart quotes, no box-drawing characters.

---

## 0. WHAT THIS REPOSITORY IS

The public marketing and explanation website for **ByteLite**, served at
`https://www.thebytelite.com`. Astro 5 static build, React 19 islands, Tailwind, TypeScript
strict mode. One server-side function: `POST /api/contact`.

It is not a product, not the compression engine, and not a portfolio site.

---

## 1. PUBLIC SCOPE

thebytelite.com is a **ByteLite-only** site. Do not restore portfolio scope.

Six discoverable destinations:

`/` . `/how-it-works` . `/validation` . `/licensing` . `/about` . `/contact`

Plus `/privacy` and `/terms` in the sitemap, and `/responsible-disclosure` and `/404`
which are not.

Everything under `architecture/`, `company/`, `marketing/`, `preorder/`, `products/`,
`progress/`, `research/`, `technologies/` and `architecture.astro` is **retired from
discovery, not deleted**. Those routes still build and still return 200, but each passes
`noindex={true}` to `Layout` and none appears in the sitemap, the header, or the footer.

Three rules follow, all enforced by tests:

1. **The sitemap is an allowlist**, not a denylist (`astro.config.mjs`). Adding a page under
   `src/pages/` can never put it back into search discovery by accident.
2. **No public page links into a retired section.** `critical-paths.spec.ts` walks every
   `main a[href^="/"]` on the homepage and every header link against the public route list.
3. **No public page names a sibling ByteLite LLC system.** Deep Kore, ByteSight, ByteOracle,
   ByteFlow, ByteCost, AIya, Aion, Genesis Goalkeeper, Revelation Vanguard, Cordel Connect
   and Cordel Play are absent from all eight public routes. Where a legal disclosure must
   cover a non-public service (privacy policy, terms), it describes the service generically
   rather than by product name.

A compatibility redirect is not public product promotion. Redirects and legal disclosures may
name history where there is a real reason; public pages may not.

Do not reinstate the `/about -> /company` or `/licensing -> /company/partnerships` redirects.
Both shadowed real pages and were deleted from `vercel.json`.

---

## 2. CLAIM LAW

Five states. Never collapse one into another, in either direction:

| State | Meaning |
|---|---|
| ARCHITECTURAL TARGET | What ByteLite is being built to achieve |
| CURRENT ENGINEERING STATE | What the work can do today |
| COMPLETED PROOF | Closed on internal evidence |
| INDEPENDENT VALIDATION | Someone outside ByteLite LLC reproduced it |
| PRODUCTION QUALIFICATION | Proven dependable enough for real workloads |

**The architectural target.** Universal deterministic lossless shrink: every eligible source
file represented by a complete self-contained ByteLite artifact smaller than the original,
from which the original is reconstructed exactly.

**Never narrow the target.** These sentences are forbidden and are tested for:

- "only expects structured files to shrink" / "structured files only"
- "random files are inherently expected not to shrink"
- "only intended to find savings in some classes of files"
- "does not promise that every file shrinks"
- "some data has no lawful reusable structure to find"

**Never complete the proof.** Also forbidden and tested for: "has proven universal
compression", "universal shrink is complete", "universally compresses every file",
"third-party verified", "peer reviewed", "production qualified", plus the information-theory
overreaches ("Shannon does not apply", "defeated information theory").

Independent validation and production qualification are **open gates**. Say so.

**Never state a compression ratio as achieved.** No "1GB to 15 bytes", no "quantum-scale",
no fabricated API response showing a ratio. `critical-paths.spec.ts` asserts the absence of
"1GB into 15 bytes" from the rendered site; do not reintroduce it into documentation either.

**The current development state.** ByteLite writes reconstruction evidence out explicitly so
transformations can be inspected, replayed and falsified. Publicly this is *"explicit
reconstruction evidence"* and *"a research scaffold, not the intended final artifact"* -
never the internal classification vocabulary. The final artifact is self-contained: all
reconstruction-essential information ends up inside the counted representation.

The site describes its own objective. It does not litigate information theory.

---

## 3. PUBLIC IP LAW

The site may say WHAT ByteLite intends to achieve. It may never say HOW.

**Allowed publicly, at a high level:**

- deterministic; lossless; exact reconstruction
- self-contained final artifact as the target
- the `.root` artifact name (it names the target output)
- the name **Bit Motion Encoding (BME)**
- complete accounting: reported size is counted from the complete artifact
- target-vs-proof status
- the public licensing model
- observable behavior

Preferred high-level wording when BME is named:

> ByteLite implements Bit Motion Encoding (BME), a deterministic recursive motion-encoding
> architecture with stream-built foundations.

BME expands to **Bit Motion Encoding**. It is never "ByteLite Motion Encoding".

**Never publish:**

- opcode construction law
- Ogram construction law
- Foundation construction internals; stream-built Foundation mechanics beyond the wording above
- motion-program rules
- pairing / private mapping laws
- reset / switch mechanics
- library-of-libraries construction law; root-of-roots implementation
- library selection or construction
- recursive metadata integration method
- sidecar compaction mechanism; carrier construction
- private serialization grammar
- unpublished reconstruction state machinery
- source code that constitutes protected mechanism disclosure
- private validation material not approved for publication

No page may show or describe the transition from today's explicit evidence to the compact
in-band state. `CurrentVsFinal.astro` deliberately draws two columns with nothing between
them. **That gap is load-bearing, not a layout oversight.**

Do not make the site more technical in order to make it more impressive.

---

## 4. WHAT BYTELITE IS NOT

State the boundary. Never describe the replacement mechanism.

- Not a generative AI system. Reconstruction is not inference.
- Not lossy. If exact reconstruction cannot be proven, the result does not qualify.
- Not "close enough". "Looks the same" and "means the same thing" are not accepted.
- Not confidence-score or probabilistic reconstruction.
- Not probabilistic entropy coding.
- Not independently validated. That gate is open.
- Not production-qualified. That gate is open.

Canonical wording is in `src/data/bytelite.ts` (`IS_NOT`). Import it; never restate it inline.

---

## 5. PRICING LAW

Two billing models, not two feature tiers. Canonical values live in `src/data/bytelite.ts`
(`PERSONAL_PLAN`, `SAVINGS_EXAMPLE`, `TARGET_EXAMPLE_LABEL`). Import them; never hardcode a
price in a page.

**PERSONAL** - flat subscription.

- `$9.99` / month, `$99.99` / year
- **No percentage-of-savings fee, ever.** An individual might process one very large file;
  a percentage model would turn that into a surprise bill. Flat pricing exists to make that
  impossible.
- Do not advertise "unlimited". No production economics support that promise.
- Current wording: "Subject to reasonable personal-use and service-capacity limits."
  Do not invent a specific byte or file-size cap either.

**BUSINESS / ENTERPRISE** - value-based licensing.

- ByteLite receives **50% of verified qualifying savings**. The customer retains the other 50%.
- No verified qualifying saving means no savings-share fee attributable to that saving.
- The 50/50 split is of the **savings**, not of the customer's costs. It is never
  "costs fall by half".

**Target economic example** - and it is labelled as target, always:

```
Baseline qualifying cost              $1,000
Target qualifying cost with ByteLite  $  100
Target verified savings               $  900   (90%)
Customer retains                      $  450
ByteLite fee                          $  450
Customer effective cost               $  550
Customer net saving                   $  450   (45%)
```

This is a TARGET ECONOMIC EXAMPLE. It is NOT a current performance claim.

**Never label the $100 figure "Measured qualifying cost with ByteLite."** The rendered label
is and stays "Target qualifying cost with ByteLite". `pricing-models.spec.ts` guards this.

---

## 6. EXTERNAL SERVICE LAW

Four services, four distinct roles. Do not collapse them. Do not silently migrate any of them.

| Service | Role | Explicitly NOT |
|---|---|---|
| **Cloudflare** | Authoritative DNS for thebytelite.com; inbound Email Routing for company aliases; hosts the DNS records SendGrid domain authentication needs | NOT the website host. Cloudflare Pages is retired here. |
| **Vercel** | Website hosting: static Astro build plus the `/api/contact` function; production environment variables; GitHub-connected production deployments | NOT the DNS provider. NOT the mail sender. |
| **SendGrid** | Outbound transactional email for the contact form only | NOT inbound mail. NOT a mailbox. |
| **GitHub** | Source of truth: `TBroadwater87/bytelite-website`, branch `main` | NOT a deploy target you configure by hand. |

**Cloudflare DNS is not Cloudflare Pages. Cloudflare is not Vercel. Vercel is not SendGrid.
Inbound Email Routing is not outbound mail.**

Never infer the hosting provider from the DNS provider. `www.thebytelite.com` is a CNAME to
`cname.vercel-dns.com`; that record lives at Cloudflare and points at Vercel. Both facts are
true at once.

**This repository is a PUBLIC GitHub repository.** Everything committed here is world-readable.
Never commit a secret value, and never write anything into this repo that section 3 forbids
publishing.

---

## 7. DEPLOYMENT LAW

Canonical platform: **Vercel**.
Canonical team: **ByteLite_LLC** (CLI scope slug `bytelitellc`).
Canonical project: **bytelite-website** (`prj_XmNkNFp156U94VveZgoPuMHPfW6u`).
Canonical source: **TBroadwater87/bytelite-website**, branch `main`.

Before any deployment:

1. Identify the actual Vercel team and project. Verify, do not assume.
2. Confirm which project currently serves the custom production domain.
3. Confirm the GitHub branch and commit being deployed.
4. Confirm no uncommitted owner work is about to be overwritten.
5. Run the required tests (section 9).

Absolute rules:

6. **Never create another Vercel project because `.vercel/` is missing.** Run `vercel link`
   and select the existing project. A missing local link is a local fact, never evidence that
   the project does not exist. A duplicate project was created this way once already.
7. **Never move the custom domain** without explicit owner authorization AND a verified
   replacement deployment that has already proved itself on its `*.vercel.app` URL.
8. **Never infer the hosting provider from the DNS provider.**
9. **Never add an Astro adapter or set `output: 'server'`** to make one API route work. The
   site is static; server-side code lives in `api/` as a Vercel Function beside it.
10. **Verify runtime behaviour on the canonical production domain**, `https://www.thebytelite.com`,
    or on a project alias such as `bytelite-website-bytelitellc.vercel.app`. A raw per-deployment
    URL (`bytelite-website-<hash>-bytelitellc.vercel.app`) is protected: it answers with Vercel's
    own authentication page. That HTML is Vercel, not this site. Reading it as the application
    produces confident nonsense - a "working" 200 that never touched the build, or a "broken"
    site that is perfectly fine.
11. **Never restore the superseded Vercel path.** See below.

**The superseded path - historical fact, never current.** Until 2026-08-25, `www.thebytelite.com`
was served by a project under a different Vercel account (`Tash Broadwater's projects`). It ran
Node 22, exposed 48 environment variables, and did not have the three contact variables. It is
superseded. Do not redeploy it, do not point the domain back at it, and do not describe it as
current in any document.

Both deployments were built from the same Git commit, so the pages looked identical and
comparing content proved nothing. What actually distinguished them was the **runtime
fingerprint** - Node version, environment-variable count, presence of the contact variable
names. When two deployments disagree, compare what the runtime reports, not what the page says.

---

## 8. CONTACT LAW

Canonical route: `POST /api/contact`.
Canonical implementation: `api/contact.ts` (Vercel adapter) over `api/_lib/contact-core.ts`
(all logic). There is exactly one contact core. Do not add a second adapter without a live
platform to run it on.

Required configuration, by NAME only. Never write a secret value anywhere in this repository:

- `SENDGRID_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

These are read at request time, not module load, so a newly-set variable takes effect without
depending on a cold start, and a missing one is reported rather than captured as `undefined`.

The route must:

- validate input and reject a malformed email address
- cap field and message sizes
- strip CR / LF / NUL from anything reaching an email header (header-injection defence)
- send `text/plain` only; no unsafe HTML handling
- **never return a false success.** Missing configuration is a 503 that says nothing was sent.
- **never log the SendGrid bearer credential.** A caught fetch error is logged by `err.name`
  only, because a thrown fetch error can carry the request and its Authorization header.
- distinguish provider acceptance from mailbox receipt. SendGrid `202` means queued. It is
  not proof the mail arrived.

**`POST /api/contact` is the only server-side route.** `api/health.ts` was a temporary
migration probe during the 2026-08 domain cutover; it was deleted on 2026-08-25 once delivery
was proven end to end. Do not reinstate it, and do not add any other diagnostic endpoint that
reports deployment configuration to the public internet. A probe that survives its migration
has become a permanent public API by accident.

**Delivery is proven, and the proof has three separate parts.** Never merge them:

| Fact | How it is established |
|---|---|
| The site accepted the request | `POST /api/contact` returned 202 |
| The provider accepted the message | SendGrid answered 202, meaning queued |
| The mailbox received it | Someone looked in the destination inbox and saw it |

Closed on 2026-08-25 against `https://www.thebytelite.com` at commit `0e5ffab`, all three
parts separately: `qa/contact-verification-2026-08-25.md`. Mail path is SendGrid ->
`tash@thebytelite.com` -> Cloudflare Email Routing -> the owner's mailbox. A future agent that
re-verifies this must confirm the third part by inspection, never by inferring it from the
first two.

**The contact page carries no outage notice.** The banner that stood there while delivery was
being reconfigured was removed on 2026-08-25 and `public-scope-vocabulary.spec.ts` now asserts
its absence. Honest error handling is a different thing and stays: a failed submission still
says the message was not sent. Do not restore a standing outage notice while delivery works,
and do not delete the failure path along with the banner.

---

## 9. TEST LAW

```
npm run build          # Astro static build
npx vitest run         # unit tests
npx astro check        # Astro + template diagnostics
npx tsc --noEmit       # TypeScript
npx eslint .           # lint
npx playwright test    # E2E, 5 browser engines
npm run test:e2e:clean # E2E after clearing a stale preview server of our own
```

Rules:

- **No rerun-until-green.** A flaky test is a defect to diagnose, not to retry.
- **No arbitrary sleeps** to cure a race condition.
- **Never disable a browser engine** merely to make CI pass.
- **Never inflate a screenshot tolerance** merely to make a visual check green.
- **Each E2E run must test the build that run produced.**
  `playwright.config.ts` sets `reuseExistingServer: false` for a measured reason: with reuse
  ON and the port already listening, Playwright skips `command` entirely, so `npm run build`
  never runs and the suite silently tests whatever `dist` an earlier build left behind. This
  was reproduced with a marker file planted in `dist`. Preserve that setting and its comment.
- `workers: 1` is also measured, not cosmetic: five browser engines cold-starting at once on
  one machine produced transient navigation timeouts. Do not raise it to speed up a run.

---

## 10. CANONICAL DATA LAW

Four modules under `src/data/` are the single source of truth for anything the site asserts.
Never restate one of these facts inline in a page - import it, so it cannot drift.

| Module | Owns | Never hardcode in a page |
|---|---|---|
| `src/data/projects.ts` | Every project's status, capabilities, validation statements, availability, routes | Technology/project counts (`TECHNOLOGY_COUNT_WORD`, `PUBLIC_PROJECT_COUNT_WORD`), status labels, validation prose |
| `src/data/company.ts` | Company identity and dates | "Founded" years - `RESEARCH_BEGAN_YEAR` (2024, when the work began) and `LEGAL_FORMATION_YEAR` (2025, the LLC) are **not interchangeable** and must never collapse into one "founded" year |
| `src/data/research.ts` | Research publication metadata, the canonical progression figure, the maturity table, evidence vocabulary, bibliography, disclosure language | Research route paths (`RESEARCH_ROUTES`), disclosure-boundary wording, publication date/version |
| `src/data/bytelite.ts` | The public ByteLite surface: the two-line law, the validation ladder and current rung, the enwik9 state, the licensing/billing figures, the illustrative-only labels | Stage states and labels, savings-split numbers, "Illustrative only" wording, prices |

`ProjectRecord.validation` is a list of `ValidationStatement`s, each tagged `evidence` or
`limitation` via the `evidence()` / `limitation()` helpers. `/progress/validation-evidence`
regroups them into a public ledger - it never filters, so a negative finding cannot be dropped
by adding a statement in the wrong place.

**Public evidence rule**: commit ids stay (they anchor a result to a state of the work); local
paths, drive letters, build locations, and branch plumbing do not. Translate a branch
discrepancy into its evidentiary meaning ("integration parity has not been qualified") rather
than describing the repository layout.

---

## 11. TEACHING DIAGRAMS

Diagrams live in `src/components/bytelite/` and are pure CSS/HTML - no images, so they survive
zoom, reflow, and a screen reader. No safe real screenshot of the development tooling exists in
this repository; do not fabricate one, and do not publish an unsanitised capture.

| Diagram | Teaches |
|---|---|
| `ByteLiteFlow` | The target: source -> self-contained representation -> exact original |
| `CurrentStatusBox` | Currently / still required, both columns always |
| `CurrentVsFinal` | Development proof scaffold vs the self-contained final artifact |
| `ExactRoundtrip` | `hash(original) = hash(reconstructed)`, no partial credit |
| `ByteAccounting` | Any compression claim rests on the complete artifact |
| `ReductionGate` | Claim discipline - what may be claimed today |
| `DevelopmentRoadmap` | Eleven gates, exactly one current position |
| `WhatItIsNot` | The boundary, never the replacement mechanism |
| `ValidationDashboard` | Ten categories, ByteLite only, state written in words |
| `SavingsSplit` / `BalanceAutoReload` | Planned economics, labelled illustrative |

---

## 12. CHANGE LAW

Never, without explicit authorization from the owner:

- `git reset`, `git clean`, `git stash`, or discard uncommitted work
- overwrite or delete work you did not create in this session
- delete a compatibility redirect without evidence that nothing depends on it
- delete anything you classified UNKNOWN

Delete code or config only when ALL of these hold:

1. No current import or reference uses it.
2. The current production architecture does not use it.
3. Tests and the build do not depend on it.
4. It is not required for compatibility.
5. It is not required for legal disclosure.
6. It is clearly superseded.

If uncertain: keep it and record it as UNKNOWN in OWNER_README.md section 16.

Edit files in place. Do not rename source files. Do not add new source files unless asked.

---

## 13. IMPORTANT CONTEXT

- Patent US 63/807,027 (pending).
- Founder: Tash Broadwater, Helena MT.
- **Multi-Version System: NOT IMPLEMENTED.** Ignore legacy documentation mentioning
  "Commercial / Lighthouse / Strategic" versions. This is a single unified website.
- Research pages state hypotheses; they must never state capability. Anything that exists
  belongs in `projects.ts` and is surfaced through Current Status and Validation Evidence.

---

**Operational detail, service-by-service troubleshooting, deployment commands, recovery
procedure, and the current open blockers live in `OWNER_README.md`.**

Last reviewed against reality: 2026-08-25. The custom-domain cutover is closed and contact
delivery is proven to the mailbox; the runtime evidence is `qa/contact-verification-2026-08-25.md`,
taken against `https://www.thebytelite.com` serving commit `0e5ffab`. Production was re-verified
after the cleanup at commit `fbe6371`: 200 on `www`, 308 from the apex, 404 on the deleted probe,
405 on `GET /api/contact`, 400 on an invalid POST.
