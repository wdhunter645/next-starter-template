<!-- CURSOR_AGENT_PR_BODY_BEGIN -->
- **Issue:** #1116

## PRE-OPEN GATE PREFLIGHT (MANDATORY)
- [x] Confirm exactly one same-repository, open, non-PR source issue exists.
- [x] Confirm one accepted issue-accounting line is present before opening or updating the PR.
- [x] Read the workflow files that will run for this PR's touched paths before opening the PR.
- [x] Read `docs/reference/governance/troubleshooting-data-surface-requirements.md` before making any merge-readiness claim.

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root

## PROGRESS + READINESS (MANDATORY)
- Phase: CI remediation lifecycle
- Task: Close duplicate post-merge remediation issues
- Status: MERGED
- Scope Confirmed: YES
- Out-of-Scope Changes Present: NO
- Blocking Issues: none
- Notes: Addresses acceptance criterion "duplicate remediation Issues prevented" on source issue #1116. Broader CI design refinements deferred to future rollout tasks.

## DOCUMENTATION SOURCE (MANDATORY)
- [x] LEGACY_FALLBACK

Source Files Used:
- `docs/explanation/ci/remediation-framework.md`

## LABEL
- Intent label for this PR: infra

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: `/docs/governance/PR_PROCESS.md`
- Canonical governance reference: `/docs/governance/PR_GOVERNANCE.md`
- Canonical troubleshooting reference: `/docs/reference/governance/troubleshooting-data-surface-requirements.md`
- Additional design/reference docs used for this PR:
  - `docs/explanation/ci/remediation-framework.md`

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- `.github/workflows/post-merge-remediation.yml`
- `scripts/ci/close_duplicate_remediation_issues.mjs`
- `scripts/ci/github_issue_api.mjs`
- `scripts/ci/post_merge_remediation_issue.mjs`
- `tests/close-duplicate-remediation-issues.test.mjs`
- `tests/github-issue-api.test.mjs`

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
- [x] No application code, config, or runtime behavior modified outside CI remediation automation

## CHANGE SUMMARY
- Add `scripts/ci/close_duplicate_remediation_issues.mjs` to group open `post-merge-failure` issues by PR + merge SHA, keep the oldest canonical, and close newer duplicates.
- Extract shared GitHub repo request helper to `scripts/ci/github_issue_api.mjs` for remediation issue upsert and duplicate-close cleanup.
- Wire the cleanup script into `post-merge-remediation.yml` after remediation issue upsert.
- Add unit tests for grouping, source-issue protection, unknown merge SHA isolation, close comments, and shared API helper behavior.

## BUILD / TEST / VERIFICATION
- Commands run:
  - `npm test -- tests/close-duplicate-remediation-issues.test.mjs tests/github-issue-api.test.mjs tests/post-merge-validator.test.mjs` — PASS (18 tests)
  - `npm run typecheck` — PASS
- Gate verification:
  - Commit-level workflow runs inspected: YES
  - PR-level governance/accounting workflows inspected: YES
  - Failed job logs inspected for every failing gate: YES
  - Required gates rerun or re-evaluated after fixes: YES (pending CI on latest commit)

## DOCUMENTATION UPDATES
- [ ] Documentation updated in this PR
- [x] No documentation updates required
- Files:
  - N/A — CI script and workflow-only change; behavior matches existing remediation framework.

## REVIEWER RESPONSE ACCOUNTING
- [x] Cubic disposition received: P3 shared-helper drift finding addressed via `scripts/ci/github_issue_api.mjs`.
- [x] Copilot disposition received: Inline review on current head; grouping hardening applied.
- [x] Gemini disposition received: Inline findings addressed in prior commits.
- [x] Reviewed selected reviewer comments.
- [x] Accepted / rejected / ignored each actionable selected-reviewer comment with rationale.
- Cubic P3 — accepted — Duplicate GitHub API helper logic refactored into shared `scripts/ci/github_issue_api.mjs` used by both remediation scripts.
- review-comment:3349997542 — accepted — Unknown merge SHAs use per-issue group keys so unrelated issues are never grouped or closed.
- review-comment:3349970334 — accepted — Optional chaining and unique unknown-merge group keys implemented.
- review-comment:3349970373 — accepted — Deterministic sort fallback for invalid dates.
- review-comment:3349970379 — accepted — Per-duplicate try/catch for API failures.
- review-comment:3349970384 — accepted — Unit test added for unknown merge SHA isolation.

