# TAV condition A — a correction, and the working grant loop

Date: 2026-09-03
Deep Kore branch: `feature/deep-kore-public-chat-cognition-session` (from `00020af`)
Website branch: `feature/deep-kore-public-chat-canon` (from `58bd6ad`)
`DEEP_KORE_CHAT_PHASE`: **still `disabled`**. Nothing pushed, deployed or configured.

---

## 1. THE CORRECTION

**My previous report said TAV condition A was not reachable. That was wrong, and it was wrong in a
specific and instructive way: it was an inference from an absence.**

The 2026-09-02 sweep observed that no `TavRequest` appeared across 6 relationship roles and 3
question forms, and concluded condition A had failed. But `generate_tav_request` requires **four**
conditions, and an absent request is consistent with any of them failing. I attributed it to A
without measuring A.

Measured directly this pass, by calling the canonical derivation itself:

```
[A: relationship_role=PARTNER only]     status=RESOLVED  surviving=1  [PERSON]
[A: role=PARTNER + event actor=e1]      status=RESOLVED  surviving=1  [PERSON]
[A: event destination=e1 only]          status=UNKNOWN_REQUIRES_EVIDENCE  surviving=3  [PLACE,BUSINESS,ORGANIZATION]
```

**Condition A was already satisfied**, from `relationship_role` alone — the one evidence source that
already crossed the seam. Elimination resolves the entity to exactly one `StructuralEntityKind`.

The real blocker was **condition C**: the governed turn's `ResolutionOutcome`.

```
[C] "What is their phone number?"              -> resolution=NOT_APPLICABLE
[C] "Where do they live?"                      -> resolution=NOT_APPLICABLE
[C] "Who is Ada Lovelace?"                     -> resolution=NOT_APPLICABLE
[C] "Why does a zqxjvwkbrump work?"            -> resolution=CLARIFY
[C] "List the parts of a zqxjvwkbrump."        -> resolution=UNRESOLVED   <- TAV_REQUIRED
```

`resolution` is read from `engine.last_goal_completion()`, which `process_governed_turn` populates
**only when the inquiry pipeline actually ran**. A social, meta or safety-owned turn leaves it
`nullopt`, which maps to `NOT_APPLICABLE`, and `NOT_APPLICABLE` is neither `UNRESOLVED` nor
`UNSUPPORTED`. Every question I had tried was leaving the pipeline unentered.

**The lesson worth keeping:** a compound predicate that does not fire tells you nothing about which
conjunct failed. Measure the conjuncts.

---

## 2. THE `probe_results` PRODUCER — THE ANSWER TO THE GATE

The instruction was to locate the existing internal Deep Kore path that lawfully produces
`probe_results`, and to stop and report if none exists.

**None exists, by design — and none is needed.**

### 2.1 Every non-test reference, classified

| File | Role |
|---|---|
| `hs_dk_context_cordel_v5.hpp` | type definition; `emit_probe_results` (serializer); one `ProbeResult pr;` at line 504 **inside the strict wire parser** |
| `hs_dk_context_cordel_v6.hpp` | `using v5::ProbeResult`; envelope field; one `ProbeResult pr;` at line 510 **inside the strict wire parser** |
| `hs_dk_context_cordel_v7.hpp` | `using v5::ProbeResult` only |
| `v5_facade.hpp` | **consumer** — `const std::vector<ProbeResult>&` in `entity_has_confirmed_affordance`, `derive_evidence_for_entity`, `generate_probe_requests` |
| `v6_facade.hpp`, `v7_facade.hpp` | **consumers** — `const std::vector<ProbeResult>&` |
| `concept_persistence.hpp` | a doc comment stating it *never touches* `ProbeRequest`/`ProbeResult` |
| `public_chat_session.hpp` | **consumer** (mine) |

Every construction of a `ProbeResult` outside the two wire parsers is in a **test**
(`test_hs_dk_context_cordel_v5/v6/v7.cpp`).

### 2.2 The contracts

