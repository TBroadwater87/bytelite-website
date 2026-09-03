# Public Chat Cognition Session - integration build and local proof

Date: 2026-09-02
Deep Kore HEAD: `281a886` (working tree dirty, nothing committed)
Website HEAD: `21af2ca` (working tree ahead of production, nothing committed)
`DEEP_KORE_CHAT_PHASE`: **still `disabled`**. Nothing committed, pushed, deployed, installed as a
service, or configured. No secret entered, no DNS, no Cloudflare, no Vercel change.

ASCII only. No mechanism disclosure beyond type and file names already in this repository's
architecture record.

---

## 0. WHAT IS AND IS NOT DONE

The C++ integration that did not exist now exists, builds clean, and is proven against the real
committed knowledge. The transport above it is partly built. **Six required rows remain NOT
PROVEN and are listed in section 9 with exact reasons.** The public chat is NOT complete.

| Layer | State |
|---|---|
| Canonical C++ public-chat cognition session | **BUILT and PROVEN** (64/64 in a new suite) |
| Canonical read-only knowledge load | **BUILT and PROVEN** - 212,446 concepts, measured |
| Structural-cognition -> governed-output seam | **BUILT and PROVEN**, with the missing law named |
| Session Tesseract anchors | **BUILT and PROVEN** (privacy, isolation, correction, teardown) |
| Unknown-concept detection + consent offer | **BUILT**; unit-proven; **end-to-end lane NOT PROVEN** (9.2) |
| Teaching Queue broker (owner identity, named pipe) | **BUILT**; write + Workbench-path decrypt **PROVEN**; real-engine candidate **REFUSED by its own framing bound** (9.3) |
| Worker (DKW1) integration | **BUILT and PROVEN** end to end against the real binary |
| TAV wire counterpart, server side | **BUILT and PROVEN to parse and to refuse illegally** |
| TAV grant loop affecting a governed turn | **NOT PROVEN** (9.1) |
| Browser TAV client, gateway, website transport, Playwright | **NOT BUILT** (9.5) |
| Capacity reverification | **NOT RUN** (9.6) |

---

## 1. THE ARCHITECTURE IMPLEMENTED

```
browser
  -> /api/deep-kore/*              (Vercel Function)
  -> deep_kore_gateway             (.NET 8, loopback)
  -> dk_session_worker             (one process per session, DKW1 stdio)
       |
       +-- public_chat::PublicChatSession        <-- THE new integration type
             |
             +-- PublicChatKnowledgeSnapshot     (const, process-wide, shared)
             +-- SessionConceptGraph             (shared base + private overlay)
             +-- conversation::AIyaChildEngine   (owned; kb_path empty)
             +-- teaching::run_structural_cognition_for_input
             +-- governance::process_governed_turn  (GK-1 -> GK-2 -> STAMP -> Vanguard)
             +-- cv6::tav::generate_tav_request
             +-- teaching::classify_structural_cognition_result
             |
             +-- (on consent only) --> dk_teaching_broker  [named pipe, owner identity]
                                          -> teaching::TeachingCaseStore  (CurrentUser DPAPI)
                                          -> owner Workbench
```

**Deep Kore remains the only cognition authority.** No cognition was reproduced in C#, TypeScript,
Astro, JavaScript or the gateway. The session type contains no cognition of its own: every decision
in it is read off a value an already-proven Deep Kore function computed.

---

## 2. CANONICAL COMPONENTS REUSED, NEVER REIMPLEMENTED

`populate_bootstrap_tesseract`, `populate_bootstrap_role_affordances`,
`build_full_affordance_index`, `load_lexical_definition_index`, `resolve_lexical_denotation`,
`run_structural_cognition_for_input`, `discover_and_derive_with_roles`,
`classify_structural_cognition_result`, `compute_structural_identity_key`,
`tesseract_address_from_established`, `kb_deployment::contains_only_shareable_origins`,
`cv6::tav::generate_tav_request`, `parse_tav_field` / `parse_tav_decision` /
`parse_entity_kind` / `parse_relationship_role` / `parse_agreement`,
`governance::process_governed_turn`, `vanguard::set_vanguard_override`,
`conversation::seed_core_conversation_knowledge`, `teaching::TeachingCaseStore`,
`teaching::resolve_teaching_case_directory`, `teaching::derive_cognition_run_identity`,
`hs_dk::v1::json` (parser) and `canon::emit_json_string` (escaper), `hashing::sha256_hex`.

