<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1590

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
- Dependency-map result: not-applicable — post-merge remediation for false-positive closeout exception #1590
- Next queue item: hold Program 1255 Task 009 (#1561) until post-merge lane is clean
- Continue/halt decision: halt Task 009 until #1590 and label hygiene are resolved

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `scripts/ci/run_post_merge_closeout.mjs`
- `scripts/orchestrator/sync-pr-state.mjs`
- `scripts/ci/close_remediation_issues_for_pr.mjs`
- `scripts/ci/post-merge-closeout/pr-1586-body.md`
- `scripts/ci/post-merge-closeout/targets-ci-pending.json`
- `tests/post-merge-closeout-automatic.test.mjs`
- `tests/post-merge-closeout-batch.test.mjs`
- `tests/post-merge-closeout-all-manifests.test.mjs`
- `tests/post-merge-source-issue-closeout.test.mjs`

All other files are out of scope

## CHANGE SUMMARY
- Treat `remediation_issue` as an expected successful source-issue closeout skip when post-merge validation passes, preventing false-positive `source_issue_closeout_skipped` failures (root cause of #1590 for merged PR #1586).
- Reconcile terminal labels and post closeout evidence when a remediation issue is the linked source issue, without incorrectly downgrading to `post_merge_failure`.
- Close linked remediation source issues during `closeRemediationIssuesForPr` so remediation PR merges can complete the remediation workflow for issues like #1576.
- Register PR #1586 in `targets-ci-pending.json` for batch closeout replay and manifest coverage.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/post-merge-closeout-automatic.test.mjs tests/post-merge-closeout-batch.test.mjs tests/post-merge-source-issue-closeout.test.mjs tests/post-merge-closeout-all-manifests.test.mjs` — PASS
  - `git diff --check` — PASS
- Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] `remediation_issue` no longer triggers `source_issue_closeout_skipped` downgrade on successful validation
- [x] Remediation source issues receive terminal label reconciliation without false failure relabel
- [x] Linked remediation source issues close when remediation PR closeout succeeds
- [x] Allowlist matches merged diff exactly

## POST-MERGE ISSUE DISPOSITION
- Close remediation **#1590** after validator pass
- Re-run batch closeout on `targets-ci-pending.json` to reconcile stale labels on closed issues **#1560**, **#1578**, and **#1576**

<!-- closeout-trigger: 2026-06-12 -->
<!-- CURSOR_AGENT_PR_BODY_END -->
