import { test, expect, type APIRequestContext } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import net from 'node:net';

const run = promisify(execFile);

/**
 * THE SESSION LIFECYCLE PROOF - terminal-idle reaping, and the guarantee that it can
 * never become a cognition deadline.
 *
 * Run only with `--config=playwright.live.config.ts`. Unlike the other live spec, this
 * one starts its OWN gateway on its own port with its own idle window, because the
 * behaviour under test is a function of that window and cannot be observed against a
 * gateway configured for production.
 *
 * WHY THE WINDOW IS SET TO ZERO HERE
 * Reaping at thirty minutes is not observable in a test, and waiting thirty minutes to
 * find out would be a worse test rather than a more honest one. The window is a
 * configured value, so the test configures it. Zero makes every TERMINALLY IDLE session
 * immediately eligible - which is exactly what makes the active-job guarantee provable:
 * with a zero window and a sweep every few hundred milliseconds, a session whose turn is
 * running would be reaped mid-cognition on the very next sweep if that protection were
 * absent. The turn completing is the proof.
 *
 * It requires three paths from the environment and FAILS, never skips, without them. A
 * lifecycle test that quietly passes because it never ran is worse than no test:
 *
 *   DEEP_KORE_GATEWAY_EXE   deep_kore_gateway.exe
 *   DEEP_KORE_WORKER_EXE    dk_session_worker.exe
 */

// A local test credential, generated for this file. It is not a default, is not real,
// and the gateway refuses to start without one of at least this length.
const TEST_TOKEN = 'live-lifecycle-test-token-not-a-secret-0123456789';

const GATEWAY_EXE = process.env.DEEP_KORE_GATEWAY_EXE ?? '';
const WORKER_EXE = process.env.DEEP_KORE_WORKER_EXE ?? '';

/** A free loopback port, so two gateways never collide. */
async function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      srv.close(() => resolvePort(port));
    });
  });
}

/** How many worker processes are alive. PowerShell, not a Unix utility. */
async function workerCount(): Promise<number> {
  const { stdout } = await run('powershell', [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    '@(Get-Process dk_session_worker -ErrorAction SilentlyContinue).Count',
  ]);
  return Number(stdout.trim()) || 0;
}

interface Gateway {
  url: string;
  proc: ChildProcess;
  /** Sessions this test created, so they can be released before the gateway dies. */
  sessions: string[];
}

/**
 * Shuts a test gateway down WITHOUT leaking worker processes.
 *
 * Killing the gateway does not kill its workers - they are separate processes, and the
 * gateway's own disposal never runs when it is killed. Every session must therefore be
 * deleted first, which is also the path that waits for each worker to exit. Skipping
 * this leaves a worker per session alive for the rest of the machine's uptime, and the
 * symptom is a later, unrelated test failing because the box has run out of room.
 */
async function stopGateway(api: APIRequestContext, gw: Gateway): Promise<void> {
  for (const id of gw.sessions) {
    try {
      await api.delete(`${gw.url}v1/sessions/${id}`, { headers: auth() });
    } catch {
      // Already gone - reaped, or deleted by the test itself.
    }
  }
  gw.proc.kill();
}

interface GatewayOptions {
  /**
   * The capacity ceiling for this gateway. A TEST INPUT and nothing else: production has
   * no default and the gateway refuses to start without a value, so a small number here
   * exercises the admission contract without ever becoming a fallback anywhere.
   */
  maxSessions?: number;
  /**
   * An executable to use INSTEAD of the real worker, to make worker creation fail. The
   * gateway exe serves: launched with no valid configuration it exits immediately, so it
   * never signals READY and the start throws exactly as a broken worker would.
   */
  workerPath?: string;
}

