# BYTELITE LLC WEBSITE CANONICAL LAW

Read this file before touching this repository. It is law, not a diary. It states what is
true, what may be said, and what must never be done.

If this file and any other document in this repository disagree, this file wins.
If this file and observed reality disagree, verify reality and correct this file.

ASCII only in this file. No emoji, no smart quotes, no box-drawing characters.

**This repository is PUBLIC.** Nothing that section 3 forbids publishing may be written into any
file here, including this one, commit messages, tests and documentation.

---

## 0. WHAT THIS REPOSITORY IS

The public website of **ByteLite LLC**, an independent computing research and development
company, served at `https://www.thebytelite.com`. Astro 5 static build, TypeScript strict mode,
Vercel Functions in `api/` for contact and the (disabled) commerce surface.

Rewritten 2026-10-20 by owner directive from a ByteLite-only site into a company website. The
data representation research (the original ByteLite program) remains a central program but no
longer stands for the whole company.

It is not a research system, not a demonstration of one, and not connected to any private
research repository. Nothing in this repository may fetch from, embed or describe a private
research system.

---

## 1. PUBLIC SCOPE AND NAMING

**Discoverable (sitemap allowlist `DISCOVERABLE_ROUTES` in `astro.config.mjs`):**

`/` . `/research` . `/research/machine-cognition` . `/research/data-representation` .
`/research/visual-and-audio` . `/research/milestones` . `/research/approaches-to-ai` .
`/validation` . `/products` . `/compatibility-app` . `/cordel-play` . `/founder-access` .
`/support` . `/licensing` . `/about` . `/contact` . `/privacy` . `/terms`

**Resolvable, not discoverable (`noindex`):** `/checkout/success`, `/checkout/cancel`,
`/billing`, `/responsible-disclosure`, `/404`.

**Withdrawn:** `/preorder-terms`, `/supporter-terms` (unreviewed drafts; 404; never link to
them). `/how-it-works` was replaced by `/research/data-representation` and now 301s there.

**Historical URLs** 301 to their real successor or return 410 from `api/gone.ts`. Every known
historical URL is listed in `tests/unit/route-disposition.test.ts`; no redirect or rewrite may
capture a canonical route, and that is tested.

**Naming rules:**

1. The machine cognition program is published only under a neutral descriptive name
   ("Machine Cognition", "Governed machine cognition"). Its internal engineering name, its
   provisional future brand, and the names of its internal architectures and governance layers
   are not published until the owner explicitly approves a public name.
2. Retired or superseded product and project names appear on no public surface. The list is kept
   privately and loaded by the disclosure tests (see below).
3. Consumer product display names live in exactly one place, `src/data/products.ts`. A product
   rename is a one-line change there. No page hardcodes a product name.
4. No page states or implies that any name is a registered trademark, or that any invention is
   patented or patent pending.

The disclosure tests (`tests/e2e/public-scope-vocabulary.spec.ts` and
`tests/unit/public-build-disclosure.test.ts`) scan rendered pages and every file of the built site.
Their term lists are private: set `BYTELITE_DISCLOSURE_DENYLIST` to the path of the owner's private
denylist file before running tests. The tests fail when it is not set. Never copy the list into this
repository.

---

## 2. CLAIM LAW

Implementation, testing, internal validation, independent verification, production
qualification and deployment are different things. Never collapse one into another.

- Every public status comes from `src/data/milestones.ts` using the vocabulary in
  `src/data/evidence-status.ts`. Pages render the manifest; they never restate a status.
- A milestone changes only through a separately approved evidence-status update. Internal source
  commits never advance a public milestone. No percentage-complete figures, ever.
- Every milestone states what is demonstrated, what is not, the next observable result and its
  last review date. Neither list may be empty (tested).
- **Data representation:** no lossless method can make every possible input smaller, so the site
  never claims universal reduction. The objective is exact, deterministic, fully accounted
  representation that is smaller where the data and the complete representation permit it. Net
  size reduction has not been demonstrated and the site says so. No compression ratio, saving or
  benchmark result is stated.
