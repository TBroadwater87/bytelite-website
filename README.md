# ByteLite LLC Website

Source for the ByteLite LLC company website at **https://www.thebytelite.com**.

This is a website repository. It contains no part of any research system, and nothing in it
connects to one.

> **This repository is public.** Never commit a secret value. Never add anything here that the
> IP boundary in `CLAUDE.md` section 3 forbids publishing.

## What the site does

It presents ByteLite LLC's research programs, a public milestone record, a sourced comparison
with mainstream AI, the company's products with their real availability, partnership routes and
the legal pages. Every status it shows comes from `src/data/milestones.ts`, and the tests enforce
that implementation, internal testing and independent verification are never presented as the
same thing.

## Read these before changing anything

| File | Purpose |
|---|---|
| **`CLAUDE.md`** | Canonical law: scope, naming, claims, IP boundary, pricing, deployment, contact, tests. Read first. |

## Technology

- [Astro 5](https://astro.build) - static build, no adapter, no SSR
- TypeScript, strict mode
- [Vitest](https://vitest.dev) unit tests, [Playwright](https://playwright.dev) E2E across 5 browser engines
- ESLint + Prettier
- No third-party fonts, scripts, analytics or cookies

## Commands

```bash
npm ci                     # install exactly what the lockfile records
npm run dev                # http://localhost:4321
npm run build              # production static build -> ./dist
npm run preview            # serve the production build locally

npx vitest run             # unit tests, including a disclosure scan of ./dist
npx astro check            # Astro/template diagnostics
npx tsc --noEmit           # TypeScript
npx eslint .               # lint
npx playwright test        # full E2E suite
```

Run `npm run build` before `npx vitest run`: the route and disclosure tests read `./dist`.
The disclosure tests also need `BYTELITE_DISCLOSURE_DENYLIST` set to the path of the owner's private
denylist file. The list is deliberately not in this public repository, and the tests fail without it.

## Architecture

```
src/
  components/      Header, Footer, and site/ components (status badges, milestone cards, classified figures)
  pages/           Routes; research/ holds the research section
  layouts/         Base layout: metadata, canonical URL, structured data
  data/            Canonical facts. Single source of truth - never restate these inline.
  styles/          Design tokens (tokens.css) and base styles (global.css)
api/
  contact.ts             POST /api/contact - SendGrid delivery
  checkout.ts            POST /api/checkout - refuses unless commerce is enabled at the server
  checkout-session.ts    GET  /api/checkout-session - confirms a Stripe session for the success page
  stripe-webhook.ts      POST /api/stripe-webhook - signature-verified events
  gone.ts                410 for retired URLs
tests/
  unit/            Vitest
  e2e/             Playwright
```

## Contact form

`POST /api/contact` runs as a Vercel Function beside the static site and delivers through
SendGrid. It requires three environment variables in Vercel Production, by name:

```
SENDGRID_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
```

If any is missing the route returns `503` and states that nothing was sent.

## Deployment

Hosted on **Vercel**. Pushing to `main` triggers production deployments through the GitHub
integration - see `CLAUDE.md` section 7 before any push, including the open question of which
Vercel project holds the domain. Cloudflare provides DNS and inbound mail routing only.

## License

All rights reserved. Proprietary.
