/**
 * The live Deep Kore chat console.
 *
 * WHAT THIS COMPONENT MAY AND MAY NOT DO
 * It renders what the visitor typed, what Deep Kore actually returned, and the transport
 * status. It never composes a reply, never fills a gap while waiting, never re-words a
 * governed response, and never shows a transport failure inside the conversation. Those
 * are not stylistic choices - a failure that renders like an answer is indistinguishable
 * from a fabricated one.
 *
 * THE STATE MODEL IS A CLOSED UNION, NOT A SET OF FLAGS
 * `ClientState` is a discriminated union, so the states that must not coexist cannot be
 * written down at the same time. In particular TAV_DECISION_REQUIRED and
 * TEACHING_CONSENT_REQUIRED are two members of one union: asking for a private-value
 * permission while also asking for teaching consent is not "prevented", it is
 * unrepresentable. An earlier version used a transport phase plus booleans, where that
 * combination was one careless `setState` away.
 *
 * THE SERVER RESULT IS A CLOSED UNION TOO
 * Which state the interface enters is decided by `result.kind` - GOVERNED_TEXT,
 * TAV_REQUEST, UNKNOWN_CONCEPT_OFFER, GOVERNED_REFUSAL, TERMINAL_FAILURE - a discriminant
 * the ENGINE produced and the server projected. Nothing here parses rendered text to
 * work out what happened, and adding such a parse would be a defect.
 *
 * IT TALKS ONLY TO THIS SITE
 * Every request is same-origin, to /api/deep-kore/*. The private origin's address and
 * credentials exist only on the server and are not reachable from here.
 *
 * NO STOPPING RULE
 * A turn is submitted, accepted, and then polled until the server reports a terminal
 * transport state. There is deliberately no attempt ceiling and no elapsed-time cutoff:
 * cognition runs to intrinsic completion in the origin's own process, and a countdown
 * here would be a stopping rule imposed from outside it. The visitor can stop WAITING -
 * that is their choice about their own attention - and the turn still finishes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { UI, ERROR_COPY, PUBLIC_IDENTITY } from '../../data/deep-kore';
import { CODE_UNAVAILABLE, type DeepKoreErrorCode } from '../../../api/_lib/deep-kore-codes';
// THE ONLY WAY THIS COMPONENT TALKS TO DEEP KORE. There is no `fetch` in this file, no
// path, no header and no status code: the adapter owns all of that and hands back a typed
// application model. See deepKoreClient.ts for why that boundary exists.
import {
  createDeepKoreClient,
  type DeepKoreClient,
  type DeepKoreResult,
  type EngineTurn,
  type TavRequest,
  type TeachingOffer,
  type TransportFailure,
} from './deepKoreClient';
import * as vault from './tavVault';
import * as context from './privateContext';
import { RELATIONSHIP_ROLES, DEVICE_ENTITY_KINDS } from '../../../api/_lib/deep-kore-codes';

// The cadence at which the browser asks the server for a job's transport state. This
// paces one HTTP poll; it does not bound, interrupt or influence the turn.
const POLL_INTERVAL_MS = 700;


/**
 * THE CLOSED CLIENT STATE UNION.
 *
 * Every member carries exactly the data that state needs and nothing else, so there is
 * no way to be "awaiting a TAV decision" without a TAV request in hand, and no way to
 * hold an offer reference while not asking about it.
 */
type ClientState =
  | { kind: 'IDLE' }
  // The creation request itself is in flight. This is a TRANSPORT state: nothing is
  // known yet about whether a session exists.
  | { kind: 'STARTING' }
  // The origin has accepted the session and is initializing it. Under protocol v1.2
  // creation answers immediately with `initializing`, because the worker must load a
  // canonical knowledge snapshot before it can carry a turn - measured at roughly
  // fourteen seconds, which is why waiting inside one HTTP request was the wrong shape.
  //
  // The session EXISTS here. It owns a capacity slot and can be deleted, which is what
  // separates it from STARTING and is why the visitor may end it while it is still
  // coming up.
  | { kind: 'INITIALIZING' }
  | { kind: 'READY' }
  | { kind: 'TURN_IN_PROGRESS' }
  // PERMISSION and RESULT are separate fields, because they are separate facts.
  // `permission` records what the VISITOR authorised; it is only ever changed by a
  // deliberate press. Whether this device can then produce anything is computed
  // afterwards, from the vault, and never inferred from the permission.
  | { kind: 'TAV_DECISION_REQUIRED'; tav: TavRequest; permission: 'UNDECIDED' | 'GRANTED' | 'REFUSED' }
  | { kind: 'TEACHING_CONSENT_REQUIRED'; offer: TeachingOffer; submitting: boolean }
  | { kind: 'ENDING' }
  // A session that ended because the visitor ended it.
  | { kind: 'TERMINATED' }
  // A session that ended because it could not continue. STRUCTURALLY DISTINCT from
  // TERMINATED and carrying the typed reason, so "you ended it" and "it broke" can
  // never be confused - by a visitor, by a test, or by a future edit reading only
  // the discriminant.
  | { kind: 'TERMINAL_FAILURE'; code: unknown };

/**
 * THE ONE RENDERING PATH FOR EVERY CLIENT STATE.
 *
 * A switch rather than a chain of `&&`, and it ends in a `never` binding for the same
 * reason `pollJob`'s does: a state added to the union with no summary here fails the
 * build instead of rendering an empty status line. There is no default text, because a
 * state with no words for it is a defect and not a thing to paper over.
 */
function stateSummary(s: ClientState): ReactNode {
  switch (s.kind) {
    case 'IDLE':
      return UI.idleNote;
    case 'STARTING':
      return UI.starting;
    case 'INITIALIZING':
      return UI.sessionInitializing;
    case 'TERMINATED':
      return UI.endedNote;
    case 'TERMINAL_FAILURE':
      return UI.failedNote;
    case 'READY':
    case 'TURN_IN_PROGRESS':
    case 'TAV_DECISION_REQUIRED':
    case 'TEACHING_CONSENT_REQUIRED':
    case 'ENDING':
      return (
        <>
          Session open with <strong>{PUBLIC_IDENTITY}</strong>. It exists only while this
          session is open.
        </>
      );
    default: {
      const unhandled: never = s;
      void unhandled;
      return null;
    }
  }
}

/**
 * WHY THE COMPOSER IS NOT AVAILABLE, in words, for every state in which it is not.
 *
 * A disabled control with no explanation is a dead end for anyone who cannot see the
 * rest of the interface change around it. This returns `null` in exactly one state -
 * READY - which is also the only state the composer is live in, so the two can never
 * disagree.
 */
