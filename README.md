# ByteLite Website

Source for the public ByteLite website at **https://www.thebytelite.com**.

This is a website repository. It is not the ByteLite compression engine, and it contains no
part of it.

> **This repository is public.** Never commit a secret value. Never add anything here that the
> IP boundary in `CLAUDE.md` section 3 forbids publishing.

## About ByteLite

ByteLite is being developed as a deterministic lossless representation architecture, with the
target of producing a smaller, self-contained representation from which the exact original can
be reconstructed. It implements Bit Motion Encoding (BME), a deterministic recursive
motion-encoding architecture with stream-built foundations.

That target is a **research target, not a completed public proof**. The mechanisms required to
realize it are still under active development and validation. ByteLite has not been
independently validated and is not production-qualified.

Patent US 63/807,027 (pending). Founder: Tash Broadwater, Helena MT.

The website's job is to hold that distinction steady - what ByteLite is being built to do,
versus what is actually proven today - and the test suite enforces it in both directions.

## Read these before changing anything

| File | Purpose |
|---|---|
| **`CLAUDE.md`** | Canonical law. Public scope, claim law, IP boundary, pricing, deployment, contact, tests. Read first. |
| **`OWNER_README.md`** | Operational continuity. Architecture, what each external service does, deployment and recovery commands, current open blockers. |

## Technology

- [Astro 5](https://astro.build) - static build, no adapter, no SSR
- [React 19](https://react.dev) - interactive islands only
- [Tailwind CSS](https://tailwindcss.com)
- TypeScript, strict mode
- [Vitest](https://vitest.dev) unit tests, [Playwright](https://playwright.dev) E2E across 5 browser engines
- ESLint + Prettier

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
```

## Commands

```bash
npm run build              # production static build -> ./dist
npm run preview            # serve the production build locally

npx vitest run             # unit tests
npx astro check            # Astro/template diagnostics
npx tsc --noEmit           # TypeScript
npx eslint .               # lint
npx playwright test        # full E2E suite
npm run test:e2e:clean     # E2E, clearing a stale preview server this repo owns first

npm run format             # Prettier
```

## Architecture

A static Astro build plus exactly one server-side function.

```
src/
  components/   Astro and React components; teaching diagrams in components/bytelite/
  pages/        Routes. Six are public; the rest are retired from discovery, not deleted.
  layouts/      Base layout with SEO and the noindex switch
  data/         Canonical facts. Single source of truth - never restate these inline.
  styles/       Global CSS and design tokens
  middleware.ts Header policy record; inert in a static build (see OWNER_README section 17)
api/
  contact.ts        POST /api/contact - Vercel Function
  health.ts         TEMPORARY migration probe; delete after the domain cutover
  _lib/
    contact-core.ts All contact logic: validation, limits, header-injection defence
tests/
  unit/         Vitest
  e2e/          Playwright
qa/             Dated evidence from prior QA passes. History, not instruction.
```

**Canonical data.** Anything the site asserts comes from `src/data/` - `bytelite.ts`,
`projects.ts`, `company.ts`, `research.ts`. Import those values; never hardcode a price, a
status label, a count, or a claim into a page, or the pages will drift apart.

**Public scope.** The site is ByteLite-only. Six discoverable routes: `/`, `/how-it-works`,
`/validation`, `/licensing`, `/about`, `/contact`, plus `/privacy` and `/terms` in the sitemap.
The build emits 68 HTML pages; 8 are in the sitemap, `/404.html` is the error page, and the
other 59 are served `noindex`. Those still return 200 so old links keep working, but they are
absent from the sitemap and linked from nowhere. See `CLAUDE.md` section 1.

## Contact form

`POST /api/contact` runs as a Vercel Function beside the static site and delivers through
SendGrid. All logic lives in `api/_lib/contact-core.ts`: input validation, size caps,
header-injection defence, and strict secret hygiene - the SendGrid credential is used in
exactly one place and never logged, never returned.

It requires three environment variables in Vercel Production, by name:

```
SENDGRID_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
```

If any is missing the route returns `503` and states plainly that nothing was sent. It never
reports a success that did not happen. A `202` means SendGrid queued the message - which is not
the same as an inbox receiving it.

## Deployment

Hosted on **Vercel**. Pushing to `main` triggers a production deployment through the GitHub
integration.

**Cloudflare provides DNS only.** It is not the host. Cloudflare Pages was used historically
and has been removed. Do not infer the hosting provider from the DNS provider, and do not
migrate hosting providers. See `OWNER_README.md` sections 4 and 6.

Before deploying: run the full test suite, and confirm the Vercel team and project explicitly
rather than assuming. `OWNER_README.md` section 5 has the exact commands.

## Environment

The three contact variables above are runtime secrets. They live only in the Vercel project's
Production environment - never in a `.env` file, and never in this repository.

`.env.example` lists six older build-time names (`PUBLIC_SITE_URL`, `PUBLIC_GA_ID`,
`PUBLIC_API_URL`, `API_RATE_LIMIT_WINDOW`, `API_MAX_REQUESTS_PER_WINDOW`, `API_MAX_FILE_SIZE`).
As of 2026-08-24 **none of them is read by any code in this repository** - the canonical site
URL is hardcoded in `astro.config.mjs`, no analytics tag is wired into the layout, and the
`API_*` limits belonged to a removed route. They are still set in Vercel. Do not wire them back
up without deciding they are actually wanted.

## License

All rights reserved. Proprietary.

## Contact

https://www.thebytelite.com/contact
