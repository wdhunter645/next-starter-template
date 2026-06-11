<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1545

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass — Task 001 (#1544) merged and closeout verified on `main`
- Next queue item: halt until Task 002 closeout completes — Task 003 (#1546) is successor per program #1500 queue
- Continue/halt decision: continue — post-merge body remediation applied for merged PR #1567

## PROGRESS + READINESS (MANDATORY)
- Phase: Program #1500 — CI Post-Merge Closeout Reliability
- Task: Task 002 — Consolidate duplicate post-merge closeout workflows
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1567 (merge SHA `314c236c986c33b85c2374c4b0bf3d1970f2d647`). Post-merge closeout body remediation applied for missing allowlist anchor and Gemini reviewer disposition.

## DOCUMENTATION SOURCE (MANDATORY)
- Classification: reference update to controlled CI surface doc
- Design source of truth: `docs/reference/ci/post-merge-validation-surface.md`, program queue `docs/ops/trackers/PROGRAM-1500-CLOSEOUT-STABILIZATION-IMPLEMENTATION-QUEUE.md`

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Additional design/reference docs used for this PR:
  - `docs/reference/ci/post-merge-validation-surface.md`
  - `docs/ops/trackers/PROGRAM-1500-CLOSEOUT-STABILIZATION-IMPLEMENTATION-QUEUE.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/workflows/post-merge-closeout.yml`
- `.github/workflows/post-merge-intent-verification.yml`
- `.github/workflows/post-merge-pr-body-closeout.yml`
- `docs/reference/ci/post-merge-validation-surface.md`
- `scripts/ci/post_merge_closeout_trigger.mjs`
- `scripts/ci/post_merge_validation_surface.mjs`
- `scripts/ci/post_merge_validator.mjs`
- `scripts/ci/run_post_merge_closeout.mjs`
- `tests/orchestrator-queue.test.mjs`
- `tests/post-merge-closeout-automatic.test.mjs`
- `tests/post-merge-validation-surface.test.mjs`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## CHANGE SUMMARY
**Problem:** Both `post-merge-intent-verification.yml` and `post-merge-pr-body-closeout.yml` fired on `pull_request_target: closed` for merges to `main`, each invoking validation and `sync-pr-state.mjs`, causing races (Finding F3).

**Solution:**
1. **Created** `.github/workflows/post-merge-closeout.yml` with display name `Post-Merge Detection` — single automatic closeout owner per merge. Runs `run_post_merge_closeout.mjs` (validate + one in-script `sync-pr-state` call), uploads `post-merge-validation-result` artifact, PR comment, reviewer audit on failure.
2. **Demoted** `post-merge-intent-verification.yml` to `Post-Merge Maintainer Body Apply` — removed `pull_request_target` and `detect` job; kept maintainer body apply for PR #1241 / workflow_dispatch.
3. **Demoted** `post-merge-pr-body-closeout.yml` — removed `pull_request_target` trigger and automatic closeout steps; preserved push manifest triggers and workflow_dispatch batch/manual paths.
4. **Wired** `GITHUB_OUTPUT` from `run_post_merge_closeout.mjs` for workflow step chaining.
5. **Updated** validation surface inventory, docs, and tests.

**Preserved:** `post-merge-remediation.yml` still triggers on `Post-Merge Detection` workflow failure (name unchanged on consolidated workflow).

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/post-merge-closeout-automatic.test.mjs tests/post-merge-validation-surface.test.mjs tests/orchestrator-queue.test.mjs` — PASS (42 tests)
  - `node scripts/ci/post_merge_validation_surface.mjs` — PASS
  - `git diff --check` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1567)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge closeout exception #1575)
  - Required gates rerun or re-evaluated after fixes: N/A (merged)
- Result summary: PASS (local verification at closeout remediation)

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received.
- [x] Cubic disposition received or not applicable.

Reviewer items:
- review-comment:3397002102 — accepted — workflow-run filter regex updated for consolidated post_merge_closeout workflow in merge 314c236 — thread state: outdated

## ACCEPTANCE CRITERIA
- [x] Only one workflow performs automatic post-merge validate+sync per merged PR to `main`
- [x] Manual/batch dispatch paths preserved on `post-merge-pr-body-closeout.yml`
- [x] `post-merge-remediation.yml` still triggers on `Post-Merge Detection` failure
- [x] `node scripts/ci/post_merge_validation_surface.mjs` passes
- [x] Evidence of single `sync-pr-state` call per automatic merge path
- [x] Changed files match file-touch allowlist exactly
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] Allowlist matches diff exactly (11 files)
- [x] No secrets, ZIP, or build artifacts committed
- [x] Verification commands run locally with pass results
- [x] `post-merge-remediation.yml` not modified (out of scope)
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

## ROLLBACK
Revert this PR to restore dual `pull_request_target` closeout paths. No schema migrations or runtime config changes.

## POST-MERGE ISSUE DISPOSITION
- Close **#1545** after post-merge verification passes following body apply (may require PR #1577 remediation as well)
- Close remediation **#1575**, **#1579**, and **#1580** when validator passes after body apply

<!-- closeout-trigger: 2026-06-11 -->
<!-- CURSOR_AGENT_PR_BODY_END -->
