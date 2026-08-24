/**
 * TEMPORARY bisect probe - delete once /api/contact is confirmed working in production.
 *
 * Round 2. The first version proved the function runs and that the three expected names are
 * absent from process.env. That leaves two very different causes, and guessing between them
 * costs deploy cycles:
 *
 *   a) the variables exist but under different NAMES (typo, stray whitespace, wrong case)
 *   b) the variables are genuinely not in this deployment's environment (wrong project, wrong
 *      environment scope, or a branch filter that does not match)
 *
 * So it now also reports the NAMES of any environment variables that look related, plus a count
 * of how many are visible in total. Names only - never a value, never the key, and the matcher
 * is a tight allowlist rather than a dump of the environment.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

const RELATED = /^(SENDGRID|CONTACT|MAIL|SMTP|EMAIL)/i;

export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  const allNames = Object.keys(process.env);

  // Only names that look related to this feature, so this can never become a general dump of
  // the deployment's configuration.
  const relatedNames = allNames.filter((n) => RELATED.test(n)).sort();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(
    JSON.stringify({
      ok: true,
      // Presence of the three exact names the route reads. Booleans only.
      expected: {
        SENDGRID_API_KEY: Boolean(process.env.SENDGRID_API_KEY),
        CONTACT_TO_EMAIL: Boolean(process.env.CONTACT_TO_EMAIL),
        CONTACT_FROM_EMAIL: Boolean(process.env.CONTACT_FROM_EMAIL),
      },
      // If a name appears here that is not in `expected`, the variable exists under the wrong
      // name. If this array is empty, nothing related reached this deployment at all.
      relatedNamesPresent: relatedNames,
      totalEnvVarsVisible: allNames.length,
      // Which environment this deployment believes it is, which distinguishes a Production
      // variable from one that only landed in Preview.
      vercelEnv: process.env.VERCEL_ENV ?? '(unset)',
      vercelBranch: process.env.VERCEL_GIT_COMMIT_REF ?? '(unset)',
      commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? '(unset)').slice(0, 7),
      node: process.version,
    })
  );
}
