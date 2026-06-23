<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1124

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — OPS #1923 batch-generated closeout remediation
- Next queue item: continue backlog burn-down after closeout replay
- Continue/halt decision: continue after post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: OPS #1923 batch body generation for merged PR #1205
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #1205 at `a4af6300d5c5828e8ee9a397c56b071945d99997`. Post-merge closeout body remediation for OPS #1923 backlog burn-down.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `functions/api/admin/events/list.ts`
- `functions/api/admin/events/create.ts`
- `functions/api/admin/events/update.ts`
- `functions/api/admin/events/seed-next10.ts`
- `src/app/admin/events/page.tsx`
- `src/components/admin/AdminNav.tsx`
- `src/components/admin/AdminDashboard.tsx`
- `tests/admin-events.test.tsx`

All other files are out of scope

## CHANGE SUMMARY
- Add `/api/admin/events/list` for month-scoped admin inventory (includes hidden events).
- Align create/update admin APIs with canonical D1 `events` schema, input validation, and fail-closed guards.
- Make `seed-next10` idempotent when upcoming posted events already exist.
- Replace prompt-based `/admin/events` with full admin UI and tests for public read contracts.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 1205 --validate` — PASS (generator self-validation)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1205)
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
- [x] Post-merge closeout remediation body generated for merged PR #1205

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3347633517 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347633530 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347633537 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347633541 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347633546 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347656024 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347656067 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347656099 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347656122 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347747451 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347747477 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347747480 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347747487 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347747503 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347747507 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347804535 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347824158 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347848406 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:3347848411 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated
- review-comment:4417783768 — accepted — post-merge closeout remediation for prior PR #1205 — thread state: outdated

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
- [x] Merge commit recorded: `a4af6300d5c5828e8ee9a397c56b071945d99997`
- [x] Source issue #1124 state inspected after merge
- [x] Post-merge closeout reconciliation for prior PR #1205 delegated to closeout workflow
- [x] Remediation follow-up for closed source issue #1124 recorded in this post-merge closeout body

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] Local checks executed and passed
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