---

## 3. NEW AND CHANGED FILES

**New C++ (Deep Kore), all untracked:**

| File | Role |
|---|---|
| `Source/core/public_chat/public_chat_knowledge.hpp` | the read-only canonical snapshot + its loader |
| `Source/core/public_chat/session_concept_graph.hpp` | shared base + private overlay, origin law |
| `Source/core/public_chat/public_chat_outcome.hpp` | the closed typed outcome variant |
| `Source/core/public_chat/public_chat_session.hpp` | the session integration type + the Phase 2 seam |
| `Source/core/public_chat/teaching_broker_client.hpp` | the worker's side of the owner-identity write |
| `Source/applications/dk_teaching_broker/main.cpp` | the broker |
| `Tests/tests/test_public_chat_cognition_session.cpp` | the proof suite |

**Rewritten:** `Source/applications/dk_session_worker/main.cpp`.

**Two additive changes to canonical headers.** Both strictly widen and both convert a
proof-by-inspection into one the compiler enforces:

1. `core/cognition/candidate_generation.hpp` - `discover_and_derive_with_roles`'s `graph`
   parameter is now `const&`. It never wrote the graph (no `graph[`, `graph.insert`,
   `graph.emplace`, `graph.erase` anywhere in the file); the parameter was non-const only for
   symmetry with `store`. Every existing caller still binds. This is what lets one immutable
   snapshot be shared by every session instead of copied per conversation.
2. `core/teaching/dk_cognition_pipeline.hpp` - adds `ReadOnlyGraphCognitionContext` and moves the
   body of `run_structural_cognition_for_input` onto it; the original
   `CanonicalCognitionContext` overload now **forwards**, so there is still exactly one body.
   `reanchor_established_concepts` deliberately does NOT accept the read-only context - it is the
   one genuine graph writer, and that is now a compile-time distinction rather than a comment.
   `teaching_intake_processor.hpp`'s `classify_structural_cognition_result` got the same
   forwarding treatment for the same reason.

**Website (uncommitted):** three closed error codes added to `api/_lib/deep-kore-codes.ts` with
approved sentences in `src/data/deep-kore.ts`; `CLAUDE.md` Vanguard gate closed; `OWNER_README.md`
records `DEEP_KORE_MAX_SESSIONS=6` as provisional.

---

## 4. THE STRUCTURAL-RESULT-TO-RESPONSE CONTRACT (PHASE 2)

### 4.1 Field-by-field disposition of `StructuralCognitionResult`

| Field | Public-semantic? |
|---|---|
| `parse` (`language::ParseResult`) | INTERNAL ONLY - grammar productions and span roles are mechanism |
| `semantic_graph` | INTERNAL ONLY |
| `has_semantic_graph` | PUBLIC-SEMANTIC **as a disposition only** - separates a parse gap from a concept gap |
| `turn_ordinal` | INTERNAL ONLY |
| `concept_ids_touched` | INTERNAL ONLY - a concept id is protected provenance |
| `elimination_trace_by_concept_id` | INTERNAL ONLY - this is the elimination law's own working |
| `admission_rejections_by_concept_id` | INTERNAL ONLY |

**Nothing in a structural result is publishable as content.** What is publishable is a typed
disposition derived from it by an existing canonical classifier.

### 4.2 The missing law, named exactly

**There is no canonical Deep Kore law that turns a structural cognition result into words.** Every
consumer of the concept subsystem in the repository is a telemetry emitter
(`dk_cognition_glass.exe`), a queue writer (`teaching_intake_processor.hpp`), an owner action
(`teaching_owner_action.hpp`) or a persistence routine (`concept_persistence.hpp`). None produces
prose. A `DerivingConcept` that resolves to a placement has no realization law and no surface
generator attached to it.

