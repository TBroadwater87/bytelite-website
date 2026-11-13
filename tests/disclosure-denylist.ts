import { readFileSync, existsSync } from 'node:fs';

export interface DisclosureDenylist {
  caseSensitiveNames: string[];
  caseInsensitiveTerms: string[];
  regularExpressions: RegExp[];
  serverSecretNames: string[];
  slugTerms: string[];
}

export const DISCLOSURE_DENYLIST_ENVIRONMENT_VARIABLE = 'BYTELITE_DISCLOSURE_DENYLIST';

export function loadDisclosureDenylist(): DisclosureDenylist {
  const denylistPath = process.env[DISCLOSURE_DENYLIST_ENVIRONMENT_VARIABLE];
  if (!denylistPath || !existsSync(denylistPath)) {
    throw new Error(
      `${DISCLOSURE_DENYLIST_ENVIRONMENT_VARIABLE} must name the private disclosure denylist file. The list is kept outside this public repository on purpose; disclosure tests cannot run without it.`,
    );
  }
  const parsed = JSON.parse(readFileSync(denylistPath, 'utf8')) as {
    caseSensitiveNames: string[];
    caseInsensitiveTerms: string[];
    regularExpressions: string[];
    serverSecretNames: string[];
    slugTermsForBuiltOutput?: string[];
  };
  const emptyRequiredLists = (['caseSensitiveNames', 'caseInsensitiveTerms', 'regularExpressions', 'serverSecretNames'] as const).filter((listName) => !parsed[listName]?.length);
  if (emptyRequiredLists.length) {
    throw new Error(`The disclosure denylist has no entries in: ${emptyRequiredLists.join(', ')}. An empty list would let every disclosure test pass vacuously.`);
  }
  return {
    caseSensitiveNames: parsed.caseSensitiveNames,
    caseInsensitiveTerms: parsed.caseInsensitiveTerms.map((term) => term.toLowerCase()),
    regularExpressions: parsed.regularExpressions.map((pattern) => new RegExp(pattern, 'i')),
    serverSecretNames: parsed.serverSecretNames,
    slugTerms: (parsed.slugTermsForBuiltOutput ?? []).map((term) => term.toLowerCase()),
  };
}

export function disclosureFindings(content: string, denylist: DisclosureDenylist): string[] {
  const lowerContent = content.toLowerCase();
  return [
    ...denylist.caseSensitiveNames.filter((name) => content.includes(name)).map((name) => `name "${name}"`),
    ...denylist.caseInsensitiveTerms.filter((term) => lowerContent.includes(term)).map((term) => `term "${term}"`),
    ...denylist.regularExpressions.filter((pattern) => pattern.test(content)).map((pattern) => `pattern ${pattern}`),
    ...denylist.serverSecretNames.filter((name) => content.includes(name)).map((name) => `secret name "${name}"`),
    ...denylist.slugTerms.filter((term) => lowerContent.includes(term)).map((term) => `slug "${term}"`),
  ];
}
