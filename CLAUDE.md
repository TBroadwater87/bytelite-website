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
strict mode. Server-side code lives in `api/` as Vercel Functions beside the static build: the
contact route (section 8), the Stripe commerce routes (section 15), `gone`, and the four Deep
Kore chat routes (section 19). That list is closed.

It is not a product, not the compression engine, and not a portfolio site.

---

## 1. PUBLIC SCOPE

**Rewritten 2026-08-26 by owner decision.** thebytelite.com was a ByteLite-only site with the
retired portfolio kept alive at `noindex`. Both halves of that changed: **Cordel is now a public
commercial product family**, and the retired families are **deleted**, not hidden.

ByteLite still comes first. It is the reason the site exists, it owns the homepage, and the
technology pages precede the product pages in every navigation surface.

**Discoverable (in the sitemap allowlist in `astro.config.mjs`):**

`/` . `/how-it-works` . `/validation` . `/licensing` . `/about` . `/contact` .
`/founder-access` . `/deep-kore` . `/support` . `/cordel-connect` . `/cordel-play` .
`/privacy` . `/terms`

`/deep-kore` was added **2026-09-01** by owner instruction. It is the canonical public page for
Deep Kore and the only route on which that vocabulary is permitted (rule 3, section 19).

**Resolvable but deliberately not discoverable:** `/checkout/success`, `/checkout/cancel`,
`/billing`, `/responsible-disclosure`, `/404`. The first three are steps inside a flow, not
destinations; a search result landing on a bare success page would be meaningless.

**Withdrawn 2026-08-29:** `/preorder-terms` and `/supporter-terms`. Both were unreviewed drafts
carrying a visible DRAFT badge. They are **deleted from the build and return 404**, not merely
de-indexed: `noindex` keeps a page out of a search index, but anyone holding the URL could still
read an unapproved legal document and reasonably treat it as ByteLite LLC's settled position.
Their content is in git history. Recreate them only when the terms are approved, and add them to
the sitemap allowlist at the same time. Until then, **no page may link to them**, and every
checkout that would depend on them stays disabled.

**Deleted, not retired.** `architecture/`, `company/`, `marketing/`, `preorder/`, `products/`,
`progress/`, `research/`, `technologies/`, `architecture.astro` and `src/pages/api/` no longer
exist. Every one of those URLs now either 301s to a real successor or returns **410 Gone** from
`api/gone.ts`. See `vercel.json`.

**410 rather than 404, and rather than a noindex 200.** A 200 with `noindex` still serves the
stale page to anyone with the link and still costs a crawl. A 404 says "try again later". A 410
says "this is gone deliberately", and it leaves the index far faster. Those pages named retired
systems, so getting them out of the index *is* the job.

Rules that survive, all enforced by tests:

1. **The sitemap is an allowlist**, not a denylist. Adding a page under `src/pages/` can never
   put it into search discovery by accident.
2. **No public page links to a route that no longer exists.** Enforced against the built HTML.
3. **These names stay off every public surface:** ByteSight, ByteOracle, ByteFlow, ByteCost,
   KoreLattice, HeartStrings, and the misspellings Codrel / Cordea / Cordia. Not in pages,
   titles, descriptions, alt text, structured data, sitemaps, client-shipped comments, or
   public assets.
   **Cordel Connect and Cordel Play are no longer on that list.** They are current products with
   their own canonical pages.

   **Amended 2026-09-01 by written owner instruction.** Five names left this list and became
   *route-scoped* rather than unconditionally banned, **in two tiers**:

   - **The product name, `Deep Kore`**, may appear in the content of `/deep-kore`, in the
     header and footer (the link that points at the page has to say where it goes), and on
     `/privacy` and `/terms` - because a legal page that will not name the service it is
     describing is a worse legal page. Nowhere else.
   - **The identity and governance vocabulary - `AIya`, `AIon`, `Genesis Goalkeeper`,
     `Revelation Vanguard`** - appears in the content of `/deep-kore` and **nowhere else at
     all**, not in the chrome and not in the legal pages.

   `DeepKore` unspaced stays banned everywhere: it is the retired portfolio spelling.

   Both tiers are asserted route by route in `public-scope-vocabulary.spec.ts` and against the
   built markup in `route-disposition.test.ts`, so the ban was given a boundary rather than
   weakened, and neither exception can widen into a back door. The full record is
   **section 19**.
4. **A 410 body names nothing.** A gone-page that recites the retired product it replaced would
   republish the exact vocabulary the retirement removed.

Do not resurrect the obsolete portfolio, the abandoned architecture pages, or the speculative
technology-stack claims. Cordel being public is not permission to bring any of that back.

Do not reinstate the `/about -> /company` or `/licensing -> /company/partnerships` redirects.
Both shadowed real pages.

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

**Never state a compression ratio as achieved, with one owner-approved exception.** No "1GB to
15 bytes", no "quantum-scale", no fabricated API response showing a ratio.
`critical-paths.spec.ts` asserts the absence of "1GB into 15 bytes" from the rendered site; do
not reintroduce it into documentation either.

**The exception, added 2026-08-31 by written owner decision.** Exactly one historical figure may
be published, in exactly one sentence, in exactly two places:

> An earlier internal Python prototype demonstrated exact lossless reconstruction after reducing
> a one-terabyte test input to approximately four hundred kilobytes.

It is exported as `HISTORICAL_PROTOTYPE_RESULT` from `src/data/bytelite.ts` and rendered on `/`
and `/validation` only. It carries `HISTORICAL_PROTOTYPE_SCOPE` at both placements, which states
that it is neither a benchmark of the current C++ implementation nor independent validation.

This exception is **narrow and does not generalise**. It licenses no other figure, no ratio
expressed as a number, no throughput, no runtime, no hardware, no date, no dataset identity, no
reviewer and no supporting artifact - because none of those exists, and the owner's instruction
forbade inventing them. It also may not be restated a third time on another page. The full
record, including the refusal that preceded the approval, is **section 18**.

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
(`PERSONAL_PLAN`). Import them; never hardcode a price in a page.

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

**No worked economic example. Removed 2026-08-26, permanently.**

This section used to carry a $1,000 -> $100 -> 50/50 chain, and `src/data/bytelite.ts` used to
export `SAVINGS_EXAMPLE` and `BALANCE_EXAMPLE` (a $42.18 balance, a $25.00 minimum, a $100.00
auto-reload, an $18.40 settlement). Every one of those numbers was invented. Labelling them a
target kept them technically honest, but an invented number laid out like an invoice still reads
to a visitor as something ByteLite already did for somebody.

**Never put a currency figure on a public page that did not come from a measured result.** The
model is fully expressible in words - 50% of verified qualifying savings, and no verified saving
means no fee - and words cannot be mistaken for an operational account.

The only prices that may appear are `PERSONAL_PLAN`'s `$9.99` / `$99.99`, because those are
decided public prices rather than modelled outcomes.

**FOUNDER PRICING.** The founder benefit is exactly two things and they are never combined:

- **10% lower founder price**
- **10% additional qualifying entitlement**

They are not "20% off". One is a discount on money; the other is more of whatever the product
meters. Adding them is arithmetic on two different units.

**Nothing in this repository computes a founder price.** 10% off `$9.99` is `$8.991`, and Stripe
prices are integer minor units. Rounding that is a commercial decision with a legal consequence,
so the rounded figure lives in an owner-approved Stripe Price object and reaches the code only as
an ID in an environment variable. Never write `* 0.9` anywhere.

**The meaning of the additional 10% is undefined and must stay undefined until the owner sets
it.** No page may invent a unit for it. `src/data/commerce.ts` says so in
`FOUNDER_ENTITLEMENT_UNDEFINED_NOTE`; import that rather than paraphrasing it.

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
- **bound the provider call.** `PROVIDER_TIMEOUT_MS` aborts a stalled SendGrid request so one
  provider outage cannot pin compute slots until the platform ceiling. The abort arrives on the
  existing catch path, so it is reported as an honest 502 and logged by `err.name` only.
