<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1962

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass — OPS #1923 batch-generated closeout remediation
- Next queue item: continue backlog burn-down after closeout replay
- Continue/halt decision: continue after post-merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: OPS #1923 batch body generation for merged PR #1981
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #1981 at `4589576566653f2d9a8ba5d8da6bd3a74c631c06`. Post-merge closeout body remediation for OPS #1923 backlog burn-down.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/intent-labeler.json`
- `.github/workflows/post-merge-pr-body-closeout.yml`
- `docs/as-built/cloudflare-frontend.md`
- `docs/ops/reports/website-completion-program-1685-audit-register.md`
- `docs/ops/reports/website-completion-program-closeout.md`
- `docs/reference/design/fanclub-home.md`
- `functions/api/fanclub/memorabilia/tags.ts`
- `scripts/ci/post-merge-closeout/pr-1950-body.md`
- `scripts/ci/post-merge-closeout/pr-1955-body.md`
- `scripts/ci/post-merge-closeout/pr-1958-body.md`
- `scripts/ci/post-merge-closeout/pr-1960-body.md`
- `scripts/ci/post-merge-closeout/targets-active.json`
- `scripts/ci/post-merge-closeout/targets-website-completion-1685-closeout.json`
- `scripts/ci/pr_intent_allowlists.json`
- `src/app/admin/editorial/page.tsx`
- `src/app/fanclub/memorabilia/page.tsx`
- `src/app/fanclub/page.tsx`
- `src/app/fanclub/photo/page.tsx`
- `src/components/fanclub/ClubHomeMemberPrompt.tsx`
- `src/components/fanclub/fanclubGridStyles.module.css`
- `src/components/fanclub/fanclubGridStyles.ts`
- `tests/fanclub-home-dynamic.test.tsx`
- `tests/fanclub-home-shell.test.tsx`
- `tests/fanclub-operations.test.tsx`
- `tests/post-merge-closeout-all-manifests.test.mjs`
- `tests/resolve-closeout-manifests-from-push.test.mjs`

All other files are out of scope

## CHANGE SUMMARY
- Remove legacy Club Home dashboard widgets; add `ClubHomeMemberPrompt` linking to `/fanclub/chat` and document removed modules in `fanclub-home.md` and the Cloudflare as-built snapshot.
- Add memorabilia tag filter bar, `GET /api/fanclub/memorabilia/tags`, and responsive 3-column desktop grids for photo/memorabilia.
- Add `club_home` to admin editorial section options for API/UI parity.
- Publish audit register and update closeout report, `fanclub-home.md`, and Cloudflare as-built documentation.
- Add remediated post-merge closeout bodies and Program #1685 replay manifest for PRs #1950, #1955, #1958, and #1960.
- Register `targets-website-completion-1685-closeout.json` in the active closeout manifest registry and workflow push path, with push-resolution tests.
- Extend `change-ops` intent allowlists to include tests and the needed intent/workflow config paths.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 1981 --validate` — PASS (generator self-validation)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1981)
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
- [x] Post-merge closeout remediation body generated for merged PR #1981

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3474644506 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474644527 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474655690 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474655753 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474655785 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474664465 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474735526 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474841547 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474841548 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated
- review-comment:3474949942 — accepted — post-merge closeout remediation for prior PR #1981 — thread state: outdated

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
- [x] Merge commit recorded: `4589576566653f2d9a8ba5d8da6bd3a74c631c06`
- [x] Source issue #1962 state inspected after merge
- [x] Post-merge closeout reconciliation for prior PR #1981 delegated to closeout workflow
- [x] Source issue closeout delegated to post-merge closeout workflow

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] Local checks executed and passed
- [x] All reviewer feedback has explicit disposition where required
<!-- CURSOR_AGENT_PR_BODY_END -->