function composerBlockedReason(s: ClientState): string | null {
  switch (s.kind) {
    case 'READY':
      return null;
    case 'IDLE':
      return UI.composerNoSession;
    case 'STARTING':
      return UI.composerStarting;
    case 'INITIALIZING':
      return UI.composerInitializing;
    case 'TURN_IN_PROGRESS':
      return UI.composerTurnRunning;
    case 'TAV_DECISION_REQUIRED':
      return UI.composerAwaitingTav;
    case 'TEACHING_CONSENT_REQUIRED':
      return UI.composerAwaitingOffer;
    case 'ENDING':
      return UI.composerEnding;
    case 'TERMINATED':
      return UI.composerEnded;
    case 'TERMINAL_FAILURE':
      return UI.composerFailed;
    default: {
      const unhandled: never = s;
      void unhandled;
      return null;
    }
  }
}

/** The two states in which the interface is asking the visitor a question. */
function isDecisionState(kind: ClientState['kind']): boolean {
  return kind === 'TAV_DECISION_REQUIRED' || kind === 'TEACHING_CONSENT_REQUIRED';
}

interface Entry {
  id: string;
  who: 'visitor' | 'engine';
  text: string;
  // `| undefined` is explicit because this project sets exactOptionalPropertyTypes:
  // true, under which `stamp?: string` means "absent or a string" and not "may be
  // undefined". A visitor entry legitimately has no stamp.
  stamp?: string | undefined;
  /** Whether the emission gate passed. Absent on a visitor entry, which has no gate. */
  passed?: boolean | undefined;
  /**
   * Opaque public Tesseract anchor handles this turn established, or absent on a visitor
   * entry. An engine turn that established nothing carries an empty array, which renders
   * nothing - an ordinary turn, not a failure.
   */
  anchors?: string[] | undefined;
}

/**
 * The approved sentence for one machine code.
 *
 * `ERROR_COPY` is `Record<DeepKoreErrorCode, string>` and the adapter only ever returns a
 * member of that closed union, so this lookup cannot miss. Nothing that arrived over the
 * network is displayed anywhere in this file - only a sentence this site wrote, for a
 * code this site defined.
 */
function errorText(code: DeepKoreErrorCode): string {
  return ERROR_COPY[code];
}

/**
 * Whether a failure is worth offering to try again.
 *
 * ONLY a request that never completed - the adapter reports those with status 0. A
 * refusal the server chose to send (it is full, it is switched off, the body was wrong)
 * would refuse identically on a second attempt, and a retry control beside it would be an
 * invitation to press a button that cannot work.
 *
 * Nothing retries on its own anywhere in this file. The visitor presses it, or nothing
 * happens. An automatic retry after transport loss would be this page deciding, on the
 * visitor's behalf, to send their message somewhere a second time.
 */
function isRetryable(failure: TransportFailure | null): boolean {
  return failure !== null && failure.status === 0;
}


interface Props {
  /**
   * The Turnstile site key, when the owner has configured one. A site key is public by
   * design - it is not a secret and appears in the page either way. When it is absent
   * the widget is not rendered, and the server refuses anonymous sessions, which is the
   * correct fail-closed pairing.
   */
  turnstileSiteKey?: string | undefined;
}

declare global {
  interface Window {
    turnstile?: { getResponse(widgetId?: string): string | undefined };
  }
}

