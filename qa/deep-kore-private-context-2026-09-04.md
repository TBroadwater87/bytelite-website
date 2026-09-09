# The Private Context surface, and real TAV through the public interface

Date: 2026-09-04
Website branch: `feature/deep-kore-public-chat-canon`, from `d4f8194`
Deep Kore repository: **read only.** Not modified, staged, committed, reset or stashed.
`DEEP_KORE_CHAT_PHASE`: **still `disabled`.** Nothing pushed or deployed.

ASCII only. Variables are named, never valued.

---

## 1. WHAT WAS AUTHORISED, AND WHAT WAS BUILT

The owner authorised **the smallest lawful visitor-facing Private Context surface required to
make real TAV reachable**, and authorised the private literal to cross on an explicit grant for
one turn.

The measured seam recorded on 2026-09-04 was that a public turn carrying no device entity model
gets `TEACHING_OFFER`, and the same turn with one gets `TAV_REQUIRED`. The evidence that closes
that gap is a **relationship role on an entity the message references** - which the site cannot
know and must not invent. So the surface is exactly: *the visitor declares an entity, chooses a
canonical relationship role, and says which message is about it.*

Nothing more was built. **Events were deliberately not exposed** (`events[]` is a second evidence
source and is not needed to reach TAV), no free-text context crosses, and no `StructuralEntityKind`
is ever sent - that enumeration is what Deep Kore RESOLVES TO by elimination, and a device sending
one would be asserting the conclusion instead of the evidence.

---

## 2. THE CANONICAL VOCABULARY, TRANSCRIBED ONCE

Read from the Deep Kore protocol headers and placed in ONE shared module,
`api/_lib/deep-kore-codes.ts`, which both the server's validation and the browser's own controls
read. A contract change is one file to re-read and one file to edit.

| List | Values | Source header |
|---|---|---|
| `RelationshipRole` | SELF, PARTNER, MATCH, FRIEND, FAMILY, OTHER | `hs_dk_context_v1.hpp` |
| `EntityKind` (device) | SELF, PERSON, PLACE, AI_ASSISTANT, GROUP, UNKNOWN, OTHER | `hs_dk_context_v1.hpp` |
| `Agreement` | FIRST_SINGULAR, SECOND, THIRD_SINGULAR, PLURAL | `hs_dk_context_v1.hpp` |
| `TavField` | DISPLAY_NAME, ADDRESS, PHONE_NUMBER, EMAIL, RELATIONSHIP_LABEL, EVENT_DESCRIPTION_DETAIL, OTHER | `hs_dk_context_cordel_v6.hpp` |
| `TavDecision` | GRANTED, DENIED_BY_POLICY, DENIED_BY_USER, UNAVAILABLE | `hs_dk_context_cordel_v6.hpp` |
| `TavPurpose` | RESPONSE_REQUIRES_LITERAL_VALUE (one enumerator) | `hs_dk_context_cordel_v6.hpp` |
| `MAX_DEVICE_BYTES` | 262144 | `dk_session_worker/main.cpp` |

The server previously accepted `^[A-Z_]{1,40}$` for the entity enumerators and left the vocabulary
to the worker. **That is no longer good enough now that a visitor chooses these values**: a control
able to offer something the engine does not define is one that can be wrong in a way only the
origin notices, after the visitor chose it in good faith. Both the store and the server now check
against the canonical lists.

---

## 3. THE LITERAL, AND THE ONE CONDITION UNDER WHICH IT CROSSES

`TavDisclosure.value` is canonical, and the header states the rule the site now mirrors exactly:

> `value` is meaningful ONLY when `decision==GRANTED`; the strict parser REJECTS any request where
> a non-GRANTED decision carries a non-empty value (illegal state unrepresentable, not merely
> "should be empty by convention").

The site enforces that at **its own** boundary rather than relying on the upstream one. Two
independent parsers refusing the same illegal shape is the point: a literal leaving a browser
under a refusal is the worst thing this feature could do, and it should have to get past both.

`decideTavAnswer` changed accordingly, and three vault tests that asserted the opposite were
replaced with the reason recorded in place:

| Situation | Decision | Value |
|---|---|---|
| Visitor refused | `DENIED_BY_USER` | none, and the vault is not read at all |
| Permitted, value held | `GRANTED` | the literal, once |
| Permitted, nothing held | `UNAVAILABLE` | none |

**`DENIED_BY_POLICY` is canonical and this device never sends it.** It means "there is something
here and this device will not disclose it", and after the authorisation this browser has no such
policy. Sending it would describe a rule that does not exist.

**No length of the site's own bounds the value.** It is bounded by `MAX_DEVICE_BYTES`, the
worker's own constant, applied to the serialised envelope - so nothing here invents a limit on how
much a visitor may choose to disclose about themselves.

---

## 4. WHAT THE VISITOR SEES, AND WHAT NEVER LEAVES

The panel is a disclosure, **closed by default**, and the conversation works with it untouched.
Ordinary chat sends no device envelope at all, which is asserted rather than assumed.

**The label never leaves.** A visitor needs to recognise which entity they mean, and a name is the
natural way - so a name is exactly the kind of thing that must not be transmitted.
`toDeviceEntities()` is the only function that produces wire shape and it cannot emit a label,
because it never writes one. The opaque `entity_id` is 12 random bytes and is **not** derived from
the label, proven by adding the same label twice and getting different ids.

