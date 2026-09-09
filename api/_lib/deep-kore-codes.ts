/**
 * The CLOSED set of error codes the Deep Kore chat routes can send a browser.
 *
 * WHY THIS IS ITS OWN MODULE
 * Both sides of the boundary need it: the server to construct refusals, and the page to
 * decide whether a code may be rendered at all. It therefore has to be importable by
 * browser code, which means it must have **no imports of its own** - `deep-kore-core.ts`
 * pulls in `node:crypto`, and importing that from the client bundle fails the build.
 * Keeping the codes here is what lets one definition serve both without the page dragging
 * a server module into the browser.
 *
 * There is deliberately no logic in this file beyond a membership test. Nothing here reads
 * configuration, touches a request, or knows what a session is.
 *
 * The list is CLOSED, and that is load-bearing twice over:
 *
 * 1. **The presentation layer is exhaustive.** `ERROR_COPY` in `src/data/deep-kore.ts` is
 *    typed `Record<DeepKoreErrorCode, string>`, so adding a code here without an approved
 *    sentence for it fails the TypeScript build rather than shipping a visitor a blank box
 *    or a raw identifier.
 * 2. **Nothing upstream can write into it.** The origin's own codes are diagnostics, not
 *    public vocabulary, and one family of them is open-ended by construction. Every code a
 *    browser receives is one of these, chosen here.
 */

/**
 * Every configured slot is owned. Distinct from unavailability on purpose: a full service
 * described as an outage sends an operator hunting a fault that does not exist.
 */
export const CODE_SESSION_CAPACITY = 'DEEP_KORE_SESSION_CAPACITY';

/** The service is unreachable, or would not start a worker. */
export const CODE_UNAVAILABLE = 'DEEP_KORE_UNAVAILABLE';

/**
 * The origin refused to run cognition because its own components do not agree about which
 * build they are.
 *
 * The certified gateway spawns a worker, reads the commit that worker reports in its READY
 * frame, and compares it against the commit compiled into the gateway itself. A mismatch is
 * answered `503 provenance_mismatch`, the worker is disposed, and the reserved slot is
 * released - the gateway refuses to serve rather than operate a session across two builds
 * whose governance or protocol may differ.
 *
 * IT GETS ITS OWN CODE FOR THE REASON CAPACITY DOES. Collapsing it into `origin_error`
 * would tell the owner a request failed when what actually happened is that the deployment
 * is mismatched - a fault that no retry, no waiting and no visitor action can clear, and one
 * an operator has to be told about in its own words to fix. It is `503` rather than `502`
 * because the certified origin answered `503`: the service is refusing, not malfunctioning.
 *
 * It still discloses nothing about the host. A visitor learns the service will not serve
 * right now; which binaries disagree, and about what, stays at the origin.
 */
export const CODE_PROVENANCE_MISMATCH = 'DEEP_KORE_PROVENANCE_MISMATCH';

/**
 * Two members are `SCREAMING_CASE` because the owner named them literally; the rest keep
 * the local convention. Matching the specification exactly matters more than uniformity.
 */
export const ERROR_CODES = [
  // Configuration and phase
  'chat_disabled',
  'not_configured',
  // Request boundary
  'method_not_allowed',
  'unsupported_media_type',
  'bad_request',
  'unsupported_persona',
  'csrf_failed',
  'verification_failed',
  // Session
  'no_session',
  'session_expired',
  'session_busy',
  // Message
  'empty_text',
  'message_too_large',
  // Result
  'bad_job_id',
  'no_such_job',
  'turn_failed',
  'malformed_engine_result',
  // Teaching-candidate consent. Three distinct facts, never merged: the owner's
  // broker is not running, it ran and refused, or the reference names a candidate
  // this session is not holding. Each tells the visitor a different true thing
  // about whether their submission can be retried and by whom.
  'teaching_broker_unavailable',
  'teaching_submission_refused',
  'teaching_candidate_unknown',
  // The origin
  'origin_error',
  CODE_SESSION_CAPACITY,
  CODE_UNAVAILABLE,
  CODE_PROVENANCE_MISMATCH,
] as const;

export type DeepKoreErrorCode = (typeof ERROR_CODES)[number];

const ERROR_CODE_SET: ReadonlySet<string> = new Set<string>(ERROR_CODES);

/**
 * Whether a value is one of this site's own codes.
 *
 * Used by the page before it renders anything. A lookup alone would miss on an unknown
 * code and fall back anyway, but a membership test states the rule rather than depending
 * on a miss - and it is what stops a future loosening of `ERROR_COPY` from quietly turning
 * an unrecognised upstream string into rendered text.
 */
export function isErrorCode(value: unknown): value is DeepKoreErrorCode {
  return typeof value === 'string' && ERROR_CODE_SET.has(value);
}

