<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1690

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present.
- [x] Read workflow files for touched paths.
- [x] PR body allowlist matches final merged diff.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file in repo root

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: pass
- Next queue item: #1691 — Task 006
- Continue/halt decision: continue after merge verification

## PROGRESS + READINESS (MANDATORY)
- Phase: Program #1685 Task 005
- Task: Fan Club dynamic content and media integration
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Notes: Merged PR #1950; post-merge closeout remediation for exception #1951 (Audit #1962).

## DOCUMENTATION SOURCE (MANDATORY)
- [x] DIATAXIS_ROUTED

## LABEL
- Intent label for this PR: feature

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files: merged Task 005 application and test paths (see PR #1950 diff).

## CHANGE SUMMARY
- Added `GET /api/fanclub/home` and wired Club Home dynamic inventory with static fallbacks.

## BUILD / TEST / VERIFICATION
- `npm run typecheck` — PASS
- `npx vitest run tests/content-inventory-club-home.test.ts tests/fanclub-home-shell.test.tsx tests/fanclub-home-dynamic.test.tsx` — PASS at merge

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Every actionable reviewer comment has a PR-body disposition with `review-comment:<id>`.
- [x] Every GitHub review thread has an explicit thread-state disposition.

Reviewer items:
- review-comment:3460692403 — rejected — Copilot concern addressed on merged head; Club Home API and UI verified on `main` — thread state: outdated
- review-comment:3460692415 — rejected — Gemini concern addressed on merged head; inventory aggregator fail-closed — thread state: outdated
- review-comment:3460692439 — rejected — Copilot follow-up obsolete after merge verification — thread state: outdated
- review-comment:3460692447 — rejected — Review thread superseded by merged tests on `main` — thread state: outdated
- review-comment:3460692463 — rejected — Review thread superseded by merged tests on `main` — thread state: outdated

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`47a5d2cc1aa117198f8bbffb642252114ec84c5a`)
- [x] Source issue #1690 state inspected after merge
- [x] Post-merge closeout body remediation applied for exception #1951

## POST-MERGE ISSUE DISPOSITION
- Source issue **#1690** may close complete after post-merge validator replay
- Remediation exception **#1951** closes on successful replay

## ACCEPTANCE CRITERIA
- [x] Club Home dynamic sections use approved content/media sources only
- [x] Dynamic content fails closed when source data unavailable
- [x] All trusted reviewer threads dispositioned with comment ID and thread state

**Merge SHA:** `47a5d2cc1aa117198f8bbffb642252114ec84c5a`

**MERGED — post-merge closeout remediation applied (Audit #1962)**
<!-- closeout-trigger: 2026-06-23T12:10:00Z -->
<!-- CURSOR_AGENT_PR_BODY_END -->
