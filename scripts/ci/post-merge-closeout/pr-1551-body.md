<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1258

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass
- Next queue item: halt — Task 006 (CMS and page content admin delta, `#1121` / T43) awaits explicit authorization after Task 005 merge
- Continue/halt decision: halt — one task per PR; Task 005 only

## PROGRESS + READINESS (MANDATORY)
- Phase: Program #1255 — Website Operations Admin (`#1258` Phase 4)
- Task: Task 005 — Moderation and review workflow delta (`#1120` / T42)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation applied)
- Notes: Merged as PR #1551 (merge SHA `3509bbb5952864f55a3000910e3cdb6c2c5121b7`). Post-merge closeout body remediation applied for terminal label conflict and missing governance sections.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- `docs/reference/design/LGFC-Production-Design-and-Standards.md`
- `docs/reference/architecture/access-model.md`
- `docs/ops/implementation-plans/website-operations-admin.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `src/app/admin/moderation/page.tsx`
- `src/app/admin/faq/page.tsx`
- `tests/admin-moderation.test.tsx`
- `active_tasklist.md`
- `docs/ops/implementation-plans/website-operations-admin.md`

## VISUAL / UX INVARIANTS (MANDATORY)
- No public route, navigation, homepage, auth model, fundraiser, or spotlight changes
- Admin dual-gating preserved (session UI + `ADMIN_TOKEN` API)

## CHANGE SUMMARY
Task 005 hardens moderation and review admin surfaces per the `#1258` implementation plan:

1. **Moderation hub** (`/admin/moderation`): API failures use `Error:` prefix and `AdminStatusText` for accessible alerts.
2. **FAQ moderation** (`/admin/faq`): Unified `AdminTokenPanel`, `adminJson`, `AdminStatusText`, and token gating.
3. **Tests**: Expanded `tests/admin-moderation.test.tsx` for failure alerts and FAQ token gating.
4. **Review remediation** (`55ac96e`): Split ask/faq tab `useEffect` hooks; removed redundant `setStatus('')` after `loadAsk`/`loadFaq` in action handlers.
5. **Readiness recovery** (`2e60d87`): Merged `origin/main` (no conflicts).

## BUILD / TEST / VERIFICATION
```bash
npx vitest run tests/admin-moderation.test.tsx  # pass (7 tests)
npm test                                         # pass (542 tests)
npm run lint                                     # pass (pre-existing img warnings)
npm run build                                    # pass (static export, 41 routes)
```
Results: all passed at merge.

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
- review-comment:3395189090 — accepted — Split combined useEffect into separate ask-tab and faq-tab effects in `src/app/admin/faq/page.tsx` — thread state: outdated
- review-comment:3395189097 — accepted — Removed redundant `setStatus('')` after `await loadAsk()` in `askAction` — thread state: outdated
- review-comment:3395189108 — accepted — Removed redundant `setStatus('')` after `await loadFaq()` in `saveFaq` — thread state: outdated

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`3509bbb5952864f55a3000910e3cdb6c2c5121b7`)
- [x] Source issue state inspected after merge
- [x] Post-merge closeout body remediation applied for terminal label conflict

## ACCEPTANCE CRITERIA
- [x] Moderation, FAQ, Ask, and reports paths preserved
- [x] Accessible error announcements on API failures
- [x] FAQ page uses shared admin token panel
- [x] Review feedback addressed
- [x] Branch synced with `origin/main`
- [x] Static export build remains valid
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] One source issue (`#1258`)
- [x] Allowlist matches diff
- [x] No ZIP artifacts
- [x] No `src/app/api/**/route.ts` handlers added
- [x] Tests and build green
- [x] Reviewer response accounting complete for outdated threads
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Source issue **#1258** remains **open** with `status:active`; remove only `status:post-merge-verify` and other stale workflow labels; **do not close** #1258
- Close remediation issue **#1554** when validator passes after body apply

<!-- closeout-trigger: 2026-06-14 -->
<!-- CURSOR_AGENT_PR_BODY_END -->
