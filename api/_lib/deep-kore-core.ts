/**
 * Deep Kore public chat gateway - ALL logic. The four route adapters under
 * api/deep-kore/ only translate between Node's req/res and this module, exactly as
 * api/contact.ts does over contact-core.ts.
 *
 * WHAT THIS MODULE IS FOR
 * The browser must never reach the Deep Kore origin. It talks to this site's own
 * same-origin endpoints; this module is the only thing that knows the origin URL or
 * holds a credential for it. Nothing here decides anything about governance: GK-1,
 * GK-2, GOV_STAMP and Revelation Vanguard are the engine's, and their results are
 * passed through unchanged.
 *
 * FAIL CLOSED, ALWAYS
 * Missing configuration, an unrecognised phase, a failed Turnstile verification and
 * an unreachable origin all end the request. There is no mock, no cached answer, no
 * scripted FAQ and no second engine to fall back to. A transport failure is
 * reported as a transport failure and is never rendered as something Deep Kore said.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  CODE_SESSION_CAPACITY as CAPACITY,
  CODE_UNAVAILABLE as UNAVAILABLE,
  CODE_PROVENANCE_MISMATCH as PROVENANCE_MISMATCH,
  type DeepKoreErrorCode,
  type Exhaustive,
  type MustBeTrue,
  type PublicResultKind,
  MAX_DEVICE_BYTES,
  TAV_PURPOSE,
  isAgreement,
  isDeviceEntityKind,
  isRelationshipRole,
  isTavDecision,
  isTavField,
} from './deep-kore-codes.js';

// ---------------------------------------------------------------------------
// Phase
// ---------------------------------------------------------------------------

export type ChatPhase = 'disabled' | 'private_alpha' | 'public';

/**
 * Maps DEEP_KORE_CHAT_PHASE to a phase, mapping anything unset or misspelled to
 * `disabled`.
 *
 * This mirrors readPhase() in commerce-core.ts for the same reason: a typo in an
 * environment variable must never fail OPEN into a live public surface. `public` is
 * the most permissive state and is therefore the one a mistake must never produce.
 */
export function readPhase(raw: string | undefined): ChatPhase {
  switch ((raw ?? '').trim().toLowerCase()) {
    case 'public':
      return 'public';
    case 'private_alpha':
      return 'private_alpha';
    default:
      return 'disabled';
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// `| undefined` is explicit on every optional member because this project sets
// exactOptionalPropertyTypes: true, under which `originUrl?: string` means "absent
// or a string" and NOT "may be undefined". These values come from process.env and
// are genuinely undefined when unset, which is the whole point of missingConfig().
export interface DeepKoreConfig {
  phase: ChatPhase;
  originUrl?: string | undefined;
  accessClientId?: string | undefined;
  accessClientSecret?: string | undefined;
  gatewayToken?: string | undefined;
  sessionSecret?: string | undefined;
  turnstileSecret?: string | undefined;
  canonVersion?: string | undefined;
}

/**
 * Reads configuration at REQUEST time, not module load, so a newly-set variable
 * takes effect without depending on a cold start and a missing one is reported
 * rather than captured as `undefined`.
 */
export function readConfig(env: NodeJS.ProcessEnv = process.env): DeepKoreConfig {
  return {
    phase: readPhase(env.DEEP_KORE_CHAT_PHASE),
    originUrl: env.DEEP_KORE_ORIGIN_URL,
    accessClientId: env.DEEP_KORE_ACCESS_CLIENT_ID,
    accessClientSecret: env.DEEP_KORE_ACCESS_CLIENT_SECRET,
    gatewayToken: env.DEEP_KORE_GATEWAY_TOKEN,
    sessionSecret: env.DEEP_KORE_SESSION_SECRET,
    turnstileSecret: env.TURNSTILE_SECRET_KEY,
    canonVersion: env.DEEP_KORE_PUBLIC_CANON_VERSION,
  };
}

/**
 * Returns the list of configuration NAMES that are required for the given phase and
 * are absent. Names only - a value is never returned, logged or echoed.
 */
export function missingConfig(cfg: DeepKoreConfig): string[] {
  if (cfg.phase === 'disabled') return [];
  const missing: string[] = [];
  if (!cfg.originUrl) missing.push('DEEP_KORE_ORIGIN_URL');
  if (!cfg.accessClientId) missing.push('DEEP_KORE_ACCESS_CLIENT_ID');
  if (!cfg.accessClientSecret) missing.push('DEEP_KORE_ACCESS_CLIENT_SECRET');
  if (!cfg.gatewayToken) missing.push('DEEP_KORE_GATEWAY_TOKEN');
  if (!cfg.sessionSecret) missing.push('DEEP_KORE_SESSION_SECRET');
  // Turnstile is required ONLY for anonymous public access. private_alpha reaches
  // the origin through the owner's existing access mechanism instead.
  if (cfg.phase === 'public' && !cfg.turnstileSecret) missing.push('TURNSTILE_SECRET_KEY');
  return missing;
}

/**
 * The minimum length of `DEEP_KORE_SESSION_SECRET`, in characters.
 *
 * A FLOOR, not a strength claim. The owner generates 32 random bytes, which reaches
 * this comfortably in any encoding (44 characters in base64, 64 in hex). What the
 * floor actually catches is a human-typed value - the failure mode where a secret
 * exists, the service starts, and the session cookie is signed with something
 * guessable. Mirrors the identical floor on `DEEP_KORE_GATEWAY_TOKEN` in the gateway.
 */
export const MIN_SESSION_SECRET_LENGTH = 32;

/**
 * Returns the NAMES of configured-but-unusable variables. Present, so `missingConfig`
 * would pass them, and wrong in a way that must still fail closed.
 *
 * Two rules, both of which have a real failure behind them:
 *
 * 1. **Length.** A short signing secret is not a secret. See above.
 * 2. **Distinctness.** `DEEP_KORE_SESSION_SECRET` must not be a copy of any other
 *    credential. Reusing the gateway bearer or the Access client secret to sign
 *    cookies means one leak compromises two boundaries at once, and it is the exact
 *    mistake a hurried copy-paste between Vercel environment fields produces.
 *    Refusing to start is the only way that gets noticed.
 */
export function invalidConfig(cfg: DeepKoreConfig): string[] {
  if (cfg.phase === 'disabled') return [];
  const bad: string[] = [];
  const secret = cfg.sessionSecret;
  if (!secret) return bad;   // absence is missingConfig's business, not this one's

  if (secret.length < MIN_SESSION_SECRET_LENGTH) {
    bad.push('DEEP_KORE_SESSION_SECRET (too short)');
  }
  const others: Array<[string, string | undefined]> = [
    ['DEEP_KORE_GATEWAY_TOKEN', cfg.gatewayToken],
    ['DEEP_KORE_ACCESS_CLIENT_SECRET', cfg.accessClientSecret],
    ['DEEP_KORE_ACCESS_CLIENT_ID', cfg.accessClientId],
    ['TURNSTILE_SECRET_KEY', cfg.turnstileSecret],
  ];
  for (const [name, value] of others) {
    if (value && value === secret) {
      bad.push(`DEEP_KORE_SESSION_SECRET (identical to ${name})`);
    }
  }
  return bad;
}

// ---------------------------------------------------------------------------
// Session binding
// ---------------------------------------------------------------------------

/**
 * Vercel Functions are stateless between invocations, so the browser must carry the
 * upstream session reference. It is carried in an HttpOnly cookie and authenticated
 * with HMAC-SHA256 under a server-only secret, so a visitor can present only a
 * session this server actually issued - they cannot mint one, and they cannot
 * substitute another visitor's id without forging a MAC.
 */
export function signSession(sessionId: string, secret: string): string {
  const mac = createHmac('sha256', secret).update(sessionId).digest('base64url');
  return `${sessionId}.${mac}`;
}

export function verifySession(token: string | undefined, secret: string): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;

  const id = token.slice(0, dot);
  const presented = token.slice(dot + 1);
  const expected = createHmac('sha256', secret).update(id).digest('base64url');

  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  // Length check first because timingSafeEqual throws on a length mismatch; the
  // length of a MAC is not a secret, its bytes are.
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? id : null;
}

/** Server-generated message id. The browser never supplies one. */
export function newMessageId(): string {
  return randomBytes(16).toString('hex');
}

/** CSRF token for the double-submit pair. */
export function newCsrfToken(): string {
  return randomBytes(24).toString('base64url');
}

export function csrfMatches(cookieValue: string | undefined, headerValue: string | undefined): boolean {
  if (!cookieValue || !headerValue) return false;
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(headerValue);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Turnstile
// ---------------------------------------------------------------------------

/**
 * Server-side Turnstile verification. A widget that merely LOOKS successful in the
 * browser is not accepted: only this siteverify result creates a session, and the
 * token is never stored.
 */
export async function verifyTurnstile(
  token: string | undefined,
  secret: string,
  remoteIp: string | undefined,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  if (!token) return false;
  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteIp) form.set('remoteip', remoteIp);

  try {
    const res = await withDeadline((signal) =>
      fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        signal,
      })
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    // Log the TYPE only. A thrown fetch error can carry the request, and this
    // request body contains the Turnstile secret.
    console.error('[deep-kore] turnstile verification failed:', (err as Error)?.name);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Origin transport
// ---------------------------------------------------------------------------

/**
 * Bounds a single outbound HTTP hop.
 *
 * This is a TRANSPORT deadline and nothing else. It never stops cognition: the
 * origin accepts a turn, answers immediately with a job id, and keeps running the
 * turn to intrinsic completion in its own process. Polling then reads that job. So
 * no deadline here - and no Vercel request duration - can become Deep Kore's
 * stopping condition. Without such a bound an origin that accepts a connection and
 * stalls would hold a compute slot until the platform ceiling.
 */
const HOP_TIMEOUT_MS = 10_000;

async function withDeadline<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HOP_TIMEOUT_MS);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export interface OriginResult {
  status: number;
  body: unknown;
}

/**
 * The ONLY place the private origin is addressed. Both credentials are attached
 * here: the Cloudflare Access service token, which gets the request past Access at
 * the tunnel hostname, and the application bearer, which the gateway itself
 * verifies. Neither ever reaches the browser.
 */
export async function callOrigin(
  cfg: DeepKoreConfig,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body: unknown,
  extraHeaders: Record<string, string> = {},
  fetchImpl: typeof fetch = fetch
): Promise<OriginResult> {
  const base = (cfg.originUrl ?? '').replace(/\/$/, '');
  const headers: Record<string, string> = {
    Authorization: `Bearer ${cfg.gatewayToken}`,
    'CF-Access-Client-Id': cfg.accessClientId ?? '',
    'CF-Access-Client-Secret': cfg.accessClientSecret ?? '',
    ...extraHeaders,
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  // `body` is spread in only when there is one. Passing `body: undefined`
  // explicitly is a type error under exactOptionalPropertyTypes, and a GET/DELETE
  // must carry no body at all rather than an empty one.
  const init: RequestInit = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);

  const res = await withDeadline((signal) =>
    fetchImpl(`${base}${path}`, { ...init, signal })
  );

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }
  return { status: res.status, body: parsed };
}

