# Deep Kore canonical-path trace - Phase 1 and Phase 2 result

Date: 2026-09-02
Deep Kore HEAD at trace time: `281a886` ("docs(ledger): record Automatic Lexical Research Phase 6 CLOSED, 436/436")
Deep Kore working tree: dirty (untracked `Source/applications/dk_session_worker/`,
`Workbench/deep_kore_gateway/`, `Tests/tests/test_public_chat_governed_path.cpp`,
`Tests/tests/test_command_argument_parsing.cpp`; modified `Source/CMakeLists.txt`)
Website HEAD: `21af2ca`; working tree ahead of production, uncommitted.

ASCII only. No secrets. No mechanism disclosure beyond file/type names already in this repository's
own architecture record.

---

## 0. THE HEADLINE, STATED FIRST

**The primary objective as written cannot be executed, and the reason is architectural, not a
wiring oversight.** Canonical Deep Kore contains **two separate cognition subsystems**. The public
website path reaches one of them completely and the other not at all, and they are not connected to
each other anywhere in the repository - including in the production Cordel facade, which is the most
complete production caller that exists.

| Subsystem | What it is | Reached by the public path |
|---|---|---|
| **A. Governed conversation** - `conversation::AIyaChildEngine` + `governance::process_governed_turn()` | Genesis GK-1, GK-2, GOV_STAMP, Revelation Vanguard, response composition, the `/teach` lexicon, AKB1 facts | **YES, completely** |
| **B. Structural cognition** - `cognition::DerivingConcept` / `TesseractAddress` / candidate elimination / concept lifecycle / Teaching Queue | The 84,618-concept bootstrap Tesseract, unknown-concept classification, `IntakeRecord` -> `TeachingCase` -> Workbench | **NO, not at all** |

This was established by direct source inspection, not inference. See section 1.4 for the grep that
proves it.

Consequently:

- **TAV**, **Tesseract session anchors**, **canonical knowledge loading**, **unknown-concept
  detection**, **Teaching Queue submission** and **concept lifecycle** are all in subsystem B or in
  the Cordel wire protocol, and none of them is reachable from `process_governed_turn()`.
- Connecting them is **not** "wiring an existing seam". Subsystem A has no call site, no member, no
  include and no data member that touches subsystem B's types. Making the public turn produce a
  Tesseract anchor or an unknown-concept verdict means **building new integration inside C++ Deep
  Kore that does not exist yet** - which is exactly the "do not invent a pipeline" line the
  instruction draws.
- Two further hard blockers are independent of that and are recorded in sections 3 and 4: **TAV has
  no counterparty on a website**, and **DPAPI scope and the planned Windows service identity are in
  direct contradiction**.

Nothing was fabricated to close a row. Every row below is BYPASSED or NOT PROVEN where that is the
truth.

---

## 1. PHASE 1 - THE CANONICAL PATHS, TRACED

### 1.1 The public path as it exists today

```
browser
  -> /api/deep-kore/*                         (Vercel Function, this repository)
  -> deep_kore_gateway                        (.NET 8, loopback HttpListener)
  -> dk_session_worker                        (one process per session, DKW1 stdio)
  -> governance::process_governed_turn(engine, persona, text)
```

`Source/applications/dk_session_worker/main.cpp`, `main()`:

1. `vanguard::set_vanguard_override(1)` - Vanguard ON, owner decision 2026-09-02, in-process
   override rather than `AIYA_VANGUARD`.
2. `conversation::AIyaChildConfig cfg; cfg.debug=false; cfg.isolate_conversation_graph=true;`
3. `std::make_unique<conversation::AIyaChildEngine>(cfg)`
4. `conversation::seed_core_conversation_knowledge(*engine)`
5. per frame: `governance::process_governed_turn(*engine, persona, text)`

That is the whole initialisation. There is no other load.

### 1.2 The most complete production caller, for comparison

`Source/core/protocol/hs_dk_context_cordel_v7_facade.hpp`,
`process_context_request_cordel_v7()` - the Cordel device path. Per turn it:

- parses a `ConversationContextEnvelopeV7` (entities, context_state, recent_turns, probe_results,
  tav_disclosures) supplied **by the device**;
