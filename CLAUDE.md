# ByteLite Project Context for Claude Code

## Project Overview
ByteLite is a sophisticated Astro-based website showcasing revolutionary data compression technology (1GB → 15 bytes, Patent US 63/807,027). The project is a modern, TypeScript-strict, fully-tested web application built with performance and security in mind.

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

## Key Commands
```bash
# Development
npm run dev              # Start dev server (localhost:4321)
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Unit & integration tests (Vitest)
npm run test:coverage    # Test coverage report
npm run test:e2e         # End-to-end tests (Playwright)
npm run test:e2e:ui      # E2E tests with UI
npm run test:all         # All tests with coverage

# Code Quality
npm run lint             # ESLint + Astro check + TypeScript
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## Current Status

### ✅ Completed Features

#### Security
- **Security Headers**: Production middleware with CSP, HSTS, X-Frame-Options, etc.
- **API Protection**: Rate limiting (10 req/min), CORS, input validation, file size limits
- **TypeScript Strict Mode**: Full type safety with noImplicitAny, noUncheckedIndexedAccess
- **Dependency Security**: Zero npm vulnerabilities

#### Testing
- **Unit Tests**: React component testing with Testing Library
- **Integration Tests**: Multi-version system mock tests
- **E2E Tests**: Playwright tests for critical user paths
- **All Tests Passing**: 9/9 tests green ✓

#### Code Quality
- **ESLint**: Configured with TypeScript, Astro, and accessibility plugins
- **Prettier**: Code formatting with Astro plugin
- **Error Handling**: ErrorBoundary component with async support
- **Environment Config**: .env.example with all configuration options

#### Performance
- **Async Font Loading**: Google Fonts load after page render
- **Async Analytics**: Google Analytics loads after page load
- **Image Optimization**: Sharp configured for Astro
- **HTML Compression**: Enabled in build
- **Prefetching**: Configured for better navigation

### 🚧 Known Technical Debt

#### High Priority
1. **Logo Optimization**: bytelite-logo.png is 463KB (should be ~50KB WebP)
2. **Large Components**: ProofDemo.astro (938 lines) needs refactoring
3. **Missing Font Files**: Layout.astro references non-existent local font files
4. **E2E Test Coverage**: Need more comprehensive E2E test scenarios

#### Medium Priority
5. **Component Documentation**: Add JSDoc comments to components
6. **API Documentation**: Document API endpoints and rate limits
7. **Monitoring**: Integrate error monitoring (Sentry placeholder in ErrorBoundary)
8. **Self-hosted Fonts**: Move Google Fonts to self-hosted for better performance

### ⚠️ Important Notes

#### Multi-Version System
**Status**: NOT IMPLEMENTED

The previous documentation mentioned a "Commercial/Lighthouse/Strategic" multi-version deployment system. **This does not currently exist.** The project is a single unified website.

If multi-version functionality is needed in the future:
- Implement feature flags via environment variables
- Create deployment scripts (deploy-commercial.sh, etc.)
- Add version switching logic
- Estimated effort: 2-3 weeks

For now, ignore references to this system in legacy documentation.

#### Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your actual values
```

Critical variables:
- `PUBLIC_GA_ID`: Google Analytics tracking ID
- `PUBLIC_SITE_URL`: Production site URL
- `API_RATE_LIMIT_WINDOW`: Rate limit window (default: 60000ms)
- `API_MAX_REQUESTS_PER_WINDOW`: Max requests per window (default: 10)

## Development Guidelines

### TypeScript
- Strict mode is ENABLED and ENFORCED
- No implicit any allowed
- All optional properties must be explicitly typed
- Use type guards for runtime type checking

### Component Development
- Use Astro components for static content
- Use React components for interactivity
- Wrap React components in ErrorBoundary for production safety
- Keep components under 300 lines (refactor if larger)

### Testing
- Write tests for all new React components
- E2E tests for critical user paths
- Aim for >80% code coverage
- Run tests before committing: `npm run test:all`

### Code Style
- Run `npm run lint:fix` before committing
- Run `npm run format` to auto-format code
- Follow existing patterns in codebase
- Use semantic HTML and ARIA labels

### Security
- Never commit secrets or API keys
- Validate all user inputs
- Use environment variables for configuration
- Test API endpoints with rate limiting

## Business Context
- **Founder**: Tash Broadwater, Helena MT
- **Patent**: US 63/807,027 (pending)
- **Technology**: Revolutionary compression (1GB → 15 bytes)
- **Revenue Model**: 50% of customer savings
- **Competition**: Preparing for Hutter Prize

## Performance Targets
- **Desktop Lighthouse**: 95+ (currently ~85-90)
- **Mobile Lighthouse**: 90+ (currently ~70-75)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.0s

## Deployment

### Build Process
```bash
npm run build           # Creates ./dist directory
npm run preview         # Test production build locally
```

### Production Checklist
- [ ] Update `.env` with production values
- [ ] Run `npm run test:all` - all tests pass
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Optimize logo image (manual step - see technical debt)
- [ ] Configure hosting platform security headers (middleware handles most)
- [ ] Set up error monitoring
- [ ] Configure CI/CD pipeline

### Hosting Recommendations
- **Vercel**: Automatic deployments, edge functions support
- **Netlify**: Easy setup, good CDN
- **Cloudflare Pages**: Excellent performance, DDoS protection

All support Astro SSR and will work with the middleware security headers.

## Getting Help
- Astro Docs: https://docs.astro.build
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- Project Issues: Check git commit history for context

## Recent Improvements
See `IMPROVEMENTS-IMPLEMENTED.md` for detailed list of recent changes including:
- NPM vulnerability fixes
- Test infrastructure setup and fixes
- ESLint/Prettier configuration
- API security enhancements
- Environment variable configuration
- Production security headers middleware

---

**Last Updated**: 2025-11-14
**Project Status**: Development-ready, production-ready pending logo optimization and comprehensive E2E tests
