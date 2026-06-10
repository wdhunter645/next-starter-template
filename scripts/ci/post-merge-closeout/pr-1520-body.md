- **Issue:** #1407

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read or update `.github/CI_GUARDRAILS_MAP.md` when workflow behavior is unclear or changed.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass
- Next queue item: halt — Task 009 is terminal for Program #1255 child project #1256; no successor task started
- Continue/halt decision: halt — terminal task merged; await post-merge closeout before #1256 project completion

## PROGRESS + READINESS (MANDATORY)
- Phase: Program #1255 — Website Implementation and Content Operations
- Task: Task 009 — Seed content and verification pack (#1407)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1520 (merge SHA `f40cd06827cd13488b89baee4f552006d6981399`). Post-merge closeout body remediation applied for unchecked acceptance criterion and missing advisory section.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `docs/ops/reports/content-strategy-implementation-gap-analysis.md`
- `docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md`
- `docs/reference/website/content-inventory-model.md`
- `docs/tutorials/website/editor-first-story.md`
- `docs/how-to/website/review-content-submission.md`

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `docs/reference/website/content-inventory-model.md`
  - `docs/ops/reports/content-strategy-implementation-gap-analysis.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `seed/content/pilot-pack.json`
- `functions/_lib/content-inventory-seed.ts`
- `tests/content-inventory-seed.test.ts`
- `docs/ops/deploy-log.md`

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

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] Seed library, tests, and deploy-log operator notes only; no workflow YAML, schema migration, or admin UI changes

## CHANGE SUMMARY
- Added `seed/content/pilot-pack.json` with pilot records for canonical, alternate, media-associated, event-year, workflow verification, and rejected queue examples, each with source and credit data.
- Added `functions/_lib/content-inventory-seed.ts` with fixture validation, deterministic seed/cleanup SQL builders, public inclusion/exclusion verification helpers, and rollback notes.
- Added `tests/content-inventory-seed.test.ts` covering fixture coverage, seed/cleanup SQL, inclusion/exclusion rules, and public search/library/related-content verification behavior.
- Appended Task 009 rollback/cleanup guidance to `docs/ops/deploy-log.md`.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npx vitest run --config tests/vitest.node.config.ts tests/content-inventory-seed.test.ts` — PASS (7/7)
  - `npx vitest run --config tests/vitest.node.config.ts tests/content-inventory-public.test.ts tests/content-inventory-search.test.ts tests/content-inventory-media.test.ts tests/content-inventory-rotation.test.ts` — PASS (42/42)
  - `npm run typecheck` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1520)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge closeout exception #1526)
  - Required gates rerun or re-evaluated after fixes: N/A (merged)
- Result summary: PASS (local verification at closeout remediation)

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- [ ] No documentation updates required
- Files:
  - `docs/ops/deploy-log.md`

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.

Reviewer items:
- review-comment:3382690793 — accepted — Added `|| 'NULL'` fallbacks in `buildPilotCleanupStatements()` to avoid empty `IN ()` SQL — thread state: resolved
- review-comment:3382690812 — accepted — Removed unused `db` parameter from `verifyPilotPublicReads()` — thread state: resolved
- review-comment:3382690819 — accepted — Updated test call to match new `verifyPilotPublicReads()` signature — thread state: resolved
- review-comment:3382690833 — accepted — Re-indented `allResult` helper body to consistent 4-space style — thread state: resolved

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
- [x] Final PR panel confirms merge-readiness at merge time

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`f40cd06827cd13488b89baee4f552006d6981399`)
- [x] Source issue state inspected after merge
- [ ] Source issue closed manually when automation did not close it
- [ ] Source issue closure comment references merged PR and merge commit
- [x] Post-merge validation gates inspected when applicable
- [x] Post-merge closeout body remediation applied for unchecked acceptance criterion

## ACCEPTANCE CRITERIA
- [x] Seed or pilot content includes canonical, alternate, media-associated, event-year, and rejected queue examples
- [x] Seed content includes source and credit data
- [x] Verification demonstrates public inclusion and exclusion rules
- [x] Workflow verification examples cover draft inventory and pending/rejected queue states
- [x] Rollback/cleanup notes documented in deploy log and helper module
- [x] Changed files match file-touch allowlist exactly
- [x] Out-of-scope files touched: no
- [x] Exactly one source issue line: `- **Issue:** #1407`
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation

## ROLLBACK PATH
- Run `buildPilotCleanupStatements()` from `functions/_lib/content-inventory-seed.ts` against the target D1 database.
- Cleanup deletes only fixed pilot ids and rows tagged with prefix `lgfc-pilot-`.
- See `docs/ops/deploy-log.md` entry dated 2026-06-09 for operator notes.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular (`change-ops`)
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Close **#1407** after post-merge verification passes following body apply
- Close remediation **#1526** when validator passes after body apply
- Do not advance beyond #1256 terminal closeout in this remediation pass

<!-- closeout-trigger: 2026-06-10 -->
