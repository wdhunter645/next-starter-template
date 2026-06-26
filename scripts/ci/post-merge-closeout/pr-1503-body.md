<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1487

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — OPS #1923 batch-generated closeout remediation
- Next queue item: continue backlog burn-down after closeout replay
- Continue/halt decision: continue after post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: OPS #1923 batch body generation for merged PR #1503
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #1503 at `e9a578bd492003ad2bab42724d8814ce55a866a7`. Post-merge closeout body remediation for OPS #1923 backlog burn-down.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/workflows/post-merge-pr-body-closeout.yml`
- `scripts/ci/post-merge-closeout/pr-1472-body.md`
- `scripts/ci/post-merge-closeout/pr-1486-body.md`
- `scripts/ci/post-merge-closeout/pr-1489-body.md`
- `scripts/ci/post-merge-closeout/targets-ci-pending-rerun.json`
- `scripts/ci/post-merge-closeout/targets-ci-pending.json`
- `scripts/ci/post_merge_remediation_issue.mjs`
- `scripts/ci/post_merge_source_issue_closeout.mjs`
- `scripts/ci/post_merge_validator.mjs`
- `scripts/ci/reviewer-gate-simulation.mjs`
- `scripts/ci/reviewer_lifecycle_gate.mjs`
- `scripts/ci/run_batch_post_merge_closeout.mjs`
- `scripts/ci/run_post_merge_closeout_all_manifests.mjs`
- `scripts/orchestrator/sync-pr-state.mjs`
- `tests/batch-post-merge-closeout.test.mjs`
- `tests/post-merge-closeout-all-manifests.test.mjs`
- `tests/post-merge-closeout-automatic.test.mjs`
- `tests/post-merge-source-issue-closeout.test.mjs`
- `tests/reviewer-gate-simulation.test.mjs`
- `tests/reviewer-lifecycle-gate.test.mjs`

All other files are out of scope

## CHANGE SUMMARY
- Filter remediation issue upserts to blocking failures only (optional Docs Guardrails noise no longer opens exceptions).
- Fix batch `failure_reason` workflow labels (`workflow:Docs Guardrails` instead of `workflow:undefined`).
- Support `skip_body_apply` batch targets and add rerun manifest for PRs #1472, #1486, #1489.
- Harden closed-source closeout: PR-body follow-up language reconciles terminal labels without re-close.
- Trim completed targets from `targets-ci-pending.json`; rerun manifest triggers on push to `main`.
- Address Gemini review feedback with optional chaining and `issueMeta.state_reason` handling.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 1503 --validate` — PASS (generator self-validation)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1503)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES (remediated body artifact)
- Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is same-repository, and closed-source follow-up closeout evidence is recorded.
- [x] PR issue-accounting gate passes.
- [x] Drift gate passes.
- [x] Intent gate passes.
- [x] ZIP safety gate passes.
- [x] Quality checks pass.
- [x] Repository-specific governance gates pass.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] PR is ready for human review.
- [x] Post-merge closeout remediation body generated for merged PR #1503

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3382496983 — accepted — post-merge closeout remediation for prior PR #1503 — thread state: outdated
- review-comment:3382496999 — accepted — post-merge closeout remediation for prior PR #1503 — thread state: outdated
- review-comment:3382497009 — accepted — post-merge closeout remediation for prior PR #1503 — thread state: outdated
- review-comment:4460833575 — accepted — post-merge closeout remediation for prior PR #1503 — thread state: outdated

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] All review threads and comments inspected
- [x] Required gates rerun or re-evaluated after fixes

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded: `e9a578bd492003ad2bab42724d8814ce55a866a7`
- [x] Source issue #1487 state inspected after merge
- [x] Post-merge closeout reconciliation for prior PR #1503 delegated to closeout workflow
- [x] Remediation follow-up for closed source issue #1487 recorded in this post-merge closeout body

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] Local checks executed and passed
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
