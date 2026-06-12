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

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## CHANGE SUMMARY
- Treat `remediation_issue` as an expected successful source-issue closeout skip when post-merge validation passes, preventing false-positive `source_issue_closeout_skipped` failures (root cause of #1590 for merged PR #1586).
- Reconcile terminal labels and post closeout evidence when a remediation issue is the linked source issue, without incorrectly downgrading to `post_merge_failure`.
- Close linked remediation source issues during `closeRemediationIssuesForPr` so remediation PR merges can complete the remediation workflow for issues like #1576.
- Register PR #1586 in `targets-ci-pending.json` for batch closeout replay and manifest coverage.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/post-merge-closeout-automatic.test.mjs tests/post-merge-closeout-batch.test.mjs tests/post-merge-source-issue-closeout.test.mjs tests/post-merge-closeout-all-manifests.test.mjs` — PASS (50/50)
  - `git diff --check` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1594)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (Design Compliance Warn — missing hygiene sections; Docs Guardrails — unrelated header advisory)
  - Required gates rerun or re-evaluated after fixes: N/A (merged)
- Result summary: PASS (local verification at closeout remediation)

### Pre-existing header check disclosure
Repo-wide `./scripts/ci/docs_check_headers.sh .` failed on **pre-existing** missing header in `docs/templates/ai-build-issue-template.md` at merge time. That file was **not modified** in PR #1594 and caused unrelated docs-header remediation bot comments. Header remediation is tracked in follow-up issue **#1598**.

## ACCEPTANCE CRITERIA
- [x] `remediation_issue` no longer triggers `source_issue_closeout_skipped` downgrade on successful validation
- [x] Remediation source issues receive terminal label reconciliation without false failure relabel
- [x] Linked remediation source issues close when remediation PR closeout succeeds
- [x] Allowlist matches merged diff exactly
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular (`infra`)
- [x] Local checks executed and passed or exact blocker documented
- [x] Commit message aligns with scope
- [x] No prohibited artifacts introduced
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Close remediation **#1590** after validator pass
- Re-run batch closeout on `targets-ci-pending.json` to reconcile stale labels on closed issues **#1560**, **#1578**, and **#1576**
- Close hygiene follow-up **#1598** after docs header and body remediation land

<!-- closeout-trigger: 2026-06-12 -->
<!-- CURSOR_AGENT_PR_BODY_END -->
