# Live Deep Kore chat - local end-to-end proof

**Date:** 2026-09-01
**Scope:** LOCAL ONLY. Nothing was committed, pushed, deployed, tunnelled or exposed.
**Law:** `CLAUDE.md` section 19. **Runbook:** `OWNER_README.md` section 21.

This records what was actually observed, on this machine, against the real engine. It is not a
statement about production: production has no Deep Kore configuration, `DEEP_KORE_CHAT_PHASE` is
unset there, and the routes answer `503 chat_disabled`.

---

## 1. What was running

| Component | Build |
|---|---|
| `dk_session_worker.exe` | `Source/build/Debug/`, MSVC, from `Source/applications/dk_session_worker/main.cpp` |
| `deep_kore_gateway.exe` | `Workbench/deep_kore_gateway/bin/Release/net8.0-windows/win-x64/`, .NET 8 |
| Website routes | `api/deep-kore/{session,message,result/[jobId]}.ts` over `api/_lib/deep-kore-core.ts`, compiled and loaded by a scratchpad harness that also serves the real `dist/` build and the production CSP from `vercel.json` verbatim |

The harness stands in for `vercel dev` and adds nothing: it serves files and dispatches to the
same handler modules that deploy. Every value used to configure it was a local test value,
generated for this run and used nowhere else. **No secret value appears in this file, in either
repository, or in any log produced by this run.**

The gateway bound `http://127.0.0.1:<port>/` as the ordinary logged-in user with **no URL ACL
required**.

---

## 2. Deep Kore ctest - `test_public_chat_governed_path`

32 assertions, `0 failure(s)`, exit 0.

**Part A, the governed facade** (14 assertions). A governed turn is produced and stamped; both
Genesis gates record a decision; the stamp names the identity; **AIon runs through the same
facade and is separately stamped**; identical input produces byte-identical text and an identical
stamp; **Revelation Vanguard is OFF by default** and produces no warmed text and no diagnostic;
an unanswerable question still returns a governed, stamped result; a fresh session is unaffected
by another session's traffic.

**Part B, the DKW1 wire contract** (18 assertions), run against real worker processes with real
frames on real stdin. READY is emitted only after the engine is constructed; a TURN is answered
with the governance record; **two independent worker processes produce a byte-identical governed
turn**; an unrecognised identity is refused with a typed code and **the refusal frame carries no
`text` field at all**; four malformed frames produce **exactly four** errors and the stream stays
synchronised; the recovered turn is byte-identical to the same turn run alone, which also proves
the rejected frames never reached cognition; an unresynchronisable frame ends the stream rather
than guessing; an unknown header fails closed; the worker refuses any argument.

---

## 3. Website unit suite

`npx vitest run` - **106 tests before this work, 149 after**: 41 new endpoint-level tests for the
chat gateway, plus two added to `route-disposition.test.ts` for the route-scoped vocabulary rule.
They cover the fail-closed phase resolution, the
415/405/403/401 boundary, Turnstile refusal, session-cookie forgery, the CSRF pair, message-id
unforgeability, `turn_key` idempotency, transport-state mapping, the private-diagnostic
projection, the stamp redaction, and - asserted on every failure path - that a refusal returns a
bare machine code with no renderable prose.

---

## 4. The live browser proof

`npm run test:e2e:live` (`playwright test --config=playwright.live.config.ts`)

**27 passed** - 9 tests across Chromium, Firefox and Mobile Chrome.

The three parts each proved separately, and not inferred from one another:

| Fact | How it was established |
|---|---|
| The page reached the engine | A session opened and the composer became usable |
| Real cognition answered | A response appeared in the transcript, produced by the engine, carrying a governance record |
| Nothing was fabricated | With the message call aborted, the page showed an error and **no conversation entry**; with a `failed` job, the same |

Determinism was measured through the whole chain: two independent browser contexts, two
independent sessions, two independent worker processes, the same question, **identical answers**.

A full turn produced **no console errors and no Content-Security-Policy violation** under the
production CSP, which satisfies `CLAUDE.md` section 14's requirement that a CSP be validated in a
real browser against the real build. The Turnstile path could not be validated - it needs a site
key that does not exist yet - and that remains an owner step (`OWNER_README.md` section 21.6).

---

## 4b. The standard regression matrix, after the pass

