/**
 * THE ONE WEBSITE-SIDE DEEP KORE BOUNDARY.
 *
 * Every request this website makes to Deep Kore passes through this module, and nothing
 * outside it knows the shape of a wire response. The console consumes the typed
 * application model below; it never sees a status code, a header, a cookie, a raw JSON
 * body, or an unrecognised discriminant.
 *
 * WHY IT IS A BOUNDARY AND NOT A HELPER
 * The origin's contract is the volatile half of this system - it gains outcomes, the
 * governed envelope grows fields, the engine's own vocabulary changes on its own
 * schedule. Concentrating every assumption about it here means a contract change is one
 * file to read and one file to edit, and the UI cannot quietly grow a second opinion
 * about what a response means. Scattering `fetch` calls through components is what makes
 * that impossible to audit later.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * It does not interpret, summarise, re-word or complete a response. It does not retry.
 * It does not cache. It has no fallback, no second origin and no substitute answer: a
 * transport failure is returned AS a transport failure, typed, so the interface cannot
 * render it as something Deep Kore said. And it never invents a field - if the origin
 * did not send it, it does not exist here.
 *
 * ADDRESSING
 * Every path is same-origin and relative. The protected Deep Kore origin's address and
 * both of its credentials exist only on the server, in `api/_lib/deep-kore-core.ts`, and
 * are not reachable from this file or from anything it is bundled with.
 */

import {
  isErrorCode,
  isResultKind,
  CODE_UNAVAILABLE,
  type DeepKoreErrorCode,
  type Exhaustive,
  type MustBeTrue,
  type PublicResultKind,
} from '../../../api/_lib/deep-kore-codes';

// ---------------------------------------------------------------------------
// The application model
// ---------------------------------------------------------------------------

/** A TAV request, as the server projected it: a typed predicate and nothing else. */
export interface TavRequest {
  tav_id: string;
  entity_ref: string;
  field: string;
  purpose: string;
}

/** An unknown-concept offer: an opaque reference and a safe description. */
export interface TeachingOffer {
  reference: string;
  description: string;
}

/**
 * One engine turn, as the site is permitted to see it.
 *
 * THIS IS THE COMPLETE LIST. The origin's governed envelope also carries `gk1_decision`,
 * `gk2_decision`, `transform_count`, `state_hash`, `adult_consent_invariant_violated`,
 * `vanguard_enabled`, `warmed_text` and `vanguard_diag`; the server projection withholds
 * every one of them, and the stamp that arrives here has already been redacted to its
 * publishable segments. Nothing in this file can widen that, because nothing in this
 * file ever sees the fields.
 */
export interface EngineTurn {
  text: string;
  persona: string;
  governance: { passed: boolean; stamp: string };
}

/**
 * THE CLOSED RESULT UNION, pinned to the set the server shares.
 *
 * `ClientCoversEveryResultKind` fails to compile if this union and the shared list stop
 * matching, and the console's switch over `kind` ends in a `never` binding. Together
 * those mean a new engine outcome cannot reach a visitor as an unlabelled answer: it
 * either gets a deliberate public state on both sides, or the build stops.
 */
export type DeepKoreResult =
  | { kind: 'GOVERNED_TEXT'; turn: EngineTurn }
  | { kind: 'GOVERNED_REFUSAL'; turn: EngineTurn }
  | { kind: 'TAV_REQUEST'; turn: EngineTurn; tav: TavRequest }
  | { kind: 'UNKNOWN_CONCEPT_OFFER'; turn: EngineTurn; offer: TeachingOffer }
  | { kind: 'TERMINAL_FAILURE'; code: DeepKoreErrorCode };

export type ClientCoversEveryResultKind = MustBeTrue<
  Exhaustive<DeepKoreResult['kind'], PublicResultKind>
>;

/**
 * A job's transport state.
 *
 * `RUNNING` covers the origin's `queued` and `running`, which are the GATEWAY's states
 * and not the engine's: `process_governed_turn` is synchronous and total, so cognition is
 * complete the moment it returns. The site collapses them because the difference between
 * "queued" and "running" is a fact about a queue the visitor does not have, and telling
 * them apart would invite reading either one as something the engine is doing.
 */
export type JobState =
  | { kind: 'RUNNING' }
  | { kind: 'DONE'; result: DeepKoreResult };

