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
  leadingStatus: EvidenceStatus;
  establishedToday: string;
  nextGate: string;
  notYetEstablished: string;
}

export const RESEARCH_PROGRAMS: readonly ResearchProgram[] = [
  {
    id: 'machine-cognition',
    name: 'Machine Cognition',
    href: '/research/machine-cognition',
    pitch: 'Building AI that answers only from knowledge it can point to, and says "I don\'t know" instead of guessing.',
    question:
      'Can a system represent connected concepts explicitly, know which of its knowledge is established, and show what a task still requires?',
    summary:
      'Governed machine cognition: explicit knowledge records with their sources, fixed knowledge versions, and checks at defined points in every request.',
    overallStatus: 'active-development',
    leadingStatus: 'internally-tested',
    establishedToday: 'Governed request handling, sourced knowledge records, fixed knowledge versions and operator-only teaching.',
    nextGate: 'Understanding how the parts of a request relate, then matching them to established knowledge.',
    notYetEstablished:
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
    leadingStatus: 'internally-tested',
    establishedToday: 'Exact byte-for-byte reconstruction and identical output on repeated runs.',
    nextGate: 'A complete representation measurably smaller than its input on a declared test collection.',
    notYetEstablished: 'Net size reduction has not been demonstrated. The current development representation is larger than its input.',
  },
  {
    id: 'visual-and-audio',
    name: 'Visual and Audio',
    href: '/research/visual-and-audio',
    pitch: 'Describing images and sound in exact, repeatable structures that other systems can rely on.',
    question: 'Can images and sound be described in deterministic, structured forms that other systems can rely on?',
    summary: 'Early research into structured, repeatable representations of visual and acoustic information.',
    overallStatus: 'active-development',
    leadingStatus: 'internally-tested',
    establishedToday: 'Deterministic image-structure components on synthetic test images.',
    nextGate: 'The remaining image behaviours implemented, then results on real-world images.',
    notYetEstablished: 'No visual understanding, speech recognition or speech comprehension is claimed.',
  },
];

export function researchProgram(id: ResearchProgramId): ResearchProgram {
  const program = RESEARCH_PROGRAMS.find((candidate) => candidate.id === id);
  if (!program) throw new Error(`Unknown research program: ${id}`);
  return program;
}