```
  npm run build            PASS  18 pages
  npx vitest run           PASS  149/149
  npx astro check          PASS  0 errors / 0 warnings / 1 hint
  npx tsc --noEmit         PASS  0 errors
  npx eslint .             PASS  0 errors / 1 pre-existing warning
  npx playwright test      PASS  1645/1645, 5 engines, 43.6m, no retries, no flakes

  cmake -S Source -B Source\build          PASS  438 sources, 428 ctest tests
  test_public_chat_governed_path           PASS  32/32
  ctest -R 'vanguard|governed|governance'  PASS  6/6
```

No test was skipped, disabled, loosened or rerun to reach green. `/deep-kore` was added to the
route lists of `critical-paths`, `public-scope-vocabulary`, `public-scope-accessibility` and
`pricing-models`, so the new page is covered by the same guards as every other public route
rather than only by its own spec.

---

## 5. Two defects this proof found

### 5a. A false success on a failed session delete

`End and delete session` set an error message and then cleared it two lines later, so a DELETE
that never reached the server cleared the transcript and reported **"Session ended. It has been
discarded."** The session was still open upstream. That is a false success about the single thing
this page promises hardest.

It now reports the failure, keeps the transcript, and leaves the session open so ending it can be
retried. A live test asserts it.

### 5b. The governance stamp leaked internal state

**Only the live run showed this one.**

`toPublicTurn()` withheld the `state_hash` field. The stamp is a pipe-delimited string and it
carries the state fingerprint *inside* it, along with the policy and capability vocabulary. The
real stamp read

```
GOV_STAMP|gk=pass|iters=0|state_hash=<hex>|policy=<...>|caps=<...>|dm_stamp=|persona=AIYA
```

so showing it verbatim published exactly what the projection beside it was removing. Every static
check passed, because no static check ever saw a real stamp.

Fixed by `publicStamp()`, an **allowlist** over the stamp's segments keeping `GOV_STAMP`, `gk`
and `persona`. It is a redaction and not a rewrite: every surviving segment is the engine's own
bytes in the engine's own order. The observed public stamp is now

```
GOV_STAMP|gk=pass|persona=AIYA
```

The page's copy was corrected in the same pass to say that the rest of the stamp is internal,
rather than implying the whole stamp is shown. The unit-test fixture now uses the measured stamp
shape rather than an invented one - an invented stamp is what hid this.

---

## 6. What this proof does NOT establish

- **Nothing about production.** The chat is unconfigured there and answers 503.
- **Nothing about the tunnel or Cloudflare Access.** Neither exists. The harness reached the
  gateway directly on loopback, so the Access hop is untested end to end.
- **Nothing about Turnstile.** No keys exist. The server-side verification path is unit-tested
  with a stubbed provider; the widget has never been rendered.
- **Nothing about independent validation of Deep Kore itself.** That gate is open and the page
  says so.
- **Nothing about behaviour under concurrency or sustained load.** One session at a time, a
  handful of turns.
- **Nothing about abandoned sessions.** Every session in this run was ended cleanly. The gateway
  has no idle timeout and no reaper, so a session whose browser vanishes without warning holds a
  worker process until the gateway restarts. That is a real open limit, recorded in `CLAUDE.md`
  section 19 and `OWNER_README.md` section 21.10, and it must be settled before the phase reaches
  `public`.

---

## 7. Second pass, same day: owner decisions implemented

Owner decisions received after the first pass, and what each one became.

### 7.1 The session secret was approved, with a contract

`DEEP_KORE_SESSION_SECRET` is approved and required. Implemented and enforced:

- The session id is server-generated, cryptographically random and opaque - 24 bytes from
  `RandomNumberGenerator` at the gateway. The browser never chooses one.
- The cookie is authenticated with HMAC-SHA256 under this secret alone.
- **At least 32 characters**, enforced. A shorter value refuses to serve.
- **Distinct from every other credential**, enforced. If it equals the gateway token, either
  Access credential, or the Turnstile secret, the routes refuse to serve. That is the
  copy-paste mistake nothing else would catch.
- Absent means the routes answer `503`. There is no default.
- No `PUBLIC_` twin exists, so it cannot reach the browser bundle.

### 7.2 Cookies are now host-only and `__Host-` prefixed

