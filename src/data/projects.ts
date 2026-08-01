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
  shortDescription: 'A deterministic visual-structure and inspection engine for images, regions, and provenance, with an active desktop workbench.',
  mission:
    'ByteSight exists to give the architecture a deterministic way to represent what an image actually contains — regions, boundaries, provenance, and transformation history — instead of a black-box classifier score. Vision claims should be inspectable the same way file claims are.',
  status: 'Internal Validation',
  lastValidated: '2026-07-31 (internal; commit 654de66)',
  currentCapabilities: [
    { label: 'Deterministic image partitioning into discrete regions connected by an explicit adjacency and parent/child graph, with hash-verified reproducibility across runs and sessions — including one real non-determinism bug that was found and fixed during testing', evidence: 'Internally Validated' },
    { label: 'Region-boundary closure validated for exact, byte-identical reconstruction; construction is refused rather than silently degraded if this check fails', evidence: 'Internally Validated' },
    { label: 'A reproducible, bijective canonical partition export format (structured manifest plus raster) for general, non-facial image partitions, exercised by the desktop workbench', evidence: 'Internally Validated' },
    { label: 'Ten general object/material roles (e.g. skin, hair, cloth, background) classified per region and used at render time', evidence: 'Internally Validated' },
    { label: 'Saved settings and presets verified to round-trip to identical values on reload, tested field-by-field', evidence: 'Internally Validated' },
    { label: 'An interactive native desktop workbench for layer editing, pixel-level region correction (in-app painting or imported mask), and an annotation review lifecycle (draft/reviewed/accepted/rejected/superseded), with atomic, audit-trailed saves', evidence: 'Internally Validated' },
    { label: 'Manual authoring and exhaustive validation of six facial-region categories (eyes, eyebrows, nose, mouth, hairline, facial hair) via in-app painting or imported masks — always human-marked, never automatically detected', evidence: 'Internally Validated' },
  ],
  inDevelopment: [
    'Relationally positioned pixel evidence (describing a pixel by its exact structural relationship — adjacent, contained, directional offset — to other known points in the same image); implemented and passing tests as of the current build, but not yet in the stable, committed proof corpus',
    'Wiring the 13-category facial-annotation taxonomy into the renderer — it currently exists for manual authoring and validation only, and is not yet consulted when rendering output',
    'An output-composition layer for Cordel-style profile photos (crop, framing, sizing) — not yet built',
    'Automatic-mode testing against real uploaded photos — current automatic-path testing uses synthetic images; a real close-up portrait test recorded a known failure (zero facial features detected), the same photo shape a dating-profile picture would use',
  ],
  endGame: [
    'Full Cordel Connect photo-transformation readiness, including tested performance on real close-up portrait photos',
    'The facial-region taxonomy wired into the renderer rather than annotation-only',
    'Relationally positioned pixel evidence promoted from active development into the stable proof corpus',
    'A production adapter feeding Cordel Connect\'s cartoonized-profile feature and Deep Kore ingest',
  ],
  validation: [
    'Internal validation, 2026-07-31 (commit 654de66, local C++/CMake build): deterministic partitioning, boundary closure, canonical export, saved-work round-trip, and manual facial-region authoring are covered by the automated test suite and dedicated proof artifacts, including one documented case of a real non-determinism bug found and fixed.',
    'No biometric face-matching, identity-recognition, or machine-learning training exists anywhere in this system — confirmed by an explicit in-code architectural disclaimer and by direct inspection; facial regions are always human-marked, never automatically detected.',
    'A real test on a close-up portrait photo recorded a known failure (zero facial features detected) — this is a documented current limitation, not a resolved capability.',
    'Not independently verified by a party outside ByteLite LLC.',
    'Not a claim of complete Cordel Connect photo-transformation readiness — the output-composition layer for profile-photo delivery is not yet built.',
  ],
  integrationReceives: ['Raw images and visual media'],
  integrationProduces: ['Region/boundary structural output and canonical partition exports', 'Provenance-tagged, audit-trailed correction records'],
  integrationConsumedBy: ['Deep Kore (planned ingest)', 'Cordel Connect (contract defined for a photo/cartoonizer adapter; not yet integrated end-to-end)'],
  availability: 'Internal research',
  routes: ['/technologies/bytesight'],
  claimRestrictions: [
    'Not machine learning, generative AI, or a probabilistic classifier — confirmed deterministic, rule-based structural representation, with no neural network or learned-model code found anywhere in the system.',
    'Not biometric face recognition or identity matching — no such capability exists; the codebase contains an explicit disclaimer that identity recognition is out of scope and never attempted.',
    'Not complete Cordel Connect transformation readiness — a known gap exists on close-up portrait photos.',
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
  lastValidated: '2026-07-31 (internal; commit 00e9c6a)',
  currentCapabilities: [
    { label: 'Deterministic, rule-based classification of conversational claims into structural types (e.g. direct fact, reported claim, belief, conditional claim, negated fact) — not statistical or predictive classification', evidence: 'Internally Validated' },
    { label: 'A closed, named taxonomy of 32 inquiry types (e.g. comparison, condition, procedure, prediction, recommendation); 19 currently route to a live answer, the remaining 13 are recognized and typed but not yet live-routed', evidence: 'Implemented' },
    { label: 'A mandatory two-stage governance gate that every user-facing response passes through before it can be shown, enforced by a tested single-owner invariant with no bypass path', evidence: 'Internally Validated' },
    { label: 'A versioned context-envelope contract for what data crosses the Deep Kore/Cordel boundary, including a stateless mode verified by an automated test to store nothing beyond a single request', evidence: 'Internally Validated' },
    { label: 'Hash-based provenance records attached to processing history, and deterministic replay verified by the full automated test suite', evidence: 'Internally Validated' },
    { label: 'Design conventions that avoid storing personally identifying information in internal structures, verified for the specific conversational path used by Cordel Connect', evidence: 'Implemented' },
  ],
  inDevelopment: [
    'Routing the remaining 13 of 32 recognized inquiry types (e.g. condition, consequence, hypothetical, procedure, recommendation) to live answers — currently typed and contract-validated only',
    'Reconciling the Cordel Connect integration: the app repository\'s two active branches currently disagree — one has the corrected canonical build path and a passing migration test, the other still points at a retired build location',
    'Relation-preservation and contradiction-detection features beyond their current typed/structural representation',
  ],
  endGame: [
    'All 32 inquiry types routed to live, governed answers',
    'Goal processing and controlled composition governed by Genesis Goalkeeper',
    'A memory architecture that separates temporary state, durable memory, canon, and superseded records so learning cannot corrupt root law',
    'One reconciled, single source of truth for Cordel Connect\'s Deep Kore integration across all branches',
  ],
  validation: [
    'Internal validation, 2026-07-31 (commit 00e9c6a, local Windows/CMake build): the full registered automated test suite (195 tests) passed with zero failures against the current build, independently confirmed from the current on-disk test log.',
    'A claimed second, byte-identical reproduction of that same run ("reproduced twice") appears only in documentation from the same rebuild session; it is not independently re-confirmable from artifacts that currently exist on disk.',
    'Private research only. No architecture, algorithm, or resolver internals are disclosed publicly.',
    'Not a claim of human-equivalent reasoning, consciousness, sentience, or finished AGI — this is a deterministic, rule-based structural-processing system, not a learned general model. No such claim exists anywhere in the current codebase or documentation.',
    'Not a claim that Cordel Connect\'s Deep Kore integration is presently consistent everywhere — the app repository\'s two active branches currently target different build locations.',
    'Not independently verified by a party outside ByteLite LLC.',
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
    'Not a claim of one fully reconciled Cordel Connect integration — two active branches of the app repository currently disagree on this.',
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
  lastValidated: '2026-07-31 (internal; commit 16147d8)',
  currentCapabilities: [
    { label: 'Research-preview onboarding and chat-style interface screens inside private Cordel Connect test builds', evidence: 'Implemented' },
    { label: 'A backend bridge that invokes Deep Kore\'s governed conversational engine as a local subprocess, tested with real (non-mocked) process execution, on the branch the app is currently deployed from', evidence: 'Internally Validated' },
    { label: 'Ephemeral-by-default conversation handling for this bridge — verified by an automated test confirming no session file is written to disk for a governed turn', evidence: 'Internally Validated' },
  ],
  inDevelopment: [
    'Structured, goal-oriented conversation flows',
    'Context-envelope handling shared with Deep Kore',
    'Emotionally appropriate presentation within governed limits',
    'Reconciling this bridge with the app repository\'s other active branch, which still points at a retired Deep Kore build location',
  ],
  endGame: [
    'A full conversational interaction layer for Cordel Connect (the "wingman" role) that never pretends to be a real person',
    'Seasonal/holiday visual variants where product-relevant',
    'Progression toward more natural communication while remaining strictly bound by Genesis Goalkeeper governance',
  ],
  validation: [
    'Internal validation, 2026-07-31 (commit 16147d8): the AIya-to-Deep-Kore backend bridge was updated to the canonical Deep Kore build and covered by a passing automated test using real process execution (not mocked), on the branch the app is currently deployed from.',
    'Explicitly labeled "Research Preview — Not Production AI" wherever it currently appears in Cordel Connect.',
    'No live AI companion, automated matching system, or production guidance system is deployed.',
    'Not independently verified by a party outside ByteLite LLC.',
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
  heroImage: '/cordel/cordel-aiya-portrait.webp',
  heroImageAlt: 'AIya, the human-facing interaction layer built over Deep Kore',
};

export const GENESIS_GOALKEEPER: ProjectRecord = {
  slug: 'genesis-goalkeeper',
  name: 'Genesis Goalkeeper',
  category: 'Technology · Governance Layer (Deep Kore)',
  shortDescription: 'The meaning and action-law layer that decides whether an output or action may cross into the world.',
  mission:
    'Genesis Goalkeeper exists because reasoning is not permission. It is the layer that evaluates truth, consent, harm, authority, identity, and uncertainty before anything Deep Kore or AIya produces is allowed to reach a person or trigger an action — and it is designed to halt intrinsically rather than proceed on a guess.',
  status: 'Internal Validation',
  lastValidated: '2026-07-31 (internal; commit 00e9c6a)',
  currentCapabilities: [
    { label: 'A mandatory two-stage governance gate (semantic validation, then emission validation) that every Deep-Kore-routed response must pass before it can reach a user, implemented and covered by the automated test suite', evidence: 'Internally Validated' },
    { label: 'A single-owner invariant enforced and tested — no other code path is permitted to emit a response directly, bypassing governance', evidence: 'Internally Validated' },
    { label: 'Every governed response stamped with a verifiable, deterministically computed marker', evidence: 'Internally Validated' },
  ],
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
    'Internal validation, 2026-07-31 (commit 00e9c6a): a two-stage governance gate and a single-owner emission invariant are implemented and covered by the automated test suite (part of the 195-test suite passing with zero failures).',
    'Not a decorative ethics wrapper or a generic moderation/retry/monitoring layer bolted onto an otherwise unrestricted system — it is the governance rail described in the ByteLite LLC architecture.',
    'Not a claim that the full intrinsic-halting design (halting specifically on unresolved consent, authority, identity, or harm accounting) is proven end-to-end — the tested evidence covers the governance gate and emission-stamping mechanism, not every halting condition described in the architecture.',
    'Not independently verified by a party outside ByteLite LLC.',
  ],
  integrationReceives: ['Candidate outputs from Deep Kore\'s conversational pipeline, gated before emission'],
  integrationProduces: ['Allow/halt decisions with a verifiable stamp attached to each governed response'],
  integrationConsumedBy: ['Every system in the stack that emits output or takes action'],
  availability: 'Internal research',
  routes: ['/technologies/deep-kore/genesis-goalkeeper'],
  claimRestrictions: [
    'Not a claim that every intrinsic-halting condition described in the architecture has been proven — the tested evidence covers the governance gate mechanism itself.',
    'Not a public product of any kind.',
  ],
  accentColor: '#fb923c',
  heroImage: '/technologies/genesis-goalkeeper-scoped-action-envelope-diagram.svg',
  heroImageAlt: 'Scoped Action Envelope diagram: a proposed external action contained by ten required fields (what is requested, who is affected, what authority allows it, and more) and a Governance Gate that authorizes, requests clarification, or restrains/halts the action',
};

export const BYTEORACLE: ProjectRecord = {
  slug: 'byteoracle',
  name: 'ByteOracle',
  category: 'Technology · Deterministic Astronomical Interpretation',
  shortDescription: 'A deterministic astronomical-calculation and interpretation engine feeding Cordel Connect horoscope features.',
  mission:
    'ByteOracle calculates astronomical state locally and composes original, reproducible astrological readings from that state, rather than scraping third-party horoscope text or depending on a hosted language model at runtime.',
  status: 'Internal Validation',
  lastValidated: '2026-07-31 (internal)',
  currentCapabilities: [
    { label: 'A 9-stage deterministic astronomical calculation pipeline (geometric state through event epochs) for the Sun, Moon, and eight planets, internally cross-checked layer-by-layer against the independent CSPICE (NASA/NAIF) and SOFA (IAU) reference libraries across the full 1900-2099 date grid', evidence: 'Internally Validated' },
    { label: '156 records generated per calendar date — 12 individual sign readings plus 144 ordered compatibility pairs — confirmed directional (a reading from sign A to B differs from B to A) and free of duplicate rows', evidence: 'Internally Validated' },
    { label: 'Deterministic regeneration: rerunning generation for the same date is tested to produce byte-identical text and hashes', evidence: 'Internally Validated' },
    { label: 'Backend integration code (database schema, API routes, and a subprocess bridge into the calculation engine) implemented and tested on the app repository\'s git-canonical branch', evidence: 'Implemented' },
  ],
  inDevelopment: [
    'Reconciling backend integration onto the branch the app is actually deployed from — the tested integration above currently exists on a different branch than the one currently checked out for deployment',
    'A committed, published historical archive (only an untracked local development archive exists today)',
    'Consent-gated personalization using birth time/location, beyond the current per-sign generic records',
    'Consolidating ByteOracle into its own canonical repository — it does not have one yet; its engine currently lives inside a Deep Kore development checkout and its app integration inside the Cordel Connect app repository',
  ],
  endGame: [
    'A dedicated canonical ByteOracle repository, separated from Deep Kore and the app repository',
    'The tested backend integration live on whichever branch actually serves users',
    'A published, versioned historical archive with a stated coverage range',
    'Consent-gated personalized readings using birth time and location',
  ],
  validation: [
    'Internal validation, 2026-07-25/26 (ORACLE_VALIDATION_REPORT.md): the 9-stage calculation pipeline was cross-checked layer-by-layer against CSPICE and SOFA over the full 1900-2099 civil-date grid; all reported comparisons passed. This is internal cross-checking against independent reference libraries, not third-party or external certification.',
    'Internal validation, 2026-07-30 (app-repository test suite, commit abf4641): 156-record generation, directional compatibility text, duplicate-safe writes, and deterministic regeneration are covered by passing automated tests.',
    'Not currently confirmed live for end users — implemented and tested on a development branch, not confirmed present on the branch the app is deployed from.',
    'Not a claim of scientific, medical, financial, or relationship prediction — this is deterministic content generation from calculated astronomical state.',
    'Not independently verified by a party outside ByteLite LLC.',
  ],
  integrationReceives: ['User birthday (for sign derivation)', 'Calendar date (for daily reading generation)'],
  integrationProduces: ['Zodiac sign', '156 daily records (12 individual + 144 ordered compatibility pairs)'],
  integrationConsumedBy: ['Cordel Connect ("ByteOracle Horoscopes"), on the branch where this integration has been merged'],
  availability: 'Not publicly available',
  routes: ['/technologies/byteoracle'],
  claimRestrictions: [
    'Not scientifically validated astronomy or astrology — internal cross-checking against reference calculation libraries, not external certification.',
    'Not currently confirmed live for end users — see Validation and Evidence for the branch caveat.',
    'Not personalized beyond zodiac sign today — no birth-time/location-based personalization exists yet.',
    'Does not call any external AI/language model at generation time.',
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
    'Cordel Play exists to make consent and pacing structural parts of the game itself — not something a group has to negotiate separately — through a six-tier escalation system, the standing Consent Cup, and a Decree deck where escape is a real, spendable resource rather than a free pass.',
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
    { label: 'Check-in pins on a map and emergency contact management inside the safety hub', evidence: 'Implemented' },
  ],
  inDevelopment: [
    'Live-location sharing with trusted contacts (location is captured today but not yet delivered anywhere a contact can see it)',
    'An active spoken safety phrase (a phrase can be saved today, but saying it does not yet trigger an alert)',
    'Game room, date hub, and friendship features',
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
