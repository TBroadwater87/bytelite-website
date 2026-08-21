# Dependency Security Audit Record

Verified record of the npm dependency-security posture for `bytelite-website`.
Update this file whenever an audit is re-run; do not restate its numbers elsewhere.

---

## Latest verified audit

| Field               | Value                                                                             |
| ------------------- | --------------------------------------------------------------------------------- |
| Audit date          | 2026-08-21                                                                        |
| Commit audited      | `1efecbc` (pre-remediation) → remediated in this pass                             |
| Package manager     | npm 11.5.2, Node v22.15.1                                                         |
| Commands            | `npm audit --json`, `npm audit --omit=dev --json`                                 |
| Remediation applied | `npm audit fix` (no `--force`), plus an explicit patch of `vitest` / `@vitest/ui` |

### Counts

| Scope                                  | Before | After |
| -------------------------------------- | ------ | ----- |
| Full tree — total                      | 25     | **4** |
| Full tree — critical                   | 2      | **0** |
| Full tree — high                       | 18     | **2** |
| Full tree — moderate                   | 3      | **0** |
| Full tree — low                        | 2      | **2** |
| Production-only (`--omit=dev`) — total | 18     | **4** |
| Production-only — critical             | 0      | **0** |
| Production-only — high                 | 14     | **2** |

### Reachability of the 4 remaining findings

| Classification                                         | Count                            |
| ------------------------------------------------------ | -------------------------------- |
| `REMOTELY_REACHABLE_RUNTIME`                           | **0**                            |
| `LOCAL_OR_BUILD_TIME_ONLY`                             | 2 (`sharp`, `esbuild`)           |
| `TRANSITIVE_AND_NOT_REACHABLE_IN_CURRENT_ARCHITECTURE` | 2 (`astro`, `@astrojs/tailwind`) |
| `DEV_ONLY`                                             | 0                                |
| `UNKNOWN_REACHABILITY`                                 | 0                                |
| `FALSE_OR_NONAPPLICABLE_TO_CURRENT_USAGE`              | 0                                |

---

## Deployment threat model (the basis for every reachability call above)

Established from repository and production evidence, not assumption:

1. **No server runtime is deployed.** `astro.config.mjs` sets no `adapter` and no `output`, so the
   build is fully static. `dist/` contains no `_worker.js`, no functions directory, and no SSR
   entry.
2. **No request-time rendering exists.** All HTML is generated at build time from
   author-controlled content committed to this repository. There is no reflection surface for a
   request-time XSS.
3. **No deployed endpoint accepts input.** Verified against production on 2026-08-21:
   `GET/POST /api/contact` → 404, `GET /api/compress` → 404, `GET /_image` → 404. Only
   `/api/deepkore-submit` responds, and it is a static JSON file.
4. **No public upload flow reaches this repository.** The restaurant portal
   (`src/components/RestaurantSignup.tsx`) posts uploads to the external `api.thebytelite.com`
   backend, which is a separate system outside this repo's dependency tree.
5. **No untrusted remote images are fetched or parsed.** No `image.domains` or
   `image.remotePatterns` are configured, so remote image optimization is not enabled.

---

## sharp / libvips conclusion

**The deployed site does not expose untrusted input to `sharp` or `libvips`.**

Evidence:

- `sharp` is a **devDependency** (`^0.34.5`), used only as Astro's build-time image service
  (`image.service.entrypoint: 'astro/assets/services/sharp'`).
- **It does not execute during this build at all.** No file in `src/` imports `astro:assets`,
  `<Image>`, `<Picture>`, or `getImage`, and no file imports anything from `src/assets/`. A
  production build emits **0 processed images** into `dist/_astro`. Every image on the site is a
  static file in `public/` referenced by a plain `<img src>`, which Astro copies verbatim.
- `src/components/OptimizedImage.astro` exists but is referenced by **no page**; it is dead code
  and does not use `astro:assets` in any case.
- Vercel does not execute the library after build: there is no runtime, and `/_image` is 404.
- Any residual exposure is therefore limited to build time, over image files committed to this
  repository by its author — a trusted input set.

**Why it was not upgraded.** `sharp@0.35.3` is the fixed version and is semver-major from
`^0.34.5`. This was tested rather than assumed: installing it left a **second, nested
`sharp@0.34.5`** under `node_modules/astro`, because `astro@5.18.2` declares
`optionalDependencies.sharp: "^0.34.0"`. The audit count did not move. The upgrade adds a
duplicate ~100MB native dependency without removing the vulnerable code, so it was reverted.
**The sharp finding is gated behind the Astro major upgrade below.**

---

## Remaining findings

### 1. `astro` — high — `TRANSITIVE_AND_NOT_REACHABLE_IN_CURRENT_ARCHITECTURE`

