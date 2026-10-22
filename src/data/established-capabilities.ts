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
    scope: 'Internal certification run, one machine, October 2026. The test set is small, and the representation is still larger than its input.',
  },
  {
    id: 'cognition-certified-test-run',
    programId: 'machine-cognition',
    milestoneId: 'cognition-governed-input',
    featuredOnHomePage: true,
    figure: '4,758 / 4,758',
    figureUnit: 'automated checks passed',
    headline: 'A clean, owner-certified test run.',
    statement: '103 of 103 test suites passed in both release and debug builds, on a fresh copy of the code, with zero compiler warnings.',
    scope: 'Internal certification, one machine, October 2026. Tests that need large language collections were not exercised.',
  },
  {
    id: 'cognition-no-guessing',
    programId: 'machine-cognition',
    milestoneId: 'cognition-missing-knowledge',
    featuredOnHomePage: true,
    figure: 'No guess',
    figureUnit: 'when knowledge is missing',
    headline: 'Says "I don\'t know" instead of making things up.',
    statement: 'When nothing is on record about a concept, the system says so and asks for more information rather than inventing an answer.',
    scope: 'Checked by automated tests in tested cases.',
  },
  {
    id: 'cognition-sourced-answers',
    programId: 'machine-cognition',
    milestoneId: 'cognition-knowledge-records',
    featuredOnHomePage: true,
    figure: '1 version',
    figureUnit: 'of knowledge per request',
    headline: 'Every answer is traceable.',
    statement: 'Answers drawn from knowledge carry the record they came from, its stated source and its status, and each request runs against one fixed, recorded knowledge version.',
    scope: 'Checked by automated tests, including 39 trace checks. Sources are recorded as supplied.',
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
    scope: 'Compared with our own earlier engine, in the same certified run.',
  },
  {
    id: 'representation-certified-test-run',
    programId: 'data-representation',
    milestoneId: 'representation-determinism',
    featuredOnHomePage: false,
    figure: '83,332',
    figureUnit: 'checks passed, zero failed',
    headline: 'Same input, same output.',
    statement: '34 of 34 test suites and every determinism gate passed in release and debug builds.',
    scope: 'Internal certification run, one machine, October 2026.',
  },
  {
    id: 'representation-flat-memory',
    programId: 'data-representation',
    milestoneId: 'representation-exact-reconstruction',
    featuredOnHomePage: false,
    figure: '4.36 to 4.81 MB',
    figureUnit: 'peak memory, 1 KiB to 64 MiB',
    headline: 'Memory stays flat as files grow.',
    statement: 'Peak memory stayed nearly constant across inputs from 1 KiB to 64 MiB.',
    scope: 'Measured on one machine.',
  },
  {
    id: 'visual-colour-equivalence',
    programId: 'visual-and-audio',
    milestoneId: 'visual-structural-components',
    featuredOnHomePage: true,
    figure: '16,777,216',
    figureUnit: 'colours matched exactly',
    headline: 'Fast paths match the reference exactly.',
    statement: 'The accelerated image paths gave byte-identical results to the reference path for every possible 24-bit colour.',
    scope: 'Internal certification run, one machine. Synthetic and test images only.',
  },
  {
    id: 'visual-certified-test-run',
    programId: 'visual-and-audio',
    milestoneId: 'visual-structural-components',
    featuredOnHomePage: false,
    figure: '573 / 573',
    figureUnit: 'image checks passed',
    headline: 'Image-structure components pass in full.',
    statement: '25 of 25 test suites passed in release and debug builds, and three image styles reproduce their reference outputs byte for byte.',
    scope: 'Internal certification run. Not yet evaluated on real photographs.',
  },
  {
    id: 'audio-certified-test-run',
    programId: 'visual-and-audio',
    milestoneId: 'audio-architecture',
    featuredOnHomePage: true,
    figure: '213 / 213',
    figureUnit: 'audio architecture tests',
    headline: 'Audio foundation in place.',
    statement: 'The audio research architecture passed every test in release and debug builds, with zero warnings.',
    scope: 'Internal certification run. Architecture only: no speech, music or audio analysis yet.',
  },
];

export const HOME_PAGE_CAPABILITIES = ESTABLISHED_CAPABILITIES.filter((capability) => capability.featuredOnHomePage);

export function establishedCapabilitiesFor(programId: ResearchProgramId): readonly EstablishedCapability[] {
  return ESTABLISHED_CAPABILITIES.filter((capability) => capability.programId === programId);
}
