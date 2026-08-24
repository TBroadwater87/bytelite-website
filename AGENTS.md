# AGENTS.md

**The canonical law for this repository is [`CLAUDE.md`](./CLAUDE.md). Read it before touching
anything. It applies to every agent, not only to Claude.**

Operational detail - architecture, what each external service does, deployment and recovery
commands, and the current open blockers - is in [`OWNER_README.md`](./OWNER_README.md).

This file used to carry its own copy of the guidance. That copy drifted: it kept a stale
project structure, an unproven compression-ratio claim, a false statement that security-header
middleware was operational, and a hosting recommendation that invited migrating away from
Vercel - and it was missing the entire Owner Law, Public Scope Law and Canonical Data Law that
`CLAUDE.md` carries. Two law files that disagree is worse than one, so this is now a pointer
rather than a duplicate. Do not reintroduce a second copy here.

## The short version

- **Public scope.** thebytelite.com is a ByteLite-only site. Six discoverable routes. Do not
  restore portfolio scope, and do not name a sibling ByteLite LLC product on a public page.
- **Claim law.** Keep target, current state, internal proof, independent validation and
  production qualification distinct. Never narrow the target; never complete the proof. Never
  state a compression ratio as achieved.
- **IP boundary.** The site may say WHAT ByteLite intends to achieve, never HOW.
- **Hosting.** Vercel hosts. Cloudflare does DNS and inbound email routing. SendGrid sends
  outbound mail. GitHub holds the source. Never collapse those roles, and never infer the host
  from the DNS provider.
- **This repository is PUBLIC.** No secret values, ever.
- **Change law.** Never reset, clean, stash or discard work you did not create. Delete only
  what you can prove is unreferenced, unused, untested and superseded.

All of the above is stated in full, with its reasoning, in `CLAUDE.md`.
