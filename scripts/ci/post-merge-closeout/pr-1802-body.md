<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1788

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable — OPS runtime remediation for #1788
- Next queue item: not-applicable
- Continue/halt decision: not-applicable — single corrective PR for B2 → D1 sync auth

## PROGRESS + READINESS (MANDATORY)
- Phase: OPS runtime remediation
- Task: Restore B2 → D1 daily sync after Cloudflare D1 auth failure (#1788)
- Status: READY FOR REVIEW
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: operator must rotate Cloudflare secrets after merge before closing #1788
- Notes: Cloudflare D1 remains the active LGFC database; B2 remains the media object store; sync writes B2 media URLs/metadata into D1 for page rendering.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `scripts/B2_D1_SYNC_README.md`
- `docs/reference/ci/ops-runtime-surface.md`
- `docs/as-built/DEPLOYMENT_GUIDE.md`

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Additional design/reference docs used for this PR:
  - `scripts/B2_D1_SYNC_README.md`
  - `docs/reference/ci/ops-runtime-surface.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/workflows/b2-d1-daily-sync.yml`
- `.github/workflows/post-merge-intent-verification.yml`
- `scripts/b2_d1_incremental_sync.sh`
- `scripts/ci/verify_cloudflare_d1_auth.mjs`
- `scripts/ci/post-merge-closeout/pr-1802-body.md`
- `scripts/test_b2_d1_incremental_sync.sh`
- `scripts/B2_D1_SYNC_README.md`
- `tests/verify-cloudflare-d1-auth.test.mjs`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied (`infra`)
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Add Cloudflare D1 auth preflight before daily B2 → D1 sync.
- Pin wrangler via `npm ci`; require account ID; accept `CF_*` and `D1_DATABASE_ID` aliases.
- Default D1 database name to `lgfc_lite`; improve auth failure hints.
- Address Gemini review findings on spawn error handling, `pipefail`, and README idempotency wording.
- Register maintainer PR body apply path for gate-compliant reviewer accounting.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `bash -n scripts/b2_d1_incremental_sync.sh` — PASS
  - `bash scripts/test_b2_d1_incremental_sync.sh` — PASS
  - `npm test -- tests/verify-cloudflare-d1-auth.test.mjs` — PASS
- Result summary: PASS

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- Files:
  - `scripts/B2_D1_SYNC_README.md`

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every GitHub review thread has an explicit thread-state disposition.
- review-comment:3435937741 — accepted — removed duplicate `CLOUDFLARE_ACCOUNT_ID` optional-env README row — thread state: resolved
- review-comment:3435937744 — accepted — handle `whoami` spawn execution errors before auth messaging — thread state: resolved
- review-comment:3435937748 — accepted — handle D1 probe spawn execution errors before auth messaging — thread state: resolved
- review-comment:3435937760 — accepted — restored `set -euo pipefail` in sync script and test — thread state: resolved
- review-comment:3435937764 — accepted — updated README idempotency wording to `WHERE NOT EXISTS` — thread state: resolved

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Required gates rerun or re-evaluated after fixes

## POST-MERGE CLOSEOUT CHECKLIST
- [ ] PR merged state verified
- [ ] Merge commit recorded
- [ ] Source issue #1788 remains open until operator recovery evidence
- [ ] Operator updates `CLOUDFLARE_API_TOKEN` with Account → D1 → Edit and User → User Details → Read
- [ ] Operator verifies `CLOUDFLARE_ACCOUNT_ID` (or `CF_ACCOUNT_ID` alias)
- [ ] Operator manually dispatches **OPS — B2 D1 Daily Sync** and confirms green run
- [ ] Close #1788 after recovery evidence is recorded

## ACCEPTANCE CRITERIA
- [x] Workflow includes D1 auth preflight with actionable failure output.
- [x] Sync script uses pinned wrangler and documents required token permissions.
- [x] Gemini review threads are fixed and resolved.
- [x] Local targeted tests pass.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] Local checks executed and passed
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Status is set to READY FOR REVIEW only after required gate remediation
<!-- CURSOR_AGENT_PR_BODY_END -->
