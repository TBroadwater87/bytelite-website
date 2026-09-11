# ByteLite Website Owner Continuity README

This document exists so the owner can return in six months, with no chat history, and safely
resume. It is operational. The rules an agent must obey are in `CLAUDE.md`; read both.

ASCII only. No secret values appear in this file, and none ever should.

---

## 1. Read This First

**What this repository is.** The source of the public ByteLite website at
`https://www.thebytelite.com`. An Astro 5 static site with React 19 islands, plus exactly one
piece of server-side code: a Vercel Function at `POST /api/contact` that delivers contact-form
submissions through SendGrid.

**What the website is for.** Explaining ByteLite - what it is being built to do, what is proven
today, what is not proven, and how licensing would work - and letting someone get in touch.

**What it is NOT for.** It is not a portfolio site for ByteLite LLC's other research. It does
not name Deep Kore, ByteSight, ByteOracle, ByteFlow, ByteCost, AIya, Aion, Genesis Goalkeeper,
Revelation Vanguard, Cordel Connect or Cordel Play on any public page. Measured 2026-08-24, the
build emits **68 HTML pages: 8 are in the sitemap, `/404.html` is the error page, and the other
59 are served `noindex`.** Those 59 still return 200, but they are absent from the sitemap and
linked from nowhere. That is deliberate: old URLs keep working, and nothing leads a visitor
to them.

**Current hosting.** Vercel. Cloudflare provides DNS only. Cloudflare Pages was used
historically and is no longer part of this project.

**Where the source lives.** GitHub, `TBroadwater87/bytelite-website`, branch `main`.
**This repository is PUBLIC.** Anything committed is world-readable.

**Current production status.** The site is live on `https://www.thebytelite.com`, served by
`ByteLite_LLC/bytelite-website`. The contact form works end to end on the real domain: request
accepted, provider accepted, and message confirmed in the destination mailbox on 2026-08-25.

**Remaining blockers.** None that break anything. Section 17 lists four open items - absent
security headers, an oversized logo, DMARC reports going to an unmonitored address, and two
`_vercel` TXT records that cannot be classified from DNS. All are known, none is urgent.

---

## 2. Current Canonical Snapshot

Everything below was verified by direct observation on the date shown. It is a dated snapshot,
not a permanent truth. Re-verify with section 9.

```
LAST_VERIFIED_DATE=2026-08-25
LAST_VERIFIED_COMMIT=8ea2de6
PRODUCTION_BRANCH=main
PRODUCTION_HOST=Vercel
VERCEL_TEAM=ByteLite_LLC              (CLI scope slug: bytelitellc)
VERCEL_PROJECT=bytelite-website       (prj_XmNkNFp156U94VveZgoPuMHPfW6u)
CUSTOM_DOMAIN=www.thebytelite.com     (apex thebytelite.com 307-redirects to www)
GITHUB_REPOSITORY=TBroadwater87/bytelite-website   (PUBLIC)
DNS_PROVIDER=Cloudflare               (nameservers garrett/kim.ns.cloudflare.com)
OUTBOUND_EMAIL_PROVIDER=SendGrid
INBOUND_EMAIL_ROUTING=Cloudflare Email Routing
CONTACT_ROUTE=POST /api/contact       (the ONLY server-side route)
CONTACT_STATUS=WORKING on www.thebytelite.com, proven to the mailbox
CUSTOM_DOMAIN_CUTOVER_COMPLETE=YES
```

**The cutover is closed.** `www.thebytelite.com` and the apex both alias the ByteLite_LLC
deployment. The older Vercel account's project no longer holds the domain.

The evidence, kept as three separate facts because they are three different things:

```
WEBSITE_REQUEST_ACCEPTED   YES  POST /api/contact -> 202 {"status":"sent"}
                                2026-08-25T05:20:48Z, https://www.thebytelite.com
SENDGRID_PROVIDER_ACCEPTED YES  the route returns 202 only on a non-error SendGrid response;
                                SendGrid 202 means QUEUED, not delivered
MAILBOX_RECEIPT_CONFIRMED  YES  owner looked in the destination inbox on 2026-08-25 and found
                                the message. Not inferred from the two facts above.
```

Full dated capture, including the failure-behaviour probes: `qa/contact-verification-2026-08-25.md`.

The runtime fingerprint that closed it, taken from the temporary probe before it was deleted:
Node v24.18.0, 57 environment variables visible, all three contact variable names present,
`vercelEnv` production, branch main, commit 0e5ffab. The superseded deployment reported
Node v22.23.1, 48 variables, and none of the three names.

`LAST_VERIFIED_COMMIT` is the commit that was actually observed serving production
(`8ea2de6`, deployment `dpl_8SvCeGwcFguaxy1aMmQD2bGDPi7T`, both domains aliased to it, function
manifest showing `api/contact` and nothing else). The commit that records this line is a later,
documentation-only commit: it changes no page, no route and no function, so it does not
invalidate the verification above. If you ever find this field naming a commit that changed
runtime behaviour and was never checked afterwards, distrust it and re-verify with section 9.

---

## 3. Architecture

```
Visitor
  |
  v
Cloudflare DNS  (authoritative for thebytelite.com; DNS records only, NOT proxied)
  |   www.thebytelite.com  CNAME -> cname.vercel-dns.com
  |   thebytelite.com      A     -> Vercel anycast addresses
  v
Vercel  (ByteLite_LLC / bytelite-website)
  |-- static Astro site        (dist/, 63 prerendered pages)
  '-- /api/contact             (Node serverless function, api/contact.ts)
        |
        v
     SendGrid  (outbound only; authenticated sending domain thebytelite.com)
        |   from: noreply@thebytelite.com
        |   to:   tash@thebytelite.com
        v
     Cloudflare Email Routing  (inbound; forwards the company alias)
        |
        v
     real owner inbox
```

Two things this diagram is drawn to make unmistakable:

- **Cloudflare appears twice, in two unrelated roles**: DNS at the top, inbound email at the
  bottom. It is not the website host in either place.
- **Mail is one-way through SendGrid.** SendGrid never receives mail. Cloudflare Email Routing
  never sends the contact form's mail.

---

## 4. What Each External Service Does

### Cloudflare

- **Does:** Authoritative DNS for `thebytelite.com`. Holds the CNAME and A records that point
  the website at Vercel. Holds the SendGrid domain-authentication (DKIM/CNAME) records. Runs
  Email Routing, which forwards inbound mail for company aliases to a real inbox.
- **Does NOT:** Host the website. Serve the contact function. Send the contact form's email.
  Cloudflare Pages is retired from this project.
- **Look here when:** the domain does not resolve; the domain resolves to the wrong place;
  SendGrid reports the sending domain is unauthenticated; mail sent to `tash@thebytelite.com`
  never reaches the real inbox.

### Vercel

- **Does:** Build and host the static site from GitHub `main`. Run `/api/contact`. Store the
  production environment variables. Own the custom-domain assignment.
- **Does NOT:** Manage DNS records (it only tells you which records to create). Send email.
  Store the SendGrid key anywhere you can read back.
- **Look here when:** the site is stale or a deploy did not appear; `/api/contact` returns 503
  (variables missing) or 502 (provider refused); the custom domain 404s.

### SendGrid

- **Does:** Accept one HTTPS request per contact submission and queue that message for delivery.
  Authenticates `thebytelite.com` as a sending domain.
- **Does NOT:** Receive mail. Store submissions for you to read later. Guarantee inbox arrival
  when it answers `202`.
- **Look here when:** `/api/contact` returns 502, or returns 202 but no mail arrives. Check
  SendGrid Activity Feed for the message, then sender authentication, then the recipient side.

### GitHub

- **Does:** Hold the source of truth. Trigger Vercel production deployments on push to `main`.
- **Does NOT:** Deploy anything itself. Hold any secret for this project.
- **Look here when:** you need to know what code a deployment actually contains. Vercel records
  the commit SHA on every deployment; match it against `main`.

**This section exists because Cloudflare and Vercel were confused during August 2026,** which
cost several deploy cycles. When something breaks, first decide which of the four boxes above
owns the failure, then look only there.

---

## 5. Deployment

Windows PowerShell. Never put a secret on a command line.

```powershell
Set-Location D:\bytelite-website

# 1. Know your starting point
git status
git log -1 --format='%H %s'
git remote -v

# 2. Take the current remote state (review before merging anything)
git fetch origin
git log --oneline HEAD..origin/main

# 3. Dependencies, only when package.json or the lockfile changed
npm install

# 4. Build
npm run build

# 5. Tests - all of them, before deploying
npx vitest run
npx astro check
npx tsc --noEmit
npx eslint .
npm run test:e2e:clean

# 6. Confirm your Vercel identity and target BEFORE deploying
vercel whoami
vercel teams ls
vercel project ls --scope bytelitellc
vercel project inspect bytelite-website --scope bytelitellc

# 7. Deploy. Normally you do NOT run this: pushing to main deploys automatically
#    through the GitHub integration. Use it only for a deliberate manual deploy.
vercel deploy --prod --scope bytelitellc

# 8. Verify the deployment that just went out, on the canonical domain
vercel ls    bytelite-website --scope bytelitellc
vercel alias ls --scope bytelitellc
Invoke-WebRequest -Uri 'https://www.thebytelite.com/'                        -SkipHttpErrorCheck
Invoke-WebRequest -Uri 'https://www.thebytelite.com/api/contact' -Method GET -SkipHttpErrorCheck
```

The normal path is: commit to `main`, push, let Vercel build. Manual `vercel deploy` is the
exception, not the routine.

---

## 6. Vercel Project Recovery

Use this when you do not know which project is real - which is exactly the situation that
caused a duplicate project to be created in August 2026.

> **DO NOT CREATE A NEW VERCEL PROJECT JUST BECAUSE `.vercel` IS MISSING.**
> A missing `.vercel/` directory is a fact about your laptop. It is not evidence that the
> project does not exist. `vercel link` attaches to an existing project; only answer "create
> new" if you have already listed the team's projects and confirmed none of them is yours.

**Identify the correct team.**

```powershell
vercel whoami
vercel teams ls
```

The team display name is `ByteLite_LLC`; the slug you must pass to `--scope` is `bytelitellc`.
Passing the display name returns "The specified scope does not exist". Passing your own
username returns "You cannot set your Personal Account as the scope".

**Identify the correct project.**

```powershell
vercel project ls --scope bytelitellc
vercel project inspect bytelite-website --scope bytelitellc
```

Compare against `.vercel/project.json`, which should read:

```
projectId  prj_XmNkNFp156U94VveZgoPuMHPfW6u
orgId      team_LjWPr2MnAsCrv6U1ddGy8BSh
```

**Verify which project owns www.thebytelite.com.** Two ways, in order of reliability:

1. The Vercel dashboard: Domains -> `thebytelite.com` shows the project it is assigned to.
   This is authoritative.
2. The alias table, which the CLI will tell you directly:

```powershell
vercel alias ls --scope bytelitellc
```

Expect `thebytelite.com` and `www.thebytelite.com` both listed against a
`bytelite-website-<hash>-bytelitellc.vercel.app` deployment. If either domain is absent from
this table, it is assigned to a project outside this team - which is exactly the state that
caused the 2026-08 incident in section 16.

**Do not** try to answer this by fetching that `bytelite-website-<hash>-...vercel.app` URL in a
browser or with `Invoke-WebRequest`. Per-deployment URLs are protected and return Vercel's own
authentication page. You will be reading Vercel's HTML and thinking it is the site.

**Use GitHub deployment status as evidence.** The GitHub repository's Deployments tab records
which Vercel project claimed each commit, with the deployment URL. That survives even when the
Vercel dashboard is confusing.

**Relink safely.**

```powershell
Set-Location D:\bytelite-website
vercel link --scope bytelitellc          # choose the EXISTING bytelite-website project
Get-Content .vercel\project.json         # confirm the ids above
```

`.vercel/` is gitignored. It is local state, and losing it costs one `vercel link`.

---

## 7. DNS / Domain

**Cloudflare is the authoritative DNS provider.** Nameservers observed 2026-08-24:
`garrett.ns.cloudflare.com`, `kim.ns.cloudflare.com`.

**Website records.** `www.thebytelite.com` is a CNAME to `cname.vercel-dns.com`. The apex
`thebytelite.com` uses Vercel anycast A records and 308-redirects to `www`.

**Where that apex redirect lives, and why it moved.** It is the first entry in `vercel.json`
`redirects`, matched on the request `host`. It used to be a domain-level "redirect to another
domain" setting in the old project's dashboard. **That setting did not survive the ownership
transfer** - measured 2026-08-25, immediately after the cutover the apex returned `200` and
served the whole site as a second copy rather than redirecting. Nothing was visibly broken (the
canonical tag still pointed at `www`), which is exactly why it could have gone unnoticed.

Keeping it in `vercel.json` means it is version-controlled, reviewable in a diff, and moves with
the repository the next time a project changes hands. A dashboard toggle does none of those
things. Do not "tidy it up" back into the dashboard.

These records are **DNS-only (grey cloud), not Cloudflare-proxied.** That was verified by the
response headers: `server: Vercel` with no `cf-ray` header. Keep them DNS-only. Proxying them
through Cloudflare would put a second CDN in front of Vercel and break Vercel's certificate
issuance and its own caching behaviour.

**A key consequence:** because Vercel routes by the `Host` header rather than by which project
the DNS points at, moving the domain between Vercel projects requires **no DNS change at all**.
Every Vercel project answers on the same `cname.vercel-dns.com`. Do not edit Cloudflare DNS for
a project migration.

**Mail records, as measured 2026-08-24.** All of these live at Cloudflare and must stay
DNS-only.

| Record | Observed | Meaning |
|---|---|---|
| `MX thebytelite.com` | `route1/2/3.mx.cloudflare.net` | Cloudflare Email Routing handles **inbound** mail. Confirmed. |
| `s1._domainkey`, `s2._domainkey` | CNAME into `sendgrid.net` | SendGrid **domain authentication (DKIM) is configured.** Outbound mail is DKIM-signed as `thebytelite.com`. |
| `TXT thebytelite.com` (SPF) | `v=spf1 include:_spf.mx.cloudflare.net ~all` | Covers Cloudflare only. **SendGrid is not in the SPF record.** See the note below. |
| `TXT _dmarc.thebytelite.com` | `v=DMARC1; p=none; rua=mailto:report@dmarc.cloud.em.secureserver.net` | Monitor-only policy. Aggregate reports go to a **GoDaddy** address. |

Three things worth knowing about that table, none of them currently breaking anything:

- **SPF does not list SendGrid, and that is probably fine.** With domain authentication enabled,
  SendGrid evaluates SPF against its own return-path domain, and DMARC passes on **DKIM**
  alignment, which the `_domainkey` CNAMEs above provide. If delivery problems ever appear,
  confirm DKIM alignment in SendGrid's Activity Feed before adding `include:sendgrid.net` -
  adding it blindly costs an SPF lookup against the 10-lookup limit for no gain.
- **DMARC is `p=none`.** Nothing is being quarantined or rejected on your behalf. Do not tighten
  it to `p=quarantine` or `p=reject` until SendGrid is confirmed passing DKIM alignment, or
  outbound contact mail will start failing.
- **The DMARC `rua=` address is a GoDaddy endpoint** (`secureserver.net`), left over from an
  earlier registrar or mail setup. Aggregate reports are being delivered somewhere that may no
  longer be monitored. Repoint it if you ever want to actually read them.

The `TXT` record set also carries two Google site verifications, two OpenAI domain
verifications, and a Microsoft 365 (`onmicrosoft.com`) verification. They are inert leftovers.
Do not remove one without knowing which service still depends on it.

