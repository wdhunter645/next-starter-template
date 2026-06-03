<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1112

## Documentation source
- DIATAXIS_ROUTED

Source files used:
- `docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `docs/governance/PR_PROCESS.md` (assessment harness section)
- `scripts/launch-readiness/README.md`

## Design source of truth
- `docs/reference/design/LGFC-Production-Design-and-Standards.md`

## Merge ordering (required)
- PR #1212 (T48 matchup admin) merged to `main` before this PR.
- Post-merge: `npm run launch-readiness` on `main` validates `/admin/matchup` (no longer conditional-only).

## File-touch allowlist
- `scripts/launch-readiness/README.md`
- `scripts/launch-readiness/manifest.json`
- `scripts/launch-readiness/run.mjs`
- `scripts/assess.mjs`
- `tests/e2e/launch-readiness-public-routes.spec.ts`
- `tests/e2e/launch-readiness-fanclub-routes.spec.ts`
- `tests/e2e/homepage-sections.spec.ts`
- `tests/launch-readiness-manifest.test.ts`
- `playwright.config.ts`
- `package.json`

## CHANGE SUMMARY
Prepares **T50 — Launch readiness QA and production validation suite**:

| Deliverable | Purpose |
|-------------|---------|
| `scripts/launch-readiness/manifest.json` | Static export route contract, footer markers, Playwright route lists |
| `scripts/launch-readiness/run.mjs` | Orchestrates invariants, unit bundle, assess, conditional routes, optional e2e |
| `npm run launch-readiness*` | Operator entry points documented in README |
| Playwright route smoke | Public + Fan Club shells, homepage sections, mobile nav |
| Manifest unit tests | Ensures every `src/app` route is covered |

`scripts/assess.mjs` now reads the launch-readiness manifest (restores the missing assess manifest path).

## BUILD / TEST / VERIFICATION
| Command | Result |
|---------|--------|
| `npm run launch-readiness:unit` | PASS (47 tests) |
| `npm run assess` | PASS |
| `npm run launch-readiness -- --skip-e2e` | PASS |
| `npm run launch-readiness:e2e` | PASS (36 tests; requires `npx playwright install chromium`) |

Gate verification:
- Commit-level workflow runs inspected: YES
- PR-level governance/accounting workflows inspected: YES
- Failed job logs inspected for every failing gate: YES (post-merge metadata gaps remediated)
- Required gates rerun or re-evaluated after fixes: YES

Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] All public routes validated (Playwright + static export manifest)
- [x] Fan Club routes validated (session-mocked Playwright)
- [x] Homepage invariants verified (existing structure tests + homepage-sections e2e; FAQ heading drift fixed)
- [x] D1/B2 fail-closed covered in `launch-readiness:unit` bundle
- [x] Launch-readiness report path documented (`reports/launch-readiness/summary.md`, gitignored)
- [ ] Production visual QA — requires human/production URL review (not claimed here)
- [x] No unrelated CI/orchestration workflow edits
- [x] T48 (`/admin/matchup`) merged before this PR; launch-readiness re-run on `main` after T48

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] Single source issue #1112
- [x] Allowlist matches diff
- [x] T48 merge gate satisfied (PR #1212 on `main`)
- [x] Post-merge closeout: PR body includes all required governance sections

## Notes
- Browser install is required once per environment for e2e (`npx playwright install chromium`).
- Attach `reports/launch-readiness/summary.md` from a post-T48 `npm run launch-readiness` run for operational records.
<!-- CURSOR_AGENT_PR_BODY_END -->
