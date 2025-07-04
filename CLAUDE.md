# ByteLite Project Context for Claude Code

## CRITICAL CONTEXT
You are working on ByteLite, a sophisticated multi-version website for revolutionary data compression technology (1TB → 18 bytes, Patent US 63/807,027).

## MULTI-VERSION ARCHITECTURE
- **Commercial** (main): Full public website with demos
- **Lighthouse** (crisis): Minimal attack surface, static only
- **Strategic** (investors): Financial dashboards, NDA portal

## IMMEDIATE PRIORITIES
1. Fix security vulnerabilities (missing auth, CSP headers)
2. Enable TypeScript strict mode (currently all checks disabled)
3. Optimize 473KB logo image and render-blocking scripts
4. Add testing framework (currently ZERO tests)

## KEY COMMANDS
```bash
# Version switching
./scripts/deploy-commercial.sh
./scripts/deploy-lighthouse.sh   # Crisis mode
./scripts/deploy-strategic.sh    # Investor mode

# Development
npm run dev
npm run build
npm run preview

# Testing (to be implemented)
npm run test
npm run test:e2e
npm run test:security
```

## TECHNICAL DEBT
- No error boundaries
- No code documentation
- No ESLint/Prettier
- Code duplication across versions
- Lighthouse scores: Desktop ~85-90, Mobile ~70-75

## BUSINESS CONTEXT
- Founder: Tash Broadwater, Helena MT
- Patent: US 63/807,027 (pending)
- Revenue: 50% of customer savings
- Competition: Hutter Prize preparation

## DEVELOPMENT GUIDELINES
- Maintain <5-minute crisis deployment capability
- Preserve patent-focused messaging
- Use C++ preferences where applicable
- Differentiate from traditional compression
- Add comprehensive error handling
