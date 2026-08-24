/**
 * PRODUCTION contact route.
 *
 * Canonical Vercel project: ByteLite_LLC / bytelite-website (CLI scope slug `bytelitellc`).
 * NOTE: this header previously named `bytelite-site`, an older project that no longer holds the
 * configuration. Do not treat a project name written in a comment as current - verify it, with
 * the commands in OWNER_README.md section 9.
 *
 * A zero-config Vercel Serverless Function at POST /api/contact - the path the form on /contact
 * already posts to, so no page changed. The site remains a static Astro build: this function
 * coexists with it rather than converting anything to SSR.
 *
 * All logic lives in api/_lib/contact-core.ts, so this file is only translation between Node's
 * req/res and the core. Nothing security-relevant is decided here.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleContact } from './_lib/contact-core.js';

/** Vercel augments IncomingMessage with a parsed body; it may still arrive raw. */
type VercelLikeRequest = IncomingMessage & { body?: unknown };

/**
 * Vercel parses application/json into req.body, but that is a convenience, not a guarantee - a
 * missing or unusual content-type leaves it a string or undefined. Handle every shape rather
 * than trusting one.
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
  // Fall back to reading the stream ourselves.
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
    // Guard against an oversized body: the core caps the message at 5000 chars, so anything
    // beyond a generous ceiling is not a legitimate submission.
    if (chunks.reduce((n, c) => n + c.length, 0) > 100_000) return null;
  }
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

/** Vercel sets x-forwarded-for; take the first hop, which is the client. */
function clientId(req: VercelLikeRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return raw?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

function send(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export default async function handler(
  req: VercelLikeRequest,
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    send(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  const body = await readJsonBody(req);

  const result = await handleContact(
    body,
    {
      // Read at request time, not module load, so a newly-set variable takes effect without a
      // cold-start dependency, and so a missing one is reported rather than captured as undefined.
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      toEmail: process.env.CONTACT_TO_EMAIL,
      fromEmail: process.env.CONTACT_FROM_EMAIL,
    },
    clientId(req)
  );

  send(res, result.status, result.body);
}
