import type { EvidenceStatus } from './evidence-status';

export const EVIDENCE_STAGES = ['Concept', 'Built', 'Tested in-house', 'Verified by others', 'In real use'] as const;

export type EvidenceStageIndex = 0 | 1 | 2 | 3 | 4;

const STAGE_REACHED_BY_STATUS: Record<EvidenceStatus, EvidenceStageIndex | null> = {
  'research-concept': 0,
  'not-yet-demonstrated': 0,
  'blocked-under-review': null,
  'active-development': 1,
  'implemented-unverified': 1,
  'internally-tested': 2,
  'internally-validated': 2,
  'independently-verified': 3,
  'production-qualified': 4,
};

export function evidenceStageReached(status: EvidenceStatus): EvidenceStageIndex | null {
  return STAGE_REACHED_BY_STATUS[status];
}
