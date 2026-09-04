/**
 * GET /api/deep-kore/result/[jobId] - read one turn's transport state.
 *
 * The four states this can report - queued, running, succeeded, failed - are the
 * origin's TRANSPORT states. Deep Kore itself has no nonterminal conversational
 * state: process_governed_turn() is synchronous and total, so cognition is complete
 * the moment it returns. This route never invents an engine state and never renders a
 * transport failure as something Deep Kore said.
 *
 * All logic lives in api/_lib/deep-kore-core.ts. This file is translation only.
 */

import type { ServerResponse } from 'node:http';
import { readConfig, handleResult } from '../../_lib/deep-kore-core.js';
import {
  toGatewayRequest,
  send,
  methodNotAllowed,
  type VercelLikeRequest,
} from '../../_lib/deep-kore-http.js';

/**
 * Vercel populates `req.query.jobId` from the `[jobId]` path segment, but the URL is
 * the authority: parsing the path ourselves keeps this route correct under any host
 * that does not add that convenience, and the core validates the token either way.
 */
function jobIdOf(req: VercelLikeRequest): string | undefined {
  const fromQuery = req.query?.['jobId'];
  const q = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
  if (q) return q;

  const path = (req.url ?? '').split('?')[0] ?? '';
  const last = path.split('/').filter(Boolean).pop();
  return last ? decodeURIComponent(last) : undefined;
}

export default async function handler(
  req: VercelLikeRequest,
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'GET') {
    methodNotAllowed(res, 'GET');
    return;
  }
  send(res, await handleResult(await toGatewayRequest(req, jobIdOf(req)), readConfig()));
}