// ---------------------------------------------------------------------------
// Public response shaping
// ---------------------------------------------------------------------------

/**
 * The public envelope for a completed turn.
 *
 * Only these fields cross to the browser. The engine's typed diagnostics
 * (`act`, `safety`, `resolution`, `content_class`, `transform_count`,
 * `adult_consent_invariant_violated`) stay server-side: they are internal
 * governance state, and section 3 of the site canon forbids publishing governance
 * internals. `state_hash` is likewise withheld - it is a fingerprint of committed
 * learning state, not something a visitor needs.
 */
export interface PublicTurn {
  text: string;
  persona: string;
  governance: {
    passed: boolean;
    stamp: string;
  };
  /**
   * PUBLIC TESSERACT ANCHOR HANDLES established by this turn.
   *
   * Opaque, session-scoped, and deliberately nothing more. Each is
   * `SHA-256(concept_id || session_secret)` in lowercase hex, where the session secret
   * is 32 CSPRNG bytes generated when the session is created and destroyed when it ends.
   * The handle therefore cannot be reversed to the concept it confirms, cannot be
   * correlated across sessions, and becomes unverifiable the moment the session dies -
   * no API can reproduce or validate it once the secret is gone.
   *
   * WHAT AN ANCHOR IS: a confirmation that structural cognition reached ESTABLISHED for
   * some concept during this turn, in this session's private overlay.
   *
   * WHAT IT IS NOT, AND WHAT THE ENGINE DELIBERATELY DOES NOT SEND: the concept id, a
   * Tesseract coordinate, a placement, an edge, a candidate set, an elimination trace,
   * graph topology, private state, a machine path, or any process or host detail. There
   * is no field on the wire for any of those, so this site cannot leak one by accident
   * and must never derive, reconstruct or infer one.
   *
   * An empty array is the ordinary case and means exactly what it says: this turn
   * established nothing. It is never a failure and must never be rendered as one.
   */
  anchors: string[];
}

/**
 * The lowercase-hex SHA-256 shape an anchor handle always has.
 *
 * Validated rather than trusted. The handle is the one anchor field that crosses, so if
 * the origin ever sent something of a different shape this site refuses the whole result
 * instead of forwarding an unrecognised string to a visitor - the same rule that already
 * governs every other upstream value.
 */
const ANCHOR_HANDLE = /^[0-9a-f]{64}$/;

/**
 * THE CLOSED TYPED RESULT UNION the browser is allowed to receive.
 *
 * Five members, discriminated by `kind`, and the page switches on that discriminant.
 * It never infers which state to enter by reading the response text - there is no
 * parsing of prose anywhere on the client, and adding one would be a defect, not a
 * shortcut.
 *
 * The discriminant is the ENGINE's own typed outcome, carried verbatim through the
 * worker and the gateway. This function translates it into the site's own closed
 * vocabulary and refuses anything it does not recognise, so an unexpected upstream
 * value degrades to a terminal failure rather than becoming a new public state.
 *
 * WHAT IS DELIBERATELY ABSENT FROM EVERY MEMBER: the state hash, the raw GOV_STAMP,
 * the candidate list, the structural identity, the concept id, the elimination trace,
 * the engine's typed diagnostics, any worker or queue path, and any machine detail.
 */
export type PublicResult =
  | { kind: 'GOVERNED_TEXT'; turn: PublicTurn }
  | { kind: 'TAV_REQUEST'; turn: PublicTurn; tav: PublicTavRequest }
  | { kind: 'UNKNOWN_CONCEPT_OFFER'; turn: PublicTurn; offer: PublicTeachingOffer }
  | { kind: 'GOVERNED_REFUSAL'; turn: PublicTurn }
  | { kind: 'TERMINAL_FAILURE'; error_code: DeepKoreErrorCode };

/**
 * COMPILE-TIME PROOF that this union and the browser-shared kind list are the same set.
 *
 * `Exhaustive<A, B>` resolves only when each side extends the other, so this alias fails
 * to compile if a member is added here without being listed in `deep-kore-codes.ts`, or
 * if a kind is listed there with no member here. The client then switches over the same
 * list and ends in `assertNever`, which is what closes the loop: a new engine outcome
 * either gets a deliberate public state on both sides, or the build stops.
 *
 * Type-only. There is no runtime check to skip and nothing is emitted.
 */
export type PublicResultKindsAreExhaustive = MustBeTrue<
  Exhaustive<PublicResult['kind'], PublicResultKind>
>;

/**
 * A TAV request as the browser sees it: a TYPED PREDICATE and nothing else.
 *
 * `field` names WHAT KIND of fact Deep Kore needs (the closed TavField vocabulary).
 * `entity_ref` is the opaque device-side entity id the browser itself supplied. There
 * is no value here, no lookup key, and - load-bearing - NO EXECUTABLE CODE and no
 * expression for the page to evaluate. The browser decides locally from the typed
 * field alone, which is why a TAV request can never become a script-delivery channel.
 */
