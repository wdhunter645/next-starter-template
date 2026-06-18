<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1255

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present.
- [x] Read the workflow files that will run for this PR's touched paths.
- [x] Confirm PR body file allowlist exactly matches the final changed-file list.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root
- [x] Final diff confirms no ZIP file is committed

## QUEUE / DEPENDENCY MAP STATUS
- Dependency-map result: not-applicable
- Next queue item: not-applicable
- Continue/halt decision: not-applicable — CI infrastructure fix for Program #1255 child-project closeout

## PROGRESS + READINESS (MANDATORY)
- Phase: Program #1255 infrastructure remediation
- Task: Post-merge umbrella source-issue closeout fix
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none (post-merge closeout body remediation applied)
- Notes: Merged as PR #1699 (merge SHA `58508f6b01a2e8a91e9997f1c1c7e8b82735fd81`). Post-merge closeout body remediation for exception #1710 (batch #1791).

## DOCUMENTATION SOURCE (MANDATORY)
- [ ] DIATAXIS_FULL
- [x] DIATAXIS_ROUTED
- [ ] LEGACY_FALLBACK

Source Files Used:
- `docs/ops/pmo/github-issue-closeout-protocol.md`
- `scripts/ci/post_merge_source_issue_closeout.mjs`
- `tests/post-merge-source-issue-closeout.test.mjs`

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- PMO closeout protocol: `/docs/ops/pmo/github-issue-closeout-protocol.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `scripts/ci/post_merge_source_issue_closeout.mjs`
- `scripts/ci/post_merge_validator.mjs`
- `scripts/orchestrator/sync-pr-state.mjs`
- `tests/post-merge-source-issue-closeout.test.mjs`
- `.github/pull_request_template.md`
- `docs/ops/pmo/github-issue-closeout-protocol.md`

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] Header, footer, navigation, auth, and route invariants preserved unless explicitly in scope
- [x] No unauthorized visual drift introduced
- [x] No out-of-scope UX changes introduced
- [x] Store behavior, Join/Login behavior, and Fan Club/Admin gating remain compliant unless explicitly in scope

## DRIFT GATE ALIGNMENT (MANDATORY)
- [x] Exactly ONE intent label applied (`infra`)
- [x] File changes match allowlist exactly
- [x] No mixed-intent changes present

## DOCS-ONLY ASSERTION (REQUIRED FOR change-ops)
- [ ] This PR contains documentation-only changes
- [x] CI closeout automation behavior modified

## CHANGE SUMMARY
- Expand post-merge keep-open parser to read `## POST-MERGE CLOSEOUT CHECKLIST` in addition to `## POST-MERGE ISSUE DISPOSITION
- Source issue **#1255** is a PROGRAM umbrella and must remain **closed**; remove `status:post-merge-verify` and stale workflow labels; **do not close** or reopen #1255
- Close remediation exception **#1710** when validator passes after body apply.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/post-merge-source-issue-closeout.test.mjs tests/post-merge-validator.test.mjs` — PASS (52 tests)
- Gate verification:
  - Commit-level workflow runs inspected: NO (awaiting PR open)
  - PR-level governance/accounting workflows inspected: NO
  - Failed job logs inspected for every failing gate: N/A
  - Required gates rerun or re-evaluated after fixes: N/A
- Result summary: PASS

## DOCUMENTATION UPDATES
- [x] Documentation updated in this PR
- Files:
  - `docs/ops/pmo/github-issue-closeout-protocol.md`
  - `.github/pull_request_template.md`

## REVIEWER RESPONSE ACCOUNTING

Reviewer items:
- review-comment:3427067265 — acknowledged — addressed or superseded in merged head; post-merge closeout disposition recorded — thread state: outdated
- [x] Reviewed all reviewer comments.
- [x] Reviewed all bot comments.
- [x] Reviewed all GitHub review threads.
- No reviewer comments on initial open — not-applicable

## PRE-MERGE CLOSEOUT PREDICTION (MANDATORY)
- Pre-merge closeout prediction: pass
- Source issue state before merge: open
- Expected post-merge source issue action: no-op — **do NOT close `#1255`** (program umbrella)
- Reviewer disposition parseability: not-applicable
- Queue continuation after closeout: not-applicable

## POST-MERGE ISSUE DISPOSITION
- Source issue **#1255** remains **open** with `status:active`; remove only `status:post-merge-verify` and other stale workflow labels; **do not close** #1255

## POST-MERGE CLOSEOUT CHECKLIST
- [ ] PR merged state verified
- [ ] Merge commit recorded
- [ ] Source issue `#1255` must remain OPEN (program umbrella)
- [ ] **Do NOT close `#1255`**
- [ ] Operator: reopen `#1259` if still closed from PR #1684 automation miss

## ACCEPTANCE CRITERIA
- [x] POST-MERGE CLOSEOUT CHECKLIST keep-open phrases prevent closure
- [x] PROJECT:/PROGRAM: source issues preserved without disposition section
- [x] Explicit terminal close in POST-MERGE ISSUE DISPOSITION still allows closure
- [x] PR template documents POST-MERGE ISSUE DISPOSITION section
- [x] All tests pass

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] Allowed files section matches final diff exactly
- [x] ZIP safety confirmed
- [x] Intent label correct and singular (`infra`)
- [x] Local checks executed and passed
<!-- CURSOR_AGENT_PR_BODY_END -->
