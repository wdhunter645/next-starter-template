<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1962

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.
- [x] Read the workflow files that will run for this PR's touched paths before opening/updating the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root.
- [x] Final diff confirms no ZIP file is committed.

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable — post-merge closeout remediation for merged PR #1981.
- Next queue item: not-applicable.
- Continue/halt decision: continue after post-merge closeout replay clears exception #2031.

## PRE-MERGE CLOSEOUT PREDICTION (REQUIRED BEFORE READY FOR MERGE)
- Pre-merge closeout prediction: pass
- Source issue state before merge: open
- Expected post-merge source issue action: no-op — #1962 remains open until Bill/Atlas audit acceptance
- Reviewer disposition parseability: pass
- Queue continuation after closeout: not-applicable

## PROGRESS + READINESS (MANDATORY)
- Phase: Post-merge closeout remediation
- Task: OPS exception #2031 body remediation for merged PR #1981
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation generated)
- Notes: Merged as PR #1981 at `4589576566653f2d9a8ba5d8da6bd3a74c631c06`. Remediation for exception #2031 (outdated reviewer thread dispositions).

## DOCUMENTATION SOURCE (MANDATORY)
- [x] DIATAXIS_ROUTED

Source Files Used:
- `docs/ops/implementation-plans/website-completion-fan-club-product-buildout.md`
- `docs/reference/design/fanclub-subpages.md`
- `docs/reference/design/fanclub-home.md`
- `docs/governance/PR_GOVERNANCE.md`

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `/docs/reference/design/fanclub-subpages.md`
- `/docs/reference/design/fanclub-home.md`

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

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## CHANGE SUMMARY
- Program #1685 audit remediation: Club Home newspaper layout, memorabilia tags API, responsive gallery grids, admin `club_home` option, audit register, and closeout replay manifest.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `node scripts/ci/generate_post_merge_closeout_bodies.mjs --prs 1981 --validate` — PASS (generator self-validation)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1981)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES (remediated body artifact)
- Result summary: PASS

## DOCUMENTATION UPDATES
- [x] Documentation updated in merged PR #1981
- Files:
  - `docs/ops/reports/website-completion-program-1685-audit-register.md`
  - `docs/ops/reports/website-completion-program-closeout.md`
  - `docs/reference/design/fanclub-home.md`
  - `docs/as-built/cloudflare-frontend.md`

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments, bot comments, and review threads.
- review-comment:3474644506 — accepted — responsive CSS module grid merged in PR #1981 — thread state: outdated
- review-comment:3474644527 — accepted — `tagsParam` memo dependency merged in PR #1981 — thread state: outdated
- review-comment:3474655690 — accepted — responsive CSS module breakpoint merged in PR #1981 — thread state: outdated
- review-comment:3474655753 — accepted — `resolveFetchUrl` helper merged in PR #1981 — thread state: outdated
- review-comment:3474655785 — accepted — fetch mock type-guards merged in PR #1981 — thread state: outdated
- review-comment:3474664465 — accepted — closeout body acceptance criteria merged in PR #1981 — thread state: outdated
- review-comment:3474735526 — accepted — active manifest registry includes Program #1685 closeout manifest — thread state: outdated
- review-comment:3474841547 — accepted — workflow push paths include closeout manifest — thread state: outdated
- review-comment:3474841548 — accepted — as-built docs record removed Club Home modules — thread state: outdated
- review-comment:3474949942 — accepted — change-ops intent allowlists cover tests and config paths — thread state: outdated

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Required gates rerun or re-evaluated after fixes

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`4589576566653f2d9a8ba5d8da6bd3a74c631c06`)
- [x] Source issue state inspected after merge
- [ ] Closeout replay executed for Program #1685 manifest after this remediation merges
- [ ] Post-merge validation gates inspected when applicable

## POST-MERGE ISSUE DISPOSITION (REQUIRED FOR CHILD PROJECT / UMBRELLA SOURCE ISSUES)
- Source issue **#1962** remains **open** with `status:active`; remove only stale workflow labels if present; **do not close** #1962

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is open, is same-repository, and is not a PR.
- [x] PR issue-accounting gate passes.
- [x] Drift gate passes.
- [x] Intent gate passes.
- [x] ZIP safety gate passes.
- [x] Quality checks pass.
- [x] Repository-specific governance gates pass.
- [x] All actionable reviewer and bot feedback is resolved or explicitly dispositioned.
- [x] Post-merge closeout remediation body generated for merged PR #1981

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line
- [x] Allowed files section matches final diff exactly
- [x] All reviewer feedback has disposition and thread-state
- [x] Status is set to MERGED for post-merge closeout replay

<!-- CURSOR_AGENT_PR_BODY_END -->

**MERGED — post-merge closeout remediation applied (Audit #1962 / exception #2031)**
