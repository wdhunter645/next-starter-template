<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1258

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass
- Next queue item: #1258 Task 004 — Admin shell and member operations delta (after merge)
- Continue/halt decision: halt — Task 003 verification PR; stop at READY FOR REVIEW

## PROGRESS + READINESS (MANDATORY)
- Phase: Program #1255 Phase 4 — #1258 Task 003
- Task: Fan Club operational workflows verification (`#1118` / T40)
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation applied)
- Notes: Merged as PR #1536 (merge SHA `62ca227c5939f9a852bd8268d2bcdf406a35d1ba`). Post-merge closeout body remediation applied for missing reviewer response accounting.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

## LABEL
- Intent label for this PR: implementation

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
Fan Club member operational surfaces only (`/fanclub/photo`, `/fanclub/submit`, `/fanclub/chat`, library/memorabilia reads). No public homepage or net-new feature scope.

## VISUAL / UX INVARIANTS (MANDATORY)
- Member session gate on `/fanclub/**` unchanged (redirect unauthenticated users to `/`).
- Empty and error states remain inline on operational pages; no new public routes.
- Chat post failures must surface operator-visible error text (no silent failure).

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- src/app/fanclub/chat/page.tsx
- src/app/fanclub/submit/page.tsx
- src/app/fanclub/photo/page.tsx
- src/app/fanclub/library/page.tsx
- src/app/fanclub/memorabilia/page.tsx
- tests/fanclub-operations.test.tsx
- docs/ops/implementation-plans/website-operations-admin.md
- active_tasklist.md

All other files are out of scope.

## CHANGE SUMMARY
- Add `credentials: 'include'` on Fan Club operational API fetches (photo, submit, chat, library, memorabilia).
- Surface chat post API failures in the composer UI.
- Stop sending client-supplied email on library submit (session-derived server-side).
- Expand `tests/fanclub-operations.test.tsx` for auth rejection, empty states, load errors, and chat post failure UX.
- Update implementation plan Task 003 notes and active tasklist snapshot.

## BUILD / TEST / VERIFICATION
```bash
git status --short
git diff --check
npm run typecheck
npm test -- tests/fanclub-operations.test.tsx
```
Results: `typecheck` passed; fanclub test suite expanded (CI authoritative).

Gate verification:
- Commit-level workflow runs inspected: YES
- Optional merge-commit workflow noise (Auto-Sync Documentation secret-access/configuration, Docs Guardrails) classified non-blocking for this implementation PR
- Result summary: PASS

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
- review-comment:3389010172 — acknowledged — chat post failure surfaced inline with `Error:` prefix in composer; dedicated ARIA live-region semantics deferred to admin surface hardening (Task 005 scope) — thread state: outdated
- review-comment:3389010236 — accepted — Task 003 status labels normalized to `complete` in implementation plan post-merge closeout (`#1538`) — thread state: outdated

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`62ca227c5939f9a852bd8268d2bcdf406a35d1ba`)
- [x] Source issue state inspected after merge
- [x] Post-merge closeout body remediation applied for missing reviewer response accounting

## ACCEPTANCE CRITERIA
- [x] Fan Club operational paths verified for auth/empty/error handling
- [x] Gaps fixed or documented (`#1259` deferral: PDF upload pipeline on submit page)
- [x] Scoped tests expanded; typecheck passes
- [x] No D1 migrations, workflow YAML, child issues
- [x] `#1259` and `#1500` untouched; `#1258` not closed
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Source issue **#1258** remains **open** with `status:active`; remove only `status:post-merge-verify`, `status:failed`, and other stale workflow labels; **reopen #1258** if incorrectly closed during prior batch replay; **do not close** #1258
- Close remediation issues **#1629** and **#1636** when validator passes after body apply

<!-- closeout-trigger: 2026-06-14T15:00:00Z -->
<!-- CURSOR_AGENT_PR_BODY_END -->