### The `_vercel` verification TXT records

Three values were present at `_vercel.thebytelite.com` on 2026-08-25, left over from the
ownership transfer:

| # | Value | Claims | Classification |
|---|---|---|---|
| 1 | `vc-domain-verify=thebytelite.com,8583c5a9f551618d20ee` | apex | **UNKNOWN** - one of the two apex values belongs to the superseded account, the other to ByteLite_LLC. Which is which cannot be told apart from DNS. |
| 2 | `vc-domain-verify=thebytelite.com,886aa98d5db087f7059e` | apex | **UNKNOWN**, same reason. |
| 3 | `vc-domain-verify=www.thebytelite.com,068d77a3fd1eec807e40` | www | **OBSOLETE for serving.** `www` is verified and aliased; Vercel only reads this record while a domain is pending verification. |

**Nothing was deleted.** All three are still in place. The rule is: delete only what is proven
obsolete, and never delete UNKNOWN. Two of these three are UNKNOWN.

Why this cannot be resolved from DNS alone: a `vc-domain-verify` value is an opaque token. Both
apex values are well-formed, and DNS does not record which Vercel account asked for which. The
only place that mapping exists is the Vercel dashboard, and it only shows a challenge value
while a domain is actually pending verification. Both domains are verified and serving right
now, so Vercel is showing nothing to compare against.

**Safe procedure when you want them gone.** Reversible, one record at a time:

1. Vercel dashboard -> ByteLite_LLC -> bytelite-website -> Settings -> Domains. Confirm both
   `thebytelite.com` and `www.thebytelite.com` read **Valid Configuration**. If either does not,
   stop; a verification record is doing real work.
2. In Cloudflare DNS, note the full value of the record you are about to remove, so you can put
   it back character for character.
3. Delete ONE record. Wait for TTL, then reload the Vercel Domains page.
4. Both domains must still read Valid Configuration and `https://www.thebytelite.com/` must
   still return 200. If either flips to pending or unverified, restore the record immediately -
   that one was load-bearing and is `CURRENTLY_REQUIRED`.
5. Repeat for the next record. Stop at the first one that matters.

There is a reason to eventually remove the apex pair rather than leave them: a stale
verification token in your DNS is a standing claim credential. Leaving the superseded account's
value in place leaves that account able to re-verify the apex. That is an argument for doing
this deliberately, not an argument for guessing which one it is today.

An agent working on this repository has read access to Cloudflare Email Routing and zone
metadata, but **not** to DNS records - `GET /zones/{id}/dns_records` returns HTTP 403. So an
agent can read these values through public DNS resolution and classify them, and cannot delete
them. That is the correct division: the destructive half needs a human at the dashboard.

If SendGrid ever reports the sending domain as unauthenticated, that is a Cloudflare DNS
problem, not a Vercel problem.

Read the live values rather than trusting the table above:

```powershell
Resolve-DnsName -Name 'www.thebytelite.com'            -Type CNAME
Resolve-DnsName -Name 'thebytelite.com'                -Type A
Resolve-DnsName -Name 'thebytelite.com'                -Type NS
Resolve-DnsName -Name 'thebytelite.com'                -Type MX
Resolve-DnsName -Name 'thebytelite.com'                -Type TXT
Resolve-DnsName -Name '_dmarc.thebytelite.com'         -Type TXT
Resolve-DnsName -Name 's1._domainkey.thebytelite.com'  -Type CNAME
```

**DNS provider and website host are different roles.** Cloudflare answering for the domain says
nothing about who serves the pages.

---

## 8. Email / Contact Flow

Required configuration, by NAME only. The values live in Vercel's Production environment and
must never appear in this repository:

| Variable | Purpose | Value documented here? |
|---|---|---|
| `SENDGRID_API_KEY` | Bearer credential for the SendGrid v3 mail/send API | **NO. Never.** |
| `CONTACT_TO_EMAIL` | Where submissions are delivered | `tash@thebytelite.com` (owner-approved) |
| `CONTACT_FROM_EMAIL` | Verified sending identity | `noreply@thebytelite.com` (owner-approved) |

List the names, never the values:

```powershell
vercel env ls production --scope bytelitellc
```

**The flow.**

```
visitor fills the form on /contact
  -> POST /api/contact                (Vercel Function, api/contact.ts)
  -> validation + rate limiting       (api/_lib/contact-core.ts)
  -> HTTPS POST to SendGrid           (from noreply@, reply-to the visitor)
  -> SendGrid queues and delivers to  tash@thebytelite.com
  -> Cloudflare Email Routing forwards that alias
  -> real owner inbox
```

**Three different things that all look like "it worked".** Never conflate them:

1. **The website accepted the request.** `/api/contact` returned `202 {"status":"sent"}`. This
   proves the function ran, the configuration is present, and SendGrid answered 2xx.
2. **SendGrid accepted the request.** SendGrid's `202 Accepted` means *queued for delivery*.
   It is the strongest thing the code can honestly report, and it is not delivery.
3. **The mailbox actually received it.** Only confirmed by looking in the inbox, or in
   SendGrid's Activity Feed showing a `delivered` event.

The code is deliberately built to never claim more than it knows. Missing configuration returns
`503` and says nothing was sent. A provider rejection returns `502` and says nothing was sent.
There is no path that reports success for a message that was not queued.

**All three were closed on 2026-08-25**, separately, against `https://www.thebytelite.com`:
202 from the route, 202 from SendGrid, and the message found in the destination inbox by the
owner. Captured in `qa/contact-verification-2026-08-25.md`. If you re-verify later, close all
three again - the third one is the one that is tempting to skip and the only one that proves
anything to a person waiting for a reply.

**Verifying the route by hand.** Step 3 sends a real email; steps 1 and 2 do not.

```powershell
# 1. Route exists and is POST-only  -> expect 405, Allow: POST
Invoke-WebRequest -Uri 'https://www.thebytelite.com/api/contact' -Method GET -SkipHttpErrorCheck

# 2. Configured and validating      -> expect 400, NOT 503
#    A 503 here means a variable is missing from the Production environment.
$bad = '{"name":"","email":"nope","inquiryType":"nope","message":""}'
Invoke-WebRequest -Uri 'https://www.thebytelite.com/api/contact' -Method POST `
  -ContentType 'application/json' -Body $bad -SkipHttpErrorCheck

# 3. Real send                      -> expect 202 {"status":"sent"}
#    Then GO AND LOOK IN THE INBOX. A 202 is not receipt.
$good = @{ name='Probe'; email='you@example.com'; inquiryType='general'
           message='Deployment verification.' } | ConvertTo-Json -Compress
Invoke-WebRequest -Uri 'https://www.thebytelite.com/api/contact' -Method POST `
  -ContentType 'application/json' -Body $good -SkipHttpErrorCheck
```

**Where the mail actually goes.** Read the live Cloudflare Email Routing rules rather than
trusting a document; the rule set as read on 2026-08-25 forwards `tash@thebytelite.com` to the
owner's personal mailbox, and a catch-all rule drops everything else. Six other company
aliases forward to the same place. If the contact form appears to work and nothing arrives,
check that rule set before suspecting SendGrid.

A `503` at step 2 means the environment variables did not reach that deployment. A `502` means
SendGrid refused; read the Vercel runtime logs, which record SendGrid's own error text (never
the key).

---

## 9. How To Rediscover Reality

Do not trust this document over the machine. These commands re-derive every fact above.

```powershell
# Repository
Set-Location D:\bytelite-website
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git status --porcelain
git remote -v

# Vercel identity, team, project
vercel whoami
vercel teams ls
vercel project ls     --scope bytelitellc
vercel project inspect bytelite-website --scope bytelitellc
vercel ls             bytelite-website --scope bytelitellc
vercel domains ls     --scope bytelitellc
vercel env ls production --scope bytelitellc      # NAMES only, values stay encrypted

# DNS
Resolve-DnsName -Name 'www.thebytelite.com'     -Type CNAME
Resolve-DnsName -Name 'thebytelite.com'         -Type NS
Resolve-DnsName -Name '_vercel.thebytelite.com' -Type TXT

# Live behaviour - always the canonical domain or a project alias, NEVER a raw
# per-deployment URL. Those are protected and answer with Vercel's own login page.
Invoke-WebRequest -Uri 'https://www.thebytelite.com/'                    -SkipHttpErrorCheck
Invoke-WebRequest -Uri 'https://thebytelite.com/' -MaximumRedirection 0  -SkipHttpErrorCheck
Invoke-WebRequest -Uri 'https://bytelite-website-bytelitellc.vercel.app/' -SkipHttpErrorCheck
Invoke-WebRequest -Uri 'https://www.thebytelite.com/api/contact' -Method GET -SkipHttpErrorCheck

# Which deployment is actually serving the domain, and from which commit
vercel alias ls --scope bytelitellc

# GitHub
gh repo view TBroadwater87/bytelite-website --json name,visibility,defaultBranchRef
```

If any of these contradicts this document, the machine is right. Fix the document.

**There is no longer a runtime probe endpoint.** `api/health.ts` existed only for the 2026-08
cutover and was deleted once delivery was proven. Do not add another one to answer a question a
CLI command can answer. If you genuinely need a runtime fingerprint again, add it, use it, and
delete it in the same working session - the failure mode is that a temporary diagnostic quietly
becomes a permanent public endpoint reporting your configuration to anyone who asks.

---

## 10. Pricing Canon

Canonical values live in `src/data/bytelite.ts`. Import them; never hardcode a price in a page.

**Personal** - flat subscription, `$9.99` / month or `$99.99` / year. **No
percentage-of-savings fee, ever.** Not advertised as unlimited. Wording is "Subject to
reasonable personal-use and service-capacity limits."

**Business / Enterprise** - ByteLite receives 50% of **verified qualifying savings**; the
customer retains the other 50%. No verified qualifying saving means no savings-share fee
attributable to that saving. The split is of the *savings*, never of the customer's costs.

**Target economic example**, which must always render under the label
"Target economic example - not a current performance claim":

```
Baseline qualifying cost              $1,000
Target qualifying cost with ByteLite  $  100
Target verified savings               $  900   (90% of baseline)
Customer retains                      $  450
ByteLite fee                          $  450
Customer effective cost               $  550
Customer net saving                   $  450   (45% of baseline)
```

**Disclaimer status: TARGET, not measured.** The `$100` figure renders as "Target qualifying
cost with ByteLite" and must never be relabelled "Measured qualifying cost with ByteLite".
`tests/e2e/pricing-models.spec.ts` guards both the personal no-fee rule and the target label.

---

## 11. Public Claim Canon

Five states, kept apart at all times:

| State | ByteLite today |
|---|---|
| **TARGET** | Universal deterministic lossless shrink: a smaller self-contained artifact for every eligible source file, from which the original is reconstructed exactly. |
| **CURRENT** | Architectural development and internal validation. Deterministic transformations on internal proof surfaces, with reconstruction evidence written out explicitly as a research scaffold. |
| **PROVEN (internal)** | Exact lossless round-trip on internal test artifacts. Strict complete-artifact accounting. Deterministic behaviour. |
| **INDEPENDENTLY VALIDATED** | **No.** Open gate. No third party has reproduced anything. |
| **PRODUCTION-QUALIFIED** | **No.** Open gate. |

Safe public wording, all of it already in `src/data/bytelite.ts`:

- "ByteLite is being developed as a deterministic lossless representation architecture with the
  target of producing a smaller, self-contained representation from which the exact original
  can be reconstructed."
- "The mechanism required to establish that target is still under active development and
  validation."
- "Universal shrink is a research target, not a completed public proof."
- "During development, ByteLite uses explicit reconstruction evidence so each transformation
  can be inspected and verified. This is a research scaffold, not the intended final artifact."

Never narrow the target ("only structured files shrink"), and never complete the proof
("universally compresses every file", "third-party verified", "production qualified"). Both
directions are wrong, and both are tested for in
`tests/e2e/public-scope-vocabulary.spec.ts`.

**No compression ratio is ever stated as achieved.** "1GB to 15 bytes" is forbidden, on the
site and in this repository's documentation.

---

## 12. Public IP Boundary

The site may say WHAT ByteLite intends to achieve. It may never say HOW.

**May be said publicly:** deterministic; lossless; exact reconstruction; a self-contained final
artifact as the target; the `.root` artifact name; the name **Bit Motion Encoding (BME)** -
which expands to Bit Motion Encoding and never to "ByteLite Motion Encoding"; complete
accounting; target-vs-proof status; the licensing model; observable behaviour.

Approved high-level wording:

> ByteLite implements Bit Motion Encoding (BME), a deterministic recursive motion-encoding
> architecture with stream-built foundations.

**Must remain private** - named here only so nobody publishes them by accident, and described
no further than their names: opcode construction law; Ogram construction law; Foundation
construction internals and stream-built Foundation mechanics beyond the wording above; motion-
program rules; pairing and private mapping laws; reset/switch mechanics; library selection and
construction; library-of-libraries and root-of-roots implementation; recursive metadata
integration; sidecar compaction and carrier construction; the private serialization grammar;
unpublished reconstruction state machinery; engine source code; unapproved validation material.

`CurrentVsFinal.astro` draws two columns with nothing between them. The gap is the boundary.
Do not fill it in.

Do not add technical detail to the site to make it more convincing. Convincing is not the goal;
being accurate about an unfinished thing is.

---

## 13. Current Public Pages

Read from the actual build (`npm run build` reports 63 pages). These eight are the public
surface:

| Route | Purpose | Status | Important invariant |
|---|---|---|---|
| `/` | Homepage. What ByteLite is, in the fewest words that stay true. | Public, in sitemap | Links only to public routes; `critical-paths.spec.ts` walks every `main a[href^="/"]` |
| `/how-it-works` | Safe conceptual explanation of the target | Public, in sitemap | Explains the objective, never the mechanism |
| `/validation` | The proof/status ladder: ten categories with their real state | Public, in sitemap | State is written in words, not conveyed by colour alone; no gate may be marked closed early |
| `/licensing` | Personal flat pricing and the business savings-share model | Public, in sitemap | Personal plan can never read as owing a percentage; the 90% example always carries the target label |
| `/about` | Company and founder context | Public, in sitemap | 2024 research start and 2025 LLC formation are distinct years and never collapse into one "founded" |
| `/contact` | The contact form | Public, in sitemap | Posts to `/api/contact`; must not promise delivery it cannot verify |
| `/deep-kore` | The live Deep Kore chat (added 2026-09-01) | Public, in sitemap | The ONE route that may name Deep Kore, AIya, Genesis Goalkeeper or Revelation Vanguard. Says what the system does, never how. No fallback: if the engine is unreachable the page says so and shows no conversation. Runbook: section 21 |
| `/privacy` | Privacy policy | Public, in sitemap | May cover non-public services generically, never by product name |
| `/terms` | Terms | Public, in sitemap | Same generic-description rule |

Two more resolve but are intentionally absent from the sitemap:

| Route | Why |
|---|---|
| `/responsible-disclosure` | Reachable for security researchers who look for it; not a marketing destination |
| `/404` | Error page |

---

## 14. Retired / Compatibility Routes

**59 of the build's 68 HTML pages are served `noindex`** (measured 2026-08-24). They still
return 200. **They are retired from discovery, not deleted.** Every one passes `noindex={true}`
to `Layout`, none appears in the sitemap, and no public page links to one. This keeps old
bookmarks and old search results working without promoting a retired product.

Verify the split yourself after any build:

