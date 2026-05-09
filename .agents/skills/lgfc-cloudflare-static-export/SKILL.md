# LGFC Cloudflare Static Export Skill

Use this skill for Next.js build, API, route handler, middleware, Cloudflare Pages, D1, static export, or deployment compatibility changes.

## Hosting constraint

The LGFC public site is built for Cloudflare Pages static export. Preserve static export compatibility unless the source Issue explicitly changes hosting architecture.

## Procedure

1. Check `next.config` and build scripts before changing runtime behavior.
2. Do not add server-only dependencies or runtime-only route behavior without explicit authorization.
3. Do not add App Router route handlers for static-export paths unless the architecture explicitly supports them.
4. Preserve `_routes.json` and Cloudflare Pages behavior unless explicitly in scope.
5. Treat D1, B2, Workers, Pages Functions, and API-like behavior as architecture-sensitive.
6. Do not add new environment variables without documenting public/private handling and deployment impact.
7. Run build and type checks when runtime files change.

## Required checks

Use the checks appropriate to the changed files:

- `npm run build`
- `npm run typecheck`
- `npm test`
- Targeted Playwright or Vitest checks when applicable.

## Stop conditions

Stop and request correction when:

- The change breaks static export.
- The requested behavior requires server runtime not approved by the source Issue.
- The change introduces environment variables without an approved environment strategy.
- The change conflicts with Cloudflare Pages deployment constraints.
