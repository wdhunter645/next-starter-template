<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1617

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR. Preferred format: `- **Issue:** #123`.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.
- [x] For docs changes, confirm every changed active Markdown file starts with the required authority header from `docs/templates/markdown-header-template.md`.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS (REQUIRED FOR LAUNCHED-PROGRAM QUEUE TASKS)
- Dependency-map result: not-applicable — live production ops remediation, not a launched-program queue task.
- Next queue item: not-applicable — live production ops remediation.
- Continue/halt decision: not-applicable — resolves #1617 only.

## PROGRESS + READINESS (MANDATORY)
- Phase: live production ops remediation
- Task: restore locked mobile footer legal-link layout
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation applied)
- Notes: Merged as PR #1619 (merge SHA `98394ec9a8ed2e1eb8aa63d724822bddaac13110`). Post-merge closeout reconciliation for closed source issue #1617.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `tests/e2e/mobile-navigation.spec.ts`
- `src/components/Footer.tsx`

## LABEL
- Intent label for this PR: change-ops

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Canonical design reference: `/docs/reference/design/LGFC-Production-Design-and-Standards.md`
- Additional design/reference docs used for this PR:
  - `tests/e2e/mobile-navigation.spec.ts`
  - `src/components/Footer.tsx`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `src/components/Footer.tsx`

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
- [x] No: application code modified because #1617 is a live footer layout remediation.

## CHANGE SUMMARY
- Replaces footer link row flex wrapping with a two-column grid for `Privacy` and `Terms`.
- Places `Contact` across the full second row of the footer link grid.
- Preserves existing footer links, back-to-top logo button, and route targets.

## BUILD / TEST / VERIFICATION
- Commands run:
  - GitHub compare: `main...atlas/fix-mobile-footer-privacy-terms-1617` — PASS; only `src/components/Footer.tsx` changed.
  - `quality` workflow on PR head — PASS (merge commit `98394ec9a8ed2e1eb8aa63d724822bddaac13110`).
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES (post-merge closeout exception #1622)
  - Required gates rerun or re-evaluated after fixes: N/A (merged)
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
- [x] Every GitHub review thread has an explicit thread-state disposition: resolved, outdated, or intentionally left unresolved with rationale.

Reviewer items:
- review-comment:3408201835 — accepted — Contact link spans full grid row via `gridColumn: 1 / -1`; layout uses `justifyContent: 'end'` (not `justifyItems: 'end'`) so the Contact tap target retains full-row width with right-aligned text — thread state: outdated

## POST-MERGE CLOSEOUT CHECKLIST
- [x] PR merged state verified
- [x] Merge commit recorded (`98394ec9a8ed2e1eb8aa63d724822bddaac13110`)
- [x] Source issue state inspected after merge
- [x] Post-merge closeout reconciliation applied for closed source issue #1617 label hygiene
- [x] Post-merge validation gates inspected when applicable

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is same-repository, and is not a PR.
- [x] PR issue-accounting gate passes.
- [x] Footer mobile renders `Privacy` and `Terms` in the same grid row by implementation.
- [x] `Contact` remains below that row by implementation.
- [x] `Admin`, `Support`, and `mailto:` links remain absent from `Footer.tsx`.
- [x] No horizontal-overflow source change introduced.
- [x] Production invariant test passes in PR CI or a follow-up production audit after merge.
- [x] Post-merge closeout criteria satisfied after merge and closeout body remediation

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Verification commands recorded with PASS result
- [x] All reviewer feedback has both textual disposition and GitHub thread-state disposition
- [x] Post-merge closeout body remediation applied for merged PR governance

## POST-MERGE ISSUE DISPOSITION
- Post-merge closeout reconciliation for closed source issue **#1617** (already **closed**, `state_reason: completed`); perform label reconciliation only — remove `status:post-merge-verify`, `status:review`, and other stale workflow labels; add `status:complete` per terminal label plan; **do not reopen** #1617
- Remediation follow-up for prior issue **#1617** and merged PR **#1619**
- Close remediation issue **#1622** when validator passes after body apply

<!-- closeout-trigger: 2026-06-14 -->
<!-- CURSOR_AGENT_PR_BODY_END -->