- Installed `5.18.2` (raised from `5.15.6` in this pass, which cleared 6 of the original
  advisories). Fix for the rest is `astro@7.2.4`, **two major versions**.
- Every remaining advisory targets a feature this site does not use. Verified by search:

  | Advisory                                 | Feature                              | Uses in `src/`                                                                                             |
  | ---------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
  | GHSA-j687-52p2-xcff                      | `define:vars`                        | **0**                                                                                                      |
  | GHSA-xr5h-phrj-8vxv                      | server islands (`server:defer`)      | **0**                                                                                                      |
  | GHSA-jrpj-wcv7-9fh9, GHSA-f48w-9m4c-m7f5 | spread props on elements (`{...x}`)  | **0**                                                                                                      |
  | GHSA-7pw4-f3q4-r2p2, GHSA-4g3v-8h47-v7g6 | `transition:*` / ClientRouter        | **0**                                                                                                      |
  | GHSA-2pvr-wf23-7pc7                      | Host-header SSRF in error-page fetch | requires a running Astro server; none is deployed                                                          |
  | GHSA-8hv8-536x-4wqp                      | unescaped **slot name**              | 2 uses, both static literals (`name="header"`, `name="footer"`); requires an attacker-controlled slot name |

- **Not upgraded because** Astro 7 is a coordinated four-package migration, not a patch:
  `@astrojs/tailwind@5.1.5` declares peer `astro: ^3 || ^4 || ^5` and does not support Astro 6+,
  so it would need `@astrojs/tailwind@6.0.2` (major, and the Tailwind integration was
  restructured upstream), plus `@astrojs/react` 4.3.0 → 6.0.4 (two majors) and
  `@astrojs/sitemap` → 3.7.3.
- **Recommended future action:** schedule the Astro 6→7 migration as its own engineering task
  with a full regression run. It also clears `sharp`, `esbuild`, and `@astrojs/tailwind` below.

### 2. `sharp` — high — `LOCAL_OR_BUILD_TIME_ONLY`

See the sharp/libvips section above. Gated behind the Astro upgrade.

### 3. `esbuild` — low — `LOCAL_OR_BUILD_TIME_ONLY`

- GHSA-g7r4-m6w7-qqqr: arbitrary file read **when running the dev server on Windows**.
- Nested under `node_modules/astro`. Affects `astro dev` on a developer machine only; never runs
  in CI or production. Fix requires `astro@7.2.4`.

### 4. `@astrojs/tailwind` — low — `TRANSITIVE_AND_NOT_REACHABLE_IN_CURRENT_ARCHITECTURE`

- Carries **no advisory of its own**; npm flags it solely because it depends on `astro`.
- npm's suggested "fix" is `@astrojs/tailwind@2.1.3`, which is a **downgrade** from the installed
  `5.1.5` and would break the build for no security benefit. Not applied.

---

## Changes applied in this pass

| Package                 | From   | To     | Reason                                                                 |
| ----------------------- | ------ | ------ | ---------------------------------------------------------------------- |
| `astro`                 | 5.15.6 | 5.18.2 | `npm audit fix`, within existing `^5.0.0`. Cleared 6 advisories.       |
| `vitest`                | 3.2.4  | 3.2.7  | Critical GHSA-5xrq-8626-4rwp (`<3.2.6`). Patch-level, within `^3.2.4`. |
| `@vitest/ui`            | 3.2.4  | 3.2.7  | Same advisory pair.                                                    |
| ~40 transitive packages | —      | —      | `npm audit fix` (no `--force`), lockfile only.                         |

`vitest` / `@vitest/ui` needed an explicit install because `npm audit fix` stalls on the
dependency cycle between them (each is listed `via` the other) and left both criticals in place.

**No `--force`, no overrides, and no `resolutions` entries were used.** `package.json` changed
only in the two `vitest` version ranges; everything else is lockfile.

---

## Behavior-preservation evidence

Production build output was hashed (SHA-256, every file) before and after the dependency changes:

```
files before: 338    files after: 338
added: 0    removed: 0    changed: 0
```

The upgrade produces **byte-identical public output**. No HTML, no client bundle, no route, and
no asset changed.

## Regression results after remediation

| Check                       | Result                                     |
| --------------------------- | ------------------------------------------ |
| Lint (`eslint .`)           | 0 errors, 24 warnings (unchanged baseline) |
| Typecheck (`astro check`)   | 0 errors, 0 warnings, 6 hints              |
| Unit (Vitest 3.2.7)         | 5/5 passed                                 |
| E2E (Playwright, 5 engines) | 795/795 passed                             |
| Production build            | 59 pages, clean                            |
| Broken internal links       | 0                                          |
| Horizontal overflow         | 0 across 320 route × viewport checks       |

`npm run format:check` reports pre-existing failures across the repo (including files untouched by
this pass, e.g. `tsconfig.json`); the repository is not Prettier-formatted and was not reformatted
here.
