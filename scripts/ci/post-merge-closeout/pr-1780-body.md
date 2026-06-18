<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1738

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list before opening.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable — docs hygiene follow-up from #1736 closeout
- Next queue item: halt — no Cursor launch from this PR
- Continue/halt decision: halt — documentation sync only

## PROGRESS + READINESS (MANDATORY)
- Phase: Program documentation hygiene
- Task: #1738
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Merged as PR #1780 at `d3019beee16bc9099e3dcc48cc8f18a35325d829`. PROGRAM umbrella source issue was incorrectly closed on merge; closeout replay must reopen #1738.

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

## LABEL
- Intent label for this PR: docs-only

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md`

All other files are out of scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied (`docs-only`)
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [x] This PR contains documentation-only changes
- [ ] No application code, config, or runtime behavior modified

## CHANGE SUMMARY
- Set `Related Program Issue` to `#1738` in the Priority #4 implementation plan.
- Add `#1738` to `Related Issues` front matter.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `DOCS_HEADER_FILE_LIST=docs/ops/implementation-plans/lou-gehrig-content-collection-expansion.md bash scripts/ci/docs_check_headers.sh .` — PASS
- Result summary: PASS

## REVIEWER RESPONSE ACCOUNTING
- [x] Reviewed all reviewer comments.
- [x] Copilot disposition received or not applicable.
- [x] Codex disposition received or not applicable.
- [x] Gemini disposition received or not applicable.
- [x] Cubic disposition received or not applicable.

Reviewer items:
- review-comment:3432081339 — rejected — terminal label guidance is N/A for PROGRAM umbrella kept open by disposition — thread state: outdated
- review-comment:3432081345 — rejected — terminal label guidance is N/A for PROGRAM umbrella kept open by disposition — thread state: outdated
- review-comment:3432081974 — acknowledged — bare numeric Source Issue matches existing implementation-plan front-matter convention — thread state: resolved

## POST-MERGE ISSUE DISPOSITION
- Source issue **#1738** is a PROGRAM umbrella and must remain **open** with `status:active`; **reopen #1738** if incorrectly closed on merge; remove `status:failed` and `status:post-merge-verify`; **do not close** #1738
- Child issues **#1739–#1746** must remain open.

## ACCEPTANCE CRITERIA
- [x] Required source issue exists, is same-repository, and is not a PR.
- [x] Implementation plan references program issue #1738.
- [x] No out-of-scope file changes.
- [x] Documentation header check passes.
- [x] Post-merge source issue closure completes after merge and closeout replay.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] Allowed files section matches final diff exactly
- [x] Local checks executed and passed
<!-- CURSOR_AGENT_PR_BODY_END -->
