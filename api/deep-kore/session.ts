/**
 * POST   /api/deep-kore/session   - start a private Deep Kore chat session
 * DELETE /api/deep-kore/session   - end it and discard its ephemeral state
 *
 * A Vercel Function beside the static Astro build, exactly like api/contact.ts. The
 * site is still `output: 'static'` with no adapter; nothing here converts any page to
 * SSR (site canon section 7 rule 9).
 *
 * All logic lives in api/_lib/deep-kore-core.ts. This file is translation only.
 */

import type { ServerResponse } from 'node:http';
import { readConfig, handleCreateSession, handleDeleteSession } from '../_lib/deep-kore-core.js';
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

  if (req.method === 'DELETE') {
    send(res, await handleDeleteSession(await toGatewayRequest(req), cfg));
    return;
  }

  methodNotAllowed(res, 'POST, DELETE');
}
