/**
 * TEMPORARY bisect probe - delete once /api/contact is confirmed working in production.
 *
 * Deliberately has zero imports and zero logic. Its only job is to separate two hypotheses when
 * /api/contact returns FUNCTION_INVOCATION_FAILED:
 *
 *   health OK,  contact fails -> the fault is inside contact (its import or its code)
 *   health also fails          -> the fault is the /api function setup itself on this project
 *
 * Guessing between those without evidence is how you burn deploy cycles.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(
    JSON.stringify({
      ok: true,
      // Proves whether the three variables are visible to the runtime, WITHOUT revealing any
      // value: booleans only, and never the key itself.
      env: {
        SENDGRID_API_KEY: Boolean(process.env.SENDGRID_API_KEY),
        CONTACT_TO_EMAIL: Boolean(process.env.CONTACT_TO_EMAIL),
        CONTACT_FROM_EMAIL: Boolean(process.env.CONTACT_FROM_EMAIL),
      },
      node: process.version,
    })
  );
}
