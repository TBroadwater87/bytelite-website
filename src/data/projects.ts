// Canonical project/status data model for ByteLite LLC.
// Single source of truth: every page renders status/claims from here rather than
// restating them inline, so status can never drift between pages (see CLAUDE.md
// "Canonical Project Status System").

export type ProjectStatus =
  | 'Concept'
  | 'Prototype'
  | 'Internal Validation'
  | 'Private Test'
  | 'Private Beta'
  | 'Public Beta'
  | 'Preorder'
  | 'Production'
  | 'Paused'
  | 'Completed';

export type Availability =
  | 'Internal research'
  | 'Private validation'
  | 'Private test'
  | 'Private beta'
  | 'Public beta'
  | 'Preorder available'
  | 'Licensing inquiry'
  | 'Production availability'
  | 'Not publicly available';

export type EvidenceLevel =
  | 'Implemented'
  | 'Internally Validated'
  | 'End-to-End Proven'
  | 'Production-Ready'
  | 'Publicly Available';

export interface CapabilityClaim {
  label: string;
  evidence: EvidenceLevel;
}

export interface ProjectRecord {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  mission: string;
  status: ProjectStatus;
  lastValidated: string;
  currentCapabilities: CapabilityClaim[];
  inDevelopment: string[];
  endGame: string[];
  validation: string[];
  integrationReceives: string[];
  integrationProduces: string[];
  integrationConsumedBy: string[];
  availability: Availability;
  routes: string[];
  claimRestrictions: string[];
  accentColor: string;
  heroImage?: string;
  heroImageAlt?: string;
}

const UNDATED = 'Not independently dated (site-wide status reviewed July 2026)';

export const BYTELITE: ProjectRecord = {
  slug: 'bytelite',
  name: 'ByteLite',
  category: 'Technology · Digital Structure Foundation',
  shortDescription: 'Deterministic structural representation and compression-related infrastructure research.',
  mission:
    'ByteLite exists to test a strict premise before any higher-level claim is made: a system that cannot preserve identity exactly should not be trusted to preserve meaning. ByteLite is the first proof surface for that premise, because exact reconstruction is measurable — either the original decodes back exactly, or it does not.',
  status: 'Internal Validation',
  lastValidated: UNDATED,
  currentCapabilities: [
    { label: 'Exact lossless round-trip validation on internal test artifacts', evidence: 'Internally Validated' },
    { label: 'Strict artifact accounting (counted output size, not estimated)', evidence: 'Internally Validated' },
    { label: 'Deterministic structural transformation on internal proof surfaces', evidence: 'Internally Validated' },
  ],
  inDevelopment: [
    'Implementation hardening toward claim-safe public release',
    'Expanding proof surfaces beyond the current internal artifact set',
    'Structural footprint interfaces for downstream systems (Deep Kore, ByteSight)',
  ],
  endGame: [
    'Deterministic transformation and structural representation usable as a foundation layer for other ByteLite LLC systems',
    'Recursive structural processing across broader file classes',
    'Foundation-based structural matching for related-content detection',
    'Publicly defensible, claim-safe production release once proof gates close',
  ],
  validation: [
    'Internal proof posture: exact round-trip (hash(original) == hash(reconstructed)) verified on internal test artifacts, not independently audited.',
    'No production-scale real-file compression is publicly claimed.',
    'No independent third-party benchmark of ByteLite exists publicly.',
    'Internal mechanisms (encoding rules, generator details, carrier formats) remain private trade secrets during validation and are not disclosed on this site.',
  ],
  integrationReceives: ['Raw digital artifacts submitted for deterministic structural transformation'],
  integrationProduces: ['Exact-reconstruction structural representations', 'Counted artifact size for verified claims'],
  integrationConsumedBy: ['Deep Kore (structural input)', 'ByteSight (planned structural footprint interface)'],
  availability: 'Internal research',
  routes: ['/technologies/bytelite'],
  claimRestrictions: [
    'Not a claim that every file compresses.',
    'Not a claim that standard information theory is invalid.',
    'Not a public production compression product.',
  ],
  accentColor: '#6366f1',
};