export default function ChatConsole({ turnstileSiteKey }: Props) {
  const [state, setState] = useState<ClientState>({ kind: 'IDLE' });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [failure, setFailure] = useState('');
  const [notice, setNotice] = useState('');

  // The local-only private-value composer. `privateDraft` is component state so React
  // can render it; it is never included in any request body, and it is cleared the
  // moment it is committed to the vault.
  const [privateDraft, setPrivateDraft] = useState('');
  const [vaultCount, setVaultCount] = useState(0);

  // THE PRIVATE CONTEXT PANEL. `contextTick` exists only to re-render after a mutation:
  // the entities themselves live in the module store, never in React state, so there is
  // no second copy of a visitor's facts to leak or forget to clear.
  const [contextOpen, setContextOpen] = useState(false);
  const [contextTick, setContextTick] = useState(0);
  const [entityLabel, setEntityLabel] = useState('');
  const [entityRole, setEntityRole] = useState('');
  const [entityKind, setEntityKind] = useState('');

  const seq = useRef(0);
  const stopped = useRef(false);
  // The typed failure behind `failure`, kept so the interface can tell a request that
  // never completed from one the server deliberately refused. Only the first is offered
  // a retry.
  const [lastFailure, setLastFailure] = useState<TransportFailure | null>(null);
  // What a retry would re-send. Held here rather than reconstructed, so pressing retry
  // cannot quietly send something different from what failed.
  const retryable = useRef<{ text: string } | null>(null);

  /**
   * THE ONE DEEP KORE BOUNDARY, bound to this component for its lifetime.
   *
   * Created once via a lazy ref initialiser, so a re-render never builds a second client
   * and never orphans the CSRF token or the in-flight request the first one held.
   */
  const clientRef = useRef<DeepKoreClient | null>(null);
  if (clientRef.current === null) clientRef.current = createDeepKoreClient();
  const client = clientRef.current;

  // The device's pending TAV answer for the NEXT turn. A typed decision only - there is
  // no field here for a value, so a value cannot be carried into a request by accident.
  const pendingDisclosure = useRef<
    { tav_id: string; target_entity_id: string; field: string; decision: string } | null
  >(null);
  const transcriptEnd = useRef<HTMLDivElement | null>(null);
  const composer = useRef<HTMLTextAreaElement | null>(null);
  // The decision region currently on screen, if any. Only one can exist at a time -
  // TAV and teaching consent are two members of one union - so one ref serves both.
  const askRegion = useRef<HTMLElement | null>(null);
  const prevKind = useRef<ClientState['kind']>('IDLE');
  /**
   * The creation key for the session attempt in flight, held so a retry reuses it.
   * Cleared once the session reaches a terminal state, so the NEXT attempt is a new
   * session rather than a resolution of the previous one.
   */
  const sessionCreationKey = useRef<string>('');
  /**
   * Guards against overlapping initialization polls.
   *
   * A remount, a double press, or a retry must not start a second chain against the same
   * session: two chains would race to set the state and could reopen a composer the other
   * had already closed. Exactly one chain runs, and it owns the transition out of
   * INITIALIZING.
   */
  const initializationPollActive = useRef<boolean>(false);
  const focusReturnPending = useRef(false);

  // The composer is live ONLY in READY. While a decision is required the visitor is
  // being asked something, and letting them type past it would let a normal Enter press
  // stand in for an answer they never gave.
  const composerEnabled = state.kind === 'READY';

  useEffect(() => {
    // Scroll the newest entry into view without animating, so a reduced-motion setting
    // is respected by construction rather than by a media query.
    transcriptEnd.current?.scrollIntoView({ block: 'nearest' });
  }, [entries, status]);

  /**
   * FOCUS MOVES ONLY WHEN THE INTERFACE ASKS A QUESTION, AND IT COMES BACK AFTERWARDS.
   *
   * A new response never takes focus - it is announced by the transcript's live region
   * and the visitor stays where they were. A DECISION is different: the conversation
   * cannot continue until it is answered, and a region that appears silently below a
   * disabled composer is one a screen-reader or keyboard user has no reason to look for.
   *
   * The return leg needs a flag rather than a simple "previous state" comparison,
   * because answering a TAV request submits a turn: the path back to READY runs through
   * TURN_IN_PROGRESS, so by the time the composer is usable again the previous state is
   * no longer the decision. The flag remembers that a question was answered, and focus
   * returns to the composer - a lawful control - as soon as there is one to return to.
   *
   * The same flag covers an ordinary turn, for a different reason: the composer is
   * DISABLED while a turn runs, and a disabled element cannot hold focus, so the browser
   * drops focus to the document whether anyone wanted that or not. `submitTurn` records
   * whether the composer actually had focus at that moment, so the restoration is a
   * restoration and never a steal.
   */
  useEffect(() => {
    const was = prevKind.current;
    prevKind.current = state.kind;

    if (isDecisionState(state.kind) && !isDecisionState(was)) {
      askRegion.current?.focus();
      return;
    }
    if (isDecisionState(was) && !isDecisionState(state.kind)) {
      focusReturnPending.current = true;
    }
    if (state.kind === 'READY' && focusReturnPending.current) {
      focusReturnPending.current = false;
      composer.current?.focus();
    }
  }, [state.kind]);

  /**
   * The vault is cleared on navigation and on unmount.
   *
   * THIS IS NOT THE `pagehide` DELETE THAT WAS REMOVED. That one sent a DELETE to the
   * server and destroyed a session a visitor was still using. This sends nothing and
   * touches no session: it forgets values held in THIS tab's memory, which is exactly
   * what the visitor was promised would happen when they navigate away. Forgetting
   * local memory early is safe in a way destroying a remote session never was.
   */
  useEffect(() => {
    const wipe = () => {
      vault.clearAll();
      context.clearAll();
      setVaultCount(0);
      setContextTick((n) => n + 1);
    };
    window.addEventListener('pagehide', wipe);
    return () => {
      window.removeEventListener('pagehide', wipe);
      wipe();
    };
  }, []);

  const nextId = () => `e${++seq.current}`;

  /**
   * Forgets everything this tab was holding privately.
   *
   * Called on every path that ends a conversation - explicit deletion, a session that
   * ended at the server, and a terminal engine failure - because the promise the page
   * makes about a private value is that it does not outlive the conversation it was
   * entered for. A grant that survived a failure would be a grant nobody re-authorised.
   */
  const discardLocalState = useCallback(() => {
    pendingDisclosure.current = null;
    retryable.current = null;
    vault.clearAll();
    // THE CONTEXT GOES WITH THE VALUES. A relationship a visitor described is as much
    // theirs as the value they kept, and it does not outlive the conversation it was
    // given for either.
    context.clearAll();
    setVaultCount(0);
    setContextTick((n) => n + 1);
    setPrivateDraft('');
    setEntityLabel('');
    setEntityRole('');
    setEntityKind('');
  }, []);

  /** Clears the failure region. Every path that begins new work starts by doing this. */
  const clearFailure = useCallback(() => {
    setFailure('');
    setLastFailure(null);
  }, []);

  /** Shows one typed failure. The ONLY way anything reaches the alert region. */
  const showFailure = useCallback((f: TransportFailure) => {
    setFailure(errorText(f.code));
    setLastFailure(f);
  }, []);

  /**
   * Waits for the origin to finish initializing the session it already accepted.
   *
   * NO ATTEMPT CAP AND NO DEADLINE, for the same reason `pollJob` has none. Protocol
   * v1.2 certifies that initialization ends only at its own terminal state, so a
   * countdown here would be a stopping rule imposed from outside the engine - and the
   * timeout it replaced is precisely the defect this protocol exists to remove.
   *
   * A FAILED POLL IS NOT A FAILED SESSION. A request that never completed says nothing
   * about the worker, which is very likely still loading its snapshot. The loop simply
   * asks again; only the ORIGIN may declare the session failed.
   *
   * Exactly one chain runs at a time, and it stops on ready, on failure, and whenever
   * the console leaves INITIALIZING - which is what ending or leaving does.
   */
  const awaitSessionInitialization = useCallback(async () => {
    if (initializationPollActive.current) return;
    initializationPollActive.current = true;
    try {
      for (;;) {
        if (stopped.current) return;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (stopped.current) return;

        const status = await clientRef.current?.readSessionInitializationState();
        if (!status) return;
        if (!status.ok) {
          // Transport only. Keep waiting: the session is still coming up at the origin.
          continue;
        }
        if (status.value.state === 'ready') {
          sessionCreationKey.current = '';
          setState({ kind: 'READY' });
          window.requestAnimationFrame(() => composer.current?.focus());
          return;
        }
        if (status.value.state === 'failed') {
          sessionCreationKey.current = '';
          // The origin's own terminal verdict, rendered through the closed public code
          // set. Nothing here invents a reason.
          setState({ kind: 'TERMINAL_FAILURE', code: status.value.errorCode ?? CODE_UNAVAILABLE });
          return;
        }
      }
    } finally {
      initializationPollActive.current = false;
    }
  }, []);

  const start = useCallback(async () => {
    clearFailure();
    setStatus('');
    setNotice('');
    setState({ kind: 'STARTING' });

    let token: string | undefined;
    if (turnstileSiteKey) {
      token = window.turnstile?.getResponse();
      if (!token) {
        // A local precondition, not a transport outcome: there is nothing to retry and
        // no code to map, so it is said plainly and the state does not change.
        setFailure(UI.humanCheckFirst);
        setState({ kind: 'IDLE' });
        return;
      }
    }

    // ONE CREATION KEY PER ATTEMPT, REUSED ON EVERY RETRY OF THAT ATTEMPT.
    //
    // The server turns this into the upstream creation identity, so a request whose
    // response was lost can be repeated and resolve to the SAME session. Minting a new
    // key on retry is exactly the bug that leaks a worker and a capacity slot, so the
    // key is generated once here and only replaced when the visitor starts over.
    if (!sessionCreationKey.current) {
      sessionCreationKey.current = crypto.randomUUID().replace(/-/g, '');
    }

    const opened = await client.createSession(token, sessionCreationKey.current);
    if (!opened.ok) {
      showFailure(opened.failure);
      setState({ kind: 'IDLE' });
      return;
    }
    setEntries([]);

    // A v1 origin answers only once the worker is ready; a v1.2 origin answers at once
    // and initializes afterwards. The site does not assume which it is talking to - it
    // reads the state it was given and waits when told to wait.
    if (opened.value.initializationState === 'ready') {
      sessionCreationKey.current = '';
      setState({ kind: 'READY' });
      window.requestAnimationFrame(() => composer.current?.focus());
      return;
    }

    setState({ kind: 'INITIALIZING' });
    void awaitSessionInitialization();
  }, [turnstileSiteKey, client, clearFailure, showFailure, awaitSessionInitialization]);

  const end = useCallback(async () => {
    setState({ kind: 'ENDING' });
    setStatus('');
    clearFailure();

    const ended = await client.endSession();
    if (!ended.ok) {
      // A delete that did not land leaves the session open at the server. Clearing the
      // transcript and saying it was discarded would be a false success about the one
      // thing this page promises hardest - that the conversation is not kept. Report the
      // failure and leave the session where it is.
      showFailure(ended.failure);
      setState({ kind: 'READY' });
      return;
    }
    // Session completion destroys the vault. Nothing survives the conversation it
    // belonged to.
    discardLocalState();
    setEntries([]);
    setDraft('');
    setState({ kind: 'TERMINATED' });
  }, [client, discardLocalState, clearFailure, showFailure]);

  /**
   * Appends one engine turn to the transcript. The only place a response is rendered.
   *
   * The turn is already typed and already validated by the adapter, so there is no
   * shape-checking here and no chance of a partially-read response reaching the screen:
   * a turn that would not read never became a turn at all.
   */
  const appendTurn = (turn: EngineTurn) => {
    setEntries((prev) => [
      ...prev,
      {
        id: nextId(),
        who: 'engine',
        text: turn.text,
        stamp: turn.governance.stamp || undefined,
        passed: turn.governance.passed,
        anchors: turn.anchors,
      },
    ]);
  };

  /** Renders one typed result. The ONLY place a response reaches the transcript. */
  const applyResult = useCallback(
    (result: DeepKoreResult) => {
      // The DISCRIMINANT decides the next state. Never the text.
      switch (result.kind) {
        case 'GOVERNED_TEXT':
        case 'GOVERNED_REFUSAL': {
          appendTurn(result.turn);
          setState({ kind: 'READY' });
          return;
        }
        case 'TAV_REQUEST': {
          appendTurn(result.turn);
          setState({ kind: 'TAV_DECISION_REQUIRED', tav: result.tav, permission: 'UNDECIDED' });
          return;
        }
        case 'UNKNOWN_CONCEPT_OFFER': {
          appendTurn(result.turn);
          setState({ kind: 'TEACHING_CONSENT_REQUIRED', offer: result.offer, submitting: false });
          return;
        }
        case 'TERMINAL_FAILURE': {
          // A turn that produced nothing. It is reported in the alert region, NEVER in
          // the transcript, and the session's local private memory does not survive it.
          // The session itself does: it was the turn that failed, not the conversation.
          showFailure({ code: result.code, status: 200, fatal: false });
          discardLocalState();
          setState({ kind: 'READY' });
          return;
        }
        default: {
          // UNREACHABLE, AND THAT IS THE POINT. `result` is `never` here only while every
          // kind above is handled; adding one to the shared list without a branch makes
          // this assignment fail to compile. It is not a runtime fallback - there is no
          // sixth state to fall into.
          const unhandled: never = result;
          void unhandled;
          return;
        }
      }
    },
    [discardLocalState, showFailure]
  );


  /**
   * Polls one job to a terminal transport state, then enters the state the ENGINE's own
   * typed result names.
   *
   * NO ATTEMPT CAP AND NO DEADLINE. Cognition runs to intrinsic completion in the
   * origin's own process; a countdown here would be a stopping rule imposed from outside
   * it. A poll that does not complete is not a failure either - the turn has not stopped,
   * so neither does the wait. The visitor can stop WAITING, which is a decision about
   * their own attention and changes nothing about the turn.
   */
  const pollJob = useCallback(
    async (jobId: string) => {
      for (;;) {
        if (stopped.current) return;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (stopped.current) return;

        const read = await client.readJob(jobId);

        if (!read.ok) {
          // A request that never completed is transient: keep waiting. Anything the
          // server actually answered is reported.
          if (read.failure.status === 0) continue;
          showFailure(read.failure);
          if (read.failure.fatal) {
            // The session is gone upstream, not merely one read. That ends the
            // conversation, so the local private memory ends with it.
            discardLocalState();
            setState({ kind: 'TERMINAL_FAILURE', code: read.failure.code });
          } else {
            setState({ kind: 'READY' });
          }
          return;
        }

        if (read.value.kind === 'RUNNING') continue;
        applyResult(read.value.result);
        return;
      }
    },
    [client, applyResult, discardLocalState, showFailure]
  );

  /**
   * Submits one turn, optionally carrying the device's typed TAV answer.
   *
   * `keepNotice` exists for exactly one caller. A new turn normally clears the previous
   * notice, because a stale "Submitted for review." hanging over an unrelated question is
   * misleading. But a TAV decision IS the notice and the turn at once - the continuation
   * turn is what carries the decision - so clearing it there would erase the record of
   * what the visitor just chose at the moment they chose it.
   */
  const submitTurn = useCallback(
    async (text: string, echoVisitor: boolean, keepNotice = false) => {
      clearFailure();
      if (!keepNotice) setNotice('');
      if (echoVisitor) setEntries((prev) => [...prev, { id: nextId(), who: 'visitor', text }]);
      // The composer is about to be disabled, and a disabled element cannot hold focus -
      // the browser drops it to the document. Record whether it HAD focus, so it can be
      // given back when the turn ends. Recording rather than assuming is the point: a
      // visitor who moved focus away deliberately, to read the transcript, must not have
      // it yanked back when the answer arrives.
      focusReturnPending.current =
        typeof document !== 'undefined' && document.activeElement === composer.current;
      setState({ kind: 'TURN_IN_PROGRESS' });

      const turnKey = `t${seq.current}-${Date.now().toString(36)}`;

      // The typed TAV answer for this turn, if the previous one asked. It is a DECISION
      // and never a value: `TavDisclosure` has no field that could carry one, and the
      // server refuses the whole request if one arrives by any other route.
      const pending = pendingDisclosure.current;
      pendingDisclosure.current = null;

      // THE VISITOR'S OWN CONTEXT, and only when they supplied some. An ordinary turn
      // sends no envelope at all, which is why regular chat works with no context and
      // why nothing about a visitor is asserted to the engine unless they said it.
      const turnContext = context.isEmpty()
        ? undefined
        : { entities: context.toDeviceEntities(), messageEntityIds: context.includedIds() };

      const accepted = await client.submitTurn(text, {
        turnKey,
        ...(pending ? { disclosure: pending } : {}),
        ...(turnContext ? { context: turnContext } : {}),
      });

      if (!accepted.ok) {
        showFailure(accepted.failure);
        // Only a request that never completed is worth offering again. Everything else
        // was refused deliberately and would be refused again.
        //
        // `echoVisitor` is the second condition, and it is not incidental: it is false
        // exactly when this turn is a TAV continuation. That turn carries a decision that
        // has already been consumed - the grant is gone and the vault entry with it - so
        // replaying it would send a permission the visitor is no longer being asked for.
        // A lost continuation is answered by being asked again, never by resending.
        retryable.current = accepted.failure.status === 0 && echoVisitor ? { text } : null;
        if (accepted.failure.fatal) {
          discardLocalState();
          setState({ kind: 'TERMINAL_FAILURE', code: accepted.failure.code });
        } else {
          setState({ kind: 'READY' });
        }
        return;
      }

      retryable.current = null;
      stopped.current = false;
      setStatus(UI.working);
      await pollJob(accepted.value.jobId);
      setStatus('');
    },
    [client, pollJob, discardLocalState, clearFailure, showFailure]
  );

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || !composerEnabled) return;
    setDraft('');
    await submitTurn(text, true);
  }, [draft, composerEnabled, submitTurn]);

  const stopWaiting = useCallback(() => {
    stopped.current = true;
    // Cancels the poll this browser is waiting on. It cancels nothing at the origin:
    // cognition runs in the origin's own process and has no idea a browser was watching.
    client.abort();
    setStatus('');
    setState({ kind: 'READY' });
    // Deliberately honest. Stopping the wait is a decision about the visitor's own
    // attention; the turn is still running and this says so rather than implying it
    // was cancelled.
    setFailure(UI.stoppedWaiting);
    setLastFailure(null);
  }, [client]);

  /**
   * Sends again what did not get through.
   *
   * Offered ONLY after a request that never completed, and only when the visitor presses
   * it. The message is replayed from what was actually sent rather than rebuilt, so a
   * retry cannot send something subtly different from the attempt it is repeating - and
   * the turn is not echoed into the transcript a second time, because it is already there.
   */
  const retry = useCallback(async () => {
    const pendingText = retryable.current?.text;
    if (!pendingText || state.kind !== 'READY') return;
    retryable.current = null;
    await submitTurn(pendingText, false);
  }, [state.kind, submitTurn]);

  // ---- TAV decision ------------------------------------------------------

  /**
   * PERMISSION AND RESULT ARE TWO DIFFERENT FACTS, AND THIS IS WHERE THEY SEPARATE.
   *
   * An earlier version consulted the vault and sent GRANTED when a value existed,
   * UNAVAILABLE when it did not. That was wrong, and wrong in a way worth stating: it
   * proved only that this browser POSSESSED something. It never showed the private
   * value participating in the determination, and it reported possession as though it
   * were an authorised disclosure.
   *
   * What the canonical contract actually permits here is narrow, and the narrowness is
   * the finding rather than a shortcoming of this file:
   *
   *   - `TavPurpose` has exactly ONE enumerator, RESPONSE_REQUIRES_LITERAL_VALUE. TAV
   *     is the governed exception in which Deep Kore must state the literal back. A
   *     non-literal TAV outcome is not representable: there is no TavResponse type in
   *     Deep Kore at all, and `TavDecision` is a PERMISSION vocabulary
   *     (GRANTED / DENIED_BY_USER / DENIED_BY_POLICY / UNAVAILABLE), not a result one.
   *   - The public site forbids transmitting the literal. So GRANTED cannot lawfully be
   *     sent from here: with a value it breaks the site's rule, and without one it is a
   *     disclosure that discloses nothing - a claim shaped like an answer.
   *
   * Therefore this device never sends GRANTED, and the three answers it does send are
   * used with their exact canonical meanings:
   *
   *   REFUSED by the visitor            -> DENIED_BY_USER, and NO evaluation is run
   *   permitted, nothing held           -> UNAVAILABLE  (a possession state)
   *   permitted, a value IS held        -> DENIED_BY_POLICY (this device will not
   *                                        disclose a literal; the visitor said yes,
   *                                        the device's own policy still says no)
   *
   * UNAVAILABLE and DENIED_BY_POLICY are deliberately distinct: one means "there is
   * nothing here", the other means "there is something here and it is not leaving".
   * Collapsing them would tell Deep Kore the wrong thing about whether asking again
   * could ever help.
   */
  const tavDecide = useCallback(
    async (tav: TavRequest, permitted: boolean) => {
      // STEP 1: permission. Recorded from the visitor's own act, never inferred.
      setState({ kind: 'TAV_DECISION_REQUIRED', tav, permission: permitted ? 'GRANTED' : 'REFUSED' });

      // STEP 2: the local operation, run only under permission. The vault is read
      // ONLY when permission was given - `decideTavAnswer` short-circuits on refusal,
      // and this call site mirrors that so a denial reads nothing at all.
      const held = permitted ? vault.has(tav.entity_ref, tav.field) : false;
      const decision = vault.decideTavAnswer(permitted, held);

      // STEP 3: THE LITERAL, on a grant and on nothing else.
      //
      // `read()` is called only in the GRANTED branch, so a refusal and an empty vault
      // both leave the value unread rather than read-and-discarded. The disclosure that
      // carries it is built here and sent by the next turn; the canonical rule - a value
      // only ever on GRANTED - is enforced again by this site's own server.
      const disclosure: {
        tav_id: string;
        target_entity_id: string;
        field: string;
        decision: string;
        value?: string;
      } = {
        tav_id: tav.tav_id,
        target_entity_id: tav.entity_ref,
        field: tav.field,
        decision,
      };
      if (decision === 'GRANTED') {
        disclosure.value = vault.read(tav.entity_ref, tav.field) ?? '';
      }
      pendingDisclosure.current = disclosure;

      // STEP 4: the grant is CONSUMED. The vault entry is gone before the turn is even
      // sent, so there is nothing left to replay, reuse or send twice - the state leaves
      // TAV_DECISION_REQUIRED and the value leaves with it. A denial and an empty vault
      // clear too, which costs nothing and keeps one rule instead of three.
      vault.forget(tav.entity_ref, tav.field);
      setVaultCount(vault.size());

      if (!permitted) setNotice(UI.tavDeclined);
      else if (decision === 'GRANTED') setNotice(UI.tavGranted);
      else setNotice(UI.tavNothingHeld);

      await submitTurn('Continue.', false, true);
    },
    [submitTurn]
  );

  // ---- Teaching consent --------------------------------------------------

  const decideCandidate = useCallback(
    async (offer: TeachingOffer, consent: boolean) => {
      clearFailure();
      // `submitting` disables both controls, so one decision cannot be sent twice while
      // the first is still in flight. The state carries the flag rather than a separate
      // boolean, so "submitting" without an offer is unrepresentable.
      setState({ kind: 'TEACHING_CONSENT_REQUIRED', offer, submitting: true });

      const decided = await client.decideCandidate(offer.reference, consent);
      if (!decided.ok) {
        // A submission that did not land is NOT a submission. There is no retry, no
        // queue and no local spool on this path, so nothing is pending and saying
        // otherwise would be false.
        showFailure(decided.failure);
        setState({ kind: 'READY' });
        return;
      }
      // The ONLY success wording. It does not say Deep Kore learned, accepted,
      // understood or added anything, because it did none of those.
      setNotice(decided.value.kind === 'SUBMITTED' ? UI.offerSubmitted : UI.offerDeclined);
      setState({ kind: 'READY' });
    },
    [client, clearFailure, showFailure]
  );

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const keepPrivate = useCallback(
    (tav: TavRequest) => {
      const v = privateDraft.trim();
      if (!v) return;
      vault.put(tav.entity_ref, tav.field, v);
      // Cleared from React state immediately: the vault is the only place it lives.
      setPrivateDraft('');
      setVaultCount(vault.size());
      setNotice(UI.tavHeld);
    },
    [privateDraft]
  );

  // ---- Private context ---------------------------------------------------

  /**
   * Records one entity the visitor described.
   *
   * Every field comes from a control they operated: the role from a list of canonical
   * enumerators, the kind from another, the label from their own keyboard. Nothing is
   * derived from the conversation, and an unrecognised role simply does not add an
   * entity rather than being coerced into one that looks close.
   */
  const addEntity = useCallback(() => {
    if (!entityRole) return;
    const added = context.add(entityLabel, entityRole, entityKind || undefined);
    if (!added) return;
    setEntityLabel('');
    setEntityRole('');
    setEntityKind('');
    setContextTick((n) => n + 1);
    setNotice(UI.contextAdded);
  }, [entityLabel, entityRole, entityKind]);

  const removeEntity = useCallback((id: string) => {
    context.forget(id);
    setContextTick((n) => n + 1);
    setNotice(UI.contextRemoved);
  }, []);

  const toggleEntity = useCallback((id: string, included: boolean) => {
    context.setIncluded(id, included);
    setContextTick((n) => n + 1);
  }, []);

  const clearContext = useCallback(() => {
    context.clearAll();
    setContextTick((n) => n + 1);
    setNotice(UI.contextCleared);
  }, []);

  /**
   * DELETING A HELD VALUE, BEFORE ANY DISCLOSURE IS BUILT.
   *
   * A value kept locally can be deleted at any point up to the decision, and deleting it
   * is a real deletion rather than a flag: `forget` removes the entry from the only place
   * it existed. This is separate from declining - a visitor may want the value gone AND
   * still answer the question - so it is its own control with its own wording, not a
   * second name for Decline.
   *
   * THIS IS NOT REVOCATION, AND IT WAS PREVIOUSLY NAMED AS IF IT WERE. It only ever
   * reaches a value this tab is still holding. It cannot reach a disclosure that has
   * already been sent, because there is no protocol message that could: the certified
   * `TavDecision` is `GRANTED | DENIED_BY_POLICY | DENIED_BY_USER | UNAVAILABLE`, with no
   * `REVOKED`, and owner ruling 2026-09-07 confirms none is to be added or expected.
   *
   * What actually protects a visitor after a grant is not recall but scope: the value is
   * disclosed for exactly one turn and cleared unconditionally by the engine before the
   * outcome is even built. A completed disclosure cannot be taken back, and this control
   * must never be worded, named or tested as though it could.
   */
  const removeHeldPrivateValue = useCallback((tav: TavRequest) => {
    vault.forget(tav.entity_ref, tav.field);
    setPrivateDraft('');
    setVaultCount(vault.size());
    setNotice(UI.tavRemovedHeld);
  }, []);

  // Read straight from the module store on every render. `contextTick` is what makes
  // React re-render after a mutation; the entities themselves are never copied into
  // component state, so there is no second place a visitor's facts could survive a
  // `clearAll()` that missed one.
  void contextTick;
  const entities = context.all();

  const blockedReason = composerBlockedReason(state);
  // Both the reason a control is unavailable and the current failure are ASSOCIATED with
  // the composer, not merely placed near it, so a screen reader announces them when the
  // control is reached rather than leaving them to be discovered by chance.
  const composerDescribedBy =
    [blockedReason ? 'dk-composer-why' : '', failure ? 'dk-failure' : ''].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="dk-console" data-dk-state={state.kind}>
      <div className="dk-bar">
        <p className="dk-bar-state">{stateSummary(state)}</p>

        {state.kind === 'IDLE' || state.kind === 'TERMINATED' || state.kind === 'TERMINAL_FAILURE' ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => void start()}>
            {UI.start}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => void end()}
            disabled={state.kind === 'ENDING' || state.kind === 'TURN_IN_PROGRESS'}
          >
            {state.kind === 'ENDING' ? UI.ending : UI.end}
          </button>
        )}
      </div>

      {/*
        The transcript is the ONLY place a Deep Kore response appears, and the only thing
        that ever appears in it is a visitor message or a returned response. Status,
        notices and failures live in their own regions, so none can be mistaken for a turn.
      */}
      <div
        className="dk-transcript"
        role="log"
        aria-live="polite"
        aria-label={UI.transcriptLabel}
        tabIndex={0}
      >
        {entries.length === 0 && state.kind !== 'IDLE' && state.kind !== 'TERMINATED' &&
          state.kind !== 'TERMINAL_FAILURE' && (
          <p className="dk-empty">Nothing has been said yet.</p>
        )}
        {entries.map((e) => (
          <article key={e.id} className={`dk-turn dk-turn-${e.who}`}>
            <h3 className="dk-who">{e.who === 'visitor' ? 'You' : PUBLIC_IDENTITY}</h3>
            {/*
              `{e.text}` is a JSX expression, so React escapes it. Markup in a response is
              shown as the characters it is and is never parsed - there is no
              `dangerouslySetInnerHTML` anywhere in this file, and no HTML from any
              response ever becomes part of this document.
            */}
            <p className="dk-text">{e.text}</p>
            {/*
              "WHY THIS RESPONSE?", and the honest answer is short.

              This is a disclosure rather than a permanent line because the governance
              record is a technical artifact: a visitor reading a conversation should not
              have a stamp under every sentence, and one who wants it should not have to
              ask anyone for it.

              What is inside is ONLY what the response actually arrived with. Deep Kore
              returns no source list, no confidence score, no reasoning trace and no
              provenance on this path, so none is shown and none is reconstructed. The
              disclosure says that outright rather than leaving an absence to be read as
              an oversight.
            */}
            {e.who === 'engine' && e.stamp && (
              <details className="dk-why">
                <summary>{UI.whyHeading}</summary>
                <div className="dk-why-body">
                  <p className="dk-why-gate" data-dk-gate={e.passed ? 'passed' : 'not-passed'}>
                    {e.passed ? UI.whyGatePassed : UI.whyGateFailed}
                  </p>
                  <p className="dk-stamp">
                    <span className="dk-stamp-label">{UI.whyStampLabel}</span>
                    <code>{e.stamp}</code>
                  </p>
                  <p className="dk-why-note">{UI.whyStampNote}</p>
                  <p className="dk-why-note">{UI.whyNoProvenance}</p>
                  {/*
                    PUBLIC TESSERACT ANCHORS.

                    Rendered only when the turn actually established something. An empty
                    array is the ordinary case and shows nothing at all - an absent
                    section is not an omission and must never be dressed up as one.

                    Each handle is printed as the opaque token it is. There is deliberately
                    nothing to expand, sort, link or look up: the wire carries a hash and
                    no second field, so there is no coordinate, placement, edge, candidate
                    set or trace available to render even if someone wanted to. The copy
                    beside it says plainly that this is not learning, because an anchor
                    confirming that structure settled is the thing a visitor is most likely
                    to mistake for Deep Kore having been taught something.
                  */}
                  {e.anchors && e.anchors.length > 0 && (
                    <div className="dk-anchors" data-dk-anchors={e.anchors.length}>
                      <p className="dk-anchors-heading">{UI.anchorsHeading}</p>
                      <p className="dk-why-note">{UI.anchorsNote}</p>
                      <ul className="dk-anchor-list">
                        {e.anchors.map((handle) => (
                          <li key={handle} className="dk-anchor">
                            <span className="dk-anchor-label">{UI.anchorLabel}</span>
                            <code className="dk-anchor-handle" title={handle}>
                              {handle.slice(0, 12)}
                            </code>
                          </li>
                        ))}
                      </ul>
                      <p className="dk-why-note">{UI.anchorsNotLearning}</p>
                    </div>
                  )}
                </div>
              </details>
            )}
          </article>
        ))}
        <div ref={transcriptEnd} />
      </div>

      <p className="dk-status" role="status" aria-live="polite">
        {status}
        {state.kind === 'TURN_IN_PROGRESS' && (
          <button type="button" className="dk-stop" onClick={stopWaiting}>
            Stop waiting
          </button>
        )}
      </p>

      {notice && (
        <p className="dk-notice" role="status">
          {notice}
        </p>
      )}

      {failure && (
        <div className="dk-failure" role="alert" id="dk-failure">
          <p>{failure}</p>
          {/*
            Offered only after a request that never completed, and only to a visitor who
            presses it. Nothing on this page retries on its own: an automatic retry after
            transport loss would be the page deciding, unasked, to send someone's message
            a second time.
          */}
          {isRetryable(lastFailure) && retryable.current && state.kind === 'READY' && (
            <button
              type="button"
              className="btn btn-ghost btn-sm dk-retry"
              data-dk-action="retry"
              onClick={() => void retry()}
            >
              {UI.retry}
            </button>
          )}
        </div>
      )}

      {/* ---- TAV decision ------------------------------------------------ */}
      {state.kind === 'TAV_DECISION_REQUIRED' && (
        <section
          className="dk-ask"
          aria-labelledby="dk-tav-h"
          data-dk-ask="tav"
          ref={askRegion}
          tabIndex={-1}
        >
          <h3 id="dk-tav-h">{UI.tavHeading}</h3>
          <p>{UI.tavLocalOnly}</p>
          <p className="dk-ask-field">
            <span className="dk-ask-field-label">What kind of fact</span>
            <code>{state.tav.field}</code>
          </p>

          <div className="dk-private">
            <label className="dk-private-label" htmlFor="dk-private">
              {UI.tavPrivateLabel}
            </label>
            <input
              id="dk-private"
              className="dk-private-input"
              type="text"
              value={privateDraft}
              autoComplete="off"
              aria-describedby="dk-private-hint"
              onChange={(e) => setPrivateDraft(e.target.value)}
            />
            <p className="dk-private-hint" id="dk-private-hint">{UI.tavPrivateHint}</p>
            <div className="dk-private-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => keepPrivate(state.tav)}
                disabled={privateDraft.trim().length === 0}
              >
                {UI.tavPrivateSave}
              </button>
              {/*
                LOCAL DELETION. Present only while this tab is still holding something,
                and deliberately distinct from Decline: one deletes the value, the other
                answers the question. A visitor may want both, or either, or neither.

                Its presence condition is also the honest statement of its limit. It is
                rendered from `vault.has(...)`, so it exists exactly when there is a held
                value to delete - never after a grant has been consumed, because by then
                there is nothing here to act on and nothing anywhere that could recall it.
              */}
              {vault.has(state.tav.entity_ref, state.tav.field) && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  data-dk-action="remove-held-value"
                  onClick={() => removeHeldPrivateValue(state.tav)}
                >
                  {UI.tavRemoveHeld}
                </button>
              )}
            </div>
            {vaultCount > 0 && <p className="dk-private-held">{UI.tavHeld}</p>}
          </div>

          {/*
            Neither control is preselected and neither is a default: there is no checked
            input here and no autofocus onto Continue, so permission is only ever given
            by a deliberate press.
          */}
          {/*
            THE SENDING CONTROL SAYS IT SENDS.

            Its label changes with what is actually held, because the same press means
            two different things: with a value in the vault it transmits that value for
            one answer, and with nothing held it transmits only that there is nothing.
            A single fixed label would be wrong in one of those cases, and the case it
            would be wrong in is the one where something private leaves the tab.

            Neither control is preselected and neither is autofocused: permission is
            only ever given by a deliberate press.
          */}
          <div className="dk-ask-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              data-dk-action="tav-permit"
              onClick={() => void tavDecide(state.tav, true)}
            >
              {vault.has(state.tav.entity_ref, state.tav.field)
                ? UI.tavContinue
                : UI.tavContinueWithout}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              data-dk-action="tav-decline"
              onClick={() => void tavDecide(state.tav, false)}
            >
              {UI.tavDecline}
            </button>
          </div>
        </section>
      )}

      {/* ---- Unknown-concept teaching consent ----------------------------- */}
      {state.kind === 'TEACHING_CONSENT_REQUIRED' && (
        <section
          className="dk-ask"
          aria-labelledby="dk-offer-h"
          data-dk-ask="teaching"
          ref={askRegion}
          tabIndex={-1}
        >
          <h3 id="dk-offer-h">{UI.offerHeading}</h3>
          <p>{UI.offerBody}</p>
          <p className="dk-ask-field">
            <span className="dk-ask-field-label">What would be submitted</span>
            <span>{state.offer.description}</span>
          </p>
          <p className="dk-ask-note">{UI.offerNotStored}</p>
          <div className="dk-ask-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => void decideCandidate(state.offer, true)}
              disabled={state.submitting}
            >
              {UI.offerSubmit}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => void decideCandidate(state.offer, false)}
              disabled={state.submitting}
            >
              {UI.offerDecline}
            </button>
          </div>
        </section>
      )}

      {/* ---- Private context ---------------------------------------------
        THE ONLY PLACE STRUCTURAL EVIDENCE ENTERS THIS SYSTEM FROM A BROWSER.

        It is a disclosure, closed by default, and the conversation works with it
        untouched. That ordering is deliberate: a visitor who just wants to talk should
        never have to answer questions about their relationships first, and the feature
        should read as something they reach for rather than something asked of them.

        Every control below records a fact the visitor states. There is no parser here,
        no lexicon, and nothing that reads the transcript - the page cannot work out who
        anyone is, and does not try.
      */}
      {(state.kind === 'READY' ||
        state.kind === 'TURN_IN_PROGRESS' ||
        state.kind === 'TAV_DECISION_REQUIRED' ||
        state.kind === 'TEACHING_CONSENT_REQUIRED') && (
        <section className="dk-context" data-dk-context={contextOpen ? 'open' : 'closed'}>
          <button
            type="button"
            className="dk-context-toggle"
            aria-expanded={contextOpen}
            aria-controls="dk-context-body"
            data-dk-action="toggle-context"
            onClick={() => setContextOpen((open) => !open)}
          >
            {contextOpen ? UI.contextToggleClose : UI.contextToggleOpen}
            {entities.length > 0 && (
              <span className="dk-context-count">{entities.length}</span>
            )}
          </button>

          {contextOpen && (
            <div className="dk-context-body" id="dk-context-body">
              <h3 className="dk-context-heading">{UI.contextHeading}</h3>
              <p className="dk-context-intro">{UI.contextIntro}</p>
              <p className="dk-context-note">{UI.contextOptional}</p>
              <p className="dk-context-note">{UI.contextPrivacy}</p>

              {entities.length === 0 ? (
                <p className="dk-context-empty">{UI.contextEmpty}</p>
              ) : (
                <ul className="dk-context-list">
                  {entities.map((e) => (
                    <li key={e.id} className="dk-context-item" data-dk-entity={e.id}>
                      <div className="dk-context-item-head">
                        <span className="dk-context-name">
                          {e.label || UI.contextLabelField}
                          {/* Stated on every row, because it is the promise most worth
                              repeating where the name actually appears. */}
                          <span className="dk-context-never">{UI.contextNeverSent}</span>
                        </span>
                        <button
                          type="button"
                          className="dk-context-remove"
                          data-dk-action="remove-entity"
                          onClick={() => removeEntity(e.id)}
                        >
                          {UI.contextRemove}
                        </button>
                      </div>
                      <p className="dk-context-facts">
                        <code>{e.role}</code>
                        {e.kind && <code>{e.kind}</code>}
                      </p>
                      <label className="dk-context-include">
                        <input
                          type="checkbox"
                          checked={e.included}
                          data-dk-action="include-entity"
                          onChange={(ev) => toggleEntity(e.id, ev.target.checked)}
                        />
                        <span>{UI.contextInclude}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              <div className="dk-context-form">
                <div className="dk-context-field">
                  <label htmlFor="dk-entity-label">{UI.contextLabelField}</label>
                  <input
                    id="dk-entity-label"
                    type="text"
                    autoComplete="off"
                    value={entityLabel}
                    aria-describedby="dk-entity-label-hint"
                    onChange={(e) => setEntityLabel(e.target.value)}
                  />
                  <p className="dk-context-hint" id="dk-entity-label-hint">
                    {UI.contextLabelHint}
                  </p>
                </div>

                <div className="dk-context-field">
                  <label htmlFor="dk-entity-role">{UI.contextRoleField}</label>
                  {/*
                    A select over the CANONICAL enumerators, with no option selected
                    until the visitor picks one. There is no default relationship,
                    because a default here would be the page deciding something about
                    someone's life.
                  */}
                  <select
                    id="dk-entity-role"
                    value={entityRole}
                    aria-describedby="dk-entity-role-hint"
                    onChange={(e) => setEntityRole(e.target.value)}
                  >
                    <option value="">{UI.contextRolePlaceholder}</option>
                    {RELATIONSHIP_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <p className="dk-context-hint" id="dk-entity-role-hint">
                    {UI.contextRoleHint}
                  </p>
                </div>

                <div className="dk-context-field">
                  <label htmlFor="dk-entity-kind">{UI.contextKindField}</label>
                  <select
                    id="dk-entity-kind"
                    value={entityKind}
                    aria-describedby="dk-entity-kind-hint"
                    onChange={(e) => setEntityKind(e.target.value)}
                  >
                    <option value="">{UI.contextKindPlaceholder}</option>
                    {DEVICE_ENTITY_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {kind}
                      </option>
                    ))}
                  </select>
                  <p className="dk-context-hint" id="dk-entity-kind-hint">
                    {UI.contextKindHint}
                  </p>
                </div>

                <div className="dk-context-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    data-dk-action="add-entity"
                    onClick={addEntity}
                    disabled={!entityRole}
                  >
                    {UI.contextAdd}
                  </button>
                  {entities.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      data-dk-action="clear-context"
                      onClick={clearContext}
                    >
                      {UI.contextClear}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="dk-composer">
        <label className="dk-composer-label" htmlFor="dk-input">
          {UI.composerLabel}
        </label>
        <textarea
          id="dk-input"
          ref={composer}
          className="dk-input"
          rows={3}
          value={draft}
          placeholder={UI.placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={!composerEnabled}
          aria-describedby={composerDescribedBy}
        />
        {/*
          Rendered whenever the composer is not live, and it says WHY rather than leaving
          a greyed-out box to be interpreted. It is not hidden from assistive technology:
          it is the composer's own description.
        */}
        {blockedReason && (
          <p className="dk-composer-why" id="dk-composer-why">
            {blockedReason}
          </p>
        )}
        <div className="dk-composer-actions">
          <span className="dk-hint">Enter sends. Shift and Enter make a new line.</span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => void send()}
            disabled={!composerEnabled || draft.trim().length === 0}
          >
            {UI.send}
          </button>
        </div>
      </div>

      {turnstileSiteKey &&
        (state.kind === 'IDLE' || state.kind === 'TERMINATED' || state.kind === 'TERMINAL_FAILURE') && (
        <div className="dk-turnstile cf-turnstile" data-sitekey={turnstileSiteKey} />
      )}
    </div>
  );
}