/**
 * A failure that is not an answer.
 *
 * `status` is 0 when no HTTP response arrived at all - the request never completed. That
 * is a different fact from a refusal the server chose to send, and the interface needs
 * both: only the first is worth offering to try again, because only the first might
 * succeed unchanged.
 */
export interface TransportFailure {
  code: DeepKoreErrorCode;
  status: number;
  /** True when the session is provably gone and no further request can use it. */
  fatal: boolean;
}

export type Attempt<T> = { ok: true; value: T } | { ok: false; failure: TransportFailure };

export interface SessionOpened {
  persona: string;
  canonVersion: string | null;
  maxMessageBytes: number;
}

export interface TurnAccepted {
  jobId: string;
  duplicate: boolean;
}

export type CandidateDecision = { kind: 'SUBMITTED' } | { kind: 'DISCARDED' };

/** The typed TAV answer this device may send. Never a value - there is no field for one. */
export interface TavDisclosure {
  tav_id: string;
  target_entity_id: string;
  field: string;
  decision: string;
}

// ---------------------------------------------------------------------------
// Wire handling
// ---------------------------------------------------------------------------

const SESSION_PATH = '/api/deep-kore/session';
const MESSAGE_PATH = '/api/deep-kore/message';
const CONSENT_PATH = '/api/deep-kore/consent';
const RESULT_PATH = '/api/deep-kore/result/';

/**
 * The statuses at which a session is provably gone.
 *
 * Anything else - a 400, a 409, a 502 - refused ONE request and left the session where
 * it was, so the interface keeps it. Treating every failure as fatal would throw away
 * conversations over a transient fault; treating none as fatal would leave a visitor
 * typing into a session that no longer exists.
 */
function isFatal(code: DeepKoreErrorCode | null, status: number): boolean {
  return code === 'session_expired' || (status === 401 && code === 'no_session');
}

function failureFrom(body: unknown, status: number): TransportFailure {
  const raw = (body as { error_code?: unknown } | null)?.error_code;
  // NOTHING FROM THE NETWORK IS RENDERED. An unrecognised value is not looked up, not
  // echoed and not kept: it collapses to `origin_error`, whose approved sentence - the
  // request did not complete, nothing was sent - is true of every refusal this site
  // cannot name, whatever the status was.
  //
  // Deliberately NOT `DEEP_KORE_UNAVAILABLE`. That one means the service could not be
  // reached, which is a specific claim and would be a false one about a 400.
  const code: DeepKoreErrorCode = isErrorCode(raw) ? raw : 'origin_error';
  return { code, status, fatal: isFatal(isErrorCode(raw) ? raw : null, status) };
}

/** A request that never reached a server at all. Status 0 says exactly that. */
const UNREACHABLE: TransportFailure = { code: CODE_UNAVAILABLE, status: 0, fatal: false };

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function readTurn(raw: unknown): EngineTurn | null {
  const t = asRecord(raw);
  if (!t || typeof t['text'] !== 'string') return null;
  const gov = asRecord(t['governance']);
  return {
    text: t['text'],
    persona: typeof t['persona'] === 'string' ? t['persona'] : 'AIYA',
    governance: {
      passed: gov?.['passed'] === true,
      stamp: typeof gov?.['stamp'] === 'string' ? gov['stamp'] : '',
    },
  };
}

function readTav(raw: unknown): TavRequest | null {
  const t = asRecord(raw);
  if (!t) return null;
  const { tav_id, entity_ref, field, purpose } = t as Record<string, unknown>;
  if (typeof tav_id !== 'string' || typeof entity_ref !== 'string') return null;
  if (typeof field !== 'string' || typeof purpose !== 'string') return null;
  return { tav_id, entity_ref, field, purpose };
}

function readOffer(raw: unknown): TeachingOffer | null {
  const o = asRecord(raw);
  if (!o) return null;
  const { reference, description } = o as Record<string, unknown>;
  if (typeof reference !== 'string' || typeof description !== 'string') return null;
  return { reference, description };
}

/**
 * Narrows one wire result to the application model, or reports it unreadable.
 *
 * The DISCRIMINANT is checked against the shared closed set before anything else, so an
 * unrecognised kind is never matched, never rendered, and never guessed at. A recognised
 * kind whose payload will not read is a fault too: a TAV request without its question,
 * or an offer without its reference, would otherwise be shown as a bare answer with the
 * thing that made it meaningful silently dropped.
 */
