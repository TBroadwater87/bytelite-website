# Contact route production verification - 2026-08-25 (UTC)

Dated evidence for the closure of the custom-domain cutover and the `/api/contact` route.
Captured against the live canonical production domain, not a preview and not a raw deployment URL.

ASCII only. No secret value appears in this file, and none was read into it.

---

## 1. What was verified against

    DNS_PROVIDER      Cloudflare (garrett.ns.cloudflare.com, kim.ns.cloudflare.com)
    WEBSITE_HOST      Vercel
    VERCEL_TEAM       ByteLite_LLC (CLI scope slug bytelitellc)
    VERCEL_PROJECT    bytelite-website (prj_XmNkNFp156U94VveZgoPuMHPfW6u)
    GITHUB_REPO       TBroadwater87/bytelite-website
    BRANCH            main
    DOMAIN            https://www.thebytelite.com
    DEPLOYED_COMMIT   0e5ffab

Runtime fingerprint returned by the temporary probe at `GET /api/health` before it was deleted:

    {"ok":true,
     "expected":{"SENDGRID_API_KEY":true,"CONTACT_TO_EMAIL":true,"CONTACT_FROM_EMAIL":true},
     "relatedNamesPresent":["CONTACT_FROM_EMAIL","CONTACT_TO_EMAIL","SENDGRID_API_KEY"],
     "totalEnvVarsVisible":57,
     "vercelEnv":"production","vercelBranch":"main","commit":"0e5ffab","node":"v24.18.0"}

Node 24 and 57 visible variables distinguish this deployment from the superseded one
(Node 22, 48 variables, contact variables absent). Names only were ever reported; no value.

---

## 2. Delivery proof - the three states, kept apart

These are three different facts. Collapsing any two of them would be a false claim.

**A. WEBSITE_REQUEST_ACCEPTED - PROVEN.**
One synthetic inquiry, `POST https://www.thebytelite.com/api/contact`, 2026-08-25T05:20:48Z.

    STATUS = 202
    BODY   = {"status":"sent"}

Marker carried in the message body: `PRODVERIFY-2026-08-24-0e5ffab`.
Content was explicitly labelled a synthetic production verification message and asked for no reply.

**B. SENDGRID_PROVIDER_ACCEPTED - PROVEN.**
`api/_lib/contact-core.ts` returns 202 only on a non-error response from
`https://api.sendgrid.com/v3/mail/send`. A SendGrid 202 means queued for delivery.
It is provider acceptance. It is not proof of arrival, and is not recorded as such.

**C. MAILBOX_RECEIPT - PROVEN by owner confirmation.**
Route: SendGrid -> `tash@thebytelite.com` -> Cloudflare Email Routing -> `tbroadwater87@gmail.com`.
The Cloudflare rule was read directly from the Email Routing API and is enabled:

    literal:tash@thebytelite.com -> forward:tbroadwater87@gmail.com   (enabled)
    catch-all                    -> drop                              (enabled)

The forwarding destination is a mailbox this session could not read, so receipt was not
self-asserted. The owner confirmed on 2026-08-25 that the message arrived in the inbox
(not spam), identified by the subject `ByteLite inquiry: general - ByteLite Production
Verification` and the marker above.

---

## 3. Failure behaviour - captured before cleanup

All probes against live production, same endpoint. No response carried a secret, a stack
trace, an internal path, or a provider credential.

    GET  /api/contact
      -> 405, Allow: POST, {"error":"Method not allowed. Use POST."}
      A GET is not treated as a POST and cannot send anything.

    POST /api/contact  body: this-is-not-json{{      Content-Type: application/json
      -> 400, empty body
      Rejected by the platform body parser ahead of the function. Honest failure: no 200,
      no queued message, nothing stored.

    POST /api/contact  body: (empty)
      -> 400, {"error":"Name is required."}

    POST /api/contact  body: {"name":"Verification Probe"}
      -> 400, {"error":"A valid email address is required."}

    POST /api/contact  body: {... "email":"not-an-email" ...}
      -> 400, {"error":"A valid email address is required."}

    POST /api/contact  body: {... "inquiryType":"NOT_A_VALID_TYPE" ...}
      -> 400, {"error":"Please select a valid inquiry type."}
      Inquiry type is an allowlist, not a denylist.

Not exercised against live production, deliberately:

  - Provider failure. Forcing a real SendGrid rejection would mean an abusive or malformed
    call to a third party. The behaviour is covered by unit tests: a non-ok provider
    response yields 502 with "This message was not sent", and a thrown fetch yields 502.
    Neither path can return a success.
  - Header injection with an otherwise valid payload. Reaching the CRLF-stripping code
    requires passing validation, which would send a second real email. `stripControlChars`
    is covered by unit tests instead.
  - Rate limiting. The limiter is per instance and best effort; hammering production to
    observe a 429 is not evidence worth the traffic.

Secret hygiene, by inspection of `api/_lib/contact-core.ts`:

  - The SendGrid key is used in exactly one expression, the Authorization header.
  - It is never placed in a response body.
  - The catch path logs `err.name` only, because a thrown fetch error can carry the
    request object and with it the Authorization header.
  - The "not configured" path logs variable NAMES only, never values.

Persistence: the route has no datastore, no file write, and no logging of submission
content. The only module state is the rate-limit map, which holds a client id, a counter
and a reset timestamp - never any part of a submitted body.

---

## 4. DNS state at closure

    www.thebytelite.com     CNAME -> cname.vercel-dns.com
    thebytelite.com         A     -> 76.76.21.61, 66.33.60.130
    thebytelite.com         MX    -> route1/route2/route3.mx.cloudflare.net
    thebytelite.com         TXT   -> v=spf1 include:_spf.mx.cloudflare.net ~all

    _vercel.thebytelite.com TXT   -> vc-domain-verify=thebytelite.com,8583c5a9f551618d20ee
    _vercel.thebytelite.com TXT   -> vc-domain-verify=thebytelite.com,886aa98d5db087f7059e
    _vercel.thebytelite.com TXT   -> vc-domain-verify=www.thebytelite.com,068d77a3fd1eec807e40

Cloudflare remained the authoritative DNS provider throughout. No website DNS record was
created, changed or deleted during this closure.

Vercel alias state at closure, both pointing at the same ByteLite_LLC deployment:

    bytelite-website-34k4jo3zb-bytelitellc.vercel.app -> thebytelite.com
    bytelite-website-34k4jo3zb-bytelitellc.vercel.app -> www.thebytelite.com

See OWNER_README.md for the `_vercel` TXT classification and what may be removed.