- runs `v5::probe::generate_probe_requests(...)`;
- runs `classify::generate_classification_updates(...)`;
- calls `engine.reset_stateless_context_turn()` and `engine.set_supplied_context_items(...)`;
- calls `governance::process_governed_turn(engine, persona, spine, &clar, nullptr, adult_allowed)`;
- **fire-and-forget appends one `teaching::IntakeRecord`** to the private intake log;
- calls `v6::tav::generate_tav_request(...)` to decide whether to ask the device for one literal
  value on the **next** turn.

Note what this establishes: even the richest production caller does **not** give the engine a
concept store, a Tesseract graph, or a lifecycle. It gives it a text `spine` and a list of supplied
context items, and it captures the spine for **later, offline** structural processing.

### 1.3 The sixteen systems, traced

| # | System | Canonical source | Authoritative type / function | Required state / init | Persistence | Current caller | `process_governed_turn()` reaches it? | Why the public path bypasses it |
|---|---|---|---|---|---|---|---|---|
| 1 | TAV V4-V6 | `core/protocol/hs_dk_context_cordel_v6.hpp`, `..._v6_facade.hpp` | `TavRequest` / `TavDisclosure` / `tav::generate_tav_request()` | a `ConversationContextEnvelopeV6/V7` with `entities`, `context_state`, `probe_results`, `current_message` | **none, by law** - `tav_disclosures` is excluded from the canonical hash preimage and cleared at every checkpoint | `process_context_request_cordel_v6/v7()` only | **NO** | It is a **protocol layer above** the governed turn, not inside it. It runs *after* `process_governed_turn` returns and reads only `gt.outcome.resolution`. It iterates `entities`, of which the website path has none. |
| 2 | Private-value detection | - | **does not exist as a detector** | - | - | - | **NO** | There is no code in Deep Kore that inspects free text and decides "this is a private value". TAV is the *inverse*: Deep Kore holds nothing and **asks** a device that already knows. See section 3. |
| 3 | Disclosure and consent | `..._v6.hpp` | `TavDecision{GRANTED, DENIED_BY_POLICY, DENIED_BY_USER, UNAVAILABLE}` | a device that renders a consent prompt and answers on the **next** turn | none | Cordel device | **NO** | The consent actor is the Cordel device's own UI and policy engine. There is no such actor on the website. |
| 4 | Tesseract anchor construction | `core/cognition/tesseract_address.hpp`; populated by `core/cognition/bootstrap_population.hpp` | `cognition::TesseractAddress`, `populate_bootstrap_tesseract()`, `tesseract_address_from_established()` | `concept_graph_v3.dat` + `causal_edges.dat` + `antonym_edges.dat` + `specializes_edges.dat` | `concept_persistence.hpp` `persist_concept_store()` | `tools/dk_cognition_glass.cpp`; `teaching_intake_processor.hpp` | **NO** | `AIyaChildEngine` never includes, constructs, reads or writes `cognition::TesseractAddress`. Verified by grep - section 1.4. |
| 5 | Tesseract anchor retrieval | same | `graph.find(concept_id)`; `propagate_thought()` | an already-populated `graph` | same | same | **NO** | same |
| 6 | Anchor correction | `core/cognition/concept_lifecycle.hpp` | `split_into_senses()`, `reanchor_established_concepts()` | a live `DerivingConcept` store | same | `dk_cognition_glass --owner-split`; intake processor | **NO** | same |
| 7 | Concept lifecycle | `core/cognition/concept_lifecycle.hpp` | `cognition::ConceptLifecycleState`, `classify_deriving_concept()` | `DerivingConcept` store + role affordances | `concept_persistence.hpp` | `discover_and_derive_with_roles()` | **NO** | same |
| 8 | Canonical knowledge-package loading | `core/cognition/bootstrap_population.hpp`; `core/kb_deployment/*` | `populate_bootstrap_tesseract()`, `populate_bootstrap_role_affordances()`, `build_full_affordance_index()` | `Data/data_committed/tesseract/*.dat` (ONLINE) or the encrypted region store (OFFLINE) | read-only source | `tools/dk_cognition_glass.cpp` | **NO** | Nothing in subsystem A calls it. `AIyaChildEngine`'s own knowledge stores are entirely different objects - see Phase 2. |
| 9 | Known vs unknown concept resolution | `core/cognition/candidate_generation.hpp`, `core/cognition/unknown_lexeme_evidence.hpp`, `unknown_provisional.hpp` | `discover_and_derive_with_roles()`, `extract_unknown_lexeme_evidence()`, `cognition::classify()` | populated `concepts` + `graph` + `affordances` | via concept store | intake processor; glass tool | **NO** | Requires the concept store the engine does not have. The engine's own "unknown word" behaviour is a **lexicon miss**, which is a different and much weaker signal. |
| 10 | Teaching Queue candidate creation | `core/teaching/teaching_intake.hpp` (capture) -> `teaching_intake_processor.hpp` (classify) -> `teaching_case.hpp` (canonical case) | `build_cordel_intake_record()`, `IntakeStore::append()`, `process_pending_intake_records()`, `TeachingEventKind::INTAKE_OBSERVED` | capture: none. classify: a full `CanonicalCognitionContext` | DPAPI + length-framed JSONL | capture: Cordel V7 facade. classify: owner-invoked processor | **NO** | Capture is not called on the website path at all. Classification is **deliberately off the live turn** by design (`teaching_intake.hpp`: "cheap, synchronous ... no bootstrap-graph load"). |
| 11 | Canonical JSONL persistence | `core/teaching/teaching_record_framing.hpp` | `append_protected_record()` / `read_protected_records()` - `[u32 LE length][DPAPI blob]` | a writable directory | append-only, crash-safe by decrypt-failure | intake + case stores | **NO** | nothing on the public path writes a record |
| 12 | DPAPI protection | `core/teaching/protected_storage.hpp` | `CryptProtectData` / `CryptUnprotectData`, `CRYPTPROTECT_UI_FORBIDDEN`, **no `CRYPTPROTECT_LOCAL_MACHINE`** => **CurrentUser scope** | the calling process's Windows logon identity | - | teaching stores | **NO** | see section 4 - and it is a blocker even once something does call it |
| 13 | Owner Workbench Teaching Queue consumption | `Workbench/AIya_workbench_WPF/Models/TeachingQueueStore.cs` | `ReadDay()`, `Fold()` | `%LOCALAPPDATA%\AIyaWorkbench\teaching_cases\teaching_events_<day>.jsonl.dpapi`, `DataProtectionScope.CurrentUser` | read-only | the WPF Workbench | n/a | reads a store the public path never writes |
| 14 | Genesis GK-1 | `core/governance/governed_channel.hpp` | Phase 1, inside `engine.StepUserText()`; `engine.last_gk1_result()` | the engine | none | every governed caller | **YES** | - |
| 15 | Genesis GK-2 | same | Phase 2, emission gate | the engine | none | every governed caller | **YES** | - |
| 16 | Revelation Vanguard | `core/vanguard/vanguard.hpp` | Phase 4, `warm_with_established_registry()`, gated on `vanguard::vanguard_enabled()` | the established emotional-temperature registry | none | every governed caller | **YES**, and it is now **ON** on this path | - |