- **Machine cognition:** the site does not claim that the full system works, that it reasons in
  general, AGI or superintelligence, solved alignment, or completed self-construction. It says
  plainly that the full chain has not been demonstrated end to end and that governance is not
  complete. No live or simulated demonstration is published.
- **Comparisons with mainstream AI** describe differences in priorities, cite published sources,
  and contain no scores, rankings or superiority claims.
- No product is described as available, shipping or manufactured unless it is.

---

## 3. PUBLIC IP LAW

The site may say WHAT a program intends to achieve and how results are judged. It may never say
HOW any system works internally.

Never publish, in any file of this repository or the built site: source code of research
systems; algorithms; formulas or construction laws; internal format names or file extensions;
internal component, module or protocol names; dimensional, positional, alignment, dependency or
learning mechanics; governance enforcement mechanics; unresolved trust-boundary or security
findings; internal test fixtures, corpora, snapshots or unpublished benchmarks; private
repository paths, hostnames, machine configuration or commit references; private funding or
investor material.

A high-level statement is not safe merely because it contains no code. Consider whether it
discloses a novel combination of methods, a mechanism or enough structure to aid replication.

Every diagram is a component that carries a classification from
`src/data/figure-classification.ts`: conceptual illustration, actual validated system output,
product concept rendering, or physical product photograph. A conceptual illustration is never
presented as system output.

Do not make the site more technical in order to make it more impressive.

---

## 4. WHAT THE RESEARCH IS NOT

Canonical boundary wording lives in `src/data/bytelite.ts` (`WHAT_IT_IS_NOT`) and on the machine
cognition page. State the boundary; never describe the replacement mechanism.

---

## 5. PRICING LAW

- No price appears on any public page (tested). The previously published personal prices are
  withheld pending owner confirmation, because no working product exists to price.
- Proposed business model, in words only: 50% of verified qualifying savings to ByteLite LLC, 50%
  retained by the customer; no verified saving means no fee for that saving. It is a split of
  measured savings, never "costs fall by half".
- Never put a currency figure on a public page that did not come from a measured result or an
  owner-approved price.
- The founder benefit is exactly two things, never combined: **10% lower founder price** and
  **10% additional qualifying entitlement**. Nothing in this repository computes a founder price.
  The meaning of the additional 10% stays undefined until the owner sets it
  (`FOUNDER_ENTITLEMENT_UNDEFINED_NOTE`).
- Nothing on this site offers or solicits an investment or a security.

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
12. **Confirm the deployment topology before every push to `main`.** Check which project and
    account hold the custom domains and which projects build from this repository.

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

**`POST /api/contact` is no longer the only server-side route** - see section 15. The routes that
exist are `contact`, `checkout`, `checkout-session`, `stripe-webhook` and `gone`, and that list is
closed. The original rule survives in its important half: **do not add any diagnostic endpoint
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
parts separately (record kept privately by the owner). Mail path is SendGrid ->
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

Modules under `src/data/` are the single source of truth for anything the site asserts. Never
restate one of these facts inline in a page - import it, so it cannot drift.

| Module | Owns |
|---|---|
| `src/data/company.ts` | Company identity and dates. `RESEARCH_BEGAN_YEAR` (2024) and `LEGAL_FORMATION_YEAR` (2025) are never collapsed into one "founded" year |
| `src/data/evidence-status.ts` | The status vocabulary and its definitions |
| `src/data/milestones.ts` | Every public milestone and the update policy |
| `src/data/research-programs.ts` | The published research programs |
| `src/data/products.ts` | Consumer product names, availability and what does and does not exist |
| `src/data/commerce.ts` | Founder cards, founder benefits, Supporter Pack disclosure, build-time commerce phase |
| `src/data/bytelite.ts` | Data representation objective, counting-limit statement, principles and boundaries |
| `src/data/ai-approaches.ts` | The mainstream-AI comparison and its external sources |
| `src/data/navigation.ts` | Header and footer navigation |

**Public evidence rule:** no commit ids, local paths, drive letters, hostnames, build locations or
branch names appear on a public page.

---

## 11. DIAGRAMS AND IMAGES

Diagrams are HTML components in `src/components/site/`, wrapped in `ClassifiedFigure`, so their
meaning survives zoom, reflow and screen readers and every one carries its classification.