- **key the rate limit on a header the caller cannot forge** - `x-vercel-forwarded-for`, then
  `x-real-ip`, then the socket address. Never the first hop of `x-forwarded-for`; see section 14.
- **accept `application/json` and nothing else**, answering 415 before reading the body.
  `application/x-www-form-urlencoded`, `multipart/form-data` and `text/plain` are "simple"
  request types that a cross-origin HTML form can POST with no preflight and no consent, and the
  platform parses urlencoded bodies into `req.body` as an object - so before this guard a form
  POST from a hostile page was accepted as a real submission. Requiring JSON forces a preflight
  this route does not answer.

**Probing this route is not free.** A valid payload sends real mail to a real person. Test it
with payloads that cannot pass validation, and confirm the deployment is actually aliased before
probing at all - otherwise you are testing the previous deployment and mailing the owner to
learn it.

**`POST /api/contact` is no longer the only server-side route** - see sections 15 and 19. The
routes that exist are `contact`, `checkout`, `checkout-session`, `stripe-webhook`, `gone` and the
four under `deep-kore/` (`session`, `message`, `result/[jobId]`, `consent`), and that list is
closed. **Corrected 2026-09-04:** this said three and named three. `consent` arrived with the
teaching-queue work of 2026-09-03 and the count was not moved with it - a small drift, recorded
rather than quietly fixed, because a closed list that is wrong about its own contents is not a
closed list. The
original rule survives in its important half: **do not add any diagnostic endpoint
that reports deployment configuration to the public internet.** `api/health.ts` was a temporary
migration probe during the 2026-08 domain cutover, deleted on 2026-08-25 once delivery was proven
end to end. Do not reinstate it. A probe that survives its migration has become a permanent public
API by accident.

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

**Corrected 2026-08-31:** this table listed five modules and named `src/data/research.ts`. That
module was deleted with the research/progress route families in the 2026-08-26 rebuild and does
not exist. The row is removed below; the four that remain are the real ones.
Never restate one of these facts inline in a page - import it, so it cannot drift.

| Module | Owns | Never hardcode in a page |
|---|---|---|
| `src/data/projects.ts` | Every project's status, capabilities, validation statements, availability, routes | Technology/project counts (`TECHNOLOGY_COUNT_WORD`, `PUBLIC_PROJECT_COUNT_WORD`), status labels, validation prose |
| `src/data/company.ts` | Company identity and dates | "Founded" years - `RESEARCH_BEGAN_YEAR` (2024, when the work began) and `LEGAL_FORMATION_YEAR` (2025, the LLC) are **not interchangeable** and must never collapse into one "founded" year |
| `src/data/commerce.ts` | The public commerce surface: founder cards, the two founder benefits, the supporter disclosure and reward list, the commerce/founder phases | Plan states, benefit wording, the supporter disclosure, whether a control is actionable |
| `src/data/bytelite.ts` | The public ByteLite surface: the two-line law, the validation ladder and current rung, the enwik9 state, the homepage status framing, the licensing/billing figures, the illustrative-only labels | Stage states and labels, `HOMEPAGE_STATUS`, savings-split numbers, "Illustrative only" wording, prices |

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

**Teaching diagrams** live in `src/components/bytelite/` and are pure CSS/HTML - no images, so
they survive zoom, reflow, and a screen reader. That has not changed and must not: a diagram whose
meaning lives only in pixels is unreadable at 320px and invisible to a screen reader.

**Brand and marketing graphics are a separate category, added 2026-08-26.** The nine approved
IP-safe PNGs in `public/bytelite/` may appear in primary page content, under one rule that is not
negotiable:

> **The image may never be the only carrier of its meaning.** Every graphic that contains words
> must sit beside real semantic HTML saying the same thing - a list, a table, or prose. The image
> is reinforcement.

The reason is measured, not stylistic: these renders are 1672px wide and their sub-labels land at
roughly 5px inside a 320px viewport. At that size the text is gone. The HTML beside it is what a
phone, a zoomed browser and a screen reader actually read.

Every such image also carries intrinsic `width` and `height` (so the box is reserved and nothing
shifts), `height: auto` (so nothing stretches), and `loading="lazy"` unless it is the homepage
hero - which is `eager` with `fetchpriority="high"`, because lazy-loading the largest element on
the first screen delays the LCP rather than helping it.

`milestone-timeline.png` is **not published**. See section 16.

No safe real screenshot of the development tooling exists in this repository; do not fabricate
one, and do not publish an unsanitised capture.

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

## 14. SECURITY LAW

**A package in the lockfile is not an exploit.** Every dependency finding gets a reachability
argument before it gets a version bump, and the argument must come from configuration, not
optimism. This site is `output: 'static'` with no adapter: Astro renders at BUILD time, from this
repository's own files, and ships plain HTML. An advisory whose precondition is request-time
rendering, an attacker-controlled slot name, a `Host` header, `define:vars`, a `transition:*`
directive, a spread attribute name, or a server island is **structurally unreachable here**, and
saying so with the grep that proves it is a stronger answer than a major upgrade. Record the
proof; do not silently ignore the alert.

**The reverse is equally binding: unreachable is not the same as absent.** Re-run the
reachability argument whenever the architecture moves. Adding an adapter, setting
`output: 'server'`, or introducing `prerender = false` turns a whole class of "not applicable"
into "exploitable" in one commit. See section 7 rule 9.

**`npm audit fix --force` is prohibited.** It resolves every finding by installing whatever
version satisfies the advisory, including major upgrades, without asking whether the vulnerable
path is reachable or whether the new major breaks the site. Fix in this order: patch, minor, a
direct-dependency bump that lifts the transitive package, a narrowly justified `overrides` entry,
and only then a major migration. Every `overrides` entry needs a documented reason and a stated
condition for removing it again.

**Dependency changes require the full matrix in section 9**, ending with `npm ci` from a clean
state so the lockfile is proven self-consistent. Never hand-edit `package-lock.json`. Never swap
npm for another package manager.

**Contact secrets are server-side only, and the visitor controls nothing that addresses mail.**
The recipient and the sending identity come from environment variables and from nowhere else. A
submitted body may never choose, extend or influence a destination, a sender, a Bcc, or a header.
The visitor's address is used as `reply_to` only, after control characters are stripped. Anything
that would let a request pick where mail goes is an open relay; do not build one.

**A rate-limit key must be something the caller cannot choose.** `x-forwarded-for` is
caller-supplied: its first hop is whatever the client sent, so keying a throttle off it lets one
client rotate the header and never be limited, which is worse than no throttle because it looks
like one. Use the platform's own `x-vercel-forwarded-for` / `x-real-ip`, then the socket address.

**Every outbound call from a function needs a deadline.** Without one, a provider that accepts
the connection and stalls holds a compute slot until the platform ceiling, turning someone else's
outage into ours.

**Security headers are served by the host, not by the framework.** In a static build Astro
middleware runs at build time and its headers are discarded. `vercel.json` is the only place that
actually sets them, and it is therefore the single source of truth - do not create a second,
divergent policy elsewhere and do not cite an inert file as evidence that headers are live.
**A CSP must be validated in a real browser against the real build before it ships**, because the
violations that matter come from runtime `fetch` calls that no static reading of the source
reveals. Never widen a directive to `*` or add `unsafe-eval` to silence a console error; widen
only to a specific origin the site provably calls, and write down why.

**Do not add security vendors.** No CAPTCHA, scanner, WAF service, monitoring agent, analytics or
badge unless a demonstrated vulnerability requires it. A longer vendor list is a larger attack
surface, not a smaller one.

**Never print a secret value** - not in a commit, a log, a response body, a test fixture, an
error path, or a report. Report finding *types* and locations. A caught fetch error is logged by
`err.name` only, because the thrown object can carry the request and its Authorization header.

---

**Operational detail, service-by-service troubleshooting, deployment commands, recovery
procedure, and the current open blockers live in `OWNER_README.md`.**

Last reviewed against reality: 2026-08-25, against commit `8ea2de6` serving production
(deployment `dpl_8SvCeGwcFguaxy1aMmQD2bGDPi7T`).