Ordering, read directly out of `governed_channel.hpp` `process_governed_turn()`:

```
Phase 1   GK-1 semantic gate        (inside StepUserText)
Phase 1b  meta/self answer ownership
Phase 2   GK-2 emission gate
Phase 3   GOV_STAMP
Phase 4   Revelation Vanguard       (additive; populates warmed_text + vanguard_diag only)
```

**Owner decision 6 is satisfied and was already satisfied**: Vanguard is structurally after GK-1
and GK-2, and cannot alter `text`, alter the stamp, or turn a refusal into an answer.

### 1.4 The proof that subsystems A and B do not meet

Grep over `Source/core/conversation/AIya_child_engine.hpp` (22,893 lines) for:

`tesseract | Tesseract | discover_and_derive | populate_bootstrap | DerivingConcept |
ConceptLifecycleState | CanonicalCognitionContext | run_structural_cognition_for_input |
teaching:: | IntakeStore`

**Zero hits** for `DerivingConcept`, `ConceptLifecycleState`, `discover_and_derive`,
`populate_bootstrap`, `CanonicalCognitionContext`, `run_structural_cognition_for_input`,
`teaching::`, `IntakeStore`.

The `tesseract` hits are a **different Tesseract**: `core/concept_graph/tesseract_runtime.hpp`, the
emotional-temperature coordinate registry (`felt_charge_of`,
`classify_expression_vs_query`). It is not `cognition::TesseractAddress` and carries no concept
identity, no candidate set and no lifecycle. Treating one as the other would be exactly the
"selected an implementation because its name looked correct" failure the instruction warns against.

