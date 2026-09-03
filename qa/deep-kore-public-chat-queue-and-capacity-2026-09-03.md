# Public Chat Cognition Session - queue admission, capacity, and the six rows

Date: 2026-09-03
Deep Kore HEAD: `281a886`, working tree dirty. Website HEAD: `21af2ca`, working tree ahead.
`DEEP_KORE_CHAT_PHASE`: **still `disabled`**. Nothing pushed, deployed, installed as a service,
configured, or exposed. No secret entered, no DNS, no Cloudflare, no Vercel change.

ASCII only.

---

## 1. EXACT FILES CHANGED THIS PASS

**Deep Kore (all previously untracked except the four canonical headers):**

| File | Change |
|---|---|
| `Source/core/teaching/teaching_case.hpp` | **additive**: `TeachingEventKind::UNVERIFIED_CANDIDATE`; nine provenance fields on `TeachingEvent`; JSON round-trip for each, all read conditionally so old logs stay readable |
| `Source/core/public_chat/public_chat_knowledge.hpp` | `snapshot_id()` - deterministic frozen-snapshot identity, built from source provenance and counts, never from a file path |
| `Source/core/public_chat/public_chat_session.hpp` | `HeldTeachingCandidate` reshaped to the minimum approved evidence; `select_snapshot_unknown_concept()`; consent-policy / source-class / state constants; `build_candidate()` rewritten |
| `Source/core/public_chat/teaching_broker_client.hpp` | frame carries the streamed variable-length canonical identity plus the provenance block |
| `Source/applications/dk_teaching_broker/main.cpp` | new field sequence; `DEEP_KORE_TEACHING_MAX_RECORD_BYTES` required with no default; writes `UNVERIFIED_CANDIDATE`; four new refusal codes |
| `Tests/tests/test_public_chat_cognition_session.cpp` | new negative tests, the minimum-evidence assertions, and the measurement diagnostic |

Unchanged from the previous pass and NOT redesigned: `session_concept_graph.hpp`,
`public_chat_outcome.hpp`, `dk_session_worker/main.cpp`, `candidate_generation.hpp`,
`dk_cognition_pipeline.hpp`, `teaching_intake_processor.hpp`.

**Website:** `CLAUDE.md` (new teaching-queue law section), `OWNER_README.md` (21.11b capacity,
21.11c the second required setting).

---

## 2. THE QUEUE RECORD SCHEMA

`record_schema_version = DK_PUBLIC_QUEUE_RECORD_V1`, written as one
`TeachingEvent` of kind `UNVERIFIED_CANDIDATE` into the existing canonical store.

### 2.1 Persisted - the complete list

| Field | Value on this path |
|---|---|
| `kind` | `UNVERIFIED_CANDIDATE` |
| `teaching_case_id` | SHA-256 of the identity key - the deterministic **digest index** |
| `structural_identity_key` | **THE COMPLETE canonical sorted candidate-ID sequence**, whole |
| `candidate_sequence_length` | count of ids inside that key |
| `concept_id` | the target unknown concept's own opaque identity |
| `structural_coordinate` | where it stalled |
| `intake_classification` | the canonical turn classification |
| `tesseract_anchors` | applicable anchors |
| `cognition_run_identity` | canonical hashed run identity |
| `timestamp_utc` | caller-supplied stamp |
| `knowledge_snapshot_id` | the frozen snapshot "unknown" was relative to |
| `gk_admission` | Genesis Goalkeeper admission result |
| `consent_result` | `CONSENT_GRANTED_EXPLICIT` |
| `consent_policy_version` | `PUBLIC_CHAT_CONSENT_V1` |
| `source_class` | `PUBLIC_CHAT_UNTRUSTED` |
| `record_schema_version` | `DK_PUBLIC_QUEUE_RECORD_V1` |
| `creation_state` | `UNVERIFIED_CANDIDATE` |
| `review_state` | `AWAITING_OWNER_REVIEW` |

**On the canonical sequence.** `structural_identity_key` already IS the sorted sequence -
`compute_structural_identity_key()` renders `CLASSIFICATION|coordinate|id1,id2,...`. It is stored
whole; no second array exists that could drift from it. `teaching_case_id` is an **index**, never a
replacement, and is never treated as collision-free proof of identity. Nothing is trimmed, sampled
or reordered, and a test recomputes the key from the plan and asserts byte equality.