The custom-domain cutover is closed and contact delivery is proven to the mailbox; the runtime
evidence is `qa/contact-verification-2026-08-25.md`, taken against `https://www.thebytelite.com`
serving commit `0e5ffab`. A security and dependency hardening pass followed
(`2c348d6..5a73c76`): all seven security headers are now served from `vercel.json`, the contact
route requires `application/json` and bounds its provider call, and the rate-limit key no longer
trusts a caller-supplied header.

Verified live at `8ea2de6`: 200 on `www`, 308 from the apex, 404 on the deleted probe, 405 on
`GET /api/contact`, 415 on a non-JSON POST, 400 on an invalid JSON POST.

**WEBSITE_ACTIVE_DEVELOPMENT=REOPENED 2026-08-26** for the owner-authorised canon rebuild
(Cordel public scope, IP-safe graphics, Stripe test-mode commerce). The freeze in
`reports/WEBSITE_AUTHORITATIVE_HANDOFF.md` is superseded for this work only; everything that
document says about DNS, hosting, the superseded Vercel path and contact delivery stands.

**2026-08-31, company-voice pass.** The founder-singular voice that rebuild shipped is superseded
by **section 17**. Routes, redirects, commerce, graphics and the withdrawn legal drafts were
already in their target state and were left alone; the change is the voice, the homepage hero and
status framing, and the licensing page gaining what a licensing conversation actually covers.
Local verification passed the full section 9 matrix. **Not committed, not deployed** - the working
tree is ahead of production, which still serves `21af2ca`.

**Same day, second pass: the historical prototype result was approved and published.** It was
refused earlier in the day for the reasons in section 18; the owner then decided in writing to
publish it, section 2 was amended to carry the narrow exception, and the claim ladder was updated
so nothing contradicts it. The **sub-64-byte objective was not part of that approval** and stays
unpublished.

**2026-09-04, the public AIya interface.** The Deep Kore chat was finished on the website side and
**proved against the real engine**: a real browser, this site's own route handlers, the real
`deep_kore_gateway`, a real `dk_session_worker`, real `process_governed_turn()`, and - for the
consent rows - the real `dk_teaching_broker` writing into an ISOLATED queue that never touched the
owner's own. The projection held: none of `state_hash`, `gk1_decision`, `gk2_decision`,
`transform_count`, `vanguard_diag` or `adult_consent_invariant_violated` crossed, and the stamp
arrived redacted.

What that pass added is in section 19: one adapter as the website's only Deep Kore boundary, a
closed result union enforced at compile time on both sides, unknown-key refusal at every level of
every request body, a fourth CSRF barrier, a visitor-pressed retry, a "Why this response?"
disclosure, and the vault and review-queue disclosures on `/privacy` and `/terms`.

It also recorded a **seam that must not be papered over**: a TAV request needs device-supplied
entity evidence, which a public web page does not have and must not invent, so the TAV surface is
implemented and correct but not reachable by a visitor today. Whether to change that is an owner
decision. **`DEEP_KORE_CHAT_PHASE` remains `disabled`, nothing was deployed, and the terms wording
still needs owner and counsel approval.**

---

## 15. COMMERCE LAW

Added 2026-08-26. Stripe is the payment processor. Everything below is enforced in
`api/_lib/commerce-core.ts` and its tests.

**Stripe is server-side only.** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are read at
request time inside `api/`. Neither may ever be renamed with a `PUBLIC_` prefix - Astro inlines
`PUBLIC_` variables into the browser bundle, which would publish the key to every visitor. No
Stripe.js is loaded and no publishable key is used: checkout is Stripe-hosted and reached by
navigation.

**The browser chooses a plan key and nothing else.** Never a price, an amount, a currency, a
Stripe Price ID, a mode, a discount, a success URL or a product description. `resolveCheckout()`
is the only thing that turns a key into a Stripe call, and an unknown key dies there.

**Anything unrecognised fails closed.** `readPhase()` maps an unset or misspelled
`COMMERCE_PHASE` to `disabled`. A typo in an environment variable must never fail open into live
commerce.

**A plan with no approved Stripe Price is not purchasable.** It renders an honest "being
configured" state and its checkout call is refused server-side. A disabled-looking button whose
server would have accepted the call is a worse bug than a broken button.

**A reservation is not a subscription.** `setup` mode stores a payment method after saying so; it
creates no recurring object. Before any first charge the customer must be shown the exact amount,
interval, first-charge date, renewal behaviour, cancellation method and refund position, and must
act to confirm. Silence is never consent.

**Cordel Play takes no money.** It is a physical 18+ product, never a subscription. No paid
preorder until there is a reasonable basis for a stated shipment time and an operating
delay-consent/refund process - the FTC Mail, Internet, or Telephone Order Merchandise Rule
requires shipment within the promised time, or 30 days where none is stated.

**The Supporter Pack is a purchase, not a donation.** ByteLite LLC is for-profit; the payment is
not tax deductible and conveys no equity, repayment, ownership, product access or governance. The
disclosure in `SUPPORTER_DISCLOSURE` sits adjacent to the purchase control, not in a footnote.

**Only the webhook decides a payment is real.** `/checkout/success` starts by claiming nothing and
asks `/api/checkout-session`, which asks Stripe. A `session_id` in the URL is a lookup key and
never evidence - anyone can type one.

**Never build an unauthenticated portal-session endpoint.** `/billing` links to Stripe's hosted
portal login. An endpoint minting a portal session from a checkout session id would hand anyone
holding that id someone else's invoices, card and cancellation.

**Never log a payment value.** Errors are logged by `err.name` only: a thrown Stripe error can
carry the request, and the request carries the Authorization header. Plan keys and session ids are
loggable; amounts, emails, customer ids and payment methods are not.

**The Stripe API version is pinned** in `api/_lib/stripe-client.ts`. Change it only as its own
reviewed commit, never to silence a type error.

**Consents stay separate.** Purchase, subscription activation, supporter-wall listing and
marketing are four different agreements. Never bundle them into one checkbox.

---

## 16. WITHHELD ASSETS AND OPEN OWNER DECISIONS

`milestone-timeline.png` is supplied but **not published**. It renders "Research -> Architecture ->
Validation -> Product Build -> Website Launch -> Ongoing Development" as passed stations. Section
2 holds INDEPENDENT VALIDATION and PRODUCTION QUALIFICATION as open gates and `/validation` states
"None of it has been independently verified", so a timeline showing validation as a completed
milestone collapses target into completed proof. It may be published when either the artwork or
the claim state changes - not before. It is not in this repository at all: the file is in git
history and in the source refresh package. **The website repository is not an asset archive** -
do not park unpublished artwork here, inside `public/` or beside it.

**Published images are WebP, and PNG masters do not ship.** The nine published graphics are served
from `public/bytelite/*.webp` at 1400px wide - 928 KB in total, down from 14.6 MB of PNG. Re-encode
with `sharp` at `quality: 90, effort: 6`; below that, the fine label text in these diagrams smears
before anything else does. Verify labels are still readable after any re-encode. Keep the `width`
and `height` attributes matching the real intrinsic size (1400x788), not the original master.

**`public/` is a published surface, and a URL is public whether or not a page links to it.** On
2026-08-29, 35 unreferenced image files whose *filenames* contained a retired system name (`aiya`,
`aion`, `bytesight`, `deep-kore`, ...) were still being served at enumerable URLs.

**`public/` now contains only what the built site actually requests.** That is 13 images plus
`favicon.svg`, `robots.txt` and `site.webmanifest` - 1.28 MB of images, down from 26.97 MB. The
deleted material (Cordel screenshots and renders, tier cards, brand copies, unused fonts, the
unrelated `preview/tacodelsol` client site, `browserconfig.xml` and its missing tile image) lives
in git history and in the canonical Cordel project; the website repository does not archive it.

Before adding a file to `public/`, ask whether a page requests it. If not, it does not belong here.

Open decisions that block activation, and which no agent may resolve by assumption:

- the rounded founder monthly and annual prices for ByteLite;
- the public monthly and annual prices for Cordel Connect;
- what "10% additional qualifying entitlement" is measured in, per product;
- whether founder reservations collect a payment method or contact details only;
- Cordel Play's price, shipment estimate, refund and delay-consent processes;
- the Supporter Pack's reward files and minimum amount;
- tax registrations and whether `STRIPE_AUTOMATIC_TAX_ENABLED` may become `true`;
- final legal approval of the drafts on `/preorder-terms` and `/supporter-terms`;
- the move from Stripe test mode to live mode;
- whether the **sub-64-byte objective** may be published (section 18, "What was NOT approved").
  The historical prototype result was a separate question and was **approved on 2026-08-31**;
  it is now live. This remaining item is only the 64-byte objective.
- every open gate on the live Deep Kore chat, listed in **section 19**: the origin hostname and
  bind address, `DEEP_KORE_CHAT_PHASE`, the Cloudflare Tunnel and Access service token, the
  Turnstile keys, whether AIon is publicly exposed, whether Revelation Vanguard is enabled, and
  where the Windows gateway and worker are installed.

Until each is closed, the affected control stays disabled at the server, not merely hidden.

---

## 17. PUBLIC VOICE LAW

Added 2026-08-31 by owner decision. The 2026-08-26 rebuild wrote the whole public site in
founder-singular voice. That is superseded. The site is now **one company website**, and the voice
rule is enforced by `public-scope-vocabulary.spec.ts` against rendered text on every public route.

**The subject of a sentence is decided by what the sentence is about.**

| Saying what... | Subject |
|---|---|
| the technology does | **ByteLite** |
| the company decides, owes, charges, licenses, supports or promises | **ByteLite LLC** (or we / our / us) |

**`I`, `me`, `my` and `mine` appear in exactly two places on the public site**, and the test
removes precisely those two regions before scanning the rest of each page:

1. **`blockquote.founder` on the homepage** - one labelled, signed founder note. There is exactly
   one, asserted by `toHaveCount(1)`.
2. **`.ct-consent` on `/contact`** - the consent checkbox, where the *visitor* is the speaker
   ("I consent to ByteLite LLC contacting me"). Rewriting that into third person would make the
   consent statement worse, not better.

Anywhere else, first-person singular is a regression and the suite fails.

**Why this is law and not taste.** Licensing terms, refunds, subscription obligations and support
are commitments of an LLC. Copy that says "I will remove you", "there is nothing here for me to
hold onto" or "I am not going to sell you" reads as a personal undertaking by a named individual,
which is both a weaker commercial position and a different legal one. The founder note keeps the
personal accountability that made the previous voice worth having; the rest of the site stops
borrowing it.

**Founder-led is stated, never staged.** Company voice does not license inventing a team,
departments, employees, customers or resources. `/about` and the homepage say plainly that
ByteLite LLC is founder-led in Helena, Montana.

**Banned from every public page**, all asserted by test: `Ask me something hard`, `Talk to Tash`
as the primary corporate CTA, `nothing here is finished`, the committee phrases (`canonical
project status`, `mechanism clarification`, `eligible source file`, `scaffold-assisted proof`) and
startup filler (`revolutionary`, `disruptive`, `game-changing`, `world-changing`,
`industry-leading`, `next-generation`, `breakthrough`).

**Qualification is centralized.** Status lives in ONE block on the homepage, rendered from
`HOMEPAGE_STATUS` in `src/data/bytelite.ts`, and in full on `/validation`. Do not re-scatter
warning blocks across every section of every page; that is what buried the technology under its
own disclaimer last time. Honest failure statements on `/validation` are a different thing and
stay.

**Lead with the claim, qualify after.** "ByteLite is deterministic recursive compression built
from the structure of the file itself" comes first; "the automatic encoder is the work now" comes
second. Never the reverse.

---

## 18. THE HISTORICAL PROTOTYPE RESULT

**Status: APPROVED and PUBLISHED, 2026-08-31, by written owner decision.**

The prototype sentence is live on `/` and `/validation`. The sub-64-byte objective is **still not
published** - the approval covered the prototype result only. See "What was NOT approved" below.

This section keeps the refusal that preceded the approval. That history is not decoration: it
records what the claim was checked against, and it is the reason the exception in section 2 is
narrow rather than a general licence to publish figures.

### The approved wording

> An earlier internal Python prototype demonstrated exact lossless reconstruction after reducing
> a one-terabyte test input to approximately four hundred kilobytes.

Canonical source: `HISTORICAL_PROTOTYPE_RESULT` in `src/data/bytelite.ts`. Never retype it into a
page; import it. `HISTORICAL_PROTOTYPE_SCOPE` must accompany it at every placement.

**Placements are closed at two:** the homepage status block and `/validation`'s historical-vs-
current section. `/about` was offered as an optional third and **declined** - the owner's
instruction allowed it "only if it improves the company timeline without repetition", and a third
verbatim restatement is repetition. A test asserts the sentence appears on those two routes and
on no other public route.

**Five things may never happen to this sentence**, all asserted by
`public-scope-vocabulary.spec.ts`:

1. attributing the result to the current C++ implementation;
2. describing it as independent validation, or as verified by anyone outside ByteLite LLC;
3. adding invented supporting detail - input identity, date, runtime, hardware, throughput,
   numeric ratio, reviewer, or artifact. **None of these exists.** The owner's instruction
   forbade inventing them, and the absence is deliberate, not an oversight to be filled in later;
4. weakening it into a hypothesis ("explored", "may have demonstrated", "a research objective");
5. restating it on a third page.

### What was NOT approved

The same brief also asked for "complete self-contained representations below sixty-four bytes" as
the current engineering objective. **That is not published and remains blocked.** The owner's
approval named the prototype sentence and only the prototype sentence. Written as a current
capability it would present a target as a completed proof, which section 2 still forbids. Do not
add it without its own written decision.

### The refusal this replaced, kept as the record

Before the owner's decision, the claim was withheld for two independent reasons:

1. **Section 2 forbids it directly.** "Never state a compression ratio as achieved" is not
   scoped to one example figure - 1TB to 400KB is a compression ratio stated as achieved, and it
   is roughly 2.6 million to one. The same section forbids presenting a target as a completed
   proof, which "driving representations below sixty-four bytes" does if written as a current
   capability.
2. **No artifact in this repository supports either statement.** There is no test output, QA
   record, dated evidence file or commit anchoring a Python prototype run, a one-terabyte dataset,
   a 400KB output or a 64-byte threshold. `PROVEN` in `src/data/bytelite.ts` says the opposite:
   "A specific compression ratio. No public ratio is claimed."

Publishing it would also contradict `/validation`'s standing statement that none of the work has
been independently verified, because a figure of that size invites exactly the third-party
scrutiny the site says has not happened.

### How the four conditions were settled

The refusal listed four conditions for publication. Three were met and one was overridden by the
owner, which is recorded here rather than quietly dropped:

| Condition | Outcome |
|---|---|
| Section 2's no-ratio rule amended in writing, and section 2 edited to say so | **Met.** The owner approved in writing; section 2 now carries the narrow exception explicitly. |
| A public-safe evidence artifact in `qa/` naming the build, dataset and date | **Overridden by the owner.** The instruction was "do not invent the input identity, test date, runtime, hardware, throughput, comparison ratio, reviewer, or supporting artifact." No artifact exists and none was fabricated to satisfy this condition. The claim is therefore published as a **company-reported historical statement**, and the site says so. |
| Wording separates the historical Python demonstration from the current C++ encoder | **Met.** `/validation` renders them as two columns that may not borrow each other's state, and the homepage carries the scope line beside the result. |
| The claim ladder updated in the same pass so the pages cannot disagree | **Met.** `NOT_PROVEN` said "A specific compression ratio. No public ratio is claimed", which the approval made false. It now reads that the current C++ implementation has not reproduced the result. A test asserts the old line is gone. |

The overridden condition is the one a future reader should weigh. **There is no artifact behind
this figure in this repository.** It rests on the owner's own statement, published in the owner's
own company voice, and that is exactly how the site frames it. If an artifact ever does exist,
add it to `qa/` and link it - do not invent one, and do not let the absence of one become an
argument for quietly deleting the sentence either. It was published deliberately.

