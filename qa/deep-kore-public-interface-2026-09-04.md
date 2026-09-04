# The public AIya interface to Deep Kore - website-side completion

Date: 2026-09-04
Website branch: `feature/deep-kore-public-chat-canon`, from `58bd6ad`
Deep Kore repository: **not modified.** Read only, plus two of its own binaries run locally.
`DEEP_KORE_CHAT_PHASE`: **still `disabled`.** Nothing pushed, deployed or configured.

ASCII only. Variables are named, never valued.

---

## 1. WHAT THIS PASS CLOSED

The console, the routes, the projection and the canon were already substantially built. This pass
finished the parts that were missing, corrected two things that were wrong, and - the part worth
reading - **measured the live path end to end instead of assuming it.**

| Area | Before | After |
|---|---|---|
| Transport boundary | `fetch` calls inline in the component | One adapter, `deepKoreClient.ts`, owning serialization, typed failures, cancellation and the CSRF token |
| Result exhaustiveness | a `default:` branch | A shared closed kind list, a bidirectional compile-time proof on the server, and a `never` binding on the client |
| Decision surfaces | rendered, **unstyled** | Styled, focus-managed, keyboard-operable, 320px-clean |
| TAV revocation | not implemented | A distinct control, present only while something is held |
| Request schema | unknown keys ignored | Unknown keys **refused** at every level, including inside the device envelope |
| Origin check | three CSRF barriers | A fourth: `Origin` compared against the request's own forwarded `Host` |
| Governance record | a stamp under every message | A "Why this response?" disclosure that says what it is and what does not exist |
| Retry | none | One visitor-pressed retry, offered only where a request never completed |
| Privacy policy | cookies and sessions | Plus the vault, the review queue, the transcript's lifetime, and consent separation |
| Terms | silent on the chat | A live-chat section (**owner and counsel approval still required**) |
| Live lane | unrunnable without a deployment | `scripts/deep-kore-live-harness.mjs` |
| Live TAV rows | asserted a false premise | Assert the measured seam - see section 4 |

---

## 2. THE LIVE PATH, MEASURED

Real browser -> real `/api/deep-kore/*` handlers -> real `deep_kore_gateway` -> real
`dk_session_worker` -> real `process_governed_turn()`.

First measured result of the complete path, through this site's own route:

```
POST /api/deep-kore/session   -> 201  {"ok":true,"persona":"AIYA",...}
POST /api/deep-kore/message   -> 202  {"job_id":"job_...","duplicate":false}
GET  /api/deep-kore/result/.. -> 200  {"state":"succeeded","result":{"kind":"GOVERNED_TEXT",...}}
```

The projection held. The engine's own envelope for that turn carried `gk1_decision`,
`gk2_decision`, `transform_count`, `state_hash`, `adult_consent_invariant_violated`,
`vanguard_enabled`, `warmed_text` and `vanguard_diag`. **None of them crossed.** The stamp the
engine emitted was

```
GOV_STAMP|gk=pass|iters=0|state_hash=<hex>|policy=<...>|caps=<...>|dm_stamp=|persona=AIYA
```

and what reached the browser was

```
GOV_STAMP|gk=pass|persona=AIYA
```

**Vanguard was ON** in the worker, as owner decision 2026-09-02 requires: `vanguard_enabled=true`
and `warmed_text` populated.

---

## 3. A STALE WORKER IS A LEGIBLE FAILURE, AND WAS ONE

The first attempt used `Source\build\Release\dk_session_worker.exe` (2026-09-02) against a gateway
built 2026-09-03. Every turn failed with `worker_bad_header`.

That is the DKW1 frame header being rejected, not a website fault. Using
`Source\build_Release\Release\dk_session_worker.exe` (2026-09-03, same day as the gateway)
produced governed cognition immediately.

**Recorded because the diagnosis is reusable: build and deploy the gateway and the worker
together.** The failure is honest and specific, which is the design working - but only if
somebody reads the code rather than assuming the website broke.

---

## 4. THE TAV SEAM - A CORRECTION TO WHAT THE TESTS CLAIMED

Three live tests asserted that `List the parts of a zqxjvwkbrump.` reaches the TAV decision
surface from the public page. **It does not.** Measured directly against the engine:

```
PLAIN turn (text only)                        -> outcome = TEACHING_OFFER
SAME turn + a device entity model
  (entity_kind, relationship_role, an ENTITY
   segment in the current message)            -> outcome = TAV_REQUIRED
```

`generate_tav_request` needs the target entity to resolve to exactly one `StructuralEntityKind`,
and the only evidence that can do that here comes from the **device** - `relationship_role` on an
entity the message references. A Cordel device holds that model. A public web page does not.

**It must not invent one.** Fabricating a `relationship_role` for a stranger would be inventing
TAV evidence, which the public path forbids outright.

So the honest position, stated three ways so it cannot be misread:

- the TAV interface is implemented and **correct**, and every rule about it - grants, revocation,
  one-turn consumption, non-transmission, focus, mobile layout - is asserted against a scripted
  `TAV_REQUEST` in `tests/e2e/deep-kore-console-flow.spec.ts`, on five browser engines;
- it is **not reachable by a visitor today**, because nothing in the public interface supplies an
  entity model;
