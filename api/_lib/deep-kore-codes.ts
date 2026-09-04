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
