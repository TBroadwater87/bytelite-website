export const FIGURE_CLASSIFICATIONS = [
  'Conceptual illustration',
  'Actual validated system output',
  'Product concept rendering',
  'Physical product photograph',
] as const;

export type FigureClassification = (typeof FIGURE_CLASSIFICATIONS)[number];