So a RESOLVED structural result is `NO_PUBLIC_CONTRIBUTION`: this subsystem contributes structure,
not sentences. **The words of the answer come, as they always have, from the governed
conversational path.** Inventing a template ("I understand that X is a Y") would be exactly the
fabricated linguistic mapping the phase forbids, and none was written.

### 4.3 The disposition table - total, with no silent default

| `UnresolvedClassification` | Producible today? | Disposition |
|---|---|---|
| `RESOLVED` | yes | `NO_PUBLIC_CONTRIBUTION` |
| `MISSING_GENERATOR` | yes (concept-level) | `CONCEPT_UNKNOWN_TEACHING_CANDIDATE`, or `KNOWN_CONCEPT_SENSE_AMBIGUITY` if the snapshot has the word |
| `MISSING_VALIDATOR` | yes (concept-level) | same rule |
| `GENUINE_AMBIGUITY` | yes (parse-level AND concept-level) | parse-level -> `PARSE_GAP_NOT_CONCEPT_UNKNOWN`; concept-level -> unknown/known rule above |
| `UNKNOWN` | yes (parse-level) | `PARSE_GAP_NOT_CONCEPT_UNKNOWN` |
| `UNSUPPORTED_STRUCTURE` | yes (parse-level) | `PARSE_GAP_NOT_CONCEPT_UNKNOWN` |
| `MISSING_SEMANTIC_EMITTER` | **no** | `UNRENDERABLE_MISSING_LAW` - stop, do not guess |
| `MISSING_CANONICAL_OWNER_LAW` | **no** | `UNRENDERABLE_MISSING_LAW` - stop, do not guess |

All nine rows are asserted by `test_structural_response_contract_is_total`.

### 4.4 A correction this pass made, recorded because the measurement is the point

The first mapping treated every concept-level `GENUINE_AMBIGUITY` as an unknown concept. Run
against the real snapshot, `"A zqxjvwkbrump is a kind of tool."` stalled **not on the nonsense word
but on `be`**, the copular hub, carrying **36,876 surviving candidate placements and a 735,046-byte
structural identity key**. Two consequences, both real:

1. Almost every English sentence contains a copula, so that mapping would have offered "teach me
   this" on nearly every turn, about a word Deep Kore knows perfectly well. That is a false claim
   of ignorance.
2. The resulting broker frame is far past any sane transport bound, and the broker refused it. The
   refusal was correct; the mapping that produced the frame was not.

The fix is the owner's own definition: *"Unknown concepts must be unknown relative to that
snapshot."* A stalled concept the snapshot already contains is `KNOWN_CONCEPT_SENSE_AMBIGUITY` - a
sense-selection gap, no offer, no persistence.

**A second correction inside that fix, also measured.** The first attempt tested membership with
`graph.find(concept_id)`. That is wrong: a `DerivingConcept::concept_id` is the SURFACE form
(`be`), while the snapshot is keyed by canonical sense identity (`oewn-be__1`, ...). A direct key
lookup misses every word in the language and would report the entire dictionary as unknown - and
did, in the run that produced the 36,876 figure above. The membership test is now
`resolve_lexical_denotation()`, Law L1's own primitive for exactly this question, the same function
the suite uses to tell `dog` from `zqxjvwkbrump`.

---

## 5. CANONICAL KNOWLEDGE LOAD - EVIDENCE

Loaded by `load_public_chat_knowledge_snapshot()` from the committed ONLINE artifacts under
`Data/data_committed/tesseract/` and `Data/datasets/AIya_kb_oewn/teach_packs/`.

Measured, from the worker's own READY frame and from the suite:

```
{"proto":"DKW1","ok":true,"op":"READY","vanguard_enabled":true,"canonical_concepts":212446}

canonical concepts loaded: 212446  nodes=212446  edges=239376
affordances=212446  definitions=212446
```

