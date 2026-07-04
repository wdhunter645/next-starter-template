<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #2101

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — OPS #1923 batch-generated closeout remediation
- Next queue item: continue backlog burn-down after closeout replay
- Continue/halt decision: continue after post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: OPS #1923 batch body generation for merged PR #2158
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #2158 at `80ba8700acf466e0932e39a8f0f18fa8954259f8`. Post-merge closeout body remediation for OPS #1923 backlog burn-down.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/workflows/pmo-dashboard-ci-build.yml`
- `.github/workflows/pmo-dashboard-ci-deploy.yml`
- `docs/how-to/pmo/pmo-dashboard.md`
- `scripts/pmo-dashboard/build-dashboard.mjs`

All other files are out of scope

## CHANGE SUMMARY
- Constrains PMO dashboard task counting to explicit task blocks only.
- Returns zero tasks when no explicit task block exists.
- Stops task parsing at the next markdown heading so unrelated issue references are not counted as child tasks.
- Uses `PMO_DASHBOARD_OUT_DIR` consistently in PMO dashboard build/deploy workflows.
- Updates the PMO dashboard how-to with the explicit task-block contract.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 2158 --validate` — PASS (generator self-validation)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #2158)
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
- [x] Post-merge closeout remediation body generated for merged PR #2158

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3520495783 — accepted — post-merge closeout remediation for prior PR #2158 — thread state: outdated
- review-comment:3520495786 — accepted — post-merge closeout remediation for prior PR #2158 — thread state: outdated
- review-comment:4626490430 — accepted — post-merge closeout remediation for prior PR #2158 — thread state: outdated

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
- [x] Merge commit recorded: `80ba8700acf466e0932e39a8f0f18fa8954259f8`
- [x] Source issue #2101 state inspected after merge
- [x] Post-merge closeout reconciliation for prior PR #2158 delegated to closeout workflow
- [x] Remediation follow-up for closed source issue #2101 recorded in this post-merge closeout body
- [x] Remediation follow-up for exception #2159 recorded in this post-merge closeout body

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] Local checks executed and passed
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