`__Host-dk_session` (HttpOnly) and `__Host-dk_csrf`, both `Secure`, `SameSite=Strict`, `Path=/`,
**no `Domain`**. The prefix is enforcement, not decoration: a browser refuses to store a
`__Host-` cookie unless all three hold.

Unprefixed names are used only over plain http - local development - because `__Host-` requires
`Secure`. The reader accepts either and prefers the prefixed form; a deletion clears both, so a
connection that gains TLS cannot strand a stale cookie.

There is **no `Max-Age` and no `Expires`**. An absolute browser expiry would be a second lifetime
that could contradict the 30-minute terminal-idle policy and strand a visitor mid-conversation.
The authoritative lifetime is at the origin.

Observed locally over http, exactly as designed:

```
Set-Cookie: dk_session=<opaque>.<mac>; HttpOnly; Path=/; SameSite=Strict
Set-Cookie: dk_csrf=<token>; Path=/; SameSite=Strict
```

### 7.3 Terminal-idle reaping, and the guarantee it is not a deadline

Implemented in the gateway. `DEEP_KORE_SESSION_IDLE_SECONDS`, default **1800**.

The guarantee that it can never end cognition is structural, not a comment:
`Session.IsTerminallyIdle` checks for an active job **first** and returns false if there is one,
at any window **including zero**. The idle clock is restarted in `Complete` and `Fail` - the two
places where cognition actually returns its terminal result - so a turn that ran for an hour does
not leave its session instantly reapable. Every authenticated request calls `Touch()`. The clock
is `Stopwatch`-based, so a wall-clock adjustment cannot reap a live session.

Proven against a real gateway with the window set to **zero**, which is the condition under which
a session mid-turn would be reaped on the very next sweep if the guard were missing:

| Assertion | Result |
|---|---|
| a session with cognition in flight is never reaped, at any idle window | PASS |
| a terminally idle session is reaped | PASS |
| a session is not reaped before its idle window elapses (1800s, 32s of silence) | PASS |
| deleting a session closes its worker process, before the response is sent | PASS |
| a deleted session cannot be used again | PASS |
| one session cannot read another session's job | PASS |

### 7.4 `pagehide` deletion removed

The page no longer sends a DELETE on `pagehide`. It fires on ordinary navigation, a reload and a
back/forward-cache suspend - so treating it as deletion destroys sessions still in use - and it
does not fire on a crash, so the case it existed for is the one case it could not cover. Explicit
deletion and terminal-idle reaping are the two authoritative mechanisms. Live tests now assert
that a reload and a navigation both leave the upstream session intact and usable.

### 7.5 Log hygiene, audited before the disclosure was published

Audited against the owner's list - prompts, responses, cookies, session identifiers, bearer
credentials, `GOV_STAMP`, `state_hash`, private engine output. **Two things were changed:**

1. The gateway's reaper logged the **session id** of each session it ended. It now logs a count.
   An id in a log is a handle to a live conversation, and logs travel further than the process
   that wrote them.
2. The gateway now **drains and discards** the worker's stderr instead of leaving the pipe
   unread. That closes a latent deadlock - an unread pipe fills and the writer blocks - and
   guarantees worker output has no path into any log, because nothing ever inspects it.

Everything else already logged types and variable names only. A unit test drives a complete
successful turn and asserts that none of: the visitor's words, the engine's words, the session
id, the CSRF value, any credential, `GOV_STAMP`, `state_hash`, or the state fingerprint reached
any console channel.

### 7.6 A defect this pass found in the test suite itself

**The live suite leaked a worker process per test.** A three-engine run left **46 concurrent
workers**, and the next test failed with "the system could not be reached" - which reads exactly
like a product defect and was not one. The page's behaviour under that pressure was correct: an
honest failure and no fabricated conversation.

Fixed at the cause rather than by rerunning: the browser suite releases its session in
`afterEach` (unrouting first, or the two tests that deliberately sabotage the delete route would
sabotage their own cleanup), and the lifecycle suite deletes tracked sessions before killing a
gateway, because killing a gateway does not kill its workers. Measured after the fix: **0 workers
remaining** at the end of a full three-engine run.

**The explanation attached to that failure was wrong, and is corrected in section 9.** The leak
was real and fixing it was right; "the machine ran out of room" was asserted, not measured, and
the measurements taken afterwards do not support it.

### 7.7 Test results, second pass