export const BYTESIGHT: ProjectRecord = {
  slug: 'bytesight',
  name: 'ByteSight',
  category: 'Technology · Visual Structure & Inspection Layer',
  shortDescription: 'A deterministic visual-structure and inspection layer for images, regions, and provenance.',
  mission:
    'ByteSight exists to give the architecture a deterministic way to represent what an image actually contains — regions, boundaries, provenance, and transformation history — instead of a black-box classifier score. Vision claims should be inspectable the same way file claims are.',
  status: 'Concept',
  lastValidated: UNDATED,
  currentCapabilities: [],
  inDevelopment: [
    'Early research into deterministic region and boundary representation',
    'Closure validation concepts for canonical image regions',
  ],
  endGame: [
    'Full-resolution evidence representation with canonical regions and boundaries',
    'Layered semantic structure with closure validation',
    'Deterministic image transformation with preserved provenance',
    'A production adapter feeding Cordel Connect photo features (e.g. cartoonized-profile transformation) and Deep Kore ingest',
  ],
  validation: [
    'No public demonstration or benchmark exists yet.',
    'This is early research, not a working prototype. Details are intentionally not public during validation.',
  ],
  integrationReceives: ['Raw images and visual media'],
  integrationProduces: ['Region/boundary structural output (planned)', 'Provenance-tagged transformation records (planned)'],
  integrationConsumedBy: ['Deep Kore (planned ingest)', 'Cordel Connect (planned photo/cartoonizer adapter)'],
  availability: 'Internal research',
  routes: ['/technologies/bytesight'],
  claimRestrictions: [
    'Not machine learning, generative AI, or a probabilistic classifier — the intended design is deterministic structural representation.',
    'Not a public product of any kind.',
  ],
  accentColor: '#60a5fa',
};

export const BYTEFLOW: ProjectRecord = {
  slug: 'byteflow',
  name: 'ByteFlow',
  category: 'Technology · Movement & Transmission Layer',
  shortDescription: 'The planned movement and transmission layer for lawful routing and structural transfer.',
  mission:
    'ByteFlow is the architecture’s planned answer to a simple question: once structure exists (ByteLite) and can be inspected (ByteSight), how does it move between systems without losing the guarantees it started with? ByteFlow is the layer responsible for lawful routing, synchronization, and efficient structural transfer.',
  status: 'Concept',
  lastValidated: UNDATED,
  currentCapabilities: [],
  inDevelopment: [],
  endGame: [
    'Lawful routing of structural artifacts between ByteLite LLC systems',
    'Synchronization guarantees that preserve deterministic identity across transfer',
    'Efficient structural transfer without re-deriving structure at each hop',
  ],
  validation: [
    'ByteFlow is a planned architectural layer with no implementation yet. It is described here as a target, not a current capability.',
  ],
  integrationReceives: ['Structural artifacts from ByteLite and ByteSight (planned)'],
  integrationProduces: ['Routed/synchronized structural transfers (planned)'],
  integrationConsumedBy: ['Cross-system movement within the ByteLite LLC architecture (planned)'],
  availability: 'Not publicly available',
  routes: ['/technologies/byteflow'],
  claimRestrictions: ['Not an implemented system. Planned architectural layer only.'],
  accentColor: '#34d399',
};

export const BYTECOST: ProjectRecord = {
  slug: 'bytecost',
  name: 'ByteCost',
  category: 'Technology · Burden & Value Layer',
  shortDescription: 'The planned cost, value, and burden-accounting layer for verified savings.',
  mission:
    'A savings claim is only meaningful if the cost it removed did not simply move somewhere else. ByteCost is the architecture’s planned layer for accounting burden, value, and consequence, so that "savings" and "efficiency" claims across ByteLite LLC systems stay tied to verified accounting rather than marketing arithmetic.',
  status: 'Concept',
  lastValidated: UNDATED,
  currentCapabilities: [],
  inDevelopment: [],
  endGame: [
    'Verified cost/burden accounting across deterministic transformations',
    'Consequence-aware optimization that will not report a "savings" claim it cannot account for',
    'Feeds structured cost data into governed action decisions (Genesis Goalkeeper)',
  ],
  validation: [
    'ByteCost is a planned architectural layer with no implementation yet. It is described here as a target, not a current capability.',
  ],
  integrationReceives: ['Transformation and transfer events from ByteLite, ByteSight, ByteFlow (planned)'],
  integrationProduces: ['Verified burden/value accounting records (planned)'],
  integrationConsumedBy: ['Genesis Goalkeeper (planned, for consequence-aware governance)'],
  availability: 'Not publicly available',
  routes: ['/technologies/bytecost'],
  claimRestrictions: ['Not an implemented system. Planned architectural layer only.'],
  accentColor: '#fbbf24',
};

