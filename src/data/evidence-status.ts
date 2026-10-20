export type EvidenceStatus =
  | 'research-concept'
  | 'active-development'
  | 'implemented-unverified'
  | 'internally-tested'
  | 'internally-validated'
  | 'independently-verified'
  | 'production-qualified'
  | 'not-yet-demonstrated'
  | 'blocked-under-review';

export type EvidenceScope = 'none' | 'internal' | 'independent';

export type StatusTone = 'neutral' | 'progress' | 'tested' | 'verified' | 'caution';

export interface EvidenceStatusDefinition {
  status: EvidenceStatus;
  label: string;
  meaning: string;
  tone: StatusTone;
  evidenceScope: EvidenceScope;
}

export const EVIDENCE_STATUS_DEFINITIONS: readonly EvidenceStatusDefinition[] = [
  {
    status: 'research-concept',
    label: 'Research concept',
    meaning: 'A defined research question or intended capability. Nothing has been built for it yet.',
    tone: 'neutral',
    evidenceScope: 'none',
  },
  {
    status: 'active-development',
    label: 'Active development',
    meaning: 'Engineering work is under way. Any internal results so far are listed with the milestone; the milestone itself is not complete.',
    tone: 'progress',
    evidenceScope: 'internal',
  },
  {
    status: 'implemented-unverified',
    label: 'Implemented, unverified',
    meaning:
      'Software exists in the company source tree, but its required checks have not yet been completed and accepted.',
    tone: 'progress',
    evidenceScope: 'internal',
  },
  {
    status: 'internally-tested',
    label: 'Internally tested',
    meaning:
      'Automated tests written by ByteLite LLC pass for the stated scope. Nobody outside the company has checked the result.',
    tone: 'tested',
    evidenceScope: 'internal',
  },
  {
    status: 'internally-validated',
    label: 'Internally validated',
    meaning:
      'Tested, and the result has also been reviewed against written acceptance criteria inside the company. Still not independent.',
    tone: 'tested',
    evidenceScope: 'internal',
  },
  {
    status: 'independently-verified',
    label: 'Independently verified',
    meaning: 'Someone outside ByteLite LLC has reproduced the result under conditions they controlled.',
    tone: 'verified',
    evidenceScope: 'independent',
  },
  {
    status: 'production-qualified',
    label: 'Production qualified',
    meaning: 'Shown to be dependable enough to run real workloads for real users.',
    tone: 'verified',
    evidenceScope: 'independent',
  },
  {
    status: 'not-yet-demonstrated',
    label: 'Not yet demonstrated',
    meaning: 'An intended capability that has not been shown to work. It is a goal, not a result. Any partial internal results are listed with the milestone.',
    tone: 'neutral',
    evidenceScope: 'internal',
  },
  {
    status: 'blocked-under-review',
    label: 'Blocked / under review',
    meaning: 'Work is paused until an open engineering, governance or business decision is resolved.',
    tone: 'caution',
    evidenceScope: 'none',
  },
];

export function definitionOf(status: EvidenceStatus): EvidenceStatusDefinition {
  const definition = EVIDENCE_STATUS_DEFINITIONS.find((candidate) => candidate.status === status);
  if (!definition) throw new Error(`Unknown evidence status: ${status}`);
  return definition;
}

export const EVIDENCE_SCOPE_LABEL: Record<EvidenceScope, string> = {
  none: 'No evidence claimed',
  internal: 'Internal evidence only',
  independent: 'Independent evidence',
};
