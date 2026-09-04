/**
 * The public Deep Kore surface - the single source of truth for anything /deep-kore
 * asserts, in the same way src/data/bytelite.ts is for ByteLite. Import these; never
 * restate one of these facts inline in a page, or the two will drift.
 *
 * WHAT MAY BE SAID HERE, AND WHAT MAY NOT
 * The site canon's IP rule applies unchanged: this page may say WHAT the system does
 * and never HOW. It names Genesis Goalkeeper and Revelation Vanguard because a visitor
 * being governed is entitled to know they are being governed and by what. It states
 * nothing about the rules either one applies, their ordering internals, their
 * thresholds, or anything a reader could use to work around them.
 *
 * The same discipline that governs ByteLite claims governs these: what the system does
 * today is separated from what it is being built toward, and neither is written as the
 * other.
 */

import type { DeepKoreErrorCode } from '../../api/_lib/deep-kore-codes';

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export const DEEP_KORE_NAME = 'Deep Kore';

/**
 * The conversational identity a public visitor speaks with.
 *
 * AIon is implemented and proven through the same governed path, but whether a second
 * identity appears on the public ByteLite site is an open owner decision, so exactly
 * one is exposed here. Adding the other is a copy change plus one allowlist entry -
 * not an architecture change.
 */
export const PUBLIC_IDENTITY = 'AIya';

export const LEAD = 'Talk with deterministic structural cognition.';

export const LEAD_SUB =
  "Deep Kore is ByteLite LLC's structural cognition system. It does not generate a " +
  'likely-sounding reply and then check it. It resolves what it can from structure it ' +
  'actually holds, and every response passes a governance gate before it is emitted.';

/**
 * WHO THE VISITOR IS TALKING TO, said once, at the top.
 *
 * AIya is an INTERFACE to Deep Kore, and the wording keeps that relationship intact in
 * both directions: it does not present AIya as a separate system, and it does not
 * present it as an independent authority on anything. Nothing here claims a mind, a
 * personality, an inner life or an opinion, because none of that is a property the
 * public path has or could demonstrate.
 */
export const PUBLIC_INTRO =
  'AIya is the public interface to Deep Kore. What you type reaches the real governed ' +
  'engine through this site, and what comes back is what the engine produced - not a ' +
  'summary of it, not a rewrite of it, and never a stand-in written by this website.';

/**
 * THE PUBLIC STATUS, IN ONE BLOCK.
 *
 * Deliberately one block and not a warning bolted onto every section. Scattering
 * qualifications is what buried the technology under its own disclaimer the last time,
 * and a reader who meets the same caution five times stops reading it the first time.
 *
 * The open claim gates are stated in WHAT_IT_IS_NOT and are not repeated here.
 */
export const PUBLIC_STATUS_HEADLINE = 'Where this stands today.';

export const PUBLIC_STATUS: string[] = [
  'This is the live system. Every response on this page is produced by Deep Kore and passed through unchanged, and there is no model behind it, beside it, or standing in for it.',
  'Sessions open only when ByteLite LLC has enabled them at the server. While they are not enabled, this page says so and nothing you type is sent anywhere.',
  'What is claimed here is what this public path has been tested to do. Deep Kore is a larger system than the interface on this page exposes, and none of the rest is claimed here.',
];

// ---------------------------------------------------------------------------
// What it is
// ---------------------------------------------------------------------------

export const WHAT_IT_IS: string[] = [
  'Deterministic. The same session, given the same input, produces the same response.',
  'Structural. Answers are resolved from structure the system holds, not sampled from a probability distribution over text.',
  'Governed at emission. Nothing reaches this page that has not passed the emission gate.',
  'Bounded to conversation. The public interface is chat and nothing else.',
];

/**
 * The boundary, stated without describing the replacement mechanism - the same rule
 * ByteLite's own IS_NOT list follows.
 */
export const WHAT_IT_IS_NOT: string[] = [
  'Not a large language model, and not a wrapper around one.',
  'Not a chatbot script, a decision tree, or a set of prepared answers.',
  'Not independently validated. That gate is open.',
  'Not production-qualified. That gate is open.',
  'Not a support agent. It cannot see your account, your order, or your messages to ByteLite LLC.',
  "Not able to act. It has no access to email, payments, files, repositories, this website's contents, or anything outside the conversation.",
];

// ---------------------------------------------------------------------------
// Governance
// ---------------------------------------------------------------------------

/**
 * Named, not explained. A visitor is entitled to know that a governance layer exists
 * and that it is not optional; the rules it applies are not published, here or
 * anywhere else.
 */