export const DEEP_KORE: ProjectRecord = {
  slug: 'deep-kore',
  name: 'Deep Kore',
  category: 'Technology · Deterministic Reasoning Substrate',
  shortDescription: 'A private deterministic reasoning substrate for lawful structure, relation edges, and auditability.',
  mission:
    'Deep Kore exists to keep reasoning inspectable. Instead of a black-box model that sounds confident, Deep Kore is designed to preserve source, uncertainty, relation, dependency, and contradiction state before anything is said or done. AIya is the human-facing layer built on top of it.',
  status: 'Internal Validation',
  lastValidated: UNDATED,
  currentCapabilities: [
    { label: 'Structured submission intake with rate-limited logging (internal research endpoint)', evidence: 'Implemented' },
  ],
  inDevelopment: [
    'Relation-edge representation and controlled answer selection',
    'Conversation-envelope handling for the AIya interaction layer',
    'Auditability and provenance tracking across reasoning steps',
  ],
  endGame: [
    'A deterministic reasoning substrate that closes dependencies before producing output or recommending action',
    'Goal processing and controlled composition governed by Genesis Goalkeeper',
    'A memory architecture that separates temporary state, durable memory, canon, and superseded records so learning cannot corrupt root law',
  ],
  validation: [
    'Private research only. Not a public AI product. No architecture details are disclosed publicly.',
    'Safety-first and proof-gated principles govern all research; internal mechanisms remain private during validation.',
    'Not a claim of human-equivalent reasoning, consciousness, or finished AGI.',
  ],
  integrationReceives: ['Structural input from ByteLite/ByteSight (planned)', 'User-facing prompts via AIya'],
  integrationProduces: ['Governed reasoning output routed through Genesis Goalkeeper before emission'],
  integrationConsumedBy: ['AIya (human-facing interface)', 'Cordel Connect (AIya wingman feature)'],
  availability: 'Internal research',
  routes: ['/technologies/deep-kore'],
  claimRestrictions: [
    'Not a public AI product.',
    'Not a claim that finished AGI exists.',
    'Not a public commercial product.',
  ],
  accentColor: '#a78bfa',
};

export const AIYA: ProjectRecord = {
  slug: 'aiya',
  name: 'AIya',
  category: 'Technology · Human-Facing Interaction Layer (Deep Kore)',
  shortDescription: 'The human-facing interaction layer built over Deep Kore. "The mouth does not rewrite the bones."',
  mission:
    'AIya exists so that Deep Kore’s governed reasoning has a way to communicate with people directly — asking, explaining, and acting only through governed system boundaries, never improvising past what the underlying reasoning has actually closed.',
  status: 'Prototype',
  lastValidated: UNDATED,
  currentCapabilities: [
    { label: 'Research-preview onboarding and chat-style interface screens inside private Cordel Connect test builds', evidence: 'Implemented' },
  ],
  inDevelopment: [
    'Structured, goal-oriented conversation flows',
    'Context-envelope handling shared with Deep Kore',
    'Emotionally appropriate presentation within governed limits',
  ],
  endGame: [
    'A full conversational interaction layer for Cordel Connect (the "wingman" role) that never pretends to be a real person',
    'Seasonal/holiday visual variants where product-relevant',
    'Progression toward more natural communication while remaining strictly bound by Genesis Goalkeeper governance',
  ],
  validation: [
    'Explicitly labeled "Research Preview — Not Production AI" wherever it currently appears in Cordel Connect.',
    'No live AI companion, automated matching system, or production guidance system is deployed.',
  ],
  integrationReceives: ['Governed output from Deep Kore'],
  integrationProduces: ['User-facing conversation and guidance surfaces'],
  integrationConsumedBy: ['Cordel Connect'],
  availability: 'Internal research',
  routes: ['/technologies/deep-kore/aiya'],
  claimRestrictions: [
    'Not a production AI system.',
    'Never presented as a real person.',
    'Not the entirety of Deep Kore — AIya is one interaction layer over it.',
  ],
  accentColor: '#f472b6',
  heroImage: '/cordel/cordel-aiya-portrait.png',
  heroImageAlt: 'AIya, the human-facing interaction layer built over Deep Kore',
};