- **Producer:** the DEVICE. `ProbeResult` is documented as "the device's typed answer to a PRIOR
  turn's `ProbeRequest`". Deep Kore emits `ProbeRequest{probe_id, target_entity_id, affordance,
  counterfactual_frame}`; the device renders the counterfactual frame **locally, with the real
  private value**, and answers `{probe_id, target_entity_id, affordance, answer}` where `answer` is
  `VALID | INVALID | UNKNOWN | AMBIGUOUS`.
- **Callers that presently supply `probe_results`:** the Cordel wire envelope (V5/V6/V7 requests)
  and the conformance tests. Nothing else.
- **Why the public cognition path cannot reach it:** there is nothing to reach. Deep Kore is
  stateless per Cordel request and deliberately holds no private entity model, so it cannot answer
  a counterfactual about one. Asking the browser to answer would be exactly the evidence-authority
  role the owner's TAV policy forbids it.

### 2.3 The smallest structurally coherent integration — and why none is required

`derive_evidence_for_entity` reads `probe_results` through **one** call:
`entity_has_confirmed_affordance(evt.actor, CanSupplyPrescription, probe_results)`. It selects
between `CanBeMedicallyDispensed` and `CanFunctionAsDestination` for an event *destination*. It is a
single cross-entity medical-dispensing refinement — not a precondition of condition A.

**Condition A is reachable without it**, measured above and now proven end to end. So the correct
integration is: none. No fake probe evidence was invented, condition A was not weakened, and no
browser-side entity model was created.

---

## 3. `context_state.events` TRANSPORT — IMPLEMENTED

The second evidence source now crosses the seam, as instructed.

The worker's device envelope accepts an `events` array of `{event_id, actor, destination}`. The
session merges them into a **per-turn** context state and passes that to
`generate_tav_request`; nothing is retained across turns, because an event link is as transient as
the message that carried it.

**`description` and `temporal` are deliberately NOT accepted.** They are `Segment` sequences a
Cordel device renders locally. `derive_evidence_for_entity` reads only `actor` and `destination`, so
the public path has no use for them — and accepting free-text segments from a browser would open a
channel for exactly the raw private values the TAV design keeps device-side.

`actor` and `destination` are opaque entity ids by the V4 protocol's own design. Supplying them
discloses structure, never content — the same class of thing `relationship_role` already is.

---

## 4. THE TAV GRANT LOOP — PROVEN

A permanent regression test (`test_tav_grant_loop`) now covers the whole loop against the real
engine, with **no `probe_results` supplied anywhere**:

| Assertion | Result |
|---|---|
| A lawful `TavRequest` is emitted | PASS |
| It carries an id, targets the referenced entity, names a typed field | PASS |
| Its purpose is the only lawful enumerator (`RESPONSE_REQUIRES_LITERAL_VALUE`) | PASS |
| The session awaits exactly that `tav_id` | PASS |
| A TAV request is not a teaching offer and not an answer | PASS |
| The turn still passed Genesis, carrying both GK decisions | PASS |
| `DENIED_BY_USER` leaves cognition governed and coherent, not a failure | PASS |
| A `GRANTED` value is consumed for exactly one turn | PASS |
| The value is cleared from the engine's supplied context after the turn | PASS |
| A grant creates no extra durable candidate | PASS |

The illegal shape — a non-`GRANTED` decision carrying a value — is refused **across the real wire**
by the worker's envelope parser (`BAD_DEVICE_ENVELOPE`), which is where the parser actually lives.

**Suite: 117 pass, 0 fail.**

---

## 5. WHAT IS NOT DONE

**The browser chat is not built.** Assessed this pass rather than started blind:
`src/components/deep-kore/ChatConsole.tsx` exists (16.5 KB) but its state union is a transport phase
machine — `'idle' | 'starting' | 'open' | 'sending' | 'waiting' | 'ending' | 'ended'` — not the five
required client states, and there is no private-value vault, no TAV decision control and no teaching
consent control. The gateway and `/api/deep-kore/*` also do not yet carry the typed outcome union.

So of the 24 end-to-end browser rows, none is proven, and the accessibility rows are unstarted.
Capacity has not been re-measured because the browser path that would change it does not exist yet.

**`DEEP_KORE_CHAT_PHASE` must stay `disabled`.** A visitor still has no way to see, grant or revoke
the consent the whole design is built around, and the site cannot render either the TAV request or
the teaching offer the engine now produces.
