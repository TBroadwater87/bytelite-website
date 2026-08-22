// Canonical public facts for ByteLite - the single technology this website exists to explain.
//
// THE DISTINCTION THIS FILE EXISTS TO PROTECT
// -------------------------------------------
// ByteLite's ARCHITECTURAL TARGET and its CURRENT ENGINEERING PROOF STATUS are two different
// things, and the site must never collapse one into the other in either direction:
//
//   * The target is a smaller, self-contained representation for EVERY eligible source file,
//     from which the exact original is reconstructed. Nothing here may narrow that to
//     "only structured files shrink" or "random data is expected not to shrink".
//   * The proof is not finished. Nothing here may present universal self-contained shrink,
//     independent validation, or production qualification as completed.
//
// Every state below is derived from the BYTELITE record in ./projects (the canonical
// project/status model), never from page prose. If the underlying evidence changes, change it
// there and here, not in a template.

import { BYTELITE } from './projects';

export const BYTELITE_NAME = 'ByteLite';

/** The two-line public thesis. Order matters: exactness is the precondition for any reduction. */
export const BYTELITE_LAW_PRIMARY = 'Exact reconstruction.';
export const BYTELITE_LAW_SECONDARY = 'Smaller representation.';

/** Hero sub-copy. Two sentences: what is being built, then what the target is. */
export const BYTELITE_HERO_WHAT =
  'ByteLite is developing a deterministic lossless representation architecture designed to reconstruct the exact original while reducing the complete information required to represent it.';
export const BYTELITE_HERO_TARGET =
  'Its research target is a smaller self-contained representation for every eligible source file. That target remains under active engineering and validation.';

/**
 * The canonical public status statement. Any page that summarises ByteLite's position must
 * either render this or say something strictly compatible with it.
 */
export const BYTELITE_CANON = [
  'ByteLite is being developed as a deterministic lossless representation architecture with the target of producing a smaller, self-contained representation from which the exact original can be reconstructed.',
  'The mechanisms required to realize that target are still under active development and validation. Current research tooling uses explicit reconstruction evidence as a proof scaffold so transformations can be inspected and verified. The intended final ByteLite artifact is self-contained: all reconstruction-essential information must ultimately be included in the counted representation rather than depending on an external per-file development sidecar.',
  'Universal self-contained shrink is ByteLite’s architectural target. It is not yet presented as a completed independent or production-qualified proof.',
];

/** The three sentences that keep target, development state and proof state apart. */
export const TARGET_STATEMENT =
  'ByteLite is being developed with the target of producing a smaller exact, self-contained representation for every eligible source file.';
export const DEVELOPMENT_STATEMENT =
  'The mechanism required to establish that target is still under active development and validation.';
export const PROOF_STATEMENT =
  'Universal shrink is a research target, not a completed public proof.';

/** How the current development scaffold is described publicly. Never more than this. */
export const SIDECAR_SCAFFOLD_STATEMENT =
  'During development, ByteLite uses explicit reconstruction evidence so each transformation can be inspected and verified. This is a research scaffold, not the intended final artifact.';
export const SELF_CONTAINED_TARGET_STATEMENT =
  'The final ByteLite architecture is intended to include all information required for exact reconstruction inside the self-contained counted representation.';

/** Determinism and entropy wording. The site describes its own objective; it does not litigate theory. */
export const DETERMINISM_STATEMENT =
  'ByteLite’s core encoding and decoding mechanism is deterministic. It does not rely on probabilistic inference or confidence scores to decide what the original data probably was.';
export const ENTROPY_STATEMENT =
  'ByteLite is not built around probabilistic entropy coding. Its research target is a deterministic, recursively self-contained representation architecture.';

/** Labels applied to figures so no diagram can be read as a measured or promised result. */
export const CONCEPTUAL_TARGET_LABEL = 'Conceptual target. Not a claimed universal ratio.';
export const ILLUSTRATIVE_LABEL = 'Illustrative only. Not a claimed compression ratio.';
export const ILLUSTRATIVE_ECONOMIC_LABEL =
  'Illustrative economic example. Not a performance guarantee.';

// ---------------------------------------------------------------------------------------------
// CURRENT STATUS BOX
//
// Two columns, deliberately: what the repository evidence currently supports, and what the
// architecture still requires. Every "currently" line traces to a BYTELITE capability or
// validation statement in ./projects; every "still required" line is an open gate.
// ---------------------------------------------------------------------------------------------

export const CURRENT_STAGE_HEADLINE = 'Architectural development and internal validation';

export const CURRENTLY: string[] = [
  'Deterministic transformations under development on internal proof surfaces',
  'Exact reconstruction proof-gated: the rebuilt file is compared against the original',
  'Explicit reconstruction evidence used so each transformation can be inspected and replayed',
  'Complete-artifact accounting: reported size is counted, never estimated',
];