export const GENESIS_GOALKEEPER: ProjectRecord = {
  slug: 'genesis-goalkeeper',
  name: 'Genesis Goalkeeper',
  category: 'Technology · Governance Layer (Deep Kore)',
  shortDescription: 'The meaning and action-law layer that decides whether an output or action may cross into the world.',
  mission:
    'Genesis Goalkeeper exists because reasoning is not permission. It is the layer that evaluates truth, consent, harm, authority, identity, and uncertainty before anything Deep Kore or AIya produces is allowed to reach a person or trigger an action — and it is designed to halt intrinsically rather than proceed on a guess.',
  status: 'Concept',
  lastValidated: UNDATED,
  currentCapabilities: [],
  inDevelopment: [
    'Intrinsic-halting rules (stop on unresolved consent, authority, identity, or harm accounting — never on an arbitrary cap)',
    'Scoped action-envelope requirements for any external effect',
  ],
  endGame: [
    'A governance rail that runs alongside the entire ByteLite LLC stack, gating every output and action',
    'Illegal-state prevention by design rather than after-the-fact moderation',
    'Full audit trail preservation for every governed decision',
  ],
  validation: [
    'Conceptual/architectural description only; no public implementation exists yet.',
    'Not a decorative ethics wrapper or a generic moderation/retry/monitoring layer bolted onto an otherwise unrestricted system — it is the governance rail described in the ByteLite LLC architecture.',
  ],
  integrationReceives: ['Candidate outputs/actions from Deep Kore and AIya (planned)'],
  integrationProduces: ['Allow / restrain / halt decisions with audit records (planned)'],
  integrationConsumedBy: ['Every system in the stack that emits output or takes action'],
  availability: 'Internal research',
  routes: ['/technologies/deep-kore/genesis-goalkeeper'],
  claimRestrictions: ['Not an implemented moderation system. Architectural concept only.'],
  accentColor: '#fb923c',
  heroImage: '/technologies/genesis-goalkeeper-scoped-action-envelope-diagram.svg',
  heroImageAlt: 'Scoped Action Envelope diagram: a proposed external action contained by ten required fields (what is requested, who is affected, what authority allows it, and more) and a Governance Gate that authorizes, requests clarification, or restrains/halts the action',
};

export const BYTEORACLE: ProjectRecord = {
  slug: 'byteoracle',
  name: 'ByteOracle',
  category: 'Technology · Deterministic Astronomical Interpretation',
  shortDescription: 'A deterministic astronomical-interpretation concept feeding Cordel Connect horoscope features.',
  mission:
    'ByteOracle is the name for ByteLite LLC’s deterministic approach to astrological content: calculate astronomical state locally and generate original, reproducible interpretations, rather than scraping third-party horoscope text or depending on a hosted language model at runtime.',
  status: 'Concept',
  lastValidated: UNDATED,
  currentCapabilities: [
    { label: 'Zodiac sign derived from a user’s birthday inside Cordel Connect', evidence: 'Implemented' },
    { label: 'A daily horoscope surface inside Cordel Connect private test builds', evidence: 'Implemented' },
  ],
  inDevelopment: [
    'Formalizing the local astronomical calculation approach under the ByteOracle name',
    'Deterministic interpretation generation (as opposed to templated or scraped text)',
  ],
  endGame: [
    'Daily readings for 12 individual signs, generated deterministically rather than scraped',
    'An ordered compatibility matrix (144 sign-pair readings) for match compatibility framing',
    '156 canonical records per date (12 individual + 144 ordered-pair readings) as the target reproducible output set',
    'Provenance-preserving, reproducible output suitable for future standalone or licensed use',
  ],
  validation: [
    'The only currently evidenced capability is the existing Cordel Connect horoscope/zodiac feature described above.',
    'The 12/144/156-record target output described in End-Game Functionality Goals is a design target, not a shipped capability, and should not be read as a current claim.',
    'No runtime scraping or third-party LLM dependency is claimed to exist for this feature; this is an intended property of the end-game design, not an audited fact.',
  ],
  integrationReceives: ['User birthday (for sign derivation)', 'Calendar date (for daily reading generation)'],
  integrationProduces: ['Zodiac sign', 'Daily horoscope text', 'Planned: ordered compatibility readings'],
  integrationConsumedBy: ['Cordel Connect ("ByteOracle Horoscopes")'],
  availability: 'Not publicly available',
  routes: ['/technologies/byteoracle'],
  claimRestrictions: [
    'Not a claim that the full 156-record deterministic output set is currently generated.',
    'Not generic fortune-teller content — positioned as a deterministic, reproducible interpretation system.',
  ],
  accentColor: '#a78bfa',
  heroImage: '/technologies/byteoracle-deterministic-orbit-diagram.svg',
  heroImageAlt: 'Geometric diagram of calculated celestial positions on concentric rings, representing local deterministic astronomical calculation',
};