### 2.2 Excluded - verified, not merely intended

`original_surface` and `surrounding_context` are written **empty**. There is no field for the
conversation, the governed response, personal identifiers, IP addresses, browser fingerprints,
cookies, session secrets, disclosed private values, raw TAV disclosures, elimination traces,
per-candidate elimination reasons, or governance projections. They are not filtered on the way out;
the struct and the frame have nowhere to put them on the way in.

Measured on the real persisted record: `contains_message_text=False`.

---

## 3. SERIALIZED SIZE - MEASURED, NOT INVENTED

| What | Value |
|---|---|
| Candidate the offer lane actually produced (`A zqxjvwkbrump`) | **35,494 ids**, identity key **710,219 bytes** |
| Complete DPAPI-protected JSON record on disk | **711,508 bytes** (file grew to 711,780) |
| The copular-hub candidate measured last pass (`be`) | **36,876 ids**, identity key **735,046 bytes** |

`DEEP_KORE_TEACHING_MAX_RECORD_BYTES` is now **required, with no default** - missing, zero,
non-numeric or overflowing all stop broker startup. The proofs used 2,000,000 (about 2.8x the
measured record). A record over the ceiling is refused **before any durable write**; nothing partial
is written, no chunk is orphaned, and a candidate is never truncated to fit.

---

## 4. THE SIX ROWS

### Row 1 - TAV grant loop with real condition-A probe evidence: **NOT PROVEN**

Swept exhaustively against the real worker: 6 relationship roles x 3 question forms, entity arriving
`UNKNOWN` and referenced in `current_message`. **No combination produced a `tav_request`.**

```
TEXT: What is their phone number? / Where do they live? / What is their address?
  roles PARTNER, FRIEND, FAMILY, MATCH, SELF, OTHER  ->  tav=(none) in all 18 cases
TAV_CONDITION_A: NOT REACHED from relationship_role alone
```

The reason is exact. `generate_tav_request` needs condition A: candidate elimination must resolve
the entity to **exactly one** `StructuralEntityKind`. `derive_evidence_for_entity()` derives that
from three sources - `relationship_role`, `context_state.events`, and prior `probe_results`. **Only
the first crosses the device envelope today**, and it is not sufficient on its own.

Carrying `context_state.events` is ordinary plumbing. Carrying `probe_results` is not: a probe
result is a device answering a counterfactual structural question about its own entity model, and a
browser has no entity model to answer from. **The owner's TAV policy already settles the authority
half** - the browser is a store/consent role and not an evidence authority - so the open question is
narrower than it was: whether the browser supplies `context_state.events`, or whether public TAV is
simply not reachable and should be stated as such.

The negative half IS proven and is asserted: a turn with no entity never claims TAV, and an entity
present with insufficient evidence still never claims TAV.

### Row 2 - a genuinely unknown concept reaches the offer lane: **PROVEN**

```
turn 3 outcome: TEACHING_OFFER  plan=CONCEPT_UNKNOWN_TEACHING_CANDIDATE
                concept_id=A zqxjvwkbrump  seq_len=35494  key_bytes=710219
```

Detection uses the two primitives the owner named: `extract_unknown_lexeme_evidence()` (the same
call the canonical classifier already makes) filtered by Law L1's `resolve_lexical_denotation()`
against the frozen snapshot. Classification finishes before any offer is formed. A known word whose
senses did not narrow is `KNOWN_CONCEPT_SENSE_AMBIGUITY` and raises no offer.

**Why the previous mapping could not have worked, measured.** Every concept on a public turn is
`AMBIGUOUS` with *all* candidates surviving - `be` 36,876/36,876, `tool` 216/216 - because nothing
eliminates without probe evidence. So `MISSING_GENERATOR` never fires and candidate counts
discriminate nothing. Concept ids are also spans (`A zqxjvwkbrump`, `a kind of tool`), not lexemes.
Neither the candidate set nor the classifier's ranking can answer "is this in the snapshot".