---

## 19. THE LIVE DEEP KORE CHAT

**Added 2026-09-01 by written owner instruction.** This section is the record for a change that
reverses part of section 1 rule 3, so it states what changed, what did not, and why the reversal
is bounded rather than general.

### What the owner authorised

A **live** public Deep Kore chat at `/deep-kore`: real cognition from the real engine, reached
through this site's own server, with no simulated chatbot, no hosted model, and no fallback of
any kind. The authorising instruction set the authority order explicitly - that instruction and
newer owner instructions first, then verified production code and tests, then current canon, then
older planning documents as historical evidence only - and stated that an older `CLAUDE.md` does
not override the task merely by declaring itself authoritative. That is what settled the rule 3
conflict; this section records the resolution so it is not re-litigated.

### What changed, and what did not

**Changed.** Five names became route-scoped instead of banned outright, in two tiers that carry
different weight.

**The product name, `Deep Kore`,** is what the site must be able to say when it has to identify
what it is talking about. It appears in the content of `/deep-kore`; in the header and footer,
because a navigation link has to name its destination; and on `/privacy` and `/terms`, because a
privacy policy that will not name the service it is describing is a worse privacy policy. Nowhere
else.

**The identity and governance vocabulary - `AIya`, `AIon`, `Genesis Goalkeeper`, `Revelation
Vanguard`** - has no such need and gets no such latitude. It appears in the content of
`/deep-kore` and nowhere else at all, chrome and legal pages included. A separate test asserts
that on every route, so neither exception can become the crack the rest of the vocabulary leaks
through.

The alternatives were both worse: an unnamed nav link is a site that will not say where its own
link goes, and a privacy policy describing "a service" is one a reader cannot check.

**Not changed.** Everything else in rule 3. ByteSight, ByteOracle, ByteFlow, ByteCost,
KoreLattice, HeartStrings and the Cordel misspellings stay off every public surface including
`/deep-kore`. The internal mechanism vocabulary of section 3 also stays off every public surface
**including `/deep-kore`** - naming a governance boundary is not permission to describe it.

`public-scope-vocabulary.spec.ts` enforces the distinction with two lists rather than one, so the
ban is narrowed by a boundary and not weakened by deletion.

### The IP boundary on this page

The page may say **what** the system does. It may never say **how**.

Publishable: that it is deterministic; that responses are resolved from structure rather than
sampled; that every turn passes Genesis Goalkeeper on the way in and again before emission; that
Revelation Vanguard runs strictly afterwards, cannot change what a response says and cannot turn
a refusal into an answer; that each response carries a governance stamp.

**Never publishable, on this page or any other:** what either layer evaluates, its rules,
thresholds, ordering internals, decision vocabulary, or anything a reader could use to route
around it. The engine's typed diagnostics never cross to the browser at all - see the projection
rule below. Canonical copy is `src/data/deep-kore.ts`; import it, never restate it in the page.

### The architecture, and why it is shaped this way

```
visitor browser
  -> www.thebytelite.com  /api/deep-kore/*        (Vercel Function, this repository)
  -> protected Deep Kore origin                   (Cloudflare Access + bearer)
  -> deep_kore_gateway                            (loopback HttpListener, .NET 8)
  -> dk_session_worker                            (one process per session, DKW1 stdio)
  -> governance::process_governed_turn()          (Genesis -> cognition -> emission -> Vanguard)
```

**The browser never addresses the Deep Kore origin.** Its address and both credentials exist only
in `api/_lib/deep-kore-core.ts`, in one function, on the server.

**Cognition is asynchronous to the request, and this is the load-bearing decision.** Submitting a
turn answers `202` with a job id; the turn runs to intrinsic completion in the origin's own
process; the page polls `/api/deep-kore/result/[jobId]`. Nothing about a Vercel request duration,
a fetch deadline or a browser tab is therefore a stopping condition for the engine. The 10-second
bound in `HOP_TIMEOUT_MS` bounds **one HTTP hop** so a stalled origin cannot pin a compute slot;
it does not bound a turn. There is no attempt ceiling on polling either. The visitor may stop
**waiting** - the page says plainly that the turn is still running when they do.

**`queued`, `running`, `succeeded` and `failed` are TRANSPORT states owned by the gateway.** Deep
Kore has no nonterminal conversational state: `process_governed_turn()` is synchronous and total,
so cognition is complete the moment it returns. Never present a transport state as an engine
state, and never invent an engine state to fill a gap.

### Fail closed, and never fall back

- `DEEP_KORE_CHAT_PHASE` maps anything unset or misspelled to `disabled`, exactly as
  `COMMERCE_PHASE` does. A typo must never fail open into a live public surface.
- A phase that is on but incompletely configured is a `503` that does nothing.
- **There is no fallback and there must never be one.** No local model, no hosted model, no
  cached turn, no scripted FAQ, no website copy standing in for a response. If the engine cannot
  be reached the page says so.
- **A refusal carries a machine code and no prose.** `{"error_code": "..."}` and nothing else -
  no message field, anywhere, on any failure path. A transport failure that renders like prose is
  indistinguishable from a fabricated answer, so it is made structurally unrenderable instead of
  merely discouraged. The UI maps codes to its own copy and displays them **outside** the
  transcript, in a distinct alert region.
- A `succeeded` job whose engine result cannot be read is a `502`, not an answer.

### What crosses to the browser

`toPublicTurn()` projects the engine result to exactly `{ text, persona, governance: { passed,
stamp } }`. Everything else is withheld: `gk1_decision`, `gk2_decision`, `transform_count`,
`state_hash`, `warmed_text`, `vanguard_enabled`, `vanguard_diag`,
`adult_consent_invariant_violated`, and every typed classification. Those are governance
internals, which section 3 forbids publishing.

**The stamp itself is redacted, and it has to be.** Withholding the `state_hash` FIELD was not
enough: the stamp is a pipe-delimited string that carries the state fingerprint inside it, along
with the policy and capability vocabulary. Measured against the live engine on 2026-09-01, a real
stamp read

```
GOV_STAMP|gk=pass|iters=0|state_hash=<hex>|policy=<...>|caps=<...>|dm_stamp=|persona=AIYA
```

so showing it verbatim published exactly what the projection beside it was removing. This was
found by the live browser proof, not by reading the source, which is the argument for having that
proof at all. `publicStamp()` keeps `GOV_STAMP`, `gk` and `persona` and drops the rest. It is an
**allowlist**, for the same reason the sitemap is one: a segment added by a future engine change
must be withheld by default, not published by default. It is a **redaction, never a rewrite** -
every surviving segment is the engine's own bytes in the engine's own order - and the page's copy
says the rest of the stamp is internal rather than implying the whole thing is shown.

**Revelation Vanguard is reported, never imitated.** When the engine populated `warmed_text` and
says Vanguard was enabled, that is what was emitted and that is what is shown. When it is off -
the default, and the byte-identical certified path - the governed `text` is shown. This site never
enables it, never disables it, and never warms text of its own.

### Session lifecycle, decided 2026-09-01

There are exactly **two** authoritative ways a session ends, and a browser event is not
one of them.

**1. Explicit deletion.** "End and delete session" closes the session at the origin. The
origin's DELETE disposes the worker and **waits for the process to exit** before it
answers, and the page reports success only on that answer. A DELETE that never arrived
reports the failure and keeps the session, because claiming a conversation was discarded
when it was not is a false success about the one thing this page promises hardest.

**2. Terminal-idle reaping, at 30 minutes.** Owner-set
(`DEEP_KORE_SESSION_IDLE_SECONDS`, default 1800). A background sweep in the gateway ends
sessions nobody is coming back for - a crashed browser, a killed tab, a lost network,
none of which announce themselves, and each of which holds a worker PROCESS.

**Reaping is resource cleanup and can never become a cognition deadline.** This is
enforced structurally rather than promised in a comment:

- `Session.IsTerminallyIdle` checks for an active job FIRST and returns false if there
  is one, **at any window including zero**. The only code that ends a session refuses to
  consider a session that has cognition in flight.