export interface PublicTavRequest {
  tav_id: string;
  entity_ref: string;
  field: string;
  purpose: string;
}

/**
 * An unknown-concept offer as the browser sees it.
 *
 * `reference` is the server-generated opaque token, and consent may name ONLY that.
 * `description` is derived from the typed classification, never from the candidate's
 * internals - so no concept id, no placement id, no coordinate and none of the 35,494
 * candidate identifiers can reach a browser through this path.
 */
export interface PublicTeachingOffer {
  reference: string;
  description: string;
}

// The closed TavField vocabulary and the single lawful purpose now come from the shared
// contract module, so the server, the browser's own controls and the projection below all
// read ONE transcription of the canonical headers rather than three that can drift.

function toPublicTav(raw: unknown): PublicTavRequest | null {
  const r = asRecord(raw);
  if (!r) return null;
  const tavId = r['tav_id'];
  const target = r['target_entity_id'];
  const field = r['field'];
  const purpose = r['purpose'];
  if (typeof tavId !== 'string' || tavId.length === 0) return null;
  if (typeof target !== 'string' || target.length === 0) return null;
  if (!isTavField(field)) return null;
  if (typeof purpose !== 'string' || purpose !== TAV_PURPOSE) return null;
  return { tav_id: tavId, entity_ref: target, field, purpose };
}

function toPublicOffer(raw: unknown): PublicTeachingOffer | null {
  const r = asRecord(raw);
  if (!r) return null;
  const reference = r['reference'];
  const description = r['description'];
  if (typeof reference !== 'string' || reference.length === 0) return null;
  if (typeof description !== 'string' || description.length === 0) return null;
  // The reference is an opaque server token. Anything that is not one is refused
  // rather than passed through.
  if (!/^[0-9a-f]{16,128}$/.test(reference)) return null;
  return { reference, description };
}

/**
 * Projects one succeeded job to the closed public union.
 *
 * The engine's outcome discriminant decides the member. An ABSENT discriminant means
 * an older worker and degrades to GOVERNED_TEXT, which is the safe reading: it shows
 * the governed answer and offers nothing. An UNRECOGNISED discriminant is a terminal
 * failure, because a public state this site does not know is not one it may invent.
 */
export function toPublicResult(originBody: Record<string, unknown> | null): PublicResult {
  const turn = toPublicTurn(originBody?.['engine']);
  if (!turn) return { kind: 'TERMINAL_FAILURE', error_code: 'malformed_engine_result' };

  const outcome = originBody?.['outcome'];

  if (outcome === undefined || outcome === 'ANSWER') {
    return { kind: 'GOVERNED_TEXT', turn };
  }
  if (outcome === 'REFUSAL') {
    return { kind: 'GOVERNED_REFUSAL', turn };
  }
  if (outcome === 'TAV_REQUIRED') {
    const tav = toPublicTav(originBody?.['tav_request']);
    // A TAV_REQUIRED outcome whose request will not project is a fault, never an
    // answer: showing the text alone would silently drop the question Deep Kore
    // needed answered.
    if (!tav) return { kind: 'TERMINAL_FAILURE', error_code: 'malformed_engine_result' };
    return { kind: 'TAV_REQUEST', turn, tav };
  }
  if (outcome === 'TEACHING_OFFER') {
    const offer = toPublicOffer(originBody?.['teaching_offer']);
    if (!offer) return { kind: 'TERMINAL_FAILURE', error_code: 'malformed_engine_result' };
    return { kind: 'UNKNOWN_CONCEPT_OFFER', turn, offer };
  }
  if (outcome === 'ENGINE_FAILURE') {
    return { kind: 'TERMINAL_FAILURE', error_code: 'turn_failed' };
  }
  return { kind: 'TERMINAL_FAILURE', error_code: 'malformed_engine_result' };
}

/**
 * The segments of the engine's GOV_STAMP that may be published.
 *
 * An ALLOWLIST, not a denylist, and for the same reason the sitemap is one: a segment
 * added to the stamp by a future engine change must be withheld by default rather than
 * published by default.
 *
 * This exists because withholding the `state_hash` FIELD was not enough. The stamp is a
 * pipe-delimited string and it carries `state_hash=` inside it, along with the policy
 * and capability vocabulary - all of which are governance internals that section 3 of
 * the site canon forbids publishing. Measured against the live engine on 2026-09-01, a
 * real stamp read:
 *
 *   GOV_STAMP|gk=pass|iters=0|state_hash=<hex>|policy=<...>|caps=<...>|dm_stamp=|persona=AIYA
 *
 * so a response that showed the stamp verbatim published the state fingerprint the
 * projection right below it was carefully removing.
 */
const PUBLIC_STAMP_SEGMENTS = new Set(['GOV_STAMP', 'gk', 'persona']);

/**
 * Projects the engine's governance stamp to its publishable segments.
 *
 * This is a REDACTION, never a rewrite: every segment that survives is the engine's own
 * bytes, in the engine's own order. Nothing is added, reordered or reworded, so what a
 * visitor sees is a true subset of what the engine emitted - and the page says it is a
 * record of the gate, not the internal stamp.
 */
export function publicStamp(raw: string): string {
  return raw
    .split('|')
    .filter((segment) => {
      const eq = segment.indexOf('=');
      return PUBLIC_STAMP_SEGMENTS.has(eq === -1 ? segment : segment.slice(0, eq));
    })
    .join('|');
}

interface EngineShape {
  text?: unknown;
  persona?: unknown;
  gk_passed?: unknown;
  gov_stamp?: unknown;
  warmed_text?: unknown;
  vanguard_enabled?: unknown;
  anchors_established_this_turn?: unknown;
}

/**
 * Projects the engine result to the public envelope.
 *
 * Vanguard: `warmed_text` is emitted ONLY when the engine actually populated it,
 * which happens only when Vanguard is enabled in the engine. When it is off the
 * field is empty and the raw governed `text` is used, which is the byte-identical
 * certified path. This site never enables, disables or imitates Vanguard - it
 * reports what the engine produced.
 */
export function toPublicTurn(engine: unknown): PublicTurn | null {
  if (!engine || typeof engine !== 'object') return null;
  const e = engine as EngineShape;

  if (typeof e.text !== 'string' || typeof e.gov_stamp !== 'string') return null;

  const warmed = typeof e.warmed_text === 'string' ? e.warmed_text : '';
  const vanguardOn = e.vanguard_enabled === true;
  const text = vanguardOn && warmed.length > 0 ? warmed : e.text;

  const anchors = toAnchorHandles(e.anchors_established_this_turn);
  if (anchors === null) return null;

  return {
    text,
    persona: typeof e.persona === 'string' ? e.persona : 'AIYA',
    governance: {
      passed: e.gk_passed === true,
      stamp: publicStamp(e.gov_stamp),
    },
    anchors,
  };
}

/**
 * Projects `anchors_established_this_turn` to the handles, or `null` if it is malformed.
 *
 * ABSENT IS NOT MALFORMED. The origin's stated compatibility contract is that the typed
 * members are additive and that an older worker which omits one degrades the caller to
 * its earlier behaviour rather than breaking it. An absent array therefore means "no
 * anchors", exactly as an empty one does.
 *
 * PRESENT-BUT-WRONG IS A FAULT, AND FAILS THE WHOLE TURN. Returning `null` here makes
 * `toPublicTurn` return `null`, which the result mapper already turns into
 * `malformed_engine_result`. That is deliberate and is the same standing rule the rest of
 * this boundary follows: a value this site does not recognise is never repaired, never
 * partially salvaged, and never passed through. Dropping the bad entries and rendering the
 * rest would quietly show a visitor an anchor list that is not the one the engine sent.
 */
