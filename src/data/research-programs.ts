import type { EvidenceStatus } from './evidence-status';

export type ResearchProgramId = 'data-representation' | 'machine-cognition' | 'visual-and-audio';

export interface ResearchProgram {
  id: ResearchProgramId;
  name: string;
  href: string;
  question: string;
  summary: string;
  overallStatus: EvidenceStatus;
  establishedToday: string;
  notYetEstablished: string;
}

export const RESEARCH_PROGRAMS: readonly ResearchProgram[] = [
  {
    id: 'machine-cognition',
    name: 'Machine Cognition',
    href: '/research/machine-cognition',
    question:
      'Can a system represent connected concepts explicitly, know which of its knowledge is established, and show what a task still requires?',
    summary:
      'Research into governed machine cognition: explicit knowledge records with provenance, fixed knowledge generations, and governance checks at defined points in every request.',
    overallStatus: 'active-development',
    establishedToday:
      'Governed request handling, explicit knowledge records and versioned knowledge snapshots pass internal tests.',
    notYetEstablished:
      'The full chain from a request to its concepts, relationships, missing knowledge and a supported answer has not been demonstrated end to end.',
  },
  {
    id: 'data-representation',
    name: 'Data Representation',
    href: '/research/data-representation',
    question:
      'Can data be represented deterministically, rebuilt exactly, accounted for completely, and made smaller where the data allows it?',
    summary:
      'The original ByteLite research program: deterministic lossless representation, aiming at exact reconstruction and complete accounting of every byte.',
    overallStatus: 'active-development',
    establishedToday:
      'Exact byte-for-byte reconstruction and deterministic operation pass internal tests. Complete accounting is measured for the current single-round format only.',
    notYetEstablished:
      'Net size reduction has not been demonstrated. The current development representation is larger than its input.',
  },
  {
    id: 'visual-and-audio',
    name: 'Visual and Audio Information',
    href: '/research/visual-and-audio',
    question: 'Can images and sound be described in deterministic, structured forms that other systems can rely on?',
    summary:
      'Early research into structured, repeatable representations of visual and acoustic information.',
    overallStatus: 'active-development',
    establishedToday:
      'Deterministic image-structure components pass internal tests on synthetic images. An audio architecture skeleton exists.',
    notYetEstablished: 'No visual understanding, speech recognition or speech comprehension is claimed.',
  },
];

export function researchProgram(id: ResearchProgramId): ResearchProgram {
  const program = RESEARCH_PROGRAMS.find((candidate) => candidate.id === id);
  if (!program) throw new Error(`Unknown research program: ${id}`);
  return program;
}