**A standing number in the documentation is wrong and is corrected here.** Deep Kore's own comments
say "the real 84,618-concept OEWN-derived graph" in several places. The committed
`concept_graph_v3.dat` this build loads carries **212,446** concepts and 239,376 edges. 84,618 is a
stale figure from an earlier rebuild. The suite deliberately does **not** assert a hardcoded count -
it asserts the graph is real rather than empty, and prints what it found - so a future knowledge
rebuild cannot turn into a spurious test failure.

**Read-only, and structurally so:**

- the snapshot is a `const` object with no mutating member;
- `discover_and_derive_with_roles` now takes the graph `const&`, so derivation *cannot* write it;
- `reanchor_established_concepts` (the one real writer) is never called on it - session anchors go
  to a per-session overlay;
- `SessionConceptGraph::establish()` refuses any id already in the base (`SHADOWS_CANONICAL`), so a
  public session cannot shadow, replace or rewrite a canonical concept;
- every session anchor is `ConceptOrigin::ESTABLISHED_LIVE`, inherited from the canonical
  constructor rather than chosen here;
- `kb_deployment::contains_only_shareable_origins(base)` - the CANONICAL audit gate, not a new one -
  is asserted before and after real turns.

**No per-session copy.** Proven by address identity: with an empty overlay, `view()` returns the
shared base itself (`&a.view() == &s.graph()`). A composed map is built only once a session has
actually established something, and rebuilt only when the overlay changes.

**Fail closed.** A bad data root yields `CONCEPT_GRAPH_UNREADABLE`; an empty one yields
`DATA_ROOT_NOT_CONFIGURED`. A session over a failed snapshot returns
`ENGINE_FAILURE / KNOWLEDGE_SNAPSHOT_UNAVAILABLE` on every turn and carries **no text field at
all**. The worker refuses to start (exit 4). `kb_path=""` does not mean "pretend the knowledge
exists".

---

## 6. RUNTIME EVIDENCE - THE REAL BINARIES

### 6.1 The proof suite

`test_public_chat_cognition_session.exe`, Release, against the real committed knowledge:
**pass=64 fail=0**.

### 6.2 The real worker over DKW1

Driving `dk_session_worker.exe` directly (verbatim, trimmed only for width):

```
READY: {"ok":true,"op":"READY","vanguard_enabled":true,"canonical_concepts":212446}

TURN1 "A dog is an animal."
  outcome=ANSWER  gk1=ALLOW gk2=ALLOW  gk_passed=true
  gov_stamp=GOV_STAMP|gk=pass|iters=0|state_hash=...|policy=text_only|caps=emit_text|...|persona=AIYA
  vanguard_enabled=true  warmed_text populated
  vanguard_diag="in=0 corr=0 band=CENTER box=HELD care=HELD K=4 readable=no"

TURN3 with a REAL wire entity
  {"entities":[{"entity_id":"e1","entity_kind":"UNKNOWN","agreement":"THIRD_SINGULAR"}],
   "current_message":{"segments":[{"kind":"ENTITY","entity_id":"e1"},{"kind":"TEXT",...}]}}
  outcome=ANSWER          <-- entity parsed and reached the session
  no tav_request          <-- and TAV did NOT fire; see 9.1

BAD_ENVELOPE  (entity_kind:"NOT_A_REAL_KIND")        -> error_code=BAD_DEVICE_ENVELOPE
ILLEGAL_DISCLOSURE (DENIED_BY_USER carrying a value) -> error_code=BAD_DEVICE_ENVELOPE
AFTER_REJECT  (a normal turn immediately after)      -> outcome=ANSWER   <-- frame sync intact

CONSENT with the broker DOWN -> {"submitted":false,"broker_status":"UNAVAILABLE"}
DECLINE after that failure   -> {"discarded":true}   <-- candidate was still held
CONSENT with an unissued ref -> error_code=UNKNOWN_CANDIDATE
worker stderr: "dk_session_worker: teaching submission UNAVAILABLE"   <-- status only
WORKER_EXIT: 0
```