// ---------------------------------------------------------------------------
// The closed set of PUBLIC RESULT KINDS
// ---------------------------------------------------------------------------

/**
 * The discriminants of the typed result union a browser may receive.
 *
 * This lives beside the error codes for the same reason they do: both sides of the
 * boundary need it, and this module is the only one the browser can import without
 * dragging `node:crypto` into the client bundle.
 *
 * It is CLOSED, and the closure is enforced in BOTH directions at compile time:
 *
 * 1. `api/_lib/deep-kore-core.ts` declares `PublicResultKindsAreExhaustive`, which
 *    fails to compile if `PublicResult` gains a member that is not listed here, or
 *    if a kind listed here has no member.
 * 2. `src/components/deep-kore/ChatConsole.tsx` switches over this union and ends in
 *    `assertNever`, so a kind added here with no rendering path fails the build
 *    rather than falling silently into a generic branch.
 *
 * That pairing is the point. A new engine outcome cannot reach a visitor as an
 * unlabelled answer: it either gets a deliberate public state or it does not compile.
 */
export const RESULT_KINDS = [
  'GOVERNED_TEXT',
  'TAV_REQUEST',
  'UNKNOWN_CONCEPT_OFFER',
  'GOVERNED_REFUSAL',
  'TERMINAL_FAILURE',
] as const;

export type PublicResultKind = (typeof RESULT_KINDS)[number];

const RESULT_KIND_SET: ReadonlySet<string> = new Set<string>(RESULT_KINDS);

/**
 * Whether a value is one of this site's own result kinds.
 *
 * Used by the page before it switches on anything. An unrecognised discriminant is not
 * a new state to improvise around - it is a value this site does not know, and the page
 * treats it as a fault rather than guessing which of the five it resembles.
 */
export function isResultKind(value: unknown): value is PublicResultKind {
  return typeof value === 'string' && RESULT_KIND_SET.has(value);
}

/**
 * A type-level proof that two unions are the SAME SET, not merely overlapping.
 *
 * On a match it resolves to `true`. On a mismatch it resolves to an OBJECT type naming
 * the offending members, which is deliberate: `MustBeTrue` then fails its constraint and
 * the compiler reports the missing kinds by name. A `never` would not work here, because
 * `never` satisfies every constraint and the check would pass silently - which is exactly
 * the failure mode a guard like this exists to avoid.
 *
 * Type-only. Nothing is emitted and there is no runtime check that could be skipped.
 */
export type Exhaustive<A, B> = [Exclude<A, B>] extends [never]
  ? [Exclude<B, A>] extends [never]
    ? true
    : { KIND_HAS_NO_MEMBER: Exclude<B, A> }
  : { MEMBER_HAS_NO_DECLARED_KIND: Exclude<A, B> };

/** Fails to compile unless its argument is exactly `true`. */
export type MustBeTrue<T extends true> = T;

// ---------------------------------------------------------------------------
// THE CANONICAL DEVICE VOCABULARY
// ---------------------------------------------------------------------------

/**
 * RECONCILED AGAINST THE CERTIFIED RELEASE. No longer provisional.
 *
 * Every list below is transcribed from the Deep Kore protocol headers. Nothing here is
 * inferred, extended or convenient: if an enumerator is not in the canonical header, it is
 * not here, and this site cannot offer a visitor a value the engine does not define.
 *
 * These lists carried a PROVISIONAL banner while the public-chat contract was still being
 * worked on in that repository. They were read back member by member against the certified
 * release `026ee61` on 2026-09-07, and again against the CORRECTED release
 * `d3a4f5af4d433838d473ff74cd370721c477fbdf` on 2026-09-09, whose gateway, worker and broker
 * binaries all verify to the hashes in that release's manifest and all report that same commit
 * at runtime. Every list matched exactly both times - no member added, none removed, none
 * renamed - so the banner is removed on evidence rather than on age.
 *
 * The corrected release changed exactly one thing on this boundary, and it is not in this
 * module: the governed core gained `anchors_established_this_turn`. `TavDecision` in particular
 * is unchanged, and `REVOKED` still does not appear in the header at all.
 *
 * Sources, re-read at `d3a4f5af`:
 *   RelationshipRole, EntityKind, Agreement   core/protocol/hs_dk_context_v1.hpp
 *   TavField, TavDecision, TavPurpose         core/protocol/hs_dk_context_cordel_v6.hpp
 *   MAX_DEVICE_BYTES                          applications/dk_session_worker/main.cpp
 *
 * THIS REMAINS THE ONE PLACE TO RECONCILE. Server validation and the browser's own controls
 * both read these lists, so a contract change is one file to re-read and one file to edit -
 * not a hunt through a component tree. Re-read the canonical headers against this module
 * before any live claim on a newer release, and correct it here.
 *
 * A WARNING FOR WHOEVER RECONCILES NEXT. Reconcile against the HEADERS, never against the
 * release's own prose. `Documentation/PUBLIC_CHAT_PROTOCOL_CONTRACT.md` at this release
 * describes `TavDecision` as `GRANTED | DENIED | REVOKED`. That is wrong in three values
 * out of three: the certified enum is the four below, and `REVOKED` does not exist in it
 * anywhere in the release. Editing this file to match that document would have replaced a
 * correct vocabulary with an invented one.
 */