- whether to add one is an **owner decision**, recorded in `OWNER_README.md` section 21.14. It
  would be a new public surface on which a visitor describes a person or a place to Deep Kore,
  with its own privacy and consent consequences.

The live rows now assert the seam itself, so it cannot be forgotten and cannot be quietly "fixed"
by making the page assert an entity it does not know.

**The lesson is the same one section 1 of the 2026-09-03 record already carries**, arriving from
the other direction: the earlier note measured which conjunct of a compound predicate failed. This
one measured which *caller* supplies the evidence. In both cases the wrong answer was available by
inference and the right one only by measurement.

---

## 5. THE LIVE SUITE LEAKED SESSIONS, AND THAT LOOKED LIKE A PRODUCT FAULT

`tests/live/deep-kore-tav-and-consent.spec.ts` had no cleanup hook. Most of its tests open a
session and only some end one, so against a host configured for six the first six tests ran on
their merits and **every test from the seventh onward failed at session creation**, reporting a
state indistinguishable from the service being down.

Six `dk_session_worker` processes were alive and the idle window is thirty minutes, so nothing
would have recovered on its own inside a test run.

Fixed with the same `afterEach` release the sibling spec already had, and its reasoning is now
recorded in both files. This is the hazard the 2026-09-01 note described - "the first symptom is
not a clear *too many sessions*" - reached through a different door.

---

## 6. THE TEACHING QUEUE, PROVEN AGAINST THE REAL BROKER

`dk_teaching_broker.exe` was run with `DEEP_KORE_TEACHING_QUEUE_REQUIRE_ISOLATED=1` and a scratch
`DEEP_KORE_TEACHING_QUEUE_ROOT`, so **nothing touched the owner's real queue** under
`%LOCALAPPDATA%`. `DEEP_KORE_TEACHING_MAX_RECORD_BYTES` was set to a **test value**; the
production number remains the owner's and remains unset.

A real consent through the browser produced exactly one record:

```
teaching_events_2026-09-04.jsonl.dpapi   711,780 bytes
```

consistent with 21.11c's measured 710,219-byte canonical sequence for a real candidate. A byte
search of the whole isolated queue found **no occurrence of the visitor's own text**. That proves
no plaintext leak into the file; the record's schema is the C++ side's guarantee and is asserted
there.

Declining produced no file at all.

---

## 7. WHAT THE ORIGIN ACTUALLY SUPPLIES - and why several honest-sounding UI states do not exist

`serialize_outcome` in `dk_session_worker/main.cpp` is the complete public wire contract:

- `outcome` is one of **ANSWER, TAV_REQUIRED, TEACHING_OFFER, REFUSAL, ENGINE_FAILURE**;
- `engine` carries text, stamp, gk decisions, persona, transform count, state hash, the adult
  consent invariant, and the Vanguard fields;
- `tav_request` carries four fields; `teaching_offer` carries three; `failure_code` carries one.

**There is no `resolution` field on the wire.** `last_resolution_` exists inside
`public_chat_session.hpp` and is not serialized. So a website state named `RESOLVED`, `AMBIGUOUS`,
`UNKNOWN`, `CONTRADICTORY`, `UNSUPPORTED` or `WAITING_FOR_RESEARCH` would be **this site inventing
a distinction the engine did not send**, which is exactly the failure the brief forbids. None was
built.

`teaching_offer.classification` **is** on the wire and is deliberately **not read**: it is the
engine's own decision vocabulary, which section 3 of `CLAUDE.md` forbids publishing. The worker
already derives a safe `description` from it, and that is what a visitor sees.

There is no provenance, no source list, no confidence score and no reasoning trace anywhere in the
contract. The "Why this response?" disclosure therefore shows the governance record and **says
outright that the rest does not exist**, rather than leaving an absence to be read as an oversight.

---

## 8. VERIFICATION

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx astro check` | 0 errors, 0 warnings, 1 pre-existing hint |
| `npx eslint .` | 0 errors, 1 pre-existing warning (`tests/setup.ts`) |
| `npm run build` | 18 pages |
| `npx vitest run` | see the final report |
| `npx playwright test` (5 engines) | see the final report |
| `npm run test:e2e:live` (3 engines, real stack) | see the final report |

Screenshots of every public UI state are written to `test-results/deep-kore-screenshots/`, which
is gitignored - they are run artifacts, and this repository is not an asset archive.

---

## 9. WHAT REMAINS THE OWNER'S

Unchanged from `CLAUDE.md` section 19, plus one addition:

- `DEEP_KORE_CHAT_PHASE` - **still `disabled`**, and nothing in this pass changed it;
- the origin hostname, the Cloudflare Tunnel, the Access service token, the Turnstile keys;
- `DEEP_KORE_MAX_SESSIONS` and `DEEP_KORE_TEACHING_MAX_RECORD_BYTES` - production values;
- whether AIon is publicly exposed;
- where the gateway, worker and broker are installed and supervised;
- **new:** whether the public page should gain a surface on which a visitor describes an entity,
  which is what would make TAV reachable (section 4, and `OWNER_README.md` 21.14);
- **new:** owner and counsel approval of the live-chat section added to `/terms`.