export const ALL_TECHNOLOGIES: ProjectRecord[] = [
  BYTELITE,
  BYTESIGHT,
  DEEP_KORE,
  AIYA,
  GENESIS_GOALKEEPER,
  BYTEORACLE,
  BYTEFLOW,
  BYTECOST,
];

export const CORDEL_PLAY: ProjectRecord = {
  slug: 'cordel-play',
  name: 'Cordel Play',
  category: 'Product · Consent-Forward Adult Board Game',
  shortDescription: 'A premium consent-first adult social board game for private groups of 2 to 18 players.',
  mission:
    'Cordel Play exists to make consent and pacing structural parts of the game itself — not something a group has to negotiate separately — through a six-tier escalation system, the standing Consent Cup, and Decree cards any player can use at any time.',
  status: 'Prototype',
  lastValidated: UNDATED,
  currentCapabilities: [
    { label: 'Complete product design: six escalation tiers, three board configurations, Decree deck, Consent Cup', evidence: 'Implemented' },
  ],
  inDevelopment: ['Manufacturing preparation', 'Final component sourcing and packaging'],
  endGame: [
    'Retail-ready manufactured product across board, card, and component sets',
    'Founder preorder / reservation availability ahead of general retail release',
    'Integration touchpoints with Cordel Connect',
  ],
  validation: [
    'Product design is complete; manufacturing is in preparation.',
    'No retail release date has been announced. No public purchase is currently available.',
  ],
  integrationReceives: [],
  integrationProduces: [],
  integrationConsumedBy: ['Cordel Connect (companion app touchpoints)'],
  availability: 'Not publicly available',
  routes: [
    '/products/cordel-play',
    '/products/cordel-play/how-it-plays',
    '/products/cordel-play/editions',
    '/products/cordel-play/components',
    '/products/cordel-play/consent-architecture',
    '/products/cordel-play/development-status',
    '/products/cordel-play/preorder',
  ],
  claimRestrictions: ['Not currently for sale at retail.'],
  accentColor: '#f472b6',
  heroImage: '/cordel/cordel-play-group-lifestyle-scene.webp',
  heroImageAlt: 'Friends gathered around a table for a private Cordel Play session',
};

