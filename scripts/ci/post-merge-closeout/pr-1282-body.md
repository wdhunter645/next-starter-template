- **Issue:** #1281

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## PROGRESS + READINESS (MANDATORY)
- Phase: CI post-merge closeout automation
- Task: Automatic closeout on merged PRs to main
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Merged as #1282. Automatic `pull_request_target` closeout path enabled; manual batch backfill remains explicit.

## LABEL
- Intent label for this PR: infra

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/workflows/post-merge-pr-body-closeout.yml`
- `scripts/ci/post_merge_closeout_trigger.mjs`
- `scripts/ci/post_merge_remediation_issue.mjs`
- `scripts/ci/run_post_merge_closeout.mjs`
- `tests/post-merge-closeout-automatic.test.mjs`
- `tests/post-merge-closeout-batch.test.mjs`
- `tests/post-merge-source-issue-closeout.test.mjs`

All other files are out of scope

## CHANGE SUMMARY
- Trigger `Post-Merge PR Body Closeout` on `pull_request_target` closed when PR merges to `main`.
- Preserve manual `workflow_dispatch` for single-PR remediation and explicit `run_batch: true` backfill.
- Add fail-safe remediation issue upsert and closeout report artifacts on failure.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npx vitest run --config tests/vitest.node.config.ts tests/post-merge-closeout-automatic.test.mjs tests/post-merge-closeout-batch.test.mjs tests/batch-post-merge-closeout.test.mjs tests/post-merge-source-issue-closeout.test.mjs tests/post-merge-validator.test.mjs` — PASS (49 tests)
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] Automatic closeout runs only for merged PRs into `main`.
- [x] Manual batch closeout does not run on every merge.
- [x] Closeout failures produce diagnostics and remediation evidence.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] ZIP safety confirmed
- [x] Local checks executed and passed

## POST-MERGE VERIFICATION REQUIREMENTS
- Confirm automatic closeout workflow runs on the next merged PR to `main`.
- Confirm fail-safe remediation issue is created when validation fails.

<!-- closeout-trigger: 2026-06-04 -->
