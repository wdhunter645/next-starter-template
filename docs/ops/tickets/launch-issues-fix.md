---
Doc Type: Operations
Audience: Human + AI
Authority Level: Operational Authority
Owns: Launch-blocking fixes for fanclub logo route, root metadata identity, and search page copy
Does Not Own: FanClub auth flow, search backend implementation, Cloudflare binding changes
Canonical Reference: /docs/ops/OPERATING_MANUAL.md
Last Reviewed: 2026-03-26
---

# Launch Issues Fix — Fanclub Logo Route, Metadata, Search Copy

## Objective
Resolve three launch-blocking issues: ensure the FanClub floating logo routes to the public homepage, remove starter-template identity drift from production metadata, and replace placeholder search copy with production-safe language.

## Scope
- `src/app/fanclub/page.tsx` — change `FloatingLogo` `homeRoute` prop from `/fanclub` to `/`
- `src/app/layout.tsx` — update root `metadata` title and description to LGFC production values
- `src/app/search/page.tsx` — replace placeholder help text and input copy with public-facing language
- `package.json` — update `description` and `homepage` to production values
- `next.config.ts` — clarify comments to reflect production intent (no runtime changes)
- `wrangler.toml` — clarify comments to reflect production intent (no runtime changes)

## Out of Scope
- Search backend or results implementation
- FanClub auth flow or member gating
- Cloudflare D1 bindings or rate limiter changes
- Navigation structure or routing hierarchy

## Acceptance Criteria
- `FloatingLogo` on the fanclub page routes to `/`
- Root metadata title reads "Lou Gehrig Fan Club" and description is production-facing
- Search page help text and placeholder are public-safe with no CMS/placeholder language
- `package.json` `description` and `homepage` reflect the production LGFC site
- All linting passes with no ESLint errors or warnings