function toAnchorHandles(raw: unknown): string[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) return null;

  const handles: string[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    // An allowlist, like every other body this boundary reads: an anchor object carries
    // `handle` and nothing else. An extra key means the origin's contract moved and this
    // site has not been reconciled to it, which is a reason to stop rather than guess.
    const keys = Object.keys(entry as Record<string, unknown>);
    if (keys.length !== 1 || keys[0] !== 'handle') return null;
    const handle = (entry as { handle: unknown }).handle;
    if (typeof handle !== 'string' || !ANCHOR_HANDLE.test(handle)) return null;
    handles.push(handle);
  }
  return handles;
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

/**
 * COOKIE NAMING, AND WHY THERE ARE TWO OF EACH.
 *
 * Production uses the `__Host-` prefix. A browser refuses to store a `__Host-` cookie
 * unless it is `Secure`, has `Path=/`, and carries NO `Domain` attribute - so the
 * prefix is not decoration, it is the browser enforcing host-only scope on our behalf.
 * A subdomain, or anything that manages to set a cookie for the registrable domain,
 * cannot shadow or overwrite it. For a cookie that authenticates a chat session, that
 * is worth having.
 *
 * The unprefixed names exist for one case: a page served over plain http, which in
 * practice means local development. `__Host-` requires `Secure`, and a `Secure` cookie
 * over http is unreliable across engines. Rather than ship a production cookie policy
 * that cannot be exercised locally - and therefore never gets tested - the secure and
 * insecure paths use different names and the reader accepts either, preferring the
 * prefixed one.
 */
export const SESSION_COOKIE = 'dk_session';
export const CSRF_COOKIE = 'dk_csrf';
export const SESSION_COOKIE_HOST = `__Host-${SESSION_COOKIE}`;
export const CSRF_COOKIE_HOST = `__Host-${CSRF_COOKIE}`;

/** The name this response will set, given whether the connection is secure. */
export function cookieName(base: string, secure: boolean): string {
  return secure ? `__Host-${base}` : base;
}

/**
 * Reads a cookie by base name, preferring the `__Host-` prefixed form.
 *
 * The preference matters: if both are somehow present, the one the browser guaranteed
 * to be host-only and Secure is the one to trust.
 */
