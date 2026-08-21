# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
ByteLite is an Astro 5.0 website showcasing revolutionary data compression technology (1GB → 15 bytes, Patent US 63/807,027). The project uses TypeScript strict mode, React 19 for interactive components, and has comprehensive testing with Vitest and Playwright.

## Technology Stack
- **Framework**: Astro 5.0 with React 19 components
- **Styling**: Tailwind CSS
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Code Quality**: ESLint + Prettier with Astro support
- **Build Tool**: Vite with React plugin

## Project Structure
```
bytelite-website/
├── src/
│   ├── components/     # 20+ Astro & React components
│   ├── pages/          # 14 pages (282-548 lines each)
│   ├── layouts/        # Base layout with SEO
│   ├── styles/         # Global CSS and design tokens
│   └── middleware.ts   # Security headers middleware
├── tests/
│   ├── unit/           # Component unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # Playwright E2E tests
├── public/             # Static assets (logo, fonts)
└── 42 total source files
```

## Essential Commands

### Development
```bash
npm run dev              # Start dev server (localhost:4321)
npm run build            # Production build
npm run preview          # Preview production build locally
```

### Testing
```bash
npm run test             # Run unit & integration tests (Vitest)
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Generate test coverage report
npm run test:e2e         # Run E2E tests (Playwright, all browsers)
npm run test:e2e:ui      # Run E2E tests with Playwright UI
npm run test:all         # Run all tests with coverage

# Run single test file
npx vitest tests/unit/ErrorBoundary.test.tsx
npx vitest tests/unit/ErrorBoundary.test.tsx --ui

# Run single E2E test
npx playwright test tests/e2e/homepage.spec.ts
npx playwright test tests/e2e/homepage.spec.ts --ui --project=chromium
```

### Code Quality
```bash
npm run lint             # ESLint + Astro check + TypeScript validation
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## Architecture

### Key Architectural Patterns

**Middleware Security Layer** (`src/middleware.ts`)
- All responses pass through security middleware
- Adds CSP, HSTS (prod only), X-Frame-Options, etc.
- Applied automatically to all routes

**API Rate Limiting** (`src/pages/api/compress.ts`)
- In-memory rate limiting (10 req/min per IP)
- CORS with allowlist for origins
- File upload validation (max 2GB)
- Production note: Use Redis for distributed rate limiting

**Component Architecture**
- Astro components for static/SSG content (`.astro`)
- React components for interactivity (`.tsx`)
- React components wrapped in ErrorBoundary for production safety
- Path aliases configured in `vitest.config.ts`:
  - `@/` → `src/`
  - `@components` → `src/components`
  - `@layouts` → `src/layouts`

**Testing Strategy**
- Unit tests in `tests/unit/` (React components with Testing Library)
- Integration tests in `tests/integration/`
- E2E tests in `tests/e2e/` (Playwright, 5 browser configs)
- Vitest setup file: `tests/setup.ts`

### Current Status
- Security headers middleware operational
- TypeScript strict mode enforced
- Tests: 5/5 unit (Vitest), 795/795 E2E (Playwright, 5 browser engines)
- Dependency security status: see latest verified audit record in
  `qa/security/dependency-audit.md`

**API routes are not deployed.** The build has no adapter and no `output` setting, so Astro
emits a fully static site. `src/pages/api/compress.ts` and `src/pages/api/contact.ts` are
POST-only and emit nothing; both return 404 in production. Their in-memory rate limiting and
validation therefore protect nothing today and must not be cited as a deployed control. Only
`/api/deepkore-submit` exists, and only as a prerendered static JSON file.

## Known Technical Debt

### High Priority
1. **Logo Optimization**: `public/bytelite-logo.png` is 463KB (target: ~50KB WebP)
2. **Component Refactoring**: `ProofDemo.astro` is 938 lines (target: <300 lines per component)
3. **E2E Coverage**: Only basic E2E tests exist, need comprehensive scenarios

### Medium Priority
4. **Rate Limiting**: API uses in-memory rate limiting; switch to Redis for production
5. **Error Monitoring**: Sentry placeholder exists in ErrorBoundary, needs implementation
6. **Font Loading**: Currently Google Fonts; consider self-hosting for better performance

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Critical Variables:**
- `PUBLIC_SITE_URL`: Production URL (used in sitemap, canonical links)
- `PUBLIC_GA_ID`: Google Analytics tracking ID
- `API_RATE_LIMIT_WINDOW`: Rate limit window in ms (default: 60000)
- `API_MAX_REQUESTS_PER_WINDOW`: Max API requests per window (default: 10)
- `API_MAX_FILE_SIZE`: Max upload size in bytes (default: 2147483648 = 2GB)

## Development Guidelines

### TypeScript Strict Mode (ENFORCED)
TypeScript strict mode is enabled with additional strictness settings:
- `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- `noImplicitReturns`, `noImplicitThis`, `noUnusedLocals`, `noUnusedParameters`
- All optional properties must be explicitly typed
- Use type guards for runtime type checking