**Nothing is inferred.** There is no parser, no lexicon and no transcript access in
`privateContext.ts`, and a test asserts the absence by scanning the module's code with comments
stripped. A new entity is **not** attached to the next message on its own: describing someone and
saying a message is about them are two different statements, and only the visitor makes the second.

**Cleared on every path**: use, denial, revocation, removal, explicit clear, session deletion,
terminal failure, navigation and page closure.

---

## 5. `DEEP_KORE_TEACHING_MAX_RECORD_BYTES` - THE INTRINSIC DETERMINATION

Asked: does an intrinsic maximum already exist in the canonical wire or record format?

**No intrinsic maximum exists, and the record is canonically self-delimiting.**

- The durable store is `[u32 length-prefix][DPAPI-protected blob]`, appended
  (`teaching_record_framing.hpp`). Every record delimits itself; a truncated write is detected by
  the boundary plus decrypt failure, never by a size rule.
- The wire frame is self-delimiting too: `DKTB1` magic, `u32` op, `u32` payload length, then
  length-prefixed fields.
- The field that grows is `structural_identity_key`, which **IS** the complete sorted candidate-ID
  sequence. Its length follows the concept's placement count, and nothing in either format bounds
  that. `teaching_case.hpp` states it is "stored WHOLE and is never trimmed, sampled, reordered or
  partially stored".

The only ceiling anywhere is **4,294,967,295** (`2^32 - 1`), which exists solely because the length
prefix is 32 bits. That is a representational limit of the encoding, not a statement about records,
and setting the variable to it would disable the allocation guard the variable exists to provide.

**Therefore the variable conflicts with the architecture**, and the conflict is visible in its
doing two incompatible jobs:

| Line | Job | Wants to be |
|---|---|---|
| 396 `payload_len > g_max_record_bytes` | bounds a hostile declared length **before the allocation it causes** - legitimate, same class as `MAX_SMALL_FIELD_BYTES` | as SMALL as possible |
| 422 `read_field(cur, structural_identity_key, g_max_record_bytes)` | bounds the **canonical identity**, so an owner-chosen number decides which lawful candidates can exist | absent |

One variable cannot be both, which is why no non-arbitrary value exists.

**The measured 711,508 and 735,046-byte records bound nothing.** They are two observations of two
concepts. Padding either into an operational limit would invent exactly the arbitrary ceiling this
question was asked to avoid, and would still refuse the first concept that happened to be larger.

**The correction belongs to the Deep Kore repository and was not made here.** Stated for whoever
makes it: keep a framing bound on `payload_len` as a broker constant; stop applying it to
`structural_identity_key`; remove the environment variable.

---

## 6. BUILD PROVENANCE

Asked: confirm the gateway and worker Release binaries were built from the same Deep Kore commit
and protocol contract.

**Protocol: confirmed.** Both speak `DKW1` - the worker emits it (`PROTO_VERSION`), the gateway
requires it (`WorkerClient.Proto`).

**Commit: cannot be confirmed as such, and this is stated rather than glossed.** The Deep Kore
working tree is dirty - `Program.cs`, `SessionStore.cs`, `WorkerClient.cs` and
`dk_teaching_broker/main.cpp` are modified relative to HEAD - so the binaries were built from
HEAD-plus-uncommitted-changes, not from a commit. What IS verifiable:

| Binary | Built | Every one of its own wire sources |
|---|---|---|
| `deep_kore_gateway.exe` | 2026-09-03 19:43:48 | older than the binary |
| `dk_session_worker.exe` (`build_Release`) | 2026-09-03 19:10:36 | older than the binary |
| `dk_teaching_broker.exe` | 2026-09-03 21:45:00 | older than the binary |

So each binary is current with respect to its own sources, and all three came from the same tree
state within about two and a half hours. The stale worker in `Source/build/Release` (2026-09-02)
predates the 09-03 gateway changes, which is exactly why it failed `worker_bad_header`.

---

## 7. LIVE PROOF - DEFERRED, AND WHY

Partway through this pass the owner advised that **the Deep Kore repository is now being worked on
by a separate session that owns `public_chat` and the final public AIya contract**, that any
contract observed before its integrated green commit is PROVISIONAL, and that the website adapter
must be reconciled against the final committed contract before live verification.

Deep Kore HEAD moved during this pass, `88f01cd` -> `b75aaef`, but that commit is Experience Field
work; the `public_chat` files are still uncommitted. **The integrated contract has not landed.**

So this pass reports **no live proof**, and does not restate the previous pass's as covering the
new surface. Everything above is hermetic, and the live claim is owed after reconciliation.

The reconciliation is deliberately cheap: every canonical value the site depends on is transcribed
in ONE module with a PROVISIONAL banner naming its source headers. Re-read those headers against
that module, correct it, re-run, and only then run the live lane.

---

## 8. WHAT REMAINS THE OWNER'S

- `DEEP_KORE_CHAT_PHASE` - **still `disabled`**;
- the origin hostname, Tunnel, Access token, Turnstile keys, supervision;
- `DEEP_KORE_MAX_SESSIONS`;
- `DEEP_KORE_TEACHING_MAX_RECORD_BYTES` - **and the recommendation is that it cease to exist**,
  section 5;
- whether AIon is publicly exposed;
- owner and counsel approval of the `/terms` live-chat wording, printed in full in the final
  report of this pass.