export const GOVERNANCE = {
  genesis: {
    name: 'Genesis Goalkeeper',
    says:
      'Every turn passes through Genesis Goalkeeper twice: once on the way in, and once on the ' +
      'response before it is emitted. A response that does not clear the second gate is not ' +
      'sent, and nothing is substituted for it.',
  },
  vanguard: {
    name: 'Revelation Vanguard',
    says:
      'Revelation Vanguard can shape the tone of a response after governance has already ' +
      'cleared it. It runs strictly afterwards and it cannot change what the response says, ' +
      'reach around the gate, or turn a refusal into an answer.',
  },
  // Deliberately says "part of" rather than implying the whole stamp is shown. The
  // engine's stamp also carries internal state that section 3 of the site canon forbids
  // publishing, so the page shows the segments that record the outcome and withholds the
  // rest. Overstating this would be a small lie about a governance artifact, which is
  // the worst kind of small lie to tell.
  stamp:
    'Each response carries a governance stamp recording that it passed. The part of it that ' +
    'records the outcome is shown with the response, because a claim that something was ' +
    'governed is worth less than the record of it. The rest of the stamp is internal and ' +
    'stays internal.',
} as const;

// ---------------------------------------------------------------------------
// Honest limits
// ---------------------------------------------------------------------------

/**
 * Stated up front rather than discovered. The failure modes here are unusual enough
 * that a visitor who is not told about them will read them as the system being broken.
 */
export const LIMITS: string[] = [
  'It answers from structure it holds. Where it holds nothing, it says so or asks, rather than producing a plausible sentence.',
  'It will decline. A refusal is the governance layer working, not an error.',
  'A turn runs until it is finished. There is no cutoff, so a hard question can take longer than a chat interface normally would.',
  'If the system cannot be reached, this page says exactly that. It never answers from somewhere else in the meantime.',
];

// ---------------------------------------------------------------------------
// Privacy
// ---------------------------------------------------------------------------

/**
 * The privacy statement is a description of how the system is built, not a promise
 * layered over it. The session lives in one process's memory; ending the session ends
 * the process; durable knowledge writes are structurally unavailable on this path
 * rather than switched off by policy.
 */
/**
 * THE APPROVED DISCLOSURE, VERBATIM.
 *
 * Owner-approved operational disclosure language, 2026-09-01. It is rendered on
 * `/deep-kore` and reproduced word for word on `/privacy`, and a test asserts both.
 * Do not paraphrase it, split it, soften it or extend it in a page - the two placements
 * must be identical, because a privacy statement that differs between the page making
 * the promise and the policy recording it is worse than one place saying nothing.
 *
 * If it needs to change, change it HERE, once.
 */
export const PRIVACY_DISCLOSURE =
  'Conversation state is temporary by default. ByteLite LLC uses an essential, secure ' +
  'session cookie to connect this browser to its active Deep Kore session. Chat content ' +
  'is processed in temporary service memory and is not retained as a central conversation ' +
  "history. The session is removed when you select 'End and delete session,' after 30 " +
  'minutes of completed inactivity, or when the temporary service restarts. Active Deep ' +
  'Kore cognition is not terminated by the inactivity policy. ByteLite LLC does not sell ' +
  'chat content or use it for advertising. Hosting and security providers may process ' +
  'limited data as necessary to operate and protect the service. Do not submit secrets, ' +
  'regulated information, or information you do not have authority to share.';

/**
 * The supporting points beside the disclosure. These add nothing the disclosure does
 * not already say - they restate the mechanism behind it, because "temporary by
 * default" is a claim and the reason it is true is what makes it checkable.
 */
export const PRIVACY: string[] = [
  "A session is ephemeral. It lives in one process's memory and is discarded when it ends.",
  "Nothing said here is written into Deep Kore's durable knowledge. That is a property of how this path is built, not a setting.",
  'Ending the session closes it at the server, and this page says so only once that has actually happened.',
  'An abandoned session is closed after its turn finishes and thirty minutes pass with no activity. A turn that is still running is never interrupted by that policy.',
  'ByteLite LLC does not use this conversation to contact you. Use the contact form for that.',
];

export const PRIVACY_HEADLINE = 'This conversation is not kept.';

/**
 * THE TWO CONSENT SURFACES, described on the page that carries them.
 *
 * Both are stated here rather than only in the interface, because a control that first
 * explains itself at the moment it appears gives a visitor no chance to decide how they
 * feel about it beforehand. Each says what the decision does and, more importantly, what
 * it does NOT do - a granted permission still transmits no value, and a submitted
 * candidate still teaches nothing.
 */