export function readCookie(
  cookies: Record<string, string>,
  base: string
): string | undefined {
  return cookies[`__Host-${base}`] ?? cookies[base];
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

/**
 * The shared attributes. `Path=/` and the absence of `Domain` are what make these
 * host-only, and they are also two of the three conditions a browser requires before
 * it will store a `__Host-` cookie at all - so the naming and the attributes are one
 * decision, not two.
 *
 * There is deliberately NO `Max-Age` and no `Expires`. These are browser-session
 * cookies: they last as long as the browser session and are then forgotten. Choosing a
 * lifetime here would invent a second, absolute expiry that could contradict the
 * upstream terminal-idle policy - a visitor still chatting at minute 31 would lose
 * their session reference mid-conversation for no reason. The authoritative lifetime
 * lives at the origin, where the session actually is.
 */
function cookieAttributes(secure: boolean): string[] {
  const flags = ['Path=/', 'SameSite=Strict'];
  if (secure) flags.push('Secure');
  return flags;
}

/**
 * The session cookie is HttpOnly, so script cannot read it at all, and it carries only
 * an opaque server-generated id with an HMAC over it.
 *
 * The CSRF cookie is deliberately NOT HttpOnly - a double-submit token has to be
 * readable to be echoed back - but the page does not in fact read it: the token is
 * returned in the create-session response and held in memory for the session's life.
 * The cookie is what the SERVER compares that header against.
 */
export function sessionCookie(value: string, secure = true): string {
  const flags = ['HttpOnly', ...cookieAttributes(secure)];
  return `${cookieName(SESSION_COOKIE, secure)}=${encodeURIComponent(value)}; ${flags.join('; ')}`;
}

export function csrfCookie(value: string, secure = true): string {
  return `${cookieName(CSRF_COOKIE, secure)}=${encodeURIComponent(value)}; ${cookieAttributes(secure).join('; ')}`;
}

/**
 * Clears both cookies under BOTH names.
 *
 * A deletion must not depend on guessing which name the cookie was set under. A
 * visitor who was served over http and is now on https - a local tester, or a
 * deployment that gained TLS - would otherwise keep a stale cookie nothing ever
 * removes. `Max-Age=0` on a name that was never set is harmless.
 */
export function clearedCookies(secure = true): string[] {
  const expire = (name: string, httpOnly: boolean, withSecure: boolean) => {
    const flags = ['Path=/', 'SameSite=Strict', 'Max-Age=0'];
    if (httpOnly) flags.unshift('HttpOnly');
    if (withSecure) flags.push('Secure');
    return `${name}=; ${flags.join('; ')}`;
  };
  const out = [
    expire(cookieName(SESSION_COOKIE, secure), true, secure),
    expire(cookieName(CSRF_COOKIE, secure), false, secure),
  ];
  if (secure) {
    // Also clear any unprefixed pair left over from an http session.
    out.push(expire(SESSION_COOKIE, true, true), expire(CSRF_COOKIE, false, true));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Request handling
// ---------------------------------------------------------------------------

/**
 * Everything a handler needs, already extracted from Node's request by
 * deep-kore-http.ts. The handlers below never see an IncomingMessage, exactly as
 * contact-core.ts never does.
 */
export interface GatewayRequest {
  contentType: string;
  cookieHeader?: string | undefined;
  csrfHeader?: string | undefined;
  body: unknown;
  clientIp?: string | undefined;
  jobId?: string | undefined;
  /**
   * The `Origin` header, when the browser sent one, and the `Host` the request arrived
   * on. Compared against each other by `requireSameOrigin` - never against a configured
   * hostname, because this site's public host is owner configuration and a check that
   * needs a variable set is a check that fails open when it is not.
   */
  origin?: string | undefined;
  host?: string | undefined;
  /** false only when the request arrived over plain http, i.e. local development. */
  secure: boolean;
}

export interface GatewayResponse {
  status: number;
  body: Record<string, unknown>;
  cookies: string[];
}

/**
 * The message-size ceiling, in UTF-8 bytes.
 *
 * This is not an invented number and not a cognition limit: it is exactly
 * `GatewayConfig.MaxMessageBytes` in the Deep Kore gateway, restated here so the site
 * refuses an oversized message itself instead of proxying one the origin will reject
 * anyway. If that constant changes, change this one with it.
 */
export const MAX_MESSAGE_BYTES = 8192;

/**
 * The two owner-specified public codes.
 *
 * They are `SCREAMING_CASE` where every other code on this route is `snake_case`,
 * because the owner named these two literally. Matching the specification exactly
 * matters more than matching the local convention: these are the codes an operator will
 * grep for and a runbook will quote.
 *
 * Their approved public wording lives in `ERROR_COPY` in `src/data/deep-kore.ts` and is
 * rendered by the page. The SERVER still sends only a code, with no prose - see `fail()`
 * - because a refusal that carries a sentence is a refusal that can be mistaken for
 * something Deep Kore said. Keeping the words client-side preserves that structural
 * guarantee while delivering the exact approved text.
 */
// The closed code set lives in its own dependency-free module so the browser can share
// it without importing this one (which pulls in node:crypto). Re-exported here so every
// existing importer of the core keeps working.
export {
  CODE_SESSION_CAPACITY,
  CODE_UNAVAILABLE,
  ERROR_CODES,
  isErrorCode,
} from './deep-kore-codes.js';
export type { DeepKoreErrorCode } from './deep-kore-codes.js';

/**
 * Errors carry a stable machine code and nothing else - no message, no detail, no
 * configuration state. Two reasons. A transport failure must never be renderable as
 * prose a visitor could mistake for something Deep Kore said; and section 8 of the
 * site canon forbids any public endpoint that reports deployment configuration, so
 * "which variable is missing" is logged on the server and never returned.
 */
function fail(status: number, code: DeepKoreErrorCode): GatewayResponse {
  return { status, body: { error_code: code }, cookies: [] };
}

/**
 * A refusal that also clears the session cookies - the cases where the visitor's session
 * is provably gone and keeping its cookie would only produce more failures.
 *
 * It exists so those responses are built by a TYPED constructor like every other refusal,
 * rather than assembling `{ error_code: ... }` inline where nothing checks the code
 * against the closed union.
 */
function failClearing(
  status: number,
  code: DeepKoreErrorCode,
  secure: boolean
): GatewayResponse {
  return { status, body: { error_code: code }, cookies: clearedCookies(secure) };
}

/**
 * The phase and configuration gate that every route passes through first.
 *
 * Fails closed in both directions: an unset or misspelled phase is `disabled`, and a
 * phase that is on but incompletely configured is a 503 that does nothing rather than
 * a request that half-works.
 */
function preflight(cfg: DeepKoreConfig): GatewayResponse | null {
  if (cfg.phase === 'disabled') return fail(503, 'chat_disabled');

  const missing = missingConfig(cfg);
  if (missing.length > 0) {
    // Names, server-side only. They are not secrets, but they are deployment
    // configuration and do not belong in a public response body.
    console.error('[deep-kore] not configured; missing:', missing.join(', '));
    return fail(503, 'not_configured');
  }

  // Present but unusable is the same outcome as absent: the service does nothing.
  // A short or reused signing secret must never produce a working session cookie.
  const invalid = invalidConfig(cfg);
  if (invalid.length > 0) {
    console.error('[deep-kore] not configured; invalid:', invalid.join(', '));
    return fail(503, 'not_configured');
  }
  return null;
}

function requireJson(req: GatewayRequest): GatewayResponse | null {
  const type = req.contentType.toLowerCase().split(';')[0]?.trim();
  return type === 'application/json'
    ? null
    : fail(415, 'unsupported_media_type');
}

/**
 * THE ORIGIN CHECK, and why it compares the request against ITSELF.
 *
 * A cross-site request that manages to be sent at all still has to carry the browser's
 * own `Origin` header, which script cannot set. So a state-changing request whose
 * `Origin` names a different host than the one it arrived on is, by construction, not
 * from this site - and is refused before anything else is read.
 *
 * It is compared against the request's own `Host` rather than against a configured
 * hostname on purpose. This site is served on its production domain, on project
 * aliases and on localhost, and a check keyed to a variable somebody has to remember
 * to set is a check that silently fails open on the day they do not. Comparing the two
 * headers the platform itself populated needs no configuration and cannot drift.
 *
 * An ABSENT `Origin` is not treated as a failure. Browsers omit it on same-origin GETs
 * and some navigations, and the other three barriers - `SameSite=Strict`, the
 * `application/json` requirement, and the double-submit token - already stand. This
 * adds a fourth where the header exists; it does not replace them.
 */
function requireSameOrigin(req: GatewayRequest): GatewayResponse | null {
  const origin = req.origin;
  if (!origin) return null;
  // `null` is what a sandboxed or privacy-shielded context sends. It is not this site.
  if (origin === 'null') return fail(403, 'csrf_failed');

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return fail(403, 'csrf_failed');
  }
  return originHost.toLowerCase() === (req.host ?? '').toLowerCase()
    ? null
    : fail(403, 'csrf_failed');
}

/**
 * THE BODY SCHEMA IS AN ALLOWLIST, and an unknown key is a refusal rather than
 * something quietly dropped.
 *
 * Ignoring an unexpected field lets a caller believe it transmitted something it did
 * not, and it makes the absence of a field a habit rather than a guarantee - the same
 * argument that makes `sanitizeDevice` refuse a disclosure carrying a `value` instead
 * of stripping it. Refusing also means a future field cannot be added to the browser
 * without being added here, which is where anyone reviewing this boundary will look.
 */
function onlyKnownKeys(body: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(body).every((k) => allowed.includes(k));
}

/**
 * THE COMPLETE SET OF KEYS A BROWSER MAY SEND, route by route.
 *
 * Read these three lists as the public write surface of this feature. Everything a
 * visitor's browser is permitted to say to Deep Kore is here: an identity key, a human
 * check, a message, an idempotency key, an opaque device envelope, an opaque candidate
 * reference and a boolean. Nothing addresses a model, a prompt, a session, a job, an
 * origin, a price, a governance setting or a queue.
 */
const SESSION_BODY_KEYS = ['persona', 'turnstile_token'] as const;
const MESSAGE_BODY_KEYS = ['text', 'turn_key', 'device'] as const;
const CONSENT_BODY_KEYS = ['reference', 'consent'] as const;

/** The device envelope's own allowlists, applied at every level rather than only the top. */
const DEVICE_KEYS = ['entities', 'current_message', 'events', 'tav_disclosures'] as const;
const ENTITY_KEYS = ['entity_id', 'entity_kind', 'relationship_role', 'agreement'] as const;
const SEGMENT_KEYS = ['kind', 'entity_id'] as const;
const EVENT_KEYS = ['event_id', 'actor', 'destination'] as const;
// `value` is in this list ONLY because a GRANTED disclosure may lawfully carry one. The
// decision rule in sanitizeDevice is what actually governs whether it may be non-empty.
const DISCLOSURE_KEYS = ['tav_id', 'target_entity_id', 'field', 'decision', 'value'] as const;

/**
 * The CSRF check for state-changing methods, in addition to `SameSite=Strict` and the
 * `application/json` requirement. Three independent barriers, because the cost of one
 * of them being wrong is a hostile page driving a real visitor's chat session.
 */
function requireCsrf(req: GatewayRequest): GatewayResponse | null {
  const cookies = parseCookies(req.cookieHeader);
  return csrfMatches(readCookie(cookies, CSRF_COOKIE), req.csrfHeader)
    ? null
    : fail(403, 'csrf_failed');
}

/** The upstream session id, or null when the visitor holds no session this server issued. */
function resolveSession(req: GatewayRequest, cfg: DeepKoreConfig): string | null {
  const cookies = parseCookies(req.cookieHeader);
  return verifySession(readCookie(cookies, SESSION_COOKIE), cfg.sessionSecret ?? '');
}

/** Ids that ride in a URL path or a DKW1 header line must be plain tokens. */
function isPlainToken(s: string): boolean {
  return s.length > 0 && s.length <= 64 && /^[A-Za-z0-9_-]+$/.test(s);
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/**
 * Wraps the single origin hop so a transport fault is always reported AS a transport
 * fault. There is no retry, no second origin and no substitute answer: if the origin
 * cannot be reached, the visitor is told the request failed, never given prose from
 * somewhere else.
 */
async function tryOrigin(
  cfg: DeepKoreConfig,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body: unknown,
  extraHeaders: Record<string, string>,
  fetchImpl: typeof fetch
): Promise<OriginResult | null> {
  try {
    return await callOrigin(cfg, method, path, body, extraHeaders, fetchImpl);
  } catch (err) {
    // Type only. A thrown fetch error can carry the request, and this request
    // carries both the Access service token and the gateway bearer.
    console.error('[deep-kore] origin call failed:', (err as Error)?.name);
    return null;
  }
}

/** The upstream error code, when the origin sent one. */
function originCode(res: OriginResult): string {
  const body = asRecord(res.body);
  const code = body?.['error_code'];
  return typeof code === 'string' ? code : 'origin_error';
}

// ---------------------------------------------------------------------------
// POST /api/deep-kore/session
// ---------------------------------------------------------------------------

export async function handleCreateSession(
  req: GatewayRequest,
  cfg: DeepKoreConfig,
  fetchImpl: typeof fetch = fetch
): Promise<GatewayResponse> {
  const gate = preflight(cfg) ?? requireSameOrigin(req) ?? requireJson(req);
  if (gate) return gate;

  const body = asRecord(req.body);
  if (!body) return fail(400, 'bad_request');
  // Two keys, and only two. Never a model, a prompt, an origin, a session id or a
  // governance setting - and an unrecognised key is refused rather than ignored.
  if (!onlyKnownKeys(body, SESSION_BODY_KEYS)) return fail(400, 'bad_request');

  // The browser chooses an identity KEY and nothing else - never a model, a prompt, a
  // configuration value, a governance setting or an origin address. An unrecognised
  // key is refused here and refused again at the origin and at the worker.
  const rawPersona = body['persona'];
  const persona = rawPersona === undefined ? 'AIYA' : rawPersona;
  if (persona !== 'AIYA' && persona !== 'AION') return fail(400, 'unsupported_persona');

  // Anonymous public access is gated by a real server-side Turnstile verification.
  // A widget that merely looks solved in the browser creates nothing.
  if (cfg.phase === 'public') {
    const token = body['turnstile_token'];
    const ok = await verifyTurnstile(
      typeof token === 'string' ? token : undefined,
      cfg.turnstileSecret ?? '',
      req.clientIp,
      fetchImpl
    );
    if (!ok) return fail(403, 'verification_failed');
  }

  const res = await tryOrigin(cfg, 'POST', '/v1/sessions', { persona }, {}, fetchImpl);
  if (!res) return fail(503, UNAVAILABLE);

  if (res.status !== 201) {
    const code = originCode(res);

    // CAPACITY AND OUTAGE ARE DIFFERENT FACTS AND GET DIFFERENT CODES.
    //
    // "Every session is in use" and "the service is unreachable" both refuse a visitor,
    // but they are not the same thing and must never share a code. A full service told
    // to look like an outage sends the owner hunting a fault that does not exist, and
    // tells the visitor the wrong thing about whether to come back. Both are 503,
    // because both mean "not now"; only the code distinguishes them.
    if (res.status === 503 && code === 'session_capacity') {
      return fail(503, CAPACITY);
    }
    if (res.status === 503 && code === 'engine_unavailable') {
      return fail(503, UNAVAILABLE);
    }

    // PROVENANCE IS A THIRD FACT, AND IT IS NOT AN OUTAGE EITHER.
    //
    // The certified gateway compares the commit its worker reports in READY against the
    // commit compiled into the gateway, and answers `503 provenance_mismatch` when they
    // disagree - disposing the worker and releasing the slot rather than running a session
    // across two builds whose governance may differ.
    //
    // Folding that into `origin_error` would be the same mistake as folding capacity into
    // outage, one step further along: it reports a mismatched DEPLOYMENT as a failed
    // REQUEST. Nothing the visitor does clears it and nothing the service does clears it
    // either - an operator has to redeploy matched binaries - so it needs its own code to
    // say so. The status stays 503 because the origin refused rather than malfunctioned.
    if (res.status === 503 && code === 'provenance_mismatch') {
      return fail(503, PROVENANCE_MISMATCH);
    }
    return fail(502, 'origin_error');
  }

  const originBody = asRecord(res.body);
  const sessionId = originBody?.['session_id'];
  if (typeof sessionId !== 'string' || !isPlainToken(sessionId)) {
    return fail(502, 'origin_error');
  }

  const csrf = newCsrfToken();
  return {
    status: 201,
    body: {
      ok: true,
      persona,
      // Echoed so the page can show which public canon it is talking to. The value is
      // owner-set; the site never invents one.
      canon_version: cfg.canonVersion ?? null,
      // The same value the (deliberately readable) CSRF cookie carries, returned for
      // the island's convenience. Not a secret from the page - that is the point of a
      // double-submit token.
      csrf_token: csrf,
      max_message_bytes: MAX_MESSAGE_BYTES,
    },
    cookies: [
      sessionCookie(signSession(sessionId, cfg.sessionSecret ?? ''), req.secure),
      csrfCookie(csrf, req.secure),
    ],
  };
}

// ---------------------------------------------------------------------------
// DELETE /api/deep-kore/session
// ---------------------------------------------------------------------------

export async function handleDeleteSession(
  req: GatewayRequest,
  cfg: DeepKoreConfig,
  fetchImpl: typeof fetch = fetch
): Promise<GatewayResponse> {
  const gate = preflight(cfg) ?? requireSameOrigin(req) ?? requireCsrf(req);
  if (gate) return gate;

  const sessionId = resolveSession(req, cfg);
  if (!sessionId) {
    // Idempotent. Holding no session and asking to end one is success, so a retry
    // after a dropped response is not an error the visitor has to understand.
    return { status: 200, body: { deleted: true }, cookies: clearedCookies(req.secure) };
  }

  const res = await tryOrigin(cfg, 'DELETE', `/v1/sessions/${sessionId}`, undefined, {}, fetchImpl);
  if (!res) return fail(503, UNAVAILABLE);

  if (res.status === 409) {
    // A turn is still running. The origin refuses to abandon cognition midway, and
    // this route does not overrule it - the cookies stay so the visitor can read the
    // answer and then end the session.
    return fail(409, 'session_busy');
  }
  if (res.status !== 200) return fail(502, 'origin_error');

  return { status: 200, body: { deleted: true }, cookies: clearedCookies(req.secure) };
}

// ---------------------------------------------------------------------------
// POST /api/deep-kore/message
// ---------------------------------------------------------------------------

/**
 * The upstream message id.
 *
 * A retry after a dropped response must reach the SAME job rather than start a second
 * turn, so the browser may supply a `turn_key`. It is not the message id: the id is
 * HMAC(server secret, session + key), so a visitor can make a retry idempotent but
 * cannot choose, guess or collide with an upstream identifier - including another
 * session's, because the session id is inside the MAC.
 */
function messageIdFor(sessionId: string, turnKey: unknown, secret: string): string {
  if (typeof turnKey === 'string' && isPlainToken(turnKey)) {
    return createHmac('sha256', secret).update(`${sessionId}:${turnKey}`).digest('hex').slice(0, 32);
  }
  return newMessageId();
}

/**
 * THE DEVICE ENVELOPE, SANITISED AT THE BOUNDARY.
 *
 * The browser is the TAV device counterpart, so it may describe its own entity model
 * and answer a prior turn's TAV request. What it may NEVER do is transmit a private
 * value, and that is enforced HERE, on the server, rather than trusted to client
 * discipline: a `value` on any disclosure makes the whole request a 400.
 *
 * This is deliberately stricter than the canonical Cordel protocol, where a GRANTED
 * disclosure DOES carry the literal. On the public path a TAV grant is a PERMISSION,
 * not a disclosure - it permits creation of an unverified queue candidate and nothing
 * more - so there is no lawful reason for a literal to cross, and the shape that would
 * carry one is refused outright. A grant that arrives with an empty value supplies no
 * context item to the engine, which is the honest result.
 *
 * Everything that survives is opaque: entity ids, closed enum names, and event links
 * between entity ids.
 *
 * UNKNOWN KEYS ARE REFUSED AT EVERY LEVEL, not only the top. `description` and
 * `temporal` on a message are Segment sequences a Cordel device renders locally with
 * the real private value, so there is no lawful reason for a browser to send them here
 * - and refusing them is stronger than ignoring them, for the same reason a disclosure
 * carrying a `value` is refused rather than stripped: a caller must never be able to
 * believe it transmitted something this boundary silently discarded.
 */
function sanitizeDevice(raw: unknown): { ok: true; device: Record<string, unknown> | undefined } | { ok: false } {
  if (raw === undefined || raw === null) return { ok: true, device: undefined };
  const d = asRecord(raw);
  if (!d) return { ok: false };
  if (!onlyKnownKeys(d, DEVICE_KEYS)) return { ok: false };

  const out: Record<string, unknown> = {};

  const entities = d['entities'];
  if (entities !== undefined) {
    if (!Array.isArray(entities)) return { ok: false };
    const cleaned: Record<string, unknown>[] = [];
    for (const e of entities) {
      const r = asRecord(e);
      if (!r) return { ok: false };
      if (!onlyKnownKeys(r, ENTITY_KEYS)) return { ok: false };
      const id = r['entity_id'];
      if (typeof id !== 'string' || !isPlainToken(id)) return { ok: false };
      const ent: Record<string, unknown> = { entity_id: id };
      // CANONICAL ENUMERATORS, not a shape guard.
      //
      // This accepted anything matching /^[A-Z_]{1,40}$/ and left the vocabulary to the
      // worker. That was defensible while the browser sent nothing but a typed decision.
      // It is not defensible now that a VISITOR chooses these values in the interface: a
      // control able to offer a value the engine does not define is one that can be wrong
      // in a way only the origin notices, after the visitor chose it in good faith. The
      // lists come from the shared contract module, so the control and this check cannot
      // disagree with each other.
      const enums: ReadonlyArray<readonly [string, (v: unknown) => boolean]> = [
        ['entity_kind', isDeviceEntityKind],
        ['relationship_role', isRelationshipRole],
        ['agreement', isAgreement],
      ];
      for (const [k, isValid] of enums) {
        const v = r[k];
        if (v === undefined) continue;
        if (!isValid(v)) return { ok: false };
        ent[k] = v;
      }
      cleaned.push(ent);
    }
    out['entities'] = cleaned;
  }

  const cm = asRecord(d['current_message']);
  if (d['current_message'] !== undefined && !cm) return { ok: false };
  if (cm) {
    if (!onlyKnownKeys(cm, ['segments'])) return { ok: false };
    const segs = cm['segments'];
    if (segs !== undefined) {
      if (!Array.isArray(segs)) return { ok: false };
      const cleaned: Record<string, unknown>[] = [];
      for (const sg of segs) {
        const r = asRecord(sg);
        if (!r) return { ok: false };
        if (!onlyKnownKeys(r, SEGMENT_KEYS)) return { ok: false };
        // ONLY entity references cross. A TEXT segment would be free text from a
        // browser reaching the engine through a second channel, which the message
        // `text` field already covers lawfully.
        if (r['kind'] !== 'ENTITY') continue;
        const id = r['entity_id'];
        if (typeof id !== 'string' || !isPlainToken(id)) return { ok: false };
        cleaned.push({ kind: 'ENTITY', entity_id: id });
      }
      out['current_message'] = { segments: cleaned };
    }
  }

  const events = d['events'];
  if (events !== undefined) {
    if (!Array.isArray(events)) return { ok: false };
    const cleaned: Record<string, unknown>[] = [];
    for (const e of events) {
      const r = asRecord(e);
      if (!r) return { ok: false };
      if (!onlyKnownKeys(r, EVENT_KEYS)) return { ok: false };
      const id = r['event_id'];
      if (typeof id !== 'string' || !isPlainToken(id)) return { ok: false };
      const ev: Record<string, unknown> = { event_id: id };
      for (const k of ['actor', 'destination']) {
        const v = r[k];
        if (v === undefined) continue;
        if (typeof v !== 'string' || !isPlainToken(v)) return { ok: false };
        ev[k] = v;
      }
      cleaned.push(ev);
    }
    out['events'] = cleaned;
  }

  const disclosures = d['tav_disclosures'];
  if (disclosures !== undefined) {
    if (!Array.isArray(disclosures)) return { ok: false };
    const cleaned: Record<string, unknown>[] = [];
    for (const t of disclosures) {
      const r = asRecord(t);
      if (!r) return { ok: false };
      if (!onlyKnownKeys(r, DISCLOSURE_KEYS)) return { ok: false };
      const tavId = r['tav_id'];
      const target = r['target_entity_id'];
      const field = r['field'];
      const decision = r['decision'];
      if (typeof tavId !== 'string' || !isPlainToken(tavId)) return { ok: false };
      if (typeof target !== 'string' || !isPlainToken(target)) return { ok: false };
      if (!isTavField(field)) return { ok: false };
      if (!isTavDecision(decision)) return { ok: false };

      // ---------------------------------------------------------------------
      // THE PRIVATE VALUE, AND THE ONE CONDITION UNDER WHICH IT MAY CROSS.
      //
      // Authorised by the owner on 2026-09-04. It is written to MIRROR the canonical
      // strict parser rather than merely resemble it: `value` is meaningful ONLY when
      // the decision is GRANTED, and a non-GRANTED decision carrying a NON-EMPTY value
      // is rejected outright - "illegal state unrepresentable, not merely should be
      // empty by convention", in the protocol header's own words.
      //
      // This site enforces that at its OWN boundary rather than relying on the upstream
      // one. Two independent parsers refusing the same illegal shape is the point: a
      // literal leaving a browser under a refusal is the worst thing this feature could
      // do, and it should have to get past both to happen.
      //
      // WHAT IS DELIBERATELY ABSENT: a length of our own. The value is bounded by
      // MAX_DEVICE_BYTES - the worker's own constant, applied to the whole envelope
      // below - so nothing here invents a limit on how much a visitor may choose to
      // disclose about themselves.
      //
      // It is never logged, never echoed, never stored and never returned. It exists in
      // this process only for as long as it takes to forward one request.
      // ---------------------------------------------------------------------
      const value = r['value'];
      const disclosure: Record<string, unknown> = {
        tav_id: tavId,
        target_entity_id: target,
        field,
        decision,
      };
      if (value !== undefined) {
        if (typeof value !== 'string') return { ok: false };
        if (value.length > 0 && decision !== 'GRANTED') return { ok: false };
        // An empty value is lawful on any decision and discloses nothing, so it is
        // forwarded in the canonical shape rather than silently dropped.
        disclosure['value'] = value;
      }
      cleaned.push(disclosure);
    }
    out['tav_disclosures'] = cleaned;
  }

  if (Object.keys(out).length === 0) return { ok: true, device: undefined };

  // THE ENVELOPE CEILING, AND IT IS NOT THIS SITE'S NUMBER.
  //
  // `MAX_DEVICE_BYTES` is `dk_session_worker`'s own constant, restated in the shared
  // contract module and applied here so an oversized envelope is refused at this
  // boundary instead of being proxied to an origin that will reject it anyway - exactly
  // the arrangement `MAX_MESSAGE_BYTES` already has with the gateway's constant.
  //
  // It is also what bounds a granted private value, which is why this site needs no
  // limit of its own on one: a visitor may disclose as much as the canonical envelope
  // can carry, and not one byte of that is decided here.
  if (Buffer.byteLength(JSON.stringify(out), 'utf8') > MAX_DEVICE_BYTES) return { ok: false };

  return { ok: true, device: out };
}

export async function handleMessage(
  req: GatewayRequest,
  cfg: DeepKoreConfig,
  fetchImpl: typeof fetch = fetch
): Promise<GatewayResponse> {
  const gate = preflight(cfg) ?? requireSameOrigin(req) ?? requireJson(req) ?? requireCsrf(req);
  if (gate) return gate;

  const sessionId = resolveSession(req, cfg);
  if (!sessionId) return fail(401, 'no_session');

  const body = asRecord(req.body);
  if (!body) return fail(400, 'bad_request');
  if (!onlyKnownKeys(body, MESSAGE_BODY_KEYS)) return fail(400, 'bad_request');

  const text = body['text'];
  if (typeof text !== 'string' || text.trim().length === 0) return fail(400, 'empty_text');
  if (Buffer.byteLength(text, 'utf8') > MAX_MESSAGE_BYTES) return fail(413, 'message_too_large');

  const messageId = messageIdFor(sessionId, body['turn_key'], cfg.sessionSecret ?? '');

  const device = sanitizeDevice(body['device']);
  if (!device.ok) return fail(400, 'bad_request');

  const originPayload: Record<string, unknown> = { message_id: messageId, text };
  if (device.device) originPayload['device'] = device.device;

  const res = await tryOrigin(
    cfg,
    'POST',
    `/v1/sessions/${sessionId}/messages`,
    originPayload,
    {},
    fetchImpl
  );
  if (!res) return fail(503, UNAVAILABLE);

  if (res.status === 202) {
    const originBody = asRecord(res.body);
    const jobId = originBody?.['job_id'];
    if (typeof jobId !== 'string' || !isPlainToken(jobId)) return fail(502, 'origin_error');
    // 202, not 200. The turn has been ACCEPTED, not answered: cognition is already
    // running in the origin's own process and will run to intrinsic completion there.
    // Neither this request's lifetime nor Vercel's is a stopping condition for it.
    return {
      status: 202,
      body: { job_id: jobId, duplicate: originBody?.['duplicate'] === true },
      cookies: [],
    };
  }

  if (res.status === 404) {
    // The upstream session is gone (the origin host restarted). Say so and clear the
    // cookies so the page starts a new session rather than polling a dead one.
    return failClearing(404, 'session_expired', req.secure);
  }
  if (res.status === 409) return fail(409, 'session_busy');
  if (res.status === 413) return fail(413, 'message_too_large');
  return fail(502, 'origin_error');
}

// ---------------------------------------------------------------------------
// POST /api/deep-kore/consent
// ---------------------------------------------------------------------------

/**
 * One visitor decision about ONE held unknown-concept candidate.
 *
 * WHAT THE BROWSER MAY SEND: a boolean `consent` and the opaque `reference` this
 * session's own worker issued. That is the entire body. There is no field for
 * candidate content, candidate evidence, a concept id, a structural identity or a
 * queue location - so a browser cannot author, alter, extend or substitute a
 * candidate at consent time, and the worker independently refuses a reference it did
 * not issue.
 *
 * CONSENT AUTHORISES STORAGE ONLY. It establishes no truth, grants no authority, and
 * cannot promote a candidate to knowledge: the record is written UNVERIFIED_CANDIDATE
 * from source class PUBLIC_CHAT_UNTRUSTED in review state AWAITING_OWNER_REVIEW, and
 * the broker refuses any other value for those three.
 *
 * It carries the same three barriers every other mutating route here does - JSON only,
 * a CSRF double-submit, and a signed session cookie - because consent is exactly the
 * kind of act a cross-origin page would like to forge.
 */
export async function handleCandidateDecision(
  req: GatewayRequest,
  cfg: DeepKoreConfig,
  fetchImpl: typeof fetch = fetch
): Promise<GatewayResponse> {
  const gate = preflight(cfg) ?? requireSameOrigin(req) ?? requireJson(req) ?? requireCsrf(req);
  if (gate) return gate;

  const sessionId = resolveSession(req, cfg);
  if (!sessionId) return fail(401, 'no_session');

  const body = asRecord(req.body);
  if (!body) return fail(400, 'bad_request');
  // Two keys. There is deliberately no field for candidate content, evidence, a concept
  // id, a structural identity or a queue location, so a browser cannot author, alter or
  // substitute a candidate at consent time even by adding one.
  if (!onlyKnownKeys(body, CONSENT_BODY_KEYS)) return fail(400, 'bad_request');

  const reference = body['reference'];
  // The reference shape is checked here as well as upstream: an opaque server token
  // is a closed shape, and accepting anything else would widen what this route
  // forwards to the origin.
  if (typeof reference !== 'string' || !/^[0-9a-f]{16,128}$/.test(reference)) {
    return fail(400, 'bad_request');
  }

  // Consent is NEVER the default. It must be literally `true`; anything else -
  // absent, null, "true", 1 - is a decline. A mis-sent body can therefore only ever
  // fail safe.
  const consent = body['consent'] === true;

  const res = await tryOrigin(
    cfg,
    'POST',
    `/v1/sessions/${sessionId}/${consent ? 'consent' : 'decline'}`,
    { reference },
    {},
    fetchImpl
  );
  if (!res) return fail(503, UNAVAILABLE);

  if (res.status === 404) return failClearing(404, 'session_expired', req.secure);
  if (res.status === 409) return fail(409, 'teaching_candidate_unknown');
  if (res.status !== 200) return fail(502, 'origin_error');

  const originBody = asRecord(res.body);

  if (!consent) {
    // Declining discards the held candidate. Nothing was ever written, so there is
    // nothing to undo and nothing to report beyond that it is gone.
    return { status: 200, body: { discarded: originBody?.['discarded'] === true }, cookies: [] };
  }

  const submitted = originBody?.['submitted'] === true;
  if (!submitted) {
    // FAIL CLOSED AND TRUTHFULLY. The visitor consented and the submission did not
    // land. There is no retry, no queue and no local spool anywhere in this path, so
    // nothing is pending and saying otherwise would be false.
    return fail(503, 'teaching_broker_unavailable');
  }
  return { status: 200, body: { submitted: true }, cookies: [] };
}

// ---------------------------------------------------------------------------
// GET /api/deep-kore/result/[jobId]
// ---------------------------------------------------------------------------

/**
 * `queued`, `running`, `succeeded` and `failed` are TRANSPORT states, owned by the
 * gateway. Deep Kore has no nonterminal conversational state: `process_governed_turn`
 * is synchronous and total, so cognition is complete the moment it returns. These four
 * describe where a job is in the origin's queue, never what the engine is "thinking".
 */
const TRANSPORT_STATES = new Set(['queued', 'running', 'succeeded', 'failed']);

export async function handleResult(
  req: GatewayRequest,
  cfg: DeepKoreConfig,
  fetchImpl: typeof fetch = fetch
): Promise<GatewayResponse> {
  const gate = preflight(cfg);
  if (gate) return gate;

  const sessionId = resolveSession(req, cfg);
  if (!sessionId) return fail(401, 'no_session');

  const jobId = req.jobId;
  if (typeof jobId !== 'string' || !isPlainToken(jobId)) return fail(400, 'bad_job_id');

  // The origin binds the job to its session as well, so a stolen or guessed job id is
  // refused there too rather than only here.
  const res = await tryOrigin(
    cfg,
    'GET',
    `/v1/jobs/${jobId}`,
    undefined,
    { 'X-DK-Session': sessionId },
    fetchImpl
  );
  if (!res) return fail(503, UNAVAILABLE);

  if (res.status === 404) {
    const code = originCode(res);
    if (code === 'no_such_session') {
      return failClearing(404, 'session_expired', req.secure);
    }
    return fail(404, 'no_such_job');
  }
  if (res.status !== 200) return fail(502, 'origin_error');

  const originBody = asRecord(res.body);
  const state = originBody?.['transport_state'];
  if (typeof state !== 'string' || !TRANSPORT_STATES.has(state)) return fail(502, 'origin_error');

  if (state === 'queued' || state === 'running') {
    return { status: 200, body: { state }, cookies: [] };
  }

  if (state === 'failed') {
    // The POLL succeeded; the JOB failed. 200 with an explicit failed state, so the
    // page can distinguish "I could not read the job" from "the turn did not produce
    // a result" - and so it can never render this as an answer. There is no `text`
    // field on this path at all.
    //
    // THE UPSTREAM CODE IS DELIBERATELY DISCARDED. An earlier version forwarded
    // `originBody.error_code` straight to the browser, which made an arbitrary upstream
    // string part of this site's public surface. The origin's codes are diagnostics, and
    // one family of them (`worker_<code>`) is open-ended by construction, so no
    // allowlist here could stay complete. What the visitor can act on is identical in
    // every case - the turn produced nothing - so it collapses to one closed code, and
    // the diagnostic detail stays where it is useful: the origin's own log.
    return { status: 200, body: { state: 'failed', error_code: 'turn_failed' }, cookies: [] };
  }

  const result = toPublicResult(originBody);
  // A succeeded job with an unreadable engine result is a transport fault, not an
  // answer. Nothing is invented to fill the gap.
  if (result.kind === 'TERMINAL_FAILURE' && result.error_code === 'malformed_engine_result') {
    return fail(502, 'malformed_engine_result');
  }

  // `turn` is still emitted alongside `result` so an older client keeps working
  // unchanged; the typed union is what a current client switches on.
  const body: Record<string, unknown> = { state: 'succeeded', result };
  if (result.kind !== 'TERMINAL_FAILURE') body['turn'] = result.turn;
  return { status: 200, body, cookies: [] };
}