### Row 3 - an explicitly consented candidate written atomically with the complete identity: **PROVEN**

```
CONSENT_WITH_BROKER_UP: {"submitted":true,"broker_status":"SUBMITTED"}
CASE_FILE: teaching_events_2026-09-03.jsonl.dpapi  bytes=711780
  kind=UNVERIFIED_CANDIDATE
  concept_id=A zqxjvwkbrump
  knowledge_snapshot_id=7e045c256d207640643c32605b775c3cbe2bf64f40135e16b78d83283cb07a3b
  gk_admission=GK_ADMITTED
  consent_result=CONSENT_GRANTED_EXPLICIT
  consent_policy_version=PUBLIC_CHAT_CONSENT_V1
  source_class=PUBLIC_CHAT_UNTRUSTED
  creation_state=UNVERIFIED_CANDIDATE
  review_state=AWAITING_OWNER_REVIEW
  candidate_sequence_length=35494
  original_surface=          <- empty
  surrounding_context=       <- empty
  structural_identity_key_bytes=710219
  structural_identity_key_head=GENUINE_AMBIGUITY|A zqxjvwkbrump|aah,abacinate,abase,abash,a
  contains_message_text=False
RECORDS_DECRYPTED: 1
```

Read back with `ProtectedData.Unprotect(..., DataProtectionScope.CurrentUser)` - the owner
Workbench's own API and scope - over the same `[u32 LE length][DPAPI blob]` framing. DPAPI stays
CurrentUser; nothing switched to LOCAL_MACHINE.

### Row 4 - deterministic replay across independent worker processes: **PROVEN**

Two separate OS processes, same build, same snapshot, same four inputs in order:

```
TRANSCRIPT_SHA256_A: 653492d2225689acd06e38f450076ef7e5e63a089af693e43a77e40733e4ce05
TRANSCRIPT_SHA256_B: 653492d2225689acd06e38f450076ef7e5e63a089af693e43a77e40733e4ce05
BYTE_IDENTICAL: True   MISMATCHED_FRAMES: 0   REPLAY: PASS
```

Measured with Vanguard ON, because that is how the worker ships. Concurrency does not perturb it
either: at every capacity level all sessions produced **1 distinct** first-turn frame.

### Row 5 - browser TAV client, gateway, website transport, Playwright: **NOT BUILT**

Not started this pass. No browser private-value vault exists, so "a private value never leaves the
browser" remains unproven - there is still nothing to prove it about.

### Row 6 - capacity at 1 / 6 / 12 with the real snapshot: **PROVEN**

| Sessions | Cold start | First turn | Warm turn | Peak WS | Peak private | Threads | Distinct frames | Teardown | Leaked |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 5,681 ms | 48 ms | 3,815 ms | **682.2 MB** | 700.3 MB | 4 | 1 | 911 ms | 0 |
| 6 | 9,111 ms | 20 ms | 3,954 ms | **4,093.6 MB** | 4,202.6 MB | 21 | 1 | 4,781 ms | 0 |
| 12 | 14,625 ms | 43 ms | 3,857 ms | **8,185.2 MB** | 8,403.8 MB | 40 | 1 | 9,908 ms | 0 |

Host: 15,438 MB free, 12 logical processors. Queue-write duration is inside the consent exchange
and completed within it at 711,508 bytes.

**Not measured this pass:** behaviour AT admission capacity (the gateway ceiling path) and
abandoned-session reaping under load. Both are gateway-level and were proven separately on
2026-09-01 against the old worker; they have not been re-run against this one.

---

## 5. TEST TOTALS

| Suite | Result |
|---|---|
| `test_public_chat_cognition_session` | **100 pass, 0 fail** |
| Targeted subset over every canonical header touched (18 suites: teaching, cognition pipeline, candidate generation, lifecycle, persistence, tesseract, bootstrap, role inheritance, private/shared separation, both public-chat suites) | **18 pass, 0 fail** |
| Full Release build of every target | **clean, exit 0** |
| Real worker over DKW1 | all exchanges as expected, exit 0 |
| Broker end-to-end + CurrentUser DPAPI read-back | 1 record written, 1 decrypted |
| Deterministic replay, 2 processes | byte-identical |
| Capacity 1 / 6 / 12 | complete, 0 leaked workers |
| **Full `ctest` (443 tests)** | **STILL RUNNING** at report time. 141/443 passed, then it entered `test_example_source_ingestion` and stayed there (1,294 s CPU and climbing) with ~300 tests behind it. |

