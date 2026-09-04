/**
 * POST /api/deep-kore/consent - one visitor decision about one held teaching candidate.
 *
 * All logic lives in api/_lib/deep-kore-core.ts. This file is translation only.
 */

import type { ServerResponse } from 'node:http';
import { readConfig, handleCandidateDecision } from '../_lib/deep-kore-core.js';
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
  send(res, await handleCandidateDecision(await toGatewayRequest(req), readConfig()));
}