async function startGateway(idleSeconds: number, opts: GatewayOptions = {}): Promise<Gateway> {
  const port = await freePort();
  const url = `http://127.0.0.1:${port}/`;
  const proc = spawn(GATEWAY_EXE, [], {
    env: {
      ...process.env,
      DEEP_KORE_BIND_URL: url,
      DEEP_KORE_GATEWAY_TOKEN: TEST_TOKEN,
      DEEP_KORE_WORKER_PATH: opts.workerPath ?? WORKER_EXE,
      DEEP_KORE_SESSION_IDLE_SECONDS: String(idleSeconds),
      DEEP_KORE_MAX_SESSIONS: String(opts.maxSessions ?? 8),
      // A child gateway used as a fake worker must not inherit a bind URL, or it would
      // try to listen on the parent's port instead of failing.
      DEEP_KORE_CHILD_MARKER: '1',
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  // Drained and discarded, never asserted on: the gateway's stderr is an operator log,
  // and this suite must not start depending on its wording.
  proc.stderr?.resume();

  // Wait on the port, never a fixed sleep.
  const deadline = Date.now() + 30_000;
  for (;;) {
    if (Date.now() > deadline) throw new Error('gateway did not start');
    const up = await new Promise<boolean>((r) => {
      const s = net.connect(port, '127.0.0.1');
      s.once('connect', () => { s.destroy(); r(true); });
      s.once('error', () => r(false));
    });
    if (up) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  return { url, proc, sessions: [] };
}

function auth(sessionId?: string) {
  const h: Record<string, string> = { Authorization: `Bearer ${TEST_TOKEN}` };
  if (sessionId) h['X-DK-Session'] = sessionId;
  return h;
}

/** Attempts a session and returns the raw outcome, without asserting success. */
async function tryCreateSession(api: APIRequestContext, gw: Gateway) {
  const res = await api.post(`${gw.url}v1/sessions`, {
    headers: { ...auth(), 'Content-Type': 'application/json' },
    data: { persona: 'AIYA' },
  });
  const body = (await res.json()) as { session_id?: string; error_code?: string };
  if (body.session_id) gw.sessions.push(body.session_id);
  return { status: res.status(), body };
}

async function createSession(api: APIRequestContext, gw: Gateway): Promise<string> {
  const res = await api.post(`${gw.url}v1/sessions`, {
    headers: { ...auth(), 'Content-Type': 'application/json' },
    data: { persona: 'AIYA' },
  });
  expect(res.status(), 'session creation must succeed').toBe(201);
  const id = ((await res.json()) as { session_id: string }).session_id;
  // Recorded so stopGateway can release it even if the test fails partway.
  gw.sessions.push(id);
  return id;
}

/** Polls one job to a terminal transport state. No attempt cap. */
async function awaitTurn(api: APIRequestContext, base: string, sessionId: string, jobId: string) {
  for (;;) {
    const r = await api.get(`${base}v1/jobs/${jobId}`, { headers: auth(sessionId) });
    if (r.status() === 404) return { gone: true, state: '', body: {} as Record<string, unknown> };
    const body = (await r.json()) as Record<string, unknown>;
    const state = String(body.transport_state ?? '');
    if (state === 'succeeded' || state === 'failed') return { gone: false, state, body };
    await new Promise((res) => setTimeout(res, 100));
  }
}

test.beforeAll(() => {
  // Fail loudly rather than skip. See the header.
  expect(GATEWAY_EXE, 'DEEP_KORE_GATEWAY_EXE must be set for the lifecycle proof').not.toBe('');
  expect(WORKER_EXE, 'DEEP_KORE_WORKER_EXE must be set for the lifecycle proof').not.toBe('');
});

test.describe('terminal-idle reaping is resource cleanup, never a cognition deadline', () => {
  // THE ONE THAT MATTERS MOST.
  //
  // Idle window zero, sweeps running continuously, a real turn in flight. If the
  // active-job guard were missing, the session would be reaped between submitting the
  // message and reading the result, and the turn would be lost. It completing - and
  // returning a real governed answer - is the proof that no elapsed wall-clock time can
  // end a running process_governed_turn.
  test('a session with cognition in flight is never reaped, at any idle window', async ({ request }) => {
    const gw = await startGateway(0);
    try {
      const sessionId = await createSession(request, gw);
      const post = await request.post(`${gw.url}v1/sessions/${sessionId}/messages`, {
        headers: { ...auth(), 'Content-Type': 'application/json' },
        data: { message_id: 'lifecycle-active', text: 'What are you?' },
      });
      expect(post.status()).toBe(202);
      const jobId = ((await post.json()) as { job_id: string }).job_id;

      const result = await awaitTurn(request, gw.url, sessionId, jobId);
      expect(result.gone, 'the session was reaped while its turn was still running').toBe(false);
      expect(result.state).toBe('succeeded');

      const engine = result.body.engine as { text?: string } | undefined;
      expect(typeof engine?.text).toBe('string');
      expect((engine?.text ?? '').length).toBeGreaterThan(0);
    } finally {
      await stopGateway(request, gw);
    }
  });

  // The other half: once cognition HAS returned its terminal result and nothing else
  // happens, the session is eligible and is taken.
  test('a terminally idle session is reaped', async ({ request }) => {
    const gw = await startGateway(0);
    try {
      const sessionId = await createSession(request, gw);
      const post = await request.post(`${gw.url}v1/sessions/${sessionId}/messages`, {
        headers: { ...auth(), 'Content-Type': 'application/json' },
        data: { message_id: 'lifecycle-idle', text: 'What are you?' },
      });
      const jobId = ((await post.json()) as { job_id: string }).job_id;
      const done = await awaitTurn(request, gw.url, sessionId, jobId);
      expect(done.state).toBe('succeeded');

      // NOW GO GENUINELY QUIET, AND MEASURE ONCE.
      //
      // This used to poll every second with a real message submission until one came
      // back 404. That could only ever pass by winning a race, for two compounding
      // reasons: every authenticated request calls `Touch()`, so each probe restarted
      // the very clock the test was waiting on; and a probe SUBMITS A TURN, so the
      // session spent much of each interval with cognition in flight - a state that is
      // correctly never eligible for reaping. Reaping could therefore only happen if a
      // sweep landed in the gap between one turn completing and the next probe starting.
      // It failed on chromium in one run and firefox in the next, which is exactly what
      // that race looks like.
      //
      // The fix is the same reasoning the sibling test below already states: outlast more
      // than one sweep interval in real silence, then look ONCE. The wait is the
      // measurement, not a workaround for a race, so the timeout is raised to fit it
      // rather than the wait being shortened to fit the timeout.
      test.setTimeout(120_000);
      await new Promise((r) => setTimeout(r, 32_000));

      // A single probe, after the fact. At an idle window of zero, two full sweep
      // intervals of silence must have taken it.
      const probe = await request.get(`${gw.url}v1/jobs/${jobId}`, { headers: auth(sessionId) });
      expect(probe.status(), 'a terminally idle session was never reaped').toBe(404);
    } finally {
      await stopGateway(request, gw);
    }
  });

  // A production-shaped window must NOT reap a session that has merely been sitting for
  // a few seconds. Without this, a reaper that ignored its window entirely would pass
  // the test above.
  test('a session is not reaped before its idle window elapses', async ({ request }) => {
    // This test's cost is intrinsic: proving a sweep did NOT act means outlasting more
    // than one sweep interval, and the interval is 15 seconds. The wait below is the
    // measurement, not a workaround for a race, so the timeout is raised to fit it
    // rather than the wait being shortened to fit the timeout.
    test.setTimeout(120_000);
    const gw = await startGateway(1800);
    try {
      const sessionId = await createSession(request, gw);
      const post = await request.post(`${gw.url}v1/sessions/${sessionId}/messages`, {
        headers: { ...auth(), 'Content-Type': 'application/json' },
        data: { message_id: 'lifecycle-young', text: 'What are you?' },
      });
      const jobId = ((await post.json()) as { job_id: string }).job_id;
      expect((await awaitTurn(request, gw.url, sessionId, jobId)).state).toBe('succeeded');

      // Two full sweep intervals of silence. At a 30-minute window this must change
      // nothing at all.
      await new Promise((r) => setTimeout(r, 32_000));

      const still = await request.get(`${gw.url}v1/jobs/${jobId}`, { headers: auth(sessionId) });
      expect(still.status(), 'a young session was reaped early').toBe(200);
    } finally {
      await stopGateway(request, gw);
    }
  });
});

test.describe('explicit deletion is authoritative', () => {
  test('deleting a session closes its worker process', async ({ request }) => {
    const gw = await startGateway(1800);
    try {
      const before = await workerCount();

      const sessionId = await createSession(request, gw);
      const during = await workerCount();
      expect(during, 'creating a session must start a worker').toBeGreaterThan(before);

      const del = await request.delete(`${gw.url}v1/sessions/${sessionId}`, { headers: auth() });
      expect(del.status()).toBe(200);
      expect((await del.json()) as { deleted: boolean }).toEqual({ deleted: true });

      // The DELETE waits for the process to exit before it answers, so the count must
      // already be back by the time the response is read. That ordering is the whole
      // point: success is reported only after the session has actually closed.
      expect(await workerCount(), 'the worker outlived the response').toBe(before);
    } finally {
      await stopGateway(request, gw);
    }
  });

  test('a deleted session cannot be used again', async ({ request }) => {
    const gw = await startGateway(1800);
    try {
      const sessionId = await createSession(request, gw);
      await request.delete(`${gw.url}v1/sessions/${sessionId}`, { headers: auth() });

      const after = await request.post(`${gw.url}v1/sessions/${sessionId}/messages`, {
        headers: { ...auth(), 'Content-Type': 'application/json' },
        data: { message_id: 'after-delete', text: 'hello' },
      });
      expect(after.status()).toBe(404);
    } finally {
      await stopGateway(request, gw);
    }
  });

  test('one session cannot read another session job', async ({ request }) => {
    const gw = await startGateway(1800);
    try {
      const mine = await createSession(request, gw);
      const theirs = await createSession(request, gw);

      const post = await request.post(`${gw.url}v1/sessions/${mine}/messages`, {
        headers: { ...auth(), 'Content-Type': 'application/json' },
        data: { message_id: 'isolation', text: 'What are you?' },
      });
      const jobId = ((await post.json()) as { job_id: string }).job_id;

      const stolen = await request.get(`${gw.url}v1/jobs/${jobId}`, { headers: auth(theirs) });
      expect(stolen.status(), 'a job was readable by another session').toBe(404);

      await request.delete(`${gw.url}v1/sessions/${mine}`, { headers: auth() });
      await request.delete(`${gw.url}v1/sessions/${theirs}`, { headers: auth() });
    } finally {
      await stopGateway(request, gw);
    }
  });
});

// ============================================================================
// CAPACITY
// ============================================================================
//
// The ceiling is a MEASURED property of the machine the owner runs, and nothing here
// guesses it. Production has no default and the gateway refuses to start without a
// value. These tests inject a deliberately tiny number so the admission contract is
// observable in seconds; that injection is a test input and there is no code path by
// which it could become a production fallback, because there is no fallback path at all.
//
// What is proven here is the CONTRACT, not the number.

test.describe('capacity is bounded, atomic, and released only when a worker closes', () => {
  test('sessions up to capacity are admitted, and the next is refused', async ({ request }) => {
    const gw = await startGateway(1800, { maxSessions: 2 });
    try {
      const a = await tryCreateSession(request, gw);
      const b = await tryCreateSession(request, gw);
      expect(a.status, 'the first session must be admitted').toBe(201);
      expect(b.status, 'the second session must be admitted').toBe(201);

      const before = await workerCount();
      const third = await tryCreateSession(request, gw);

      expect(third.status).toBe(503);
      expect(third.body.error_code).toBe('session_capacity');
      // REFUSED BEFORE ANY RESOURCE IS COMMITTED. Capacity is decided before a worker is
      // spawned, never after - refusing afterwards would mean killing something that
      // already exists.
      expect(await workerCount(), 'a refused session still spawned a worker').toBe(before);
    } finally {
      await stopGateway(request, gw);
    }
  });

  test('sessions already running keep working while the host is full', async ({ request }) => {
    const gw = await startGateway(1800, { maxSessions: 1 });
    try {
      const mine = await createSession(request, gw);
      const refused = await tryCreateSession(request, gw);
      expect(refused.status).toBe(503);

      // The existing session is untouched: no eviction, no degradation, a real answer.
      const post = await request.post(`${gw.url}v1/sessions/${mine}/messages`, {
        headers: { ...auth(), 'Content-Type': 'application/json' },
        data: { message_id: 'at-capacity', text: 'What are you?' },
      });
      expect(post.status(), 'an existing session was disturbed by a refusal').toBe(202);
      const jobId = ((await post.json()) as { job_id: string }).job_id;
      const done = await awaitTurn(request, gw.url, mine, jobId);
      expect(done.state).toBe('succeeded');
      expect(typeof (done.body.engine as { text?: string } | undefined)?.text).toBe('string');
    } finally {
      await stopGateway(request, gw);
    }
  });

  // THE RACE. Ten simultaneous creations against a ceiling of three. A read-then-
  // increment admission would let several callers past the last slot at once; the
  // compare-and-swap cannot. Exactly three succeed, every time.
  test('simultaneous creations cannot race past the ceiling', async ({ request }) => {
    const gw = await startGateway(1800, { maxSessions: 3 });
    try {
      const attempts = await Promise.all(
        Array.from({ length: 10 }, () => tryCreateSession(request, gw))
      );
      const admitted = attempts.filter((a) => a.status === 201);
      const refused = attempts.filter((a) => a.status === 503);

      expect(admitted.length, 'more sessions were admitted than the ceiling allows').toBe(3);
      expect(refused.length).toBe(7);
      for (const r of refused) expect(r.body.error_code).toBe('session_capacity');
    } finally {
      await stopGateway(request, gw);
    }
  });

  test('explicit deletion releases exactly one slot', async ({ request }) => {
    const gw = await startGateway(1800, { maxSessions: 1 });
    try {
      const first = await createSession(request, gw);
      expect((await tryCreateSession(request, gw)).status).toBe(503);

      const del = await request.delete(`${gw.url}v1/sessions/${first}`, { headers: auth() });
      expect(del.status()).toBe(200);

      // Exactly one: the freed slot admits one session and no more.
      const second = await tryCreateSession(request, gw);
      expect(second.status, 'deletion did not release a slot').toBe(201);
      expect(
        (await tryCreateSession(request, gw)).status,
        'deletion released more than one slot'
      ).toBe(503);
    } finally {
      await stopGateway(request, gw);
    }
  });

  test('terminal-idle reaping releases exactly one slot', async ({ request }) => {
    test.setTimeout(120_000);
    const gw = await startGateway(0, { maxSessions: 1 });
    try {
      await createSession(request, gw);

      // Go quiet and wait for the sweep. Poll only for the outcome.
      const deadline = Date.now() + 60_000;
      let admitted = false;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1000));
        const attempt = await tryCreateSession(request, gw);
        if (attempt.status === 201) { admitted = true; break; }
        expect(attempt.body.error_code).toBe('session_capacity');
      }
      expect(admitted, 'reaping never released the slot').toBe(true);
      // And exactly one, not two.
      expect(
        (await tryCreateSession(request, gw)).status,
        'reaping released more than one slot'
      ).toBe(503);
    } finally {
      await stopGateway(request, gw);
    }
  });

  // A slot reserved for a worker that never started must come back. Otherwise every
  // failed engine start shrinks capacity by one, permanently, and the host quietly
  // becomes unable to serve anyone without anything looking wrong.
  test('a failed worker creation does not leak its slot', async ({ request }) => {
    // The gateway executable stands in for the worker: launched without valid
    // configuration it exits immediately, so it never signals READY and the start fails
    // exactly as a broken worker would.
    const gw = await startGateway(1800, { maxSessions: 1, workerPath: GATEWAY_EXE });
    try {
      const first = await tryCreateSession(request, gw);
      expect(first.status).toBe(503);
      expect(
        first.body.error_code,
        'a broken worker must read as unavailable, not capacity'
      ).toBe('engine_unavailable');

      // If the slot had leaked, this would now be a CAPACITY refusal. It must still be
      // an availability one - the distinction is the whole test.
      const second = await tryCreateSession(request, gw);
      expect(second.status).toBe(503);
      expect(
        second.body.error_code,
        'the failed start consumed a slot permanently'
      ).toBe('engine_unavailable');
    } finally {
      await stopGateway(request, gw);
    }
  });

  // Capacity must never be found by ending someone's turn.
  test('active cognition is never reaped to make room', async ({ request }) => {
    const gw = await startGateway(0, { maxSessions: 1 });
    try {
      const mine = await createSession(request, gw);
      const post = await request.post(`${gw.url}v1/sessions/${mine}/messages`, {
        headers: { ...auth(), 'Content-Type': 'application/json' },
        data: { message_id: 'capacity-vs-cognition', text: 'What are you?' },
      });
      expect(post.status()).toBe(202);
      const jobId = ((await post.json()) as { job_id: string }).job_id;

      // Hammer the full host while the turn runs. Every attempt must be refused, and
      // none of them may cost the running turn anything.
      const pressure = Promise.all(Array.from({ length: 5 }, () => tryCreateSession(request, gw)));
      const result = await awaitTurn(request, gw.url, mine, jobId);
      const attempts = await pressure;

      expect(result.gone, 'the running turn was reaped to free capacity').toBe(false);
      expect(result.state).toBe('succeeded');
      for (const a of attempts) {
        expect(a.status, 'an eviction admitted a session it should have refused').toBe(503);
        expect(a.body.error_code).toBe('session_capacity');
      }
    } finally {
      await stopGateway(request, gw);
    }
  });

  test('a capacity refusal discloses nothing about the host', async ({ request }) => {
    const gw = await startGateway(1800, { maxSessions: 1 });
    try {
      await createSession(request, gw);
      const res = await request.post(`${gw.url}v1/sessions`, {
        headers: { ...auth(), 'Content-Type': 'application/json' },
        data: { persona: 'AIYA' },
      });
      const raw = await res.text();
      expect(JSON.parse(raw)).toEqual({ error_code: 'session_capacity' });
      // No counts, no ceiling, no machine detail, and nothing renderable as an answer.
      expect(raw).not.toMatch(/max|capacity_remaining|owned|cpu|memory|host|"text"/i);
    } finally {
      await stopGateway(request, gw);
    }
  });
});