export const STILL_REQUIRED: string[] = [
  'Compact required reconstruction state',
  'A fully self-contained final artifact',
  'Recursive convergence of the complete representation',
  'Universal-target proof',
  'Repeatable large-corpus testing',
  'Independent validation',
  'Production qualification',
];

// ---------------------------------------------------------------------------------------------
// VALIDATION DASHBOARD
//
// `state` drives colour, the state word AND the ordering, so meaning never depends on colour
// alone. "Proven (internal)" is the strongest state this site can award: it means ByteLite LLC
// has the evidence in hand and nobody outside has checked it.
// ---------------------------------------------------------------------------------------------

export type DashboardState =
  | 'proven-internal'
  | 'partial'
  | 'in-development'
  | 'not-proven'
  | 'not-tested';

export const DASHBOARD_STATE_LABEL: Record<DashboardState, string> = {
  'proven-internal': 'Proven (internal)',
  partial: 'Partial',
  'in-development': 'In development',
  'not-proven': 'Not yet proven',
  'not-tested': 'Not yet tested',
};

export interface DashboardRow {
  id: string;
  label: string;
  state: DashboardState;
  /** One plain sentence a nontechnical reader can act on. */
  meaning: string;
  /** Where the claim comes from, or why there is none yet. */
  evidence: string;
}

export const VALIDATION_DASHBOARD: DashboardRow[] = [
  {
    id: 'architecture',
    label: 'Architecture',
    state: 'in-development',
    meaning: 'The overall design of how a file becomes a representation and comes back exactly.',
    evidence:
      'Active deterministic engineering. The design is being built and clarified rather than finished.',
  },
  {
    id: 'reversibility',
    label: 'Reversibility',
    state: 'proven-internal',
    meaning: 'The rebuilt file is byte-for-byte identical to the original.',
    evidence:
      'Exact round-trip verified on internal test artifacts by comparing the rebuilt file against the original. Not independently audited.',
  },
  {
    id: 'scaffolded-proof',
    label: 'Current scaffold-assisted proof',
    state: 'partial',
    meaning:
      'Transformations can be inspected, replayed and falsified today because reconstruction evidence is written out explicitly.',
    evidence:
      'This scaffold is how the architecture is verified during development. It is not the intended final artifact and is not presented as one.',
  },
  {
    id: 'self-contained',
    label: 'Self-contained artifact',
    state: 'in-development',
    meaning:
      'One artifact that carries everything the decoder needs, with no external per-file companion.',
    evidence: 'The intended final architecture. Not yet realized.',
  },
  {
    id: 'accounting',
    label: 'Complete artifact accounting',
    state: 'proven-internal',
    meaning: 'Reported size is counted from the complete artifact, not estimated from a model.',
    evidence: 'Strict artifact accounting: counted output size, not estimated.',
  },
  {
    id: 'recursion',
    label: 'Recursive complete-state convergence',
    state: 'in-development',
    meaning:
      'The complete representation is itself reduced, repeatedly, until it stops improving on its own terms.',
    evidence: 'Under development. No convergence result is claimed.',
  },
  {
    id: 'universal',
    label: 'Universal-shrink target',
    state: 'not-proven',
    meaning: 'A smaller self-contained representation for every eligible source file.',
    evidence:
      'ByteLite’s architectural target. It is not a completed public proof, and this site does not present it as one.',
  },
  {
    id: 'corpus',
    label: 'Large-corpus testing',
    state: 'not-tested',
    meaning: 'The same measured result, repeated across a broad standard body of files.',
    evidence: 'Current next milestone. Not yet established.',
  },
  {
    id: 'independent',
    label: 'Independent validation',
    state: 'not-proven',
    meaning: 'Someone outside ByteLite LLC reproduces the result.',
    evidence: 'No independent third-party benchmark of ByteLite exists publicly.',
  },
  {
    id: 'production',
    label: 'Production qualification',
    state: 'not-proven',
    meaning: 'Proven dependable enough to run real workloads.',
    evidence: 'No production-scale compression is publicly claimed.',
  },
];

/** Asked about often enough to deserve its own row, though it is not an architecture gate. */
export const ENWIK9_ROW: DashboardRow = {
  id: 'enwik9',
  label: 'Full enwik9 benchmark',
  state: 'not-tested',
  meaning: 'A complete run against the standard 1GB public benchmark corpus.',
  evidence: 'No current public evidence of a completed full-corpus result.',
};

// ---------------------------------------------------------------------------------------------
// DEVELOPMENT ROADMAP
//
// The ordered gates from architecture to production. `done` means the gate is closed on internal
// evidence; exactly one stage carries `current`. No future gate may ever be marked done.
// ---------------------------------------------------------------------------------------------

export type RoadmapState = 'done' | 'current' | 'ahead';

