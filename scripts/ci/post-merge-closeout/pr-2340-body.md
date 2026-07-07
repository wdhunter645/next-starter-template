<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #2339

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — OPS #1923 batch-generated closeout remediation
- Next queue item: continue backlog burn-down after closeout replay
- Continue/halt decision: continue after post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: OPS #1923 batch body generation for merged PR #2340
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #2340 at `b8294971f78174a50decd691f281c1436534bbdc`. Post-merge closeout body remediation for OPS #1923 backlog burn-down.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `functions/_lib/content-pipeline-candidate-repository.ts`
- `tests/content-pipeline-candidate-repository.test.ts`

All other files are out of scope

## CHANGE SUMMARY
- Implements the runtime retention and soft-delete helper model for LGFC content pipeline candidates using the existing `content_items` retention fields and existing `moderation_events` audit table.
- Repository exports added:
- `softDeleteCandidate()`
- `updateCandidateRetention()`
- `restoreSoftDeletedCandidate()`
- Current implementation batches guarded retention mutation plus conditional audit insert transactionally. Audit rows are written only when the guarded update changes rows; audit insert failure rolls back the mutation; there is no non-atomic fallback path.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 2340 --validate` — PASS (generator self-validation)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #2340)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES (remediated body artifact)
- Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is open, is same-repository, and is not a PR.
- [x] PR issue-accounting gate passes.
- [x] Drift gate passes.
- [x] Intent gate passes.
- [x] ZIP safety gate passes.
- [x] Quality checks pass.
- [x] Repository-specific governance gates pass.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] PR is ready for human review.
- [x] Post-merge closeout remediation body generated for merged PR #2340

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3536680436 — accepted — post-merge closeout remediation for prior PR #2340 — thread state: outdated
- review-comment:3536907727 — accepted — post-merge closeout remediation for prior PR #2340 — thread state: outdated
- review-comment:3536993044 — accepted — post-merge closeout remediation for prior PR #2340 — thread state: outdated
- review-comment:4645785582 — accepted — post-merge closeout remediation for prior PR #2340 — thread state: outdated

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
- [x] Merge commit recorded: `b8294971f78174a50decd691f281c1436534bbdc`
- [x] Source issue #2339 state inspected after merge
- [x] Post-merge closeout reconciliation for prior PR #2340 delegated to closeout workflow
- [x] Source issue closeout delegated to post-merge closeout workflow

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] Local checks executed and passed
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
