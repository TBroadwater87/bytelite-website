// Canonical data for the public research program (/research and its subpages).
//
// This module holds only what the research pages state about themselves: publication metadata,
// the one canonical conceptual figure, the maturity separation between implemented work and
// research hypothesis, the evidence vocabulary, and the bibliography. Project-level status and
// capability claims are never restated here - those come from ./projects so that Current Status
// stays the single source of truth (see the maturity table's `implemented` column, which is
// deliberately written as pointers into the canonical project records rather than as new claims).

import { ALL_TECHNOLOGIES, type ProjectRecord } from './projects';

export const RESEARCH_ROUTES = {
  landing: '/research',
  thesis: '/research/deterministic-structural-cognition',
  plainEnglish: '/research/plain-english',
} as const;

export interface PublicationMetadata {
  title: string;
  subtitle: string;
  organization: string;
  publicationType: string;
  version: string;
  /** ISO date of the website change that published this version. */
  publicationDate: string;
  /** Same date, spelled for display. */
  publicationDateDisplay: string;
  researchStatus: string;
  peerReview: string;
  independentVerification: string;
  disclosure: string;
}

export const RESEARCH_PUBLICATION: PublicationMetadata = {
  title: 'Deterministic Structural Cognition',
  subtitle: 'Reversible Structure, Verified Invariant Learning, and Computational World Models',
  organization: 'ByteLite LLC',
  publicationType: 'Public Research Thesis',
  version: '1.0',
  publicationDate: '2026-08-20',
  publicationDateDisplay: 'August 20, 2026',
  researchStatus: 'Conceptual architecture with implemented supporting research components',
  peerReview: 'Not peer reviewed',
  independentVerification: 'Not yet independently verified',
  disclosure: 'Proprietary implementation mechanisms intentionally omitted',
};

// ---------------------------------------------------------------------------------------------
// The one canonical conceptual figure. Used on the research landing page and once inside the
// thesis. Deliberately a single progression rather than several near-duplicate flow diagrams.
// ---------------------------------------------------------------------------------------------

export interface ProgressionStage {
  label: string;
  /** One sentence, readable on its own - this doubles as the accessible text equivalent. */
  description: string;
}

export const STRUCTURAL_PROGRESSION: ProgressionStage[] = [
  { label: 'Observation', description: 'Something is recorded from a source: a file, an image, a message, a sensor reading.' },
  { label: 'Relationship', description: 'The observation is expressed as explicit, exact relationships rather than as an isolated measurement.' },
  { label: 'Structure', description: 'Relationships that hold together are organized into a representation that can be inspected and reconstructed.' },
  { label: 'Invariant', description: 'A pattern that recurs across structures is isolated as a candidate reusable form.' },
  { label: 'Law', description: 'A candidate is promoted only once the evidence standard required by its domain has been satisfied.' },
  { label: 'Model', description: 'Verified laws compose into a smaller description that still preserves what a task requires.' },
  { label: 'Prediction', description: 'A governed transition law is applied forward to state that has not yet been observed.' },
  { label: 'Simulation', description: 'Prediction is applied repeatedly, carrying unknowns and uncertainty forward rather than discarding them.' },
  { label: 'Decision', description: 'Governance decides what, if anything, the system is permitted to do with the result.' },
];

/** Spoken form of the figure, for screen readers and for the figure caption. */
export const PROGRESSION_TEXT_EQUIVALENT = `A nine-stage progression, each stage feeding the next: ${STRUCTURAL_PROGRESSION.map((stage) => stage.label.toLowerCase()).join(', then ')}.`;

// ---------------------------------------------------------------------------------------------
// Maturity separation. Three columns, never merged: what exists, what is being probed, and what
// is only a research hypothesis. The `implemented` column intentionally cites the canonical
// project records instead of introducing new capability claims.
// ---------------------------------------------------------------------------------------------

export interface MaturityRow {
  area: string;
  /** What actually exists today. Empty string when nothing does. */
  implemented: string;
  /** Active, unproven work. Empty string when there is none. */
  experimental: string;
  /** A stated hypothesis, never a capability claim. */
  hypothesis: string;
  /** Canonical project records this row draws on, for the "see current status" links. */
  projects: ProjectRecord[];
}

const technologyBySlug = (slug: string): ProjectRecord[] => ALL_TECHNOLOGIES.filter((tech) => tech.slug === slug);