export interface RoadmapStage {
  id: string;
  label: string;
  state: RoadmapState;
}

export const ROADMAP: RoadmapStage[] = [
  { id: 'architecture', label: 'Architecture', state: 'done' },
  { id: 'reversibility', label: 'Exact reversibility', state: 'done' },
  { id: 'scaffold', label: 'Explicit proof scaffold', state: 'done' },
  { id: 'mechanism', label: 'Mechanism clarification', state: 'current' },
  { id: 'compact', label: 'Compact required state', state: 'ahead' },
  { id: 'self-contained', label: 'Self-contained artifact', state: 'ahead' },
  { id: 'recursion', label: 'Complete-representation recursion', state: 'ahead' },
  { id: 'convergence', label: 'Convergence', state: 'ahead' },
  { id: 'universal', label: 'Universal-target validation', state: 'ahead' },
  { id: 'independent', label: 'Independent validation', state: 'ahead' },
  { id: 'production', label: 'Production qualification', state: 'ahead' },
];

export const ROADMAP_STATE_LABEL: Record<RoadmapState, string> = {
  done: 'Closed on internal evidence',
  current: 'Current position',
  ahead: 'Not yet reached',
};

export const CURRENT_ROADMAP_STAGE = ROADMAP.find((stage) => stage.state === 'current');

// ---------------------------------------------------------------------------------------------
// WHAT BYTE LITE IS NOT
//
// A boundary, not an inventory. Each card says what ByteLite refuses to do; none says what it
// does instead, because the replacement mechanism is the thing being protected.
// ---------------------------------------------------------------------------------------------

export interface IsNotCard {
  id: string;
  headline: string;
  body: string;
}

export const IS_NOT: IsNotCard[] = [
  {
    id: 'generative',
    headline: 'Not a generative AI system',
    body: 'ByteLite does not reconstruct data by guessing what was probably there. Reconstruction is not inference.',
  },
  {
    id: 'lossy',
    headline: 'Not lossy compression',
    body: 'If exact reconstruction cannot be proven, the result does not qualify. There is no partial credit.',
  },
  {
    id: 'equivalence',
    headline: 'Not "close enough"',
    body: '"Looks the same" and "means the same thing" are not accepted as equivalent to the original bytes.',
  },
  {
    id: 'probabilistic',
    headline: 'Not probabilistic entropy coding',
    body: ENTROPY_STATEMENT,
  },
  {
    id: 'qualified',
    headline: 'Not independently validated or production-qualified',
    body: 'Those gates are not complete, and ByteLite is not presented as though they were.',
  },
];

// ---------------------------------------------------------------------------------------------
// PROVEN / NOT PROVEN, stated plainly.
// ---------------------------------------------------------------------------------------------

export const PROVEN: string[] = [
  'Exact lossless round-trip on internal test artifacts, verified by comparing the rebuilt file against the original.',
  'Strict artifact accounting: the reported size is counted from the complete artifact, never estimated.',
  'Deterministic behavior: the same input and build produce the same output.',
];

export const NOT_PROVEN: string[] = [
  'The universal target. A smaller self-contained representation for every eligible source file is what ByteLite is being built to achieve, not something it has demonstrated.',
  'A self-contained final artifact. Development currently relies on explicit reconstruction evidence that the final architecture must absorb.',
  'A specific compression ratio. No public ratio is claimed.',
  'A completed full enwik9 benchmark result.',
  'Independent third-party verification. Every result above is internal.',
  'Production readiness. ByteLite is research under active development, not a shipping product.',
];

// ---------------------------------------------------------------------------------------------
// Planned commercial model. These are ILLUSTRATIVE figures chosen to make the split legible,
// not a forecast, a price, or a claim about achievable savings.
// ---------------------------------------------------------------------------------------------

export const SAVINGS_EXAMPLE = {
  baselineCost: 1000,
  measuredCost: 700,
  verifiedSavings: 300,
  customerRetains: 150,
  byteLiteFee: 150,
  customerEffectiveCost: 850,
} as const;

export const BALANCE_EXAMPLE = {
  currentBalance: 42.18,
  minimumBalance: 25.0,
  autoReload: 100.0,
  periodVerifiedSavings: 18.4,
  periodCustomerRetains: 9.2,
  periodByteLiteFee: 9.2,
} as const;

export const LICENSING_HEADLINE = 'We share verified savings.';

export const LICENSING_CORE =
  'ByteLite licensing is designed around a 50/50 share of verified qualifying savings. The customer retains half. ByteLite receives half as its licensing fee. This does not mean ByteLite guarantees a 50% reduction in total costs.';

export const LICENSING_NO_SAVING_RULE =
  'No verified saving means no savings-share fee for that saving.';

/** Guard: the public status string always comes from the canonical project record. */
export const BYTELITE_STATUS = BYTELITE.status;
