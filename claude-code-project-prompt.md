You are working on ByteLite, a sophisticated multi-version website system for a revolutionary data compression technology company. Here's the complete project context:

## PROJECT OVERVIEW
ByteLite claims breakthrough compression technology (1TB → 18 bytes) with patent US 63/807,027. The website uses a strategic multi-version architecture to handle different business scenarios and stakeholder requirements.

## TECHNICAL ARCHITECTURE
- **Framework**: Astro 5.0.0 (SSG/SSR) + React 19.1.0 components
- **Styling**: Tailwind CSS 3.4.0
- **Language**: TypeScript (currently loose config - needs strict mode)
- **Hosting**: Vercel with custom domain thebytelite.com
- **Deployment**: PowerShell scripts for rapid version switching

## MULTI-VERSION SYSTEM
The project maintains three distinct website versions:

1. **COMMERCIAL VERSION** (main branch)
   - Full-featured public website
   - Interactive compression demonstrations
   - Technical documentation and patent information
   - Enterprise contact systems and developer resources

2. **LIGHTHOUSE VERSION** (lighthouse branch)
   - Crisis response mode with minimal attack surface
   - Static content only, no JavaScript interactions
   - Maximum IP protection and legal disclaimers
   - Emergency contact protocols only

3. **STRATEGIC VERSION** (strategic branch)
   - Investor relations focused
   - Financial dashboards and ROI calculators
   - Due diligence portal with NDA-protected content
   - Market analysis and competitive positioning

## CRITICAL ISSUES IDENTIFIED
Based on recent technical audit:

### Security Vulnerabilities:
- PowerShell scripts use ExecutionPolicy Bypass (security risk)
- Missing security headers (CSP, CORS, HSTS)
- No authentication for version switching control panel
- Forms lack server-side validation

### Code Quality Issues:
- TypeScript strict mode disabled (all strict checks off)
- No error boundaries or comprehensive error handling
- Inconsistent styling and code duplication across versions
- Missing type safety throughout codebase

### Performance Problems:
- Large unoptimized logo image (473KB PNG)
- Render-blocking third-party scripts (Google Analytics, Fonts)
- Missing lazy loading implementation
- Estimated Lighthouse scores: Desktop ~85-90, Mobile ~70-75

### Testing & Maintainability:
- ZERO tests (unit, integration, or e2e)
- No code documentation or inline comments
- No ESLint, Prettier, or code quality tools
- No CI/CD pipeline or development standards

## KEY TECHNOLOGIES & CONCEPTS
- **Segmented Domain Dictionary (SDD)**: Core compression algorithm
- **Recursive Szudzik Pairing**: Mathematical transformation method
- **Patent Protection**: US Provisional 63/807,027 integration
- **Crisis Response**: <5-minute deployment switching capability
- **Hutter Prize**: Compression competition preparation

## DEVELOPMENT PRIORITIES
1. **Immediate**: Fix security vulnerabilities, enable TypeScript strict mode
2. **Short-term**: Add comprehensive testing, optimize performance
3. **Long-term**: Consolidate architecture, establish engineering standards

## BUSINESS CONTEXT
- **Founder**: Tash Broadwater, Helena MT
- **Patent Status**: US 63/807,027 pending
- **Revenue Model**: 50% of customer cost savings
- **Competition**: Hutter Prize submission preparation
- **Deployment Strategy**: Crisis-ready multi-version system

## PROJECT STRUCTURE
Please analyze the complete codebase including:
- Source code (src/ directory)
- Configuration files (astro.config, tsconfig, package.json)
- Deployment scripts (PowerShell files)
- Static assets (images, fonts, etc.)
- Documentation files
- Branch differences between main/lighthouse/strategic

## DEVELOPMENT APPROACH
- Focus on C++ preferences where applicable
- Use heredocs for command-line instructions
- Maintain patent-focused messaging throughout
- Differentiate from traditional compression methods
- Ensure crisis response capabilities remain intact

## CURRENT NEEDS
The project requires immediate engineering maturity improvements while maintaining its sophisticated multi-version deployment strategy for handling various business scenarios (viral attention, legal scrutiny, investor interest).

Please provide comprehensive analysis and recommendations for improving code quality, security, performance, and maintainability while preserving the strategic flexibility that makes this system valuable.