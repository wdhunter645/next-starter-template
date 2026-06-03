# Launch readiness validation (T50)

Issue: [#1112](https://github.com/wdhunter645/next-starter-template/issues/1112)

This folder owns the **launch readiness manifest** consumed by `scripts/assess.mjs` and the
`scripts/launch-readiness/run.mjs` orchestrator.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run verify:invariants` | Header/nav/footer source invariants (`scripts/ci/verify_lgfc_invariants.mjs`) |
| `npm run assess` | Static export build + route/marker/footer checks |
| `npm run launch-readiness:unit` | Vitest manifest + D1/B2 fail-closed + homepage structure |
| `npm run launch-readiness:e2e` | Playwright public + Fan Club route smoke (requires `out/` from build) |
| `npm run launch-readiness` | Full local suite (unit + assess + e2e) |

Install browsers once before the first e2e run: `npx playwright install chromium`.

## Merge ordering

- **T48** (`/admin/matchup`, PR #1212) should merge to `main` before the **T50 PR** merges.
- Until then, `/admin/matchup` remains in `conditionalRoutes` (validated only when the static file exists).

## Reports

Machine output is written under `reports/launch-readiness/` (gitignored). Attach the summary to the T50 PR handoff.
