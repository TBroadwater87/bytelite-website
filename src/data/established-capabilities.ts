import type { ResearchProgramId } from './research-programs';

export interface EstablishedCapability {
  id: string;
  programId: ResearchProgramId;
  milestoneId: string;
  featuredOnHomePage: boolean;
  figure: string;
  figureUnit: string;
  headline: string;
  statement: string;
  scope: string;
}

export const ESTABLISHED_CAPABILITIES: readonly EstablishedCapability[] = [
  {
    id: 'representation-exact-rebuilds',
    programId: 'data-representation',
    milestoneId: 'representation-exact-reconstruction',
    featuredOnHomePage: true,
    figure: '4,515 / 4,515',
    figureUnit: 'byte-exact rebuilds',
    headline: 'Every test encoding rebuilt exactly.',
    statement: 'Each one was decoded and matched to its original byte for byte before it was accepted. Separate 8 MiB and 64 MiB files also rebuilt exactly.',
    scope: 'Stage: tested in-house. Compression internal build of 12 October 2026, one machine, 301 small test inputs. Exact rebuilding is not compression. Effective compression has not been demonstrated.',
  },
  {
    id: 'cognition-certified-test-run',
    programId: 'machine-cognition',
    milestoneId: 'cognition-governed-input',
    featuredOnHomePage: true,
    figure: '4,758 / 4,758',
    figureUnit: 'automated checks passed (release-configuration run)',
    headline: 'An internal test run of one build.',
    statement: 'In the recorded release-configuration run, all 103 test suites passed, including all 4,758 checks. The Debug run also passed 103 of 103 suites; its check count is not claimed here.',
    scope: 'Stage: tested in-house. Cognition internal build of 15 October 2026, checked for build and automatic tests only, one machine. It is not the current development branch, which is newer and not yet tested in the same way. Tests that need large language collections were not exercised.',
  },
  {
    id: 'cognition-no-guessing',
    programId: 'machine-cognition',
    milestoneId: 'cognition-missing-knowledge',
    featuredOnHomePage: true,
    figure: 'By design',
    figureUnit: 'gaps reported, not filled',
    headline: 'Designed to say what it does not know.',
    statement: 'When nothing is on record about a concept, the system replies that it does not know and asks for more information rather than inventing an answer. This holds in the cases our tests cover.',
    scope: 'Stage: tested in-house, tested cases only. Cognition internal build of 15 October 2026. Not yet shown for every phrasing: handling of ambiguous input and the grounding of claims in replies are still being completed.',
  },
  {
    id: 'cognition-sourced-answers',
    programId: 'machine-cognition',
    milestoneId: 'cognition-knowledge-records',
    featuredOnHomePage: true,
    figure: '39 / 39',
    figureUnit: 'trace checks passed',
    headline: 'Designed so answers carry their source.',
    statement: 'Answers drawn from knowledge are built to carry the record they came from, its stated source and its status, and each request runs against one fixed, recorded knowledge version.',
    scope: 'Stage: tested in-house. Cognition internal build of 15 October 2026, 39 trace checks. Sources are recorded as supplied. How strongly a record is labelled as established, and how a source is matched to a claim, are being tightened, so traceability is not yet shown for every answer.',
  },
  {
    id: 'cognition-replay-consistency',
    programId: 'machine-cognition',
    milestoneId: 'cognition-frozen-generations',
    featuredOnHomePage: false,
    figure: '0 of 335',
    figureUnit: 'unexplained differences',
    headline: 'Consistent from version to version.',
    statement: '335 recorded conversation turns were replayed against the new version: 274 identical, 61 changed for documented reasons, none unexplained.',
    scope: 'Stage: tested in-house. Cognition internal build of 15 October 2026, compared with our own earlier engine in the same internal run.',
  },
  {
    id: 'representation-certified-test-run',
    programId: 'data-representation',
    milestoneId: 'representation-determinism',
    featuredOnHomePage: false,
    figure: '83,332',
    figureUnit: 'checks passed, zero failed',
    headline: 'Same input, same output.',
    statement: '34 of 34 test suites and every determinism gate passed in the recorded internal test run.',
    scope: 'Stage: tested in-house. Compression internal build of 12 October 2026, one machine.',
  },
  {
    id: 'visual-colour-equivalence',
    programId: 'visual-and-audio',
    milestoneId: 'visual-structural-components',
    featuredOnHomePage: true,
    figure: '16,777,216',
    figureUnit: 'colours matched, six field computations',
    headline: 'Colour-field computation paths match the reference exactly.',
    statement: 'The colour-field computation paths gave byte-identical results to the reference path for every possible 24-bit colour, in each of six colour-field computations.',
    scope: 'Stage: tested in-house. Vision internal build of 10 October 2026, one machine. This covers six colour-field computations, not image processing in general. Synthetic and test images only.',
  },
  {
    id: 'visual-certified-test-run',
    programId: 'visual-and-audio',
    milestoneId: 'visual-structural-components',
    featuredOnHomePage: false,
    figure: '573 / 573',
    figureUnit: 'image checks passed',
    headline: 'Image-structure components pass in full.',
    statement: '25 of 25 test suites passed in the recorded internal test run, and three image styles reproduce their reference outputs byte for byte.',
    scope: 'Stage: tested in-house. Vision internal build of 10 October 2026. Not yet evaluated on real photographs.',
  },
  {
    id: 'audio-certified-test-run',
    programId: 'visual-and-audio',
    milestoneId: 'audio-architecture',
    featuredOnHomePage: true,
    figure: '213 / 213',
    figureUnit: 'architecture-level tests passed',
    headline: 'Early audio architecture passes its tests.',
    statement: 'The audio research architecture passed all 213 of its tests.',
    scope: 'Stage: tested in-house. Audio architecture internal build of 10 October 2026. Architecture-level testing only: no speech, music or audio analysis yet.',
  },
];

export const HOME_PAGE_CAPABILITIES = ESTABLISHED_CAPABILITIES.filter((capability) => capability.featuredOnHomePage);

export function establishedCapabilitiesFor(programId: ResearchProgramId): readonly EstablishedCapability[] {
  return ESTABLISHED_CAPABILITIES.filter((capability) => capability.programId === programId);
}