```powershell
$html = Get-ChildItem -Recurse -File -Path dist -Filter *.html
$html.Count
@($html | Where-Object { (Get-Content $_.FullName -Raw) -match 'noindex' }).Count
```

| Group | Disposition |
|---|---|
| `architecture/`, `architecture.astro` | NOINDEX, COMPATIBILITY |
| `company/` | NOINDEX, COMPATIBILITY |
| `marketing/` | NOINDEX, COMPATIBILITY (signup/admin/thank-you are wired to a separate backend) |
| `preorder/` | NOINDEX, COMPATIBILITY |
| `products/cordel-play/`, `products/cordel-connect/` | NOINDEX, COMPATIBILITY |
| `progress/` | NOINDEX, COMPATIBILITY |
| `research/` | NOINDEX, COMPATIBILITY - real pages, deliberately undiscoverable |
| `technologies/` | NOINDEX, COMPATIBILITY |
| `/api/deepkore-submit` | NOINDEX, COMPATIBILITY, **UNKNOWN** - see section 16 |

**Redirects.** `vercel.json` is the only redirect mechanism that actually runs. Nineteen rules,
all classified COMPATIBILITY_REQUIRED - each one keeps a historical inbound URL from breaking:

| Rule group | Classification | Why it stays |
|---|---|---|
| `/heartstrings`, `/heartstrings-app`, `/products/heartstrings-*` | COMPATIBILITY_REQUIRED | Pre-Cordel-rebrand canonical URLs that were published |
| `/deepkore`, `/deepkore-lab`, `/technology`, `/status`, `/news`, `/ethics`, `/ai-safety`, `/subscribe`, `/marketing` | COMPATIBILITY_REQUIRED | Portfolio-era short URLs |
| `/products/cordel-connect/byteoracle-horoscopes` | COMPATIBILITY_REQUIRED | Retired product name removed from the URL; old URL preserved |
| `/pricing` -> `/licensing`, `/proof` -> `/validation`, `/demo` -> `/how-it-works` | ACTIVE_PUBLIC | Semantic aliases for current public pages |

**Do not add a redirect for `/research`.** A rule there would shadow the real page.

**Do not reinstate** `/about -> /company` or `/licensing -> /company/partnerships`. Both
shadowed real pages that now exist.

---

## 14b. Security and Dependencies

```
LAST_SECURITY_AUDIT_DATE=2026-08-25
LAST_SECURITY_AUDIT_COMMIT=2c348d6..5a73c76   (the audit's own commits)
DEPENDABOT_ALERTS_BEFORE=10        DEPENDABOT_ALERTS_AFTER=9
HIGH_BEFORE=3                      HIGH_AFTER=2
MODERATE_BEFORE=4                  MODERATE_AFTER=4
LOW_BEFORE=3                       LOW_AFTER=3
```

The one that was fixed was `sharp`. The nine that remain are **eight Astro plus one esbuild**,
and every one of them is **provably unreachable in this build**.

`esbuild` (GHSA-g7r4-m6w7-qqqr, low, CVSS 2.5) is "arbitrary file read when running the
development server on Windows" - esbuild's *own* `serve` command, which nothing here runs. Vite
uses esbuild as a transform library, not as a server. The attack is `AV:L` (local) anyway, so it
needs someone already on the machine. Astro pins `esbuild: ^0.27.3` and the patch is `0.28.1`,
outside that range, so forcing it would mean overriding a build-critical package past what its
maintainer tested - real risk, for a local-only issue in a server we never start. Left open
deliberately; it clears when Astro's range moves.

### Why nine Astro alerts are open and that is not negligence

Every open Astro advisory needs one of these to be exploitable: request-time rendering, an
attacker-controlled slot name, a `Host` header reaching a server, `define:vars`, a `transition:*`
directive, a spread attribute name, or a server island. Measured 2026-08-25, this repository has
**none of them**:

```powershell
# no adapter, no output:'server', nothing opting out of prerender
Select-String -Path astro.config.mjs -Pattern 'adapter|output'      # no match
Select-String -Path src\**\*.astro,src\**\*.ts -Pattern 'prerender' # no match
# none of the vulnerable features are used anywhere
Select-String -Path src -Recurse -Pattern 'define:vars|transition:|server:defer|\{\.\.\.'
Select-String -Path src -Recurse -Pattern '<slot\s+name=\{|Astro\.slots'
# and the build emits no server entrypoint at all
Get-ChildItem dist -Recurse -Include 'entry.mjs','_worker.js','*.func'   # nothing
```

Astro renders at BUILD time here, from this repository's own files. A visitor cannot supply
anything that reaches the vulnerable code, because by the time a visitor arrives the rendering
already happened and what ships is plain HTML.

**Closing them requires Astro 7.** The first release patched against all of them is 7.1.0, and
`astro@5.18.2` is the newest 5.x - there is no patch inside 5. That upgrade is **not a version
bump**, because `@astrojs/tailwind@6.0.2` peers on `astro: ^3 || ^4 || ^5` and has no Astro 6/7
release at all. So the real cost is: drop `@astrojs/tailwind`, migrate to Tailwind 4 via
`@tailwindcss/vite`, rewrite `tailwind.config.mjs` into CSS `@theme` form, and re-verify every
utility class across 63 pages and 1485 E2E assertions including the reflow checks.

**That is an owner decision, not an agent's.** It is a real migration on a live marketing site to
fix advisories that cannot currently be triggered. Revisit it when Astro 7 support lands in the
integrations, or immediately if this site ever stops being static - see the trigger below.

**Decided 2026-08-25: defer.** The owner reviewed the tradeoff and chose to leave Astro at 5.18.2
rather than take a Tailwind 4 migration to fix unreachable advisories. Do not re-open this as if
it were an oversight - it is a considered position with a stated expiry condition (the trigger
below). Re-raise it only when the trigger fires, or when `@astrojs/tailwind` gains Astro 7
support and the migration stops being a Tailwind rewrite.

**Also decided 2026-08-25: the nine alerts stay OPEN in GitHub, undismissed.** Dismissing them
would tidy the dashboard, but an open alert is the thing that will still be visible if this site
ever stops being static and the whole "not applicable" argument collapses. Visible-and-explained
was judged safer than dismissed-and-forgotten. Do not dismiss them to make a report look clean.

**The trigger that makes all nine live.** If anyone adds an adapter, sets `output: 'server'`, or
writes `export const prerender = false`, the reachability argument above collapses and the Astro
upgrade becomes urgent rather than optional. Treat that change as a security change.

### Routine commands

```powershell
gh api "repos/TBroadwater87/bytelite-website/dependabot/alerts?state=open&per_page=100"
npm audit                 # advisory view, with the caveat below
npm outdated              # informational only - newer is not a mandate
npm ls sharp esbuild      # prove what a transitive package actually resolved to
```

**`npm audit fix --force` is prohibited here.** It would install `astro@7.2.6` - a breaking
change, on a live site, to fix findings that are unreachable. Fix order is patch, minor,
direct-dependency bump, narrow `overrides`, and major migration last. See CLAUDE.md section 14.

### The one `overrides` entry, and when to remove it

`package.json` pins `sharp: ^0.35.3`. `sharp` is an *optional* dependency of Astro (which asks
for `^0.34.0`) and is the configured image service, but nothing here ever invokes it: there is no
`astro:assets` import, no `<Image>`, no `getImage()`, and no image imported from `src/`. It would
run at build time only and never sees a visitor's input. The override closes a high alert at zero
behavioural cost. **Remove it once Astro's own range reaches `>= 0.35.0`.** It installs with an
`EBADENGINE` warning on Node < 22.19.0; Vercel builds on Node 24, so this is a local-only notice.

### Where secrets live, conceptually

Nowhere in this repository, and nowhere in the build output - both were scanned, along with the
full Git history across all refs, and all three are clean. `SENDGRID_API_KEY`, `CONTACT_TO_EMAIL`
and `CONTACT_FROM_EMAIL` exist **only** in the Vercel Production environment, are read at request
time inside the function, and reach exactly one place: the SendGrid `Authorization` header.

To rotate the SendGrid key without a value ever touching source:

1. Create a new key in SendGrid with **Mail Send** permission only. Do not delete the old one yet.
2. `.\Add-ByteLite-SendGrid.ps1` (prompts for the value as a `SecureString` and never echoes or
   stores it), or set it in the Vercel dashboard under Settings -> Environment Variables.
3. **Redeploy.** A running deployment does not pick up a changed variable on its own.
4. Verify with the section 8 steps - expect 405 on `GET`, 400 on an invalid POST, 202 on a real
   one - then look in the mailbox.
5. Only after receipt is confirmed, delete the old key in SendGrid.

Never paste a key into a file, a commit, a chat, or a log. `vercel env ls production --scope
bytelitellc` prints names and `Encrypted`, never values, which is the only listing you need.

### Security headers

Served by `vercel.json` `headers`, which is the **only** live source. Astro middleware cannot do
this in a static build; `src/middleware.ts` used to hold a second, divergent policy that named
Google Analytics hosts this site does not use, and it was deleted on 2026-08-25 for exactly that
reason. Do not recreate it.

Verify after any deployment:

```powershell
$r = Invoke-WebRequest -Uri 'https://www.thebytelite.com/' -SkipHttpErrorCheck
$r.Headers['content-security-policy']
$r.Headers['x-frame-options']; $r.Headers['x-content-type-options']
$r.Headers['referrer-policy']; $r.Headers['permissions-policy']
```

The CSP carries `script-src 'self' 'unsafe-inline'`, and that is a deliberate, documented limit
rather than an oversight: Astro inlines its bundled module scripts into the HTML (128 inline
module scripts plus 5 bare inline blocks across 68 pages, measured), so removing `'unsafe-inline'`
would break the navigation toggle, the cookie banner and the contact form on every page. A
nonce would need request-time rendering, which a static build does not have, and a hash list
would change on every build. What the policy *does* buy is real: no external script origin, no
`unsafe-eval` (verified: no `eval`/`new Function` in any shipped asset), `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, and a `connect-src` limited to
this origin plus `https://api.thebytelite.com`.

That last origin is load-bearing: `/marketing/signup` and `/marketing/admin` fetch the restaurant
portal backend there at runtime. It was found only by loading the real build in a real browser and
watching for `securitypolicyviolation` - static reading of the source never showed it. **Validate
a CSP change the same way, in a browser, against the real build, before shipping it.**

Strict CSP is available later if wanted, by stopping Astro from inlining scripts so `script-src`
can drop to `'self'`. That is a build-output change affecting every page and is an owner decision.

### What attacking the live route actually found

Reading the code found nothing. Attacking the deployed endpoint found one real gap:

```
POST /api/contact   Content-Type: application/x-www-form-urlencoded   -> 202 {"status":"sent"}
POST /api/contact   Content-Type: text/plain                          -> 202 {"status":"sent"}
```

Vercel parses urlencoded bodies into `req.body` as an object, and the adapter accepted any
object, so a plain HTML form POST was indistinguishable from the site's own `fetch`. Those three
content types are "simple" requests: a cross-origin form can send them with **no preflight and no
consent**. The gain to an attacker was never "send mail" - it is a public endpoint, anyone can
curl it - it was sending from *other people's browsers and addresses*, which makes the per-address
throttle meaningless because every request arrives from a different real client.

Now fixed: anything that is not `application/json` gets **415 before the body is read**. A
cross-origin `fetch` setting that content type triggers a preflight this route does not answer,
so the browser never sends it. Verified live, with deliberately invalid bodies so the check
itself could not send anything:

```
form-urlencoded / text/plain / multipart / xml  -> 415
application/json  and  application/json; charset=utf-8  -> 400 (validation, nothing sent)
```

**Four real emails reached the contact mailbox during this audit**, all synthetic (`name: "a"`,
`message: "m"`). Two came from the probe that discovered the gap - they were expected to be
rejected, not accepted. Two more came from re-running that probe against production before the
fix had finished deploying. They were not intended and they are the only mail this pass produced.
They do serve as the post-change delivery proof: they exercised the new rate-limit key and the
new provider deadline end to end and still delivered, so no further verification message was
sent. **Lesson for next time: probe a mail-sending endpoint only with payloads that cannot pass
validation, and confirm the deployment is aliased before probing at all.**

---

## 15. Testing

All commands from `D:\bytelite-website`.

| Command | What it proves |
|---|---|
| `npm run build` | The Astro static build succeeds and emits every page |
| `npx vitest run` | Unit tests: the contact core's validation, size limits, header-injection defence, secret hygiene, and the Vercel adapter's env handling; plus preorder logic |
| `npx astro check` | Astro template and component diagnostics |
| `npx tsc --noEmit` | TypeScript strict-mode correctness |
| `npx eslint .` | Lint |
| `npx playwright test` | Full E2E across 5 browser engines |
| `npm run test:e2e:clean` | Same, after safely clearing a stale preview server this repo owns |
| `npm run test:e2e:live` | **Not part of the matrix.** The live Deep Kore proof; needs a running gateway and worker. See section 21.8 |

What the E2E specs individually protect. **Corrected 2026-09-01:** this table used to list four
specs that do not exist - `retired-route-rendering`, `research-and-canonical-truth`,
`technology-status-claims` and `conversion-workflows` were deleted with the route families they
covered in the 2026-08-26 rebuild. The five below are the ones actually in `tests/e2e`.

| Spec | Protects |
|---|---|
| `critical-paths.spec.ts` | Every public route works; no public link or nav entry leaves the public allowlist; the forbidden ratio claim is absent |
| `public-scope-vocabulary.spec.ts` | The Owner Law: target and proof stay distinct in both directions; no sibling product name; no internal implementation vocabulary; the two-tier Deep Kore route scoping; company voice. Checked against rendered text AND markup, so a phrase arriving via `src/data/` is caught the same as one typed into a page |
| `pricing-models.spec.ts` | A personal visitor can never conclude they owe a percentage; no invented currency figure returns |
| `public-scope-accessibility.spec.ts` | Overflow, 200% zoom, keyboard navigation and reduced-motion behaviour on every public route |
| `deep-kore-page.spec.ts` | `/deep-kore` publishes exactly the vocabulary the amendment permitted and no engine internals; the console is honest before anything is connected; a failed start produces an error and no conversation |

And, outside the matrix:

| Spec | Protects |
|---|---|
| `tests/live/deep-kore-live.spec.ts` | That real cognition reaches the browser, that two sessions answer identically, that no private diagnostic crosses, and that an unreachable engine produces an error and **no conversation**. Run with `npm run test:e2e:live` against a stack you started |

**Dated verification snapshot, 2026-09-01, after the live Deep Kore chat pass:**

```
Windows 11, working tree ahead of production (which still serves 21af2ca).

  npm run build            PASS  18 pages
  npx vitest run           PASS  172/172 (5 files)
  npx astro check          PASS  0 errors / 0 warnings / 1 hint
  npx tsc --noEmit         PASS  0 errors
  npx eslint .             PASS  0 errors / 1 pre-existing warning (tests/setup.ts)
  npx playwright test      PASS  1665/1665, 5 engines, 40.3m, no retries, no flakes

  Deep Kore repo:
  cmake -S Source -B Source\build          PASS  438 sources, 428 ctest tests registered
  test_public_chat_governed_path           PASS  32/32 assertions
  ctest -R 'vanguard|governed|governance'  PASS  6/6

  Live proof (needs the stack up; not in the matrix):
  npm run test:e2e:live    PASS  78/78, 3 engines (0 workers left behind)
```

The single ESLint warning is pre-existing `no-explicit-any` in `tests/setup.ts`. The earlier
snapshot below is kept for comparison; note it describes a site with 68 pages that no longer
exists.

