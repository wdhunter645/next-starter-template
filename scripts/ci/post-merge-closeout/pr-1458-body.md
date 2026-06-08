- **Issue:** #1403

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: pass
- Next queue item: halt — Task 006 (#1404) not authorized until #1403 post-merge closeout completes
- Continue/halt decision: halt — post-merge reviewer-disposition remediation only

## PROGRESS + READINESS (MANDATORY)
- Phase: Program 2 website implementation
- Task: Task 005 — Admin editor workflow delta (#1403)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking issues: none (post-merge body remediation applied)
- Notes: Merged as PR #1458 (merge SHA `47693785f533f26e02d4961c6a54a05eb69d8829`). Post-merge body remediation applied for outdated reviewer threads.

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Gap analysis authority: `/docs/ops/reports/content-strategy-implementation-gap-analysis.md`
- Editorial placement reference: `/docs/reference/website/editorial-placement-and-rotation.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `functions/api/admin/editorial/inventory.ts`
- `src/app/admin/editorial/page.tsx`
- `tests/admin-editorial-archive.test.tsx`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Admin-only editorial workflow changes; no public rendering changes

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] Admin/editor workflow and API changes only; no public rendering, search, rotation engine, migrations, or workflow YAML changes

## CHANGE SUMMARY
- Add `POST /api/admin/editorial/inventory` for direct `content_inventory` draft create/update with validated allowed sections, canonical/alternate metadata, event/rotation fields, and search_text regeneration.
- Extend `/admin/editorial` with create-story form, inventory metadata editor, section multi-select, canonical/alternate controls, event/rotation fields, and media association JSON editor wired to existing media-associations API.
- Wire submission approve payloads to pass full metadata instead of hardcoded `allowed_sections: ['library']`.
- Preserve existing review/publish spine and queue workflow actions.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/admin-editorial-archive.test.tsx tests/content-inventory-media.test.ts` — PASS (41 tests, 2 files)
- Gate verification:
  - Commit-level workflow runs inspected: YES (merged PR #1458)
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge closeout exceptions #1459/#1460)
  - Required gates rerun or re-evaluated after fixes: N/A (merged)
- Result summary: PASS (local targeted tests at merge); post-merge closeout remediation applied

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- [x] Copilot disposition received.
- [x] Gemini disposition received.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every outdated review thread has explicit PR-body disposition with comment ID and thread state.
- [x] Undispositioned reviewer findings linked to bounded follow-up when deferred (follow-up-issue:#1459 below).

Reviewer items:
- review-comment:3375016658 — acknowledged — Separate DB datetime query micro-optimization valid; not applied in merged `47693785` — thread state: outdated
- review-comment:3375016664 — acknowledged — Single FormData reuse in readMetadataFromForm valid; not applied in merged `47693785` — thread state: outdated
- review-comment:3375016670 — acknowledged — Single FormData reuse in reviewSubmission valid; not applied in merged `47693785` — thread state: outdated
- review-comment:3375025796 — acknowledged — Client-side NaN guard for numeric fields valid; server-side coercion retained in merged `47693785` — thread state: outdated
- review-comment:3375025840 — acknowledged — Non-array media JSON error surfacing valid; invalid JSON still fails, valid non-array JSON deferred — follow-up-issue:#1459
- review-comment:4451719109 — accepted — Gemini review submission accounted; inline outdated-thread dispositions applied below — thread state: resolved
- review-comment:4451730975 — accepted — Copilot review submission accounted; inline outdated-thread dispositions applied below — thread state: resolved

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
- [x] Merge commit recorded (`47693785f533f26e02d4961c6a54a05eb69d8829`)
- [x] Source issue state inspected after merge
- [ ] Source issue closed manually when automation did not close it
- [ ] Source issue closure comment references merged PR and merge commit
- [x] Post-merge validation gates inspected when applicable
- [x] Post-merge closeout body remediation applied for outdated reviewer threads

## ACCEPTANCE CRITERIA
- [x] Editors can create draft stories directly without queue submission
- [x] Editors can update story metadata after inventory insertion
- [x] Section multi-select uses approved allowed_sections registry keys
- [x] Canonical/alternate and perspective_label controls exposed
- [x] Event date/year, rotation group, and feature weight exposed
- [x] Media associations manageable via existing admin API
- [x] Existing review/publish spine preserved
- [x] No public rendering, search, rotation engine, migration, or workflow changes
- [x] All reviewer comments actioned, explicitly dispositioned, or linked to bounded follow-up issue

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
- Close **#1403** after post-merge verification passes following body apply
- Close remediation **#1459** and **#1460** when validator passes after body apply

<!-- closeout-trigger: 2026-06-08 -->
