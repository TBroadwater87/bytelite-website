# ByteLite Website - Authoritative Handoff Checkpoint

```
WEBSITE_ACTIVE_DEVELOPMENT=REOPENED 2026-08-26  (owner-authorised canon rebuild)
DO_NOT_RESCOUT_COMPLETED_INFRASTRUCTURE
```

> **2026-08-26 - the freeze was lifted by the owner for a canon rebuild.** Sections 2, 4, 5 and 8
> below (production identity, security posture, the dirty owner file, the hard rules) are all
> still accurate and still binding. **Section 3's test snapshot is superseded** - the route table
> and the test suite were both rewritten, so those numbers describe a site that no longer exists.
>
> What changed, in one paragraph: Cordel Connect and Cordel Play became public products; the
> retired route families (`architecture`, `research`, `progress`, `technologies`, `company`,
> `preorder`, `products`, `marketing`) were **deleted** rather than served at `noindex`, and now
> 301 or return 410 from `api/gone.ts`; the site was rewritten in the founder's voice; nine
> IP-safe graphics went into primary content; and Stripe test-mode commerce was built as
> `api/` Vercel Functions. `CLAUDE.md` was rewritten to match and is still the law - see its new
> sections 15 (COMMERCE LAW) and 16 (WITHHELD ASSETS AND OPEN OWNER DECISIONS).
>
> **The architecture did NOT change**: still `output: 'static'`, still no adapter, still
> Vercel Functions beside the build. Section 4's reachability argument therefore still holds,
> with one amendment recorded there.

This is an operator checkpoint, not a second OWNER_README. It says what was true, at which
commit, with what evidence - so the next agent resumes instead of re-discovering.

**Read in this order. Do not start by scanning the repository.**

1. `CLAUDE.md` - the law. If it and another document disagree, it wins.
2. `OWNER_README.md` - operational detail, troubleshooting, recovery, open work.
3. `reports/WEBSITE_AUTHORITATIVE_HANDOFF.md` - this file.
4. `git status`
5. **Only then** inspect deltas.

ASCII only. No secret value appears here, and none was read to produce it.

---

## 1. Checkpoint

```
DATE                 2026-08-25
BRANCH               main
HEAD                 8ea2de6
REMOTE               https://github.com/TBroadwater87/bytelite-website.git  (PUBLIC)
WORKTREE             clean except one known unrelated owner file (section 5)
```

## 2. Production identity - verified, not assumed

```
DNS_PROVIDER         Cloudflare        (garrett/kim.ns.cloudflare.com; DNS only, NOT proxied)
WEBSITE_HOST         Vercel
VERCEL_TEAM          ByteLite_LLC      (CLI scope slug: bytelitellc)
VERCEL_PROJECT       bytelite-website  (prj_XmNkNFp156U94VveZgoPuMHPfW6u)
VERCEL_ORG_ID        team_LjWPr2MnAsCrv6U1ddGy8BSh
GITHUB_REPOSITORY    TBroadwater87/bytelite-website
PRODUCTION_BRANCH    main
PRODUCTION_DOMAIN    https://www.thebytelite.com
APEX_DOMAIN          https://thebytelite.com   (308 -> www, from vercel.json)
OUTBOUND_MAIL        SendGrid (contact form only)
INBOUND_MAIL         Cloudflare Email Routing (alias forwarding only)
SERVING_DEPLOYMENT   dpl_8SvCeGwcFguaxy1aMmQD2bGDPi7T
```

Behaviour verified live at `8ea2de6`:

```
GET  https://www.thebytelite.com/           -> 200
GET  https://thebytelite.com/               -> 308 -> https://www.thebytelite.com/
GET  https://www.thebytelite.com/api/health -> 404   (temporary probe deleted, stays deleted)
GET  /api/contact                           -> 405   Allow: POST
POST /api/contact  non-JSON content type    -> 415   (refused before the body is read)
POST /api/contact  invalid JSON payload     -> 400   honest failure, nothing sent
security headers                            -> all seven present
```

**Four services, four roles, never collapsed.** Cloudflare is DNS and inbound mail, not the host.
Vercel is the host, not the DNS provider and not the mail sender. SendGrid is outbound only.
GitHub is the source of truth. Never infer the host from the DNS provider.

**The superseded path.** Until 2026-08-25 the domain was served by a project under a *different*
Vercel account (Node 22, 48 env vars, no contact variables). It is superseded. Do not redeploy
it, do not point the domain back at it, do not describe it as current.

## 3. Latest verified test snapshot

Anchored to content, not to a timestamp.

```
NPM_CI                PASS   917 packages, exit 0
BUILD                 PASS   63 routes, 343 files in dist
UNIT_AND_CONTACT      PASS   35/35
ASTRO_CHECK           PASS   0 errors / 6 hints
TSC                   PASS   0 errors
ESLINT                PASS   0 errors / 24 pre-existing no-explicit-any warnings
FULL_E2E              PASS   1485/1485, five engines, first run, no reruns
RESPONSIVE_REFLOW     PASS   (inside the E2E suite)
BROKEN_LINK_AUDIT     PASS   1823 internal links
SITEMAP_AUDIT         PASS   exactly the eight-route allowlist
PUBLIC_CLAIM_AUDIT    PASS
TRADE_SECRET_AUDIT    PASS
SECRET_SCAN           CLEAN  tree, dist, and full git history across all refs
SECURITY_HEADERS      ALL SEVEN PRESENT
SECURITY_REGRESSIONS  NONE
```