The one file that touches both is `Source/tools/dk_cognition_glass.cpp`, and it is explicit that it
runs them **side by side as two independent observations of the same sentences**, never as one
pipeline: it builds `concepts`/`graph`/`affordances` for the structural view, and separately
constructs a **default-configured** `AIyaChildEngine` purely to observe real governance telemetry.
The governed engine there is given no concept store.

### 1.5 Competing implementations, resolved

- **"Tesseract"**: `core/cognition/tesseract_address.hpp` + `tesseract_navigation.hpp` +
  `bootstrap_population.hpp` is **canonical** for structural knowledge anchors.
  `core/concept_graph/tesseract_runtime.hpp` is canonical for **emotional temperature** and is a
  different axis. They were not combined.
- **"Teaching"**: `teaching_intake.hpp` (private capture) and `teaching_case.hpp` (canonical case)
  are two deliberately separate surfaces of one ledger, with the processor between them. The
  Workbench reads `teaching_cases` only. `teaching_owner_action.hpp` is the owner-action layer.
  None was substituted for another.
- **Protocol versions**: V7 (`hs_dk_context_cordel_v7_facade.hpp`) is the current canonical Cordel
  entry point. V1-V6 are frozen by their own stated law and were read for reference only.

---

## 2. PHASE 2 - WHAT `AIyaChildEngine(kb_path="")` ACTUALLY INITIALIZES

Answered against `AIya_child_engine.hpp` line 8825 and the worker's own startup.

```cpp
explicit AIyaChildEngine(const AIyaChildConfig& cfg) : config_(cfg) {
    graph_.set_isolated(config_.isolate_conversation_graph);
}
```

Two statements. That is the entire constructor.

| Question asked | Answer | Evidence |
|---|---|---|
| loads all 84,618 bootstrapped concepts? | **NO** | Those live in `Data/data_committed/tesseract/concept_graph_v3.dat` (17.2 MB) and are loaded only by `populate_bootstrap_tesseract()`, which `AIyaChildEngine` never calls. |
| loads the current canonical production knowledge package? | **NO** - and, importantly, **no such package exists for subsystem A**. The production CLI's knowledge is a *per-user session directory*: `latest.lexicon.txt` (4,337 bytes), `latest.graph.txt`, `latest.facts.txt`, `kb/knowledge.akb`, all under `runtime/AIya_sessions`. These are accumulated taught state, not a shipped package. | `applications/AIya_chat/main.cpp` lines 197-205, 11418-11530 |
| starts with empty knowledge? | **YES at construction.** The worker then calls `seed_core_conversation_knowledge()`, which teaches a fixed, in-memory conversation-readiness vocabulary through the ordinary `teach()` path. So the worker is **seeded, not empty** - but seeded with the shared readiness list, not with a knowledge package. | `dk_session_worker/main.cpp:303`; `core_conversation_knowledge_seed.hpp` |
| disables durable conversation writes only? | **It does more than disable them: it makes them unconstructible.** Every AKB1 write is guarded by `if (!kb_path_.empty())` and `kb_enabled_` is only set true by `load_kb()`. With no path there is no writer object to build. | 30+ guarded sites, e.g. lines 9489, 9525, 9546, 9594, 9626, 9666, 10234, 10443, 10537 |
| bypasses Tesseract? | **YES** - `cognition::TesseractAddress` is never reached. The emotional-temperature `tesseract_runtime` **is** reached (WIRE C, felt-charge), and that is a different thing. | section 1.4 |
| bypasses lifecycle state? | **YES** - `ConceptLifecycleState` is never reached. | section 1.4 |
| bypasses unknown-concept detection? | **YES** for the canonical detector (`extract_unknown_lexeme_evidence` / candidate elimination). A lexicon miss still occurs and still produces an honest "I do not know that word"-class answer, but that is a lexicon lookup, not concept classification. | section 1.4 |
| bypasses the Teaching Queue? | **YES**, completely - no capture call exists on this path. | `dk_session_worker/main.cpp` has no `teaching::` reference |
| changes TAV behavior? | **No, because TAV is not on this path at all.** TAV lives above `process_governed_turn` in the Cordel facade and is a function of wire `entities`. `kb_path` has no bearing on it. | section 1.3 row 1 |