Proven by that run: Genesis GK-1 and GK-2 execute; Vanguard is ON and runs after them; the TAV wire
parses and refuses illegal states (a non-GRANTED disclosure carrying a value is rejected, exactly as
the canonical strict parser rejects it); frame sync survives a rejection; a failed teaching
submission reports failure and keeps the candidate; consent to an unissued reference is refused; the
worker logs a status word and never a surface, concept id, case id or reference.

### 6.3 The broker and the owner Workbench path

Broker started under the owner account with `DEEP_KORE_GATEWAY_SID` set to the account the
worker runs as; pipe DACL therefore admits exactly those two principals and nothing else.

- A hand-built canonical frame: broker replied **`DKTB1 OK`** and wrote the queue.
- The written file was then read back with **`ProtectedData.Unprotect(..., DataProtectionScope.CurrentUser)`** -
  the *same .NET API and scope* `TeachingQueueStore.cs` uses - over the *same*
  `[u32 LE length][DPAPI blob]` framing. `RECORDS_DECRYPTED: 1`, and the decrypted record is a
  well-formed `INTAKE_OBSERVED` `TeachingEvent`:

```
{"kind":"INTAKE_OBSERVED","teaching_case_id":"...","structural_identity_key":"...",
 "cognition_run_identity":"...","timestamp_utc":"2026-09-02T00:00:00Z",
 "original_surface":"A zqxjvwkbrump is a kind of tool.","surrounding_context":"",
 "concept_id":"be","structural_coordinate":"be",
 "candidates":[{"placement_id":"ONLY","eliminated":false,"elimination_reason":""}],
 "elimination_trace":[],"tesseract_anchors":[],
 "intake_classification":"GENUINE_AMBIGUITY","rerun_classification":"STILL_DERIVING",
 "owner_relation":"","owner_related_concept_id":"","owner_role":"",
 "owner_split_sense_ids":[],"owner_annotation_kind":"","owner_note":""}
```

`teaching_case_id` at `%LOCALAPPDATA%\AIyaWorkbench\teaching_cases\teaching_events_2026-09-02.jsonl.dpapi`
is exactly where `TeachingQueueStore.CaseDirectory` looks. **The candidate is UNESTABLISHED:** the
broker appends `INTAKE_OBSERVED` and nothing else, and only `teaching_owner_action.hpp`, driven by
the owner in the Workbench, can ever append `ESTABLISHED`.

**A framing deadlock was found and fixed during this proof, and it is worth recording.** The first
broker parsed straight off the pipe and returned as soon as a field failed validation. That
deadlocks: the client is still blocking in `WriteFile` with the rest of a frame larger than the pipe
buffer, while the broker has stopped reading and is waiting to write a reply nobody is reading. A
small hand-built frame succeeded while a real candidate hung both processes, which is what localised
it. The frame now declares its payload length and is drained completely before any field is judged -
the same "frame sync before field validation" law `dk_session_worker`'s own DKW1 reader already
states.

### 6.4 DPAPI scope and identity

| Question | Answer, as proven |
|---|---|
| Scope | **CurrentUser**. `CryptProtectData` with `CRYPTPROTECT_UI_FORBIDDEN` and **no** `CRYPTPROTECT_LOCAL_MACHINE`. Unchanged - decision 7 and 8 honoured, nothing switched to LOCAL_MACHINE. |
| Who writes | the **broker**, under the owner's Windows account |
| Who reads | the owner Workbench, same account, `DataProtectionScope.CurrentUser` |
| Can the Workbench decrypt it | **Yes** - demonstrated above through the identical .NET API |
| Can the gateway decrypt the queue | **No.** It never holds the plaintext: the candidate goes worker -> broker directly and never transits the gateway. A different Windows account cannot decrypt a CurrentUser blob, and `%LOCALAPPDATA%` puts it in a different profile besides. |
| Unauthorised identities | refused by cryptography and by the pipe DACL, which names exactly two SIDs and grants the client no `FILE_CREATE_PIPE_INSTANCE` - so a lower-privileged process cannot squat the pipe name |
| Is this a fifth design | **No.** It is **option 3** of the four already documented, implemented verbatim. It rejects option 1 (gateway stays unprivileged), rejects option 2 (scope unchanged) and rejects option 4 (the public path can contribute), accepting the one cost option 3 named: one more moving part. |