- The idle clock does not run during a turn. It is restarted in `Complete` and `Fail` -
  the two places where cognition actually returns its own terminal result - so a turn
  that ran for an hour does not leave its session instantly reapable.
- Every authenticated request that resolves a session calls `Touch()`, so a visitor who
  is reading, thinking, or waiting for a slow answer is never mistaken for one who left.
- The clock is `Stopwatch`-based, not wall-clock: a clock adjustment cannot make a live
  session look hours idle.

`tests/live/deep-kore-session-lifecycle.spec.ts` proves it against a real gateway with
the window set to **zero** - the condition under which a session mid-turn would be reaped
on the very next sweep if that guard were missing. The turn completing is the proof.

**`pagehide` is not a deletion signal and must not be reinstated.** An earlier version
sent a DELETE on `pagehide`; it was removed by owner decision. It is wrong in both
directions at once: it fires on ordinary navigation, a reload and a back/forward-cache
suspend, so treating it as deletion destroys sessions still in use; and it does not fire
on a crash, so the case it existed for is the one case it cannot cover. A signal that is
unreliable when needed and destructive when not is worse than no signal. The same
reasoning rules out `sendBeacon`, `unload` and `visibilitychange`.

### Session, ephemerality and consent

- One `AIyaChildEngine` per session with an empty knowledge path, so durable knowledge writes are
  **structurally impossible on this path** rather than switched off by policy. The privacy copy
  says exactly that and must not be upgraded into a broader promise.
- One worker processes one turn at a time, so session order is deterministic.
- Ending the session disposes the worker. `pagehide` asks the server to discard it, so a session
  cannot outlive the page that owns it.
- A session with a turn still running is **not** torn down. Abandoning cognition midway is the
  arbitrary stopping rule the engine's completion law forbids; `DELETE` answers `409` instead.
- Conversation content is not persisted and no consent exists that would allow it. Do not add
  logging, transcripts, analytics or retention without a separate written owner decision and a
  retention policy.

**The chat disclosure is OWNER-APPROVED language with exactly one source.** Approved
2026-09-01. It lives in `PRIVACY_DISCLOSURE` in `src/data/deep-kore.ts` and is rendered verbatim
in two places - the `/deep-kore` privacy section and the `/privacy` live-chat section. **Never
paraphrase, split, soften or extend it in a page.** A promise made on the page and the policy
recording it must be the same words, so there is one constant and a test asserts both placements
match it exactly. If it needs to change, change it there, once.

Before it was published, every log was audited against the owner's list - prompts, responses,
cookies, session identifiers, bearer credentials, `GOV_STAMP`, `state_hash`, private engine
output. Two things were changed as a result, and both are load-bearing:

- The gateway's reaper logged the session id of each session it ended. It now logs a **count**.
  A session id in a log is a handle to a live conversation, and log files travel further than the
  process that wrote them.
- The gateway now **drains and discards** the worker's stderr instead of leaving the pipe unread.
  That closes a latent deadlock (an unread pipe fills and the writer blocks) and guarantees worker
  output has no path into any log, because nothing ever inspects it.

Everything else already logged types and variable names only. A unit test drives a complete
successful turn and asserts that nothing on that list reached any console channel.

The policy said the only value stored in a visitor's browser was their cookie-consent choice,
which the session cookies make false. Leaving that in place was never an option: the site would
have been describing a website it is not, which is the exact defect commit `0bbc3aa` fixed.

### Security rules specific to these routes

- `DEEP_KORE_SESSION_SECRET` was an addition to the authorising instruction's variable list and
  was **approved on 2026-09-01**. The reason it exists is structural: Vercel Functions are
  stateless between invocations, so the upstream session reference must ride with the browser.
  Without it the alternative is a browser-chosen session id, which is an account-takeover
  primitive. The approved contract:
  - the session id is server-generated, cryptographically random and opaque (the gateway's
    `Ids.New`, 24 bytes from `RandomNumberGenerator`);
  - the cookie is authenticated with HMAC-SHA256 under this secret alone;
  - the secret is **at least 32 random bytes**, generated for this purpose, and **derived from
    nothing else**. `invalidConfig()` refuses to serve if it is shorter than
    `MIN_SESSION_SECRET_LENGTH` or identical to the gateway token, either Access credential, or
    the Turnstile secret - the copy-paste mistake nothing else would catch;
  - it is never exposed to browser code, a response body, a source map, or a log. It has no
    `PUBLIC_` twin and must never gain one;
  - production **fails closed** when it is absent. There is no default, insecure or otherwise.

- **Cookies are host-only and `__Host-` prefixed.** `__Host-dk_session` (HttpOnly) and
  `__Host-dk_csrf`, both `Secure`, `SameSite=Strict`, `Path=/`, and with **no `Domain`
  attribute**. The prefix is not decoration: a browser refuses to store a `__Host-` cookie unless
  all three of those hold, so it enforces host-only scope on our behalf and nothing that can set a
  cookie for the registrable domain can shadow it. Unprefixed names are used only over plain http
  - local development - because `__Host-` requires `Secure`; the reader accepts either and
  prefers the prefixed form, and a deletion clears both. There is deliberately **no `Max-Age` and
  no `Expires`**: an absolute browser expiry would be a second lifetime that could contradict the
  origin's terminal-idle policy and strand a visitor mid-conversation. The authoritative lifetime
  is at the origin, where the session actually is.
- **The browser chooses a key-shaped thing and nothing else**: an identity key from a two-value
  allowlist, the message text, and an opaque `turn_key`. Never a message id, a job id, a session
  id, an origin, a persona off the allowlist, or any governance setting. The upstream message id
  is `HMAC(secret, session + turn_key)`, so a retry is idempotent while the id stays unforgeable
  and cannot collide across sessions.
- Three independent CSRF barriers: `application/json` only (which forces a preflight this route
  does not answer), `SameSite=Strict`, and a double-submit token in `X-DK-CSRF`.
- The job read sends the **verified** session in `X-DK-Session`; a browser-supplied value is
  ignored. The origin binds job to session as well, so a guessed job id is refused twice.
- **Never log a credential.** A thrown fetch error can carry the request, and this request carries
  both the Cloudflare Access service token and the gateway bearer, so every catch logs
  `err.name` only.
- No rate-limit counter was added, deliberately. Session creation is gated by something real -
  Turnstile in `public`, Cloudflare Access in `private_alpha` - and one active turn per session is
  structural. An invented requests-per-minute number would be an arbitrary limit dressed as
  security.
- **CSP.** `script-src` and `frame-src` gained `https://challenges.cloudflare.com`, and nothing
  else changed. Turnstile loads a script and renders an iframe; without both directives, setting a
  site key would produce a page broken in a way no static reading reveals. The chat itself needs
  no widening - it is same-origin and already covered by `connect-src 'self'`. **Removal
  condition:** if Turnstile is not adopted, remove both origins in the same commit that removes
  the widget.

### Owner gates still open on this feature

None of these may be resolved by assumption:

- the Deep Kore origin hostname and the loopback bind address;
- `DEEP_KORE_CHAT_PHASE` - it is `disabled` until the owner sets it;
- the Cloudflare Tunnel and the Cloudflare Access service token;
- the Turnstile site and secret keys;
- whether **AIon** is exposed on the public page. Both identities are implemented and proven
  through the same governed path; only AIya is rendered, because a second public identity is an
  owner decision, not a code decision;
- ~~whether Revelation Vanguard is enabled~~ - **CLOSED 2026-09-02 by owner decision: ON.**
  Vanguard is required on the public path. It is enabled in `dk_session_worker`'s own `main()`
  through the canonical in-process override (`vanguard::set_vanguard_override(1)`), deliberately
  **not** through the `AIYA_VANGUARD` environment variable, so the public path's warmth behaviour
  is a property of that binary rather than of whatever environment launched it - an env var can be
  absent, misspelled, or inherited differently by a service wrapper; a deliberate call cannot.
  It changes no governance: Vanguard is Phase 4 of `process_governed_turn`, strictly after GK-1,
  after GK-2 and after `GOV_STAMP` is computed, and it cannot reach around Genesis, alter `text`,
  alter the stamp, or turn a refusal into an answer. It **does** move the determinism baseline -
  emitted bytes differ from the Vanguard-off path - which is why the public baseline must be
  measured with it ON;
