/**
 * Node request/response translation for the Deep Kore chat routes.
 *
 * This module knows about IncomingMessage and ServerResponse; deep-kore-core.ts
 * deliberately does not, exactly as contact-core.ts does not. Nothing
 * security-relevant is decided here - it extracts what the core asked for and writes
 * back what the core returned.
 *
 * It exists as its own file rather than being copied into each route because there
 * are three route files sharing one translation, and three copies of a body reader
 * and a client-address rule is three places for them to drift apart.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { GatewayRequest, GatewayResponse } from './deep-kore-core.js';
import { MAX_MESSAGE_BYTES } from './deep-kore-core.js';

/** Vercel augments IncomingMessage with a parsed body and query; both may be absent. */
export type VercelLikeRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

function first(v: string | string[] | undefined): string | undefined {
  return (Array.isArray(v) ? v[0] : v) ?? undefined;
}

/**
 * The client address, for Turnstile's optional `remoteip` only.
 *
 * `x-forwarded-for` is deliberately not trusted: its first hop is whatever the caller
 * sent. `x-vercel-forwarded-for` and `x-real-ip` are set by the platform on the way in
 * and cannot be forged by the request; the socket address keeps this honest off it.
 */
export function clientIp(req: VercelLikeRequest): string | undefined {
  const hop = (v: string | string[] | undefined): string | undefined =>
    first(v)?.split(',')[0]?.trim() || undefined;

  return (
    hop(req.headers['x-vercel-forwarded-for']) ??
    hop(req.headers['x-real-ip']) ??
    req.socket?.remoteAddress ??
    undefined
  );
}

/**
 * True unless the request demonstrably arrived over plain http, which in practice
 * means local development. Cookies are Secure everywhere else.
 */
function isSecure(req: VercelLikeRequest): boolean {
  const proto = first(req.headers['x-forwarded-proto'])?.split(',')[0]?.trim();
  if (proto) return proto === 'https';
  return Boolean((req.socket as { encrypted?: boolean } | undefined)?.encrypted);
}

/**
 * Vercel parses application/json into req.body, but that is a convenience, not a
 * guarantee. Handle every shape rather than trusting one.
 */
async function readJsonBody(req: VercelLikeRequest): Promise<unknown> {
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  // The ceiling is the message ceiling plus room for the rest of the envelope, so an
  // oversized body is dropped at the socket instead of being buffered and then
  // rejected. It is not a cognition limit; it bounds one HTTP read.
  const cap = MAX_MESSAGE_BYTES + 4096;
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer);
    total += buf.length;
    if (total > cap) return null;
    chunks.push(buf);
  }
  if (chunks.length === 0) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

/** Builds the core's request view. `jobId` is supplied by the route that has one. */
export async function toGatewayRequest(
  req: VercelLikeRequest,
  jobId?: string
): Promise<GatewayRequest> {
  return {
    contentType: first(req.headers['content-type']) ?? '',
    cookieHeader: first(req.headers['cookie']),
    csrfHeader: first(req.headers['x-dk-csrf']),
    body: await readJsonBody(req),
    clientIp: clientIp(req),
    jobId,
    // Both are browser- and platform-populated and are compared only against each
    // other. `x-forwarded-host` is preferred where the platform sets it, because behind
    // a proxy `host` can be the internal address while the browser's Origin names the
    // public one - comparing those two would refuse every legitimate request.
    origin: first(req.headers['origin']),
    host: first(req.headers['x-forwarded-host']) ?? first(req.headers['host']),
    secure: isSecure(req),
  };
}

export function send(res: ServerResponse, result: GatewayResponse): void {
  res.statusCode = result.status;
  res.setHeader('Content-Type', 'application/json');
  // Never cached. A conversational turn belongs to one visitor and one session, and a
  // shared cache holding a governed response would hand it to somebody else.
  res.setHeader('Cache-Control', 'no-store');
  if (result.cookies.length > 0) res.setHeader('Set-Cookie', result.cookies);
  res.end(JSON.stringify(result.body));
}

export function methodNotAllowed(res: ServerResponse, allow: string): void {
  res.setHeader('Allow', allow);
  send(res, { status: 405, body: { error_code: 'method_not_allowed' }, cookies: [] });
}
