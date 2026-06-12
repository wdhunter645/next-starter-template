<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1578

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
- Dependency-map result: not-applicable — remediation issue for Program 1500 closeout defect
- Next queue item: not-applicable — bounded fix scoped to issue #1578
- Continue/halt decision: not-applicable — one-off closeout defect repair

## PROGRESS + READINESS (MANDATORY)
- Phase: Program 1500 post-merge closeout stabilization
- Task: Fix incomplete post-merge closeout for PR #1567 / Issue #1545 (#1578)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Notes: Merged as PR #1583 (merge SHA `a1ca83d4e77efb6b0b73266c02d5dd7219bfbb1d`). Post-merge body remediation applied including late Copilot review disposition.

## DOCUMENTATION SOURCE CLASSIFICATION
- Primary: `docs/reference/architecture/orchestration-model.md`, `docs/ops/trackers/PROGRAM-1500-CLOSEOUT-STABILIZATION-IMPLEMENTATION-QUEUE.md` (Finding F2)
- Change type: CI orchestration behavior fix (no docs edits required)

## DESIGN SOURCE OF TRUTH
- Orchestration model post-merge failure semantics (`status:failed` on validation failure)
- Program 1500 Task 003 acceptance criteria for failure-path label hygiene

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `scripts/orchestrator/sync-pr-state.mjs`
- `scripts/ci/post_merge_source_issue_closeout.mjs`
- `scripts/ci/run_post_merge_closeout.mjs`
- `scripts/ci/post_merge_remediation_issue.mjs`
- `tests/orchestrator-queue.test.mjs`
- `tests/post-merge-source-issue-closeout.test.mjs`
- `tests/post-merge-closeout-automatic.test.mjs`
- `tests/post-merge-closeout-all-manifests.test.mjs`

## CHANGE SUMMARY
PR #1567 merged successfully but issue #1545 remained open with `status:post-merge-verify` after Post-Merge Detection failed validation. This PR implements failure-path label hygiene, direct `syncPrState` invocation, remediation workflow run URLs, and fail-closed failure-path relabel when `status:failed` is unavailable.

## BUILD / TEST / VERIFICATION
```bash
npm test -- tests/post-merge-validator.test.mjs
npm test -- tests/post-merge-closeout-automatic.test.mjs
npm test -- tests/post-merge-closeout-batch.test.mjs
npm test -- tests/post-merge-source-issue-closeout.test.mjs
npm test -- tests/orchestrator-queue.test.mjs
npm test -- tests/post-merge-closeout-all-manifests.test.mjs
git diff --check
```
- PASS — regression suite at merge time

## ACCEPTANCE CRITERIA
- [x] Reproduced explanation for why #1545 did not close (validation failure + F2 label hygiene gap)
- [x] Closeout path fixed: failure/remediation relabel source issues; success skips become remediation failures
- [x] Regression coverage for failure path and preserved `status:failed` label
- [x] Fail-closed relabel when `status:failed` unavailable (Copilot #3404141971)
- [x] #1545 relabeled/closed via prior body remediation

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Gemini and Copilot dispositions received.

Reviewer items:
- review-comment:3397642201 — accepted — Exclude `status:failed` from `removeLabels` in `planFailureSourceIssueRelabel` — thread state: resolved
- review-comment:3397642205 — accepted — Regression test for preserved `status:failed` — thread state: resolved
- review-comment:3397642223 — accepted — Optional chaining and default parameter on `toSyncPr` — thread state: resolved
- review-comment:3397642232 — accepted — Optional chaining for `pr?.mergeCommit?.oid` — thread state: resolved
- review-comment:4478777607 — acknowledged — Gemini review summary; inline findings dispositioned above — thread state: resolved
- review-comment:3404141971 — accepted — Fail-closed failure-path relabel when `status:failed` unavailable in repository — thread state: resolved
- review-comment:4486590023 — acknowledged — Copilot PR overview; single inline finding addressed via #3404141971 — thread state: resolved

## POST-MERGE ISSUE DISPOSITION
- Reconcile label hygiene on closed source **#1578** after body apply

<!-- closeout-trigger: 2026-06-12 -->
<!-- CURSOR_AGENT_PR_BODY_END -->