- where the gateway, worker and teaching broker are installed and how they are supervised on
  Windows;
- **whether the public page should gain a surface on which a visitor describes an entity.** Added
  2026-09-04. It is what would make the TAV decision surface reachable by a visitor at all - see
  "THE TAV SEAM" below and `OWNER_README.md` section 21.14 - and it is a product decision with its
  own privacy and consent consequences, not a code decision;
- **owner and counsel approval of the live-chat section drafted into `/terms`** on 2026-09-04;
- **the value of `DEEP_KORE_MAX_SESSIONS`.** The contract is implemented and proven; the number is
  not set and must not be. `OWNER_README.md` section 21.11 carries the measurements taken on this
  machine so the owner can choose one.

**Closed on 2026-09-01**, and recorded here so they are not reopened by assumption: the session
secret (approved, with the contract above), the privacy wording (approved, verbatim, single
source), the session lifetime and reaping policy (30-minute terminal idle, implemented in the
gateway and proven against it), and the capacity *contract* (implemented and proven; the *value*
remains open, immediately above).

### Capacity law, decided 2026-09-01

Reaping bounds how LONG a session holds a process. `DEEP_KORE_MAX_SESSIONS` bounds HOW MANY exist
at once. Both are needed; neither substitutes for the other.

**The number is the owner's and is never guessed.** There is **no production default**, and the
gateway refuses to start without a value - missing, zero, negative, malformed or overflowing all
stop startup. It must not be derived from processor count, installed memory, a formula, or the
**46 concurrent workers** a leaking test suite once produced. The phase stays `disabled` until the
owner supplies a measured value. Tests inject a tiny ceiling to exercise the contract; there is no
code path by which that becomes a production fallback, because there is no fallback path at all.

**A correction, recorded because the mistake is instructive.** That 46-worker incident was first
written up here as the machine's capacity ceiling being reached. **It was not, and the claim was
withdrawn on measurement.** A worker holds about 5 MB of working set, under 1 MB private, and four
threads - Debug and Release within half a megabyte of each other - so 46 of them is roughly 270 MB
and 184 mostly-idle threads on a 32 GB, 12-logical-processor machine. That is nowhere near a
limit. The leak was a real test defect and fixing it was right; the *cause* attributed to the
failure that followed it was asserted, not proven, and is now unknown. The measurements are in
`OWNER_README.md` section 21.11.

The general rule this illustrates is already section 2's: a number that was observed during a
failure is not thereby a measurement of a limit. Do not let it become one by repetition.

**Admission is atomic, and decided before any resource is committed.**

- The ceiling counts **simultaneously owned sessions**, never completed requests or historical
  totals.
- A slot is reserved by compare-and-swap, so simultaneous creations cannot both pass the last
  slot. A read-then-increment would let them, and the host would quietly own one more session
  than it was configured for.
- The reservation happens **before** a worker is spawned. Refusing afterwards would mean killing
  something that already exists.
- A slot is released only when the worker has **actually closed** - by explicit deletion or by
  terminal-idle reaping - and on the failure path where a reserved slot never became a worker at
  all. Without that last release, every failed engine start would shrink capacity by one
  permanently, and the host would become unable to serve anyone with nothing looking wrong.
- **Nothing is evicted to make room.** Sessions already running keep running, active cognition is
  never ended for capacity, no queue forms, and no retry is attempted on the caller's behalf.

**Capacity and outage are different facts and never share a code.** Both are `503`, because both
mean "not now"; only the code distinguishes them:

| Situation | Public code |
|---|---|
| Every configured slot is owned | `DEEP_KORE_SESSION_CAPACITY` |
| The service is unreachable or will not start a worker | `DEEP_KORE_UNAVAILABLE` |

A full service described as an outage sends an operator hunting a fault that does not exist, and
tells a visitor the wrong thing about whether coming back will help. The approved public wording
for each lives in `ERROR_COPY` in `src/data/deep-kore.ts`.

**The server sends only a code, with no prose - confirmed by the owner on 2026-09-01.** The
approved sentences are rendered by the page from the code. A refusal that carries a sentence is a
refusal that can be mistaken for something Deep Kore said, and "no text field at all" is checkable
in a way "only approved text" is not. **Do not add a message, detail, hint or text field to a
transport refusal, and do not add `Retry-After`** - there is no queue and no automatic retry, so
there is nothing to schedule.

**The code set is CLOSED, and the message mapping is exhaustive at compile time.**
`api/_lib/deep-kore-codes.ts` holds the union. It is a dependency-free module precisely so the
browser can share it without importing the server core, which pulls in `node:crypto` and fails the
client bundle. `ERROR_COPY` in `src/data/deep-kore.ts` is typed `Record<DeepKoreErrorCode, string>`,
so a code with no approved sentence fails the TypeScript build rather than showing a visitor a
blank box - introducing the union immediately caught four codes that had none. The page checks
membership with `isErrorCode` before rendering, so an unrecognised value is never looked up and
never echoed.

**No upstream string is ever forwarded.** The failed-job branch used to pass the origin's own
`error_code` straight to the browser, which made an arbitrary upstream string part of this site's
public surface - and one family of those codes (`worker_<code>`) is open-ended by construction, so
no allowlist could ever have stayed complete. It now collapses to the single closed code
`turn_failed`. What a visitor can act on is identical in every case - the turn produced nothing -
and the diagnostic detail stays where it is useful: the origin's own log.

**A refusal discloses nothing about the host** - not the ceiling, not how many slots are owned,
not the machine. A refused visitor learns the service is full, and nothing else.

Until each is closed the feature stays off at the server, not merely hidden in the page.

### Teaching-queue law for the public path, decided 2026-09-03

**Queue admission and canonical knowledge promotion are two completely separate events, and the
public path can only ever cause the first.** A visitor who consents authorises **storage only**. It
establishes no truth, no authority, no correctness and no permission to activate the concept.

Every public submission enters the queue as `UNVERIFIED_CANDIDATE`, from source class
`PUBLIC_CHAT_UNTRUSTED`, in review state `AWAITING_OWNER_REVIEW`. The broker refuses any other
value for those three fields, at the last gate before a durable write. **Public chat never
promotes, merges, activates or teaches a candidate into canonical knowledge** - only the
owner-driven event kinds, through the Workbench, can move a case toward knowledge.

**What a queue record carries** - and it is a short list, because it is a minimum: the target
concept's own identity; the complete canonical sorted candidate-ID sequence (which IS
`structural_identity_key`, stored whole); the snapshot identity that "unknown" was relative to; the
Genesis admission result; the consent result and consent-policy version; the source class; the
schema version; creation and review state; the sequence length; and applicable Tesseract anchors.

**What it must never carry**, and does not, because the record has nowhere to put it: the
conversation, the message text, the governed response, personal identifiers, addresses, browser
fingerprints, cookies, session secrets, disclosed private values, raw TAV disclosures, elimination
traces, or governance projections. Raw surface text is transient session state and dies with the
session - `original_surface` is written **empty** on this path, and a test asserts the visitor's
own message is absent from the serialized record.

**The canonical sequence is never trimmed, sampled, reordered or partially stored.** It is measured
at 710,219 bytes for a real 35,494-entry candidate. `teaching_case_id` is its SHA-256 and is a
deterministic **index** - never a replacement for the sequence, and never treated as collision-free
proof of identity. A record that will not fit the admission ceiling is refused **before any durable
write**; it is never truncated to fit, because truncating the sequence would silently corrupt the
existing deduplication law.

**Two settings are required and neither has a default:** `DEEP_KORE_MAX_SESSIONS` (the gateway) and
`DEEP_KORE_TEACHING_MAX_RECORD_BYTES` (the broker). Both refuse to start when absent, zero,
malformed or overflowing. See `OWNER_README.md` 21.11b and 21.11c for the measurements behind each.

