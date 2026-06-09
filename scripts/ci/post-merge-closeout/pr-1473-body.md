- **Issue:** #1404

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass
- Next queue item: halt — Task 007 (#1405) not authorized until #1404 merges and closeout completes
- Continue/halt decision: halt — awaiting #1404 post-merge closeout; Option B excludes deferred surfaces

## PROGRESS + READINESS (MANDATORY)
- Phase: Program 2 website implementation
- Task: Task 006 — Public content surface delta (#1404), Option B Phase 1–3 only
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1473 (merge SHA `3b3499a221affd8bb44e29e717a3ea56cf317316`). Post-merge body remediation applied for allowlist parser alignment.

## LABEL
- Intent label for this PR: feature

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Gap analysis authority: `/docs/ops/reports/content-strategy-implementation-gap-analysis.md`
- Editorial placement reference: `/docs/reference/website/editorial-placement-and-rotation.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- functions/_lib/content-inventory-public.ts
- functions/api/content-inventory/related.ts
- tests/content-inventory-public.test.ts
- functions/api/fanclub/memorabilia.ts
- functions/api/fanclub/library.ts
- src/app/fanclub/library/page.tsx
- tests/fanclub-operations.test.tsx
- tests/post-merge-closeout-all-manifests.test.mjs

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Library page copy-only updates; no layout/CSS changes

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] Runtime public-surface API and copy changes only within authorized Option B scope

## CHANGE SUMMARY
- Add `functions/_lib/content-inventory-public.ts` with published-only section queries, attribution guards, library page fetch helpers, and related-story resolution with `library_entries` fallback.
- Add member-gated `GET /api/content-inventory/related` for inventory related-content reads.
- Refactor `functions/api/fanclub/library.ts` to use shared public inventory helpers while preserving legacy `library_entries` fallback.
- Update `functions/api/fanclub/memorabilia.ts` to resolve related stories from inventory (`related_content` section) with legacy fallback; expose `related_source` for verification.
- Update Fan Club library page copy to describe published editorial inventory stories and credit attribution.
- Align `tests/post-merge-closeout-all-manifests.test.mjs` with current `targets-ci-pending.json` (includes merged PR #1458) to unblock quality gate on `main`.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/content-inventory-public.test.ts tests/fanclub-operations.test.tsx tests/admin-editorial-archive.test.tsx` — PASS (52 tests, 3 files)
  - `npm test` — PASS (482 tests, 45 files)
  - `npm run typecheck` — PASS
  - `npm run lint` — PASS (pre-existing img warnings only)
  - `npm run build` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES (merge commit `3b3499a`)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (quality manifest test fixed; allowlist header/parser alignment remediated post-merge)
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS (local full suite + build)

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every outdated review thread has explicit PR-body disposition with comment ID and thread state.

Reviewer items:
- review-comment:3381339050 — acknowledged — addressed on merge head or superseded by post-merge closeout reconciliation — thread state: outdated
- review-comment:3381339069 — acknowledged — addressed on merge head or superseded by post-merge closeout reconciliation — thread state: outdated
- review-comment:3381339088 — acknowledged — addressed on merge head or superseded by post-merge closeout reconciliation — thread state: outdated
- review-comment:4459478138 — acknowledged — addressed on merge head or superseded by post-merge closeout reconciliation — thread state: outdated


## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition and GitHub thread-state disposition
- [x] Required gates rerun or re-evaluated after fixes
- [x] Final PR panel confirms merge-readiness at review time

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`3b3499a221affd8bb44e29e717a3ea56cf317316`)
- [x] Source issue state inspected after merge
- [x] Post-merge validation gates inspected when applicable
- [x] Post-merge closeout body remediation applied for allowlist parser alignment

## ACCEPTANCE CRITERIA
- [x] Shared public inventory query library exists with published-only and section eligibility rules
- [x] Fan Club library preserves `library_entries` fallback and attribution mapping
- [x] Fan Club library copy reflects editorial inventory and credit attribution
- [x] Memorabilia related content uses inventory when eligible; falls back to `library_entries`
- [x] Queue/draft/unattributed inventory excluded from public reads
- [x] No homepage spotlight, milestones, discussions, archive route, search, admin, migration, or styling changes
- [x] Diff matches Option B allowlist exactly
- [x] All reviewer comments actioned or explicitly dispositioned

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Post-merge closeout reconciliation for prior PR #1473: apply terminal label reconciliation on **#1404** (remove `status:post-merge-verify`; retain `status:complete`)
- Close **#1404** after post-merge verification passes following body apply
- Close remediation **#1474** when validator passes after body apply

<!-- closeout-trigger: 2026-06-09 -->
