export const DATA_REPRESENTATION_PROGRAM_NAME = 'Data Representation';

export const DATA_REPRESENTATION_OBJECTIVE =
  'The research seeks deterministic, lossless representations of data that rebuild the original exactly, account for every byte of the complete representation, and achieve measurable reduction where the data and the complete representation permit it.';

export const COUNTING_LIMIT_STATEMENT =
  'No lossless method can make every possible input smaller. There are more possible inputs of a given length than there are shorter outputs to hold them, so some inputs must stay the same size or grow. ByteLite LLC therefore never claims universal reduction. Any reduction it reports will be measured on a declared input, using the complete representation.';

export const DETERMINISM_STATEMENT =
  'The core encoding and decoding process is deterministic. It does not rely on probabilistic inference or confidence scores to decide what the original data probably was.';

export const CURRENT_REDUCTION_STATUS =
  'Net size reduction has not been demonstrated. The current development representation is larger than its input, and no compression ratio is claimed.';

export interface RepresentationPrinciple {
  id: string;
  title: string;
  description: string;
}

export const REPRESENTATION_PRINCIPLES: readonly RepresentationPrinciple[] = [
  {
    id: 'exact',
    title: 'Exact reconstruction',
    description:
      'Every representation is decoded and compared with the original byte for byte before it is accepted. Similar is not accepted as equal.',
  },
  {
    id: 'complete-accounting',
    title: 'Complete accounting',
    description:
      'Every reported size figure must count the complete representation, including everything needed to rebuild the original. Nothing may be moved somewhere uncounted.',
  },
  {
    id: 'deterministic',
    title: 'Deterministic operation',
    description: 'The same input and the same software always produce the same result.',
  },
  {
    id: 'measured',
    title: 'Measured, never assumed',
    description:
      'A reduction exists only when it has been measured on a declared input. Targets are not reported as results.',
  },
];

export interface BoundaryStatement {
  id: string;
  headline: string;
  body: string;
}

export const WHAT_IT_IS_NOT: readonly BoundaryStatement[] = [
  {
    id: 'generative',
    headline: 'Not generative',
    body: 'The original is never reconstructed by predicting what was probably there.',
  },
  {
    id: 'lossy',
    headline: 'Not lossy',
    body: 'If exact reconstruction cannot be shown, the result does not count.',
  },
  {
    id: 'universal',
    headline: 'Not a universal-reduction claim',
    body: 'No lossless method can shrink every input, and none is claimed here.',
  },
  {
    id: 'qualified',
    headline: 'Not independently validated or production qualified',
    body: 'Those gates are open. Nothing on this site presents them as complete.',
  },
];

export const PROPRIETARY_METHODS_STATEMENT =
  'The methods that produce a representation are proprietary and are not described on this site. This page explains what the research is trying to achieve and how results will be judged, not how the system works internally.';