export function readResult(raw: unknown): DeepKoreResult {
  const unreadable: DeepKoreResult = {
    kind: 'TERMINAL_FAILURE',
    code: 'malformed_engine_result',
  };
  const r = asRecord(raw);
  if (!r || !isResultKind(r['kind'])) return unreadable;

  const kind: PublicResultKind = r['kind'];
  switch (kind) {
    case 'GOVERNED_TEXT':
    case 'GOVERNED_REFUSAL': {
      const turn = readTurn(r['turn']);
      return turn ? { kind, turn } : unreadable;
    }
    case 'TAV_REQUEST': {
      const turn = readTurn(r['turn']);
      const tav = readTav(r['tav']);
      return turn && tav ? { kind, turn, tav } : unreadable;
    }
    case 'UNKNOWN_CONCEPT_OFFER': {
      const turn = readTurn(r['turn']);
      const offer = readOffer(r['offer']);
      return turn && offer ? { kind, turn, offer } : unreadable;
    }
    case 'TERMINAL_FAILURE': {
      const code = r['error_code'];
      return { kind, code: isErrorCode(code) ? code : 'turn_failed' };
    }
    default: {
      // Unreachable while every kind above is handled. Adding one to the shared list
      // without a branch here fails to compile rather than falling through.
      const unhandled: never = kind;
      void unhandled;
      return unreadable;
    }
  }
}

// ---------------------------------------------------------------------------
// The client
// ---------------------------------------------------------------------------

export interface DeepKoreClient {
  createSession(turnstileToken?: string | undefined): Promise<Attempt<SessionOpened>>;
  submitTurn(text: string, opts?: { turnKey?: string; disclosure?: TavDisclosure }): Promise<Attempt<TurnAccepted>>;
  readJob(jobId: string): Promise<Attempt<JobState>>;
  decideCandidate(reference: string, consent: boolean): Promise<Attempt<CandidateDecision>>;
  endSession(): Promise<Attempt<true>>;
  /** Stops any request this client is waiting on. It does not stop a turn. */
  abort(): void;
  /** Forgets the session-scoped token. Called when a session ends, for any reason. */
  reset(): void;
}

/**
 * Builds a client bound to one conversation.
 *
 * The CSRF token lives here, in a closure, for the life of the session. It is not read
 * back out of `document.cookie`: keeping it here ties its lifetime to the conversation
 * rather than to whatever the document can see, and leaves the flow correct if the
 * cookie's scope is ever tightened. The browser still sends the cookie, which is what
 * the server compares the header against.
 */