**"Unknown" means unknown relative to the frozen snapshot used for that turn**, decided by the
canonical unknown-lexeme extractor plus Law L1's `resolve_lexical_denotation()`. A surface is never
called unknown merely because one sense identifier did not match, and a known word whose senses did
not narrow is a sense-selection gap that raises no offer. Classification finishes before any offer
is presented.

**Consent is explicit, specific to one candidate, requested only after classification, denied by
default, non-reusable, and revocable until the durable write completes.** A refusal creates no
candidate and retains no refused value. A `DENIED_BY_USER` disclosure carrying a value is refused
outright, as the canonical strict parser refuses it.

### The website's own boundary, decided 2026-09-04

**There is exactly ONE place this website talks to Deep Kore**, and it is
`src/components/deep-kore/deepKoreClient.ts`. Nothing outside it knows the shape of a wire
response: no status code, no header, no cookie, no raw JSON, no unrecognised discriminant. The
console consumes a typed application model and nothing else.

This is not tidiness. The origin's contract is the volatile half of this system - it gains
outcomes, its envelope grows fields, its vocabulary changes on its own schedule - so every
assumption about it belongs in one file that one person can read. `fetch` calls scattered through
components are what make a boundary impossible to audit later, and this one has to be auditable:
it is the line a private value must never cross.

**The adapter never interprets.** It does not summarise, re-word, complete, cache or retry, and it
has no fallback. A transport failure is returned AS a typed transport failure, so the interface
cannot render it as something Deep Kore said. It never invents a field: if the origin did not send
it, it does not exist there.

**The closed result union is now enforced in both directions at compile time.**
`api/_lib/deep-kore-codes.ts` holds `RESULT_KINDS` - the browser-shareable module, because it has
no imports and the client bundle cannot take `node:crypto`. The server declares
`PublicResultKindsAreExhaustive` and the client declares `ClientCoversEveryResultKind`; both use
`MustBeTrue<Exhaustive<...>>`, which resolves to an object type naming the offending member on a
mismatch, so the compiler reports it. The console's switch then ends in a `never` binding.

The pairing is the point: **a new engine outcome either gets a deliberate public state on both
sides, or the build stops.** It can never reach a visitor as an unlabelled answer.

### Four more refusals at the request boundary, added 2026-09-04

1. **The body schema is an ALLOWLIST, and an unknown key is refused rather than dropped.**
   `SESSION_BODY_KEYS`, `MESSAGE_BODY_KEYS` and `CONSENT_BODY_KEYS` are the complete public write
   surface of this feature. Ignoring an unexpected field lets a caller believe it transmitted
   something it did not, and makes the absence of a field a habit rather than a guarantee - the
   same argument that already made a disclosure carrying a `value` a refusal instead of a strip.
   The device envelope is checked the same way **at every level**, which is what now refuses
   `description` and `temporal` on a message rather than quietly discarding them.

2. **A fourth CSRF barrier: the request must claim to come from where it arrived.** When an
   `Origin` header is present it is compared against the request's own forwarded `Host`. It is
   deliberately NOT compared against a configured hostname: this site is served on its production
   domain, on project aliases and on localhost, and a check keyed to a variable somebody has to
   remember to set is a check that fails open on the day they forget. An absent `Origin` is not a
   failure - browsers omit it - and the other three barriers still stand.

3. **A retry is a thing the VISITOR presses, and only where one could work.** It is offered solely
   after a request that never completed, which the adapter reports as status 0. A refusal the
   server chose to send would refuse identically a second time, and a retry control beside it
   would invite pressing a button that cannot work. **Nothing retries on its own**, anywhere: an
   automatic retry after transport loss would be this page deciding, unasked, to send someone's
   message a second time.

4. **`Stop waiting` aborts this browser's poll and nothing else.** It cancels no turn: cognition
   runs in the origin's own process and has no idea a browser was watching. The page says so.

### "Why this response?" - what may be shown, and what does not exist

The governance record moved into a closed disclosure beside each response. A visitor reading a
conversation should not have a stamp under every sentence; one who wants it should not have to ask
anyone.

Inside it is **only what the response actually arrived with**: whether the emission gate passed,
and the redacted stamp. **Deep Kore returns no source list, no confidence score, no reasoning
trace and no provenance on this path**, so none is shown - and the disclosure says that outright
rather than leaving the absence to be read as an oversight.

**The complete public wire contract is five outcome values** - `ANSWER`, `TAV_REQUIRED`,
`TEACHING_OFFER`, `REFUSAL`, `ENGINE_FAILURE` - plus the governed envelope, the TAV request, the
teaching offer and a failure code. There is **no `resolution` field on the wire**:
`last_resolution_` exists inside `public_chat_session.hpp` and is not serialized. A website state
named RESOLVED, AMBIGUOUS, UNKNOWN, CONTRADICTORY, UNSUPPORTED or WAITING_FOR_RESEARCH would
therefore be this site inventing a distinction the engine did not send. **Do not build one.**

`teaching_offer.classification` IS on the wire and is deliberately **not read**: it is the engine's
own decision vocabulary, which section 3 forbids publishing. The worker already derives a safe
`description` from it, and that is what a visitor sees.

The full contract, as a cross-repository handoff, is `OWNER_README.md` section 21.13.

### THE TAV SEAM - measured 2026-09-04, and an open owner decision

```
"List the parts of a zqxjvwkbrump."                     -> outcome = TEACHING_OFFER
the same text plus a device entity model                -> outcome = TAV_REQUIRED
```

`generate_tav_request` needs the target entity to resolve to exactly one `StructuralEntityKind`,
and the only evidence that can do that comes from the **device** - `relationship_role` on an entity
the message references. A Cordel device holds that model. **A public web page does not, and must
not invent one:** fabricating a `relationship_role` for a stranger is inventing TAV evidence.

So, stated exactly:

- the TAV interface is implemented and correct, and every rule about it is asserted against a
  scripted `TAV_REQUEST` in `tests/e2e/deep-kore-console-flow.spec.ts` on five browser engines;
- **it is not reachable by a visitor today**, and the live specs now assert that seam directly so
  it cannot be forgotten or quietly "fixed" by making the page assert an entity it does not know;
- whether the public page gains a surface on which a visitor describes an entity is an **owner
  decision**, recorded in `OWNER_README.md` section 21.14. It would be a new public surface with
  its own privacy and consent consequences.

### The privacy policy and the terms both moved

`/privacy` gained the vault, the review queue, the transcript's lifetime, and the separation of
consents. `/terms` gained a live-chat section - what the chat is for, what it is not, what each
consent does and does not do, and that availability is not guaranteed. **That wording is a local
draft and still requires owner and counsel approval before the phase is enabled.**

Both state, and the system must keep true, that: the transcript lives only in the page; a private
value never leaves the tab; a consented candidate enters a review queue and never knowledge; and
conversation content is joined to no Stripe, founder, supporter or contact record.

### The live lane can now be run

`scripts/deep-kore-live-harness.mjs` serves the built site AND the real `/api/deep-kore/*`
handlers, so the live specs can run against a local gateway without a deployment. It loads the
same handler modules Vercel loads - it is not a mock, and reimplementing any of the request path
there would make a pass prove nothing. It is deliberately not a Playwright `webServer`: the stack
spans two processes in another repository, and starting one automatically would let a run against
an absent gateway read as a product defect. See `OWNER_README.md` section 21.8a.

**A live spec that does not release its session is a defect, not untidiness.** Every session owns a
worker process and the host has a ceiling; once it is reached, every remaining test fails at
session creation looking exactly like an outage. Both live specs now release in an `afterEach`, and
the release waits out a `409` rather than giving up on it - a session with a turn in flight refuses
deletion, which is correct, so cleanup has to wait for the turn rather than leak the session it
came to release.

### Verification that must not be skipped

The chat control is rendered unconditionally and the **server** decides whether a session can be
created. That is deliberate: gating the control on a build-time variable would let the built HTML
claim something the runtime contradicts, which is the failure mode section 7 rule 10 exists to
prevent. It also means a `/deep-kore` page that looks fine proves nothing about the engine - the
proof is a real session against the real worker, not a page that rendered.