### 2.1 The Phase 2 instruction cannot be satisfied as written

> "The website worker must load the canonical production knowledge in the same lawful manner as the
> authoritative Deep Kore production facade."

The authoritative production facade (`process_context_request_cordel_v7`) **loads no knowledge
package at all.** It receives a context envelope from a device and calls the same
`process_governed_turn` the website worker already calls. Doing "the same lawful manner" as the
production facade is, precisely, what the worker is already doing.

The 84,618-concept package is loaded by **`dk_cognition_glass.exe` and the Teaching Intake
Processor**, neither of which is a conversational facade, and both of which feed subsystem B.

`dk_cognition_pipeline.hpp` explicitly anticipates the thing being asked for and marks it as **not
yet built**:

> "a future persistent server/local engine: loads ONE context once per process lifetime and calls
> this function per live turn, never rebuilding the 84,000+-concept bootstrap graph per input."

"a future ... engine" is the honest status. The seam (`CanonicalCognitionContext` by reference) was
deliberately left open for it. **What does not exist is any code that takes a
`StructuralCognitionResult` and lets it inform a governed conversational answer.** That is new
cognition integration, not plumbing, and it is not mine to invent.

**Read-only public knowledge:** the requirement that public sessions never mutate canonical
knowledge is **already satisfied and satisfied structurally** - not by a flag. `kb_path_` is empty,
so no AKB1 writer can be constructed; `isolate_conversation_graph = true` keeps live associations
out of the shared concept graph. If subsystem B were ever loaded into the worker, this guarantee
would have to be re-established separately for `concepts`/`graph`, because
`discover_and_derive_with_roles()` **mutates** `context.concepts` and `context.graph` in place by
design. That is a new invariant to build, and it is the single most dangerous part of the requested
change.

---

## 3. PHASE 3 BLOCKER - TAV HAS NO COUNTERPARTY ON A WEBSITE

TAV is not a privacy classifier. Read in full, its law is:

- The **device** owns the user's private memory. Deep Kore owns none of it.
- Deep Kore may, for exactly one stateless turn, ask the device for one literal value, and only
  when it must **say that value back to the user** (`TavPurpose` has exactly one enumerator:
  `RESPONSE_REQUIRES_LITERAL_VALUE`).
- The device answers `GRANTED` / `DENIED_BY_POLICY` / `DENIED_BY_USER` / `UNAVAILABLE`.
- The value never enters the hash domain, never survives a checkpoint, never becomes a replay
  dependency.

`tav::generate_tav_request()` iterates `const std::vector<EntityV4>& entities` and returns false
immediately if no entity arrived UNKNOWN-but-structurally-resolvable and referenced this turn.

**On the public website there are no entities, no device, and no user-private memory store.** With
an empty entity list the function is a no-op that returns `false` on every turn, for every input,
forever. Wiring it in would produce a row that says "TAV reached" while proving nothing - the worst
available outcome, and the one the instruction's own "do not select an implementation merely
because its name looks correct" rule exists to prevent.

Making TAV meaningful on the website would require **creating a per-visitor private memory store and
an entity model** - i.e. durable storage of visitor personal data. That is the direct opposite of
owner decision 8 ("public conversations remain temporary by default") and of the published
`PRIVACY_DISCLOSURE`, and it is not something to do on inference.

**Status: BYPASSED, and I am not connecting it. This is reported, not resolved.**