export const MATURITY_ROWS: MaturityRow[] = [
  {
    area: 'Reversible digital structure',
    implemented:
      'Exact lossless round-trip and strict counted-artifact accounting on internal test artifacts, internally validated.',
    experimental: 'Expanding the proof surface beyond the current internal artifact set.',
    hypothesis:
      'That structural artifacts can eventually be interpreted more directly than the procedure that produced them required.',
    projects: technologyBySlug('bytelite'),
  },
  {
    area: 'Visual structure',
    implemented:
      'Deterministic image partitioning with hash-verified reproducibility, boundary-closure validation, and a canonical partition export, exercised by a desktop workbench.',
    experimental:
      'Relationally positioned pixel evidence, and automatic-mode behavior on real close-up portrait photographs, where a failure is currently on record.',
    hypothesis:
      'That independently derived visual relationships can be expressed in a form comparable against governed masks and later consumed by deterministic cognition.',
    projects: technologyBySlug('bytesight'),
  },
  {
    area: 'Deterministic reasoning',
    implemented:
      'Rule-based structural classification of claims, a closed taxonomy of inquiry types, hash-based provenance, and deterministic replay covered by the automated test suite.',
    experimental: 'Routing the recognized-but-not-yet-live inquiry types, and relation-preservation beyond structural representation.',
    hypothesis:
      'That a deterministic reference procedure can teach a simpler explicit invariant that reproduces the same governed result.',
    projects: technologyBySlug('deep-kore'),
  },
  {
    area: 'Governance and emission',
    implemented:
      'A mandatory two-stage governance gate with a tested single-owner invariant and no bypass path, plus a verifiable stamp on every governed response.',
    experimental: 'Intrinsic-halting rules and scoped action envelopes for external effects.',
    hypothesis:
      'That the same governance rail can gate promotion of discovered invariants, keeping discovery and operational authority separate.',
    projects: technologyBySlug('genesis-goalkeeper'),
  },
  {
    area: 'Cross-domain relational abstraction',
    implemented: '',
    experimental: '',
    hypothesis:
      'That a small set of relational operators remains semantically coherent across digital, visual, and temporal domains without implying that those domains share semantics.',
    projects: [],
  },
  {
    area: 'Temporal structure, prediction, and simulation',
    implemented: '',
    experimental: '',
    hypothesis:
      'That structural state observed across time exposes persistence and change, that a governed transition law can support prediction, and that repeated prediction yields bounded simulation.',
    projects: [],
  },
  {
    area: 'Self-reducing world models',
    implemented: '',
    experimental: '',
    hypothesis:
      'That better verified invariants reduce model cost, and that reduced cost extends the reasoning or simulation horizon a fixed budget can reach.',
    projects: [],
  },
  {
    area: 'Autonomous-system application',
    implemented: '',
    experimental: '',
    hypothesis:
      'That governed structural state could one day inform safety-critical downstream systems. This is a downstream application direction only, with no current capability of any kind.',
    projects: [],
  },
];

// ---------------------------------------------------------------------------------------------
// Evidence vocabulary. Distinct statuses that must never collapse into one another - in
// particular, empirical support is not mathematical proof.
// ---------------------------------------------------------------------------------------------

export interface EvidenceStatus {
  label: string;
  meaning: string;
}

export const EVIDENCE_STATUSES: EvidenceStatus[] = [
  { label: 'Unknown', meaning: 'The question has not been asked of this candidate yet.' },
  { label: 'Observed', meaning: 'The relationship has been seen, with no claim that it generalizes.' },
  { label: 'Candidate', meaning: 'Proposed as a possible replacement for a reference procedure, not yet qualified.' },
  { label: 'Supported', meaning: 'Testing has not contradicted it over a stated range. This is not proof.' },
  { label: 'Exhaustively verified', meaning: 'Every case in a finite, fully enumerated domain has been checked.' },
  { label: 'Formally verified', meaning: 'Equivalence has been established by proof rather than by sampling.' },
  { label: 'Contradicted', meaning: 'A counterexample exists. The candidate is disqualified for that domain.' },
  { label: 'Superseded', meaning: 'A later qualified candidate replaced it. The record is retained, not deleted.' },
];

// ---------------------------------------------------------------------------------------------
// Falsifiability. Each hypothesis is paired with the observation that would weaken or break it.
// ---------------------------------------------------------------------------------------------

export interface FalsificationCase {
  claim: string;
  failsIf: string;
}

