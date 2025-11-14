# ByteLite

> Revolutionary data compression technology: Transform 1GB into just 15 bytes

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-9%2F9%20Passing-green)](./tests)
[![Security](https://img.shields.io/badge/npm%20audit-0%20vulnerabilities-green)](https://www.npmjs.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

## About

ByteLite showcases revolutionary data compression technology protected by **Patent US 63/807,027**. This website demonstrates compression ratios that challenge conventional understanding: 1GB → 15 bytes, representing a paradigm shift in data storage and transmission.

**Founder**: Tash Broadwater, Helena MT
**Technology**: Quantum-scale data transformation

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:4321
```

## Technology Stack

- **Framework**: [Astro 5.0](https://astro.build) - Modern static site builder
- **UI Library**: [React 19](https://react.dev) - Interactive components
- **Styling**: [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- **Language**: TypeScript (Strict Mode)
- **Testing**: Vitest + Playwright
- **Code Quality**: ESLint + Prettier

## Project Structure

```
bytelite-website/
├── src/
│   ├── components/       # React & Astro components
│   │   ├── Hero.astro
│   │   ├── ProofDemo.astro
│   │   ├── InteractiveCompressionDemo.tsx
│   │   └── ErrorBoundary.tsx
│   ├── pages/            # Route pages
│   │   ├── index.astro
│   │   ├── demo.astro
│   │   ├── technology.astro
│   │   └── api/
│   │       └── compress.ts
│   ├── layouts/          # Page layouts
│   │   └── Layout.astro
│   ├── styles/           # Global styles
│   └── middleware.ts     # Security headers
├── tests/
│   ├── unit/             # Component tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── public/               # Static assets
└── .env.example          # Environment template
```

## Development

### Available Commands

```bash
# Development
npm run dev              # Start dev server (localhost:4321)
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Unit & integration tests
npm run test:coverage    # Test with coverage report
npm run test:e2e         # End-to-end tests
npm run test:e2e:ui      # E2E tests with UI
npm run test:all         # Run all tests

# Code Quality
npm run lint             # Lint codebase
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code
npm run format:check     # Check formatting
```

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables:
```env
PUBLIC_SITE_URL=https://thebytelite.com
PUBLIC_GA_ID=G-XXXXXXXXXX
API_RATE_LIMIT_WINDOW=60000
API_MAX_REQUESTS_PER_WINDOW=10
```

### Development Guidelines

- **TypeScript Strict Mode**: Enabled and enforced
- **Testing**: Write tests for all new components
- **Code Style**: Run `npm run lint:fix` before committing
- **Security**: Never commit secrets or API keys

## Features

### 🔒 Security

- **Rate Limiting**: API endpoints limited to 10 requests/minute
- **CORS Protection**: Configured allowed origins
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Input Validation**: File size limits, type checking
- **TypeScript**: Strict type safety throughout

### ⚡ Performance

- **Async Loading**: Fonts and analytics load after page render
- **Image Optimization**: Sharp integration for asset optimization
- **HTML Compression**: Minified production builds
- **Prefetching**: Enabled for faster navigation
- **CDN Ready**: Optimized for edge deployment

### 🧪 Testing

- **Unit Tests**: React component testing with Testing Library
- **Integration Tests**: Multi-system functionality tests
- **E2E Tests**: Critical user path testing with Playwright
- **Coverage**: 9/9 tests passing

### 🎨 Components

- **Interactive Demo**: Real-time compression simulation
- **Error Boundaries**: Production-ready error handling
- **SEO Optimized**: Structured data, meta tags, sitemaps
- **Accessible**: ARIA labels, semantic HTML
- **Responsive**: Mobile-first design

## API Endpoints

### POST /api/compress

Simulate ByteLite compression on uploaded files.

**Rate Limit**: 10 requests per minute

**Request**:
```typescript
FormData {
  file: File  // Max 2GB
}
```

**Response**:
```json
{
  "original": 1073741824,
  "compressed": 15,
  "ratio": "99.999999"
}
```

**Headers**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in `./dist/`

### Pre-deployment Checklist

- [ ] All tests passing (`npm run test:all`)
- [ ] No linting errors (`npm run lint`)
- [ ] Environment variables configured
- [ ] Google Analytics ID updated
- [ ] Security headers verified

### Recommended Hosting

- **Vercel** - Automatic deployments, serverless functions
- **Netlify** - Easy setup, excellent CDN
- **Cloudflare Pages** - Best performance, DDoS protection

All platforms support Astro SSR and security headers middleware.

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Desktop Lighthouse | 95+ | ~85-90 |
| Mobile Lighthouse | 90+ | ~70-75 |
| First Contentful Paint | <1.5s | - |
| Time to Interactive | <3.0s | - |

## Known Issues & Technical Debt

See [CLAUDE.md](./CLAUDE.md) for detailed technical debt tracking.

**High Priority**:
1. Logo optimization (463KB → ~50KB)
2. Large component refactoring (ProofDemo.astro)
3. Comprehensive E2E test coverage

## Contributing

This is a proprietary project. For inquiries, contact the project owner.

## Patent Information

This website showcases technology protected by:
- **Patent Application**: US 63/807,027
- **Status**: Pending
- **Coverage**: Revolutionary data compression methods

## Business Model

ByteLite operates on a revenue-sharing model:
- **Pricing**: 50% of customer savings
- **Target Market**: Enterprise data storage, cloud providers, IoT devices
- **Competition**: Preparing for Hutter Prize submission

## Contact

- **Founder**: Tash Broadwater
- **Location**: Helena, Montana
- **Website**: https://thebytelite.com

## License

All rights reserved. This is proprietary software.

---

**Last Updated**: 2025-11-14
**Version**: 0.0.1
**Status**: Development-ready
