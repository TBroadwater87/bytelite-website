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

What the E2E specs individually protect:

| Spec | Protects |
|---|---|
| `critical-paths.spec.ts` | The six public routes work; no public link or nav entry leaves the public allowlist; the forbidden ratio claim is absent |
| `public-scope-vocabulary.spec.ts` | The Owner Law: target and proof stay distinct in both directions; no sibling product name; no internal implementation vocabulary. Checked against rendered text, so a phrase arriving via `src/data/` is caught the same as one typed into a page |
| `pricing-models.spec.ts` | A personal visitor can never conclude they owe a percentage; a business visitor can never mistake the target example for a measured result |
| `public-scope-accessibility.spec.ts` | Overflow, 200% zoom, keyboard navigation and reduced-motion behaviour on every public route |
| `retired-route-rendering.spec.ts` | Retired routes still render correctly, stay `noindex`, and are linked from nowhere |
| `research-and-canonical-truth.spec.ts` | The research section resolves and states hypotheses, not capability |
| `technology-status-claims.spec.ts` | Specific corrected status claims do not silently return |
| `conversion-workflows.spec.ts` | Preorder wording stays non-binding; no paid-order language |

**Dated verification snapshot - not a permanent truth:**

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

Record counts with the commit and the date. A bare "1410/1410" with no anchor is not evidence.

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
| `public/_headers` | Cloudflare Pages header file. Inert on Vercel and served publicly. | Policy text preserved in `src/middleware.ts`; see blocker 2 |
| `public/_routes.json` | Cloudflare Pages function-routing manifest. Meaningless on Vercel. | Vercel routes `api/` automatically |
| `src/pages/api/compress.ts` | POST-only Astro API route in a static build: emitted no file at all (the build log says "file not created, response body was empty") and returned 404 in production. Its rate limiting and CORS protected nothing. Its documented response advertised a compression ratio that must never be claimed. | nothing - it was never deployed |
| `src/components/ProofDemo.astro` | A 114-byte stub whose own comment read "Archived component - not in use by any page" | nothing |

### Removed in the 2026-08-25 closure

| Name | Why removed | Replaced by |
|---|---|---|
| `api/health.ts` | Temporary migration probe for the domain cutover. Its own header said to delete it once contact was confirmed in production; that was confirmed on 2026-08-25. A diagnostic that outlives its migration has become a permanent public endpoint reporting deployment configuration to anyone who asks. | nothing - the facts it reported are available from `vercel env ls`, `vercel alias ls`, and a `GET /api/contact` that expects 405 |
| The `/contact` outage banner (`.ct-outage`) | It announced that form submissions were unavailable. Delivery is now proven end to end, so the banner had become a false statement in the other direction. | Honest error handling, which stayed: a failed submission still says the message was not sent. `public-scope-vocabulary.spec.ts` now asserts the banner's absence *and* that the page does not overpromise. |

### Kept, classified UNKNOWN - do not delete without evidence

| Item | Why it is uncertain |
|---|---|
| `src/pages/api/deepkore-submit.ts` | Its `GET` half prerenders to a real static file, so `/api/deepkore-submit` returns 200 today. Deleting it would change live public behaviour (200 -> 404), which is more than cleanup. Its `POST` half is dead in a static build. It names a retired sibling product on a public URL, so it is worth an owner decision - but it is not this pass's call to make. |
| `src/middleware.ts` | Astro middleware does not run at request time in a static build, so it does not serve the security headers it defines. It is retained because it is the authored record of the intended header policy and would become live if an adapter were ever added. A comment now says so at the top of the file. |
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

**Closed on 2026-08-25**, and moved into section 16 as history rather than deleted:

| Was | Outcome |
|---|---|
| Blocker 1 - custom-domain cutover | **DONE.** `www.thebytelite.com` and the apex both alias the ByteLite_LLC deployment. No Cloudflare DNS change was needed. |
| Blocker 3 - mailbox receipt not confirmed | **DONE.** Confirmed by looking in the destination inbox, not inferred from a 202. |
| Blocker 4 - remove the temporary health probe | **DONE.** `api/health.ts` deleted, and every reference to it in this file and `CLAUDE.md` removed. |

### Blocker 1 - Security headers are not being served (NOT DONE)

Measured 2026-08-24 on both `www.thebytelite.com` and `bytelite-website.vercel.app`:
Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and
Permissions-Policy are **all absent**. Only HSTS is present, and that is Vercel's own default.

The cause is a three-way gap, and all three mechanisms are inert on Vercel:

- `src/middleware.ts` - Astro middleware runs at build time in a static build. The headers it
  sets on the prerender response are discarded; static files are served by the host.
- `astro.config.mjs` `server.headers` - applies to the dev server only.
- `public/_headers` - a Cloudflare Pages file. Vercel ignores it and served it as a public
  static asset. (Removed in this pass; the policy text survives in `src/middleware.ts`.)

**This was not fixed in this pass, deliberately.** Applying a CSP that has never been enforced
against the live site is a real behaviour change with real breakage risk (Google Fonts, Google
Analytics), and it cannot be validated locally - the E2E suite runs against `astro preview`,
which does not read `vercel.json` headers at all. It needs a preview deployment to test on.

The fix, when the owner chooses to take it, is a `headers` block in `vercel.json` carrying the
policy already written in `src/middleware.ts`. Verify with:

```powershell
$r = Invoke-WebRequest -Uri 'https://www.thebytelite.com/' -UseBasicParsing
$r.Headers['content-security-policy']
$r.Headers['x-frame-options']
```

Deploy it to a Vercel preview URL first and load every public page with the browser console
open before promoting it.

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

**Last verified: 2026-08-24, against commit 0e5ffab.**
Re-verify with section 9 before trusting any line of this document.