export const FALSIFICATION_CASES: FalsificationCase[] = [
  {
    claim: 'Reversible structural representation',
    failsIf: 'Exact reconstruction fails on any artifact the governed domain requires it for.',
  },
  {
    claim: 'Structural reduction',
    failsIf: 'A complete representation does not improve under its own governing criterion once every part is counted.',
  },
  {
    claim: 'Direct interpretation of structural artifacts',
    failsIf: 'No simpler candidate reproduces the reference behavior, or every candidate that does costs more than the procedure it replaces.',
  },
  {
    claim: 'Deterministic structural vision',
    failsIf: 'Independently derived relational representations show no useful correspondence with governed visual structure.',
  },
  {
    claim: 'Cross-domain relational abstraction',
    failsIf: 'Shared operators stop being semantically coherent once they are carried between domains.',
  },
  {
    claim: 'Reduced world models',
    failsIf: 'State omitted by the reduction turns out to be necessary for the governed prediction.',
  },
  {
    claim: 'Verified invariant learning',
    failsIf: 'Promotion of a qualified candidate changes a governed result that the reference procedure had produced correctly.',
  },
];

// ---------------------------------------------------------------------------------------------
// Limitations. Stated as absolutes because they are absolute: none of these are demonstrated.
// ---------------------------------------------------------------------------------------------

export const LIMITATIONS: string[] = [
  'Universal compression, or any claim that every input reduces.',
  'Global optimality, or a minimum description in any absolute sense.',
  'General artificial intelligence.',
  'Consciousness or sentience.',
  'Solved object recognition.',
  'Universal causal inference.',
  'Autonomous driving, or readiness for any autonomous system.',
  'Perfect or complete sensing.',
  'Complete physical simulation.',
  'Absolute correctness outside a governed domain.',
];

// ---------------------------------------------------------------------------------------------
// Bibliography. Foundational sources only, and only bibliographic detail that is reliable.
// No DOIs or URLs are asserted, because none are recorded in this repository.
// ---------------------------------------------------------------------------------------------

export interface Reference {
  authors: string;
  title: string;
  publication: string;
  note?: string;
}

export const REFERENCES: Reference[] = [
  {
    authors: 'A. N. Kolmogorov',
    title: 'Three Approaches to the Quantitative Definition of Information',
    publication: 'Problems of Information Transmission, vol. 1, no. 1, pp. 1-7, 1965',
    note: 'The definition of the complexity of an object as the length of its shortest description.',
  },
  {
    authors: 'G. J. Chaitin',
    title: 'On the Length of Programs for Computing Finite Binary Sequences',
    publication: 'Journal of the ACM, vol. 13, no. 4, pp. 547-569, 1966',
    note: 'Program-size complexity, developed independently of Kolmogorov.',
  },
  {
    authors: 'R. J. Solomonoff',
    title: 'A Formal Theory of Inductive Inference, Parts I and II',
    publication: 'Information and Control, vol. 7, no. 1, pp. 1-22 and no. 2, pp. 224-254, 1964',
    note: 'Algorithmic probability and the algorithmic treatment of inductive inference.',
  },
  {
    authors: 'J. Rissanen',
    title: 'Modeling by Shortest Data Description',
    publication: 'Automatica, vol. 14, no. 5, pp. 465-471, 1978',
    note: 'The Minimum Description Length principle.',
  },
  {
    authors: 'M. Li and P. Vitanyi',
    title: 'An Introduction to Kolmogorov Complexity and Its Applications',
    publication: 'Springer',
    note: 'The standard reference text for the field, including the uncomputability results this thesis relies on.',
  },
];

export const RELATED_RESEARCH_AREAS: string[] = [
  'algorithmic information theory',
  'Minimum Description Length',
  'program synthesis',
  'formal verification',
  'symbolic reasoning',
  'cognitive architectures',
  'world models',
  'deterministic systems engineering',
];

// ---------------------------------------------------------------------------------------------
// Disclosure language. One source so the landing page, the thesis, and the plain-English page
// cannot drift from each other or from the Terms.
// ---------------------------------------------------------------------------------------------

export const DISCLOSURE_BOUNDARY_SHORT =
  'The public research pages explain objectives, architecture, validation principles, and system relationships. Proprietary construction mechanisms, encoding laws, internal mappings, algorithms, and implementation-specific transformation logic remain private.';

export const DISCLOSURE_BOUNDARY_FULL =
  'This paper describes high-level research objectives, architectural principles, validation philosophy, and intended system relationships. Proprietary implementation mechanisms, algorithms, internal mappings, construction procedures, artifact layouts, transformation rules, and private validation materials are intentionally omitted.';

export const HYPOTHESIS_DISCLAIMER =
  'Descriptions of future research directions are hypotheses and should not be interpreted as statements of current product capability.';

export const NO_LICENSE_STATEMENT =
  'Nothing in this publication grants a license to ByteLite LLC proprietary technology.';

export const PROGRAM_QUALIFIER =
  'Research program — not a claim of finished AGI, universal compression, solved vision, or autonomous deployment.';
