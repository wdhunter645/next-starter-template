- **Issue:** #1405

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass
- Next queue item: halt — Task 008 not authorized until Task 007 merges and closeout completes
- Continue/halt decision: halt — awaiting Task 007 post-merge closeout

## PROGRESS + READINESS (MANDATORY)
- Phase: Program 2 website implementation
- Task: Task 007 — Search and discovery delta (#1405)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1478 (merge SHA `dce32bc9b4393d2957b1396d698ba167a72afe39`). Post-merge body remediation applied for parser-compliant section headers and allowlist.

## LABEL
- Intent label for this PR: feature

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Gap analysis authority: `/docs/ops/reports/content-strategy-implementation-gap-analysis.md`
- Implementation plan reference: `/docs/ops/implementation-plans/website-content-strategy-editorial-inventory.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- functions/_lib/content-inventory-public.ts
- functions/api/search.ts
- tests/content-inventory-search.test.ts
- tests/content-inventory-public.test.ts
- tests/admin-editorial-archive.test.tsx

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Search API behavior only; no search page layout/CSS changes

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] Runtime search API and shared inventory helper changes only within Task 007 scope

## CHANGE SUMMARY
- Extend `functions/_lib/content-inventory-public.ts` with `SEARCH_SECTION`, inventory search fetch helpers, canonical/alternate title formatting, per-isolate `tableExistsCache`, and member library dual-read resolution for search.
- Update `functions/api/search.ts` to index published `content_inventory` rows (public `Archive` results) and use inventory-first library search for members with `library_entries` fallback.
- Search matching covers title, text, summary, search_text, tag, source_name, credit_line, perspective_label, event year/date, and associated media captions/OCR when `content_inventory_media` and `photos` tables exist.
- Add `tests/content-inventory-search.test.ts` covering canonical/alternate discoverability, source/credit metadata, media OCR indexing, draft exclusion, and library dual-read behavior.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/content-inventory-search.test.ts tests/content-inventory-public.test.ts` — PASS (23 tests, 2 files)
  - `npm test` — PASS (493 tests, 46 files)
  - `npm run typecheck` — PASS
  - `npm run lint` — PASS (pre-existing img warnings only)
  - `npm run build` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES (merge commit `dce32bc`)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge metadata/allowlist parser alignment remediated)
  - Required gates rerun or re-evaluated after fixes: YES
- Result summary: PASS (local full suite + build on `main` at `dce32bc`)

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Gemini disposition received.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every outdated review thread has explicit PR-body disposition with comment ID and thread state.

Reviewer items:
- review-comment:3381713982 — accepted — Added per-isolate `tableExistsCache` in `content-inventory-public.ts` to avoid repeated `sqlite_master` lookups on search requests — thread state: resolved
- review-comment:3381713998 — accepted — `pushInventoryLikeArgs` now derives bind-arg count from `INVENTORY_TEXT_SEARCH_FIELDS` and media clause length — thread state: resolved
- review-comment:3381714005 — accepted — Simplified member library search excerpt mapping to `excerpt(hit.excerpt)` — thread state: resolved

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
- [x] Merge commit recorded (`dce32bc9b4393d2957b1396d698ba167a72afe39`)
- [x] Source issue state inspected after merge
- [x] Post-merge validation gates inspected when applicable
- [x] Post-merge closeout body remediation applied for parser alignment

## ACCEPTANCE CRITERIA
- [x] Public search indexes approved title, text, tag, search text, source, credit, event year/date, and media captions/OCR where available
- [x] Canonical and alternate-perspective rows discoverable with distinct title labels
- [x] Rejected, queue, draft, under-review records excluded from search
- [x] Member library search uses inventory when eligible; falls back to `library_entries`
- [x] Tests cover canonical result, alternate result, source/credit match, and draft exclusion
- [x] Diff matches Task 007 allowlist exactly
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
- Close **#1405** after post-merge verification passes following body apply
- Close remediation **#1481** when validator passes after body apply

<!-- closeout-trigger: 2026-06-09 -->
