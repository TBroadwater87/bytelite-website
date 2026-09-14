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
    heading: 'Context you choose to give',
    body:
      'Deep Kore answers from structure. For some questions it needs to know how you are ' +
      'related to the person or place you are asking about, and it has no way to know that ' +
      'unless you say so - nothing is worked out from your messages. You can describe that ' +
      'relationship yourself, and it stays in your browser tab. The name you use for someone ' +
      'is never sent; what is sent is an anonymous reference and the relationship you chose. ' +
      'All of it is optional, and ordinary conversation works without any of it.',
  },
  {
    heading: 'A private value, if you decide to send one',
    body:
      'Having that context, Deep Kore may ask for one specific fact by name - a phone number, ' +
      'an address - because the answer has to state it back. You choose whether to send it. ' +
      'If you do, it is used for that one answer and then discarded: it is not stored, not ' +
      'shown in the conversation, and never written to the review queue. If you decline, ' +
      'nothing is sent and the conversation continues. Nothing is preselected, a permission ' +
      'covers one turn only, and a later question has to ask again.',
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

  // THE SESSION EXISTS AND IS NOT YET ABLE TO ANSWER.
  //
  // Protocol v1.2 accepts a session immediately and initializes it afterwards, because
  // the worker must load a canonical knowledge snapshot first. The wording says what is
  // actually happening and promises no duration: the site is not told one, the origin
  // does not guarantee one, and a countdown would be a number invented here.
  //
  // It must not say connected, ready, verified, or anything a visitor could read as
  // "AIya is listening now", because it is not - the composer is deliberately shut
  // until the origin itself reports ready.
  sessionInitializing:
    'Preparing a private session. Deep Kore is loading what it knows; this usually takes ' +
    'a few moments. You can type in the meantime, and you can cancel.',
  composerInitializing: 'The session is still being prepared. You can type; sending opens when it is ready.',
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

  // ---- PUBLIC TESSERACT ANCHORS ------------------------------------------
  //
  // Added 2026-09-09, when the corrected Deep Kore release began sending them. An anchor
  // says one thing: structural cognition settled a concept during this turn, inside this
  // session's own private overlay.
  //
  // THE COPY MUST NOT OVERSTATE IT. An anchor is not learning, not a fact accepted into
  // canonical knowledge, and not something that outlives the session - a public session
  // structurally cannot write to the shared knowledge base. Wording that implied Deep Kore
  // "learned" or "remembered" would describe a system this is deliberately not.
  //
  // The handle is shown because showing an opaque token is honest about what exists, and
  // because a visitor can see for themselves that it says nothing. It is truncated for
  // display only - the full value is present and carries no more meaning than the prefix,
  // since it is a hash salted with a secret that dies with the session.
  anchorsHeading: 'Structure settled during this turn',
  anchorsNote:
    'Deep Kore settled the structure of one or more ideas while working on this turn. Each ' +
    'is listed below as an opaque reference and nothing more: the reference cannot be turned ' +
    'back into the idea it stands for, means nothing outside this conversation, and stops ' +
    'meaning anything at all once the session ends.',
  anchorsNotLearning:
    'This is not learning. Nothing was added to what Deep Kore knows, nothing is kept after ' +
    'this session, and nothing here is shared with anyone else.',
  anchorLabel: 'Reference',
  transcriptLabel: 'Conversation',
  composerLabel: 'Your message',
  idleNote:
    'No session is open. Starting one opens a private conversation that exists only while it is open.',
  endedNote: 'Session ended. It has been discarded.',
  failedNote: 'The session ended because it could not continue. Nothing was kept.',

  // ---- TAV: a permission request about a value that never leaves the device ----
  tavHeading: 'Deep Kore is asking about a value you kept on this device',
  // CORRECTED 2026-09-04, because the previous sentence became false.
  //
  // It said a private value "is not sent to this site". That was true while a grant was
  // a permission and nothing more. The owner has now authorised the literal to cross on
  // an explicit grant, for one turn - so the copy says exactly that instead. A promise
  // the system no longer keeps is worse than no promise, and softening it would have
  // been worse still.
  tavLocalOnly:
    'What you keep here stays in this browser tab: it is not written to your device and ' +
    'not saved anywhere. Deep Kore has asked for one fact by name. If you send it, it is ' +
    'used for this one answer and then discarded - it is not stored, not shown in the ' +
    'conversation, and never written to the review queue. If you decline, nothing is sent.',
  tavContinue: 'Send it for this answer only',
  tavContinueWithout: 'Continue without sending it',
  tavDecline: 'Decline',
  tavDeclined: 'Declined. Nothing was evaluated and nothing was sent.',
  tavGranted:
    'Sent for that one answer, and cleared. It is no longer held in this tab, and a ' +
    'later question will have to ask you again.',
  tavPrivateLabel: 'A private value, kept only in this tab',
  tavPrivateHint:
    'Optional. It stays in this browser tab until you send it or remove it, and it is ' +
    'cleared when the session ends.',
  tavPrivateSave: 'Keep locally',
  tavNothingHeld:
    'Permission noted. Nothing of that kind was held on this device, so there was nothing ' +
    'to use and nothing was sent.',
  // REMOVING A HELD VALUE IS A LOCAL DELETION, AND THE NAMES SAY SO.
  //
  // These two used to be `tavRevoke` / `tavRevoked`. The visitor-facing sentences were
  // always accurate - they say "remove from this tab", never "revoke" - but the KEYS said
  // revocation, and so did the handler, the selector and the tests behind them. That was
  // a name promising something the protocol does not have.
  //
  // OWNER RULING 2026-09-07: revocation is not a wire-protocol concept. There is no
  // `TavDecision::REVOKED` in the certified release and none is to be added or expected.
  // What a visitor can actually do is delete the value before any disclosure is built -
  // and once a disclosure has been sent for its one turn, it cannot be called back.
  // Naming this "revoke" invited exactly that false belief.
  tavRemoveHeld: 'Remove it from this tab',
  tavRemovedHeld: 'Removed. Nothing was sent, and nothing is held any more.',
  tavHeld: 'Held in this tab only.',

  // ---- Private context: the visitor's own structural facts ----------------
  //
  // Every label here describes an act the VISITOR takes. There is deliberately no
  // wording anywhere in this block that suggests the page worked something out, noticed
  // something, or filled anything in - because it does none of those, and copy that
  // implied otherwise would be the first step toward code that did.
  contextHeading: 'Who or what you are asking about',
  contextToggleOpen: 'Add private context',
  contextToggleClose: 'Hide private context',
  contextIntro:
    'Deep Kore answers from structure. For some questions it needs to know how you are ' +
    'related to the person or place you are asking about, and it has no way to know that ' +
    'unless you say so. Nothing here is worked out from your messages.',
  contextOptional:
    'Entirely optional. Ordinary conversation works without any of this, and leaving it ' +
    'empty changes nothing about what you can ask.',
  contextPrivacy:
    'This stays in this browser tab. The name you use is for you: it is never sent - what ' +
    'is sent is an anonymous reference and the relationship you chose. All of it is ' +
    'cleared when the session ends or you leave the page.',
  contextLabelField: 'What you want to call them, just for you',
  contextLabelHint: 'Only you ever see this. It is not transmitted.',
  contextRoleField: 'How they are related to you',
  contextRoleHint: 'Required. This is the part Deep Kore actually uses.',
  contextRolePlaceholder: 'Choose one',
  contextKindField: 'What kind of thing they are',
  contextKindHint: 'Optional. Leave it unset if you would rather not say.',
  contextKindPlaceholder: 'Prefer not to say',
  contextAdd: 'Add to private context',
  contextAdded: 'Added. It is held in this tab only.',
  contextRemove: 'Remove',
  contextRemoved: 'Removed. Nothing about it is held any more.',
  contextClear: 'Clear all private context',
  contextCleared: 'Cleared. Nothing you described is held any more.',
  contextInclude: 'My next message is about this',
  contextEmpty: 'Nothing has been added. Conversation works without it.',
  contextNeverSent: 'Never sent',

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

  // A THIRD SERVICE STATE, KEPT SEPARATE FROM THE OTHER TWO FOR THE SAME REASON THEY ARE
  // SEPARATE FROM EACH OTHER.
  //
  // The origin refused because its own components disagree about which build they are, and
  // it will keep refusing until an operator redeploys matched binaries. Telling a visitor
  // to "return later" - the capacity sentence - would be untrue, and calling it temporary
  // unavailability would be a guess about a timeframe nobody has. So it says the honest
  // thing: not now, not by waiting, and the owner has been given something to fix.
  //
  // It names no binary, no commit, no component and no machine. A visitor learns the
  // service will not serve; which parts disagree stays at the origin.
  //
  // DRAFTED, NOT YET OWNER-APPROVED. The two sentences above it are owner-specified
  // verbatim; this one was written against the certified release's refusal and needs the
  // owner's sign-off with the privacy and terms wording before the phase is enabled.
  DEEP_KORE_PROVENANCE_MISMATCH:
    'Deep Kore is not accepting sessions because its components are mismatched. No session ' +
    'was created and no message was submitted. This will not clear on its own - it needs ' +
    'attention from ByteLite LLC.',

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
