import type { APIRoute } from 'astro';

const submissionLog: Array<{ id: string; prompt: string; ts: number; ip: string }> = [];
const RATE_LIMIT_MAP = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_PROMPT_LEN = 500;

function fnv32(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function getIp(req: Request): string {
  return (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0]?.trim() ?? 'unknown';
}

function checkRate(ip: string): boolean {
  const now = Date.now();
  const rec = RATE_LIMIT_MAP.get(ip);
  if (!rec || now > rec.reset) {
    RATE_LIMIT_MAP.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (rec.count >= MAX_PER_WINDOW) return false;
  rec.count++;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  const ip = getIp(request);

  if (!checkRate(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 submissions per minute.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { prompt?: unknown };
  try {
    body = await request.json() as { prompt?: unknown };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const raw = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!raw || raw.length < 2) {
    return new Response(JSON.stringify({ error: 'Prompt is required (minimum 2 characters).' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (raw.length > MAX_PROMPT_LEN) {
    return new Response(JSON.stringify({ error: `Prompt exceeds ${MAX_PROMPT_LEN} character limit.` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = `dk-${fnv32(raw + Date.now())}`;
  submissionLog.push({ id, prompt: raw, ts: Date.now(), ip });

  return new Response(
    JSON.stringify({
      status: 'queued',
      id,
      message: 'Prompt logged. Deep Kore research is in private development and not publicly deployed.',
    }),
    { status: 202, headers: { 'Content-Type': 'application/json' } }
  );
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      status: 'private-research',
      public_api: false,
      message: 'Deep Kore research is in private development. No public API is available.',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