export function createDeepKoreClient(fetchImpl: typeof fetch = fetch): DeepKoreClient {
  let csrf = '';
  let inFlight: AbortController | null = null;

  async function call(
    path: string,
    init: RequestInit,
    withCsrf: boolean
  ): Promise<{ status: number; json: unknown } | null> {
    const controller = new AbortController();
    inFlight = controller;
    const headers: Record<string, string> = { ...((init.headers as Record<string, string>) ?? {}) };
    if (init.body !== undefined) headers['Content-Type'] = 'application/json';
    if (withCsrf) headers['X-DK-CSRF'] = csrf;

    try {
      const res = await fetchImpl(path, {
        ...init,
        headers,
        credentials: 'same-origin',
        signal: controller.signal,
      });
      const json = await res.json().catch(() => null);
      return { status: res.status, json };
    } catch {
      // No status, no body, nothing to interpret. The caller is told the request did not
      // complete - never given prose from anywhere else.
      return null;
    } finally {
      if (inFlight === controller) inFlight = null;
    }
  }

  return {
    async createSession(turnstileToken) {
      const body: Record<string, unknown> = {};
      // The browser chooses a human-check token and nothing else. `persona` is omitted
      // deliberately: the server defaults it, and a page that names an identity key is a
      // page that could name a different one.
      if (turnstileToken) body['turnstile_token'] = turnstileToken;

      const res = await call(SESSION_PATH, { method: 'POST', body: JSON.stringify(body) }, false);
      if (!res) return { ok: false, failure: UNREACHABLE };
      if (res.status !== 201) return { ok: false, failure: failureFrom(res.json, res.status) };

      const r = asRecord(res.json);
      const token = r?.['csrf_token'];
      if (typeof token !== 'string' || token.length === 0) {
        // A session with no CSRF token cannot send anything, so accepting it would put
        // the interface in a state that looks open and is not.
        return { ok: false, failure: { code: 'origin_error', status: res.status, fatal: false } };
      }
      csrf = token;
      return {
        ok: true,
        value: {
          persona: typeof r?.['persona'] === 'string' ? (r['persona'] as string) : 'AIYA',
          canonVersion: typeof r?.['canon_version'] === 'string' ? (r['canon_version'] as string) : null,
          maxMessageBytes:
            typeof r?.['max_message_bytes'] === 'number' ? (r['max_message_bytes'] as number) : 0,
        },
      };
    },

    async submitTurn(text, opts = {}) {
      const body: Record<string, unknown> = { text };
      if (opts.turnKey) body['turn_key'] = opts.turnKey;
      if (opts.disclosure) {
        // THE DEVICE ENVELOPE. It carries the typed decision and never a value: there is
        // no `value` key constructed anywhere in this file, and the server refuses the
        // whole request if one arrives.
        body['device'] = {
          entities: [{ entity_id: opts.disclosure.target_entity_id, entity_kind: 'UNKNOWN' }],
          current_message: {
            segments: [{ kind: 'ENTITY', entity_id: opts.disclosure.target_entity_id }],
          },
          tav_disclosures: [opts.disclosure],
        };
      }

      const res = await call(MESSAGE_PATH, { method: 'POST', body: JSON.stringify(body) }, true);
      if (!res) return { ok: false, failure: UNREACHABLE };
      if (res.status !== 202) return { ok: false, failure: failureFrom(res.json, res.status) };

      const r = asRecord(res.json);
      const jobId = r?.['job_id'];
      if (typeof jobId !== 'string' || jobId.length === 0) {
        return { ok: false, failure: { code: 'origin_error', status: res.status, fatal: false } };
      }
      return { ok: true, value: { jobId, duplicate: r?.['duplicate'] === true } };
    },

    async readJob(jobId) {
      // The job id is the server's own, echoed back in a path segment. The session it
      // belongs to is never sent from here - the server uses the one it verified, so a
      // guessed id is refused there and again at the origin.
      const res = await call(`${RESULT_PATH}${encodeURIComponent(jobId)}`, { method: 'GET' }, false);
      if (!res) return { ok: false, failure: UNREACHABLE };
      if (res.status !== 200) return { ok: false, failure: failureFrom(res.json, res.status) };

      const r = asRecord(res.json);
      const state = r?.['state'];
      if (state === 'queued' || state === 'running') return { ok: true, value: { kind: 'RUNNING' } };
      if (state === 'failed') {
        // The POLL succeeded; the TURN failed. It becomes a terminal result rather than a
        // transport failure, because the distinction the visitor needs is "no answer was
        // produced", and this path carries no `text` at all.
        const code = r?.['error_code'];
        return {
          ok: true,
          value: {
            kind: 'DONE',
            result: { kind: 'TERMINAL_FAILURE', code: isErrorCode(code) ? code : 'turn_failed' },
          },
        };
      }
      if (state !== 'succeeded') {
        return { ok: false, failure: { code: 'malformed_engine_result', status: 200, fatal: false } };
      }
      return { ok: true, value: { kind: 'DONE', result: readResult(r?.['result']) } };
    },

    async decideCandidate(reference, consent) {
      const res = await call(
        CONSENT_PATH,
        { method: 'POST', body: JSON.stringify({ reference, consent }) },
        true
      );
      if (!res) return { ok: false, failure: UNREACHABLE };
      if (res.status !== 200) return { ok: false, failure: failureFrom(res.json, res.status) };

      const r = asRecord(res.json);
      if (consent) {
        // SUCCESS IS THE SERVER'S WORD, not the absence of an error. A 200 that does not
        // confirm the write is not a submission, and reporting one would be a false
        // success about the only thing this control promises.
        return r?.['submitted'] === true
          ? { ok: true, value: { kind: 'SUBMITTED' } }
          : { ok: false, failure: { code: 'teaching_broker_unavailable', status: 200, fatal: false } };
      }
      return { ok: true, value: { kind: 'DISCARDED' } };
    },

    async endSession() {
      const res = await call(SESSION_PATH, { method: 'DELETE' }, true);
      if (!res) return { ok: false, failure: UNREACHABLE };
      if (res.status !== 200) return { ok: false, failure: failureFrom(res.json, res.status) };
      csrf = '';
      return { ok: true, value: true };
    },

    abort() {
      inFlight?.abort();
      inFlight = null;
    },

    reset() {
      csrf = '';
    },
  };
}