**On that long test, checked rather than assumed.** `Tests/tests/test_example_source_ingestion.cpp`
is tracked and pre-existing (last touched by `7b9164c`), and its include list is
`bootstrap_population.hpp`, `bootstrap_role_population.hpp`, `concept_example_source.hpp` and four
standard headers - **none of the four canonical headers this work changed**. Its runtime is
therefore not attributable to these changes. That is a reason to keep waiting for the suite, not a
reason to skip it.

**Not run:** website unit tests, `tsc`, `astro check`, ESLint, website build, Playwright. Nothing on
the website changed except two documentation files and, in the previous pass, three closed error
codes with their approved sentences.

### New negative tests, all passing

consent does not establish truth (creation/review/source states asserted, and the broker refuses any
other value); an unverified candidate is not active knowledge (not an anchor, not in canonical
knowledge, base unpolluted); a browser cannot claim evidence authority (a candidate cannot be
addressed by its identity, only by a reference this session issued); refusal leaves no durable
candidate; consent is revocable before submission and a reference is not reusable after revocation;
restart/replay produces the same structural identity (content-derived reference, byte-identical
transcript); unrelated conversation material is excluded from the queue frame (this message, the
earlier message, and the governed response are all absent); governance output is not leaked
(`gov_stamp` and `vanguard_diag` absent from the frame).

### The three earlier defects, all still covered

Broker frame synchronisation and body draining (payload-length prefix, drain before validate);
unknown classification relative to the frozen snapshot; sense-identity lookup through
`resolve_lexical_denotation()`.

---

## 6. REVISED `DEEP_KORE_MAX_SESSIONS`

**Recommendation: 6. Confirmed, no longer provisional.**

The binding constraint is memory, not CPU: a session costs **682 MB** because each worker process
loads its own copy of the canonical 212,446-concept snapshot - a cost that did not exist when the
earlier matrix was taken. A warm turn takes ~3.9 s whether one session runs or twelve.

At 6: 4.1 GB, about 27% of free memory, zero leaks, deterministic. At 12: 8.2 GB - demonstrably
survivable, no failures, but over half the free memory and triple the teardown. 6 is the value that
can be **fully occupied** with the machine near nothing.

The number was not silently changed. **The one change that would move it a lot** is a multi-session
host sharing one snapshot; `SessionConceptGraph` was built for exactly that (base reference plus
private overlay) and would take 6 sessions from ~4.1 GB to roughly one snapshot plus per-session
state. That host does not exist yet.

---

## 7. REMAINING BLOCKERS

1. **TAV condition A is not reachable from what the wire carries** (row 1). Needs an owner decision:
   carry `context_state.events`, or state that public TAV is out of scope. A browser cannot supply
   `probe_results` honestly.
2. **Browser TAV client, gateway wiring, website transport and Playwright are not built** (row 5).
3. **Full `ctest` has not completed.** 18 targeted suites are green; the rest is unverified.
4. **Behaviour at admission capacity and abandoned-session reaping have not been re-measured**
   against the new worker.
5. **Not committed.** The instruction is to commit only after applicable tests pass, and the full
   suite is still running.

---

## 8. CAN `DEEP_KORE_CHAT_PHASE` BE ENABLED?

**No. Explicitly not, and not close.**

Enabling it would expose a public surface whose browser half does not exist: there is no consent
control, no private-value vault, no transport for the typed outcomes, and no Playwright coverage of
any of it. A visitor would have no way to see, grant or revoke the consent the whole queue design is
built around, and the site would be unable to render the teaching offer the engine is now producing.

The C++ side is in good shape - canonical knowledge, unknown-concept detection, consent-gated
unverified queue admission, owner-identity DPAPI writes, deterministic replay and a measured
capacity ceiling all hold. That is the foundation, not the feature. Four rows remain and one of them
(row 5) is the entire user-facing half.