---

## 7. PERSISTENCE AUDIT - EVERY DURABLE WRITE

| Path | Writes? |
|---|---|
| `AIyaChildEngine` AKB1 | **impossible** - `kb_path_` empty, every write guarded by `if (!kb_path_.empty())`, no writer constructible |
| Canonical knowledge snapshot | **read-only by type**, and now by the compiler (`const&` graph parameter) |
| Session concept store / Tesseract overlay | in-process memory only; destroyed by `end_session()`, by the destructor, by reaping and by process exit. No file, no static, no shared map. |
| Conversation transcript | **never written anywhere** |
| Teaching candidate, no consent | **held in session memory only**; discarded on decline, on session end, on reaping |
| Teaching candidate, consented | **one** `INTAKE_OBSERVED` event via the canonical writer, by the broker, under CurrentUser DPAPI |
| TAV value | used for exactly one turn as a supplied context item, cleared unconditionally before the outcome is built; never a class member, never in the concept store, never in a candidate, never in the outcome, never in a log |
| Logs | worker logs a status word; broker logs a refusal code. Neither logs a surface, concept id, case id, reference, credential or stamp. |
| Local spool / retry queue | **none, deliberately.** A failed submission writes nothing anywhere. |

Nothing in the broker frame can carry a transcript, an output path, a Windows identity, a cookie, a
session id, an IP address, Cloudflare metadata, a credential or a browser detail - not because they
are filtered, but because the closed field list has nowhere to put them.

---

## 8. TEST TOTALS

| Suite | Result |
|---|---|
| `test_public_chat_cognition_session` (new) | **64 pass, 0 fail** |
| Release build of `deep_kore`, `dk_session_worker`, `dk_teaching_broker`, the new test | **clean, exit 0** |
| Real-worker DKW1 drive (9 exchanges) | **all as expected**, worker exit 0 |
| Broker + CurrentUser DPAPI read-back | **1 record written, 1 decrypted** |

**Not run this pass:** the full Deep Kore ctest suite, Workbench tests, gateway tests, website unit
tests, `tsc`, `astro check`, ESLint, the website build, the live lane and the five-engine Playwright
regression. Phase 11 is therefore **incomplete**, and it is listed as such rather than summarised as
passing.

---

## 9. STILL NOT PROVEN - WITH EXACT REASONS

### 9.1 TAV grant loop affecting a governed turn - NOT PROVEN

The wire is built and proven to parse, and a turn with no entity correctly never claims TAV
(`no_entity_turn_does_not_claim_tav`). But `cv6::tav::generate_tav_request` requires **condition A**:
Deep Kore's own candidate elimination must resolve the entity to exactly ONE
`StructuralEntityKind`. That evidence comes from `context_state` and `probe_results` - which the
public session accepts through setters but which the device envelope does **not yet carry**.