export const CONSENT_SURFACES: Array<{ heading: string; body: string }> = [
  {
    heading: 'A value you keep on this device',
    body:
      'Deep Kore can ask whether it may use a fact you hold privately - what kind of fact, ' +
      'never the fact itself. Anything you enter for that stays in this browser tab: it is ' +
      'not sent to this site, not written to your device, and not placed in the conversation. ' +
      'You can enter it, remove it, permit its use, or decline, and declining is the default ' +
      'until you press something. It is forgotten when the session ends, when you leave the ' +
      'page, and after the single turn you permitted.',
  },
  {
    heading: 'A concept Deep Kore did not recognise',
    body:
      'When something in your message is unrecognised, you may be offered the chance to submit ' +
      'it for review. Submitting stores an unverified candidate for ByteLite LLC to look at ' +
      'later. It does not teach Deep Kore anything, does not add anything to what Deep Kore ' +
      'knows, and does not make it true - only ByteLite LLC can act on a candidate, and ' +
      'nothing about the submission does that on its own. Your message text and the ' +
      'conversation are not stored with it. Declining stores nothing at all.',
  },
];

// ---------------------------------------------------------------------------
// Interface strings
// ---------------------------------------------------------------------------

export const UI = {
  start: 'Start a private session',
  starting: 'Starting...',
  end: 'End and delete session',
  ending: 'Ending...',
  send: 'Send',
  working: 'Working...',
  placeholder: 'Ask something.',
  humanCheckFirst: 'Complete the human check first.',
  stoppedWaiting: 'Stopped waiting. The turn is still running on the server.',
  retry: 'Try sending it again',
  // The disclosure label. It offers what the response actually came with - the record of
  // the gate it passed - and never a reconstruction of how the answer was reached.
  whyHeading: 'Why this response?',
  whyGatePassed: 'Passed the emission gate.',
  whyGateFailed: 'Did not record a pass at the emission gate.',
  whyStampLabel: 'Governance record',
  whyStampNote:
    "This is the part of the governance stamp that records the outcome, in the engine's " +
    'own bytes. The rest of the stamp is internal and stays internal.',
  whyNoProvenance:
    'Deep Kore returns no source list, no confidence score and no reasoning trace on this ' +
    'path, so none is shown. Nothing here is reconstructed by this website.',
  transcriptLabel: 'Conversation',
  composerLabel: 'Your message',
  idleNote:
    'No session is open. Starting one opens a private conversation that exists only while it is open.',
  endedNote: 'Session ended. It has been discarded.',
  failedNote: 'The session ended because it could not continue. Nothing was kept.',

  // ---- TAV: a permission request about a value that never leaves the device ----
  tavHeading: 'Deep Kore is asking about a value you kept on this device',
  tavLocalOnly:
    'Anything you marked private stays in this browser tab. It is not sent to this site, ' +
    'not stored on your device, and not written to the review queue. Deep Kore is asking ' +
    'only whether you permit it to use what kind of fact this is - never the value itself.',
  tavContinue: 'Continue without sending the value',
  tavDecline: 'Decline',
  tavDeclined: 'Declined. Nothing was evaluated and nothing was sent.',
  tavWithheld:
    'Permission noted. The value stayed on this device: this site never transmits a ' +
    'private value, so Deep Kore was told only that disclosure was withheld.',
  tavPrivateLabel: 'A private value, kept only in this tab',
  tavPrivateHint:
    'Optional. If you enter something here it stays in this browser tab only, and it is ' +
    'cleared when the session ends.',
  tavPrivateSave: 'Keep locally',
  tavNothingHeld:
    'Permission noted. Nothing of that kind was held on this device, so there was nothing ' +
    'to use and nothing was sent.',
  tavRevoke: 'Remove it from this tab',
  tavRevoked: 'Removed. Nothing was sent, and nothing is held any more.',
  tavHeld: 'Held in this tab only.',

  // ---- Unknown-concept teaching consent ----------------------------------
  offerHeading: 'Deep Kore did not recognise something in that message',
  offerBody:
    'You can submit it for review as an unverified candidate. Submitting does not make it ' +
    'true, does not teach Deep Kore anything, and does not add it to what Deep Kore knows. ' +
    'It is stored for the owner to review later, and nothing else happens.',
  offerNotStored:
    'Your message text and the conversation are not stored with it.',
  offerSubmit: 'Submit for review',
  offerDecline: 'Decline',
  offerSubmitted: 'Submitted for review.',
  offerDeclined: 'Declined. Nothing was stored.',

  // ---- Why the composer is unavailable, state by state --------------------
  //
  // A disabled control that does not say why is a dead end. There is one of these for
  // every state in which the composer is not live, and `composerBlockedReason` in the
  // console is an exhaustive switch, so a new state cannot be added without one.
  composerNoSession: 'Start a session to send a message.',
  composerStarting: 'The session is being opened.',
  composerTurnRunning: 'A turn is running. One message is handled at a time.',
  composerAwaitingTav:
    'Answer the question above first. Typing here cannot stand in for a decision you did not make.',
  composerAwaitingOffer: 'Choose whether to submit the candidate above first.',
  composerEnding: 'The session is being ended.',
  composerEnded: 'This session has ended. Start a new one to continue.',
  composerFailed: 'This session cannot continue. Start a new one.',
} as const;

