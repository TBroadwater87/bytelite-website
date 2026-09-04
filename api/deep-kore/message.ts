/**
 * POST /api/deep-kore/message - submit one turn.
 *
 * Answers 202 with a job id, never a response. The turn is handed to the Deep Kore
 * origin, which runs it to intrinsic completion in its own process; the page then
 * polls /api/deep-kore/result. That is what keeps Vercel's request duration out of
 * the engine's halting conditions entirely.
 *
 * All logic lives in api/_lib/deep-kore-core.ts. This file is translation only.
 */

import type { ServerResponse } from 'node:http';
import { readConfig, handleMessage } from '../_lib/deep-kore-core.js';
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
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST');
    return;
  }
  send(res, await handleMessage(await toGatewayRequest(req), readConfig()));
}