/**
 * The relationship a visitor may declare between themselves and an entity.
 *
 * This is the evidence that makes a TAV request lawful at all: it is what lets
 * elimination resolve a referenced entity to exactly one structural kind. It is
 * therefore the one field the visitor MUST choose deliberately - and the reason this
 * site cannot produce a TAV request on its own, because it has no way to know it.
 */
export const RELATIONSHIP_ROLES = ['SELF', 'PARTNER', 'MATCH', 'FRIEND', 'FAMILY', 'OTHER'] as const;
export type RelationshipRole = (typeof RELATIONSHIP_ROLES)[number];

/**
 * The device-side entity kind.
 *
 * `UNKNOWN` is canonical and is the honest default for this surface, but it is still
 * only ever sent when the visitor selects it: the header defines it as what a device
 * transmits "for an entity_id it has deliberately left unresolved pending further
 * evidence or a governed TAV disclosure". Deep Kore never assigns it.
 *
 * NOTE THIS IS *NOT* `StructuralEntityKind` (PERSON / PLACE / BUSINESS / ORGANIZATION /
 * EVENT / MEDICATION). That one is what Deep Kore RESOLVES TO by elimination, and a
 * device that sent it would be asserting the conclusion instead of the evidence.
 */
export const DEVICE_ENTITY_KINDS = [
  'SELF',
  'PERSON',
  'PLACE',
  'AI_ASSISTANT',
  'GROUP',
  'UNKNOWN',
  'OTHER',
] as const;
export type DeviceEntityKind = (typeof DEVICE_ENTITY_KINDS)[number];

/** Grammatical agreement for an entity. Sent only when the visitor selects one. */
export const AGREEMENTS = ['FIRST_SINGULAR', 'SECOND', 'THIRD_SINGULAR', 'PLURAL'] as const;
export type AgreementValue = (typeof AGREEMENTS)[number];

/** The closed TavField vocabulary a visitor may be asked about. */
export const TAV_FIELDS = [
  'DISPLAY_NAME',
  'ADDRESS',
  'PHONE_NUMBER',
  'EMAIL',
  'RELATIONSHIP_LABEL',
  'EVENT_DESCRIPTION_DETAIL',
  'OTHER',
] as const;
export type TavFieldValue = (typeof TAV_FIELDS)[number];

/**
 * The canonical TAV decision vocabulary, and the rule that governs `value`.
 *
 * `value` is meaningful ONLY when the decision is `GRANTED`. The canonical strict parser
 * REJECTS a request whose non-GRANTED decision carries a non-empty value - "illegal state
 * unrepresentable, not merely should be empty by convention" - and this site enforces the
 * same rule at its own boundary rather than relying on the one upstream.
 */
export const TAV_DECISIONS = ['GRANTED', 'DENIED_BY_POLICY', 'DENIED_BY_USER', 'UNAVAILABLE'] as const;
export type TavDecisionValue = (typeof TAV_DECISIONS)[number];

/** The only lawful TAV purpose. `TavPurpose` has exactly one enumerator. */
export const TAV_PURPOSE = 'RESPONSE_REQUIRES_LITERAL_VALUE';

/**
 * The device envelope's size ceiling, in bytes.
 *
 * NOT A NUMBER THIS SITE CHOSE. It is `MAX_DEVICE_BYTES` in `dk_session_worker`, restated
 * here so an oversized envelope is refused at this boundary instead of being proxied to an
 * origin that will reject it anyway - the same arrangement `MAX_MESSAGE_BYTES` already has
 * with the gateway's own constant. It is also what bounds a granted private value, without
 * this site having to invent a limit of its own. If that constant changes, change this.
 */
export const MAX_DEVICE_BYTES = 262144;

function memberOf<T extends string>(list: readonly T[]) {
  const set: ReadonlySet<string> = new Set<string>(list);
  return (value: unknown): value is T => typeof value === 'string' && set.has(value);
}

export const isRelationshipRole = memberOf(RELATIONSHIP_ROLES);
export const isDeviceEntityKind = memberOf(DEVICE_ENTITY_KINDS);
export const isAgreement = memberOf(AGREEMENTS);
export const isTavField = memberOf(TAV_FIELDS);
export const isTavDecision = memberOf(TAV_DECISIONS);