The requested TAV tests (private-value recognition, disclosure withheld, consent granted, consent
denied, session isolation, deletion removes state, no leakage) were **not written**, because each
would either assert a vacuous truth or require inventing the private-value detector described in
row 2 of the Phase 1 table - a mechanism that does not exist in canonical Deep Kore and that
requirement 7 explicitly forbids me from substituting with pattern matching, regex, probabilistic
classification, or a PII library.

---

## 4. PHASE 6 BLOCKER - DPAPI SCOPE vs THE PLANNED SERVICE IDENTITY

This one is decidable now, and the answer is a contradiction.

| # | Question | Answer | Evidence |
|---|---|---|---|
| 1 | Which DPAPI scope does the Teaching Queue use? | **CurrentUser.** `CryptProtectData` is called with `CRYPTPROTECT_UI_FORBIDDEN` and **no** `CRYPTPROTECT_LOCAL_MACHINE`, so the key is derived from the calling account's Windows logon credentials. | `protected_storage.hpp:81` |
| 2 | Which Windows identity would write a website-submitted candidate? | Whatever identity the gateway/worker runs as. Both stores are addressed through `%LOCALAPPDATA%`, so the identity also decides the *directory*. | `teaching_intake.hpp:74`; `TeachingQueueStore.cs:50` |
| 3 | Which identity runs the owner Workbench? | The owner's interactive Windows login. | WPF desktop app |
| 4 | Can the Workbench decrypt a candidate written by a service? | **NO**, if the service runs as any account other than the owner's. `ProtectedData.Unprotect(..., DataProtectionScope.CurrentUser)` throws `CryptographicException` on a foreign-user blob, and the reader's documented law is to **stop at that record**, never guess. It would also be looking in a different directory. | `TeachingQueueStore.cs:101-106` |
| 5 | Are unauthorized identities refused? | **Yes** - by cryptography, not by an ACL check. That is the correct behaviour and it is exactly what makes (4) fail. | same |
| 6 | Do permissions and ACLs match Privacy First law? | The law is satisfied *within one identity*. It has no cross-identity provision, because the design assumed one interactive owner on one machine. | `teaching_intake.hpp` header |

**The contradiction, stated exactly:** DPAPI CurrentUser scope makes the Teaching Queue readable
only by the account that wrote it, and `%LOCALAPPDATA%` makes it *visible* only to that account.
A Windows service running as LocalSystem, NetworkService, or a dedicated service account therefore
writes to a store the owner Workbench can neither find nor decrypt. A public visitor's teaching
candidate would be written successfully and be permanently unreviewable - a silent failure, with
nothing looking wrong on either side.

**Canonical project-supported options, not chosen, listed for the owner:**

1. **Run the gateway as the owner's own Windows account** (a logged-on scheduled task or a service
   configured with that account). Preserves DPAPI CurrentUser and the existing store unchanged.
   Cost: the account must be logged on or the credential stored; it also means public traffic is
   handled under the owner's interactive identity, which is a real security trade-off in the other
   direction.
2. **Switch the Teaching Queue to `CRYPTPROTECT_LOCAL_MACHINE`.** Any account on the machine could
   then read it, which is a genuine weakening of the current guarantee and would need a matching
   `DataProtectionScope.LocalMachine` change in `TeachingQueueStore.cs`. Phase 6 says explicitly
   not to switch scope for convenience, so this needs a written owner decision on its merits.
3. **Do not let the public path write the Teaching Queue at all.** The gateway hands a consented
   candidate to a separate owner-identity process, which performs the protected write. This keeps
   CurrentUser scope intact and keeps the service unprivileged, at the cost of one more moving
   part.
4. **Leave the public path out of the Teaching Queue entirely** and keep the queue a Cordel/owner
   surface, as it is today.

**No option was selected and no code was changed. This is the stop-and-report Phase 6 asked for.**

---

## 5. PHASES 4, 5, 7, 8, 9 - NOT ATTEMPTED, AND WHY

- **Phase 4 (Tesseract session anchors)**: depends on subsystem B being in the worker. Blocked by
  section 0. Building a website-side anchor store is explicitly forbidden by the instruction and
  would be the wrong answer anyway.