```
  npm run build            PASS  18 pages
  npx vitest run           PASS  162/162      (was 149)
  npx astro check          PASS  0 errors / 0 warnings / 1 hint
  npx tsc --noEmit         PASS  0 errors
  npx eslint .             PASS  0 errors / 1 pre-existing warning
  npx playwright test      PASS  (see the dated snapshot in OWNER_README section 15)

  ctest -R vanguard|governed|governance     PASS  6/6
  test_public_chat_governed_path            PASS  32/32

  npm run test:e2e:live    PASS  51/51, 3 engines, 0 workers left behind
```

One unreproduced failure is recorded honestly rather than hidden: during an intermediate run,
`the visitor turn and the engine turn are both in the transcript, in order` failed once on
Chromium. It did not reproduce in two subsequent full runs, one of them a clean full run with
identical inputs, nor in an isolated run of that spec. It occurred immediately after leaked
workers had been force-killed underneath a long-running gateway, which is the most likely cause.
It was **not** rerun until green: the suite was changed so that a turn which fails now reports
the page's own error text instead of timing out with "expected 1, received 0", which would make
a recurrence diagnosable in one line.

---

## 8. Still open after the second pass

- **No cap on concurrent sessions.** Reaping bounds how long a session holds a process; nothing
  bounds how many exist. The 46-worker measurement above is the ceiling being real. Deliberately
  not guessed at: a concurrency limit is two policy decisions, not one - how many sessions the
  machine may hold, and what a visitor is told when it is full. Without the second, a full
  machine says "the system could not be reached", which describes an outage rather than capacity.
- Everything in section 6 that a local run cannot establish: production, the tunnel, Cloudflare
  Access, Turnstile, independent validation, and behaviour under sustained load.

---

## 9. Third pass: the capacity contract, and a correction I owe

### 9.1 A claim I made and then disproved

In section 7.6 I attributed a test failure to 46 leaked worker processes having exhausted the
machine. **That explanation does not survive measurement and is withdrawn.**

A worker is about **5 MB** of working set, **0.9 MB** private, and **4 threads** - Release and
Debug within half a megabyte of each other. Forty-six of them is roughly **270 MB and 184
mostly-idle threads** on a machine with **31.93 GB** and **12 logical processors**. That is not
close to a limit in any dimension I measured.

So: the leak was real, fixing it was right, and the suite now finishes at zero workers. But the
cause of the failure that followed it is **unknown**, and I stated it as though it were known. The
correction matters more than the original claim did, because an unproven cause repeated twice
becomes a fact nobody rechecks - and this one was on its way into two documents as the machine's
capacity ceiling.

The general rule is the site's own: an observation made during a failure is not a measurement of a
limit.

### 9.2 The capacity contract

`DEEP_KORE_MAX_SESSIONS`, required, **no production default**. Missing, zero, negative, malformed
or Int32-overflowing values all stop the gateway starting.

Admission is a **compare-and-swap reservation taken before a worker is spawned**. A slot is
released only when a worker has actually closed - explicit deletion or terminal-idle reaping - and
on the failure path where a reservation never became a worker. Nothing is evicted, no queue forms,
no retry is issued, and active cognition is never ended to make room.

Capacity and outage carry different public codes, `DEEP_KORE_SESSION_CAPACITY` and
`DEEP_KORE_UNAVAILABLE`, both `503`. The server sends the code only; the page renders the approved
wording. That preserves the invariant that a refusal carries no prose - checkable in a way "only
approved text" is not.

Proven at the gateway (9 tests) and at the website (5 tests):

| Assertion | Result |
|---|---|
| sessions up to the configured ceiling are admitted | PASS |
| the next session is refused **without spawning a worker** | PASS |
| existing sessions keep working while the host is full | PASS |
| 10 simultaneous creations against a ceiling of 3 admit exactly 3 | PASS |
| explicit deletion releases exactly one slot | PASS |
| terminal-idle reaping releases exactly one slot | PASS |
| a failed worker creation does not leak its slot | PASS |
| active cognition is never reaped to make room | PASS |
| capacity and outage produce different stable codes and wording | PASS |
| a refusal discloses no count, ceiling or machine detail | PASS |
| no retry, eviction, fallback or fabricated conversation | PASS |

### 9.3 Capacity evidence

Full measurements are in `OWNER_README.md` section 21.11. The three facts kept separate:

| | Value | Basis |
|---|---|---|
| Maximum sessions **held** | 46 | Observed once, accidentally, idle. Not a limit, not a recommendation. |
| Maximum simultaneous cognition turns **proven** | **3** | Directly measured; three turns submitted within a 12 ms spread, all three in flight when the first completed, all succeeded. |
| Maximum simultaneous cognition turns **advisable** | **Not established** | Would require a deliberate concurrency ramp, which was explicitly not run. |

The useful finding is that **memory is not the near-term constraint**. A session costs a process
spawn plus engine construction - 107 ms cold, 33-47 ms warm - and then almost nothing to hold. The
load is shaped by arrivals, not by concurrency. Nothing measured here says where that becomes a
problem, so nothing here sets the number.

No engine-owned shared resource was found: zero files written under `Data\`, zero in the worker
directory, no lock file, no shared store. Workers share only read-only code. OpenMP is OFF and
thread count does not move during a turn, so there is no per-worker thread multiplication.

---

## 10. Fourth pass: the closed error-code contract

Owner confirmation, 2026-09-01: the API response stays machine-readable and text-free, and the
website presentation layer exclusively maps each allowlisted code to its approved sentence.
Implemented as specified - plus one real defect the requirement exposed.

### 10.1 A violation found by checking rather than assuming

The failed-job branch forwarded the origin's own `error_code` straight to the browser:

```ts
error_code: typeof code === 'string' ? code : 'unknown'
```

That made an **arbitrary upstream string** part of this site's public surface. The gateway's values
happen to be bounded today, but one family of them (`worker_<code>`) is open-ended by construction,
so no allowlist here could ever have stayed complete. A buggy or hostile origin could have put
prose, markup, a source path or a credential-shaped string into it, and this site would have
rendered whatever arrived.

It now collapses to the single closed code `turn_failed`. What a visitor can act on is identical in
every case - the turn produced nothing - and the diagnostic detail stays where it is useful: the
origin's own log.

### 10.2 The closed union

`api/_lib/deep-kore-codes.ts` holds all twenty codes. It is a **dependency-free module on purpose**:
the browser has to share it, and importing the server core drags `node:crypto` into the client
bundle - which failed the build the first time it was tried, and is why the codes live in their own
file rather than beside the logic.

- `ERROR_COPY` is typed `Record<DeepKoreErrorCode, string>`, so a code with no approved sentence
  fails the TypeScript build. **Introducing that type immediately caught four codes with no wording
  at all** - `method_not_allowed`, `unsupported_media_type`, `bad_request`, `bad_job_id` - each of
  which would have shown a visitor a blank box. They are unreachable in normal use, which is
  precisely why nobody would have noticed.
- Every refusal is built by a typed constructor (`fail`, `failClearing`), so a code outside the
  union does not compile.
- The page calls `isErrorCode` before rendering, so an unrecognised value is never looked up and
  never echoed.

### 10.3 Verification

| Assertion | Result |
|---|---|
| every code in the closed set has an approved sentence | PASS |
| the mapping carries nothing outside the closed set | PASS |
| an upstream failure code is never forwarded - tested with prose, markup, a source path and a credential-shaped string | PASS |
| an unrecognised code is never rendered as text | PASS |
| a refusal carries a code and nothing else - no message, detail, text, reason or hint field | PASS |
| no `Retry-After` on either 503 | PASS |
| capacity and outage keep distinct codes and distinct wording | PASS |
| the two approved sentences are byte-exact | PASS |

### 10.4 Final totals

```
  npm run build            PASS  18 pages
  npx vitest run           PASS  172/172
  npx astro check          PASS  0 errors / 0 warnings / 1 hint
  npx tsc --noEmit         PASS  0 errors
  npx eslint .             PASS  0 errors / 1 pre-existing warning
  npx playwright test      PASS  1665/1665, 5 engines, 40.3m, 0 failures, 0 flaky

  ctest -R vanguard|governed|governance     PASS  6/6
  test_public_chat_governed_path            PASS  32/32
  npm run test:e2e:live                     PASS  78/78, 3 engines

  dk_session_worker processes after all suites : 0
  deep_kore_gateway processes after all suites : 0
```

No test was skipped, disabled, loosened, quarantined or rerun to reach green, and no genuine
failure was observed in this pass.
