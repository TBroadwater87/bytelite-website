#!/bin/bash
# Initialize Claude Code with comprehensive ByteLite project context

echo "Initializing Claude Code for ByteLite multi-version system..."

# Create CLAUDE.md for persistent project context
cat > CLAUDE.md << 'EOF'
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
EOF

# Create .claude-code.json for project-specific settings
cat > .claude-code.json << 'EOF'
{
  "project": "ByteLite Multi-Version System",
  "version": "1.0.0",
  "preferences": {
    "typescript": {
      "strict": true,
      "target": "ES2022"
    },
    "testing": {
      "framework": "vitest",
      "e2e": "playwright"
    },
    "security": {
      "headers": ["CSP", "HSTS", "X-Frame-Options"],
      "authentication": "required-for-deployment"
    }
  },
  "commands": {
    "dev": "npm run dev",
    "build": "npm run build",
    "test": "npm run test",
    "deploy-commercial": "./scripts/deploy-commercial.sh",
    "deploy-lighthouse": "./scripts/deploy-lighthouse.sh",
    "deploy-strategic": "./scripts/deploy-strategic.sh"
  },
  "priorities": [
    "security-vulnerabilities",
    "typescript-strict-mode",
    "performance-optimization",
    "testing-implementation"
  ]
}
EOF

echo "Claude Code initialization complete!"
echo "Project context saved to CLAUDE.md"
echo "Settings saved to .claude-code.json"
echo ""
echo "To start working with Claude Code:"
echo "1. Review CLAUDE.md for project context"
echo "2. Run 'npm install' to install dependencies"
echo "3. Fix TypeScript strict mode issues"
echo "4. Implement security headers"
echo "5. Add comprehensive testing"