**Earlier dated snapshot - historical, not current:**

```
On 2026-08-24, Windows 11, before and after the cleanup pass:

                        baseline (0e5ffab)      after cleanup
  npm run build         PASS  63 routes         PASS  63 routes
  dist HTML pages       68 (59 noindex)         68 (59 noindex)   <- unchanged
  npx vitest run        PASS  30/30 (2 files)   PASS  30/30
  npx astro check       PASS  0 err / 6 hints   PASS  0 err / 6 hints
  npx tsc --noEmit      PASS  0 errors          PASS  0 errors
  npx eslint .          PASS  0 err / 24 warn   PASS  0 err / 24 warn
  npx playwright test   PASS  1410/1410 (46m)   PASS  1410/1410 (36m)
```

The 24 ESLint warnings are pre-existing `no-explicit-any` in `RestaurantSignup.tsx`,
`RestaurantAdmin.tsx` and `tests/setup.ts`. They were not introduced by the cleanup.

**Second dated snapshot - the 2026-08-25 security pass:**

```
On 2026-08-25, Windows 11, after the security/dependency hardening:

  npm ci                PASS  917 packages, exit 0
  npm run build         PASS  63 routes, 343 files in dist
  npx vitest run        PASS  35/35 (2 files)   <- 30 before, +5 security tests
  npx astro check       PASS  0 err / 6 hints   (144 files; middleware.ts removed)
  npx tsc --noEmit      PASS  0 errors
  npx eslint .          PASS  0 err / 24 warn
  npx playwright test   PASS  1485/1485 (39.4m) <- 1410 before, +75 new assertions
  security headers      ALL SEVEN present in production
  secret scan           CLEAN (tree, dist, full git history across all refs)
```

The E2E suite grew from 1410 to 1485 because this pass ADDED assertions and split one
over-broad test; nothing was weakened or removed.

**Why that E2E number is still trustworthy at a later commit.** The run happened before
`5a73c76`, which changed `api/contact.ts` and its unit tests. Neither is an input to the Astro
build - `api/` is a Vercel Function that lives beside the static site, not inside it. That was
proven rather than assumed: `dist` rebuilt to a byte-identical 343-file manifest,
SHA256 `157F221198D1C68312DBAF3090B5A86B9941DBCF8A1095C01913EE6599007F8A`, both before and after.
Re-confirmed again at `8ea2de6`. Recompute it with the same method before trusting this line.

Record counts with the commit and the date. A bare "1485/1485" with no anchor is not evidence.

---

## 16. Known Historical Problems and Dead Systems

Recorded so a future agent does not rediscover a dead system and restore it.

### Historical incidents

| Incident | What actually happened |
|---|---|
| **Cloudflare Pages was used historically** | The site was configured for Cloudflare Pages (`wrangler.jsonc`, a Pages Function, `public/_headers`, `public/_redirects`, `public/_routes.json`). Vercel later became production. The Pages artifacts stayed in the repo for months, inert, and were the main source of host confusion. |
| **Multiple Vercel accounts and projects** | Work spanned a personal-account project (`bytelite-site`) and later a team project. Determining which one served the domain repeatedly required live evidence, not project names. |
| **A duplicate Vercel project was created during recovery** | Because `.vercel/` was missing locally, a new project was created instead of linking the existing one. This is why section 6 leads with that warning. |
| **`reuseExistingServer: true` could skip the E2E build** | With reuse on and port 4321 already listening, Playwright skips its `command` entirely, so `npm run build` never runs and the suite silently tests a stale `dist`. Reproduced with a marker file planted in `dist`. It is now `false`, so a run either builds its own output or fails loudly on a port collision. |
| **A Firefox screenshot visual test was retired** | `hierarchy-diagram-visual-check.spec.ts` was written as a one-off human review aid; its own comment said the screenshots were "a review aid, not an assertion". It was replaced by `retired-route-rendering.spec.ts`, a deterministic contract test. |
| **Security headers silently stopped being served** | The header policy was written for Cloudflare Pages (`public/_headers`). Vercel ignores that file, so moving hosts dropped CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy without any error. See section 17, blocker 1. |

### The 2026-08-25 domain-ownership incident

The single most expensive confusion in this project's history, written down so it is never
repeated.

**What was true.** `www.thebytelite.com` was attached to a project under a *different Vercel
account* (`Tash Broadwater's projects`), not to `ByteLite_LLC/bytelite-website`. The contact
form worked perfectly on the new project's `.vercel.app` URL and was broken on the real domain.

**Why it resisted diagnosis for so long.** Both deployments were built from **the same Git
commit**. Every page was byte-identical. Viewing the site, comparing HTML, diffing content,
checking the commit - all of it agreed, and all of it was measuring the wrong thing. The
difference was never in the code. It was in which account's environment the code was running
inside.

**What actually settled it.** The runtime fingerprint, not the page:

```
OLD (superseded)   Node v22.23.1   48 env vars   SENDGRID_API_KEY/CONTACT_* absent
NEW (canonical)    Node v24.18.0   57 env vars   all three present
```

Two deployments of one commit can differ only in runtime and configuration. So compare runtime
and configuration. A temporary probe reporting variable *names* and presence booleans - never
values - was what made those two columns visible at all.

**How it was resolved.** Vercel required `_vercel` TXT ownership verification on the zone.
Once that verified, usable custom-domain authority transferred to
`ByteLite_LLC/bytelite-website`, and the old account received Vercel's "Another account has
taken ownership" notice. **No hosting DNS migration was required.** Cloudflare remained the
authoritative DNS provider throughout, and the `www` CNAME never changed - because Vercel
routes by `Host` header, every project answers on the same `cname.vercel-dns.com`.

**The four lessons.**

1. **Never infer the website host from the DNS provider.** Cloudflare answering for the domain
   said nothing about who served the pages.
2. **Never compare deployments by their content.** Compare what their runtime reports.
3. **Never probe a raw per-deployment URL and read the result as the application.** Those URLs
   are protected and return Vercel's own authentication page. That HTML is Vercel, not this
   site. Verify on the canonical domain or a project alias.
4. **Never create a second Vercel project because `.vercel/` is missing.** That already
   happened once, and a duplicate project is exactly what turns "which one serves the domain?"
   into a research task.

### Removed in the 2026-08-24 cleanup

| Name | Why removed | Replaced by |
|---|---|---|
| `wrangler.jsonc` | Cloudflare Pages project config. Vercel never reads it. | Vercel project settings |
| `functions/api/contact.ts` | Cloudflare Pages adapter for the contact route. Never deployed; its own header said "NOT the production path". | `api/contact.ts` |
| `functions/env.d.ts` | Ambient types existing only for that adapter | nothing needed |
| `public/_redirects` | Cloudflare Pages redirect file. Inert on Vercel, and served publicly as a static file, exposing retired product route names. Its 19 rules are duplicated exactly in `vercel.json`. | `vercel.json` `redirects` |
| `public/_headers` | Cloudflare Pages header file. Inert on Vercel and served publicly. | The live policy is now the `headers` block in `vercel.json`; see section 14b |
| `public/_routes.json` | Cloudflare Pages function-routing manifest. Meaningless on Vercel. | Vercel routes `api/` automatically |
| `src/pages/api/compress.ts` | POST-only Astro API route in a static build: emitted no file at all (the build log says "file not created, response body was empty") and returned 404 in production. Its rate limiting and CORS protected nothing. Its documented response advertised a compression ratio that must never be claimed. | nothing - it was never deployed |
| `src/components/ProofDemo.astro` | A 114-byte stub whose own comment read "Archived component - not in use by any page" | nothing |

### Removed in the 2026-08-25 security pass

| Name | Why removed | Replaced by |
|---|---|---|
| `src/middleware.ts` | Inert in a static build, and once `vercel.json` began serving real headers it became a **second, divergent security policy** - one that allowed `googletagmanager.com` and `google-analytics.com`, neither of which this site loads (verified: no analytics reference in any built page). A stale security policy that cannot be enforced is worse than none, because it reads like evidence. | The `headers` block in `vercel.json`, which is authored *and* enforced |
| `chart.js` (dependency) | Proven unused: the string appears only in `package.json` and `package-lock.json` - zero references in `src/`, `tests/`, config, or `dist/`. | nothing - no chart is rendered anywhere |

### Removed in the 2026-08-25 closure

| Name | Why removed | Replaced by |
|---|---|---|
| `api/health.ts` | Temporary migration probe for the domain cutover. Its own header said to delete it once contact was confirmed in production; that was confirmed on 2026-08-25. A diagnostic that outlives its migration has become a permanent public endpoint reporting deployment configuration to anyone who asks. | nothing - the facts it reported are available from `vercel env ls`, `vercel alias ls`, and a `GET /api/contact` that expects 405 |
| The `/contact` outage banner (`.ct-outage`) | It announced that form submissions were unavailable. Delivery is now proven end to end, so the banner had become a false statement in the other direction. | Honest error handling, which stayed: a failed submission still says the message was not sent. `public-scope-vocabulary.spec.ts` now asserts the banner's absence *and* that the page does not overpromise. |

### Kept, classified UNKNOWN - do not delete without evidence

