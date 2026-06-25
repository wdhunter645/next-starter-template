<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1690

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — OPS #1923 batch-generated closeout remediation
- Next queue item: continue backlog burn-down after closeout replay
- Continue/halt decision: continue after post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: OPS #1923 batch body generation for merged PR #1950
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #1950 at `47a5d2cc1aa117198f8bbffb642252114ec84c5a`. Post-merge closeout body remediation for OPS #1923 backlog burn-down.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `functions/_lib/content-inventory-club-home.ts`
- `functions/_lib/content-inventory-public.ts`
- `functions/api/fanclub/home.ts`
- `src/app/fanclub/page.tsx`
- `src/components/fanclub/ClubHomeArchiveSpotlight.tsx`
- `src/components/fanclub/ClubHomeMediaFeature.tsx`
- `src/components/fanclub/ClubHomeStaticStory.tsx`
- `src/components/fanclub/ClubHomeStoryRail.tsx`
- `src/components/fanclub/useClubHomeContent.ts`
- `src/lib/clubHomeApi.ts`
- `tests/content-inventory-club-home.test.ts`
- `tests/fanclub-home-dynamic.test.tsx`
- `tests/fanclub-home-shell.test.tsx`

All other files are out of scope

## CHANGE SUMMARY
- Added `GET /api/fanclub/home` aggregator for `club_home` inventory rotation (lead, rail, spotlight, media).
- Wired Club Home UI to fetch dynamic content with static fallbacks and source/credit display.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 1950 --validate` — PASS (generator self-validation)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1950)
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
- [x] Post-merge closeout remediation body generated for merged PR #1950

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3460692403 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460692415 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460692439 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460692447 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460692463 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460723383 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460723423 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460723450 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460723474 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460723502 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460723524 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated
- review-comment:3460723542 — accepted — post-merge closeout remediation for prior PR #1950 — thread state: outdated

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
- [x] Merge commit recorded: `47a5d2cc1aa117198f8bbffb642252114ec84c5a`
- [x] Source issue #1690 state inspected after merge
- [x] Post-merge closeout reconciliation for prior PR #1950 delegated to closeout workflow
- [x] Source issue closeout delegated to post-merge closeout workflow

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] Local checks executed and passed
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
