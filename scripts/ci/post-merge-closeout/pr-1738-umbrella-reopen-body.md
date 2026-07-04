<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1738

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable — Program #1738 umbrella reopen after Task 008 merge closeout
- Next queue item: halt — await Bill/Atlas program acceptance
- Continue/halt decision: halt

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: Program #1738 umbrella reopen
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: PROGRAM umbrella #1738 was incorrectly closed during Task 001–008 merge closeout failures. Reopen and preserve open with `status:active` after Tasks #1739–#1746 closeout replay.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `docs/ops/reports/lou-gehrig-content-manual-workflow-evidence.md`
- `docs/ops/reports/lou-gehrig-content-collection-handoff-to-publication-automation.md`
- `scripts/ci/post-merge-closeout/targets-1738-closeout.json`
- `scripts/ci/post-merge-closeout/pr-1738-umbrella-reopen-body.md`

All other files are out of scope

## CHANGE SUMMARY
- Reopen Program #1738 umbrella after child task merge closeout replay.
- Preserve program open pending Bill/Atlas acceptance of Task 008 handoff.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 2249,2250,2251,2252,2253,2254,2256,2255 --validate` — PASS
- Result summary: PASS

## ACCEPTANCE CRITERIA
- [x] Post-merge closeout remediation body generated for Program #1738 umbrella reopen
- [x] Child task closeout replay manifest recorded

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3523816177 — accepted — post-merge closeout remediation for prior PR #2255 — thread state: outdated
- review-comment:4630227831 — accepted — post-merge closeout remediation for prior PR #2255 — thread state: outdated

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] Required gates rerun or re-evaluated after fixes

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded: `5df3fcbb7ad3fe046482646027d799e81fd781e5`
- [x] Source issue #1738 state inspected after merge
- [x] PROGRAM #1738 reopen closeout replay for incorrectly closed umbrella

## POST-MERGE ISSUE DISPOSITION
- Source issue **#1738** is a PROGRAM umbrella and must remain **open** with `status:active`; **reopen #1738** if incorrectly closed on merge; remove `status:failed` and `status:post-merge-verify`; **do not close** #1738
- Child issues **#1739–#1746** close complete after closeout replay in `targets-1738-closeout.json`

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] All reviewer feedback has explicit disposition where required

<!-- closeout-trigger: 2026-07-04T21:10:00Z -->
<!-- CURSOR_AGENT_PR_BODY_END -->
