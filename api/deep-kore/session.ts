/**
 * POST   /api/deep-kore/session   - start a private Deep Kore chat session
 * GET    /api/deep-kore/session   - report whether it has finished initializing
 * DELETE /api/deep-kore/session   - end it and discard its ephemeral state
 *
 * GET is a METHOD on this route rather than a fifth Deep Kore endpoint, because canon
 * section 8 closes the list of server routes this site has and a status read is another
 * question about the session the caller already holds, not a new capability.
 *
 * A Vercel Function beside the static Astro build, exactly like api/contact.ts. The
 * site is still `output: 'static'` with no adapter; nothing here converts any page to
 * SSR (site canon section 7 rule 9).
 *
 * All logic lives in api/_lib/deep-kore-core.ts. This file is translation only.
 */

import type { ServerResponse } from 'node:http';
import {
  readConfig,
  handleCreateSession,
  handleSessionStatus,
  handleDeleteSession,
} from '../_lib/deep-kore-core.js';
import {
  toGatewayRequest,
  send,
  methodNotAllowed,
  type VercelLikeRequest,
} from '../_lib/deep-kore-http.js';

export default async function handler(
  req: VercelLikeRequest,
  res: ServerResponse
): Promise<void> {
  const cfg = readConfig();

  if (req.method === 'POST') {
    send(res, await handleCreateSession(await toGatewayRequest(req), cfg));
    return;
  }

  if (req.method === 'GET') {
    send(res, await handleSessionStatus(await toGatewayRequest(req), cfg));
    return;
  }

  if (req.method === 'DELETE') {
    send(res, await handleDeleteSession(await toGatewayRequest(req), cfg));
    return;
  }

  methodNotAllowed(res, 'POST, GET, DELETE');
}