## PR GATE READINESS CHECKLIST
- [x] Live PR check panel inspected
- [x] Commit-level workflow runs inspected
- [x] PR-level pull_request_target workflows inspected
- [x] Latest head workflow runs inspected
- [x] Failed job logs inspected for every failing gate
- [x] PR issue-accounting confirms exactly one same-repository, open, non-PR source issue
- [x] PR body contains one accepted source-issue accounting line
- [x] All review threads and comments inspected
- [x] Actionable review feedback has PR-body disposition
- [x] Reviewer-response accounting includes required reviewer comment IDs
- [ ] Required gates rerun or re-evaluated after latest commit (in progress)
- [ ] Final PR panel confirms merge-readiness (pending CI)

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings
- [x] PR body contains one accepted source-issue accounting line governed by `/docs/governance/PR_GOVERNANCE.md`.
- [x] Allowed files section matches final diff exactly
- [x] No files outside allowlist
- [x] ZIP safety confirmed
- [x] Intent label correct and singular
- [x] Local checks executed and passed or exact blocker documented
- [x] Post-merge closeout body remediation applied for merged PR governance

## ACCEPTANCE CRITERIA
- [x] Required source issue #1116 exists, is open, is same-repository, and is not a PR.
- [x] Duplicate remediation issues for the same PR + merge SHA are closed automatically after upsert.
- [x] Oldest issue remains open as canonical.
- [x] Source issues referenced in remediation bodies are never auto-closed.
- [x] Unit tests cover grouping, canonical selection, source-issue protection, unknown merge SHA isolation, close comments, and shared API helper behavior.
<!-- CURSOR_AGENT_PR_BODY_END -->

<div><a href="https://cursor.com/agents/bc-3c32ab25-067f-46b9-b29d-da748b64c876"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/open-in-web-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/open-in-web-light.png"><img alt="Open in Web" width="114" height="28" src="https://cursor.com/assets/images/open-in-web-dark.png"></picture></a>&nbsp;<a href="https://cursor.com/background-agent?bcId=bc-3c32ab25-067f-46b9-b29d-da748b64c876"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cursor.com/assets/images/open-in-cursor-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://cursor.com/assets/images/open-in-cursor-light.png"><img alt="Open in Cursor" width="131" height="28" src="https://cursor.com/assets/images/open-in-cursor-dark.png"></picture></a>&nbsp;</div>

<!-- This is an auto-generated description by cubic. -->
---
## Summary by cubic
Automatically closes duplicate post-merge remediation issues in CI to cut noise. Keeps the oldest issue per PR + merge SHA and closes newer duplicates with a comment.

- **Bug Fixes**
  - Groups open `post-merge-failure` issues by PR + merge SHA; oldest stays canonical.
  - Comments on newer duplicates and closes them with state_reason: not_planned.
  - Never closes an issue matching the linked Source issue; unknown merge SHAs get unique group keys to prevent accidental grouping.
  - Sorting is deterministic with fallback timestamps; per-issue API errors no longer abort the batch.
  - Added `scripts/ci/close_duplicate_remediation_issues.mjs`, wired into `.github/workflows/post-merge-remediation.yml`, and tests for parsing, grouping (including unknown SHAs), protection, and comments.

- **Refactors**
  - Extracted `scripts/ci/github_issue_api.mjs` and reused in remediation upsert and duplicate-close scripts; added unit tests.

<sup>Written for commit 6d42417cfe5d856778295b6a997f91a18ddccb84. Summary will update on new commits.</sup>

<a href="https://cubic.dev/pr/wdhunter645/next-starter-template/pull/1243?utm_source=github" target="_blank" rel="noopener noreferrer" data-no-image-dialog="true"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cubic.dev/buttons/review-in-cubic-dark.svg"><source media="(prefers-color-scheme: light)" srcset="https://cubic.dev/buttons/review-in-cubic-light.svg"><img alt="Review in cubic" src="https://cubic.dev/buttons/review-in-cubic-dark.svg"></picture></a>

<!-- End of auto-generated description by cubic. -->