**Why the E2E number is still valid at a later commit.** The run predates `5a73c76`, which
touched `api/contact.ts` and its unit tests. `api/` is a Vercel Function beside the static site,
not an input to the Astro build. Proven, not asserted: `dist` rebuilds to a byte-identical
343-file manifest, SHA256
`157F221198D1C68312DBAF3090B5A86B9941DBCF8A1095C01913EE6599007F8A`, at `82b0a95`, at `5a73c76`
and again at `8ea2de6`.

**Re-derive it the same way before trusting this page**: rebuild, hash every file in `dist`, and
compare. If the manifest differs, the E2E result no longer describes the current content and the
suite must actually be run.

Do not re-run a green suite to refresh a date. That is the rerun-until-green the test law forbids.

## 4. Security state - FROZEN, and architecture-dependent

```
DEPENDABOT_OPEN=9      HIGH=2   MODERATE=4   LOW=3
SECURITY_POLICY_FROZEN=YES
```

| Group | Count | Classification |
|---|---|---|
| Astro advisories | 8 | **NOT CURRENTLY PRODUCTION-REACHABLE** under the fully static architecture |
| esbuild advisory | 1 | **BLOCKED BY UPSTREAM RANGE** - Astro pins `^0.27.3`, the patch is `0.28.1` |

**This is not a claim that these packages are safe forever.** It is a claim about *this
architecture*. The proof is that every Astro advisory needs a precondition this build lacks: no
adapter, no `output: 'server'`, no `prerender = false`, no `{...spread}` props, no dynamic slot
names, no `define:vars`, no `transition:*`, no server islands, and `dist` emits no server
entrypoint. Astro renders at build time from repository-owned files; a visitor cannot reach the
vulnerable code. The strongest single fact: **`api/contact.ts` imports only `node:http` types and
its own core, which imports nothing - zero npm packages execute at production request time.**

**Reconsider the Astro migration if ANY of these occur:**

- an adapter is introduced
- `output` becomes `server`
- SSR is introduced in any form
- `prerender = false` affects a relevant route
- vulnerable code otherwise becomes runtime-reachable
- `@astrojs/tailwind` gains compatible support that materially changes migration cost
- the advisory scope changes

Until then: **do not upgrade Astro to clear a dashboard, and do not dismiss the alerts.** They
stay open deliberately, so a future architecture change cannot let them pass unnoticed. Owner
decision, 2026-08-25. Full analysis in OWNER_README section 14b.

**Never run `npm audit fix --force`.** It installs `astro@7.2.6` - a breaking change, on a live
site, to fix findings nothing can currently trigger.

**Amendment, 2026-08-26.** The strongest sentence in this section used to be: *"`api/contact.ts`
imports only `node:http` types and its own core, which imports nothing - zero npm packages execute
at production request time."* That is **no longer true**. The `stripe` package now executes at
request time inside `api/checkout.ts`, `api/checkout-session.ts` and `api/stripe-webhook.ts`.

This was an explicit owner decision (use the official SDK rather than hand-rolled REST over
`fetch`), and it narrows the argument rather than breaking it:

- The **Astro** advisories are still unreachable. Nothing about them changed: no adapter, no
  `output: 'server'`, no `prerender = false`, and `dist` still emits no server entrypoint. Astro
  does not run at request time at all.
- What changed is that a **new dependency tree now does**. `stripe` and its transitive packages
  are request-time reachable and must be treated that way: their advisories are live findings, not
  "not applicable", and they need patching on the normal schedule.
- `api/contact.ts` itself is untouched and still imports zero npm packages.

Re-run this argument whenever a package is added to `api/`.

## 5. Known unrelated dirty file - DO NOT TOUCH

```
 M ClaudeTools/claude_config.ps1
```

Pre-existing owner work, unrelated to the website, uncommitted since before this work began. Do
not stage, commit, stash, reset, clean or overwrite it. If it blocks an operation, work around it
or stop and report.

## 6. Current blockers

None break anything. All four are known, recorded, and none is urgent.

| # | Blocker | State |
|---|---|---|
| 1 | Astro 5 -> 7 (really a Tailwind 4 migration) | Deferred by owner decision 2026-08-25, with the trigger list in section 4 |
| 2 | `public/bytelite-logo.png` is 473 KB | Performance only |
| 3 | DMARC `rua=` points at an unmonitored GoDaddy endpoint | `p=none`, nothing enforced |
| 4 | Three `_vercel` TXT records, two UNKNOWN | Nothing deleted; never delete an UNKNOWN |

## 7. Legitimate reopen triggers

Reopen this repository for a concrete reason:

- a new ByteLite validation milestone
- new public proof or evidence
- a pricing change
- a legal or compliance requirement
- broken production behaviour
- a newly reachable security advisory (see the section 4 trigger list)
- a dependency EOL that actually affects production
- contact delivery failure
- an intentional design or content revision
- a new production capability that needs documenting

**Not reopen triggers:** routine package-version drift; `npm outdated` showing newer releases; a
Dependabot dashboard that is not zero; the wish for a fresh green test run.

## 8. Hard rules that outlive this checkpoint

- Never infer the website host from the DNS provider.
- Never create another Vercel project because `.vercel/` is missing - run `vercel link`.
- Never probe a raw per-deployment URL and read Vercel's auth page as the application. Verify on
  the canonical domain or a project alias.
- Never move the custom domain without owner authorization and a proven replacement.
- Never add an Astro adapter or `output: 'server'` to make one API route work.
- Never commit a secret value. This repository is PUBLIC.
- Probing `/api/contact` with a valid payload sends real mail to a real person. Test with payloads
  that cannot pass validation, and confirm the deployment is aliased before probing at all.

---

**Checkpoint recorded 2026-08-25 at commit `8ea2de6`.** The commit carrying this file is a later,
documentation-only commit; it changes no page, route, function or dependency, so it does not
invalidate anything verified above.