### Component Development
- **Static content**: Use `.astro` components
- **Interactive elements**: Use `.tsx` React components
- Always wrap React components in `<ErrorBoundary>` when used in production
- Target: Keep components under 300 lines (refactor if larger)
- Use path aliases: `@components`, `@layouts`, `@/`

### Testing Requirements
- Write tests for all new React components (use Testing Library)
- Add E2E tests for critical user flows
- Run `npm run test:all` before committing
- Aim for >80% code coverage

## Canonical Data Law

Three modules under `src/data/` are the single source of truth for anything the site asserts.
Never restate one of these facts inline in a page — import it, so it cannot drift between pages.

| Module | Owns | Never hardcode in a page |
|---|---|---|
| `src/data/projects.ts` | Every project's status, capabilities, validation statements, availability, routes | Technology/project counts (`TECHNOLOGY_COUNT_WORD`, `PUBLIC_PROJECT_COUNT_WORD`), status labels, validation prose |
| `src/data/company.ts` | Company identity and dates | "Founded" years — `RESEARCH_BEGAN_YEAR` (2024, when the work began) and `LEGAL_FORMATION_YEAR` (2025, the LLC) are **not interchangeable** and must never collapse into one "founded" year |
| `src/data/research.ts` | Research publication metadata, the canonical progression figure, the maturity table, evidence vocabulary, bibliography, disclosure language | Research route paths (`RESEARCH_ROUTES`), disclosure-boundary wording, publication date/version |

`ProjectRecord.validation` is a list of `ValidationStatement`s, each tagged `evidence` or
`limitation` via the `evidence()` / `limitation()` helpers. `/progress/validation-evidence`
regroups them into a public ledger — it never filters, so a negative finding cannot be dropped by
adding a statement in the wrong place.

**Public evidence rule**: commit ids stay (they anchor a result to a state of the work); local
paths, drive letters, build locations, and branch plumbing do not. Translate a branch discrepancy
into its evidentiary meaning ("integration parity has not been qualified") rather than describing
the repository layout.

## Research Section

`/research`, `/research/deterministic-structural-cognition` (the public thesis), and
`/research/plain-english`. Shared components live in `src/components/research/`. The thesis's
section ids, numbers, titles, and table of contents all render from one `SECTION` map in the page,
so a renamed section cannot leave a dead anchor.

Research pages state hypotheses; they must never state capability. Anything that exists belongs in
`projects.ts` and is surfaced through Current Status and Validation Evidence.

## Important Context

**Multi-Version System**: NOT IMPLEMENTED. Ignore any legacy documentation mentioning "Commercial/Lighthouse/Strategic" versions. The project is a single unified website.

**Business Context:**
- Patent US 63/807,027 (pending) - Revolutionary compression technology
- Founder: Tash Broadwater, Helena MT
- Revenue model: 50% of customer savings
- Competing in Hutter Prize

**Performance Targets:**
- Desktop Lighthouse: 95+ (current: ~85-90)
- Mobile Lighthouse: 90+ (current: ~70-75)
- First Contentful Paint: <1.5s
- Time to Interactive: <3.0s

## Deployment

### Build & Preview
```bash
npm run build           # Creates ./dist directory
npm run preview         # Test production build locally
```

### Pre-deployment Checklist
1. All tests pass: `npm run test:all`
2. No linting errors: `npm run lint`
3. Successful build: `npm run build`
4. Environment variables configured for production
5. Logo optimization complete (see technical debt)

### Recommended Hosting
All platforms support Astro SSR and middleware security headers:
- **Vercel**: Automatic deployments, serverless functions
- **Netlify**: Easy setup, excellent CDN
- **Cloudflare Pages**: Best performance, DDoS protection

---

**Last Updated**: 2025-11-14
**Status**: Production-ready (pending logo optimization and expanded E2E tests)
