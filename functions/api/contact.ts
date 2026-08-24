/**
 * Cloudflare Pages adapter for the contact route. NOT the production path.
 *
 * Production is Vercel (api/contact.ts) - www.thebytelite.com resolves to the Vercel project
 * `bytelite-site`, so this function is not currently serving traffic. It is kept as a working
 * alternative should hosting ever move, and because keeping both as thin adapters over one core
 * costs almost nothing.
 *
 * Every rule that matters lives in src/lib/contact-core.ts. This file is only translation
 * between the Workers Request/Response and the core.
 */

import { handleContact } from '../../src/lib/contact-core';

interface Env {
  /** Encrypted Pages secret. Never logged, never returned. */
  SENDGRID_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

function json(body: Record<string, unknown>, status: number, extraHeaders: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const clientId =
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  const result = await handleContact(
    body,
    {
      sendgridApiKey: env.SENDGRID_API_KEY,
      toEmail: env.CONTACT_TO_EMAIL,
      fromEmail: env.CONTACT_FROM_EMAIL,
    },
    clientId
  );

  return json(result.body, result.status);
};

/** Any other method on this path is a client error, not a 404 against a static asset. */
export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'POST') {
    return onRequestPost(context as Parameters<typeof onRequestPost>[0]);
  }
  return json({ error: 'Method not allowed. Use POST.' }, 405, { Allow: 'POST' });
};