| Item | Why it is uncertain |
|---|---|
| `src/pages/api/deepkore-submit.ts` | Its `GET` half prerenders to a real static file, so `/api/deepkore-submit` returns 200 today. Deleting it would change live public behaviour (200 -> 404), which is more than cleanup. Its `POST` half is dead in a static build. It names a retired sibling product on a public URL, so it is worth an owner decision - but it is not this pass's call to make. |
| `verify_site.ps1` | A root-level forbidden-word and build checker from an earlier pass. Still runs, overlaps partly with the E2E claim audit. Harmless; unclear whether it is still the owner's preferred gate. |
| `.env.example` | Lists six build-time names - `PUBLIC_SITE_URL`, `PUBLIC_GA_ID`, `PUBLIC_API_URL`, `API_RATE_LIMIT_WINDOW`, `API_MAX_REQUESTS_PER_WINDOW`, `API_MAX_FILE_SIZE`. Verified 2026-08-24: **none is read by any code here.** The canonical site URL is hardcoded in `astro.config.mjs`; no analytics tag is wired into `Layout.astro`; the `API_*` limits belonged to the removed `compress.ts`. All six are still set in the Vercel project. The file is protected by a local write-deny rule, so it was left exactly as it was. It also does not mention the three variables that actually matter (`SENDGRID_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) - those are runtime secrets and correctly live only in Vercel. |
| `PROJECT-FIXES-SUMMARY.md`, `SITE_FULL_PUBLIC_REDESIGN_AND_DEPLOY_REPORT.md`, `ASSET_MANIFEST.md`, `reports/` | Dated session records that describe an older architecture. Kept as history. Read them as history, never as current instruction. |
| `qa/` (381 files) | Dated evidence from prior QA passes, including screenshots and migration audits. Historical record. Do not prune. |
| `ClaudeTools/` | The owner's local agent tooling. Not part of the website. Leave alone. |
| `marketing-assets/` | Business card and email-signature HTML. Not part of the site build. |
| `public/ByteLite_Banner.png` (1.58 MB) and `public/Deep_Kore_Banner.png` (1.22 MB) | **Referenced by nothing.** Verified 2026-08-24: neither name appears in `src/`, and neither is the manifest or Open Graph image (that is `bytelite-logo.png`). Both are still copied into `dist/` and served publicly - 2.8 MB of dead weight, one of it a retired sibling product's banner on a ByteLite-only site. **Not deleted, because an old external post or social card could still hot-link them and there is no evidence either way.** This is an owner decision, and a good candidate for removal. |
| `public/preview/tacodelsol/` (58 files, 5 HTML pages) | A restaurant client's preview site served at `/preview/tacodelsol/`. It is **correctly `noindex,nofollow,noarchive`**, so it is not a search-discovery leak, and it is reachable by direct URL by design - that is what a client preview is for. It is real owner work with its own branch (`add-tacodelsol-preview`). Leave it alone unless the owner says the engagement is over. |

---

## 17. Current Open Work

Real, unresolved, and verified as unresolved on 2026-08-25. Nothing here is marked complete
merely because an implementation exists.

### 2026-08-31 - company-voice pass, LOCAL ONLY, awaiting your decision

The public site was rewritten from founder-singular voice ("I am building ByteLite") into company
voice ("ByteLite LLC"). The rule is now `CLAUDE.md` section 17 and is enforced by test on every
public route. **The work is committed to nothing** - it is in the working tree only. Production
still serves `21af2ca`.

What did NOT change, because it was already in its target state: routes, redirects and 410s, the
sitemap allowlist, the Stripe commerce architecture and its fail-closed gates, the nine published
WebP graphics, and the withdrawn `/preorder-terms` and `/supporter-terms`.

**The historical prototype result is now published.** It was refused earlier the same day, you
approved it in writing, and it is live on `/` and `/validation`:

> An earlier internal Python prototype demonstrated exact lossless reconstruction after reducing
> a one-terabyte test input to approximately four hundred kilobytes.

Three things to know about how it went in:

- **`CLAUDE.md` section 2 was amended**, not bypassed. The no-ratio rule now carries this one
  narrow exception explicitly, so a future agent cannot read the sentence as a canon violation and
  delete it.
- **`NOT_PROVEN` used to say "A specific compression ratio. No public ratio is claimed."** Your
  approval made that false. It now says the current C++ implementation has not reproduced the
  result. A test asserts the old line is gone.
- **No artifact backs the figure, and none was invented.** You instructed that nothing be made up,
  so the claim is published as a company-reported historical statement and the site frames it that
  way. Section 18 records this openly. If a public-safe artifact ever exists, put it in `qa/`.

The **sub-64-byte objective was not part of that approval** and is still unpublished.

**Your remaining actions, in order:**

1. Read the rewritten pages. `/` and `/licensing` changed most; `/validation` gained the
   historical-vs-current section; `/contact` has a new heading.
2. Confirm the prototype sentence reads the way you intend it to in both placements.
3. Commit and deploy by the ordinary section 5 procedure. Nothing about DNS, hosting or contact
   delivery changes.
4. After deploy, in Google Search Console and Bing Webmaster Tools: submit
   `https://www.thebytelite.com/sitemap-index.xml`, request recrawl of `/`, `/validation`,
   `/licensing`, `/contact`, `/about` and `/how-it-works`, and confirm the retired families still
   report 410.

Nothing in this pass touches Stripe. No Stripe Dashboard action is required by it, and no live
Stripe object was created. The Stripe and Vercel decisions still open are unchanged and remain
listed in `CLAUDE.md` section 16.

### Blocker 0 - the logo is 438 KB and renders at 30x30

Carried forward from the old Blocker 2 below and re-measured on 2026-08-31: still open, still
unfixed. `public/bytelite-logo.png` is 438 KB, is requested by the header on every page at a
rendered size of 30x30 CSS pixels, and is also the default `og:image`.

**Deliberately not fixed in the company-voice pass**, because the fix is not one file. The header
mark wants a small WebP; `og:image` wants to stay PNG, since WebP support across social-preview
crawlers is inconsistent and silently degrading every link preview would be a worse outcome than
the weight. That is two assets and a social-preview verification, which is its own scoped change.

**Closed on 2026-08-25**, and moved into section 16 as history rather than deleted:

| Was | Outcome |
|---|---|
| Blocker 1 - custom-domain cutover | **DONE.** `www.thebytelite.com` and the apex both alias the ByteLite_LLC deployment. No Cloudflare DNS change was needed. |
| Blocker 3 - mailbox receipt not confirmed | **DONE.** Confirmed by looking in the destination inbox, not inferred from a 202. |
| Blocker 4 - remove the temporary health probe | **DONE.** `api/health.ts` deleted, and every reference to it in this file and `CLAUDE.md` removed. |
| Blocker 2 (2026-08-24 numbering) - security headers not served | **DONE 2026-08-25.** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and COOP are now served from `vercel.json`. The inert, divergent `src/middleware.ts` policy was deleted. Details in section 14b. |

### Blocker 1 - Astro is nine advisories behind, and catching up means Tailwind 4

Not exploitable today - every one of the nine needs a precondition this static build does not
have, and the proof is in section 14b. It is listed here because "unreachable" is a property of
the current architecture, not a permanent fact, and because the gap widens over time.

The decision is whether to take Astro 5 -> 7 now or later. It is a genuine migration:
`@astrojs/tailwind` has no Astro 6/7 release, so it means moving to Tailwind 4 via
`@tailwindcss/vite` and rewriting the Tailwind config into CSS `@theme` form, then re-verifying
the visual result across 63 pages. Section 14b has the full analysis.

Take it immediately if the site ever stops being fully static.

### Blocker 2 - Logo weight

`public/bytelite-logo.png` is 473 KB. Target is roughly 50 KB as WebP. Real, unfixed, and
purely a performance item.

### Blocker 3 - DMARC reports go to an address you may not control (low priority)

Measured 2026-08-24: `_dmarc.thebytelite.com` is `v=DMARC1; p=none;
rua=mailto:report@dmarc.cloud.em.secureserver.net`. The policy is monitor-only, and the
aggregate reports are being delivered to a **GoDaddy** endpoint left over from an earlier
setup. Nothing is broken - `p=none` enforces nothing - but nobody is reading the reports.

If you want DMARC visibility, repoint `rua=` at an address you control. Do **not** tighten the
policy beyond `p=none` until SendGrid is confirmed passing DKIM alignment in its Activity Feed;
see section 7 for why SPF not listing SendGrid is expected rather than a defect.

### Blocker 4 - Three `_vercel` verification TXT records, two of them UNKNOWN

Nothing is broken. Two apex `vc-domain-verify` values exist where one account's would do, and
DNS cannot say which belongs to the superseded account. Full classification and a reversible
removal procedure are in section 7. Deliberately left in place: the rule is never to delete an
UNKNOWN.

---

## 18. Six-Month Restart Checklist

1. Read `OWNER_README.md` (this file).
2. Read `CLAUDE.md`.
3. `git status` - confirm nothing uncommitted is about to be lost.
4. `git fetch origin; git log --oneline HEAD..origin/main` - confirm the current `main` HEAD.
5. Load `https://www.thebytelite.com` and confirm it serves.
6. Confirm the correct Vercel project (section 6). Do **not** create a new one.
7. `vercel ls bytelite-website --scope bytelitellc` - inspect the latest deployment and its commit.
8. Run the tests in section 15 and record the counts with the date and commit.
9. Re-read section 17 and check which blockers are still open. Verify, do not assume.
10. Do not restore superseded architecture. Section 16 lists what is dead and why.

---

## 19. Things Not To Do

- Do not create another Vercel project because `.vercel/` is missing. Link the existing one.
- Do not infer the hosting provider from the DNS provider.
- Do not proxy the website DNS records through Cloudflare. They must stay DNS-only.
- Do not edit Cloudflare DNS for a Vercel project migration. It is not needed.
- Do not expose the SendGrid key. Do not put any API key into source, documentation, or a
  command line. This repository is public.
- Do not restore Cloudflare Pages artifacts. Section 16 lists them and why they went.
- Do not restore portfolio-site scope. Six public routes, ByteLite only.
- Do not expose ByteLite mechanism or IP. Section 12 is the boundary.
- Do not call a target metric proven. Do not state any compression ratio as achieved.
- Do not treat provider acceptance as mailbox receipt.
- Do not delete a compatibility route or redirect without evidence nothing depends on it.
- Do not use an old project name (`bytelite-site`, `thebytelite`) as current canon.
- Do not silently migrate hosting providers.
- Do not `reset`, `clean`, `stash`, or discard owner work.
- Do not add an Astro adapter to make one API route work. Server code lives in `api/`.
- Do not weaken a test to make a run green.

---

## 20. Accounts and Identifiers

No passwords, API keys, tokens, recovery codes or secrets appear here, and none ever should.

| Thing | Value |
|---|---|
| Vercel team display name | `ByteLite_LLC` |
| Vercel team CLI scope slug | `bytelitellc` |
| Vercel team id | `team_LjWPr2MnAsCrv6U1ddGy8BSh` |
| Vercel project | `bytelite-website` |
| Vercel project id | `prj_XmNkNFp156U94VveZgoPuMHPfW6u` |
| Vercel production URL | `https://bytelite-website.vercel.app` |
| GitHub repository | `TBroadwater87/bytelite-website` (PUBLIC) |
| Production branch | `main` |
| Custom domain | `www.thebytelite.com` (apex `thebytelite.com` redirects to it) |
| DNS provider | Cloudflare |
| Outbound mail | SendGrid, authenticated sending domain `thebytelite.com` |
| Contact recipient | `tash@thebytelite.com` |
| Contact sender | `noreply@thebytelite.com` |
| Patent | US 63/807,027 (pending) |

Environment variable NAMES required in Vercel Production: `SENDGRID_API_KEY`,
`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Values live only in Vercel.

---

**Last verified: 2026-08-25, against commit 8ea2de6.**
Re-verify with section 9 before trusting any line of this document.

**Website active development is FROZEN.** The machine-readable checkpoint a future agent should
resume from is `reports/WEBSITE_AUTHORITATIVE_HANDOFF.md`. Read CLAUDE.md, then this file, then
that handoff, then `git status` - and only then inspect deltas. Do not re-scout the hosting,
domain, mail or security questions; they are settled and the evidence is recorded.

---

## 21. Live Deep Kore Chat - Owner Runbook

Added 2026-09-01. The law for this feature is `CLAUDE.md` section 19; this section is how you
actually stand it up, verify it, and switch it off again.

**Nothing in this runbook has been executed.** No tunnel, DNS record, Access application,
Turnstile key, Vercel variable or Windows service exists yet. Every step below is yours, because
every one of them either creates a credential or exposes something to the internet.

**Never paste a secret value into this repository, a commit message, a log, a screenshot or a
report.** Variables are referred to by NAME throughout, which is deliberate.

### 21.1 What the pieces are

| Piece | Where it lives | What it is |
|---|---|---|
| `dk_session_worker.exe` | Deep Kore repo, `Source/build/<config>/` | One process per chat session. Holds one engine with no knowledge path, so durable writes are impossible. Speaks DKW1 on stdio. |
| `deep_kore_gateway.exe` | Deep Kore repo, `Workbench/deep_kore_gateway/bin/<config>/net8.0-windows/win-x64/` | Loopback HTTP host. Owns the workers, runs turns outside the HTTP request, hands out job ids. |
| Cloudflare Tunnel | Your Cloudflare account | Publishes the loopback gateway at a hostname without opening a port. |
| Cloudflare Access | Your Cloudflare account | Stands in front of that hostname. The website presents a service token; nobody else gets through. |
| The website routes | This repo, `api/deep-kore/` | The only thing that knows the origin's address or holds a credential for it. |

Requests only ever flow one way: browser to this site, this site to the origin. The browser never
addresses the origin and is never given anything that could.

### 21.2 Build both components

```powershell
# Deep Kore worker (the session host)
cd D:\LLC_Projects\DeepKore
cmake -S Source -B Source\build
cmake --build Source\build --config Release --target dk_session_worker

# The gateway
cd D:\LLC_Projects\DeepKore\Workbench\deep_kore_gateway
dotnet build -c Release
```

Prove the pair works before anything is exposed:

```powershell
cd D:\LLC_Projects\DeepKore
cmake --build Source\build --config Debug --target test_public_chat_governed_path
Source\build\Debug\test_public_chat_governed_path.exe
```

That runs 32 assertions across the governed facade and the real DKW1 wire, including a
byte-identical determinism proof across two independent worker processes. It must print
`0 failure(s)`. If it does not, stop here - nothing downstream is worth configuring.

### 21.3 Run the gateway on Windows

Three variables, all required, none with a default. The gateway refuses to start if any is
missing, if the bind address is not loopback, if the token is shorter than 32 characters, or if
the worker path does not exist.

| Variable | What you set it to |
|---|---|
| `DEEP_KORE_BIND_URL` | A loopback URL with a port you choose, e.g. `http://127.0.0.1:<port>/`. It must be loopback - a non-loopback bind is refused. |
| `DEEP_KORE_GATEWAY_TOKEN` | A long random value you generate. The website sends it as a bearer; the gateway compares it in fixed time. |
| `DEEP_KORE_WORKER_PATH` | Full path to `dk_session_worker.exe` from the build above. |

Measured on this machine: `HttpListener` bound `http://127.0.0.1:<port>/` as the ordinary
logged-in user with **no URL ACL required**. If you run it as a service under a different
account and binding fails, the gateway says so by exception type and you add the ACL with
`netsh http add urlacl`.

Supervision is your choice - a Windows service wrapper, Task Scheduler at logon, or a console
window while you are testing. Whatever you choose, the account it runs as must be able to start
the worker executable.

### 21.4 Cloudflare Tunnel

Publish the loopback gateway at a hostname. Do this from the machine running the gateway.

1. `cloudflared tunnel login`, then create a named tunnel.
2. Route it to a hostname on `thebytelite.com`. Use a dedicated subdomain; do **not** point it at
   `www` or the apex, both of which serve the website from Vercel.
3. Configure the tunnel's ingress to your `DEEP_KORE_BIND_URL`.
4. Install it as a service so it survives a reboot.

**This creates a DNS record at Cloudflare.** Cloudflare is the authoritative DNS provider for
this domain and is **not** the website host - see section 4. Adding a tunnel hostname must not
touch the `www` CNAME to `cname.vercel-dns.com`.

### 21.5 Cloudflare Access

The tunnel hostname is public the moment it exists. Put Access in front of it in the same sitting.

1. Create an Access application for that hostname.
2. Create a **service token** for it.
3. Add a policy that allows that service token and nothing else. No email rule, no country rule,
   no bypass. The only client is this website.

You will be shown a client id and a client secret **once**. They go into Vercel (21.7) and
nowhere else.

### 21.6 Turnstile (only for the anonymous public phase)

Skip this entirely while the phase is `private_alpha`.

1. Create a Turnstile widget for `www.thebytelite.com`.
2. The **site key** is public by design - it is set as `PUBLIC_TURNSTILE_SITE_KEY` and appears in
   the page. The **secret key** is `TURNSTILE_SECRET_KEY` and is server-side only.
3. The CSP in `vercel.json` already allows `https://challenges.cloudflare.com` in `script-src`
   and `frame-src`, which is what the widget needs. **Load `/deep-kore` in a real browser with
   devtools open after setting the site key** and confirm there are no CSP violations - a CSP
   error is invisible to a static reading of the source and to a test run.

### 21.7 Vercel environment variables

Set these on the **bytelite-website** project under the **ByteLite_LLC** team. Names only; you
enter the values.

| Variable | Required when | Notes |
|---|---|---|
| `DEEP_KORE_CHAT_PHASE` | always | `disabled`, `private_alpha` or `public`. Anything else - including a typo - is treated as `disabled`. |
| `DEEP_KORE_ORIGIN_URL` | phase not `disabled` | `https://<your tunnel hostname>`. Never a loopback address; Vercel cannot reach your machine directly. |
| `DEEP_KORE_ACCESS_CLIENT_ID` | phase not `disabled` | From 21.5. |
| `DEEP_KORE_ACCESS_CLIENT_SECRET` | phase not `disabled` | From 21.5. |
| `DEEP_KORE_GATEWAY_TOKEN` | phase not `disabled` | The same value as `DEEP_KORE_GATEWAY_TOKEN` on the Windows machine. |
| `DEEP_KORE_SESSION_SECRET` | phase not `disabled` | Generated for this purpose and used nowhere else. It signs the session cookie. See 21.7a. |
| `TURNSTILE_SECRET_KEY` | phase `public` only | From 21.6. |
| `PUBLIC_TURNSTILE_SITE_KEY` | phase `public` only | Public by design. `PUBLIC_` means Astro inlines it into the browser bundle - which is correct here and would be catastrophic for any of the rows above it. |
| `DEEP_KORE_PUBLIC_CANON_VERSION` | optional | Echoed to the page. Cosmetic. |

On the WINDOWS machine, alongside the three in 21.3, one more is optional:

| Variable | Required when | Notes |
|---|---|---|
| `DEEP_KORE_MAX_SESSIONS` | **always** | The maximum number of chat sessions this host may own at once. **No default**; the gateway refuses to start without it, and refuses zero, negative, malformed or overflowing values. Do not guess it - see 21.11 for the measurements taken on this machine. |
| `DEEP_KORE_SESSION_IDLE_SECONDS` | never | The terminal-idle window in seconds. Unset means the decided default, **1800** (30 minutes). A present but malformed value refuses to start rather than silently falling back - a typo in the setting that governs how long processes live must not pass unnoticed. Zero is legal and is a test value; do not use it in production. |

**Never rename any of the server-side variables with a `PUBLIC_` prefix.** Astro inlines every
`PUBLIC_` variable into the browser bundle, which would publish the credential to every visitor.
This is the same rule as `STRIPE_SECRET_KEY` in section 15 of `CLAUDE.md`, and for the same
reason.

Leaving `DEEP_KORE_CHAT_PHASE` unset is a valid, safe state: the page renders, the control is
there, and starting a session answers 503 and does nothing.

### 21.7a Generating DEEP_KORE_SESSION_SECRET

Approved 2026-09-01. This value signs the cookie that binds a browser to its Deep Kore
session. If it is guessable, anyone can mint a session cookie for any session id.

Generate 32 random bytes, on this machine, in PowerShell:

```powershell
# 32 cryptographically random bytes, base64 -> 44 characters.
$b = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
[Convert]::ToBase64String($b)
```

Copy the printed value straight into the Vercel environment field, then close the window.

Rules the code enforces, so a mistake fails closed rather than serving:

- **At least 32 characters.** A shorter value is refused and the routes answer `503`. This is a
  floor that catches a typed password, not a strength claim.
- **Distinct from every other credential.** If it is identical to `DEEP_KORE_GATEWAY_TOKEN`,
  either Access credential, or `TURNSTILE_SECRET_KEY`, the routes refuse to serve. Reusing one
  secret means one leak crosses two boundaries, and a hurried copy-paste between Vercel fields is
  exactly how that happens.
- **Absent means off.** No default exists, insecure or otherwise.

Rules only you can keep:

- Do not derive it from a ByteLite, Stripe, Cloudflare or Deep Kore credential, or from anything
  memorable.
- Do not give it a `PUBLIC_` name, ever. Astro inlines every `PUBLIC_` variable into the browser
  bundle.
- Do not paste it into this repository, a commit, a ticket, a chat, a log or a screenshot.

**Rotating it** invalidates every session cookie in the wild. Visitors mid-conversation get "No
session is open. Start one to continue." and start again; nothing is lost but their scrollback.
Rotate on any suspicion of exposure.

### 21.7b The session lifecycle, exactly

A session is **one worker process** holding **one engine** with no knowledge path. It exists in
memory and nowhere else.

**It is created** when a visitor selects "Start a private session" and the server accepts. The
server generates the session id - the browser never chooses one - and returns it inside a cookie
signed with `DEEP_KORE_SESSION_SECRET`.

**It ends in exactly two ways.**

| How | What happens |
|---|---|
| The visitor selects **"End and delete session"** | The origin disposes the worker and **waits for the process to exit** before answering. The page reports success only on that answer. A delete that failed says so, keeps the transcript, and leaves the session open to be ended again. |
| **30 minutes of terminal idleness** | A sweep in the gateway ends sessions nobody came back to - a crashed browser, a killed tab, a lost network. Set by `DEEP_KORE_SESSION_IDLE_SECONDS`, default `1800`. |

Restarting the gateway also clears every session, because they only ever existed in its workers'
memory.

**Closing a tab, reloading, or navigating away does NOT end a session.** The page used to send a
delete on `pagehide` and no longer does, by owner decision. `pagehide` fires on ordinary
navigation - so treating it as deletion destroys sessions people are still using - and it does
not fire on a crash, so the case it existed for is the one case it could not cover. An abandoned
session is now handled by the 30-minute rule instead, which does not need the browser to be alive
to say goodbye.

**THE IDLE POLICY NEVER LIMITS COGNITION.** This is the part to be sure of:

- A session with a turn in flight is **never** eligible for reaping, whatever the clock says. The
  eligibility check tests for an active job first and refuses, at any window including zero.
- The idle clock does not run during a turn. It restarts when cognition returns its own terminal
  result, so a turn that took an hour does not leave its session instantly reapable.
- Every authenticated request restarts the clock, so reading, thinking, or waiting for a slow
  answer all count as being present.
- There is no cognition timeout, no maximum poll count, no iteration limit and no token limit
  anywhere in this path. The only deadline in the website is 10 seconds on a single HTTP hop,
  which exists so a stalled origin cannot pin a compute slot; it does not bound a turn.

You can verify the whole policy yourself:

```powershell
$env:DEEP_KORE_GATEWAY_EXE = "<...>\deep_kore_gateway.exe"
$env:DEEP_KORE_WORKER_EXE  = "<...>\dk_session_worker.exe"
npm run test:e2e:live
```

The lifecycle spec starts its own gateways on their own ports with the idle window set to zero -
the condition under which a session mid-turn would be reaped on the very next sweep if the
active-job guard were missing. The turn completing is the proof.

**Watch the process count while you test.** `Get-Process dk_session_worker` should fall back to
zero after sessions end. If it climbs and stays, something is holding sessions open.

### 21.7c What the site tells visitors, and what has to stay true

The chat disclosure is **owner-approved language with exactly one source**: `PRIVACY_DISCLOSURE`
in `src/data/deep-kore.ts`. It is rendered verbatim in two places - the privacy section of
`/deep-kore` and the live-chat section of `/privacy` - and a test asserts both match it exactly.

**Never paraphrase it in a page.** A promise made on the page and the policy recording it must be
the same words. If it has to change, change the constant, once.

`/privacy` carries its own revision marker ("Last updated"), which moved to September 2026 for
this change because the page promises that material changes are dated. Move it again whenever
this language does.

Four claims in that text are things the system has to keep true. If any of them stops being true,
the language is wrong and must change with it - not the other way round:

| The disclosure says | What keeps it true |
|---|---|
| Chat content is in temporary service memory and is not retained as a central conversation history | Each session's engine has an empty knowledge path, so every durable write in the engine is guarded behind a check that cannot pass. It is not a setting that can be flipped. |
| The session is removed on explicit deletion, after 30 minutes of completed inactivity, or when the service restarts | Those are the only three, and 21.7b is how each works. There is no fourth. |
| Active cognition is not terminated by the inactivity policy | The eligibility check refuses any session with a job in flight, at any window including zero. |
| ByteLite LLC does not sell chat content or use it for advertising | Nothing stores it to sell. There is no transcript, no analytics on this path, and no third-party AI provider anywhere in it. |

**Logging is part of this promise, not separate from it.** Before the language was published, every
log was audited against one list: prompts, responses, cookies, session identifiers, bearer
credentials, `GOV_STAMP`, `state_hash`, private engine output. Two things were changed:

- the reaper logged the **session id** of each session it ended, and now logs a count instead - an
  id in a log is a handle to a live conversation, and logs travel further than the process that
  wrote them;
- the gateway now **drains and discards** the worker's stderr rather than leaving the pipe unread,
  which both closes a latent deadlock and guarantees worker output has no path into a log.

Everything else already recorded types and variable names only. A unit test drives a complete
successful turn and fails if any of that list reaches a console channel.

**If you add logging, monitoring or an error tracker to this path, re-run that audit.** An
exception reporter that captures request bodies would put visitor prompts into a third-party
service and make the published disclosure false.

### 21.8 Turn it on, and prove it in this order

Each step proves one thing. Do not merge them, and do not infer an earlier one from a later one.

```powershell
# 1. The gateway is up and refuses an unauthenticated caller.
#    Expect 401. A 200 here means the token check is not running.
curl.exe -i -X POST "$env:DEEP_KORE_BIND_URL`v1/sessions" -H "Content-Type: application/json" -d "{}"

# 2. The tunnel reaches it. Expect Cloudflare Access's own challenge, NOT a 401 from the
#    gateway. Seeing the gateway's 401 here means Access is not in front of the hostname.
curl.exe -i "https://<tunnel-hostname>/v1/sessions"

# 3. The site's own route is live and fails closed while the phase is unset.
#    Expect 503 {"error_code":"chat_disabled"}.
curl.exe -i -X POST "https://www.thebytelite.com/api/deep-kore/session" `
  -H "Content-Type: application/json" -d "{}"

# 4. A non-JSON POST is refused before the body is read. Expect 415.
curl.exe -i -X POST "https://www.thebytelite.com/api/deep-kore/session" `
  -H "Content-Type: application/x-www-form-urlencoded" -d "persona=AIYA"

# 5. Wrong verb. Expect 405 with an Allow header.
curl.exe -i "https://www.thebytelite.com/api/deep-kore/session"
```

Then set `DEEP_KORE_CHAT_PHASE=private_alpha`, redeploy, and **use a real browser**:

6. Load `https://www.thebytelite.com/deep-kore`. The page renders whether or not the engine is
   reachable - that is deliberate, so the built HTML never claims something the runtime
   contradicts. **A page that looks fine proves nothing.**
7. Click **Start a private session**. A session cookie appears; no answer appears.
8. Ask a question. The request returns 202 with a job id and the page begins polling. A response
   appears with a governance stamp under it.
9. Stop the gateway process, ask again. The page must say the system could not be reached and
   must show **no conversation entry**. If anything answers you at this point, something has a
   fallback and it must be found and removed before this goes public.
10. Click **End and delete session**. The cookies clear, and `Get-Process dk_session_worker`
    drops by one. Success is reported only after the worker has actually exited, so if the
    control says it succeeded, it did.
11. **Reload the page mid-session.** The transcript is gone - it lived in the page - but the
    session is not: the cookie survives and the session is still usable. A reload is not a
    deletion, and nothing on this path treats it as one.

Steps 6 to 10 are also automated, so you do not have to do them by hand every time:

```powershell
# Point it at whatever is serving the site WITH the functions attached, then:
$env:DEEP_KORE_LIVE_BASE_URL = "https://www.thebytelite.com"
npm run test:e2e:live
```

That runs `tests/live/deep-kore-live.spec.ts` on three browser engines: a session opens, a
question is answered, the answer carries a governance record, two independent sessions answer
identically, no private diagnostic reaches the browser, a full turn produces no console error or
CSP violation, and - the important one - an unreachable engine produces an error and **no
conversation**.

It is deliberately **not** part of `npm run test:e2e`. That suite must stay hermetic; this one
needs a live Windows service, and a test that self-skips when its dependency is missing reports
success while proving nothing. It fails loudly instead.

Only after all eleven does `public` make sense, and `public` additionally requires 21.6
and a decision on 21.10.

### 21.8a Running the live proof locally, without a deployment

Added 2026-09-04. The live specs need a server that answers BOTH halves of what a visitor
touches - the built `/deep-kore` page AND the real `/api/deep-kore/*` handlers. In production
Vercel does both. `astro preview` serves only the first, so before this the live lane could not
run at all without deploying.

`scripts/deep-kore-live-harness.mjs` closes that. It loads the SAME handler modules Vercel loads,
gives them a real Node request and response, and reads the same environment-variable names. It is
not a mock and not a second architecture: if any of the request path, cookie rules, CSRF check or
origin call were reimplemented there, a pass would prove nothing about production.

```powershell
# 1. The gateway (one console window), per 21.3.
$env:DEEP_KORE_BIND_URL      = "http://127.0.0.1:<port>/"
$env:DEEP_KORE_GATEWAY_TOKEN = "<a long random value you generate>"
$env:DEEP_KORE_WORKER_PATH   = "<...>\dk_session_worker.exe"
$env:DEEP_KORE_MAX_SESSIONS  = "<your measured number>"
& "<...>\deep_kore_gateway.exe"

# 2. The teaching broker (a second window), only for the consent rows.
#    ISOLATED, so nothing touches your real queue under %LOCALAPPDATA%.
$env:DEEP_KORE_TEACHING_QUEUE_ROOT            = "<a scratch directory>"
$env:DEEP_KORE_TEACHING_QUEUE_REQUIRE_ISOLATED = "1"
$env:DEEP_KORE_GATEWAY_SID = ([System.Security.Principal.WindowsIdentity]::GetCurrent()).User.Value
& "<...>\dk_teaching_broker.exe"

# 3. The site (a third window).
npm run build
$env:DEEP_KORE_CHAT_PHASE           = "private_alpha"
$env:DEEP_KORE_ORIGIN_URL           = "http://127.0.0.1:<gateway port>"
$env:DEEP_KORE_GATEWAY_TOKEN        = "<the same token>"
$env:DEEP_KORE_SESSION_SECRET       = "<32+ random bytes, generated for this, see 21.7a>"
$env:DEEP_KORE_ACCESS_CLIENT_ID     = "local"
$env:DEEP_KORE_ACCESS_CLIENT_SECRET = "local"
node scripts/deep-kore-live-harness.mjs

# 4. The proof.
npm run test:e2e:live
```

**The two Access placeholders are the only difference from production, and they are a difference
in the environment rather than in any code path.** `missingConfig` requires them, correctly -
production must refuse to run without them - and loopback has no Cloudflare Access in front of it,
so the gateway simply ignores the headers they produce.

**The harness is deliberately not wired in as a Playwright `webServer`.** The stack spans two
processes in another repository; starting one automatically would make it easy to run this suite
against a gateway that is not there and read the resulting failures as product defects.

**Watch `Get-Process dk_session_worker` while it runs.** Every live spec now releases its session
in an `afterEach`, and the count should return to zero between files. If it climbs and stays,
something is holding sessions open - and once the count reaches `DEEP_KORE_MAX_SESSIONS`, every
remaining test fails at session creation in a way that looks exactly like the service being down.
That was measured on 2026-09-04 with a ceiling of six: the seventh test onward could not open a
session, and the cause was a missing cleanup hook rather than anything about the product.


### 21.9 The kill switch

Set `DEEP_KORE_CHAT_PHASE=disabled` and redeploy. Every route refuses immediately at the server;
the page still loads and says live chat is not open. That is the correct emergency stop - it does
not depend on the Windows machine, the tunnel, or Access being reachable.

Stopping the gateway process is a *second*, independent stop: the site then reports the origin
as unreachable, honestly, and still answers nothing.

### 21.10 The one number still yours to set

Abandoned sessions **are** now reaped (21.7b), and the number of simultaneous sessions **is** now
bounded - the contract is built and proven. What remains is the value:

**`DEEP_KORE_MAX_SESSIONS` has no default and the gateway will not start without it.** Section
21.11 has the measurements taken on this machine so you can choose one.

**Re-measured 2026-09-03 against the complete path. `DEEP_KORE_MAX_SESSIONS=6` is CONFIRMED, and
now for measured reasons rather than provisional ones.** The matrix is in 21.12. The headline is
that a worker now costs **682 MB**, because it loads its own copy of the canonical 212,446-concept
snapshot - a cost that did not exist when 21.11 was taken. Memory, not CPU, is the binding
constraint.

**Provisional value recorded 2026-09-02 by owner decision: `DEEP_KORE_MAX_SESSIONS=6`.**

Three things about that decision are load-bearing and must not be quietly simplified:

- It is **provisional**, and the owner attached a re-verification condition to it: the number is
  to be re-measured **after** the complete Deep Kore cognition path is connected, because the
  arrival matrix in 21.11 was taken against the worker as it exists today. A worker that also
  holds a bootstrap concept graph is a materially different memory and startup profile, so 21.11's
  numbers would no longer describe the thing being bounded.
- It is **still a required deployment variable, with no code default**, by explicit owner
  instruction. Recording a value in this document does not create one in the gateway: the gateway
  still refuses to start when the variable is absent, zero, negative, malformed or overflowing.
  Writing `6` into a fallback would convert an owner decision into a code assumption, which is the
  exact failure 21.10 and the capacity law in `CLAUDE.md` section 19 exist to prevent.
- It is a value for **this machine**, recorded beside the measurements it was chosen against. It
  does not travel to a different host.

Two things had to be decided together, and only one of them is a number. The other is **what a
visitor is told when the host is full**, and it matters as much: without a distinct message, a
full service says "could not be reached", which describes an outage. You settled that - the two
codes and their wording are implemented and tested.

**A correction you should have.** An earlier draft of this section said a leaking test suite had
reached 46 concurrent workers "at which point the next turn failed", and treated that as the
machine's ceiling. **On measurement that was wrong and it has been withdrawn.** A worker is about
5 MB of working set and four threads, so 46 of them is roughly 270 MB on a 32 GB machine - not
close to any limit. The leak was a real defect and fixing it was right; the explanation attached
to the failure that followed was asserted rather than proven, and the true cause is not known. It
is recorded here so nobody later mistakes 46 for evidence.

### 21.11 Capacity evidence, measured 2026-09-01

Measured on this machine, with the **Release** worker and the current gateway. No
crash-to-find-the-limit run was performed and none should be: the numbers below are observations,
and the last table is the only place a recommendation appears.

**Machine**

| | |
|---|---|
| Logical processors | 12 (1 physical package) |
| Installed memory | 31.93 GB |
| Free memory at measurement | 13.89 GB |
| OpenMP | **OFF** (`DEEP_KORE_ENABLE_OPENMP:BOOL=OFF` in the configured cache) |

**Footprint**

| | |
|---|---|
| Gateway, idle | 27.1 MB working set, 13 threads |
| Gateway, holding 3 sessions | 33.0 MB, 18 threads, 320 handles |
| Worker, idle session (Release) | **5.0-5.4 MB** working set, 0.9 MB private, **4 threads**, 60 handles |
| Worker, peak during a real turn | **5.8 MB** working set, still 4 threads |
| Worker, idle session (Debug) | 5.9 MB, 0.9 MB private, 4 threads |
| 3 sessions, peak total worker memory | 16.2 MB |

Four threads per worker is the ordinary Windows/CRT baseline, **not** a parallel fan-out: OpenMP
is off, and the thread count does not move during a turn. There is no per-worker thread
multiplication to account for.

**Cost of arrival, which is the real cost**

| | |
|---|---|
| Session creation, first (cold) | 107 ms |
| Session creation, subsequent | 47 ms, 33 ms |
| One governed turn, end to end | 31-35 ms observed |

A session costs a **process spawn plus engine construction** - tens of milliseconds of CPU - and
then almost nothing to hold. That is the shape of the load: bursts of arrivals cost far more than
concurrency does.

**Concurrency actually exercised**

| | |
|---|---|
| Maximum sessions held simultaneously (deliberate measurement) | 3 |
| Maximum simultaneous real turns **proven** | **3** - three submitted within a 12 ms spread, all three still in flight when the first completed, all three succeeded |
| Maximum workers observed at once, ever | 46 (a test-suite leak, idle, not turning - see 21.10) |
| Simultaneous session creations exercised by the suite | 10 attempted against a ceiling of 3; exactly 3 admitted |

**Shared resources**

| | |
|---|---|
| Files written under `Data\` by a worker | **0** |
| Files written in the worker directory | **0** |
| Engine-owned shared resource constraining simultaneous workers | **None found** |

Each worker holds one engine with an empty knowledge path, so there is no shared writable store,
no lock file, and no database. Workers are independent processes sharing only read-only code.

**Return to baseline**

| | |
|---|---|
| Workers after explicit deletion of every session | 0 |
| Workers after the gateway stops | 0 |
| Returned to baseline | **Yes** |
| Workers after the full three-engine live suite | **0** |

**The three facts, kept separate**

| | Value | What it rests on |
|---|---|---|
| Maximum sessions **held** | 46 | Observed once, accidentally, idle. Not a limit and not a recommendation. |
| Maximum simultaneous cognition turns **proven** | **3** | Directly measured, with overlap established from timestamps. |
| Maximum simultaneous cognition turns **advisable** | **Not established** | Would require a deliberate concurrency ramp, which was explicitly not run. |

**What the evidence does and does not support.** Memory is plainly not the near-term constraint:
even a hundred idle sessions would be roughly half a gigabyte. The constraint worth respecting is
CPU during arrival - each new session spends tens of milliseconds constructing an engine, and a
burst of simultaneous arrivals contends for the same 12 processors. Nothing here measures where
that becomes a problem.

**Choosing the value.** A defensible first setting is one that is comfortably below anything
measured to strain, that you can afford to have fully occupied, and that you are willing to see in
use while `private_alpha` is the phase. Set it, watch `Get-Process dk_session_worker` under real
use, and raise it deliberately. **Do not adopt 46**, and do not derive a number from the memory
figures above - they show what a session costs to *hold*, not what a burst costs to *create*.

### 21.11b Capacity re-measured 2026-09-03, against the COMPLETE path

21.11 measured the worker as it was before the Public Chat Cognition Session integration: a
governed conversational engine and nothing else. That worker no longer exists. The one that ships
now loads the canonical **212,446-concept** snapshot at startup, so the numbers below replace
21.11's for the purpose of choosing a ceiling. 21.11 stays for the record.

One worker process per session, exactly as the gateway spawns them. Release build, Vanguard ON.

| Sessions | Cold start (all READY) | First turn | Warm turn | Peak working set | Peak private | Threads | Distinct first-turn frames | Teardown | Leaked workers |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 5,681 ms | 48 ms | 3,815 ms | **682.2 MB** | 700.3 MB | 4 | 1 | 911 ms | 0 |
| 6 | 9,111 ms | 20 ms | 3,954 ms | **4,093.6 MB** | 4,202.6 MB | 21 | 1 | 4,781 ms | 0 |
| 12 | 14,625 ms | 43 ms | 3,857 ms | **8,185.2 MB** | 8,403.8 MB | 40 | 1 | 9,908 ms | 0 |

Host at measurement: 15,438 MB free physical, 12 logical processors.

**What these say.**

- **A session costs 682 MB, and the cost is the snapshot.** It scales linearly with sessions
  because each worker process holds its own copy. This is the single dominant number, and it is
  new: the pre-integration worker was a rounding error by comparison.
- **Memory is the binding constraint, not CPU.** A warm turn takes ~3.9 s whether one session is
  running or twelve - twelve single-threaded workers on twelve logical processors do not contend.
- **"Distinct first-turn frames = 1" at every level** means every concurrent session, given
  identical input, produced byte-identical output. Concurrency does not perturb determinism.
- **Zero leaked workers at every level**, and teardown scales linearly.

**Recommendation: keep `DEEP_KORE_MAX_SESSIONS=6`, now confirmed rather than provisional.** At 6 the
host holds 4.1 GB of workers, about 27% of free memory, leaving room for the OS, the gateway, the
browser and a burst. 12 is demonstrably survivable - it completed with no failures - but it takes
8.2 GB, over half the free memory, and triples teardown. 6 is the value that can be fully occupied
without the machine being near anything.

**The one change that would move this number a lot.** The 682 MB is per PROCESS, and the snapshot
inside it is immutable and already designed to be shared: `SessionConceptGraph` holds a base
reference plus a private overlay precisely so one process can host many sessions on one copy. A
multi-session host would take 6 sessions from ~4.1 GB to roughly one snapshot plus per-session
state. That host does not exist yet, and until it does the ceiling is really a memory division.

### 21.11c `DEEP_KORE_TEACHING_MAX_RECORD_BYTES` - WITHDRAWN 2026-09-09, and why

**This setting no longer exists.** The certified broker at
`d3a4f5af4d433838d473ff74cd370721c477fbdf` does not read it, does not define it, and no longer
carries the `ERR_RECORD_TOO_LARGE` refusal that enforced it. The Deep Kore release records the same
fact as `OWNER_ARBITRARY_TEACHING_SIZE_LIMIT = ABSENT`. **Do not set it, and do not reintroduce it.**

The measurements below are KEPT, because they are still the reason the limit was wrong. They were
re-confirmed on 2026-09-09 against the corrected release: a live public candidate produced a
DPAPI-protected record whose decrypted plaintext measured **711,508 bytes** with a
`candidate_sequence_length` of **35494** - matching the original figures exactly, and confirming the
canonical sequence is stored whole rather than trimmed to fit any ceiling.

**Why the cap was the wrong shape.** It was a transport bound applied to a canonical identity, so an
owner-chosen number decided which concepts could be taught at all. Refusing rather than truncating
was the correct half - the sequence was never silently corrupted - but a refusal driven by an
arbitrary ceiling still discards a lawful candidate for a reason that has nothing to do with the
candidate. The broker now bounds the small fields and deliberately does not bound
`structural_identity_key`.

**The historical record of the setting follows, for reading old evidence files only.** It had no
default, and missing, zero, non-numeric or overflowing values all stopped startup.

It bounds one queue record. The measured basis: a real public candidate whose concept carried
**35,494 candidate placements** produced a canonical identity of **710,219 bytes** and a complete
DPAPI-protected record of **711,508 bytes**. A different sentence, stalling on the copula, produced
**36,876** placements and **735,046** bytes.

A record over the ceiling is refused **before any durable write** - nothing partial is written and
no candidate is ever truncated to fit, because truncating the sequence would change the canonical
identity and corrupt the deduplication law.

#### 21.11c-i THE INTRINSIC-MAXIMUM DETERMINATION, asked for 2026-09-04

The owner asked whether an intrinsic maximum already exists in the canonical wire or record
format, rather than a number being chosen. Read against Deep Kore at `b75aaef`:

**No intrinsic maximum exists for the record, and the record is canonically self-delimiting.**

- The durable store is `[u32 length-prefix][DPAPI-protected blob]`, appended
  (`teaching_record_framing.hpp`). Every record delimits itself. Nothing has to know a maximum in
  order to read one, and a truncated write is detected by the boundary plus decrypt failure - not
  by a size rule.
- The wire frame is `DKTB1` magic, `u32` op, `u32` payload length, then length-prefixed fields.
  Also self-delimiting.
- The field that actually grows is `structural_identity_key`, and it **IS** the complete sorted
  candidate-ID sequence. Its length is a function of how many candidate placements the concept
  carries, and nothing in either format bounds that count. `teaching_case.hpp` says so directly:
  it is "stored WHOLE and is never trimmed, sampled, reordered or partially stored".

The only ceiling anywhere is **4,294,967,295** bytes, which is `2^32 - 1` and exists solely
because the length prefix is 32 bits. That is a REPRESENTATIONAL limit of the encoding, not a
statement about how large a record may be, and it derives nothing.

**So the variable conflicts with the architecture**, and the conflict is visible in the fact that
it currently does two incompatible jobs:

| Where | What it does | What it should be |
|---|---|---|
| `payload_len > g_max_record_bytes` (line 396) | Bounds a **hostile declared length before the allocation it would cause**. Legitimate, necessary, and exactly the same class as `MAX_SMALL_FIELD_BYTES`. | A framing constant in the broker's own law. Wants to be as SMALL as possible. |
| `read_field(cur, structural_identity_key, g_max_record_bytes)` (line 422) | Bounds the **canonical identity**, so an owner-chosen number decides which lawful candidates can ever be queued. | Nothing. Wants to be as LARGE as possible, ideally absent. |

One variable cannot be both, and that is why no non-arbitrary value exists: every candidate value
is simultaneously too large for the first job and too small for the second.

**The measured 711,508 and 735,046-byte records bound nothing.** They are two observations of two
particular concepts. Padding either one into an operational limit would be inventing exactly the
arbitrary ceiling this determination was asked to avoid, and it would still refuse the first
concept that happened to be larger.

**The correction belongs to the Deep Kore repository and was NOT made in this website pass** -
that repository is owned by a concurrent session and this pass is read-only there. Stated for
whoever does make it: keep a framing bound on `payload_len`, as a constant beside
`MAX_SMALL_FIELD_BYTES` with the same justification; stop applying it to
`structural_identity_key`; and remove `DEEP_KORE_TEACHING_MAX_RECORD_BYTES`, because a record
ceiling is not a thing the architecture has room for.

Until that happens the variable is still required to start the broker, and the website's own
proofs set it to a **test** value with an isolated queue root. That value is not a recommendation
and appears in no production guidance.

### 21.12 Things not to do here

- **Do not expose the gateway directly.** It binds loopback and it refuses any other bind. The
  tunnel plus Access is the only exposure path.
- **Do not add a diagnostic endpoint** that reports which Deep Kore variables are set. Section 8
  of `CLAUDE.md` forbids it, and `api/health.ts` is the precedent - a migration probe that
  became a permanent public API by accident.
- **Do not add a fallback.** No model, no cached turn, no scripted answer, no "we're having
  trouble, here's something anyway". A failure is reported as a failure.
- **Do not add a cognition timeout, a retry, or a maximum poll count.** A turn runs to intrinsic
  completion. The only bound in the code is a 10-second deadline on one HTTP hop, which exists
  so a stalled origin cannot pin a compute slot.
- **Do not enable Revelation Vanguard casually.** It is off by default, and turning it on changes
  emitted bytes and moves the determinism baseline that `test_public_chat_governed_path`
  measures.
- **Do not log conversation content anywhere.** There is no consent for it and no retention
  policy. Errors are logged by type only.
- **Do not point the tunnel at `www` or the apex.** Those serve the website from Vercel.

### 21.13 THE WEBSITE'S CONTRACT WITH DEEP KORE

Added 2026-09-04. **This is the cross-repository handoff.** It states only what the website
actually expects, as implemented, and nothing that would merely be convenient. If Deep Kore
changes any of it, this site breaks in a way its tests will catch; if this site needs more than
this, that is a change to be agreed, not assumed.

#### Transport, as implemented

```
browser  --(same-origin, relative paths only)-->  this site's Vercel Functions
         --(Cloudflare Access service token + gateway bearer)-->  deep_kore_gateway
         --(DKW1 over stdio)-->  dk_session_worker  -->  process_governed_turn()
```

The four routes this site calls on the origin, and nothing else:

| Method | Origin path | When |
|---|---|---|
| `POST` | `/v1/sessions` | a visitor starts a session |
| `POST` | `/v1/sessions/{id}/messages` | one turn |
| `GET` | `/v1/jobs/{jobId}` (header `X-DK-Session`) | polling that turn |
| `DELETE` | `/v1/sessions/{id}` | the visitor ends the session |
| `POST` | `/v1/sessions/{id}/consent` and `/decline` | one teaching-candidate decision |

#### What this site SENDS

- **Create session**: `{ "persona": "AIYA" | "AION" }`. Nothing else. The browser may choose the
  identity key and a Turnstile token; it may never choose a price, a model, a prompt, a session
  id, a job id, an origin or any governance setting.
- **Message**: `{ "message_id", "text", "device"? }`.
  - `message_id` is **always server-generated**. When the browser supplies a `turn_key` it becomes
    `HMAC(session_secret, session_id + turn_key)`, so a retry is idempotent while the id stays
    unforgeable and cannot collide across sessions.
  - `device` is optional and, on the public path, carries only **opaque ids and closed enum
    names**: `entities[]` (`entity_id`, `entity_kind`, `relationship_role`, `agreement`),
    `current_message.segments[]` (`ENTITY` references only), `events[]` (`event_id`, `actor`,
    `destination`), `tav_disclosures[]` (`tav_id`, `target_entity_id`, `field`, `decision`).
  - **A `tav_disclosure` NEVER carries a `value`, and a request containing one is refused
    outright** rather than stripped. This is stricter than the canonical Cordel protocol, where a
    GRANTED disclosure does carry the literal. On the public path a grant is a PERMISSION, not a
    disclosure.
  - Unknown keys are **refused at every level**, not ignored.
- **Consent**: `{ "reference" }` to `/consent` or `/decline`. The browser names the opaque
  reference the worker issued and takes a position. It cannot author, alter or substitute a
  candidate.

#### What this site READS, and what it does with the rest

The worker's outcome discriminant is the contract. **Five values, and this site knows exactly
these five:**

| `outcome` | The public state it becomes |
|---|---|
| `ANSWER` (or absent) | `GOVERNED_TEXT` |
| `REFUSAL` | `GOVERNED_REFUSAL` |
| `TAV_REQUIRED` | `TAV_REQUEST` (+ the projected request) |
| `TEACHING_OFFER` | `UNKNOWN_CONCEPT_OFFER` (+ the projected offer) |
| `ENGINE_FAILURE` | `TERMINAL_FAILURE` |

**An outcome outside that set becomes a terminal failure, never a new public state.** An absent
outcome degrades to `GOVERNED_TEXT`, which is the safe reading: it shows the governed answer and
offers nothing.

From `engine`, exactly four things cross to the browser: `text` (or `warmed_text` when the engine
reports Vanguard enabled), `persona`, `gk_passed`, and the **redacted** `gov_stamp`. Everything
else is withheld at the server and never reaches the client bundle: `gk1_decision`,
`gk2_decision`, `transform_count`, `state_hash`, `adult_consent_invariant_violated`,
`vanguard_enabled`, `vanguard_diag`.

`gov_stamp` is redacted by an **allowlist** to `GOV_STAMP`, `gk` and `persona`. It is a redaction
and never a rewrite - surviving segments are the engine's own bytes in the engine's own order. A
segment a future engine adds is withheld by default.

From `tav_request`: `tav_id`, `target_entity_id` (as `entity_ref`), `field`, `purpose`. The field
must be in the closed `TavField` set and the purpose must be exactly
`RESPONSE_REQUIRES_LITERAL_VALUE`; anything else is a fault, not a question.

From `teaching_offer`: `reference` (which must match `^[0-9a-f]{16,128}$`) and `description`.
**`classification` is deliberately NOT read.** It is the engine's own decision vocabulary and
section 3 of `CLAUDE.md` forbids publishing that; the worker already derives a safe
`description` from it, and that is what a visitor sees.

`failure_code` on `ENGINE_FAILURE` is **discarded**. One family of the origin's codes
(`worker_<code>`) is open-ended by construction, so no allowlist here could stay complete, and
what a visitor can act on is identical in every case. It collapses to `turn_failed`. The
diagnostic detail stays where it is useful: the origin's own log.

#### Session semantics this site relies on

- The session id is **server-generated, opaque, and never chosen by the browser**. This site
  signs it into an HttpOnly `__Host-` cookie with HMAC-SHA256; it holds no other session state.
- Submitting a turn answers **202 with a job id**, and the turn runs to intrinsic completion in
  the origin's own process. **Nothing about a Vercel request duration, a fetch deadline or a
  browser tab is a stopping condition for cognition.** The 10-second bound in the site bounds one
  HTTP hop only.
- `queued`, `running`, `succeeded`, `failed` are the **gateway's** transport states. This site
  collapses the first two into one waiting state and never presents any of them as an engine
  state.
- `DELETE` disposes the worker and **waits for the process to exit before answering**. This site
  reports success only on that answer.
- `409` on `DELETE` means a turn is in flight; the site keeps the session rather than overruling.
- Terminal-idle reaping at the origin is **resource cleanup and never a cognition deadline**.
- Capacity (`session_capacity`) and unavailability (`engine_unavailable`) must stay **distinct
  codes on a 503**. The site maps them to two different public codes with two different
  sentences, and merging them upstream would make the site say the wrong thing.

#### Streaming

**There is none, and none is expected.** No token streaming, no partial turn, no server-sent
events. A response is shown when the canonical result is complete, and this site does not
simulate progressive output.

#### Environment variables, by NAME only

Server-side, read at request time inside `api/`:
`DEEP_KORE_CHAT_PHASE`, `DEEP_KORE_ORIGIN_URL`, `DEEP_KORE_ACCESS_CLIENT_ID`,
`DEEP_KORE_ACCESS_CLIENT_SECRET`, `DEEP_KORE_GATEWAY_TOKEN`, `DEEP_KORE_SESSION_SECRET`,
`TURNSTILE_SECRET_KEY` (public phase only), `DEEP_KORE_PUBLIC_CANON_VERSION` (optional).

Browser-visible, and public by design: `PUBLIC_TURNSTILE_SITE_KEY`. A Turnstile **site** key is
not a credential. **No other `PUBLIC_`-prefixed Deep Kore variable may ever exist**, because Astro
inlines those into the browser bundle.

Origin-side, the owner's: `DEEP_KORE_BIND_URL`, `DEEP_KORE_GATEWAY_TOKEN`,
`DEEP_KORE_WORKER_PATH`, `DEEP_KORE_MAX_SESSIONS`, `DEEP_KORE_SESSION_IDLE_SECONDS`,
`DEEP_KORE_TEACHING_QUEUE_ROOT`, `DEEP_KORE_TEACHING_QUEUE_REQUIRE_ISOLATED`,
`DEEP_KORE_GATEWAY_SID`.

`DEEP_KORE_TEACHING_MAX_RECORD_BYTES` was in this list and is **withdrawn** - see 21.11c.

### 21.15 PRODUCTION TRANSPORT - PREPARED 2026-09-10, AWAITING CREDENTIALS

Everything below is settled and needs no further decisions. What remains is authentication that
only the owner can complete. Nothing here contains a secret, and no value here was invented: each
is either read from the repository, read from the deployable package, or is an owner choice marked
as such.

**The deployable package is the ONLY runtime source.**

```
D:\LLC_Projects\DeepKore\Release\public_chat_corrected_d3a4f5af_deployable
```

Verified 2026-09-10: all eight files present, all three certified SHA256 unchanged, and the gateway
**starts from package-only paths** (the earlier package could not - it had no `runtimeconfig.json`,
so the .NET host fell back to self-contained and died on `hostpolicy.dll`). On startup it reports
`provenance: commit=d3a4f5af... clean proto=DKW1` and refuses an unauthenticated request with
`401 {"error_code":"unauthorized"}` - a code and no message, as the public contract requires.
The older `public_chat_corrected_d3a4f5af` directory is historical evidence only.

**The website hardcodes no package path.** Binaries are located at run time through
`DEEP_KORE_WORKER_PATH` (gateway) and `DEEP_KORE_GATEWAY_EXE` / `DEEP_KORE_WORKER_EXE` (the
lifecycle spec). Moving to the deployable package is therefore a configuration change and
invalidates no test result.

**The three services, and which identity each runs as.** This split is the security property, not a
convention: the processes reachable from the internet are exactly the ones with no key to the vault.

| Process | Windows identity | Why |
|---|---|---|
| gateway + workers | unprivileged virtual service account | internet-reachable; must NOT decrypt the queue |
| broker + Workbench | the owner's own account | DPAPI `CURRENT_USER` requires it |

**Tunnel origin.** The tunnel's only destination is the gateway's loopback listener - the value of
`DEEP_KORE_BIND_URL`, which has no default and must be a loopback URI. The port is an owner choice;
local proofs used `18080`. Nothing but the tunnel may reach it, and the browser must never address
it at all.

A minimal `~/.cloudflared/config.yml` once a tunnel exists:

```yaml
tunnel: <tunnel-uuid-from-`cloudflared tunnel list`>
credentials-file: C:\Users\<owner>\.cloudflared\<tunnel-uuid>.json
ingress:
  - hostname: <the Access-protected hostname>
    service: http://127.0.0.1:<the port in DEEP_KORE_BIND_URL>
  - service: http_status:404
```

The trailing catch-all is required by cloudflared and is the right default: anything not the one
named hostname gets 404 rather than reaching the gateway.

**Access is service-to-service, never interactive.** Vercel functions call the origin with
`CF-Access-Client-Id` / `CF-Access-Client-Secret` from `DEEP_KORE_ACCESS_CLIENT_ID` and
`DEEP_KORE_ACCESS_CLIENT_SECRET`. An interactive human-login Access policy would break the server
path, because there is no human in it. Both values are server-only and neither may ever gain a
`PUBLIC_` twin.

**Vercel production values, in the order to set them.** Every name below is the canonical one read
from the source; do not create aliases.

| Variable | Value | Class |
|---|---|---|
| `DEEP_KORE_CHAT_PHASE` | `disabled` | set FIRST, and leave it until the gate passes |
| `DEEP_KORE_ORIGIN_URL` | the Access-protected hostname | server-only |
| `DEEP_KORE_GATEWAY_TOKEN` | 32+ chars, matches the gateway's own | SECRET |
| `DEEP_KORE_SESSION_SECRET` | 32+ random bytes, generated for this and derived from nothing else | SECRET |
| `DEEP_KORE_ACCESS_CLIENT_ID` | Access service token id | SECRET |
| `DEEP_KORE_ACCESS_CLIENT_SECRET` | Access service token secret | SECRET |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile **site** key | browser-safe by design |
| `TURNSTILE_SECRET_KEY` | Turnstile secret | SECRET |

`DEEP_KORE_MAX_SESSIONS` is **origin-side, not Vercel** - it configures the gateway on the Windows
host, where the workers actually live. Its value is `8`.

**Rollback is one variable and one deploy.** Set `DEEP_KORE_CHAT_PHASE` back to `disabled` and
redeploy. `readPhase()` maps anything unset or misspelled to `disabled`, so the failure direction is
already safe: a typo cannot fail open into a live public surface. **If a defect appears after
enablement, disable FIRST and diagnose afterwards** - never leave a broken authority or privacy path
serving the public while it is being investigated.

**What "deployed disabled" must look like before anything is enabled:** the homepage healthy,
`/deep-kore` rendering, session creation refused at the server, no origin credential anywhere in the
browser bundle, and DNS, email, Stripe, Cordel and every unrelated route unchanged.

#### 21.15a Decided and built, 2026-09-11

The owner chose the two values canon keeps as owner gates, and the tunnel was created and proven
against them. None of the identifiers below is a secret; the tunnel credentials file is, and it
lives in `C:\Users\tbroa\.cloudflared\` and nowhere in this repository.

| Item | Value |
|---|---|
| Origin hostname | `dk-origin.thebytelite.com` - owner choice. Deliberately neutral: DNS names are public and appear in certificate-transparency logs, and canon rule 3 keeps the product name off surfaces outside its allowed routes |
| Gateway bind | `DEEP_KORE_BIND_URL = http://127.0.0.1:18080/` - owner choice; the port the full live suite was proven against |
| Tunnel | `deep-kore-origin`, id `d322213f-2065-4e8a-8bec-cae49687c747` - the only Deep Kore tunnel; the two Cordel tunnels were not touched |
| Tunnel config | `C:\Users\tbroa\.cloudflared\deep-kore-origin.yml` - a tunnel-specific file, NOT the default `config.yml`, so it cannot collide with anything a Cordel tunnel reads |
| DNS | proxied CNAME `dk-origin` -> the tunnel, created by `cloudflared tunnel route dns`; the apex and `www` records were verified unchanged afterwards |
| Gateway service SID | `NT SERVICE\DeepKoreGateway` = `S-1-5-80-1328862559-3497750024-723998161-452260922-2304252446`, confirmed with `sc.exe showsid`. This is the value for `DEEP_KORE_GATEWAY_SID` on the broker once the gateway runs under that identity |

**The ingress has one detail that is easy to lose.** The gateway is a .NET `HttpListener` bound to
the prefix `http://127.0.0.1:18080/`, and `HttpListener` refuses any request whose `Host` header
does not match its prefix. cloudflared forwards the public hostname by default, so the rule carries
`originRequest.httpHostHeader: 127.0.0.1:18080`. Without it every request would die at the
listener with a 400 before reaching authentication, which looks like a tunnel fault and is not one.

**What was proven, before Access existed:**

| Check | Result |
|---|---|
| Connectors | four registered across three Seattle edge locations |
| Public request, origin down | `502` from Cloudflare - fails closed |
| Public request, gateway up, no credential | `401 {"error_code":"unauthorized"}` - the gateway's own body, so the whole path and the Host rewrite work |
| Wrong bearer | `401` |
| Unknown path `/admin` | `401` - authentication runs before routing |
| Gateway listening socket | `127.0.0.1:18080` only |
| The host's LAN address on 18080 | not reachable - no direct exposure |
| Any other hostname through this tunnel | the `http_status:404` catch-all |

The gateway ran for that proof only, with a throwaway bearer nobody else held, and was stopped
immediately; the tunnel was stopped afterwards too. **Nothing runs until Access is in front of it.**
A bearer token alone is one barrier, and the architecture requires two.

**Access must be a Service Auth policy, never Allow.** The website sends exactly
`CF-Access-Client-Id` and `CF-Access-Client-Secret` (`api/_lib/deep-kore-core.ts`). An Allow policy
with an identity rule would answer Vercel's server with a login redirect, because there is no human
on that path.

#### Privacy assumptions this site publishes, which Deep Kore must keep true

Each of these is stated to visitors on `/deep-kore` and `/privacy`. If one stops being true, the
published wording is wrong and must change with it - not the other way round.

1. Each session's engine has an **empty knowledge path**, so durable knowledge writes are
   structurally impossible on this path rather than switched off by policy.
2. A consented teaching candidate is written `UNVERIFIED_CANDIDATE`, source class
   `PUBLIC_CHAT_UNTRUSTED`, review state `AWAITING_OWNER_REVIEW`, and **public chat can never
   promote, merge, activate or teach it**.
3. The queue record carries **no conversation, no message text, no governed response, no personal
   identifier and no private value**. `original_surface` is written empty on this path.
4. Conversation content is **not persisted anywhere**, and no log on this path records a prompt,
   a response, a session id, a stamp or a state hash.

#### Version and compatibility assumptions

- The worker protocol is `DKW1`. A worker older than the gateway fails the frame header, and the
  gateway reports `worker_bad_header` - measured 2026-09-04 against a worker two days older than
  the gateway. **Build and deploy the pair together.**
- `MAX_MESSAGE_BYTES` is `8192` in this site and mirrors `GatewayConfig.MaxMessageBytes`. If one
  changes, change the other.
- The site tolerates an **absent** `outcome` (older worker) and refuses an **unrecognised** one.
  That asymmetry is deliberate: an older engine degrades safely, a newer one cannot invent a
  public state.

### 21.14 THE TAV SEAM ON THE PUBLIC PATH - an open owner decision

**Measured 2026-09-04 against the real engine, and this is the finding rather than a defect on
either side.**

```
"List the parts of a zqxjvwkbrump."                        -> outcome = TEACHING_OFFER
the same text, plus a device entity model with a
relationship_role and an ENTITY segment                    -> outcome = TAV_REQUIRED
```

`generate_tav_request` needs the turn's target entity to resolve to exactly one
`StructuralEntityKind`, and on this path the only evidence that can do that comes from the
**device** - `relationship_role` on an entity the message actually references.

A Cordel device has that model. **A public web page does not, and must not invent one.**
Fabricating a `relationship_role` for a stranger would be inventing TAV evidence, which the public
path forbids outright.

So, precisely:

- The TAV interface is **implemented, correct, and fully covered** against a scripted
  `TAV_REQUEST` in `tests/e2e/deep-kore-console-flow.spec.ts` - grants, revocation, one-turn
  consumption, non-transmission, focus handling and mobile layout, on five browser engines.
- It is **not reachable by a visitor today**, because nothing in the public interface supplies an
  entity model.
- `tests/live/deep-kore-tav-and-consent.spec.ts` now asserts that seam directly, so it cannot be
  forgotten and cannot be quietly "fixed" by making the page assert an entity it does not know.

**That decision was taken on 2026-09-04.** The owner authorised the smallest lawful visitor-facing
Private Context surface, and authorised the private literal to cross on an explicit grant for one
turn. The measurement above is unchanged and is the reason the surface exists: the site still
cannot produce a TAV request on its own, and still must not.

### 21.15 THE PRIVATE CONTEXT SURFACE, as built

**Closed by default, optional, and ordinary conversation works without it** - a visitor who just
wants to talk is never asked about their relationships first.

What a visitor does: names an entity for their own benefit, chooses a **relationship role** from
the six canonical enumerators, optionally chooses a **device entity kind** from the seven, and
ticks which message is about it. That is the entire surface.

What crosses: an **opaque random reference** plus the enumerators they chose. **The name never
does** - it exists so they can recognise their own entries, and the reference is not derived from
it. Events are not exposed at all, and `StructuralEntityKind` is never sent: that is what Deep
Kore resolves TO, and sending it would assert the conclusion instead of the evidence.

**The private value.** When the real engine returns a TAV request, the visitor may send one
specific fact for that one answer. Nothing is preselected; taking no action sends nothing. A grant
is consumed before the turn is even sent, so a later question has to ask again. The canonical rule
is mirrored exactly - a value only ever on `GRANTED`, and a non-GRANTED decision carrying one is
refused outright - and this site enforces it independently of the upstream parser.

**Everything is cleared** on use, denial, revocation, removal, explicit clear, session deletion,
terminal failure, navigation and page closure. None of it touches `localStorage`,
`sessionStorage`, IndexedDB, a cookie, a URL, a log, an analytics call or the review queue.

**Four claims here are things the system must keep true**, and if one stops being true the
published copy on `/deep-kore`, `/privacy` and `/terms` is wrong and must change with it - not the
other way round:

| The site says | What keeps it true |
|---|---|
| Nothing is worked out from your messages | `privateContext.ts` has no parser, no lexicon and no transcript access; a test scans its code for them |
| The name you use is never transmitted | `toDeviceEntities()` is the only wire-shape producer and never writes a label |
| A value is used for one answer and then discarded | The vault entry is forgotten in the same breath the disclosure is built |
| Declining sends nothing | The refusal branch never reads the vault, and the disclosure carries no value field |
