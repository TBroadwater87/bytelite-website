// Canonical company facts. Single source of truth for anything the site states about ByteLite
// LLC itself, so no page can restate a company fact in a way that drifts from another page.
//
// The two dates below are NOT interchangeable and must never be collapsed into one "founded"
// year: the research work started in 2024, and the legal entity was formed in 2025. Public copy
// that needs a single sentence should use RESEARCH_AND_FORMATION_SENTENCE rather than inventing
// its own phrasing.

export const COMPANY_NAME = 'ByteLite LLC';
export const COMPANY_LOCALITY = 'Helena';
export const COMPANY_REGION = 'MT';
export const COMPANY_REGION_NAME = 'Montana';
export const COMPANY_COUNTRY = 'US';
export const COMPANY_LOCATION = 'Helena, Montana, USA';
export const COMPANY_STRUCTURE = 'Solo-founder LLC';
export const FOUNDER_NAME = 'Tash Broadwater';

/** The year the underlying research and project work began, before any legal entity existed. */
export const RESEARCH_BEGAN_YEAR = '2024';

/** The year the ByteLite LLC legal entity was formed. Used for schema.org foundingDate. */
export const LEGAL_FORMATION_YEAR = '2025';

/** The one approved sentence for stating both dates together. */
export const RESEARCH_AND_FORMATION_SENTENCE = `The research work began in ${RESEARCH_BEGAN_YEAR}. ${COMPANY_NAME} was formed in ${LEGAL_FORMATION_YEAR}.`;