export const CORDEL_CONNECT: ProjectRecord = {
  slug: 'cordel-connect',
  name: 'Cordel Connect',
  category: 'Product · Privacy-First Compatibility and Connection',
  shortDescription: 'A private-test digital companion built around deep compatibility, cryptographically split privacy, and safety-first date planning.',
  mission:
    'Cordel Connect exists to fix three things most dating apps treat as afterthoughts: whether two people are actually compatible, whether your private answers stay private even from the platform itself, and whether you are safer meeting someone from the app in real life.',
  status: 'Private Test',
  lastValidated: UNDATED,
  currentCapabilities: [
    { label: 'Private Android test builds with login, discover, matches, messages, profile, and settings surfaces', evidence: 'Implemented' },
    { label: 'Compatibility questionnaire (~75 starter questions, extensible to hundreds)', evidence: 'Implemented' },
    { label: 'Two-party secret-sharing privacy model for sensitive answers', evidence: 'Implemented' },
    { label: 'Live-location check-ins, emergency contacts, and a spoken safety phrase', evidence: 'Implemented' },
  ],
  inDevelopment: [
    'Safety hub, game room, date hub, and friendship features',
    'Cartoonized profile photo transformation',
    'AIya wingman conversational interface',
    'ByteOracle horoscope integration',
  ],
  endGame: [
    'Public beta and eventual public app-store release',
    'Full Blind Date Roulette (Treater / Treatie / Dutch) flow with restaurant integration',
    'Complete cartoonized-profile system with paid/consent-based original-photo reveal',
  ],
  validation: [
    'Private Android test builds only. No public app store listing.',
    'A full app-specific privacy policy will be published before any public launch or broader beta release.',
  ],
  integrationReceives: ['AIya (wingman)', 'ByteOracle (horoscopes)', 'ByteSight (planned photo adapter)'],
  integrationProduces: ['Match/compatibility results', 'Date-planning flows'],
  integrationConsumedBy: [],
  availability: 'Private test',
  routes: [
    '/products/cordel-connect',
    '/products/cordel-connect/compatibility-and-matching',
    '/products/cordel-connect/privacy-architecture',
    '/products/cordel-connect/safety',
    '/products/cordel-connect/cartoonized-profiles',
    '/products/cordel-connect/aiya-and-aion',
    '/products/cordel-connect/games-and-shared-activities',
    '/products/cordel-connect/byteoracle-horoscopes',
    '/products/cordel-connect/date-planning',
    '/products/cordel-connect/date-planning/blind-date-roulette',
    '/products/cordel-connect/date-planning/restaurants',
    '/products/cordel-connect/date-planning/restaurants/partner-program',
  ],
  claimRestrictions: ['Not on any public app store.', 'Not a finished/production AI product (AIya).'],
  accentColor: '#818cf8',
};

export const RESTAURANT_PARTNER_PROGRAM: ProjectRecord = {
  slug: 'restaurant-partner-program',
  name: 'Cordel Restaurant Partner Program',
  category: 'Product · B2B Pilot (Cordel Connect / Date Planning)',
  shortDescription: 'A self-serve pilot letting restaurants become featured Cordel Connect date suggestions.',
  mission:
    'The Restaurant Partner Program exists to give Cordel Connect real, honestly-labeled date suggestions, funded by restaurants who opt in — never disguised as a neutral pick.',
  status: 'Public Beta',
  lastValidated: UNDATED,
  currentCapabilities: [
    { label: 'Self-serve signup, templated profile builder, and deal configuration', evidence: 'Implemented' },
    { label: '$20 one-time pilot payment via Stripe (test mode during pilot)', evidence: 'Implemented' },
    { label: 'Manual review gate before any paid listing goes live', evidence: 'Implemented' },
  ],
  inDevelopment: ['Ongoing (post-pilot) placement pricing', 'Premium / multi-location tiers', 'Self-serve editing after go-live'],
  endGame: ['Ongoing placement pricing tiers', 'Deeper integration with Blind Date Roulette'],
  validation: ['Live pilot at /products/cordel-connect/date-planning/restaurants/partner-program. Stripe payments run in test mode during the pilot.'],
  integrationReceives: ['Restaurant profile and deal submissions'],
  integrationProduces: ['Featured, labeled restaurant suggestions'],
  integrationConsumedBy: ['Cordel Connect (Date Planning / Restaurants)'],
  availability: 'Public beta',
  routes: ['/products/cordel-connect/date-planning/restaurants/partner-program'],
  claimRestrictions: ['Only the $20 pilot price is decided; all other pricing is explicitly "to be set."', 'Paid does not mean auto-published — every listing passes manual review.'],
  accentColor: '#ec4899',
};

export const ALL_PRODUCTS: ProjectRecord[] = [CORDEL_PLAY, CORDEL_CONNECT];

export const ALL_PROJECTS: ProjectRecord[] = [...ALL_TECHNOLOGIES, ...ALL_PRODUCTS, RESTAURANT_PARTNER_PROGRAM];
