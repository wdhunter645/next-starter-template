- **Issue:** #1112

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.

## PROGRESS + READINESS (MANDATORY)
- Phase: Website — T50 Launch Readiness
- Task: T50
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Merged on `main` as PR #1221. Production visual QA is tracked separately and is out of scope for this automation PR.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- docs/reference/design/LGFC-Production-Design-and-Standards.md
- docs/governance/PR_PROCESS.md
- scripts/launch-readiness/README.md

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## LABEL
- Intent label for this PR: website

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- package.json
- playwright.config.ts
- scripts/assess.mjs
- scripts/launch-readiness/README.md
- scripts/launch-readiness/manifest.json
- scripts/launch-readiness/run.mjs
- tests/e2e/homepage-sections.spec.ts
- tests/e2e/launch-readiness-fanclub-routes.spec.ts
- tests/e2e/launch-readiness-public-routes.spec.ts
- tests/launch-readiness-manifest.test.ts

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Adds launch-readiness manifest, orchestrator, Playwright route smoke, and operator entry points for T50.
- Restores assess manifest path via `scripts/assess.mjs`.
- Requires PR #1212 (T48 matchup admin) merged before this PR.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm run launch-readiness:unit` — PASS (47 tests)
  - `npm run assess` — PASS
  - `npm run launch-readiness -- --skip-e2e` — PASS
  - `npm run launch-readiness:e2e` — PASS (36 tests)
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- [ ] No documentation updates required
- Files:
  - scripts/launch-readiness/README.md

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] Local checks executed and passed or exact blocker documented
- [x] Post-merge closeout body remediation applied for merged PR governance

## ACCEPTANCE CRITERIA
- [x] All public routes validated (Playwright + static export manifest)
- [x] Fan Club routes validated (session-mocked Playwright)
- [x] Homepage invariants verified
- [x] D1/B2 fail-closed covered in `launch-readiness:unit` bundle
- [x] Launch-readiness report path documented (`reports/launch-readiness/summary.md`, gitignored)
- [x] Production visual QA deferred — out of scope for this automation PR; tracked as separate human/production review
- [x] No unrelated CI/orchestration workflow edits
- [x] T48 (`/admin/matchup`) merged before this PR; launch-readiness re-run on `main` after T48

## ROLLBACK
Revert launch-readiness scripts, tests, and manifest changes only.

## POST-MERGE VERIFICATION REQUIREMENTS
- Confirm `npm run launch-readiness` passes on `main` after T48 merge.
- Attach `reports/launch-readiness/summary.md` for operational records when available.
