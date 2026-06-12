<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1561

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: **pass** — Task 008 (#1560) merged on `main`.
- Next queue item: **Task 010** — Fundraiser and campaign admin delta (#1562); blocked until #1561 merges.
- Continue/halt decision: **continue** — Only Task 009 in scope.

## PROGRESS + READINESS (MANDATORY)
- Phase: Phase 4 — Website Operations Admin (`#1258`)
- Task: Task 009 — Events calendar administration delta (`#1561`)
- Status: MERGED
- Scope Confirmed: YES
- Notes: Merged as PR #1596 (merge SHA `2562444483bd91288916049644eb9c7c7212be8f`). Post-merge closeout body remediation applied.

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `src/app/admin/events/page.tsx`
- `tests/admin-events.test.tsx`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## CHANGE SUMMARY
- Gate `/admin/events` behind stored admin token with hydration-safe `tokenReady` state
- Add stale-load request guards and reset event state when token is cleared
- Surface list/seed/mutation status via `AdminStatusText` with alert semantics for errors
- Disable refresh, seed, create/update, and edit actions until token is saved
- Expanded tests (+3): no fetch without token, token-clear reset, error alert announcement

## BUILD / TEST / VERIFICATION
```bash
npm run typecheck
npx vitest run tests/admin-events.test.tsx
npm test
npm run build
```
- PASS — 19/19 events tests; 589/589 full suite at merge time
- Result summary: PASS

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Gemini and Copilot dispositions received.

Reviewer items:
- review-comment:3404222935 — acknowledged — Duplicate token prompt `<p>` retained for explicit pre-token UX; `AdminStatusText` handles API errors — thread state: outdated
- review-comment:3404222944 — acknowledged — `getAllByText` retained to assert duplicate prompt surfaces during token-clear reset — thread state: outdated
- review-comment:3404222960 — acknowledged — `getAllByText` retained to assert duplicate prompt surfaces during token-clear reset — thread state: outdated
- review-comment:3404238429 — acknowledged — Create/update errors use `Create error:` / `Update error:` prefixes; list/auth errors use `Error:` prefix with `role="alert"` — thread state: outdated
- review-comment:3404238455 — acknowledged — Seed auth guard uses `Error:` prefix; operational seed failures use `Seed error:` without alert semantics by design — thread state: outdated

## ACCEPTANCE CRITERIA
- [x] Admin event CRUD safe under empty/error/auth conditions
- [x] Public calendar read paths unchanged (API tests pass)
- [x] One PR with `- **Issue:** #1561`
- [x] Task 010+ not started
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] Allowed files section matches final diff exactly
- [x] ZIP safety confirmed
- [x] Local checks executed and passed
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Close source **#1561** when validator passes after body apply

**Program reference:** #1255

<!-- closeout-trigger: 2026-06-12 -->
<!-- CURSOR_AGENT_PR_BODY_END -->