/**
 * Public, human-readable copy for each machine error code the gateway can return.
 *
 * These are UI copy for a TRANSPORT outcome. None of them is a response, none is
 * attributed to Deep Kore, and none appears in the conversation transcript - they are
 * rendered as a distinct status region so a failure can never be read as an answer.
 */
/**
 * EXHAUSTIVE AT COMPILE TIME.
 *
 * `Record<DeepKoreErrorCode, string>` over the closed union in the gateway core means
 * TypeScript fails the build if a code exists with no approved sentence for it. A visitor
 * can therefore never be shown a blank, a raw identifier, or a code somebody forgot.
 *
 * The import is type-only and is erased at compile time, so `src/` gains no runtime
 * dependency on `api/` - only the obligation to stay in step with it, which is the point.
 */
export const ERROR_COPY: Record<DeepKoreErrorCode, string> = {
  // THE TWO OWNER-SPECIFIED MESSAGES, VERBATIM.
  //
  // Capacity and outage are different facts and must never share wording. A full
  // service described as an outage sends an operator hunting a fault that does not
  // exist, and tells a visitor the wrong thing about whether coming back will help.
  // Both say plainly that nothing was created and nothing was submitted, because the
  // first thing a refused visitor needs to know is that their message did not go
  // anywhere.
  DEEP_KORE_SESSION_CAPACITY:
    'Deep Kore is currently serving all available live sessions. No session was created ' +
    'and no message was submitted. Please return later.',
  DEEP_KORE_UNAVAILABLE:
    'Deep Kore is temporarily unavailable. No message was submitted.',

  chat_disabled: 'Live chat is not open at the moment.',
  not_configured: 'Live chat is not available right now.',
  origin_error: 'The request did not complete. Nothing was sent.',

  // These four should never reach a visitor: each one means the page sent something
  // malformed, which is a bug here rather than anything they did. They still need real
  // wording, because the alternative to an honest sentence is a blank box - and the
  // exhaustive mapping is what forces the question to be answered rather than skipped.
  method_not_allowed: 'Something went wrong in this page. Reload it and try again.',
  unsupported_media_type: 'Something went wrong in this page. Reload it and try again.',
  bad_request: 'Something went wrong in this page. Reload it and try again.',
  bad_job_id: 'Something went wrong in this page. Reload it and start a new session.',
  verification_failed: 'The human check did not pass. Reload the page and try again.',
  csrf_failed: 'This page went stale. Reload it and start a new session.',
  no_session: 'No session is open. Start one to continue.',
  session_expired: 'The session ended on the server. Start a new one.',
  session_busy: 'A turn is still running. Wait for it to finish.',
  message_too_large: 'That message is too long.',
  empty_text: 'Enter a message first.',
  unsupported_persona: 'That identity is not available.',
  no_such_job: 'That turn could not be found.',
  malformed_engine_result: 'The response could not be read. Nothing is shown rather than a guess.',
  // One closed code for every way a turn can fail to produce a result. The origin's own
  // diagnostics stay at the origin: they are open-ended, and what the visitor can act on is
  // the same in every case.
  turn_failed: 'The turn did not complete. Nothing is shown rather than a guess.',

  // TEACHING-CANDIDATE CONSENT. All three say the same load-bearing thing first -
  // the candidate was NOT submitted - because a visitor who consented needs to know
  // immediately that their consent did not take effect. There is no automatic retry
  // and no queued copy anywhere: nothing was written, so there is nothing pending.
  teaching_broker_unavailable:
    'The teaching candidate was not submitted, because the review queue is not reachable ' +
    'right now. Nothing was saved. The conversation can continue.',
  teaching_submission_refused:
    'The teaching candidate was not submitted. Nothing was saved. The conversation can continue.',
  teaching_candidate_unknown:
    'That teaching candidate is no longer available in this session, so nothing was submitted.',
};

// THERE IS DELIBERATELY NO GENERIC FALLBACK SENTENCE HERE ANY MORE.
//
// `ERROR_FALLBACK` was removed on 2026-09-04, once the transport boundary began
// returning a member of the closed code union on every path. With `ERROR_COPY` typed
// `Record<DeepKoreErrorCode, string>`, a code with no approved sentence fails the
// build - so a fallback has nothing left to catch, and keeping one would only invite
// a future path that reaches for it instead of choosing a code.