Only images the site actually requests are kept in `public/`. Product images are concept
renderings and are labelled as such; there is no product photography because nothing has been
manufactured. Every image has alt text and intrinsic width and height. No screenshot of internal
tooling is published.

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

If uncertain: keep it and record it as UNKNOWN in the owner's private operations notes section 16.

Edit files in place. Do not rename source files. Do not add new source files unless asked.

---

## 13. IMPORTANT CONTEXT

- Founder: Tash Broadwater, Helena MT. Solo-founder LLC.
- Patent and trademark status is not stated anywhere on the site. Any such statement requires
  owner and legal approval first.
- Research pages state objectives and evidence; they never state capability beyond the
  milestone record.

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
procedure, and the current open blockers live in `the owner's private operations notes`.**

Last reviewed against reality: 2026-08-25, against commit `8ea2de6` serving production
(deployment `dpl_8SvCeGwcFguaxy1aMmQD2bGDPi7T`).

The custom-domain cutover is closed and contact delivery is proven to the mailbox; the runtime
evidence is kept privately by the owner, taken against `https://www.thebytelite.com`
serving commit `0e5ffab`. A security and dependency hardening pass followed
(`2c348d6..5a73c76`): all seven security headers are now served from `vercel.json`, the contact
route requires `application/json` and bounds its provider call, and the rate-limit key no longer
trusts a caller-supplied header.

Verified live at `8ea2de6`: 200 on `www`, 308 from the apex, 404 on the deleted probe, 405 on
`GET /api/contact`, 415 on a non-JSON POST, 400 on an invalid JSON POST.

**WEBSITE_ACTIVE_DEVELOPMENT=REOPENED 2026-08-26** for the owner-authorised canon rebuild
(Cordel public scope, founder voice, IP-safe graphics, Stripe test-mode commerce). The freeze in the
earlier handoff record is superseded for this work only; everything that
document says about DNS, hosting, the superseded Vercel path and contact delivery stands.

---

## 15. COMMERCE LAW

**Live financial transactions require owner authorization in code.** `LIVE_FINANCIAL_TRANSACTIONS_OWNER_AUTHORIZED`
in `api/_lib/commerce-core.ts` is `false`. While it is false, the `live` phase refuses every plan and no live
Stripe key is accepted in any phase. Changing it is a reviewed code change made only on the owner's explicit
written authorization; no environment variable can substitute for it.

**A Stripe key must match its phase.** `getStripe()` refuses to construct a client unless
`stripeKeyPermittedForPhase()` allows the phase and key mode: no Stripe use while `disabled`; `test` and
`reservation` accept test keys only; `live` accepts a live key only with the code authorization above; an
unrecognised key shape is always refused. Checkout, session lookup and the webhook all go through `getStripe()`.

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

**`public/` is a published surface, and a URL is public whether or not a page links to it.**
It contains only what the built site requests: the logo and its two small marks, the social
preview image, two Cordel Play concept renderings, `robots.txt` and `site.webmanifest`. The
2026-10-20 rewrite removed the earlier brand graphics because their baked-in text no longer
matched the evidence; they remain in git history. `tests/unit/public-build-disclosure.test.ts`
fails if an unrequested top-level file is published.
Before adding a file to `public/`, ask whether a page requests it. If not, it does not belong here.

Open decisions that block activation, and which no agent may resolve by assumption:

- the rounded founder monthly and annual prices for ByteLite;
- the public monthly and annual prices for the compatibility application, and its public name;
- what "10% additional qualifying entitlement" is measured in, per product;
- whether founder reservations collect a payment method or contact details only;
- Cordel Play's price, shipment estimate, refund and delay-consent processes;
- the Supporter Pack's reward files and minimum amount;
- tax registrations and whether `STRIPE_AUTOMATIC_TAX_ENABLED` may become `true`;
- final legal approval of the drafts on `/preorder-terms` and `/supporter-terms`;
- the move from Stripe test mode to live mode;
- confirmation of the personal subscription prices before any price is shown again.

Until each is closed, the affected control stays disabled at the server, not merely hidden.