- **Phase 5 (unknown-concept handling)**: depends on the canonical detector, which needs the
  concept store. Additionally, the canonical architecture puts classification **off** the live turn
  on purpose; a live unknown-concept verdict is a new design decision, not an existing capability.
- **Phase 7 (real-path tests)**: 20 required tests. Rows 14/15/16 (GK-1, GK-2, Vanguard-after-
  Genesis), 17 (deterministic replay), 18 (no fabricated answer on worker failure) and 19 (no
  fallback) are already proven by the existing local proof at
  `qa/deep-kore-chat-local-proof-2026-09-01.md` and `tests/live/`. The other fourteen assert
  behaviour of systems the public path does not reach; writing them now would produce tests that
  pass by asserting nothing.
- **Phase 8 (capacity reverify)**: deliberately not run. The owner's own condition is
  "reverify **after** the complete Deep Kore path is connected". Re-running the arrival matrix
  against the unchanged worker would reproduce 21.11's numbers and would be presented as a
  confirmation of something that has not changed.
- **Phase 9 (full verification sweep)**: not run in this pass. No source file in either repository
  was modified; the only edits are the two documentation records in section 6.

---

## 6. WHAT WAS ACTUALLY CHANGED IN THIS PASS

Two documentation records, both owner decisions, no code:

| File | Change |
|---|---|
| `OWNER_README.md` section 21.10 | Records `DEEP_KORE_MAX_SESSIONS=6` as the **provisional** value, with the owner's re-verification condition, the "still a required variable, no code default" rule, and the fact that it is scoped to this machine. |
| `CLAUDE.md` section 19, open gates | Closes the Revelation Vanguard gate: **ON**, by owner decision 2026-09-02, enabled through `vanguard::set_vanguard_override(1)` in `dk_session_worker`'s `main()` rather than `AIYA_VANGUARD`, with the reason and the determinism-baseline consequence. |

Owner decisions 4, 5, 7, 8, 9 and 10 required no change: AIya-only, AIon not exposed,
`DEEP_KORE_CHAT_PHASE` disabled, temporary conversations, and no automatic canonical-knowledge
mutation are all already canon and all already structural on this path.

Nothing was committed, pushed or deployed. No secret was entered. No service, tunnel, DNS,
Cloudflare or Vercel change was made. `DEEP_KORE_CHAT_PHASE` remains `disabled`.

---

## 7. THE STATUS ROWS, HONESTLY

| Row | Status |
|---|---|
| Genesis GK-1 reached publicly | **PROVEN** (existing proof, unchanged) |
| Genesis GK-2 reached publicly | **PROVEN** (existing proof, unchanged) |
| Revelation Vanguard, strictly after Genesis | **PROVEN**, and now **ON** by owner decision |
| Public projection withholds engine internals | **PROVEN** (existing proof, unchanged) |
| No fallback of any kind | **PROVEN** (existing proof, unchanged) |
| Canonical knowledge loading | **NOT PROVEN - BYPASSED.** No knowledge package is loaded; the seed vocabulary is. |
| TAV reached publicly | **NOT PROVEN - BYPASSED**, and structurally unreachable without a device-side private memory store |
| Tesseract session anchors | **NOT PROVEN - BYPASSED** |
| Unknown-concept detection | **NOT PROVEN - BYPASSED** |
| Concept lifecycle | **NOT PROVEN - BYPASSED** |
| Teaching Queue submission (consented) | **NOT PROVEN - BYPASSED**, and additionally blocked by section 4 |
| Owner Workbench can review a public candidate | **NOT PROVEN - CONTRADICTED** by DPAPI scope vs service identity |
| DPAPI / service identity | **CONTRADICTION REPORTED**, four options listed, none chosen |
| Capacity at 6 | **NOT RE-VERIFIED**, per the owner's own "after the path is connected" condition |
| Persistence audit | Public path writes **nothing durable**: `kb_path_` empty, no `teaching::` call site, no transcript, no analytics. This is the one durable-write claim that is fully proven, and it is proven by absence of a writer rather than by policy. |

**The public Deep Kore chat is NOT complete.** Six required rows are BYPASSED and one is
CONTRADICTED.