There is a deeper issue than the missing parser, and it should be decided rather than coded around:
**the browser can be the TAV device for the STORE role** (holding the private value, answering a
disclosure) **but not for the EVIDENCE role** (producing structural probe results that resolve an
entity's kind). A Cordel device has an entity model and a probe pipeline; a web page does not. Until
that is settled, a TAV request cannot lawfully fire on a public turn, and no test should be written
that makes it look as if it did.

### 9.2 Unknown-concept -> consent -> queue, end to end through the real engine - NOT PROVEN

The mechanism is implemented and unit-proven, and the offer lane demonstrably fires (it did, before
the 4.4 correction). It is not currently reachable in a test because **every English sentence tried
stalls on the copula first**, and `be` is canonical, so the correct disposition is
`KNOWN_CONCEPT_SENSE_AMBIGUITY` and no offer is raised. An input whose *stalled* concept is genuinely
absent from a 212,446-concept snapshot has not been found yet. This is an honest gap in the proof,
not in the code, and it must not be closed by weakening the known/unknown rule.

### 9.3 A real consented candidate reaching the queue - NOT PROVEN

The broker write path is proven with a hand-built frame. A real engine candidate was **refused with
`FIELD_TOO_LARGE`**, correctly, because it carried 36,876 candidate snapshots and a 735 KB identity
key. After the 4.4 correction that particular case no longer produces an offer at all, so the
combination "real candidate + accepted by the broker" is untested. **Owner decision needed:** what
"the minimum approved teaching evidence" is for a public submission. The canonical
`structural_identity_key` is built from the sorted candidate ids, so it cannot be trimmed without
diverging from the canonical dedup key - which is a decision, not a refactor.

### 9.4 Determinism replay of the public path - NOT PROVEN

Two turns with identical text produced identical `state_hash` values within a run, and the candidate
reference is content-derived (deterministic by construction). A byte-identical cross-process replay
with Vanguard ON has not been run.

### 9.5 Browser TAV client, gateway wiring, website transport, live and Playwright lanes - NOT BUILT

Phases 4 (browser vault and controls), 8 (gateway + `/api/deep-kore/*` typed outcomes), and 9's
browser-to-C++ lanes are not implemented. Only the closed error codes and their approved sentences
were added on the website side. No browser private-value vault exists yet, so **"private value never
leaves the browser" is not proven** - there is nothing yet to prove it about.

### 9.6 Capacity reverification at 1 / 6 / 12 - NOT RUN

The path changed materially: a worker now loads a 212,446-concept snapshot at startup. The
21.11 arrival matrix no longer describes the thing being bounded. **`DEEP_KORE_MAX_SESSIONS=6`
therefore remains PROVISIONAL and is not confirmed.** It was not silently changed either.

One measurement worth carrying into that run: the snapshot is per PROCESS and one process currently
hosts one session, so today six sessions means six copies of the graph. `SessionConceptGraph` is
built so a future multi-session host shares one copy, but that host does not exist yet.

---

## 10. OWNER DECISIONS - STATUS

| # | Decision | State |
|---|---|---|
| 1 | one canonical C++ public-chat cognition session layer | **done** |
| 2 | no second cognition engine | **honoured** - the session contains no cognition |
| 3 | Deep Kore the only cognition authority | **honoured** - nothing reproduced in C#/TS/Astro/JS/gateway |
| 4 | browser is the TAV device-side counterpart | **partly** - server wire built; browser client not built; see 9.1 |
| 5 | TAV values in ephemeral browser memory | **not built** (9.5) |
| 6 | TAV values never stored by server/gateway/worker/log/queue | **honoured server-side and proven**; cleared after one turn, absent from every persisted shape |
| 7 | keep DPAPI CurrentUser | **honoured, unchanged** |
| 8 | no LOCAL_MACHINE | **honoured, unchanged** |
| 9 | narrow owner-identity broker | **built** (option 3, not a fifth design) |
| 10 | authenticated ACL-restricted local named pipe | **built** - two SIDs, configured not guessed, refuses to start unconfigured |
| 11 | broker alone invokes the canonical writer | **honoured** |
| 12 | `DEEP_KORE_MAX_SESSIONS=6` provisional, reverify | **recorded provisional; NOT reverified** (9.6) |
| 13 | AIya the only public identity | **unchanged** |
| 14 | Aion publicly disabled | **unchanged** |
| 15 | Vanguard ON, strictly after GK-1 and GK-2 | **honoured and proven** - `vanguard_enabled:true`, Phase 4 |

---

## 11. THE HONEST BOTTOM LINE

The C++ integration the previous pass said did not exist now exists, is canonical, builds clean and
is proven against 212,446 real concepts. Three genuine defects were found by running it rather than
by reading it - a broker framing deadlock, a false-unknown mapping that would have claimed ignorance
of the copula on nearly every turn, and a surface-vs-sense-identity lookup error - and all three are
fixed with the measurements recorded.

**Six rows remain NOT PROVEN and one owner decision is newly required** (9.3, the minimum public
teaching evidence). The public Deep Kore chat is **not complete**, `DEEP_KORE_CHAT_PHASE` is still
`disabled`, and nothing has been committed or deployed.
