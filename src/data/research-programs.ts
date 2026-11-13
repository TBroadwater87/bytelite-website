import type { EvidenceStatus } from './evidence-status';

export type ResearchProgramId = 'data-representation' | 'machine-cognition' | 'visual-and-audio';

export interface ResearchProgram {
  id: ResearchProgramId;
  name: string;
  href: string;
  pitch: string;
  question: string;
  summary: string;
  overallStatus: EvidenceStatus;
  furthestStatusReached: EvidenceStatus;
  demonstratedSoFar: string;
  designPossibility: string;
  nextObservableResult: string;
  notYetDemonstrated: string;
}

export const RESEARCH_PROGRAMS: readonly ResearchProgram[] = [
  {
    id: 'machine-cognition',
    name: 'Machine Cognition',
    href: '/research/machine-cognition',
    pitch: 'Building AI designed to answer only from knowledge it can point to, and to say "I don\'t know" rather than guess.',
    question:
      'Can a system represent connected concepts explicitly, know which of its knowledge is established, and show what a task still requires?',
    summary:
      'Governed machine cognition: explicit knowledge records with their sources, fixed knowledge versions, and checks at defined points in every request.',
    overallStatus: 'active-development',
    furthestStatusReached:'internally-tested',
    demonstratedSoFar:'Governed request handling, sourced knowledge records, fixed knowledge versions and operator-only teaching.',
    designPossibility: 'A system that answers only from knowledge it can trace, and states exactly what a task still needs.',
    nextObservableResult:'Understanding how the parts of a request relate, then matching them to established knowledge.',
    notYetDemonstrated:
      'The full chain from a request to its concepts, relationships, missing knowledge and a supported answer has not been demonstrated end to end.',
  },
  {
    id: 'data-representation',
    name: 'Data Representation',
    href: '/research/data-representation',
    pitch: 'Representing data so it rebuilds exactly, byte for byte, every time, with every byte accounted for.',
    question:
      'Can data be represented deterministically, rebuilt exactly, accounted for completely, and made smaller where the data allows it?',
    summary:
      'The original ByteLite research program: deterministic lossless representation, aiming at exact reconstruction and complete accounting of every byte.',
    overallStatus: 'active-development',
    furthestStatusReached:'internally-tested',
    demonstratedSoFar:'Exact byte-for-byte reconstruction and identical output on repeated runs.',
    designPossibility: 'Complete representations smaller than their input, where the data and the complete representation permit it.',
    nextObservableResult:'A complete representation measurably smaller than its input on a declared test collection.',
    notYetDemonstrated: 'Net size reduction has not been demonstrated. The current development representation is larger than its input.',
  },
  {
    id: 'visual-and-audio',
    name: 'Visual and Audio',
    href: '/research/visual-and-audio',
    pitch: 'Describing images and sound in exact, repeatable structures that other systems can rely on.',
    question: 'Can images and sound be described in deterministic, structured forms that other systems can rely on?',
    summary: 'Early research into structured, repeatable representations of visual and acoustic information.',
    overallStatus: 'active-development',
    furthestStatusReached:'internally-tested',
    demonstratedSoFar:'Deterministic image-structure components on synthetic test images.',
    designPossibility: 'Image and sound descriptions repeatable enough for other systems to rely on.',
    nextObservableResult:'The remaining image behaviours implemented, then results on real-world images.',
    notYetDemonstrated: 'No visual understanding, speech recognition or speech comprehension is claimed.',
  },
];

export function researchProgram(id: ResearchProgramId): ResearchProgram {
  const program = RESEARCH_PROGRAMS.find((candidate) => candidate.id === id);
  if (!program) throw new Error(`Unknown research program: ${id}`);
  return program;
}
